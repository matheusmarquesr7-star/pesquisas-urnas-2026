import { useMemo, useState } from 'preact/hooks';
import { html } from '../lib/html.js';
import { pct, shortDate } from '../lib/format.js';
import { dayNumber, ELECTION_DAY, isoFromDay, movingAverage } from '../lib/metrics.js';
import { CANDIDATES } from '../data/meta.js';
import { useWidth } from '../hooks/useWidth.js';

const MARGIN = { top: 14, right: 104, bottom: 28, left: 34 };
const LAST_DAY = dayNumber(ELECTION_DAY);
const SERIES = ['F', 'L'];
const MIN_LABEL_GAP = 16;
const X_TICKS = ['2026-08-16', '2026-09-01', '2026-09-15', '2026-10-04'];

/** Afasta os dois rótulos da borda direita quando os valores ficam muito próximos. */
function spread(ys) {
  const [upper, lower] = ys[0] <= ys[1] ? [0, 1] : [1, 0];
  const overlap = MIN_LABEL_GAP - (ys[lower] - ys[upper]);
  const placed = [...ys];
  if (overlap > 0) { placed[upper] -= overlap / 2; placed[lower] += overlap / 2; }
  return placed;
}

/**
 * Lula e Flávio em cada pesquisa (pontos) com a média móvel de 10 dias (linhas) e o resultado
 * das urnas marcado na borda direita.
 */
