import { test } from 'node:test';
import assert from 'node:assert/strict';
import { UFS } from '../src/data/meta.js';
import { presidentPolls, presidentResult, senatePolls, senateResult, topology } from './load.js';

const ISO = /^2026-\d{2}-\d{2}$/;
const BASES = ['VV', 'VT', '200', 'n/e'];

test('Presidente: 27 UFs, 15 para Flávio e 12 para Lula, vencedor coerente com os números', () => {
  assert.deepEqual(Object.keys(presidentResult.ufs).sort(), [...UFS].sort());
  const wins = { F: 0, L: 0 };
  for (const [uf, r] of Object.entries(presidentResult.ufs)) {
    wins[r.vencedor]++;
    if (r.F != null && r.L != null) {
      assert.equal(r.F > r.L ? 'F' : 'L', r.vencedor, uf);
      assert.ok(r.F + r.L <= 100.5, `${uf}: Flávio + Lula passam de 100`);
    }
  }
  assert.deepEqual(wins, { F: 15, L: 12 });
});

test('Presidente: resultado nacional soma ~100% e confere com os votos', () => {
  const total = presidentResult.candidatos.reduce((s, c) => s + c.validos, 0) + presidentResult.outros.validos;
  assert.ok(Math.abs(total - 100) < 0.05, `soma ${total}`);
  const [f, l] = presidentResult.candidatos;
  assert.ok(Math.abs(f.votos / l.votos - f.validos / l.validos) < 0.001);
});

test('Presidente: toda pesquisa tem instituto, data, campo e números válidos', () => {
  for (const poll of presidentPolls) {
    assert.ok(poll.inst, 'instituto');
    assert.match(poll.divulgacao, ISO, `${poll.inst}: data de divulgação`);
    assert.ok(poll.t || poll.v, `${poll.inst} ${poll.divulgacao}: sem números`);
    for (const shares of [poll.t, poll.v].filter(Boolean)) {
      assert.ok(shares.F != null && shares.L != null, `${poll.inst}: precisa de Flávio e Lula`);
      const sum = Object.values(shares).reduce((s, v) => s + v, 0) + (shares === poll.t ? poll.nv ?? 0 : 0);
      assert.ok(sum <= 101, `${poll.inst} ${poll.divulgacao}: soma ${sum}`);
    }
  }
});

test('Senado: 27 UFs, exatamente 2 eleitos em cada, 54 no total', () => {
  assert.deepEqual(Object.keys(senateResult.ufs).sort(), [...UFS].sort());
  for (const [uf, r] of Object.entries(senateResult.ufs)) {
    assert.equal(r.c.filter(c => c[3]).length, 2, uf);
  }
});

test('Senado: soma dos válidos ≤ 100 em toda UF e ≈ 100 quando o resultado está completo', () => {
  for (const [uf, r] of Object.entries(senateResult.ufs)) {
    const sum = r.c.reduce((s, c) => s + (c[2] ?? 0), 0);
    assert.ok(sum <= 100.5, `${uf}: soma ${sum}`);
    if (r.completo) assert.ok(Math.abs(sum - 100) <= 0.6, `${uf}: completo mas soma ${sum}`);
  }
});

test('Senado: eleitos com percentual conhecido estão à frente de todos os não eleitos', () => {
  for (const [uf, r] of Object.entries(senateResult.ufs)) {
    const known = r.c.filter(c => c[2] != null);
    const lowestElected = Math.min(...known.filter(c => c[3]).map(c => c[2]));
    const highestOther = Math.max(...known.filter(c => !c[3]).map(c => c[2]), -Infinity);
    assert.ok(lowestElected > highestOther, uf);
  }
});

test('Senado: todo candidato citado em pesquisa existe na lista da UF (nomes idênticos)', () => {
  for (const [uf, polls] of Object.entries(senatePolls.ufs)) {
    const names = new Set(senateResult.ufs[uf].c.map(c => c[0]));
    for (const poll of polls) for (const name of Object.keys(poll.x)) {
      assert.ok(names.has(name), `${uf} · ${poll.inst}: “${name}” não está no resultado`);
    }
  }
});

test('Senado: toda pesquisa tem instituto, data (ou null explícito) e base válida', () => {
  for (const [uf, polls] of Object.entries(senatePolls.ufs)) {
    assert.ok(UFS.includes(uf));
    for (const poll of polls) {
      assert.ok(poll.inst, `${uf}: instituto`);
      assert.ok('div' in poll, `${uf} · ${poll.inst}: campo div ausente`);
      assert.ok(poll.div === null || ISO.test(poll.div), `${uf} · ${poll.inst}: data ${poll.div}`);
      assert.ok(BASES.includes(poll.base), `${uf} · ${poll.inst}: base ${poll.base}`);
      assert.ok(Object.keys(poll.x).length >= 1);
      // Na base 200% cada eleitor cita dois nomes; nas demais a soma não passa de 100.
      const sum = Object.values(poll.x).reduce((s, v) => s + v, 0);
      assert.ok(sum <= (poll.base === '200' ? 200.5 : 100.5), `${uf} · ${poll.inst}: soma ${sum} na base ${poll.base}`);
    }
  }
});

test('Mapa: TopoJSON tem as 27 UFs, identificadas pela sigla', () => {
  const ids = topology.objects.estados.geometries.map(g => g.id).sort();
  assert.deepEqual(ids, [...UFS].sort());
});
