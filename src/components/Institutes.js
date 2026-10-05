import { useState } from 'preact/hooks';
import { html } from '../lib/html.js';
import { num, pct, pp, shortDate } from '../lib/format.js';
import { stateName, UFS } from '../data/meta.js';
import { statusColor } from '../map/colors.js';
import { leadText } from './GapChart.js';
import { BackButton, BaseBadge, DuplaBadge, InlineBar, OrderBadge, SectionHead } from './ui.js';

const STATUS = acertos => ['bad', 'warn', 'good'][acertos];

/* ---------------------------------------------------------------- Destaques */

function sentence(line) {
  switch (line.kind) {
    case 'best': return html`<b>${line.inst}</b> foi quem mais acertou a eleição presidencial: errou a distância entre Flávio e Lula por ${pp(line.value, 2)} (${leadText(line.row.distancia)}).`;
    case 'worst': return html`<b>${line.inst}</b> foi quem mais errou entre as pesquisas finais: ${pp(line.value, 2)} na distância (${leadText(line.row.distancia)}, contra ${leadText(line.row.distancia - line.row.vies, 2)} nas urnas).`;
    case 'order': return line.wrong.length
      ? html`<b>${line.wrong.length} de ${line.total}</b> pesquisas finais puseram o candidato errado em 1º: ${line.wrong.join(', ')}.`
      : html`Todas as ${line.total} pesquisas finais acertaram quem ficou em 1º.`;
    case 'bias': return html`Em média, as pesquisas finais <b>${line.value < 0 ? 'subestimaram Flávio (PL)' : 'subestimaram Lula (PT)'}</b> em ${pp(Math.abs(line.value), 1)} na distância entre os dois.`;
    case 'senate': return html`No Senado, a última pesquisa de cada instituto acertou a dupla eleita em <b>${line.hits} de ${line.total}</b> checagens (${pct(line.hits / line.total * 100, 0)}).`;
    case 'senateBest': return html`Entre institutos com 3+ UFs checadas, <b>${line.stat.inst}</b> acertou a dupla em ${pct(line.stat.taxaDupla * 100, 0)} das UFs; ${line.worst.inst}, em ${pct(line.worst.taxaDupla * 100, 0)}.`;
    case 'partyBias': return html`Em votos válidos, candidatos do <b>PL</b> ficaram em média ${pp(line.pl.media, 1, true)} em relação às urnas (${line.pl.n} medições); os do <b>PT</b>, ${pp(line.pt.media, 1, true)} (${line.pt.n}).`;
    default: return null;
  }
}

export function InstitutesScoreboard({ lines }) {
  const tone = { best: 'good', worst: 'bad', order: 'bad', bias: 'warn', senate: 'warn', senateBest: 'good', partyBias: 'warn' };
  return html`<section class="scoreboard" aria-label="Destaques calculados a partir dos dados">
    <h2 class="board-title">Institutos <span>· destaques calculados a partir dos dados</span></h2>
    <ul class="highlights">${lines.map(line => html`<li key=${line.kind} class=${'is-' + tone[line.kind]}>${sentence(line)}</li>`)}</ul>
  </section>`;
}

/* ---------------------------------------------------------------- Tabela */

const COLUMNS = {
  erroUltima: { label: 'Erro dist. (última)', value: s => s.erroDistanciaUltima },
  erroMedio: { label: 'Erro dist. (média)', value: s => s.erroDistanciaMedio },
  dupla: { label: 'Dupla certa', value: s => s.taxaDupla == null ? null : -s.taxaDupla },
  nome: { label: 'Instituto', value: s => s.inst },
};