export function LinesChart({ rows, urna, base }) {
  const [ref, width] = useWidth();
  const [hoverDay, setHoverDay] = useState(null);
  const dated = useMemo(() => rows.filter(r => r.date), [rows]);
  const averages = useMemo(() => Object.fromEntries(SERIES.map(key => [key, movingAverage(dated, key, 10)])), [dated]);
  const height = width < 560 ? 250 : 290;

  let plot = null;
  if (width > 0 && dated.length) {
    const values = [...dated.flatMap(r => SERIES.map(k => r.shares[k])), ...SERIES.map(k => urna[k])];
    const min = Math.min(...values), max = Math.max(...values);
    const step = max - min > 16 ? 5 : 2;
    const low = Math.floor((min - 1) / step) * step, high = Math.ceil((max + 1) / step) * step;
    const ticks = [];
    for (let t = low; t <= high; t += step) ticks.push(t);
    const innerWidth = width - MARGIN.left - MARGIN.right, innerHeight = height - MARGIN.top - MARGIN.bottom;
    const x = day => MARGIN.left + (day / LAST_DAY) * innerWidth;
    const y = value => MARGIN.top + ((high - value) / (high - low)) * innerHeight;
    const labelYs = spread(SERIES.map(k => y(urna[k])));
    const focusAvg = hoverDay != null ? Object.fromEntries(SERIES.map(k => [k, averages[k].find(p => p.day === hoverDay)?.value])) : null;
    const pollsThatDay = hoverDay != null ? dated.filter(r => dayNumber(r.date) === hoverDay) : [];

    const nearestDay = clientX => {
      const left = ref.current.getBoundingClientRect().left;
      const day = Math.round(((clientX - left - MARGIN.left) / innerWidth) * LAST_DAY);
      return Math.max(0, Math.min(LAST_DAY, day));
    };
    const onKeyDown = event => {
      const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
      if (!step) return;
      event.preventDefault();
      setHoverDay(day => Math.max(0, Math.min(LAST_DAY, (day ?? LAST_DAY) + step)));
    };

    plot = html`
      <svg width=${width} height=${height} role="img" tabindex="0"
        aria-label=${`Percentual de Flávio e Lula em cada pesquisa (${base === 'totais' ? 'votos totais' : 'votos válidos'}), com a média móvel de 10 dias e o resultado das urnas. Use as setas para percorrer os dias.`}
        onPointerMove=${event => setHoverDay(nearestDay(event.clientX))} onPointerDown=${event => setHoverDay(nearestDay(event.clientX))}
        onPointerLeave=${event => { if (event.pointerType === 'mouse') setHoverDay(null); }}
        onKeyDown=${onKeyDown} onBlur=${() => setHoverDay(null)}>
        ${ticks.map(tick => html`<g key=${tick}>
          <line class="chart-grid" x1=${MARGIN.left} x2=${MARGIN.left + innerWidth} y1=${y(tick)} y2=${y(tick)}/>
          <text class="chart-tick" x=${MARGIN.left - 6} y=${y(tick)} dy="0.32em" text-anchor="end">${tick}%</text>
        </g>`)}
        ${X_TICKS.map((iso, i) => html`<text key=${iso} class="chart-tick" x=${x(dayNumber(iso))} y=${height - 8}
          text-anchor=${i === 0 ? 'start' : i === X_TICKS.length - 1 ? 'end' : 'middle'}>${shortDate(iso)}</text>`)}
        <line class="chart-election" x1=${x(LAST_DAY)} x2=${x(LAST_DAY)} y1=${MARGIN.top} y2=${MARGIN.top + innerHeight}/>
        ${hoverDay != null && html`<line class="chart-crosshair" x1=${x(hoverDay)} x2=${x(hoverDay)} y1=${MARGIN.top} y2=${MARGIN.top + innerHeight}/>`}

        ${SERIES.map(key => html`<g key=${'p' + key} class=${'poll-dots tone-' + CANDIDATES[key].tone}>
          ${dated.map(row => html`<circle key=${row.id} cx=${x(dayNumber(row.date))} cy=${y(row.shares[key])} r="3.5"/>`)}
        </g>`)}
        ${SERIES.map(key => html`<path key=${'l' + key} class=${'trend-line tone-' + CANDIDATES[key].tone}
          d=${averages[key].map((p, i) => `${i ? 'L' : 'M'}${x(p.day).toFixed(1)} ${y(p.value).toFixed(1)}`).join('')}/>`)}
        ${SERIES.map((key, i) => html`<g key=${'u' + key}>
          <path class=${'urna-mark tone-' + CANDIDATES[key].tone} d=${`M${x(LAST_DAY)} ${y(urna[key]) - 6}l6 6-6 6-6-6z`}/>
          <text class="trend-value" x=${x(LAST_DAY) + 12} y=${labelYs[i]} dy="0.32em">${CANDIDATES[key].short} ${pct(urna[key])}</text>
        </g>`)}
        ${focusAvg && SERIES.map(key => focusAvg[key] != null && html`<circle key=${'f' + key} class=${'trend-dot tone-' + CANDIDATES[key].tone} cx=${x(hoverDay)} cy=${y(focusAvg[key])} r="4.5"/>`)}
      </svg>
      ${hoverDay != null && html`<div class="chart-tooltip" style=${{ left: Math.max(0, Math.min(width - 236, x(hoverDay) + 12 > width - 236 ? x(hoverDay) - 248 : x(hoverDay) + 12)) + 'px', top: '4px' }}>
        <strong>${shortDate(isoFromDay(hoverDay))}</strong>
        ${SERIES.map(key => html`<p key=${key}><i class=${'line-key tone-' + CANDIDATES[key].tone}></i><b>${focusAvg[key] != null ? pct(focusAvg[key]) : '–'}</b> ${CANDIDATES[key].short} · média 10 dias</p>`)}
        ${pollsThatDay.length
          ? pollsThatDay.map(r => html`<span key=${r.id} class="muted">${r.inst}${r.poll.confirmada === false ? ' †' : ''}: Flávio ${pct(r.shares.F)} · Lula ${pct(r.shares.L)}</span>`)
          : html`<span class="muted">Nenhuma pesquisa divulgada neste dia</span>`}
      </div>`}`;
  }

  return html`<div>
    <ul class="chart-legend is-top">
      ${SERIES.map(key => html`<li key=${key}><i class=${'line-key tone-' + CANDIDATES[key].tone}></i>${CANDIDATES[key].name} (${CANDIDATES[key].party})</li>`)}
      <li><i class="dot-key is-hollow"></i>Pontos: pesquisas · linhas: média móvel de 10 dias</li>
      <li><i class="diamond-key"></i>Urnas</li>
    </ul>
    <div class="chart-plot" ref=${ref} style=${{ height: height + 'px' }}>${plot}</div>
  </div>`;
}
