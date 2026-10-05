import { useMemo, useState } from 'preact/hooks';
import { html } from '../lib/html.js';
import { int, num, pct, pp, shortDate } from '../lib/format.js';
import { FINAL_WEEK, distancia } from '../lib/metrics.js';
import { CANDIDATES, MINOR, STATES, stateName, UFS } from '../data/meta.js';
import { inkOn, marginColor } from '../map/colors.js';
import { GapChart, leadText } from './GapChart.js';
import { LinesChart } from './LinesChart.js';
import { Icon } from './Icon.js';
import { Avatar, BackButton, DuelBar, InlineBar, OrderBadge, SectionHead } from './ui.js';

const baseLabel = base => base === 'totais' ? 'votos totais' : 'votos válidos';
const list = names => names.length > 1 ? `${names.slice(0, -1).join(', ')} e ${names.at(-1)}` : names[0] ?? '';

/* ---------------------------------------------------------------- Placar */

function Contender({ id, result, urna, media, base }) {
  const candidate = CANDIDATES[id];
  const row = result.candidatos.find(c => c.id === id);
  const won = distancia(urna) > 0 ? id === 'F' : id === 'L';
  const deviation = media ? media.shares[id] - urna[id] : null;
  return html`<div class=${'contender tone-' + candidate.tone}>
    <${Avatar} name=${candidate.name} tone=${candidate.tone}/>
    <div class="contender-id">
      <strong>${candidate.name}</strong>
      <span><b class="party">${candidate.party}</b>${won && html`<em class="lead-mark">1º lugar</em>`}</span>
    </div>
    <div class="contender-score">
      <b>${pct(urna[id], 2)}</b>
      <span>${base === 'totais' ? 'dos votos totais' : int(row.votos) + ' votos'}</span>
      ${media && html`<span class="poll-average" title="Média simples das últimas pesquisas de cada instituto divulgadas na semana da eleição">
        Pesquisas finais: <b>${pct(media.shares[id])}</b> <i class=${deviation < 0 ? 'is-under' : 'is-over'}>(${pp(deviation, 1, true)})</i>
      </span>`}
    </div>
  </div>`;
}

export function PresidentScoreboard({ result, urna, media, rows, base }) {
  const gap = distancia(urna);
  const finals = media?.rows ?? [];
  const wrong = finals.filter(r => r.ordem !== 'certa').map(r => r.inst);
  const avgGap = media ? distancia(media.shares) : null;
  return html`<section class="scoreboard" aria-label="Presidente: resultado e pesquisas finais">
    <div class="duel">
      <${Contender} id="F" result=${result} urna=${urna} media=${media} base=${base}/>
      <${Contender} id="L" result=${result} urna=${urna} media=${media} base=${base}/>
    </div>
    <${DuelBar} F=${urna.F} L=${urna.L} marker=${true}/>
    <div class="scoreboard-foot">
      <h2>Presidente<span> · 1º turno · ${result.apurado}% apurado · ${baseLabel(base)}</span></h2>
      <p class="outlook">
        <b>${gap > 0 ? 'Flávio' : 'Lula'} venceu por ${pp(Math.abs(gap), 2)}.</b>
        ${' '}${media && html`A média das pesquisas finais dava <b>${leadText(avgGap)}</b>${wrong.length ? html`, e ${wrong.length} de ${finals.length} apontavam o vencedor errado` : ''}.`}
      </p>
      <p class="counting"><span>2º turno em 25/out</span><span>${rows.length} pesquisas</span></p>
    </div>
  </section>`;
}

/* ---------------------------------------------------------------- Resumo dos erros */

export function ErrorSummary({ rows, media }) {
  const finals = [...(media?.rows ?? [])].sort((a, b) => a.erroDistancia - b.erroDistancia);
  if (!finals.length) return html`<p class="empty">Nenhuma pesquisa da semana da eleição tem dados nesta base.</p>`;
  const wrong = finals.filter(r => r.ordem !== 'certa');
  const meanError = finals.reduce((s, r) => s + r.erroDistancia, 0) / finals.length;
  const meanBias = finals.reduce((s, r) => s + r.vies, 0) / finals.length;
  const best = finals[0], worst = finals.at(-1);
  return html`<section class="insight" aria-labelledby="resumo-erros">
    <${SectionHead} id="resumo-erros" title="Resumo dos erros">
      <span class="section-count">últimas pesquisas de ${finals.length} institutos (desde ${shortDate(FINAL_WEEK)})</span>
    <//>
    <dl class="tiles">
      <div class=${'tile' + (wrong.length ? ' is-alert' : '')}>
        <dt>Erraram quem ficou em 1º</dt>
        <dd><b>${wrong.length} de ${finals.length}</b><small>${wrong.length ? list(wrong.map(r => r.inst)) + ' puseram Lula à frente' : 'todas acertaram'}</small></dd>
      </div>
      <div class="tile">
        <dt>Erro médio na distância</dt>
        <dd><b>${pp(meanError, 1)}</b><small>viés: ${meanBias < 0 ? 'subestimaram Flávio' : 'subestimaram Lula'} em ${pp(Math.abs(meanBias), 1)}</small></dd>
      </div>
      <div class="tile is-good">
        <dt>Mais perto</dt>
        <dd><b>${best.inst}</b><small>erro de ${pp(best.erroDistancia, 2)} · ${leadText(best.distancia)}</small></dd>
      </div>
      <div class="tile is-bad">
        <dt>Mais longe</dt>
        <dd><b>${worst.inst}</b><small>erro de ${pp(worst.erroDistancia, 2)} · ${leadText(worst.distancia)}</small></dd>
      </div>
    </dl>
  </section>`;
}

