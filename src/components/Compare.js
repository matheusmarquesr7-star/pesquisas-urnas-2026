// Pesquisas × urnas: os gráficos da coluna da esquerda, no lugar do mapa.
// Cada um compara o que as pesquisas esperavam com o que saiu das urnas.
import { useMemo, useState } from 'preact/hooks';
import { html } from '../lib/html.js';
import { num, pct, plural, pp, shortDate } from '../lib/format.js';
import { distancia, finais, finaisPorCandidato, latestByInstitute, porCandidato, senateExpected } from '../lib/metrics.js';
import { CANDIDATES, stateName } from '../data/meta.js';
import { useWidth } from '../hooks/useWidth.js';
import { leadText } from './GapChart.js';
import { SectionHead, toneOfParty } from './ui.js';

const PRESIDENT_KEYS = ['F', 'L', 'Cury', 'Renan', 'Caiado', 'Zema'];
const baseLabel = base => base === 'totais' ? 'votos totais' : 'votos válidos';
/** Posição em % dentro de [lo, hi]. */
const at = (value, lo, hi) => ((value - lo) / (hi - lo)) * 100;
const niceMax = values => Math.max(10, Math.ceil((Math.max(...values) + 1) / 10) * 10);

/* ---------------------------------------------------------------- Halteres: pesquisa × urna por candidato */

/**
 * Uma linha por candidato: anel = pesquisa (média, quando há mais de uma), ponto escuro = urna,
 * traço entre os dois = erro, faixa clara = da menor à maior pesquisa.
 */
function Dumbbells({ items, ariaLabel }) {
  const hi = niceMax(items.flatMap(i => [i.max, i.urna]));
  const ticks = [0, hi / 2, hi];
  return html`<div class="dumbbells-wrap">
    <ul class="dumbbells" aria-label=${ariaLabel}>${items.map(item => {
      const from = Math.min(item.media, item.urna), to = Math.max(item.media, item.urna);
      const label = `${item.label}: ${item.n > 1 ? `média de ${item.n} pesquisas` : 'pesquisa'} ${num(item.media)}%, urna ${num(item.urna, 2)}%, diferença de ${pp(item.diff, 1, true)}`;
      return html`<li key=${item.id} class=${'dumbbell tone-' + item.tone + (item.strong ? ' is-strong' : '')} aria-label=${label}>
        <span class="dumbbell-label"><b>${item.label}</b>${item.sub && html`<small>${item.sub}</small>`}</span>
        <span class="dumbbell-track" aria-hidden="true">
          ${ticks.map(t => html`<i key=${t} class="dumbbell-grid" style=${{ left: at(t, 0, hi) + '%' }}></i>`)}
          ${item.n > 1 && html`<i class="dumbbell-range" style=${{ left: at(item.min, 0, hi) + '%', width: at(item.max, 0, hi) - at(item.min, 0, hi) + '%' }}></i>`}
          <i class="dumbbell-stem" style=${{ left: at(from, 0, hi) + '%', width: at(to, 0, hi) - at(from, 0, hi) + '%' }}></i>
          <i class="dumbbell-poll" style=${{ left: at(item.media, 0, hi) + '%' }}></i>
          <i class="dumbbell-urna" style=${{ left: at(item.urna, 0, hi) + '%' }}></i>
        </span>
        <span class="dumbbell-value" aria-hidden="true">
          <b class=${item.diff < 0 ? 'bad-text' : 'warn-text'}>${pp(item.diff, 1, true)}</b>
          <small>${num(item.media)} → ${num(item.urna, 2)}</small>
        </span>
      </li>`;
    })}</ul>
    <div class="dumbbell-axis" aria-hidden="true">
      <span></span>
      <span class="dumbbell-ticks">${ticks.map(t => html`<i key=${t} style=${{ left: at(t, 0, hi) + '%' }}>${t}%</i>`)}</span>
      <span></span>
    </div>
    <ul class="chart-legend">
      <li><i class="ring-key"></i>Pesquisa</li>
      <li><i class="dot-key urna-key"></i>Urna</li>
      <li><i class="range-key"></i>Da menor à maior pesquisa</li>
      <li>Negativo: a urna deu mais do que a pesquisa</li>
    </ul>
  </div>`;
}

/* ---------------------------------------------------------------- Barras divergentes: pesquisa − urna */

