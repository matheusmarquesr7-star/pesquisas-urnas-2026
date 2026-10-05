// Decodifica o TopoJSON das UFs (projetado em metros) em caminhos do canvas, em quilômetros com y para baixo.

const emptyBox = () => [Infinity, Infinity, -Infinity, -Infinity];
const extend = (box, x, y) => {
  box[0] = Math.min(box[0], x); box[1] = Math.min(box[1], y);
  box[2] = Math.max(box[2], x); box[3] = Math.max(box[3], y);
};

/** `PathCtor` é o Path2D do navegador; os testes em Node passam um substituto. */
export function createGeography(topology, PathCtor = globalThis.Path2D) {
  const { scale, translate } = topology.transform;
  const box = emptyBox();
  const arcs = topology.arcs.map(arc => {
    let x = 0, y = 0;
    return arc.map(([dx, dy]) => {
      x += dx; y += dy;
      const point = [(x * scale[0] + translate[0]) / 1000, -(y * scale[1] + translate[1]) / 1000];
      extend(box, ...point);
      return point;
    });
  });
  for (const arc of arcs) for (const p of arc) { p[0] -= box[0]; p[1] -= box[1]; }
  const owners = arcs.map(() => []);

  const states = {};
  for (const geometry of topology.objects.estados.geometries) {
    const uf = geometry.id;
    const fill = new PathCtor(), bounds = emptyBox();
    const polygons = geometry.type === 'Polygon' ? [geometry.arcs] : geometry.arcs;
    let area = 0, center = [0, 0], biggest = 0;
    for (const polygon of polygons) for (const [ringIndex, ring] of polygon.entries()) {
      const points = [];
      for (const arcId of ring) {
        const id = arcId < 0 ? ~arcId : arcId;
        owners[id].push(uf);
        const part = arcId < 0 ? [...arcs[id]].reverse() : arcs[id];
        points.push(...part.slice(points.length ? 1 : 0));
      }
      fill.moveTo(...points[0]);
      for (const point of points.slice(1)) fill.lineTo(...point);
      fill.closePath();
      for (const p of points) extend(bounds, ...p);
      if (ringIndex === 0) {
        // Centroide do maior anel externo: é onde o rótulo da UF fica.
        let twice = 0, cx = 0, cy = 0;
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
          const f = points[j][0] * points[i][1] - points[i][0] * points[j][1];
          twice += f; cx += (points[j][0] + points[i][0]) * f; cy += (points[j][1] + points[i][1]) * f;
        }
        const a = Math.abs(twice / 2);
        area += a;
        if (a > biggest) { biggest = a; center = twice ? [cx / (3 * twice), cy / (3 * twice)] : points[0]; }
      }
    }
    states[uf] = { uf, fill, outline: new PathCtor(), box: bounds, center, area };
  }

  const borders = { state: new PathCtor(), coast: new PathCtor() };
  arcs.forEach((arc, i) => {
    const sharedBy = [...new Set(owners[i])];
    const draw = path => { path.moveTo(...arc[0]); for (const p of arc.slice(1)) path.lineTo(...p); };
    draw(sharedBy.length > 1 ? borders.state : borders.coast);
    for (const uf of sharedBy) draw(states[uf].outline);
  });

  return { states, borders, box: [0, 0, box[2] - box[0], box[3] - box[1]] };
}

/** Enquadramento do Brasil inteiro no quadro (deixa espaço à direita para as chamadas do litoral). */
export function nationalCamera(geo, width, height) {
  const [x0, y0, x1, y1] = geo.box;
  const usableWidth = width * 0.86, usableHeight = height * 0.94;
  const k = Math.min(usableWidth / (x1 - x0), usableHeight / (y1 - y0));
  return { k, x: width * 0.44 - (x0 + x1) / 2 * k, y: height * 0.5 - (y0 + y1) / 2 * k };
}