/* ---------------------------------------------------------------- Ranking da véspera */

export function RankingTable({ rank }) {
  const max = Math.max(...rank.map(r => r.erroDistancia), 1);
  return html`<section class="insight" aria-labelledby="ranking">
    <${SectionHead} id="ranking" title="Ranking da véspera"><span class="section-count">última pesquisa de cada instituto</span><//>
    <div class="table-scroll" tabindex="0" role="region" aria-labelledby="ranking">
      <table class="data-table">
        <thead><tr>
          <th scope="col">#</th><th scope="col">Instituto</th>
          <th scope="col" class="num">Flávio</th><th scope="col" class="num">Lula</th>
          <th scope="col" class="num">Distância</th><th scope="col">Ordem</th>
          <th scope="col" class="num">Erro na distância</th><th scope="col" class="num">Erro médio</th>
        </tr></thead>
        <tbody>${rank.map((row, i) => html`<tr key=${row.inst} class=${row.date < FINAL_WEEK ? 'is-stale' : ''}>
          <td class="num muted">${i + 1}</td>
          <th scope="row"><span class="cell-title">${row.inst}</span><small>${shortDate(row.date)}${row.poll.aprox ? ' ≈' : ''}${row.date < FINAL_WEEK ? ' · antiga' : ''}</small></th>
          <td class="num">${num(row.shares.F)}${row.recalculado && html`<sup>*</sup>`}</td>
          <td class="num">${num(row.shares.L)}${row.recalculado && html`<sup>*</sup>`}</td>
          <td class="num nowrap">${leadText(row.distancia)}</td>
          <td><${OrderBadge} value=${row.ordem}/></td>
          <td class="num"><span class="bar-cell"><${InlineBar} value=${row.erroDistancia} max=${max}/><b>${num(row.erroDistancia, 2)}</b></span></td>
          <td class="num">${num(row.erroMedio, 2)}</td>
        </tr>`)}</tbody>
      </table>
    </div>
    <p class="note">Erros em pontos percentuais. Distância = Flávio − Lula. Linhas esmaecidas: o instituto não divulgou pesquisa na semana da eleição. * válidos recalculados a partir dos votos totais.</p>
  </section>`;
}

/* ---------------------------------------------------------------- Tabela completa */

export function PollTable({ rows, excluded, base }) {
  const sorted = [...rows].sort((a, b) => b.date.localeCompare(a.date) || a.inst.localeCompare(b.inst));
  const cell = (row, key) => row.shares[key] == null ? html`<span class="muted">–</span>` : html`${num(row.shares[key])}${row.recalculado && html`<sup>*</sup>`}`;
  return html`<section class="insight" aria-labelledby="todas">
    <${SectionHead} id="todas" title="Todas as pesquisas"><span class="section-count">${rows.length} em ${baseLabel(base)}</span><//>
    <div class="table-scroll" tabindex="0" role="region" aria-labelledby="todas" id="tabela-pesquisas">
      <table class="data-table is-dense">
        <thead><tr>
          <th scope="col">Divulgação</th><th scope="col">Instituto e campo</th>
          <th scope="col" class="num">Flávio</th><th scope="col" class="num">Lula</th>
          ${MINOR.map(key => html`<th key=${key} scope="col" class="num">${CANDIDATES[key].short}</th>`)}
          ${base === 'totais' && html`<th scope="col" class="num" title="Brancos, nulos e indecisos">B/N/I</th>`}
          <th scope="col" class="num">Distância</th><th scope="col" class="num">Erro dist.</th>
        </tr></thead>
        <tbody>${sorted.map(row => html`<tr key=${row.id}>
          <td class="nowrap">${shortDate(row.date)}${row.poll.aprox && html`<span title="Data de divulgação aproximada (fim do campo + 2 dias)"> ≈</span>`}</td>
          <th scope="row"><span class="cell-title">${row.inst}</span><small>campo ${row.poll.campo ?? 'n/e'}</small></th>
          <td class="num">${cell(row, 'F')}</td><td class="num">${cell(row, 'L')}</td>
          ${MINOR.map(key => html`<td key=${key} class="num">${cell(row, key)}</td>`)}
          ${base === 'totais' && html`<td class="num">${row.poll.nv != null ? num(row.poll.nv) : html`<span class="muted">–</span>`}</td>`}
          <td class="num nowrap">${leadText(row.distancia)}</td>
          <td class="num"><b>${num(row.erroDistancia, 2)}</b></td>
        </tr>`)}</tbody>
      </table>
    </div>
    <p class="note">* válidos recalculados: v = t × 100 / (100 − brancos, nulos e indecisos). ≈ data de divulgação aproximada.
      ${excluded.length > 0 && html` Fora desta base: ${excluded.map(p => `${p.inst} (${shortDate(p.divulgacao)})`).join(', ')}${base === 'totais' ? ', que só divulgaram votos válidos.' : ', sem brancos/nulos divulgados para recalcular.'}`}</p>
  </section>`;
}