/**
 * Quanto a pesquisa deu a mais (direita) ou a menos (esquerda) do que a urna, por candidato.
 * Serve quando os candidatos têm tamanhos muito diferentes (47% e 0,3%): o erro fica na mesma escala.
 */
function DiffBars({ items, ariaLabel }) {
  const lim = Math.max(2, Math.ceil(Math.max(...items.map(i => Math.abs(i.diff)))));
  const x = value => at(value, -lim, lim);
  return html`<div class="gaps-wrap">
    <div class="gaps-head" aria-hidden="true">
      <span></span>
      <span class="gaps-sides"><span>← a urna deu mais</span><span>a pesquisa deu mais →</span></span>
      <span></span>
    </div>
    <ul class="dumbbells" aria-label=${ariaLabel}>${items.map(item => html`<li key=${item.id} class=${'dumbbell tone-' + item.tone + (item.strong ? ' is-strong' : '')}
      aria-label=${`${item.label}: ${item.n > 1 ? `média de ${item.n} pesquisas` : 'pesquisa'} ${num(item.media)}%, urna ${num(item.urna, 2)}%, diferença de ${pp(item.diff, 1, true)}`}>
      <span class="dumbbell-label"><b>${item.label}</b>${item.sub && html`<small>${item.sub}</small>`}</span>
      <span class="diff-track" aria-hidden="true">
        <i class="gap-zero" style=${{ left: '50%' }}></i>
        <i class="diff-bar" style=${{ left: x(Math.min(0, item.diff)) + '%', width: Math.abs(x(item.diff) - x(0)) + '%' }}></i>
      </span>
      <span class="dumbbell-value" aria-hidden="true">
        <b class=${item.diff < 0 ? 'bad-text' : 'warn-text'}>${pp(item.diff, 1, true)}</b>
        <small>${num(item.media)} → ${num(item.urna, 2)}</small>
      </span>
    </li>`)}</ul>
    <div class="dumbbell-axis" aria-hidden="true">
      <span></span>
      <span class="dumbbell-ticks">${[-lim, 0, lim].map(t => html`<i key=${t} style=${{ left: x(t) + '%' }}>${t > 0 ? '+' + t : t < 0 ? '−' + -t : '0'} pp</i>`)}</span>
      <span></span>
    </div>
    <p class="note">Ao lado de cada barra: pesquisa → urna, em %.</p>
  </div>`;
}

/* ---------------------------------------------------------------- Distância de cada instituto × urna */

