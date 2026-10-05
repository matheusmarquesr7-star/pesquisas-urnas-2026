import { useMemo } from 'preact/hooks';
import { html } from '../lib/html.js';
import { num, pct, plural, pp, shortDate } from '../lib/format.js';
import { acertouDupla, dayNumber, differences, displayValues, elected, senateLatest, seatsByParty } from '../lib/metrics.js';
import { BLOC_ORDER, blocOf, BLOCS, STATES, stateName, UFS } from '../data/meta.js';
import { blocColor, inkOn } from '../map/colors.js';
import { Icon } from './Icon.js';
import { Avatar, BackButton, BaseBadge, BlocLegend, DuplaBadge, PartyTag, SectionHead, Swatch, toneOfParty } from './ui.js';

const VALID_BASES = ['VV', '200', 'n/e'];
export const pollsInBase = (polls, base) => (polls ?? []).filter(p => base === 'totais' ? p.base === 'VT' : VALID_BASES.includes(p.base));

/* ---------------------------------------------------------------- Mapa */

export const senatePaint = (resultByUf, theme) => uf => {
  const pair = resultByUf[uf].c.filter(c => c[3]);
  return { halves: pair.map(c => blocColor(theme, blocOf(c[1]))) };
};

/* ---------------------------------------------------------------- Placar */

function SeatStrip({ resultByUf }) {
  const seats = BLOC_ORDER.map(bloc => ({ bloc, n: Object.values(resultByUf).flatMap(r => r.c.filter(c => c[3] && blocOf(c[1]) === bloc)).length }));
  const tone = { esquerda: 'red', centro: 'beige', direita: 'blue' };
  return html`<div class="seat-strip-wrap">
    <div class="seat-strip" role="img" aria-label=${seats.map(s => `${BLOCS[s.bloc].label}: ${s.n} vagas`).join('; ')}>
      ${seats.flatMap(s => Array.from({ length: s.n }, (_, i) => html`<i key=${s.bloc + i} class=${'tone-' + tone[s.bloc]}></i>`))}
    </div>
    <p class="seat-counts">${seats.map(s => html`<span key=${s.bloc}><${Swatch} tone=${tone[s.bloc]}/>${BLOCS[s.bloc].label} <b>${s.n}</b></span>`)}</p>
  </div>`;
}

export function SenateScoreboard({ resultByUf, pollsByUf, checks }) {
  const seats = seatsByParty(resultByUf);
  const rated = checks.filter(c => c.dupla.avaliavel);
  const hits = rated.filter(c => c.dupla.acertos === 2).length;
  const withPolls = UFS.filter(uf => pollsByUf[uf]?.length).length;
  return html`<section class="scoreboard senate-board" aria-label="Senado: vagas e acerto das pesquisas">
    <div class="senate-board-grid">
      <div>
        <h2 class="board-title">Senado <span>· 54 vagas, 2 por UF</span></h2>
        <${SeatStrip} resultByUf=${resultByUf}/>
      </div>
      <dl class="board-stats">
        <div><dt>Maior bancada eleita</dt><dd><b>${seats[0].party} ${seats[0].n}</b><small>${seats.slice(1, 4).map(s => `${s.party} ${s.n}`).join(' · ')}</small></dd></div>
        <div><dt>UFs com pesquisas comparadas</dt><dd><b>${withPolls} de 27</b><small>${checks.length} checagens (última de cada instituto)</small></dd></div>
        <div class="is-alert"><dt>Acertaram a dupla eleita</dt><dd><b>${pct(hits / rated.length * 100, 0)}</b><small>${hits} de ${rated.length} checagens avaliáveis</small></dd></div>
      </dl>
    </div>
  </section>`;
}

/* ---------------------------------------------------------------- Nacional */

function SeatsByParty({ resultByUf }) {
  const seats = seatsByParty(resultByUf);
  const max = seats[0].n;
  return html`<section class="insight" aria-labelledby="vagas">
    <${SectionHead} id="vagas" title="Vagas por partido"><span class="section-count">calculado a partir dos eleitos</span><//>
    <ul class="hbars">${seats.map(({ party, n }) => html`<li key=${party}>
      <span class="hbar-label"><${PartyTag} party=${party}/></span>
      <span class="hbar-track"><i class=${'tone-' + toneOfParty(party)} style=${{ width: (n / max) * 100 + '%' }}></i></span>
      <b>${n}</b>
    </li>`)}</ul>
    <${BlocLegend}/>
  </section>`;
}

