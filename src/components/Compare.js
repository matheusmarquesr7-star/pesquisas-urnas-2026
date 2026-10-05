// Pesquisas × urnas: a coluna da esquerda. Mostra o resultado real e deixa escolher uma pesquisa
// (por data, por instituto ou pelo acontecimento da campanha) para comparar com ele.
import { useMemo, useState } from 'preact/hooks';
import { html } from '../lib/html.js';
import { int, num, pct, pp, shortDate } from '../lib/format.js';
import {
  acertouDupla, comparable, differences, displayValues, distancia, finais, finaisPorCandidato, ordem, porCandidato, senateLatest,
} from '../lib/metrics.js';
import { CANDIDATES, stateName } from '../data/meta.js';
import { leadText } from './GapChart.js';
import { events, Timeline } from './Events.js';
import { BaseBadge, DuplaBadge, OrderBadge, SectionHead, toneOfParty } from './ui.js';

const PRESIDENT_KEYS = ['F', 'L', 'Cury', 'Renan', 'Caiado', 'Zema'];
const baseLabel = base => base === 'totais' ? 'votos totais' : 'votos válidos';
const at = (value, hi) => Math.max(0, Math.min(100, (value / hi) * 100));
const niceMax = values => Math.max(10, Math.ceil((Math.max(...values) + 1) / 10) * 10);
const byDateDesc = (a, b) => b.date.localeCompare(a.date) || a.inst.localeCompare(b.inst, 'pt-BR');

/* ---------------------------------------------------------------- Peças */

/** Resultado das urnas: uma barra por candidato. */
function ResultList({ items, note }) {
  const hi = niceMax(items.map(i => i.value));
  return html`<ul class="result-list">${items.map(item => html`<li key=${item.id} class=${'tone-' + item.tone}>
      <span class="result-list-name"><b>${item.label}</b>${item.sub && html`<small>${item.sub}</small>`}</span>
      <span class="result-list-track"><i style=${{ width: at(item.value, hi) + '%' }}></i></span>
      <b class="result-list-value">${pct(item.value, 2)}</b>
    </li>`)}</ul>
    ${note && html`<p class="note">${note}</p>`}`;
}

/** Pesquisa × urna por candidato: barra clara = pesquisa, barra cheia = urna, diferença ao lado. */
function PairBars({ items, comparable: canCompare = true }) {
  const hi = niceMax(items.flatMap(i => [i.poll ?? 0, i.urna ?? 0]));
  return html`<ul class="pair-bars">${items.map(item => html`<li key=${item.id} class=${'tone-' + item.tone}
      aria-label=${`${item.label}: pesquisa ${item.poll != null ? pct(item.poll) : 'sem número'}, urna ${pct(item.urna, 2)}${canCompare && item.poll != null ? `, diferença de ${pp(item.poll - item.urna, 1, true)}` : ''}`}>
      <span class="pair-name"><b>${item.label}</b>${item.sub && html`<small>${item.sub}</small>`}</span>
      <span class="pair-tracks" aria-hidden="true">
        <span class="pair-track is-poll">${item.poll != null && html`<i style=${{ width: at(item.poll, hi) + '%' }}></i>`}</span>
        <span class="pair-track is-urna"><i style=${{ width: at(item.urna, hi) + '%' }}></i></span>
      </span>
      <span class="pair-values" aria-hidden="true">
        <span><small>pesq.</small> ${item.poll != null ? num(item.poll) : '–'}</span>
        <span><small>urna</small> <b>${num(item.urna, 2)}</b></span>
        ${canCompare && item.poll != null && html`<b class=${item.poll - item.urna < 0 ? 'bad-text' : 'warn-text'}>${pp(item.poll - item.urna, 1, true)}</b>`}
      </span>
    </li>`)}</ul>
    <ul class="chart-legend">
      <li><i class="pair-key is-poll"></i>Pesquisa</li>
      <li><i class="pair-key is-urna"></i>Urna</li>
      ${canCompare && html`<li>Diferença em pontos: negativo, a urna deu mais</li>`}
    </ul>`;
}

/** Botões de modo (Por data · Por instituto · Por acontecimento). */
const Modes = ({ modes, value, onChange }) => html`<div class="segmented" role="group" aria-label="Como escolher a pesquisa">
  ${modes.map(([key, label]) => html`<button key=${key} aria-pressed=${value === key} onClick=${() => onChange(key)}>${label}</button>`)}
</div>`;

