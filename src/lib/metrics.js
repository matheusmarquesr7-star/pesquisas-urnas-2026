// Regras de cálculo do site. Funções puras, sem DOM, testadas em tests/metrics.test.js.
// Percentuais em pontos (0–100). "Distância" é sempre Flávio − Lula (positivo = Flávio à frente).

export const ELECTION_DAY = '2026-10-04';
export const FIRST_DAY = '2026-08-16';
/** Pesquisas divulgadas a partir desta data contam como "da véspera" (última semana). */
export const FINAL_WEEK = '2026-09-27';
export const BASES = ['validos', 'totais'];

const DAY = 86_400_000;
const mean = values => values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : null;
const round = (value, digits = 2) => value == null ? null : Math.round(value * 10 ** digits) / 10 ** digits;
const mapValues = (object, fn) => Object.fromEntries(Object.entries(object).map(([key, value]) => [key, fn(value)]));

/** Dias desde 16/08/2026 (eixo x dos gráficos). */
export const dayNumber = iso => Math.round((Date.parse(iso + 'T12:00:00Z') - Date.parse(FIRST_DAY + 'T12:00:00Z')) / DAY);
export const isoFromDay = day => new Date(Date.parse(FIRST_DAY + 'T12:00:00Z') + day * DAY).toISOString().slice(0, 10);

/* ---------------------------------------------------------------- Presidente */

/**
 * Votos válidos da pesquisa: usa `v` quando divulgado; senão recalcula a partir dos
 * votos totais, `t × 100 / (100 − nv)`, em que `nv` soma brancos, nulos e indecisos.
 */
export function validos(poll) {
  if (poll.v) return poll.v;
  if (poll.t && poll.nv != null && poll.nv < 100) return mapValues(poll.t, value => value * 100 / (100 - poll.nv));
  return null;
}

/** true quando os válidos foram recalculados por nós (marcados com * nas tabelas). */
export const recalculado = poll => !poll.v && validos(poll) != null;

export const totais = poll => poll.t ?? null;

export const sharesFor = (poll, base) => base === 'totais' ? totais(poll) : validos(poll);

/** Resultado das urnas na base pedida. Em totais: válido × (1 − (brancos + nulos) / 100). */
export function resultShares(result, base = 'validos') {
  const factor = base === 'totais' ? 1 - (result.comparecimento.brancos_pct + result.comparecimento.nulos_pct) / 100 : 1;
  return Object.fromEntries(result.candidatos.map(c => [c.id, c.validos * factor]));
}

export const distancia = shares => shares && shares.F != null && shares.L != null ? shares.F - shares.L : null;

/** |(F − L) da pesquisa − (F − L) da urna|. */
export function erroDistancia(pollShares, urna) {
  const a = distancia(pollShares), b = distancia(urna);
  return a == null || b == null ? null : Math.abs(a - b);
}

/** Média de |pesquisa − urna| entre os candidatos presentes nos dois. */
export function erroMedio(pollShares, urna) {
  if (!pollShares) return null;
  return mean(Object.keys(pollShares).filter(key => urna[key] != null).map(key => Math.abs(pollShares[key] - urna[key])));
}

/** Viés na distância: negativo = a pesquisa subestimou Flávio (PL) em relação a Lula (PT). */
export function vies(pollShares, urna) {
  const a = distancia(pollShares), b = distancia(urna);
  return a == null || b == null ? null : a - b;
}

/** 'certa' quando a pesquisa pôs à frente quem venceu; 'invertida' quando pôs o outro; 'empate' quando cravou empate. */
export function ordem(pollShares, urna) {
  const a = distancia(pollShares), b = distancia(urna);
  if (a == null || b == null) return null;
  if (a === 0) return 'empate';
  return Math.sign(a) === Math.sign(b) ? 'certa' : 'invertida';
}

/** Uma linha por pesquisa, já com as métricas na base escolhida. Pesquisas sem dados na base ficam de fora. */
export function presidentRows(polls, result, base = 'validos') {
  const urna = resultShares(result, base);
  return polls.map((poll, index) => {
    const shares = sharesFor(poll, base);
    if (!shares || shares.F == null || shares.L == null) return null;
    return {
      id: index,
      poll,
      inst: poll.inst,
      date: poll.divulgacao,
      shares,
      recalculado: base === 'validos' && recalculado(poll),
      distancia: distancia(shares),
      erroDistancia: erroDistancia(shares, urna),
      erroMedio: erroMedio(shares, urna),
      vies: vies(shares, urna),
      ordem: ordem(shares, urna),
    };
  }).filter(Boolean);
}

