// Dados do site: lidos ao vivo do Supabase (tabela pu26_datasets) e, se ele não responder,
// da cópia embutida no build (os JSON de src/data, versionados no git).
import presidentResultFile from './resultado-presidente.json';
import presidentPollsFile from './pesquisas-presidente.json';
import senateResultFile from './resultado-senado.json';
import senatePollsFile from './pesquisas-senado.json';
import { slug } from '../lib/format.js';
import { DATASETS, SUPABASE_KEY, SUPABASE_URL } from './supabase.js';

const TIMEOUT_MS = 5000;
const SNAPSHOT = {
  'resultado-presidente': presidentResultFile,
  'pesquisas-presidente': presidentPollsFile,
  'resultado-senado': senateResultFile,
  'pesquisas-senado': senatePollsFile,
};

/** Monta os índices usados pelas telas a partir dos quatro conjuntos de dados. */
export function buildData(raw, source, updatedAt) {
  const presidentPolls = raw['pesquisas-presidente'];
  const senatePolls = raw['pesquisas-senado'].ufs;
  const institutes = [...new Set([
    ...presidentPolls.map(p => p.inst),
    ...Object.values(senatePolls).flatMap(polls => polls.map(p => p.inst)),
  ])].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  return {
    presidentResult: raw['resultado-presidente'],
    presidentPolls,
    senateResult: raw['resultado-senado'].ufs,
    senatePolls,
    institutes,
    instituteSlug: Object.fromEntries(institutes.map(name => [name, slug(name)])),
    instituteBySlug: Object.fromEntries(institutes.map(name => [slug(name), name])),
    source,
    updated: updatedAt ?? raw['resultado-senado'].atualizado,
  };
}

async function fetchLive() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/pu26_datasets?select=name,data,updated_at`, {
      headers: { apikey: SUPABASE_KEY },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const rows = await response.json();
    const raw = Object.fromEntries(rows.map(row => [row.name, row.data]));
    if (!DATASETS.every(name => raw[name])) throw new Error('conjunto de dados incompleto');
    const updated = rows.map(row => row.updated_at).sort().at(-1)?.slice(0, 10);
    return buildData(raw, 'supabase', updated);
  } finally {
    clearTimeout(timer);
  }
}

/** Dados ao vivo do Supabase; se falhar (rede, bloqueio, tempo), a cópia embutida. */
export async function loadData() {
  try {
    return await fetchLive();
  } catch (error) {
    console.warn('Supabase indisponível, usando a cópia embutida dos dados:', error.message);
    return buildData(SNAPSHOT, 'embutido');
  }
}