export function InstitutesTable({ stats, selected, onSelect, base }) {
  const [sort, setSort] = useState('erroUltima');
  const by = COLUMNS[sort].value;
  const rows = [...stats].sort((a, b) => {
    const va = by(a), vb = by(b);
    if (va == null && vb == null) return a.inst.localeCompare(b.inst, 'pt-BR');
    if (va == null) return 1;
    if (vb == null) return -1;
    return typeof va === 'string' ? va.localeCompare(vb, 'pt-BR') : va - vb;
  });
  const max = Math.max(...stats.map(s => s.erroDistanciaUltima ?? 0), 1);
  return html`<section class="insight" aria-labelledby="tabela-institutos">
    <${SectionHead} id="tabela-institutos" title="Presidente + Senado por instituto">
      <div class="segmented" role="group" aria-label="Ordenar institutos">
        ${Object.entries(COLUMNS).map(([key, { label }]) => html`<button key=${key} aria-pressed=${sort === key} onClick=${() => setSort(key)}>${label}</button>`)}
      </div>
    <//>
    <div class="table-scroll" tabindex="0" role="region" aria-labelledby="tabela-institutos">
      <table class="data-table">
        <thead><tr>
          <th scope="col">Instituto</th>
          <th scope="col" class="num" title="Pesquisas de Presidente / de Senado">Pesq.</th>
          <th scope="col" class="num">Erro dist. (última)</th>
          <th scope="col" class="num">Erro dist. (média)</th>
          <th scope="col" class="num" title="Média de (F − L) da pesquisa − (F − L) das urnas; negativo = subestimou Flávio">Viés</th>
          <th scope="col" class="num">UFs</th>
          <th scope="col" title="Acertos da dupla no Senado: 2/2 · 1/2 · 0/2">Acertos<small>2/2 · 1/2 · 0/2</small></th>
          <th scope="col" class="num">Dupla certa</th>
        </tr></thead>
        <tbody>${rows.map(s => html`<tr key=${s.inst} class=${selected === s.inst ? 'is-selected' : ''}>
          <th scope="row"><button class="link-button" onClick=${() => onSelect(s.inst)} aria-pressed=${selected === s.inst}>${s.inst}</button></th>
          <td class="num nowrap">${s.presidente} / ${s.senado}</td>
          <td class="num">${s.erroDistanciaUltima != null
            ? html`<span class="bar-cell"><${InlineBar} value=${s.erroDistanciaUltima} max=${max}/><b>${num(s.erroDistanciaUltima, 2)}</b></span><small>${shortDate(s.ultima.date)}</small>`
            : html`<span class="muted">–</span>`}</td>
          <td class="num">${s.erroDistanciaMedio != null ? num(s.erroDistanciaMedio, 2) : html`<span class="muted">–</span>`}</td>
          <td class="num nowrap">${s.viesMedio != null ? pp(s.viesMedio, 1, true).replace(' pp', '') : html`<span class="muted">–</span>`}</td>
          <td class="num">${s.ufs || html`<span class="muted">0</span>`}</td>
          <td class="nowrap">${s.ufs ? html`<span class="hits">
            <span class="good-text">${s.acertos[2]}</span> · <span class="warn-text">${s.acertos[1]}</span> · <span class="bad-text">${s.acertos[0]}</span>${s.acertos.na ? html` <small class="muted inline" title="UFs em que só o líder foi divulgado">+${s.acertos.na}</small>` : ''}
          </span>` : html`<span class="muted">–</span>`}</td>
          <td class="num"><b>${s.taxaDupla != null ? pct(s.taxaDupla * 100, 0) : '–'}</b></td>
        </tr>`)}</tbody>
      </table>
    </div>
    <p class="note">Presidente na base de ${base === 'totais' ? 'votos totais' : 'votos válidos'}; erros em pontos percentuais. Viés negativo: o instituto subestimou Flávio em relação a Lula. Senado: última pesquisa do instituto em cada UF.</p>
  </section>`;
}

/* ---------------------------------------------------------------- Detalhe */

export function InstituteDetail({ stat, rows, onBack, onState }) {
  const mine = rows.filter(r => r.inst === stat.inst).sort((a, b) => b.date.localeCompare(a.date));
  return html`<div class="state-detail">
    <header class="place-header">
      <div class="place-header-nav"><${BackButton} to="Todos os institutos" onClick=${onBack}/></div>
      <h2>${stat.inst}</h2>
      <p>${stat.presidente} pesquisas de Presidente · ${stat.senado} de Senado</p>
    </header>
    <section class="panel-section">
      <${SectionHead} title="Presidente"/>
      ${mine.length ? html`<ul class="poll-list">${mine.map(r => html`<li key=${r.id}>
        <time>${shortDate(r.date)}${r.poll.aprox ? ' ≈' : ''}</time>
        <span>F ${num(r.shares.F)} · L ${num(r.shares.L)}<small>${leadText(r.distancia)}</small></span>
        <${OrderBadge} value=${r.ordem}/>
        <b title="Erro na distância">${num(r.erroDistancia, 2)}</b>
      </li>`)}</ul>` : html`<p class="empty">Sem pesquisas presidenciais nesta base.</p>`}
    </section>
    <section class="panel-section">
      <${SectionHead} title="Senado"><span class="section-count">última pesquisa em cada UF</span><//>
      ${stat.checks.length ? html`<ul class="poll-list">${[...stat.checks].sort((a, b) => a.uf.localeCompare(b.uf)).map(c => html`<li key=${c.uf}>
        <button class="link-button" onClick=${() => onState(c.uf)}>${c.uf}</button>
        <span>${stateName(c.uf)}<small>${shortDate(c.poll.div)} · <${BaseBadge} base=${c.poll.base}/></small></span>
        <${DuplaBadge} dupla=${c.dupla}/>
        <b title="Erro médio por candidato (só votos válidos)">${c.erro != null ? num(c.erro, 1) : '–'}</b>
      </li>`)}</ul>` : html`<p class="empty">Sem pesquisas de Senado reunidas.</p>`}
    </section>
  </div>`;
}