/** Última pesquisa de cada instituto (a mais recente; em empate de data, a última da lista). */
export function latestByInstitute(rows) {
  const latest = new Map();
  for (const row of rows) {
    const current = latest.get(row.inst);
    if (!current || (row.date ?? '') >= (current.date ?? '')) latest.set(row.inst, row);
  }
  return [...latest.values()];
}

/** Ranking da véspera: última pesquisa de cada instituto, da que menos errou a distância para a que mais errou. */
export const ranking = rows => latestByInstitute(rows).sort((a, b) => a.erroDistancia - b.erroDistancia || a.erroMedio - b.erroMedio);

/** Pesquisas finais = última de cada instituto divulgada na semana da eleição. */
export const finais = rows => latestByInstitute(rows).filter(row => row.date >= FINAL_WEEK);

/** Média simples das pesquisas finais para cada candidato presente em todas elas. */
export function mediaFinais(rows) {
  const last = finais(rows);
  if (!last.length) return null;
  const keys = Object.keys(last[0].shares).filter(key => last.every(row => row.shares[key] != null));
  return { n: last.length, shares: Object.fromEntries(keys.map(key => [key, mean(last.map(row => row.shares[key]))])), rows: last };
}

/**
 * Média móvel de `days` dias (janela que termina em cada dia) para a chave `key`.
 * Devolve um ponto por dia em que a janela tem pelo menos uma pesquisa.
 */
export function movingAverage(rows, key, days = 10) {
  const dated = rows.filter(row => row.date && row.shares[key] != null).map(row => ({ day: dayNumber(row.date), value: row.shares[key] }));
  if (!dated.length) return [];
  const first = Math.min(...dated.map(p => p.day)), last = Math.max(...dated.map(p => p.day));
  const points = [];
  for (let day = first; day <= last; day++) {
    const inside = dated.filter(p => p.day > day - days && p.day <= day);
    if (inside.length) points.push({ day, value: mean(inside.map(p => p.value)) });
  }
  return points;
}

/** Desloca levemente pesquisas divulgadas no mesmo dia para não se sobreporem (em dias). */
export function jitter(rows, spread = 0.32) {
  const byDay = new Map();
  for (const row of rows) {
    const key = row.date ?? 'none';
    byDay.set(key, [...(byDay.get(key) ?? []), row]);
  }
  const offsets = new Map();
  for (const group of byDay.values()) {
    group.forEach((row, i) => offsets.set(row, (i - (group.length - 1) / 2) * spread));
  }
  return offsets;
}

/* ---------------------------------------------------------------- Senado */

export const SENATE_BASES = { VV: 'Válidos', VT: 'Totais', 200: 'Soma 200%', 'n/e': 'Base n/e' };
const BASE_PREFERENCE = ['VV', 'n/e', '200', 'VT'];

/** Pesquisas em "200%" (cada eleitor cita 2 nomes) são reescaladas para somar 100 entre os nomes listados. */
export function displayValues(poll) {
  if (poll.base !== '200') return { x: poll.x, normalizado: false };
  const total = Object.values(poll.x).reduce((sum, v) => sum + v, 0);
  return { x: mapValues(poll.x, value => value / total * 100), normalizado: true };
}

/** Só a base VV é comparável ao resultado (percentual dos votos válidos). */
export const comparable = poll => poll.base === 'VV' && !poll.parcial;

export const elected = ufResult => ufResult.c.filter(c => c[3]).map(c => c[0]);
export const resultMap = ufResult => Object.fromEntries(ufResult.c.filter(c => c[2] != null).map(c => [c[0], c[2]]));

/**
 * Quem a pesquisa põe nas duas vagas. Quando há empate na fronteira (2º = 3º),
 * `inside` traz quem está claramente dentro e `tied` os empatados disputando o que sobra.
 */
