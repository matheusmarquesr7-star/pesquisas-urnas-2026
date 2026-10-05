// Formatação pt-BR. Todos os percentuais do projeto já estão em pontos (0–100), não em frações.

const integer = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const fixed = digits => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const formatters = [0, 1, 2].map(fixed);
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const missing = value => value == null || Number.isNaN(value);

export const int = value => integer.format(Math.round(value));
export const num = (value, digits = 1) => missing(value) ? '–' : formatters[digits].format(value);
export const pct = (value, digits = 1) => missing(value) ? '–' : formatters[digits].format(value) + '%';

/** Pontos percentuais; `signed` força o sinal (+1,87 pp). */
export function pp(value, digits = 1, signed = false) {
  if (missing(value)) return '–';
  const rounded = Number(value.toFixed(digits));
  const sign = rounded < 0 ? '−' : signed && rounded > 0 ? '+' : '';
  return `${sign}${formatters[digits].format(Math.abs(rounded))} pp`;
}

export function compact(value) {
  if (value >= 1e6) return formatters[1].format(value / 1e6) + ' mi';
  if (value >= 1e3) return int(value / 1e3) + ' mil';
  return int(value);
}

/** '2026-08-17' → '17/ago'. */
export function shortDate(iso) {
  if (!iso) return 's/ data';
  const [, month, day] = iso.split('-').map(Number);
  return `${day}/${MONTHS[month - 1]}`;
}

/** '2026-08-17' → '17 de agosto'. */
export function longDate(iso) {
  if (!iso) return 'data não informada';
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', timeZone: 'UTC' });
}

/** '1 pesquisa' / '2 pesquisas'. */
export const plural = (n, one, many) => `${int(n)} ${n === 1 ? one : many}`;

export const normalize = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const slug = text => normalize(text).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Iniciais para o avatar: 'Flávio Bolsonaro' → 'FB', 'Lula' → 'L'. */
export function initials(name) {
  const words = name.split(/\s+/).filter(word => /^[A-ZÁÂÉÍÓÚ]/.test(word) && word.length > 1);
  const picked = words.length > 1 ? [words[0], words.at(-1)] : words;
  return picked.map(word => word[0]).join('');
}