/** Uma linha por instituto: a distância Flávio − Lula da última pesquisa e a linha das urnas. */
function InstituteGaps({ rows, urna, selected, onSelect }) {
  const target = distancia(urna);
  const values = [...rows.map(r => r.distancia), target, 0];
  const lo = Math.floor(Math.min(...values) - 1), hi = Math.ceil(Math.max(...values) + 1);
  const sorted = [...rows].sort((a, b) => a.erroDistancia - b.erroDistancia);
  const ticks = [lo, 0, hi].filter((t, i, list) => list.indexOf(t) === i);
  const x = value => at(value, lo, hi);
  return html`<div class="gaps-wrap">
    <div class="gaps-head" aria-hidden="true">
      <span></span>
      <span class="gaps-sides"><span>← Lula à frente</span><span>Flávio à frente →</span></span>
      <span></span>
    </div>
    <ul class="gaps">${sorted.map(row => {
      const tone = row.distancia > 0 ? 'blue' : row.distancia < 0 ? 'red' : 'other';
      const from = Math.min(row.distancia, target), to = Math.max(row.distancia, target);
      const dim = selected && row.inst !== selected;
      return html`<li key=${row.inst}>
        <button class=${'gap-row' + (dim ? ' is-dim' : '')} aria-pressed=${selected === row.inst} onClick=${() => onSelect(row.inst)}
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
    <div class="gaps-axis" aria-hidden="true">
      <span></span>
      <span class="dumbbell-ticks">${ticks.map(t => html`<i key=${t} style=${{ left: x(t) + '%' }}>${t > 0 ? '+' + t : t < 0 ? '−' + -t : '0'}</i>`)}</span>
      <span></span>
    </div>
    <ul class="chart-legend">
      <li><i class="dot-key tone-blue"></i>Pesquisa com Flávio à frente</li>
      <li><i class="dot-key tone-red"></i>Com Lula à frente</li>
      <li><i class="urna-line-key"></i>Urnas: ${leadText(target, 2)}</li>
      <li><i class="stem-key"></i>Erro</li>
    </ul>
  </div>`;
}

/* ---------------------------------------------------------------- Senado: dispersão pesquisa × urna */

const SCATTER_MARGIN = { top: 24, right: 12, bottom: 34, left: 38 };

/** Posiciona os rótulos da dispersão e descarta os que cairiam em cima de outro. */
function placeLabels(list, x, y, width) {
  const placed = [];
  for (const p of list) {
    const right = x(p.urna) > width * 0.6;
    const text = `${p.name} (${p.uf})`;
    const w = text.length * 6.2;
    const lx = x(p.urna) + (right ? -8 : 8), ly = y(p.poll) - 7;
    const box = { x0: right ? lx - w : lx, x1: right ? lx : lx + w, y0: ly - 11, y1: ly + 3 };
    if (placed.some(o => box.x0 < o.box.x1 && o.box.x0 < box.x1 && box.y0 < o.box.y1 && o.box.y0 < box.y1)) continue;
    placed.push({ p, lx, ly, anchor: right ? 'end' : 'start', box });
  }
  return placed;
}

/**
 * Cada candidato medido: x = urna, y = pesquisa. Na diagonal, a pesquisa acertou em cheio; acima dela,
 * esperava mais do que saiu; abaixo, menos. A faixa clara marca ±5 pontos.
 */
function SenateScatter({ points, focus, onState, ariaLabel }) {
  const [ref, width] = useWidth();
  const [active, setActive] = useState(null);
  const height = Math.min(Math.max(width, 260), 380);
  const inFocus = p => !focus || (focus.uf ? p.uf === focus.uf : p.inst === focus.inst);
  const shown = points.filter(inFocus);
  // Os 3 maiores erros ganham nome; um nome por candidato (vários institutos medem o mesmo).
  const labeled = useMemo(() => {
    const seen = new Set();
    return [...shown].sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff)).filter(p => {
      const key = p.uf + p.name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 3);
  }, [shown]);

  let plot = null;
  if (width > 0 && points.length) {
    const hi = niceMax(points.flatMap(p => [p.poll, p.urna]));
    const innerW = width - SCATTER_MARGIN.left - SCATTER_MARGIN.right, innerH = height - SCATTER_MARGIN.top - SCATTER_MARGIN.bottom;
    const x = v => SCATTER_MARGIN.left + (v / hi) * innerW;
    const y = v => SCATTER_MARGIN.top + ((hi - v) / hi) * innerH;
    const ticks = Array.from({ length: hi / 10 + 1 }, (_, i) => i * 10);
    const band = [[0, 0], [hi, hi]];
    const bandPath = `M${x(0)} ${y(5)} L${x(hi - 5)} ${y(hi)} L${x(hi)} ${y(hi)} L${x(hi)} ${y(hi - 5)} L${x(5)} ${y(0)} L${x(0)} ${y(0)} Z`;
    // Desenha os pontos fora do foco primeiro, para os destacados ficarem por cima.
    const ordered = [...points].sort((a, b) => Number(inFocus(a)) - Number(inFocus(b)));
    const tipLeft = active ? Math.max(0, Math.min(width - 236, x(active.urna) + 14 > width - 236 ? x(active.urna) - 250 : x(active.urna) + 14)) : 0;
    const tipTop = active ? Math.max(0, Math.min(height - 130, y(active.poll) - 30)) : 0;
    plot = html`
      <svg width=${width} height=${height} class="scatter" role="img" aria-label=${ariaLabel}>
        <path class="scatter-band" d=${bandPath}/>
        ${ticks.map(t => html`<g key=${t}>
          <line class="chart-grid" x1=${x(0)} x2=${x(hi)} y1=${y(t)} y2=${y(t)}/>
          <line class="chart-grid" x1=${x(t)} x2=${x(t)} y1=${y(0)} y2=${y(hi)}/>
          <text class="chart-tick" x=${x(0) - 6} y=${y(t)} dy="0.32em" text-anchor="end">${t}</text>
          <text class="chart-tick" x=${x(t)} y=${y(0) + 16} text-anchor="middle">${t}</text>
        </g>`)}
        <line class="result-line" x1=${x(band[0][0])} y1=${y(band[0][1])} x2=${x(band[1][0])} y2=${y(band[1][1])}/>
        <text class="band-label" x=${x(1)} y=${y(hi) + 14}>Pesquisa acima da urna</text>
        <text class="band-label" x=${x(hi) - 4} y=${y(0) - 8} text-anchor="end">Pesquisa abaixo da urna</text>
        <text class="chart-note" x=${x(hi)} y=${height - 2} text-anchor="end">urna (%)</text>
        <text class="chart-note" x=${0} y=${10}>pesquisa (%)</text>
        ${ordered.map((p, i) => html`<circle key=${i}
          class=${'scatter-dot tone-' + toneOfParty(p.party) + (p.eleito ? ' is-elected' : '') + (inFocus(p) ? '' : ' is-dim') + (active === p ? ' is-active' : '')}
          cx=${x(p.urna)} cy=${y(p.poll)} r=${p.eleito ? 5 : 4}
          onPointerEnter=${() => setActive(p)} onPointerLeave=${event => { if (event.pointerType === 'mouse') setActive(null); }}
          onClick=${() => { setActive(p); onState(p.uf); }}/>`)}
        ${placeLabels(labeled, x, y, width).map(({ p, lx, ly, anchor }) => html`<text key=${'l' + p.uf + p.name} class="scatter-label"
          x=${lx} y=${ly} text-anchor=${anchor}>${p.name} (${p.uf})</text>`)}
      </svg>
      ${active && html`<div class="chart-tooltip" style=${{ left: tipLeft + 'px', top: tipTop + 'px' }} role="status">
        <strong>${active.name}${active.eleito && html`<em class="tag is-elected">eleito</em>`}</strong>
        <span class="muted">${active.party ?? ''} · ${stateName(active.uf)}</span>
        <p>${active.inst}: <b>${num(active.poll)}%</b> na pesquisa</p>
        <p>Urna: <b>${num(active.urna, 2)}%</b></p>
        <p>Diferença: <b>${pp(active.diff, 1, true)}</b></p>
      </div>`}`;
  }

  const near = shown.filter(p => Math.abs(p.diff) <= 3).length;
  return html`<div class="scatter-wrap">
    <p class="chart-summary">${shown.length
      ? html`<b>${near} de ${shown.length}</b> medições ficaram a até 3 pontos da urna.`
      : 'Nenhuma pesquisa em votos válidos para comparar aqui.'}</p>
    <div class="chart-plot" ref=${ref} style=${{ height: height + 'px' }}>${plot}</div>
    <ul class="chart-legend">
      <li><i class="dot-key tone-red"></i>Esquerda e centro-esquerda</li>
      <li><i class="dot-key tone-beige"></i>Centro</li>
      <li><i class="dot-key tone-blue"></i>Direita</li>
      <li><i class="dot-key is-final"></i>Eleito</li>
      <li><i class="result-key"></i>Acerto exato</li>
      <li><i class="band-key"></i>±5 pontos</li>
    </ul>
  </div>`;
}

/* ---------------------------------------------------------------- Senado: acerto da dupla por UF */

const DUPLA_PARTS = [[2, 'good', '2/2'], [1, 'warn', '1/2'], [0, 'bad', '0/2'], ['na', 'na', 'só líder']];

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

/* ---------------------------------------------------------------- Telas */

export function PresidentCompare({ rows, urna, base, onInstitute }) {
  const last = finais(rows);
  const items = finaisPorCandidato(rows, urna, PRESIDENT_KEYS).map(item => ({
    ...item, id: item.key, label: CANDIDATES[item.key].short, tone: CANDIDATES[item.key].tone,
    sub: `${item.n > 1 ? `média de ${item.n}` : '1 pesquisa'}`, strong: item.key === 'F' || item.key === 'L',
  }));
  if (!last.length) return html`<p class="empty">Nenhuma pesquisa da semana da eleição tem dados em ${baseLabel(base)}.</p>`;
  return html`<div class="vs">
    <section class="vs-block" aria-labelledby="cmp-candidatos">
      <${SectionHead} id="cmp-candidatos" title="Quanto cada um teve a mais ou a menos"><span class="section-count">pesquisas finais × urna</span><//>
      <${DiffBars} items=${items} ariaLabel=${`Média das pesquisas finais menos o resultado das urnas, em ${baseLabel(base)}`}/>
    </section>
    <section class="vs-block" aria-labelledby="cmp-institutos">
      <${SectionHead} id="cmp-institutos" title="A distância que cada instituto previu"><span class="section-count">${plural(last.length, 'pesquisa final', 'pesquisas finais')}</span><//>
      <${InstituteGaps} rows=${last} urna=${urna} onSelect=${onInstitute}/>
    </section>
  </div>`;
}

export function SenateCompare({ uf, resultByUf, pollsByUf, points, dupla, onState }) {
  const expected = uf ? senateExpected(pollsByUf[uf], resultByUf[uf]) : [];
  return html`<div class="vs">
    ${uf && html`<section class="vs-block" aria-labelledby="cmp-uf">
      <${SectionHead} id="cmp-uf" title=${`${stateName(uf)}: pesquisas × urna`}><span class="section-count">votos válidos</span><//>
      ${expected.length
        ? html`<${Dumbbells} ariaLabel=${`Média das últimas pesquisas e resultado em ${stateName(uf)}`}
            items=${expected.map(e => ({ ...e, id: e.name, label: e.name, tone: toneOfParty(e.party), strong: e.eleito,
              sub: `${e.party ?? ''}${e.eleito ? ' · eleito' : ''}` }))}/>`
        : html`<p class="empty">Nenhuma pesquisa em votos válidos nesta UF. As outras bases estão na tabela ao lado.</p>`}
    </section>`}
    <section class="vs-block" aria-labelledby="cmp-dispersao">
      <${SectionHead} id="cmp-dispersao" title="Cada candidato: pesquisa × urna"><span class="section-count">última pesquisa VV de cada instituto</span><//>
      <${SenateScatter} points=${points} focus=${uf ? { uf } : null} onState=${onState}
        ariaLabel=${`Dispersão de ${points.length} medições de candidatos ao Senado: pesquisa contra urna`}/>
    </section>
    <section class="vs-block" aria-labelledby="cmp-dupla">
      <${SectionHead} id="cmp-dupla" title="Acertaram a dupla eleita?"><span class="section-count">por UF, da que mais errou</span><//>
      <${DuplaByState} rows=${dupla} selected=${uf} onState=${onState}/>
    </section>
  </div>`;
}

export function InstitutesCompare({ inst, rows, urna, points, onSelect, onState }) {
  const last = finais(rows);
  const mine = inst ? latestByInstitute(rows.filter(r => r.inst === inst))[0] : null;
  const items = mine ? porCandidato([mine], urna, PRESIDENT_KEYS).map(item => ({
    ...item, id: item.key, label: CANDIDATES[item.key].short, tone: CANDIDATES[item.key].tone, strong: item.key === 'F' || item.key === 'L',
  })) : [];
  const senate = inst ? points.filter(p => p.inst === inst) : points;
  return html`<div class="vs">
    ${inst && html`<section class="vs-block" aria-labelledby="cmp-inst-pres">
      <${SectionHead} id="cmp-inst-pres" title="Última pesquisa para Presidente × urna">
        <span class="section-count">${mine ? shortDate(mine.date) : 'sem pesquisa nesta base'}</span>
      <//>
      ${items.length ? html`<${DiffBars} items=${items} ariaLabel=${`Última pesquisa presidencial de ${inst} menos o resultado das urnas`}/>`
        : html`<p class="empty">${inst} não tem pesquisa presidencial nesta base.</p>`}
    </section>`}
    ${last.length > 0 && html`<section class="vs-block" aria-labelledby="cmp-inst-gap">
      <${SectionHead} id="cmp-inst-gap" title="Distância Flávio − Lula na véspera"><span class="section-count">${plural(last.length, 'instituto', 'institutos')}</span><//>
      <${InstituteGaps} rows=${last} urna=${urna} selected=${inst} onSelect=${onSelect}/>
      ${inst && !last.some(r => r.inst === inst) && html`<p class="note">${inst} não divulgou pesquisa presidencial na semana da eleição.</p>`}
    </section>`}
    <section class="vs-block" aria-labelledby="cmp-inst-senado">
      <${SectionHead} id="cmp-inst-senado" title=${inst ? `Senado: ${inst} × urna` : 'Senado: pesquisa × urna'}>
        <span class="section-count">${plural(senate.length, 'medição', 'medições')}</span>
      <//>
      <${SenateScatter} points=${points} focus=${inst ? { inst } : null} onState=${onState}
        ariaLabel=${inst ? `Medições de ${inst} para o Senado contra o resultado` : 'Medições de todos os institutos para o Senado contra o resultado'}/>
    </section>
  </div>`;
}