export function topTwo(poll) {
  const sorted = Object.entries(poll.x).sort((a, b) => b[1] - a[1]);
  if (sorted.length < 2) return { inside: sorted.map(([name]) => name), tied: [], slots: 0 };
  const cut = sorted[1][1];
  const inside = sorted.filter(([, v]) => v > cut).map(([name]) => name);
  const tied = sorted.filter(([, v]) => v === cut).map(([name]) => name);
  if (inside.length + tied.length <= 2) return { inside: [...inside, ...tied], tied: [], slots: 0 };
  return { inside, tied, slots: 2 - inside.length };
}

/**
 * Acertou a dupla eleita? 2, 1 ou 0 acertos. `parcial` (só o líder divulgado) não é avaliável.
 * Num empate na fronteira, os empatados que foram eleitos preenchem as vagas que sobram (`empate: true`).
 */
export function acertouDupla(poll, ufResult) {
  if (poll.parcial || Object.keys(poll.x).length < 2) return { avaliavel: false, acertos: null, empate: false };
  const winners = new Set(elected(ufResult));
  const { inside, tied, slots } = topTwo(poll);
  const fromTie = Math.min(slots, tied.filter(name => winners.has(name)).length);
  return { avaliavel: true, acertos: inside.filter(name => winners.has(name)).length + fromTie, empate: tied.length > 0 };
}

/** Diferença pesquisa − urna por candidato (só na base VV e para quem tem resultado conhecido). */
export function differences(poll, ufResult) {
  if (poll.base !== 'VV') return {};
  const urna = resultMap(ufResult);
  return Object.fromEntries(Object.entries(poll.x).filter(([name]) => urna[name] != null).map(([name, v]) => [name, v - urna[name]]));
}

export function senateMeanError(poll, ufResult) {
  if (!comparable(poll)) return null;
  return mean(Object.values(differences(poll, ufResult)).map(Math.abs));
}

/**
 * A pesquisa que representa cada instituto numa UF: a mais recente (as marcadas `final`
 * contam como mais recentes; sem data, como mais antigas). Na mesma data, prefere a avaliável
 * e, entre elas, VV > n/e > 200 > VT.
 */
export function senateLatest(polls) {
  const rank = poll => [
    poll.final ? '9999' : poll.div ?? '0000',
    poll.parcial ? 0 : 1,
    BASE_PREFERENCE.length - BASE_PREFERENCE.indexOf(poll.base),
  ];
  const better = (a, b) => {
    const ra = rank(a), rb = rank(b);
    for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) return ra[i] > rb[i];
    return false;
  };
  const latest = new Map();
  for (const poll of polls) {
    const current = latest.get(poll.inst);
    if (!current || better(poll, current)) latest.set(poll.inst, poll);
  }
  return [...latest.values()];
}

/** Resumo de checagens do Senado por UF: a última pesquisa de cada instituto e o acerto da dupla. */
export function senateChecks(pollsByUf, resultByUf) {
  const checks = [];
  for (const [uf, polls] of Object.entries(pollsByUf)) {
    for (const poll of senateLatest(polls)) {
      checks.push({ uf, inst: poll.inst, poll, dupla: acertouDupla(poll, resultByUf[uf]), erro: senateMeanError(poll, resultByUf[uf]) });
    }
  }
  return checks;
}

/** Vagas por partido a partir dos eleitos. */
export function seatsByParty(resultByUf) {
  const seats = new Map();
  for (const uf of Object.values(resultByUf)) for (const [, party, , won] of uf.c) if (won) seats.set(party, (seats.get(party) ?? 0) + 1);
  return [...seats.entries()].map(([party, n]) => ({ party, n })).sort((a, b) => b.n - a.n || a.party.localeCompare(b.party));
}

/**
 * Diferença média (pesquisa − urna) por partido, nas pesquisas comparáveis (VV) mais recentes de cada instituto.
 * Negativo = o partido foi subestimado.
 */
export function partyBias(pollsByUf, resultByUf) {
  const byParty = new Map();
  for (const [uf, polls] of Object.entries(pollsByUf)) {
    const party = Object.fromEntries(resultByUf[uf].c.map(c => [c[0], c[1]]));
    for (const poll of senateLatest(polls).filter(comparable)) {
      for (const [name, diff] of Object.entries(differences(poll, resultByUf[uf]))) {
        const entry = byParty.get(party[name]) ?? { diffs: [], names: new Set() };
        entry.diffs.push(diff);
        entry.names.add(uf + name);
        byParty.set(party[name], entry);
      }
    }
  }
  return Object.fromEntries([...byParty.entries()].map(([party, { diffs, names }]) => [party, { media: mean(diffs), n: diffs.length, candidatos: names.size }]));
}

