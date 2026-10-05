import { useMemo, useRef, useState } from 'preact/hooks';
import { html } from '../lib/html.js';
import { pct, pp, shortDate } from '../lib/format.js';
import { dayNumber, distancia, ELECTION_DAY, finais, jitter } from '../lib/metrics.js';
import { useWidth } from '../hooks/useWidth.js';

const MARGIN = { top: 22, right: 92, bottom: 28, left: 34 };
const LAST_DAY = dayNumber(ELECTION_DAY);
const X_TICKS = ['2026-08-16', '2026-09-01', '2026-09-15', '2026-10-04'];

/** "Lula +3,0" / "Flávio +1,9" / "empate". */
export function leadText(gap, digits = 1) {
  if (gap == null) return '–';
  if (gap === 0) return 'empate';
  const places = Math.abs(gap) < 0.1 ? 2 : digits;
  return `${gap > 0 ? 'Flávio' : 'Lula'} ${pp(Math.abs(gap), places, true).replace(' pp', '')}`;
}

function scaleY(values) {
  const min = Math.min(...values), max = Math.max(...values);
  const step = max - min > 14 ? 4 : 2;
  const low = Math.floor((min - 0.8) / step) * step, high = Math.ceil((max + 0.8) / step) * step;
  const ticks = [];
  for (let tick = low; tick <= high; tick += step) ticks.push(tick);
  return { low, high, ticks };
}

/**
 * Distância Flávio − Lula de cada pesquisa na data de divulgação. Acima do zero, Flávio à frente
 * (faixa azul); abaixo, Lula (faixa vermelha). A linha clara é o resultado das urnas e o traço
 * vertical de cada ponto até ela é o erro da pesquisa.
 */
