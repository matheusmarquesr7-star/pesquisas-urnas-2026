import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { html } from '../lib/html.js';
import { stateName } from '../data/meta.js';
import { nationalCamera } from './geography.js';
import { MAP_THEMES, inkOn } from './colors.js';

// UFs do litoral pequenas demais para o rótulo: listadas ao lado do mapa, com linha de chamada.
const CALLOUTS = ['RN', 'PB', 'PE', 'AL', 'SE', 'ES', 'RJ'];
const CALLOUT_ROW = 23;
const LABEL_NUDGE = { DF: [4, -2], GO: [-8, 6], AM: [0, 6], PA: [0, 6] };
// Abaixo desta largura não cabe o valor ao lado da sigla.
const MIN_WIDTH_FOR_VALUES = 420;

const calloutPosition = (index, size) => [size.width * .885, size.height * .3 + index * CALLOUT_ROW + (index > 4 ? 8 : 0)];

/**
 * Mapa das 27 UFs em canvas. `paint(uf)` devolve `{ fill }` ou `{ halves: [cor1, cor2] }` (as duas vagas
 * do Senado); `label(uf)` devolve `{ value, dot, aria }` para o rótulo; `tooltip(uf)` devolve `{ title, lines }`.
 */
export function BrazilMap({ geo, theme, paint, label, tooltip, selected, onState, ariaLabel }) {
  const root = useRef(), canvas = useRef();
  const [size, setSize] = useState({ width: 480, height: 480 });
  const [hover, setHover] = useState(null);
  const colors = MAP_THEMES[theme];
  const camera = nationalCamera(geo, size.width, size.height);
  const showValues = size.width >= MIN_WIDTH_FOR_VALUES;

  useLayoutEffect(() => {
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width && height) setSize({ width, height });
    });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const c = canvas.current;
    const ctx = c.getContext('2d'), dpr = Math.min(devicePixelRatio || 1, 2), { width, height } = size;
    if (c.width !== Math.round(width * dpr) || c.height !== Math.round(height * dpr)) {
      c.width = Math.round(width * dpr);
      c.height = Math.round(height * dpr);
    }
    const { k, x, y } = camera;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.translate(x, y);
    ctx.scale(k, k);
    ctx.lineJoin = 'round';

    for (const state of Object.values(geo.states)) {
      const look = paint(state.uf) ?? { fill: colors.empty };
      if (look.halves) {
        // As duas vagas: metade esquerda e metade direita do estado, separadas no centroide.
        const [bx0, by0, bx1, by1] = state.box, split = state.center[0];
        ctx.save();
        ctx.clip(state.fill);
        ctx.fillStyle = look.halves[0];
        ctx.fillRect(bx0 - 1, by0 - 1, split - bx0 + 1, by1 - by0 + 2);
        ctx.fillStyle = look.halves[1];
        ctx.fillRect(split, by0 - 1, bx1 - split + 1, by1 - by0 + 2);
        ctx.strokeStyle = colors.seatDivider;
        ctx.lineWidth = 1.4 / k;
        ctx.beginPath();
        ctx.moveTo(split, by0 - 1);
        ctx.lineTo(split, by1 + 1);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.fillStyle = look.fill;
        ctx.fill(state.fill);
      }
    }

    ctx.strokeStyle = colors.background;
    ctx.lineWidth = 1.6 / k;
    ctx.stroke(geo.borders.state);
    ctx.strokeStyle = colors.coast;
    ctx.lineWidth = 1 / k;
    ctx.stroke(geo.borders.coast);

    if (hover && hover !== selected) {
      ctx.strokeStyle = colors.hover;
      ctx.lineWidth = 1.4 / k;
      ctx.stroke(geo.states[hover.uf].outline);
    }
    if (selected) {
      ctx.save();
      ctx.shadowColor = colors.focusGlow;
      ctx.shadowBlur = 8 * dpr;
      ctx.strokeStyle = colors.focus;
      ctx.lineWidth = 2.4 / k;
      ctx.stroke(geo.states[selected].outline);
      ctx.restore();
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    CALLOUTS.forEach((code, i) => {
      const center = geo.states[code].center, [tx, ty] = calloutPosition(i, size);
      ctx.strokeStyle = colors.calloutLine;
      ctx.lineWidth = .7;
      ctx.beginPath();
      ctx.moveTo(center[0] * k + x, center[1] * k + y);
      ctx.lineTo(tx - 6, ty + 11);
      ctx.stroke();
    });
  });

  const hit = event => {
    const box = canvas.current.getBoundingClientRect();
    const sx = event.clientX - box.left, sy = event.clientY - box.top;
    const mx = (sx - camera.x) / camera.k, my = (sy - camera.y) / camera.k;
    const ctx = canvas.current.getContext('2d');
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    try {
      for (const state of Object.values(geo.states)) {
        const [x0, y0, x1, y1] = state.box;
        if (mx >= x0 && mx <= x1 && my >= y0 && my <= y1 && ctx.isPointInPath(state.fill, mx, my)) return { uf: state.uf, sx, sy };
      }
      return null;
    } finally {
      ctx.restore();
    }
  };

  const tip = hover && tooltip(hover.uf);
  const chipStyle = look => {
    if (!look) return { background: colors.empty, color: inkOn(colors.empty) };
    if (look.halves) return { background: `linear-gradient(90deg, ${look.halves[0]} 50%, ${look.halves[1]} 50%)`, color: '#fff', textShadow: '0 0 3px rgba(0,0,0,.75)' };
    return { background: look.fill, color: inkOn(look.fill) };
  };

  return html`<div class="map-frame" ref=${root}>
    <canvas ref=${canvas} role="img" aria-label=${ariaLabel}
      onPointerMove=${event => event.pointerType === 'mouse' && setHover(hit(event))}
      onPointerLeave=${() => setHover(null)}
      onClick=${event => { const area = hit(event); if (area) onState(area.uf); }}></canvas>

    <div class="state-labels" role="group" aria-label="Selecionar uma UF">
      ${Object.values(geo.states).filter(state => !CALLOUTS.includes(state.uf)).map(state => {
        const [dx, dy] = LABEL_NUDGE[state.uf] || [0, 0];
        const look = paint(state.uf), info = label(state.uf);
        const halo = !look || look.halves;
        const style = {
          left: state.center[0] * camera.k + camera.x + dx + 'px',
          top: state.center[1] * camera.k + camera.y + dy + 'px',
          color: halo ? null : inkOn(look.fill),
        };
        return html`<button key=${state.uf} class=${'state-label' + (halo ? ' is-floating' : '')} style=${style}
          aria-pressed=${selected === state.uf} onClick=${() => onState(state.uf)} aria-label=${info.aria}>
          <b>${info.dot && html`<i class="poll-dot" aria-hidden="true"></i>`}${state.uf}</b>${showValues && info.value && html`<span>${info.value}</span>`}
        </button>`;
      })}
      ${CALLOUTS.map((code, i) => {
        const [left, top] = calloutPosition(i, size), info = label(code);
        return html`<button key=${code} class="state-callout" aria-pressed=${selected === code}
          style=${{ left: left + 'px', top: top + 'px', ...chipStyle(paint(code)) }}
          onClick=${() => onState(code)} aria-label=${info.aria}>
          <b>${info.dot && html`<i class="poll-dot" aria-hidden="true"></i>`}${code}</b>${showValues && info.value && html`<span>${info.value}</span>`}
        </button>`;
      })}
    </div>

    ${tip && html`<div class="map-tooltip" style=${{ left: Math.max(8, Math.min(size.width - 210, hover.sx + 14)) + 'px', top: Math.max(8, hover.sy - 70) + 'px' }}>
      <strong>${tip.title ?? stateName(hover.uf)}</strong>
      ${tip.lines.map((line, i) => html`<span key=${i}>${line}</span>`)}
    </div>`}
  </div>`;
}