export function InstitutesSide({ stats, selected, rows, onSelect, onBack, onState }) {
  const stat = stats.find(s => s.inst === selected);
  if (stat) return html`<${InstituteDetail} key=${stat.inst} stat=${stat} rows=${rows} onBack=${onBack} onState=${onState}/>`;
  const sorted = [...stats].sort((a, b) => a.inst.localeCompare(b.inst, 'pt-BR'));
  return html`<section class="panel-section">
    <${SectionHead} title="Escolha um instituto"><span class="section-count">${stats.length}</span><//>
    <p class="note">O mapa mostra, em cada UF, se a última pesquisa de Senado do instituto acertou a dupla eleita.</p>
    <ul class="place-list">${sorted.map(s => html`<li key=${s.inst}>
      <button class="place-row inst-row" onClick=${() => onSelect(s.inst)}>
        <span class="place-name"><strong>${s.inst}</strong><small>${s.presidente} pres. · ${s.senado} Senado${s.ufs ? ` · ${s.ufs} UFs` : ''}</small></span>
        <span class="mini-badges" aria-hidden="true">${s.checks.map(c => html`<i key=${c.uf} class=${'mini is-' + (c.dupla.avaliavel ? STATUS(c.dupla.acertos) : 'na')}></i>`)}</span>
      </button>
    </li>`)}</ul>
  </section>`;
}

/* ---------------------------------------------------------------- Mapa */

/** Sem instituto escolhido: verde se todos acertaram a dupla, vermelho se nenhum, amarelo se misto. */
export const institutesPaint = (checks, selected, theme) => uf => {
  const list = checks.filter(c => c.uf === uf && c.dupla.avaliavel && (!selected || c.inst === selected));
  if (!list.length) return null;
  if (selected) return { fill: statusColor(theme, STATUS(list[0].dupla.acertos)) };
  const perfect = list.filter(c => c.dupla.acertos === 2).length;
  return { fill: statusColor(theme, perfect === list.length ? 'good' : perfect === 0 ? 'bad' : 'warn') };
};

export const institutesLabel = (checks, selected) => uf => {
  const list = checks.filter(c => c.uf === uf && c.dupla.avaliavel && (!selected || c.inst === selected));
  const perfect = list.filter(c => c.dupla.acertos === 2).length;
  const value = !list.length ? null : selected ? `${list[0].dupla.acertos}/2` : `${perfect}/${list.length}`;
  return { value, aria: `${stateName(uf)}: ${!list.length ? 'sem checagem' : selected ? `${list[0].dupla.acertos} de 2 eleitos acertados` : `${perfect} de ${list.length} institutos acertaram a dupla`}` };
};

export const institutesTooltip = (checks, selected) => uf => {
  const list = checks.filter(c => c.uf === uf && (!selected || c.inst === selected));
  return { title: stateName(uf), lines: list.length ? list.map(c => `${c.inst}: ${c.dupla.avaliavel ? c.dupla.acertos + '/2' : 'só líder'}`) : ['Sem pesquisas reunidas'] };
};

export function InstitutesLegend({ selected }) {
  return html`<div class="legend">
    <span class="legend-side"><i class="swatch is-good"></i>${selected ? 'Acertou 2/2' : 'Todos acertaram a dupla'}</span>
    <span class="legend-side"><i class="swatch is-warn"></i>${selected ? 'Acertou 1/2' : 'Resultado misto'}</span>
    <span class="legend-side"><i class="swatch is-bad"></i>${selected ? 'Errou os dois' : 'Ninguém acertou a dupla'}</span>
    <span class="legend-scale">sem cor: sem pesquisa avaliável${selected ? ` de ${selected}` : ''}</span>
  </div>`;
}

export const coverage = checks => UFS.filter(uf => checks.some(c => c.uf === uf)).length;