function AccuracyByInstitute({ stats, onInstitute }) {
  // Primeiro quem foi checado em 3+ UFs (ordenados pelo acerto); depois os demais, pelo número de UFs.
  const solid = s => s.ufs >= 3 ? 1 : 0;
  const rows = stats.filter(s => s.ufs > 0)
    .sort((a, b) => solid(b) - solid(a) || (b.taxaDupla ?? -1) - (a.taxaDupla ?? -1) || b.ufs - a.ufs || a.inst.localeCompare(b.inst, 'pt-BR'));
  return html`<section class="insight" aria-labelledby="acerto-inst">
    <${SectionHead} id="acerto-inst" title="Acerto da dupla por instituto"><span class="section-count">última pesquisa em cada UF</span><//>
    <div class="table-scroll" tabindex="0" role="region" aria-labelledby="acerto-inst">
      <table class="data-table">
        <thead><tr><th scope="col">Instituto</th><th scope="col" class="num">UFs</th>
          <th scope="col" class="num">2/2</th><th scope="col" class="num">1/2</th><th scope="col" class="num">0/2</th>
          <th scope="col" class="num">Só líder</th><th scope="col" class="num">Dupla certa</th><th scope="col" class="num" title="Erro médio por candidato, só pesquisas em votos válidos">Erro VV</th></tr></thead>
        <tbody>${rows.map(s => html`<tr key=${s.inst}>
          <th scope="row"><button class="link-button" onClick=${() => onInstitute(s.inst)}>${s.inst}</button></th>
          <td class="num">${s.ufs}</td>
          <td class="num good-text">${s.acertos[2] || html`<span class="muted">0</span>`}</td>
          <td class="num warn-text">${s.acertos[1] || html`<span class="muted">0</span>`}</td>
          <td class="num bad-text">${s.acertos[0] || html`<span class="muted">0</span>`}</td>
          <td class="num muted">${s.acertos.na}</td>
          <td class="num"><b>${s.taxaDupla != null ? pct(s.taxaDupla * 100, 0) : '–'}</b></td>
          <td class="num">${s.erroSenado != null ? num(s.erroSenado, 1) : html`<span class="muted">–</span>`}</td>
        </tr>`)}</tbody>
      </table>
    </div>
    <p class="note">Institutos checados em 3 ou mais UFs aparecem primeiro. “Dupla certa” = entre as UFs avaliáveis, em quantas os dois primeiros da pesquisa foram os dois eleitos. Erro VV = média de |pesquisa − urna| por candidato, em pontos, só nas pesquisas em votos válidos.</p>
  </section>`;
}

function ChecksByState({ checks, onState }) {
  const byUf = UFS.map(uf => ({ uf, list: checks.filter(c => c.uf === uf) })).filter(g => g.list.length);
  return html`<section class="insight" aria-labelledby="checagens">
    <${SectionHead} id="checagens" title="Checagem por UF"><span class="section-count">${byUf.length} UFs</span><//>
    <ul class="check-list">${byUf.map(({ uf, list }) => html`<li key=${uf}>
      <button class="check-uf" onClick=${() => onState(uf)} aria-label=${`Abrir ${stateName(uf)}`}><b>${uf}</b><small>${stateName(uf)}</small></button>
      <span class="check-badges">${list.map(c => html`<span key=${c.inst} class="check-item"><${DuplaBadge} dupla=${c.dupla} compact=${true}/>${c.inst}</span>`)}</span>
    </li>`)}</ul>
  </section>`;
}

function BiggestMisses({ misses, onState }) {
  return html`<section class="insight" aria-labelledby="maiores-erros">
    <${SectionHead} id="maiores-erros" title="Maiores erros por candidato"><span class="section-count">votos válidos, última pesquisa</span><//>
    <ol class="miss-list">${misses.map(m => html`<li key=${m.uf + m.inst + m.name}>
      <button class="link-button" onClick=${() => onState(m.uf)}>${m.uf}</button>
      <span><b>${m.name}</b> · ${m.inst}: ${num(m.poll)}% na pesquisa, ${num(m.urna, 2)}% nas urnas</span>
      <b class=${m.diff < 0 ? 'bad-text' : 'warn-text'}>${pp(m.diff, 1, true)}</b>
    </li>`)}</ol>
  </section>`;
}

