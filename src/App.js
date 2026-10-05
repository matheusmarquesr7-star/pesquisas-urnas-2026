import { useEffect, useMemo, useState } from 'preact/hooks';
import { html } from './lib/html.js';
import { pct, shortDate } from './lib/format.js';
import {
  biggestMisses, highlights, instituteStats, mediaFinais, partyBias, presidentRows, ranking, resultShares, senateChecks,
} from './lib/metrics.js';
import { CANDIDATES, stateName } from './data/meta.js';
import { useHotkey } from './hooks/useHotkey.js';
import { useMediaQuery } from './hooks/useMediaQuery.js';
import { useRoute } from './hooks/useRoute.js';
import { useTheme } from './hooks/useTheme.js';
import { BrazilMap } from './map/BrazilMap.js';
import { Icon } from './components/Icon.js';
import { Methodology } from './components/Methodology.js';
import { SearchDialog } from './components/SearchDialog.js';
import { TopBar } from './components/TopBar.js';
import { leadText } from './components/GapChart.js';
import { PresidentLegend, PresidentMain, presidentPaint, PresidentScoreboard, PresidentSide } from './components/President.js';
import {
  senateLabel, SenateLegend, SenateNational, senatePaint, SenateScoreboard, SenateSide, SenateState, senateTooltip,
} from './components/Senate.js';
import {
  InstitutesLegend, institutesLabel, institutesPaint, InstitutesScoreboard, InstitutesSide, InstitutesTable, institutesTooltip,
} from './components/Institutes.js';

// Espelha styles/layout.css: três colunas quando largo, gaveta inferior quando estreito.
const WIDE_LAYOUT = '(min-width: 1440px)';
const SHEET_LAYOUT = '(max-width: 999px)';

function Footer({ onMethodology, data }) {
  return html`<footer class="panel-foot">
    <p><strong>Dados reais do 1º turno de 2026</strong>, reunidos a partir de veículos de imprensa; atualizado em ${shortDate(data.updated)}.</p>
    <p>${data.source === 'supabase' ? 'Dados lidos ao vivo do Supabase.' : 'Cópia dos dados embutida no site (Supabase indisponível agora).'}</p>
    <p><button class="link-button" onClick=${onMethodology}>Metodologia, fontes e divergências</button></p>
  </footer>`;
}

