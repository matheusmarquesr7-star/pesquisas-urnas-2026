// Cores do mapa. O canvas não lê CSS, então os tons de fundo espelham src/styles/tokens.css.

export const MAP_THEMES = {
  dark: {
    background: '#0f0e0d',
    base: '#1d1b19',
    empty: '#2a2725',
    coast: 'rgba(255,255,255,.12)',
    focus: '#f7f5f2',
    focusGlow: 'rgba(255,255,255,.42)',
    hover: 'rgba(255,255,255,.85)',
    calloutLine: 'rgba(255,255,255,.32)',
    seatDivider: 'rgba(15,14,13,.9)',
  },
  light: {
    background: '#f7f5f2',
    base: '#e8e4de',
    empty: '#dcd7d0',
    coast: 'rgba(30,24,18,.16)',
    focus: '#1d1914',
    focusGlow: 'rgba(30,24,18,.3)',
    hover: 'rgba(30,24,18,.85)',
    calloutLine: 'rgba(30,24,18,.34)',
    seatDivider: 'rgba(247,245,242,.95)',
  },
};

export const HUES = {
  blue: '#4162e2',
  red: '#ee2d35',
  beige: { dark: '#cfa560', light: '#c8a35c' },
  good: '#0ca30c',
  warn: '#fab219',
  bad: '#d03b3b',
};

const hueFor = (name, theme) => typeof HUES[name] === 'string' ? HUES[name] : HUES[name][theme];

function toLab(hex) {
  const [r, g, b] = hex.match(/[a-f\d]{2}/gi).map(n => parseInt(n, 16) / 255)
    .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b);
  const m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b);
  const s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b);
  return [.2104542553 * l + .793617785 * m - .0040720468 * s, 1.9779984951 * l - 2.428592205 * m + .4505937099 * s, .0259040371 * l + .7827717662 * m - .808675766 * s];
}

function fromLab([L, a, b]) {
  const l = (L + .3963377774 * a + .2158037573 * b) ** 3;
  const m = (L - .1055613458 * a - .0638541728 * b) ** 3;
  const s = (L - .0894841775 * a - 1.291485548 * b) ** 3;
  return '#' + [4.0767416621 * l - 3.3077115913 * m + .2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - .3413193965 * s, -.0041960863 * l - .7034186147 * m + 1.707614701 * s]
    .map(v => Math.round(Math.max(0, Math.min(1, v <= .0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - .055)) * 255).toString(16).padStart(2, '0')).join('');
}

/** Mistura a base neutra do mapa com um tom (`t` de 0 a 1), em OKLab. */
export function blend(theme, hue, t) {
  const base = toLab(MAP_THEMES[theme].base), end = toLab(hueFor(hue, theme));
  return fromLab(base.map((v, i) => v + (end[i] - v) * t));
}

/** Vantagem do vencedor na UF, em pontos: até 5, até 15, até 30, mais. */
export const MARGIN_STEPS = [5, 15, 30];
const MARGIN_STRENGTH = [.42, .62, .82, 1];
export const marginRamp = (theme, hue) => MARGIN_STRENGTH.map(t => blend(theme, hue, t));
export function marginColor(theme, hue, margin) {
  const step = MARGIN_STEPS.findIndex(limit => margin < limit);
  return marginRamp(theme, hue)[step < 0 ? MARGIN_STEPS.length : step];
}

export const blocColor = (theme, bloc) => blend(theme, { esquerda: 'red', direita: 'blue', centro: 'beige' }[bloc] ?? 'beige', .9);
export const statusColor = (theme, status) => blend(theme, status, .88);

const INK_ON_LIGHT = '#1d1914';
const INK_ON_DARK = '#ffffff';

/** Cor de texto legível sobre um preenchimento `#rrggbb`. */
export function inkOn(hex) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return .2126 * r + .7152 * g + .0722 * b > .3 ? INK_ON_LIGHT : INK_ON_DARK;
}