/* ---------------------------------------------------------------- Coluna central */

export function PresidentMain({ rows, urna, media, rank, excluded, base }) {
  const [highlight, setHighlight] = useState(null);
  return html`<div class="insights">
    <${ErrorSummary} rows=${rows} media=${media}/>
    <section class="insight" aria-labelledby="distancia">
      <${SectionHead} id="distancia" title="Distância Flávio − Lula ao longo da campanha"><span class="section-count">${baseLabel(base)}</span><//>
      <${GapChart} rows=${rows} urna=${urna} highlight=${highlight} onHighlight=${setHighlight} describedBy="tabela-pesquisas"/>
    </section>
    <section class="insight" aria-labelledby="linhas">
      <${SectionHead} id="linhas" title="Lula e Flávio em cada pesquisa"><span class="section-count">${baseLabel(base)}</span><//>
      <${LinesChart} rows=${rows} urna=${urna} base=${base}/>
    </section>
    <${RankingTable} rank=${rank}/>
    <${PollTable} rows=${rows} excluded=${excluded} base=${base}/>
  </div>`;
}

/* ---------------------------------------------------------------- UFs */

export const presidentPaint = (result, theme) => uf => {
  const r = result.ufs[uf];
  if (!r) return null;
  const margin = r.F != null && r.L != null ? Math.abs(r.F - r.L) : 10;
  return { fill: marginColor(theme, r.vencedor === 'F' ? 'blue' : 'red', margin) };
};

const ufLead = r => r.F != null && r.L != null ? leadText(r.F - r.L) : `${r.vencedor === 'F' ? 'Flávio' : 'Lula'} venceu`;

function StateRow({ uf, r, theme, selected, onClick }) {
  const color = presidentPaint({ ufs: { [uf]: r } }, theme)(uf).fill;
  const winner = r.vencedor;
  return html`<button class="place-row" onClick=${onClick} aria-pressed=${selected} aria-label=${`${stateName(uf)}: ${ufLead(r)}`}>
    <span class="place-tag" style=${{ background: color, color: inkOn(color) }}>${uf}</span>
    <span class="place-name"><strong>${stateName(uf)}</strong><small>${ufLead(r)}${r.confianca === 'baixa' ? ' · parcial/incerto' : ''}</small></span>
    <${DuelBar} F=${r.F} L=${r.L}/>
    <b class=${'place-lead tone-' + CANDIDATES[winner].tone}>${pct(r[winner], 0)}</b>
  </button>`;
}

const SORTS = {
  nome: { label: 'A–Z', compare: (a, b) => stateName(a).localeCompare(stateName(b), 'pt-BR') },
  disputa: { label: 'Mais apertados', compare: (a, b, ufs) => Math.abs((ufs[a].F ?? 99) - (ufs[a].L ?? 0)) - Math.abs((ufs[b].F ?? 99) - (ufs[b].L ?? 0)) },
};

