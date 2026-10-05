// Monta o projeto a partir do Supabase antes do build da Vercel (npm run build:vercel).
//
// 1. Baixa os arquivos do site da tabela pu26_site_files e confere o MD5 de cada um.
// 2. Baixa os dados de pu26_datasets e grava em src/data/*.json (a cópia embutida no site).
// 3. Gera a malha das UFs (public/data/brasil-uf.topo.json) a partir do shapefile público.
//
// Sem dependências além do Node 20+. A chave é a publicável: as tabelas só permitem leitura.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const URL = process.env.SUPABASE_URL ?? 'https://yvedbbednrbhkhiqquao.supabase.co';
const KEY = process.env.SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_IT2GxRN9Ypiu5T93Op8Tkg_NZP7hykb';
const SHAPEFILE = process.env.SHAPEFILE_BASE ?? 'https://raw.githubusercontent.com/fititnt/gis-dataset-brasil/master/uf/shapefile/uf';
const ROOT = process.cwd();

const md5 = text => createHash('md5').update(text, 'utf8').digest('hex');
const write = (path, content) => {
  mkdirSync(dirname(join(ROOT, path)), { recursive: true });
  writeFileSync(join(ROOT, path), content);
};

async function rows(table, select) {
  const response = await fetch(`${URL}/rest/v1/${table}?select=${select}`, { headers: { apikey: KEY } });
  if (!response.ok) throw new Error(`${table}: HTTP ${response.status} ${await response.text()}`);
  return response.json();
}

const files = await rows('pu26_site_files', 'path,content,md5');
if (!files.length) throw new Error('pu26_site_files está vazia');
for (const file of files) {
  if (file.path.includes('..') || file.path.startsWith('/')) throw new Error(`caminho inválido: ${file.path}`);
  if (md5(file.content) !== file.md5) throw new Error(`MD5 não confere: ${file.path}`);
  write(file.path, file.content);
}
console.log(`[bootstrap] ${files.length} arquivos do site conferidos e gravados`);

const datasets = await rows('pu26_datasets', 'name,data');
for (const { name, data } of datasets) write(`src/data/${name}.json`, JSON.stringify(data, null, 1) + '\n');
console.log(`[bootstrap] ${datasets.length} conjuntos de dados gravados: ${datasets.map(d => d.name).join(', ')}`);

if (!existsSync(join(ROOT, 'public/data/brasil-uf.topo.json'))) {
  const dir = join(ROOT, '.shapefile');
  mkdirSync(dir, { recursive: true });
  for (const ext of ['shp', 'shx', 'dbf', 'prj']) {
    const response = await fetch(`${SHAPEFILE}.${ext}`);
    if (!response.ok) throw new Error(`shapefile .${ext}: HTTP ${response.status}`);
    writeFileSync(join(dir, `uf.${ext}`), Buffer.from(await response.arrayBuffer()));
  }
  execFileSync('sh', ['scripts/build-map.sh', join(dir, 'uf.shp')], { stdio: 'inherit' });
}
console.log('[bootstrap] pronto');
