import { html } from '../lib/html.js';
import { Icon } from './Icon.js';

const TABS = [['presidente', 'Presidente'], ['senado', 'Senado'], ['institutos', 'Institutos']];

export function TopBar({ route, theme, onToggleTheme, onSearch }) {
  const nextTheme = theme === 'dark' ? 'claro' : 'escuro';
  return html`<header class="topbar">
    <div class="brand">
      <a class="brand-link" href="#presidente?base=${route.base}" onClick=${event => { event.preventDefault(); route.setView('presidente'); }}>
        <h1>Pesquisas <span aria-hidden="true">×</span><span class="sr-only">versus</span> Urnas</h1>
      </a>
      <span class="sim-chip" title="Eleições gerais de 4 de outubro de 2026, 1º turno">1º turno · 4/out/2026</span>
    </div>

    <nav class="office-tabs" aria-label="Seção">
      ${TABS.map(([key, label]) => html`<button key=${key} class="office-tab" aria-current=${route.view === key ? 'page' : null}
        onClick=${() => route.setView(key)}>${label}</button>`)}
    </nav>

    <div class="topbar-actions">
      <div class="segmented base-toggle" role="group" aria-label="Base de comparação">
        <button aria-pressed=${route.base === 'validos'} onClick=${() => route.setBase('validos')} title="Votos válidos: sem brancos, nulos e indecisos">Válidos</button>
        <button aria-pressed=${route.base === 'totais'} onClick=${() => route.setBase('totais')} title="Votos totais: inclui brancos, nulos e indecisos">Totais</button>
      </div>
      <button class="search-trigger" onClick=${onSearch} aria-label="Buscar UF ou instituto" aria-keyshortcuts="/">
        <${Icon} name="search" size=${16}/><span>Buscar</span><kbd>/</kbd>
      </button>
      <button class="icon-button" onClick=${() => route.setView('metodologia')} aria-label="Metodologia" title="Metodologia">
        <${Icon} name="book"/>
      </button>
      <button class="icon-button" onClick=${onToggleTheme} aria-label=${`Mudar para o tema ${nextTheme}`} title=${`Tema ${nextTheme}`}>
        <${Icon} name=${theme === 'dark' ? 'sun' : 'moon'}/>
      </button>
    </div>
  </header>`;
}