function PartyBias({ bias }) {
  const parties = Object.keys(bias).filter(p => bias[p].candidatos >= 3).sort((a, b) => Math.abs(bias[b].media) - Math.abs(bias[a].media));
  return html`<section class="insight" aria-labelledby="vies-partido">
    <${SectionHead} id="vies-partido" title="Quem as pesquisas subestimaram"><span class="section-count">média de pesquisa − urna, votos válidos</span><//>
    <ul class="hbars is-diverging">${parties.map(party => {
      const value = bias[party].media;
      return html`<li key=${party}>
        <span class="hbar-label"><${PartyTag} party=${party}/></span>
        <span class="hbar-track is-diverging"><i class=${'tone-' + toneOfParty(party) + (value < 0 ? ' is-negative' : '')}
          style=${{ width: Math.min(50, Math.abs(value) * 6) + '%' }}></i></span>
        <b>${pp(value, 1, true)}</b>
        <small class="muted" title=${`${plural(bias[party].n, 'medição', 'medições')} de ${plural(bias[party].candidatos, 'candidato', 'candidatos')}`}>${bias[party].candidatos} cand.</small>
      </li>`;
    })}</ul>
    <p class="note">Negativo: o partido teve nas urnas mais do que as pesquisas indicavam. Só partidos com pelo menos 3 candidatos medidos; cada candidato pode ter sido medido por mais de um instituto.</p>
  </section>`;
}

export function SenateNational({ resultByUf, stats, checks, misses, bias, route }) {
  return html`<div class="insights">
    <${SeatsByParty} resultByUf=${resultByUf}/>
    <${AccuracyByInstitute} stats=${stats} onInstitute=${route.openInstituteByName}/>
    <${BiggestMisses} misses=${misses} onState=${uf => route.openState(uf, 'senado')}/>
    <${PartyBias} bias=${bias}/>
    <${ChecksByState} checks=${checks} onState=${uf => route.openState(uf, 'senado')}/>
  </div>`;
}

/* ---------------------------------------------------------------- UF */

/** Evolução de um candidato nas pesquisas exibidas (um ponto por pesquisa) com o resultado como linha de referência. */
function Sparkline({ points, urna, tone, label }) {
  const width = 96, height = 30, pad = 4;
  const values = [...points.map(p => p.value), ...(urna != null ? [urna] : [])];
  const min = Math.min(...values) - 1, max = Math.max(...values) + 1;
  const days = points.map(p => p.day);
  const d0 = Math.min(...days), d1 = Math.max(...days, d0 + 1);
  const x = day => pad + ((day - d0) / (d1 - d0)) * (width - pad * 2);
  const y = v => pad + ((max - v) / (max - min)) * (height - pad * 2);
  return html`<svg class=${'sparkline tone-' + tone} width=${width} height=${height} role="img" aria-label=${label}>
    ${urna != null && html`<line class="spark-urna" x1="0" x2=${width} y1=${y(urna)} y2=${y(urna)}/>`}
    <path d=${points.map((p, i) => `${i ? 'L' : 'M'}${x(p.day).toFixed(1)} ${y(p.value).toFixed(1)}`).join('')}/>
    ${points.map((p, i) => html`<circle key=${i} cx=${x(p.day)} cy=${y(p.value)} r="2.5"/>`)}
  </svg>`;
}

function ResultBars({ ufResult }) {
  const known = ufResult.c.filter(c => c[2] != null);
  const max = Math.max(...known.map(c => c[2]));
  const rest = 100 - known.reduce((s, c) => s + c[2], 0);
  return html`<ul class="result-bars">
    ${ufResult.c.map(([name, party, value, won]) => html`<li key=${name} class=${won ? 'is-elected' : 'is-other'}>
      <span class="result-name"><b>${name}</b><${PartyTag} party=${party}/></span>
      <span class="hbar-track"><i class=${'tone-' + toneOfParty(party)} style=${{ width: value != null ? (value / max) * 100 + '%' : '0' }}></i></span>
      <span class="result-value">${value != null ? pct(value, 2) : html`<span class="muted" title="Percentual não encontrado nas fontes">n/d</span>`}${won && html`<em class="tag is-elected">eleito</em>`}</span>
    </li>`)}
    ${rest > 0.05 && html`<li class="is-rest"><span class="result-name muted">Demais candidatos e não listados</span><span></span><span class="result-value muted">${pct(rest, 2)}</span></li>`}
  </ul>`;
}