/** Maiores erros individuais (|pesquisa − urna|) nas pesquisas VV mais recentes de cada instituto. */
export function biggestMisses(pollsByUf, resultByUf, limit = 6) {
  const misses = [];
  for (const [uf, polls] of Object.entries(pollsByUf)) {
    for (const poll of senateLatest(polls).filter(comparable)) {
      for (const [name, diff] of Object.entries(differences(poll, resultByUf[uf]))) {
        misses.push({ uf, inst: poll.inst, name, poll: poll.x[name], urna: resultMap(resultByUf[uf])[name], diff });
      }
    }
  }
  return misses.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff)).slice(0, limit);
}

/* ---------------------------------------------------------------- Institutos */

/** Tudo o que se sabe de cada instituto, juntando Presidente (base válidos) e Senado. */
export function instituteStats(presRows, checks, senatePolls, allNames = []) {
  const names = new Set([...allNames, ...presRows.map(r => r.inst), ...checks.map(c => c.inst)]);
  const senateCount = new Map();
  for (const polls of Object.values(senatePolls)) {
    const seen = new Set();
    for (const poll of polls) {
      // VV e VT da mesma pesquisa contam uma vez.
      const key = poll.inst + (poll.div ?? '?');
      if (seen.has(key)) continue;
      seen.add(key);
      senateCount.set(poll.inst, (senateCount.get(poll.inst) ?? 0) + 1);
    }
  }
  return [...names].map(inst => {
    const rows = presRows.filter(r => r.inst === inst);
    const last = rows.length ? latestByInstitute(rows)[0] : null;
    const mine = checks.filter(c => c.inst === inst);
    const rated = mine.filter(c => c.dupla.avaliavel);
    const hits = n => rated.filter(c => c.dupla.acertos === n).length;
    const senateErrors = mine.map(c => c.erro).filter(v => v != null);
    return {
      inst,
      presidente: rows.length,
      senado: senateCount.get(inst) ?? 0,
      ultima: last,
      erroDistanciaUltima: last?.erroDistancia ?? null,
      erroDistanciaMedio: rows.length ? mean(rows.map(r => r.erroDistancia)) : null,
      viesMedio: rows.length ? mean(rows.map(r => r.vies)) : null,
      ufs: mine.length,
      acertos: { 2: hits(2), 1: hits(1), 0: hits(0), na: mine.length - rated.length },
      taxaDupla: rated.length ? hits(2) / rated.length : null,
      erroSenado: senateErrors.length ? mean(senateErrors) : null,
      checks: mine,
    };
  });
}

/** Frases de destaque calculadas a partir dos dados (nada escrito à mão). */
export function highlights(presRows, stats, checks, bias) {
  const lines = [];
  const final = finais(presRows).sort((a, b) => a.erroDistancia - b.erroDistancia);
  if (final.length) {
    const best = final[0], worst = final.at(-1);
    lines.push({ kind: 'best', inst: best.inst, value: best.erroDistancia, row: best });
    lines.push({ kind: 'worst', inst: worst.inst, value: worst.erroDistancia, row: worst });
    const wrong = final.filter(r => r.ordem !== 'certa');
    lines.push({ kind: 'order', wrong: wrong.map(r => r.inst), total: final.length });
    lines.push({ kind: 'bias', value: mean(final.map(r => r.vies)), n: final.length });
  }
  const rated = checks.filter(c => c.dupla.avaliavel);
  if (rated.length) {
    lines.push({ kind: 'senate', hits: rated.filter(c => c.dupla.acertos === 2).length, total: rated.length });
    const byError = (a, b) => (a.erroSenado ?? Infinity) - (b.erroSenado ?? Infinity);
    const ranked = stats.filter(s => s.ufs >= 3 && s.taxaDupla != null).sort((a, b) => b.taxaDupla - a.taxaDupla || byError(a, b));
    if (ranked.length) lines.push({ kind: 'senateBest', stat: ranked[0], worst: ranked.at(-1) });
  }
  if (bias?.PL && bias?.PT) lines.push({ kind: 'partyBias', pl: bias.PL, pt: bias.PT });
  return lines;
}

export const roundTo = round;
