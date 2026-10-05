// Peças pequenas reaproveitadas em todas as telas.
import { html } from '../lib/html.js';
import { initials, pct } from '../lib/format.js';
import { blocOf, BLOCS, CANDIDATES } from '../data/meta.js';
import { SENATE_BASES } from '../lib/metrics.js';
import { Icon } from './Icon.js';

const BLOC_TONE = { esquerda: 'red', direita: 'blue', centro: 'beige' };
export const toneOfParty = party => BLOC_TONE[blocOf(party)] ?? 'other';

/** Retrato substituído por um círculo com as iniciais na cor do candidato ou do bloco. */
export function Avatar({ name, tone, size = 44 }) {
  return html`<span class=${'avatar tone-' + tone} style=${{ width: size + 'px', height: size + 'px', fontSize: Math.round(size * 0.36) + 'px' }} aria-hidden="true">${initials(name)}</span>`;
}

export const SectionHead = ({ title, id, children }) => html`<div class="section-head"><h3 id=${id}>${title}</h3>${children}</div>`;

export function BackButton({ to, onClick }) {
  return html`<button class="back-button" onClick=${onClick} aria-label=${`Voltar para ${to}`} aria-keyshortcuts="Escape" title="Voltar (Esc)">
    <${Icon} name="left" size=${16}/>${to}
  </button>`;
}

/** Barra Flávio × Lula ancorada nas duas pontas; o que sobra no meio são os demais. */
export function DuelBar({ F, L, marker = false }) {
  const label = `Flávio ${pct(F)}, Lula ${pct(L)}`;
  return html`<div class="duel-bar" role="img" aria-label=${label}>
    <i class="tone-blue" style=${{ width: (F ?? 0) + '%' }}></i>
    <i class="tone-red" style=${{ width: (L ?? 0) + '%' }}></i>
    ${marker && html`<span class="duel-mid"></span>`}
  </div>`;
}

const DUPLA = {
  2: { cls: 'good', icon: 'check', text: '2/2', label: 'acertou os dois eleitos' },
  1: { cls: 'warn', icon: 'half', text: '1/2', label: 'acertou um dos eleitos' },
  0: { cls: 'bad', icon: 'cross', text: '0/2', label: 'errou os dois eleitos' },
};

/** Selo do "acertou a dupla?": verde 2/2, amarelo 1/2, vermelho 0/2, cinza quando só o líder foi divulgado. */
export function DuplaBadge({ dupla, compact = false }) {
  if (!dupla || !dupla.avaliavel) {
    return html`<span class="badge is-na" title="Só o líder foi divulgado: não dá para avaliar a dupla">
      <${Icon} name="dash" size=${12}/>${!compact && 'só líder'}<span class="sr-only">não avaliável, só o líder foi divulgado</span>
    </span>`;
  }
  const look = DUPLA[dupla.acertos];
  return html`<span class=${'badge is-' + look.cls} title=${look.label + (dupla.empate ? ' (com empate na 2ª vaga)' : '')}>
    <${Icon} name=${look.icon} size=${12}/>${look.text}${dupla.empate && html`<sup aria-hidden="true">*</sup>`}
    <span class="sr-only">${look.label}${dupla.empate ? ', com empate na segunda vaga' : ''}</span>
  </span>`;
}

/** Selo da base de uma pesquisa de Senado. */
export function BaseBadge({ base, normalizado }) {
  const title = {
    VV: 'Votos válidos consolidados (1º + 2º voto reescalados a 100%): comparável ao resultado',
    VT: 'Votos totais: inclui indecisos, brancos e nulos; não comparável diretamente',
    200: 'Soma das menções (cada eleitor cita 2 nomes, ≈200%); exibida normalizada para 100% entre os nomes listados',
    'n/e': 'Base não especificada pela fonte',
  }[base];
  return html`<span class=${'base-badge base-' + base.replace('/', '')} title=${title}>${SENATE_BASES[base]}${normalizado ? ' · norm.' : ''}</span>`;
}

export function OrderBadge({ value }) {
  if (!value) return html`<span class="muted">–</span>`;
  const look = { certa: ['good', 'check', 'certa'], invertida: ['bad', 'cross', 'invertida'], empate: ['warn', 'dash', 'empate'] }[value];
  return html`<span class=${'badge is-' + look[0]}><${Icon} name=${look[1]} size=${12}/>${look[2]}</span>`;
}

/** Marca de pesquisa que veio dos dados iniciais e não foi encontrada em fonte aberta. */
export const Unconfirmed = ({ poll }) => poll?.confirmada === false
  ? html`<sup class="unconfirmed" title="Pesquisa dos dados iniciais não encontrada em fonte aberta durante a revisão">†</sup>`
  : null;

export const Swatch = ({ tone }) => html`<i class=${'swatch tone-' + tone} aria-hidden="true"></i>`;

export function PartyTag({ party }) {
  if (!party) return null;
  const tone = toneOfParty(party);
  return html`<span class=${'party-tag tone-' + tone}><${Swatch} tone=${tone}/>${party}</span>`;
}

export const CandidateKey = ({ id }) => html`<span class="candidate-key"><${Swatch} tone=${CANDIDATES[id].tone}/>${CANDIDATES[id].short}</span>`;

export function BlocLegend() {
  return html`<ul class="bloc-legend">${['esquerda', 'centro', 'direita'].map(key => html`<li key=${key}>
    <${Swatch} tone=${BLOC_TONE[key]}/>${BLOCS[key].label}<small>${BLOCS[key].parties.slice(0, 5).join(', ')}</small>
  </li>`)}</ul>`;
}

/** Barra horizontal de magnitude (erro) dentro de tabelas: um tom só, tamanho = valor. */
export function InlineBar({ value, max, tone = 'other', label }) {
  const width = Math.max(2, Math.min(100, (value / max) * 100));
  return html`<span class="inline-bar" aria-hidden=${label ? null : 'true'} title=${label}>
    <i class=${'tone-' + tone} style=${{ width: width + '%' }}></i>
  </span>`;
}
