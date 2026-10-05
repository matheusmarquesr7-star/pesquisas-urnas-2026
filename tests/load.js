import { readFileSync } from 'node:fs';

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));

export const presidentResult = read('../src/data/resultado-presidente.json');
export const presidentPolls = read('../src/data/pesquisas-presidente.json');
export const senateResult = read('../src/data/resultado-senado.json');
export const senatePolls = read('../src/data/pesquisas-senado.json');
export const topology = read('../public/data/brasil-uf.topo.json');
