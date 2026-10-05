import { html } from '../lib/html.js';

const PATHS = {
  search: html`<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>`,
  close: html`<path d="m6 6 12 12M6 18 18 6"/>`,
  left: html`<path d="m14 5-7 7 7 7"/>`,
  right: html`<path d="m10 5 7 7-7 7"/>`,
  up: html`<path d="m5 14 7-7 7 7"/>`,
  down: html`<path d="m5 10 7 7 7-7"/>`,
  sun: html`<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4"/>`,
  moon: html`<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>`,
  check: html`<path d="m5 12.5 4.5 4.5L19 7.5"/>`,
  half: html`<circle cx="12" cy="12" r="7.5"/><path d="M12 4.5v15" /><path d="M12 4.5a7.5 7.5 0 0 1 0 15Z" fill="currentColor" stroke="none"/>`,
  cross: html`<path d="m7 7 10 10M7 17 17 7"/>`,
  dash: html`<path d="M6 12h12"/>`,
  info: html`<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.6v.1"/>`,
  book: html`<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5Zm0 0v15M8 7h8"/>`,
  external: html`<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>`,
};

export function Icon({ name, size = 18 }) {
  return html`<svg class="icon" width=${size} height=${size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name]}</svg>`;
}