export function GapChart({ rows, urna, highlight, onHighlight, describedBy }) {
  const [ref, width] = useWidth();
  const [active, setActive] = useState(null);
  const pointRefs = useRef([]);
  const target = distancia(urna);
  const dated = useMemo(() => rows.filter(r => r.date).sort((a, b) => a.date.localeCompare(b.date) || a.inst.localeCompare(b.inst)), [rows]);
  const offsets = useMemo(() => jitter(dated), [dated]);
  const finalRows = useMemo(() => new Set(finais(rows)), [rows]);
  const institutes = useMemo(() => [...new Set(dated.map(r => r.inst))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [dated]);
  const height = width < 560 ? 270 : 320;

  let plot = null;
  if (width > 0 && dated.length) {
    const { low, high, ticks } = scaleY([...dated.map(r => r.distancia), target, 0]);
    const innerWidth = width - MARGIN.left - MARGIN.right, innerHeight = height - MARGIN.top - MARGIN.bottom;
    const x = day => MARGIN.left + (day / LAST_DAY) * innerWidth;
    const y = value => MARGIN.top + ((high - value) / (high - low)) * innerHeight;
    const px = row => x(dayNumber(row.date) + offsets.get(row));
    const focus = active != null ? dated[active] : null;
    const highlighted = highlight ? dated.filter(r => r.inst === highlight) : [];

    const move = (index, step) => {
      const next = Math.max(0, Math.min(dated.length - 1, index + step));
      pointRefs.current[next]?.focus();
    };
    const onKeyDown = (event, index) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); move(index, 1); }
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); move(index, -1); }
      else if (event.key === 'Home') { event.preventDefault(); move(0, 0); }
      else if (event.key === 'End') { event.preventDefault(); move(dated.length - 1, 0); }
      else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onHighlight(highlight === dated[index].inst ? null : dated[index].inst);
      } else if (event.key === 'Escape') setActive(null);
    };
    const roving = active ?? dated.length - 1;
    const tipLeft = focus ? Math.max(0, Math.min(width - 236, px(focus) + 14 > width - 236 ? px(focus) - 250 : px(focus) + 14)) : 0;
    const tipTop = focus ? Math.max(0, Math.min(height - 150, y(focus.distancia) - 40)) : 0;

    plot = html`
      <svg width=${width} height=${height} class="gap-chart" role="group"
        aria-label=${`Distância entre Flávio e Lula em ${dated.length} pesquisas. Use as setas para percorrer e Enter para destacar o instituto.`}
        aria-describedby=${describedBy}>
        <rect class="band band-blue" x=${MARGIN.left} y=${y(high)} width=${innerWidth} height=${y(0) - y(high)}/>
        <rect class="band band-red" x=${MARGIN.left} y=${y(0)} width=${innerWidth} height=${y(low) - y(0)}/>
        <text class="band-label" x=${MARGIN.left + 8} y=${y(high) + 14}>Flávio à frente</text>
        <text class="band-label" x=${MARGIN.left + 8} y=${y(low) - 8}>Lula à frente</text>

        ${ticks.map(tick => html`<g key=${tick}>
          <line class=${tick === 0 ? 'chart-zero' : 'chart-grid'} x1=${MARGIN.left} x2=${MARGIN.left + innerWidth} y1=${y(tick)} y2=${y(tick)}/>
          <text class="chart-tick" x=${MARGIN.left - 6} y=${y(tick)} dy="0.32em" text-anchor="end">${tick > 0 ? '+' + tick : tick < 0 ? '−' + -tick : '0'}</text>
        </g>`)}
        ${X_TICKS.map((iso, i) => html`<text key=${iso} class="chart-tick" x=${x(dayNumber(iso))} y=${height - 8}
          text-anchor=${i === 0 ? 'start' : i === X_TICKS.length - 1 ? 'end' : 'middle'}>${shortDate(iso)}</text>`)}
        <line class="chart-election" x1=${x(LAST_DAY)} x2=${x(LAST_DAY)} y1=${MARGIN.top - 8} y2=${MARGIN.top + innerHeight}/>
        <text class="chart-note" x=${x(LAST_DAY)} y=${MARGIN.top - 11} text-anchor="end">eleição</text>

        ${dated.map(row => html`<line key=${'e' + row.id} class=${'error-stem' + (highlight && row.inst !== highlight ? ' is-dim' : '') + (highlight === row.inst || focus === row ? ' is-strong' : '')}
          x1=${px(row)} x2=${px(row)} y1=${y(row.distancia)} y2=${y(target)}/>`)}

        <line class="result-line" x1=${MARGIN.left} x2=${MARGIN.left + innerWidth} y1=${y(target)} y2=${y(target)}/>
        <text class="result-label" x=${MARGIN.left + innerWidth + 6} y=${y(target) - 6}>Urnas</text>
        <text class="result-value" x=${MARGIN.left + innerWidth + 6} y=${y(target) + 9}>${leadText(target, 2)}</text>

        ${highlighted.length > 1 && html`<path class="highlight-line"
          d=${highlighted.map((row, i) => `${i ? 'L' : 'M'}${px(row).toFixed(1)} ${y(row.distancia).toFixed(1)}`).join('')}/>`}

        ${dated.map((row, index) => {
          const tone = row.distancia > 0 ? 'blue' : row.distancia < 0 ? 'red' : 'other';
          const dim = highlight && row.inst !== highlight;
          const label = `${row.inst}, ${shortDate(row.date)}${row.poll.aprox ? ' (data aproximada)' : ''}: ${leadText(row.distancia)}; erro de ${pp(row.erroDistancia, 2)} em relação às urnas.`;
          return html`<g key=${row.id} class=${'gap-point tone-' + tone + (dim ? ' is-dim' : '') + (finalRows.has(row) ? ' is-final' : '') + (focus === row ? ' is-active' : '')}
            ref=${el => { pointRefs.current[index] = el; }} tabindex=${index === roving ? 0 : -1} role="button" aria-label=${label}
            aria-pressed=${highlight === row.inst}
            onFocus=${() => setActive(index)} onBlur=${() => setActive(current => current === index ? null : current)}
            onPointerEnter=${() => setActive(index)} onPointerLeave=${() => setActive(null)}
            onClick=${() => { setActive(index); }} onKeyDown=${event => onKeyDown(event, index)}>
            <circle class="hit" cx=${px(row)} cy=${y(row.distancia)} r="12"/>
            <circle class="dot" cx=${px(row)} cy=${y(row.distancia)} r=${finalRows.has(row) ? 6 : 4.5}/>
          </g>`;
        })}
      </svg>
      ${focus && html`<div class="chart-tooltip" style=${{ left: tipLeft + 'px', top: tipTop + 'px' }} role="status">
        <strong>${focus.inst}${finalRows.has(focus) && html`<em class="tag">final</em>`}</strong>
        <span class="muted">Divulgada ${shortDate(focus.date)}${focus.poll.aprox ? ' (≈ aproximada)' : ''} · campo ${focus.poll.campo ?? 'n/e'}</span>
        <p><i class="line-key tone-blue"></i><b>${pct(focus.shares.F)}</b> Flávio</p>
        <p><i class="line-key tone-red"></i><b>${pct(focus.shares.L)}</b> Lula</p>
        <p>Distância: <b>${leadText(focus.distancia)}</b></p>
        <p>Erro na distância: <b>${pp(focus.erroDistancia, 2)}</b></p>
        ${focus.recalculado && html`<span class="muted">* válidos recalculados a partir dos totais</span>`}
      </div>`}`;
  }

  return html`<div class="gap-chart-wrap">
    <div class="chips" role="group" aria-label="Destacar um instituto">
      <button class="chip" aria-pressed=${!highlight} onClick=${() => onHighlight(null)}>Todos</button>
      ${institutes.map(inst => html`<button key=${inst} class="chip" aria-pressed=${highlight === inst}
        onClick=${() => onHighlight(highlight === inst ? null : inst)}>${inst}</button>`)}
    </div>
    <div class="chart-plot" ref=${ref} style=${{ height: height + 'px' }}>${plot}</div>
    <ul class="chart-legend">
      <li><i class="dot-key tone-blue"></i>Pesquisa com Flávio à frente</li>
      <li><i class="dot-key tone-red"></i>Pesquisa com Lula à frente</li>
      <li><i class="dot-key is-final"></i>Última de cada instituto (semana da eleição)</li>
      <li><i class="result-key"></i>Resultado das urnas</li>
      <li><i class="stem-key"></i>Erro (distância até as urnas)</li>
    </ul>
  </div>`;
}
