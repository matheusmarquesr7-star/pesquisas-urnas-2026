// Acontecimentos da campanha (src/data/eventos.json): marcas numeradas nos gráficos e a linha do tempo.
import { html } from '../lib/html.js';
import { shortDate } from '../lib/format.js';
import { dayNumber } from '../lib/metrics.js';
import EVENTS from '../data/eventos.json';

export const TEMAS = { campanha: 'Campanha', debate: 'Debate', master: 'Caso Master', bets: 'Bets', justica: 'Justiça' };

/** Eventos em ordem de data, numerados a partir de 1 (o número aparece nos gráficos e na linha do tempo). */
export const events = [...EVENTS].sort((a, b) => a.data.localeCompare(b.data)).map((event, i) => ({ ...event, n: i + 1 }));

/**
 * Linhas tracejadas nas datas dos acontecimentos, com o número no topo. Eventos no mesmo dia
 * dividem a linha e os números ficam lado a lado.
 */
export function EventMarks({ x, top, bottom, active }) {
  const byDay = new Map();
  for (const event of events) byDay.set(event.data, [...(byDay.get(event.data) ?? []), event]);
  return html`<g class="event-marks" aria-hidden="true">${[...byDay.entries()].map(([iso, list]) => {
    const cx = x(dayNumber(iso));
    const strong = list.some(e => e.n === active);
    return html`<g key=${iso} class=${'event-mark' + (strong ? ' is-active' : '')}>
      <line x1=${cx} x2=${cx} y1=${top} y2=${bottom}/>
      ${list.map((event, i) => {
        const bx = cx + (i - (list.length - 1) / 2) * 15;
        return html`<g key=${event.n}><title>${`${event.n}. ${shortDate(event.data)}: ${event.titulo}`}</title>
          <circle cx=${bx} cy=${top - 8} r="7"/><text x=${bx} y=${top - 8} dy="0.34em" text-anchor="middle">${event.n}</text></g>`;
      })}
    </g>`;
  })}</g>`;
}

/** Item de legenda que explica as marcas numeradas. */
export const EventKey = () => html`<li><i class="event-key">1</i>Acontecimento (veja a linha do tempo)</li>`;

/** Linha do tempo: um item por acontecimento, com tema, resumo e fonte. `onPick` escolhe o evento. */
export function Timeline({ active, onPick }) {
  return html`<ol class="timeline">${events.map(event => html`<li key=${event.n} class=${event.n === active ? 'is-active' : ''}>
    <button class="timeline-pick" onClick=${() => onPick(event)} aria-pressed=${event.n === active}
      aria-label=${`${shortDate(event.data)}: ${event.titulo}. Comparar a primeira pesquisa depois disso com as urnas.`}>
      <span class="event-key">${event.n}</span>
      <span class="timeline-text">
        <small><time>${shortDate(event.data)}</time> · <span class=${'tema tema-' + event.tema}>${TEMAS[event.tema] ?? event.tema}</span></small>
        <b>${event.titulo}</b>
        <span class="timeline-summary">${event.resumo}</span>
      </span>
    </button>
    <a class="timeline-source" href=${event.fonte} target="_blank" rel="noopener">fonte</a>
  </li>`)}</ol>`;
}