function PollMatrix({ uf, ufResult, polls, base }) {
  const winners = new Set(elected(ufResult));
  const shown = [...polls].sort((a, b) => (a.div ?? '0').localeCompare(b.div ?? '0'));
  const finals = new Set(senateLatest(polls));
  const names = ufResult.c.map(c => c[0]).filter(name => shown.some(p => p.x[name] != null) || winners.has(name));
  const party = Object.fromEntries(ufResult.c.map(c => [c[0], c[1]]));
  const urna = Object.fromEntries(ufResult.c.map(c => [c[0], c[2]]));
  const values = shown.map(p => displayValues(p));
  const diffs = shown.map(p => differences(p, ufResult));
  const evolution = name => shown.map((p, i) => ({ day: p.div ? dayNumber(p.div) : null, value: values[i].x[name] })).filter(p => p.day != null && p.value != null);
  const distinctDays = list => new Set(list.map(p => p.day)).size;
  const showEvolution = new Set(shown.filter(p => p.div).map(p => p.div)).size >= 2;

  return html`<div class="table-scroll" tabindex="0" role="region" aria-label=${`Pesquisas e resultado em ${stateName(uf)}`}>
    <table class="data-table matrix">
      <thead><tr>
        <th scope="col">Candidato</th>
        <th scope="col" class="num urna-col">Urna</th>
        ${shown.map((p, i) => html`<th key=${i} scope="col" class="num poll-col">
          <span class="cell-title">${p.inst}</span>
          <small>${shortDate(p.div)}${p.aprox ? ' ≈' : ''}${finals.has(p) ? ' · última' : ''}</small>
          <${BaseBadge} base=${p.base} normalizado=${values[i].normalizado}/>
        </th>`)}
        ${showEvolution && html`<th scope="col">Evolução</th>`}
      </tr></thead>
      <tbody>
        ${names.map(name => html`<tr key=${name} class=${winners.has(name) ? 'is-elected' : ''}>
          <th scope="row"><span class="cell-title">${winners.has(name) && html`<${Icon} name="check" size=${12}/>`}${name}</span><small>${party[name] ?? ''}</small></th>
          <td class="num urna-col"><b>${urna[name] != null ? num(urna[name], 2) : 'n/d'}</b></td>
          ${shown.map((p, i) => {
            const v = values[i].x[name];
            const d = diffs[i][name];
            return html`<td key=${i} class="num">${v == null ? html`<span class="muted">–</span>` : html`${num(v)}${d != null && html`<small class=${'diff ' + (Math.abs(d) >= 5 ? 'is-big' : '')}>(${pp(d, 1, true).replace(' pp', '')})</small>`}`}</td>`;
          })}
          ${showEvolution && html`<td>${distinctDays(evolution(name)) >= 2
            ? html`<${Sparkline} points=${evolution(name)} urna=${urna[name]} tone=${toneOfParty(party[name])} label=${`Evolução de ${name} nas pesquisas exibidas; linha horizontal = resultado`}/>`
            : html`<span class="muted">–</span>`}</td>`}
        </tr>`)}
        <tr class="dupla-row">
          <th scope="row">Acertou a dupla?</th>
          <td class="urna-col"></td>
          ${shown.map((p, i) => html`<td key=${i} class="num"><${DuplaBadge} dupla=${acertouDupla(p, ufResult)}/></td>`)}
          ${showEvolution && html`<td></td>`}
        </tr>
      </tbody>
    </table>
  </div>
  <p class="note">Valores em %. Entre parênteses, pesquisa − urna em pontos (só na base de votos válidos). ${base === 'validos' ? 'Pesquisas em “Soma 200%” aparecem normalizadas para 100% entre os nomes listados.' : 'Votos totais incluem indecisos, brancos e nulos e não são comparáveis diretamente ao resultado.'} * no selo: empate na 2ª vaga.</p>`;
}