/* ---------------------------------------------------------------- Distância de cada instituto × urna */

/** Uma linha por instituto: a distância Flávio − Lula da última pesquisa e a linha das urnas. */
export function InstituteGaps({ rows, urna, selected, onSelect }) {
  const target = distancia(urna);
  const values = [...rows.map(r => r.distancia), target, 0];
  const lo = Math.floor(Math.min(...values) - 1), hi = Math.ceil(Math.max(...values) + 1);
  const x = value => ((value - lo) / (hi - lo)) * 100;
  const sorted = [...rows].sort((a, b) => a.erroDistancia - b.erroDistancia);
  const ticks = [lo, 0, hi].filter((t, i, list) => list.indexOf(t) === i);
  return html`<div>
    <div class="gaps-head" aria-hidden="true"><span></span><span class="gaps-sides"><span>← Lula à frente</span><span>Flávio à frente →</span></span><span></span></div>
    <ul class="gaps">${sorted.map(row => {
      const tone = row.distancia > 0 ? 'blue' : row.distancia < 0 ? 'red' : 'other';
      const from = Math.min(row.distancia, target), to = Math.max(row.distancia, target);
      return html`<li key=${row.inst}>
        <button class=${'gap-row' + (selected && row.inst !== selected ? ' is-dim' : '')} aria-pressed=${selected === row.inst} onClick=${() => onSelect(row.inst)}
          aria-label=${`${row.inst}, ${shortDate(row.date)}: ${leadText(row.distancia)}; urnas ${leadText(target, 2)}; erro de ${pp(row.erroDistancia, 2)}`}>
          <span class="gap-label"><b>${row.inst}</b><small>${shortDate(row.date)}${row.poll.aprox ? ' ≈' : ''}</small></span>
          <span class="gap-track" aria-hidden="true">
            <i class="gap-band is-red" style=${{ left: 0, width: x(0) + '%' }}></i>
            <i class="gap-band is-blue" style=${{ left: x(0) + '%', right: 0 }}></i>
            <i class="gap-zero" style=${{ left: x(0) + '%' }}></i>
            <i class="gap-urna" style=${{ left: x(target) + '%' }}></i>
            <i class="gap-stem" style=${{ left: x(from) + '%', width: x(to) - x(from) + '%' }}></i>
            <i class=${'gap-dot tone-' + tone} style=${{ left: x(row.distancia) + '%' }}></i>
          </span>
          <span class="gap-value"><b>${leadText(row.distancia)}</b><small>erro ${num(row.erroDistancia, 1)}</small></span>
        </button>
      </li>`;
    })}</ul>
    <div class="gaps-axis" aria-hidden="true"><span></span>
      <span class="axis-ticks">${ticks.map(t => html`<i key=${t} style=${{ left: x(t) + '%' }}>${t > 0 ? '+' + t : t < 0 ? '−' + -t : '0'}</i>`)}</span><span></span></div>
    <ul class="chart-legend">
      <li><i class="dot-key tone-blue"></i>Flávio à frente</li>
      <li><i class="dot-key tone-red"></i>Lula à frente</li>
      <li><i class="urna-line-key"></i>Urnas: ${leadText(target, 2)}</li>
      <li><i class="stem-key"></i>Erro</li>
    </ul>
  </div>`;
}

/* ---------------------------------------------------------------- Presidente */