export function App({ geo, data }) {
  const { presidentResult, presidentPolls, senateResult, senatePolls, institutes: INSTITUTES, instituteSlug, instituteBySlug } = data;
  const slugs = useMemo(() => new Set(Object.values(instituteSlug)), [instituteSlug]);
  const route = useRoute(slugs);
  const [theme, toggleTheme] = useTheme();
  const [searching, setSearching] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tab, setTab] = useState('main');
  const wide = useMediaQuery(WIDE_LAYOUT), asSheet = useMediaQuery(SHEET_LAYOUT);
  const { view, base, uf } = route;
  const inst = route.inst ? instituteBySlug[route.inst] : null;

  // Derivados: tudo sai dos JSON + regras de src/lib/metrics.js.
  const urna = useMemo(() => resultShares(presidentResult, base), [base]);
  const rows = useMemo(() => presidentRows(presidentPolls, presidentResult, base), [base]);
  const excluded = useMemo(() => presidentPolls.filter(p => !rows.some(r => r.poll === p)), [rows]);
  const media = useMemo(() => mediaFinais(rows), [rows]);
  const rank = useMemo(() => ranking(rows), [rows]);
  const checks = useMemo(() => senateChecks(senatePolls, senateResult), []);
  const stats = useMemo(() => instituteStats(rows, checks, senatePolls, INSTITUTES), [rows, checks]);
  const bias = useMemo(() => partyBias(senatePolls, senateResult), []);
  const misses = useMemo(() => biggestMisses(senatePolls, senateResult, 6), []);
  const lines = useMemo(() => highlights(rows, stats, checks, bias), [rows, stats, checks, bias]);

  const nav = {
    ...route,
    openState: (code, target) => { route.openState(code, target); },
    openInstituteByName: name => route.openInstitute(instituteSlug[name]),
  };

  // Ao abrir uma UF ou um instituto, mostra o painel onde o detalhe aparece (e abre a gaveta no celular).
  const detailTab = view === 'presidente' ? 'side' : view === 'senado' ? 'main' : 'side';
  useEffect(() => {
    if (uf || inst) {
      setTab(detailTab);
      if (asSheet) setSheetOpen(true);
    }
  }, [uf, inst, view]);
  useEffect(() => { if (!uf && !inst) setTab('main'); }, [view]);
  useEffect(() => {
    const close = () => document.querySelectorAll('.main-column, .panel-body').forEach(el => el.scrollTo?.({ top: 0 }));
    addEventListener('route:navigate', close);
    return () => removeEventListener('route:navigate', close);
  }, []);

  useHotkey('/', event => { event.preventDefault(); setSearching(true); }, { enabled: !searching });
  useHotkey('Escape', () => {
    if (asSheet && sheetOpen) setSheetOpen(false);
    else route.back();
  }, { enabled: !searching });

  if (view === 'metodologia') {
    return html`<div class="app is-article">
      <${TopBar} route=${nav} theme=${theme} onToggleTheme=${toggleTheme} onSearch=${() => setSearching(true)}/>
      <main><${Methodology} result=${presidentResult} polls=${presidentPolls} onBack=${route.back} updated=${data.updated} source=${data.source}/></main>
      ${searching && html`<${SearchDialog} institutes=${INSTITUTES} pollsByUf=${senatePolls} onState=${code => nav.openState(code, 'senado')}
        onInstitute=${nav.openInstituteByName} onClose=${() => setSearching(false)}/>`}
    </div>`;
  }

  /* --------------------------------------------- conteúdo de cada tela */
  let board, main, side, map, tabs, stageTitle, legend;
  if (view === 'presidente') {
    board = html`<${PresidentScoreboard} result=${presidentResult} urna=${urna} media=${media} rows=${rows} base=${base}/>`;
    main = html`<${PresidentMain} rows=${rows} urna=${urna} media=${media} rank=${rank} excluded=${excluded} base=${base}/>`;
    side = html`<${PresidentSide} result=${presidentResult} route=${nav} theme=${theme}/>`;
    tabs = { main: 'Pesquisas', side: uf ? `UF: ${uf}` : 'Estados' };
    stageTitle = html`Presidente por UF <span>quem venceu e por quanto</span>`;
    legend = html`<${PresidentLegend} theme=${theme}/>`;
    map = {
      paint: presidentPaint(presidentResult, theme),
      label: code => {
        const r = presidentResult.ufs[code];
        return { value: r[r.vencedor] != null ? pct(r[r.vencedor], 0) : null, aria: `${stateName(code)}: ${r.vencedor === 'F' ? 'Flávio' : 'Lula'} venceu` };
      },
      tooltip: code => {
        const r = presidentResult.ufs[code];
        return { lines: [`Flávio ${pct(r.F, 2)} · Lula ${pct(r.L, 2)}`, r.F != null && r.L != null ? leadText(r.F - r.L) : `${CANDIDATES[r.vencedor].short} venceu`, ...(r.confianca === 'baixa' ? ['dado parcial ou incerto'] : [])] };
      },
      onState: code => nav.openState(code, 'presidente'),
      aria: 'Mapa do Brasil: vencedor para Presidente em cada UF',
    };
  } else if (view === 'senado') {
    board = html`<${SenateScoreboard} resultByUf=${senateResult} pollsByUf=${senatePolls} checks=${checks}/>`;
    main = uf
      ? html`<${SenateState} key=${uf} uf=${uf} ufResult=${senateResult[uf]} polls=${senatePolls[uf]} base=${base} route=${nav}/>`
      : html`<${SenateNational} resultByUf=${senateResult} stats=${stats} checks=${checks} misses=${misses} bias=${bias} route=${nav}/>`;
    side = html`<${SenateSide} resultByUf=${senateResult} pollsByUf=${senatePolls} checks=${checks} route=${nav} theme=${theme}/>`;
    tabs = { main: uf ? 'Resultado e pesquisas' : 'Resumo', side: 'Eleitos por UF' };
    stageTitle = html`Senado <span>as duas vagas de cada UF</span>`;
    legend = html`<${SenateLegend}/>`;
    map = {
      paint: senatePaint(senateResult, theme),
      label: senateLabel(senatePolls),
      tooltip: senateTooltip(senateResult, checks),
      onState: code => nav.openState(code, 'senado'),
      aria: 'Mapa do Brasil: partidos dos dois senadores eleitos em cada UF',
    };
  } else {
    board = html`<${InstitutesScoreboard} lines=${lines}/>`;
    main = html`<div class="insights"><${InstitutesTable} stats=${stats} selected=${inst} onSelect=${name => nav.openInstituteByName(name)} base=${base}/></div>`;
    side = html`<${InstitutesSide} stats=${stats} selected=${inst} rows=${rows} onSelect=${nav.openInstituteByName}
      onBack=${route.back} onState=${code => nav.openState(code, 'senado')}/>`;
    tabs = { main: 'Ranking', side: inst ? 'Detalhe' : 'Institutos' };
    stageTitle = html`${inst ?? 'Todos os institutos'} <span>acertou a dupla do Senado?</span>`;
    legend = html`<${InstitutesLegend} selected=${inst}/>`;
    map = {
      paint: institutesPaint(checks, inst, theme),
      label: institutesLabel(checks, inst),
      tooltip: institutesTooltip(checks, inst),
      onState: code => nav.openState(code, 'senado'),
      aria: inst ? `Mapa: onde ${inst} acertou a dupla do Senado` : 'Mapa: em que UFs os institutos acertaram a dupla do Senado',
    };
  }

  const current = wide ? null : tab;
  const footer = html`<${Footer} data=${data} onMethodology=${() => route.setView('metodologia')}/>`;

  return html`<div class="app">
    <${TopBar} route=${nav} theme=${theme} onToggleTheme=${toggleTheme} onSearch=${() => setSearching(true)}/>
    <main>
      ${board}
      <div class=${'workspace' + (wide ? ' is-wide' : '')}>
        <section class="stage" aria-label="Mapa">
          <div class="stage-head">
            <h2 class="stage-title">${stageTitle}</h2>
            ${(uf || inst) && html`<button class="back-button" onClick=${route.back} aria-label=${uf ? 'Voltar para o Brasil' : 'Voltar para todos os institutos'} title="Voltar (Esc)">
              <${Icon} name="left" size=${16}/>${uf ? 'Brasil' : 'Todos'}</button>`}
          </div>
          <div class="map-area">
            <${BrazilMap} geo=${geo} theme=${theme} paint=${map.paint} label=${map.label} tooltip=${map.tooltip}
              selected=${uf} onState=${map.onState} ariaLabel=${map.aria}/>
          </div>
          ${legend}
        </section>

        ${wide && html`<section class="main-column" aria-label=${tabs.main}>${main}</section>`}

        ${asSheet && sheetOpen && html`<div class="sheet-backdrop" onClick=${() => setSheetOpen(false)}></div>`}
        <aside class=${'panel' + (asSheet && sheetOpen ? ' is-open' : '')} aria-label=${wide ? tabs.side : 'Painel'}>
          ${asSheet && html`<button class="sheet-handle" aria-expanded=${sheetOpen} onClick=${() => setSheetOpen(open => !open)}>
            <span class="sheet-grip"></span>
            <b>${{ presidente: 'Presidente', senado: 'Senado', institutos: 'Institutos' }[view]}${uf ? ' · ' + stateName(uf) : inst ? ' · ' + inst : ''}</b>
            <span>${sheetOpen ? 'Fechar' : 'Abrir painel'}</span>
            <${Icon} name=${sheetOpen ? 'down' : 'up'} size=${16}/>
          </button>`}
          ${!wide && html`<div class="panel-tabs" role="tablist" aria-label="Conteúdo do painel">
            ${['main', 'side'].map(key => html`<button key=${key} role="tab" id=${'tab-' + key} aria-selected=${current === key}
              aria-controls="panel-body" onClick=${() => setTab(key)}>${tabs[key]}</button>`)}
          </div>`}
          <div class="panel-body" id="panel-body" role=${wide ? null : 'tabpanel'} aria-labelledby=${wide ? null : 'tab-' + current}
            inert=${asSheet && !sheetOpen}>
            ${wide || current === 'side' ? side : main}
            ${footer}
          </div>
        </aside>
      </div>
    </main>

    ${searching && html`<${SearchDialog} institutes=${INSTITUTES} pollsByUf=${senatePolls}
      onState=${code => nav.openState(code, view === 'presidente' ? 'presidente' : 'senado')}
      onInstitute=${nav.openInstituteByName} onClose=${() => setSearching(false)}/>`}
  </div>`;
}