export function SenateState({ uf, ufResult, polls, base, route }) {
  const index = UFS.indexOf(uf);
  const step = offset => route.openState(UFS[(index + offset + UFS.length) % UFS.length], 'senado');
  const shown = pollsInBase(polls, base);
  const hidden = (polls?.length ?? 0) - shown.length;
  const pair = ufResult.c.filter(c => c[3]);
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
      <p>${STATES[uf][1]} · Senado, 2 vagas · ${ufResult.apurado != null ? `${num(ufResult.apurado, ufResult.apurado === 100 ? 0 : 2)}% apurado` : '% apurado não informado pela fonte'}</p>
    </header>

    <section class="panel-section">
      <div class="elected-pair">${pair.map(([name, party, value]) => html`<div key=${name} class=${'elected-card tone-' + toneOfParty(party)}>
        <${Avatar} name=${name} tone=${toneOfParty(party)} size=${40}/>
        <span><strong>${name}</strong><small>${party} · ${value != null ? pct(value, 2) : 'n/d'}</small></span>
      </div>`)}</div>
      <${ResultBars} ufResult=${ufResult}/>
      ${ufResult.obs.length > 0 && html`<ul class="obs-list">${ufResult.obs.map(text => html`<li key=${text}><${Icon} name="info" size=${14}/>${text}</li>`)}</ul>`}
    </section>

    <section class="panel-section">
      <${SectionHead} title="Pesquisas × urnas"><span class="section-count">${shown.length} ${base === 'totais' ? 'em votos totais' : 'em válidos e outras bases'}</span><//>
      ${!polls?.length
        ? html`<p class="empty">Sem pesquisas registradas para este estado.</p>`
        : shown.length
          ? html`<${PollMatrix} uf=${uf} ufResult=${ufResult} polls=${shown} base=${base}/>`
          : html`<p class="empty">Nenhuma pesquisa nesta base.</p>`}
      ${hidden > 0 && html`<p class="note"><button class="link-button" onClick=${() => route.setBase(base === 'totais' ? 'validos' : 'totais')}>
        Ver ${hidden} ${hidden > 1 ? 'pesquisas' : 'pesquisa'} em ${base === 'totais' ? 'votos válidos e outras bases' : 'votos totais'}</button></p>`}
    </section>
  </div>`;
}

/* ---------------------------------------------------------------- Lista de UFs */

export function SenateSide({ resultByUf, pollsByUf, checks, route, theme }) {
  const rows = useMemo(() => UFS.map(uf => ({ uf, pair: resultByUf[uf].c.filter(c => c[3]), list: checks.filter(c => c.uf === uf) }))
    .sort((a, b) => stateName(a.uf).localeCompare(stateName(b.uf), 'pt-BR')), [resultByUf, checks]);
  return html`<section class="panel-section">
    <${SectionHead} title="Eleitos por UF"><span class="section-count">${rows.filter(r => r.list.length).length} com pesquisas</span><//>
    <ul class="place-list">${rows.map(({ uf, pair, list }) => {
      const colors = pair.map(c => blocColor(theme, blocOf(c[1])));
      return html`<li key=${uf}>
        <button class="place-row senate-row" aria-pressed=${route.uf === uf} onClick=${() => route.openState(uf, 'senado')}
          aria-label=${`${stateName(uf)}: ${pair.map(c => `${c[0]} (${c[1]})`).join(' e ')}${list.length ? `; ${plural(list.length, 'instituto checado', 'institutos checados')}` : '; sem pesquisas'}`}>
          <span class="place-tag" style=${{ background: `linear-gradient(90deg, ${colors[0]} 50%, ${colors[1]} 50%)`, color: '#fff', textShadow: '0 0 3px rgba(0,0,0,.7)' }}>${uf}</span>
          <span class="place-name"><strong>${stateName(uf)}</strong><small>${pair.map(c => `${c[0]} (${c[1]})`).join(' · ')}</small></span>
          <span class="mini-badges" aria-hidden="true">${list.length
            ? list.map(c => html`<i key=${c.inst} class=${'mini is-' + (!c.dupla.avaliavel ? 'na' : ['bad', 'warn', 'good'][c.dupla.acertos])}></i>`)
            : html`<small class="muted">sem pesquisa</small>`}</span>
        </button>
      </li>`;
    })}</ul>
  </section>`;
}

export function SenateLegend() {
  return html`<div class="legend">
    <span class="legend-side"><i class="swatch tone-red"></i>Esquerda e centro-esquerda</span>
    <span class="legend-side"><i class="swatch tone-beige"></i>Centro</span>
    <span class="legend-side"><i class="swatch tone-blue"></i>Direita</span>
    <span class="legend-scale">cada metade = uma vaga · <i class="poll-dot" aria-hidden="true"></i> UF com pesquisas comparadas</span>
  </div>`;
}

export const senateLabel = pollsByUf => uf => ({
  dot: pollsByUf[uf]?.length > 0,
  aria: `${stateName(uf)}${pollsByUf[uf]?.length ? ', com pesquisas comparadas' : ', sem pesquisas'}`,
});

export const senateTooltip = (resultByUf, checks) => uf => ({
  title: stateName(uf),
  lines: [
    ...resultByUf[uf].c.filter(c => c[3]).map(c => `${c[0]} (${c[1]}) ${c[2] != null ? pct(c[2], 1) : ''}`),
    (() => {
      const list = checks.filter(c => c.uf === uf && c.dupla.avaliavel);
      return list.length ? `Dupla certa em ${list.filter(c => c.dupla.acertos === 2).length} de ${list.length} institutos` : 'Sem pesquisas avaliáveis';
    })(),
  ],
});

export const senateInk = color => inkOn(color);
