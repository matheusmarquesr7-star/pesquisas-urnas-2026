import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  acertouDupla, displayValues, distancia, erroDistancia, erroMedio, finais, latestByInstitute, mediaFinais,
  movingAverage, ordem, presidentRows, ranking, recalculado, resultShares, senateLatest, senateMeanError,
  seatsByParty, topTwo, validos, vies,
} from '../src/lib/metrics.js';
import { pp, pct, shortDate, initials } from '../src/lib/format.js';
import { presidentPolls, presidentResult, senatePolls, senateResult } from './load.js';

const close = (actual, expected, tolerance = 0.005) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≉ ${expected}`);
const urna = resultShares(presidentResult);
const find = (inst, date) => presidentPolls.find(p => p.inst === inst && p.divulgacao === date);

test('urnas: distância Flávio − Lula é +1,87 pp nos válidos', () => {
  close(distancia(urna), 1.87);
});

test('urnas em votos totais aplicam brancos e nulos (4,77%) aos válidos', () => {
  const total = resultShares(presidentResult, 'totais');
  close(total.F, 47.03 * (1 - 0.0477));
  close(total.L, 45.16 * (1 - 0.0477));
});

test('validos() usa v quando divulgado e recalcula a partir de t e nv quando não', () => {
  const datafolha = find('Datafolha', '2026-10-03');
  assert.deepEqual(validos(datafolha), datafolha.v);
  assert.equal(recalculado(datafolha), false);

  const nexus = find('Nexus/BTG', '2026-08-17'); // L 41, F 36, nv 7
  close(validos(nexus).L, 41 * 100 / 93);
  close(validos(nexus).F, 36 * 100 / 93);
  assert.equal(recalculado(nexus), true);

  const atlasSemNv = find('AtlasIntel', '2026-09-10');
  assert.equal(validos(atlasSemNv), null);
  assert.equal(recalculado(atlasSemNv), false);
});

test('Datafolha final → erro na distância 4,87 pp (caso calculado à mão)', () => {
  const shares = validos(find('Datafolha', '2026-10-03')); // F 42, L 45 → −3; urna +1,87
  close(erroDistancia(shares, urna), 4.87);
  close(vies(shares, urna), -4.87);
  assert.equal(ordem(shares, urna), 'invertida');
});

test('Gerp e Futura puseram Flávio à frente: ordem certa e erros pequenos', () => {
  const gerp = validos(find('Gerp', '2026-10-02')); // F 46, L 44 → +2
  close(erroDistancia(gerp, urna), 0.13);
  assert.equal(ordem(gerp, urna), 'certa');
  const futura = validos(find('Futura/100% Cidades', '2026-10-03')); // +2,2
  close(erroDistancia(futura, urna), 0.33);
});

test('erroMedio considera só candidatos presentes na pesquisa e na urna', () => {
  // Datafolha final: F 42 (47,03), L 45 (45,16), Caiado 4 (2,18), Renan 3 (2,24), Cury 3 (2,89), Zema 1 (0,27)
  const shares = validos(find('Datafolha', '2026-10-03'));
  const expected = (5.03 + 0.16 + 1.82 + 0.76 + 0.11 + 0.73) / 6;
  close(erroMedio(shares, urna), expected);
  close(erroMedio({ F: 50, X: 3 }, urna), 50 - 47.03); // X não existe na urna e é ignorado
});

test('presidentRows descarta pesquisas sem dados na base e ranking ordena pelo erro', () => {
  const rows = presidentRows(presidentPolls, presidentResult, 'validos');
  const withValid = presidentPolls.filter(p => validos(p)?.F != null && validos(p)?.L != null);
  assert.equal(rows.length, withValid.length);
  assert.ok(!rows.some(r => r.inst === 'AtlasIntel' && r.date === '2026-09-10'), 'AtlasIntel de 10/set não tem válidos');
  const totals = presidentRows(presidentPolls, presidentResult, 'totais');
  assert.equal(totals.length, presidentPolls.filter(p => p.t?.F != null && p.t?.L != null).length);
  assert.ok(!totals.some(r => r.inst === 'Gerp'), 'Gerp só divulgou válidos');

  const ranked = ranking(rows);
  assert.equal(new Set(ranked.map(r => r.inst)).size, ranked.length, 'uma linha por instituto');
  for (let i = 1; i < ranked.length; i++) assert.ok(ranked[i].erroDistancia >= ranked[i - 1].erroDistancia);
  assert.equal(latestByInstitute(rows).find(r => r.inst === 'Datafolha').date, '2026-10-03');
});

test('pesquisas finais: última de cada instituto na semana da eleição, e a média delas', () => {
  const rows = presidentRows(presidentPolls, presidentResult, 'validos');
  const final = finais(rows);
  for (const name of ['AtlasIntel', 'Datafolha', 'Futura/100% Cidades', 'Gerp', 'Quaest']) assert.ok(final.some(r => r.inst === name), name);
  assert.ok(final.every(r => r.date >= '2026-09-27'));
  assert.equal(new Set(final.map(r => r.inst)).size, final.length);
  const media = mediaFinais(rows);
  close(media.shares.F, final.reduce((s, r) => s + r.shares.F, 0) / final.length);
  close(media.shares.L, final.reduce((s, r) => s + r.shares.L, 0) / final.length);
});

test('média móvel de 10 dias usa a janela que termina em cada dia', () => {
  const rows = [
    { date: '2026-08-17', shares: { L: 40 } },
    { date: '2026-08-20', shares: { L: 50 } },
    { date: '2026-08-30', shares: { L: 30 } },
  ];
  const series = movingAverage(rows, 'L', 10);
  const at = day => series.find(p => p.day === day)?.value;
  assert.equal(at(1), 40);
  assert.equal(at(4), 45);
  assert.equal(at(10), 45, 'dia 26/ago ainda inclui 17/ago (janela de 17 a 26)');
  assert.equal(at(11), 50, 'dia 27/ago já não inclui 17/ago');
  assert.equal(at(14), 30, 'dia 30/ago: 20/ago saiu da janela');
});

test('Senado: acertouDupla conta 2, 1 ou 0 e marca parciais como não avaliáveis', () => {
  const sp = senateResult.ufs.SP; // eleitos Derrite e André do Prado
  assert.equal(acertouDupla({ x: { 'Guilherme Derrite': 25, 'André do Prado': 23, 'Marina Silva': 22 } }, sp).acertos, 2);
  assert.equal(acertouDupla({ x: { 'Guilherme Derrite': 21, 'Simone Tebet': 19, 'Marina Silva': 16, 'André do Prado': 14 } }, sp).acertos, 1);
  assert.equal(acertouDupla({ x: { 'Marina Silva': 13, 'Simone Tebet': 13.5, 'Guilherme Derrite': 10 } }, sp).acertos, 0);
  const parcial = acertouDupla({ parcial: true, x: { 'Guilherme Derrite': 25.9 } }, sp);
  assert.equal(parcial.avaliavel, false);
  assert.equal(parcial.acertos, null);
});

test('Senado: empate na 2ª vaga é resolvido a favor de quem foi eleito e marcado', () => {
  const rj = senateResult.ufs.RJ; // eleitos Portinho e Jordy
  const quaestVT = { x: { 'Carlos Jordy': 17, 'Carlos Portinho': 16, 'Benedita da Silva': 16, 'Pedro Paulo': 10 } };
  assert.deepEqual(topTwo(quaestVT), { inside: ['Carlos Jordy'], tied: ['Carlos Portinho', 'Benedita da Silva'], slots: 1 });
  assert.deepEqual(acertouDupla(quaestVT, rj), { avaliavel: true, acertos: 2, empate: true });
});

test('Senado: pesquisas em 200% são normalizadas para somar 100', () => {
  const { x, normalizado } = displayValues({ base: '200', x: { A: 50, B: 30, C: 20, D: 100 } });
  assert.equal(normalizado, true);
  close(Object.values(x).reduce((s, v) => s + v, 0), 100);
  close(x.D, 50);
  assert.equal(displayValues({ base: 'VV', x: { A: 10 } }).normalizado, false);
});

test('Senado: erro médio só na base VV, com candidatos de resultado conhecido', () => {
  const rj = senateResult.ufs.RJ;
  const datafolha = senatePolls.ufs.RJ.find(p => p.inst === 'Datafolha' && p.base === 'VV');
  // Benedita 26 (20,22), Portinho 19 (26,77), Jordy 18 (24,56), Pedro Paulo 13 (11,95), Monica 9 (9,66); Crivella sem resultado
  const expected = (5.78 + 7.77 + 6.56 + 1.05 + 0.66) / 5;
  close(senateMeanError(datafolha, rj), expected);
  assert.equal(senateMeanError({ ...datafolha, base: 'VT' }, rj), null);
});

test('Senado: a última pesquisa de cada instituto prefere VV na mesma data', () => {
  const latest = senateLatest(senatePolls.ufs.SP);
  const datafolha = latest.find(p => p.inst === 'Datafolha');
  assert.equal(datafolha.div, '2026-10-03');
  assert.equal(datafolha.base, 'VV');
  const pa = senateLatest(senatePolls.ufs.PA).find(p => p.inst === 'AtlasIntel');
  assert.equal(pa.final, true, 'AtlasIntel PA sem data, marcada como final');
});

test('vagas por partido somam 54 e o PL elegeu 19', () => {
  const seats = seatsByParty(senateResult.ufs);
  assert.equal(seats.reduce((s, p) => s + p.n, 0), 54);
  assert.deepEqual(seats[0], { party: 'PL', n: 19 });
});

test('formatação pt-BR', () => {
  assert.equal(pct(47.03, 2), '47,03%');
  assert.equal(pp(-4.87, 2), '−4,87 pp');
  assert.equal(pp(1.87, 2, true), '+1,87 pp');
  assert.equal(pp(-0.004, 2, true), '0,00 pp');
  assert.equal(shortDate('2026-08-17'), '17/ago');
  assert.equal(initials('Flávio Bolsonaro'), 'FB');
  assert.equal(initials('Lula'), 'L');
});
