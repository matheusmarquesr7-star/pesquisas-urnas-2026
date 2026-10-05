// Ponto único de acesso aos dados versionados em JSON.
import presidentResult from './resultado-presidente.json';
import presidentPolls from './pesquisas-presidente.json';
import senateResultFile from './resultado-senado.json';
import senatePollsFile from './pesquisas-senado.json';
import { slug } from '../lib/format.js';

export { presidentResult, presidentPolls };
export const senateResult = senateResultFile.ufs;
export const senatePolls = senatePollsFile.ufs;
export const UPDATED = '2026-10-05';

/** Nome do instituto → slug da URL (#institutos/datafolha). */
export const INSTITUTES = [...new Set([
  ...presidentPolls.map(p => p.inst),
  ...Object.values(senatePolls).flatMap(polls => polls.map(p => p.inst)),
])].sort((a, b) => a.localeCompare(b, 'pt-BR'));
export const instituteSlug = Object.fromEntries(INSTITUTES.map(name => [name, slug(name)]));
export const instituteBySlug = Object.fromEntries(INSTITUTES.map(name => [slug(name), name]));
