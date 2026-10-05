// Cores das etiquetas de UF nas listas (preenchimento + texto legível por cima).
// Calculadas em JS porque o contraste do texto depende da cor final; os tons espelham src/styles/tokens.css.

/** Base neutra de cada tema, misturada com o tom do partido ou do vencedor. */
const BASE = { dark: '#1d1b19', light: '#e8e4de' };

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

const luminance = hex => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return .2126 * r + .7152 * g + .0722 * b;
};
const contrast = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
const INK_ON_LIGHT = '#1d1914';
const INK_ON_DARK = '#ffffff';
const AA = 4.5;

/** Escurece levemente (em OKLab) um preenchimento até que o rótulo por cima passe no contraste AA. */
function legible(lab) {
  let color = fromLab(lab);
  for (let L = lab[0]; L > 0.2; L -= 0.01) {
    color = fromLab([L, lab[1], lab[2]]);
    const lum = luminance(color);
    if (contrast(lum, 1) >= AA || contrast(lum, luminance(INK_ON_LIGHT)) >= AA) break;
  }
  return color;
}

/** Mistura a base neutra com um tom (`t` de 0 a 1), em OKLab. */
export function blend(theme, hue, t) {
  const base = toLab(BASE[theme]), end = toLab(hueFor(hue, theme));
  return legible(base.map((v, i) => v + (end[i] - v) * t));
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

/** Cor de texto legível sobre um preenchimento `#rrggbb`: a de maior contraste. */
export function inkOn(hex) {
  const lum = luminance(hex);
  return contrast(lum, 1) >= contrast(lum, luminance(INK_ON_LIGHT)) ? INK_ON_DARK : INK_ON_LIGHT;
}