/** Resultado real + uma pesquisa escolhida (por data, instituto ou acontecimento) + linha do tempo. */
export function PresidentCompare({ result, rows, urna, base, only = null }) {
  const pool = useMemo(() => (only ? rows.filter(r => r.inst === only) : rows).filter(r => r.date).sort(byDateDesc), [rows, only]);
  const institutes = useMemo(() => [...new Set(rows.map(r => r.inst))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [rows]);
  const hasFinals = !only && finais(rows).length > 0;
  const [mode, setMode] = useState('data');
  const [pick, setPick] = useState(hasFinals ? 'media' : pool[0]?.id ?? null);
  const [inst, setInst] = useState(only ?? institutes[0]);
  const [eventN, setEventN] = useState(null);

  // O que está sendo comparado: a média das finais ou uma pesquisa.
  const row = pick === 'media' ? null : pool.find(r => r.id === pick) ?? pool[0];
  const media = pick === 'media' && hasFinals ? finaisPorCandidato(rows, urna, PRESIDENT_KEYS) : null;
  const shares = media ? Object.fromEntries(media.map(m => [m.key, m.media])) : row?.shares;
  const items = shares ? porCandidato([{ shares }], urna, PRESIDENT_KEYS).map(c => ({
    id: c.key, label: CANDIDATES[c.key].short, tone: CANDIDATES[c.key].tone, poll: c.media, urna: c.urna,
    sub: media ? `média de ${media.find(m => m.key === c.key).n}` : null,
  })) : [];
  const target = distancia(urna), gap = shares ? distancia(shares) : null;
  const pickedEvent = events.find(e => e.n === eventN);

  const chooseInstitute = name => {
    setInst(name);
    const latest = pool.find(r => r.inst === name);
    if (latest) setPick(latest.id);
  };
  const chooseEvent = event => {
    setMode('evento');
    setEventN(event.n);
    // A primeira pesquisa divulgada depois do acontecimento (no mesmo dia conta como depois).
    const after = [...pool].reverse().find(r => r.date >= event.data);
    if (after) setPick(after.id);
  };

  const candidates = result.candidatos.map(c => ({
    id: c.id, label: c.nome, tone: CANDIDATES[c.id]?.tone ?? 'other', value: urna[c.id],
    sub: base === 'totais' ? c.partido : `${c.partido} · ${int(c.votos)} votos`,
  }));

  return html`<div class="vs">
    ${!only && html`<section class="vs-block" aria-labelledby="vs-resultado">
      <${SectionHead} id="vs-resultado" title="Resultado das urnas"><span class="section-count">${baseLabel(base)} · 100% apurado</span><//>
      <${ResultList} items=${candidates} note=${`Outros: ${pct(result.outros.validos, 2)} dos válidos.`}/>
    </section>`}

    <section class="vs-block" aria-labelledby="vs-pesquisa">
      <${SectionHead} id="vs-pesquisa" title=${only ? `Pesquisas de ${only} × urna` : 'Compare com uma pesquisa'}><span class="section-count">${baseLabel(base)}</span><//>
      ${!only && html`<${Modes} value=${mode} onChange=${setMode}
        modes=${[['data', 'Por data'], ['instituto', 'Por instituto'], ['evento', 'Por acontecimento']]}/>`}

      <div class="picker">
        ${(only || mode === 'data') && html`<label class="picker-select">
          <span>Pesquisa</span>
          <select value=${pick ?? ''} onChange=${event => setPick(event.target.value === 'media' ? 'media' : Number(event.target.value))}>
            ${hasFinals && html`<option value="media">Média das pesquisas finais (${finais(rows).length} institutos)</option>`}
            ${pool.map(r => html`<option key=${r.id} value=${r.id}>${shortDate(r.date)} · ${r.inst}${r.poll.aprox ? ' (data ≈)' : ''}</option>`)}
          </select>
        </label>`}
        ${!only && mode === 'instituto' && html`
          <div class="chips" role="group" aria-label="Instituto">${institutes.map(name => html`<button key=${name} class="chip"
            aria-pressed=${inst === name} onClick=${() => chooseInstitute(name)}>${name}</button>`)}</div>
          <div class="chips is-dates" role="group" aria-label=${`Pesquisas de ${inst}`}>${pool.filter(r => r.inst === inst).map(r => html`<button key=${r.id}
            class="chip" aria-pressed=${row?.id === r.id && pick !== 'media'} onClick=${() => setPick(r.id)}>${shortDate(r.date)}</button>`)}</div>`}
        ${!only && mode === 'evento' && html`<${Timeline} active=${eventN} onPick=${chooseEvent}/>`}
      </div>

      ${shares ? html`
        <p class="picked">
          ${pick === 'media' ? html`<b>Média das pesquisas finais</b> (última de cada instituto na semana da eleição)`
            : html`<b>${row.inst}</b>, divulgada em ${shortDate(row.date)}${row.poll.campo ? ` · campo ${row.poll.campo}` : ''}`}
          ${mode === 'evento' && pickedEvent && pick !== 'media' && html`<br/><span class="muted">Primeira pesquisa depois de “${pickedEvent.titulo}” (${shortDate(pickedEvent.data)}).</span>`}
        </p>
        <${PairBars} items=${items}/>
        <p class="picked-gap">
          Distância Flávio − Lula: pesquisa <b>${leadText(gap)}</b> · urnas <b>${leadText(target, 2)}</b> · erro <b>${pp(Math.abs(gap - target), 1)}</b>
          ${' '}<${OrderBadge} value=${ordem(shares, urna)}/>
        </p>`
        : html`<p class="empty">${mode === 'evento' && !pickedEvent ? 'Escolha um acontecimento acima.' : 'Nenhuma pesquisa nesta base.'}</p>`}
    </section>

    ${!only && mode !== 'evento' && html`<section class="vs-block" aria-labelledby="vs-eventos">
      <${SectionHead} id="vs-eventos" title="O que marcou a campanha"><span class="section-count">números também nos gráficos</span><//>
      <${Timeline} active=${eventN} onPick=${chooseEvent}/>
    </section>`}
  </div>`;
}

/* ---------------------------------------------------------------- Senado */

const DUPLA_PARTS = [[2, 'good', '2/2'], [1, 'warn', '1/2'], [0, 'bad', '0/2'], ['na', 'na', 'só líder']];

/** Acerto da dupla por UF, da que mais errou à que mais acertou. Cada linha abre a UF. */
function DuplaByState({ rows, selected, onState }) {
  const rated = r => r[2] + r[1] + r[0];
  const share = r => rated(r) ? r[2] / rated(r) : -1;
  const sorted = [...rows].sort((a, b) => (b.total ? 1 : 0) - (a.total ? 1 : 0) || share(a) - share(b) || stateName(a.uf).localeCompare(stateName(b.uf), 'pt-BR'));
  return html`<div>
    <ul class="dupla-bars">${sorted.map(r => html`<li key=${r.uf}>
      <button class="dupla-bar" aria-pressed=${selected === r.uf} onClick=${() => onState(r.uf)}
        aria-label=${`${stateName(r.uf)}: ${r.total ? `${r[2]} de ${rated(r)} checagens avaliáveis acertaram a dupla` : 'sem pesquisas'}`}>
        <b class="dupla-uf">${r.uf}</b>
        <span class="dupla-track" aria-hidden="true">${r.total
          ? DUPLA_PARTS.filter(([key]) => r[key]).map(([key, cls]) => html`<i key=${key} class=${'is-' + cls} style=${{ flexGrow: r[key] }}></i>`)
          : html`<small class="muted">sem pesquisa</small>`}</span>
        <small class="dupla-count">${r.total ? `${r[2]}/${rated(r)}` : ''}</small>
      </button>
    </li>`)}</ul>
    <ul class="chart-legend">${DUPLA_PARTS.map(([key, cls, text]) => html`<li key=${key}><i class=${'swatch is-' + cls}></i>${text}</li>`)}</ul>
  </div>`;
}

/** Numa UF: resultado real e uma pesquisa escolhida para comparar com ele. */
function SenateUfCompare({ uf, ufResult, polls }) {
  const sorted = useMemo(() => [...(polls ?? [])].map((p, i) => ({ p, i })).sort((a, b) => (b.p.div ?? '').localeCompare(a.p.div ?? '') || a.p.inst.localeCompare(b.p.inst, 'pt-BR')), [polls]);
  const initial = useMemo(() => {
    const best = senateLatest(polls ?? []).filter(comparable).sort((a, b) => (b.div ?? '').localeCompare(a.div ?? ''))[0];
    return sorted.find(s => s.p === best)?.i ?? sorted[0]?.i ?? null;
  }, [sorted]);
  const [pick, setPick] = useState(initial);
  const poll = (polls ?? [])[pick];
  const elected = ufResult.c.filter(c => c[3]);
  const result = ufResult.c.filter(c => c[2] != null).map(([name, party, value, won]) => ({
    id: name, label: name, tone: toneOfParty(party), value, sub: `${party ?? ''}${won ? ' · eleito' : ''}`,
  }));
  const values = poll ? displayValues(poll) : null;
  const canCompare = poll?.base === 'VV';
  const diffs = poll ? differences(poll, ufResult) : {};
  const items = poll ? ufResult.c.filter(c => c[2] != null && (values.x[c[0]] != null || c[3])).map(([name, party, value, won]) => ({
    id: name, label: name, tone: toneOfParty(party), urna: value, poll: values.x[name] ?? null, sub: won ? 'eleito' : party,
  })) : [];
  return html`
    <section class="vs-block" aria-labelledby="vs-uf-resultado">
      <${SectionHead} id="vs-uf-resultado" title=${`${stateName(uf)}: resultado das urnas`}><span class="section-count">eleitos: ${elected.map(c => c[0]).join(' e ')}</span><//>
      <${ResultList} items=${result}/>
    </section>
    <section class="vs-block" aria-labelledby="vs-uf-pesquisa">
      <${SectionHead} id="vs-uf-pesquisa" title="Compare com uma pesquisa"><span class="section-count">${plural(polls?.length ?? 0)}</span><//>
      ${!polls?.length ? html`<p class="empty">Sem pesquisas reunidas para esta UF.</p>` : html`
        <div class="picker"><label class="picker-select"><span>Pesquisa</span>
          <select value=${pick} onChange=${event => setPick(Number(event.target.value))}>
            ${sorted.map(({ p, i }) => html`<option key=${i} value=${i}>${p.div ? shortDate(p.div) : 'sem data'} · ${p.inst} · ${{ VV: 'válidos', VT: 'totais', 200: 'soma 200%', 'n/e': 'base n/e' }[p.base]}</option>`)}
          </select></label></div>
        <p class="picked"><b>${poll.inst}</b>, ${poll.div ? `divulgada em ${shortDate(poll.div)}` : 'sem data'} <${BaseBadge} base=${poll.base} normalizado=${values.normalizado}/>
          ${!canCompare && html`<br/><span class="muted">${poll.base === 'VT' ? 'Votos totais incluem indecisos: os números ficam abaixo da urna por natureza.' : 'Base diferente dos votos válidos: compare com cuidado.'}</span>`}</p>
        <${PairBars} items=${items} comparable=${canCompare}/>
        <p class="picked-gap">Acertou a dupla eleita? <${DuplaBadge} dupla=${acertouDupla(poll, ufResult)}/>
          ${canCompare && Object.keys(diffs).length > 0 && html` · erro médio <b>${num(Object.values(diffs).reduce((s, d) => s + Math.abs(d), 0) / Object.keys(diffs).length, 1)} pontos</b>`}</p>`}
    </section>`;
}

const plural = n => `${n} ${n === 1 ? 'pesquisa' : 'pesquisas'}`;

export function SenateCompare({ uf, resultByUf, pollsByUf, dupla, onState }) {
  return html`<div class="vs">
    ${uf
      ? html`<${SenateUfCompare} key=${uf} uf=${uf} ufResult=${resultByUf[uf]} polls=${pollsByUf[uf]}/>`
      : html`<p class="lead-note">Escolha uma UF para ver o resultado e comparar com cada pesquisa.</p>`}
    <section class="vs-block" aria-labelledby="vs-dupla">
      <${SectionHead} id="vs-dupla" title="As pesquisas acertaram os dois eleitos?"><span class="section-count">por UF, da que mais errou</span><//>
      <${DuplaByState} rows=${dupla} selected=${uf} onState=${onState}/>
    </section>
  </div>`;
}

/* ---------------------------------------------------------------- Institutos */

export function InstitutesCompare({ inst, result, rows, urna, base, onSelect }) {
  const last = finais(rows);
  return html`<div class="vs">
    ${inst
      ? (rows.some(r => r.inst === inst)
        ? html`<${PresidentCompare} key=${inst + base} only=${inst} result=${result} rows=${rows} urna=${urna} base=${base}/>`
        : html`<p class="empty">${inst} não tem pesquisa presidencial em ${baseLabel(base)}.</p>`)
      : html`<p class="lead-note">Escolha um instituto para comparar cada pesquisa dele com o resultado.</p>`}
    ${last.length > 0 && html`<section class="vs-block" aria-labelledby="vs-inst-gap">
      <${SectionHead} id="vs-inst-gap" title="Distância Flávio − Lula na véspera"><span class="section-count">última pesquisa de cada instituto</span><//>
      <${InstituteGaps} rows=${last} urna=${urna} selected=${inst} onSelect=${onSelect}/>
    </section>`}
  </div>`;
}