function StateDetail({ uf, result, route }) {
  const r = result.ufs[uf];
  const index = UFS.indexOf(uf);
  const step = offset => route.openState(UFS[(index + offset + UFS.length) % UFS.length], 'presidente');
  const national = Object.fromEntries(result.candidatos.map(c => [c.id, c.validos]));
  const others = MINOR.filter(key => r[key] != null);
  return html`<div class="state-detail">
    <header class="place-header">
      <div class="place-header-nav">
        <${BackButton} to="Brasil" onClick=${route.back}/>
        <div class="stepper" role="group" aria-label="Trocar de UF">
          <button onClick=${() => step(-1)} aria-label="UF anterior"><${Icon} name="left" size=${16}/></button>
          <span>Outra UF</span>
          <button onClick=${() => step(1)} aria-label="Próxima UF"><${Icon} name="right" size=${16}/></button>
        </div>
      </div>
      <h2>${stateName(uf)}</h2>
      <p>${STATES[uf][1]} · Presidente, votos válidos</p>
    </header>
    <section class="panel-section">
      <ul class="zone-shares">${['F', 'L'].map(id => html`<li key=${id}>
        <i class=${'swatch tone-' + CANDIDATES[id].tone}></i><span>${CANDIDATES[id].name}</span>
        <b>${r[id] != null ? pct(r[id], 2) : 'n/d'}</b>
        <small>${r.votos?.[id] ? int(r.votos[id]) + ' votos' : ''}</small>
      </li>`)}
      ${others.map(id => html`<li key=${id} class="is-minor"><i class="swatch tone-other"></i><span>${CANDIDATES[id].name}</span><b>${pct(r[id], 2)}</b><small></small></li>`)}
      </ul>
      <div class="zone-shares-bar"><${DuelBar} F=${r.F} L=${r.L} marker=${true}/></div>
      <ul class="compare">
        <li><span>${stateName(uf)}</span><${DuelBar} F=${r.F} L=${r.L}/><span class="compare-shares"><b class="tone-blue">${pct(r.F)}</b><b class="tone-red">${pct(r.L)}</b></span></li>
        <li><span>Brasil</span><${DuelBar} F=${national.F} L=${national.L}/><span class="compare-shares"><b class="tone-blue">${pct(national.F)}</b><b class="tone-red">${pct(national.L)}</b></span></li>
      </ul>
    </section>
    <section class="panel-section">
      <dl class="facts">
        <div><dt>Apuração</dt><dd>${r.apuracao ?? 'final (100%)'}</dd></div>
        <div><dt>Confiança no dado</dt><dd>${r.confianca}</dd></div>
        ${r.obs && html`<div><dt>Observação</dt><dd>${r.obs}</dd></div>`}
        <div><dt>Fonte</dt><dd class="source">${r.fonte}</dd></div>
      </dl>
      <p class="note">Não há pesquisas presidenciais estaduais reunidas aqui: o comparativo de pesquisas é nacional.</p>
    </section>
  </div>`;
}

export function PresidentSide({ result, route, theme }) {
  const [sort, setSort] = useState('nome');
  const ufs = result.ufs;
  const ordered = useMemo(() => [...UFS].sort((a, b) => SORTS[sort].compare(a, b, ufs)), [sort, ufs]);
  const tally = { F: UFS.filter(uf => ufs[uf].vencedor === 'F').length, L: UFS.filter(uf => ufs[uf].vencedor === 'L').length };
  return html`
    ${route.uf && html`<${StateDetail} key=${route.uf} uf=${route.uf} result=${result} route=${route}/>`}
    <section class="panel-section">
      <${SectionHead} title="Resultado por UF">
        <div class="segmented" role="group" aria-label="Ordenar UFs">
          ${Object.entries(SORTS).map(([key, { label }]) => html`<button key=${key} aria-pressed=${sort === key} onClick=${() => setSort(key)}>${label}</button>`)}
        </div>
      <//>
      <p class="list-summary"><span><i class="swatch tone-blue"></i>Flávio venceu em <b>${tally.F}</b></span><span><i class="swatch tone-red"></i>Lula em <b>${tally.L}</b></span></p>
      <ul class="place-list">${ordered.map(uf => html`<li key=${uf}>
        <${StateRow} uf=${uf} r=${ufs[uf]} theme=${theme} selected=${route.uf === uf} onClick=${() => route.openState(uf, 'presidente')}/>
      </li>`)}</ul>
    </section>`;
}

export function PresidentLegend({ theme }) {
  const ramp = hue => [2, 10, 20, 40].map(m => marginColor(theme, hue, m));
  return html`<div class="legend">
    <span class="legend-side"><i class="swatch tone-blue"></i><b>Flávio</b> venceu</span>
    <span class="legend-side"><i class="swatch tone-red"></i><b>Lula</b> venceu</span>
    <span class="legend-scale">${['blue', 'red'].map(hue => html`<span key=${hue} class="legend-ramp">${ramp(hue).map(c => html`<i key=${c} style=${{ background: c }}></i>`)}</span>`)}vantagem: até 5 · 15 · 30 · mais pontos</span>
  </div>`;
}
