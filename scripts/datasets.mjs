// Confere os JSON de src/data com a tabela pu26_datasets do Supabase (o git é a fonte da verdade).
//
//   node scripts/datasets.mjs          compara o MD5 de cada conjunto e sai com erro se algum divergir
//   node scripts/datasets.mjs --sql    imprime o SQL que atualiza as linhas divergentes (para rodar no painel ou no MCP)
//
// Só lê, com a chave publicável. O MD5 é o do JSON compacto (JSON.stringify), igual a md5(data::text) no banco.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { DATASETS } from '../src/data/supabase.js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://yvedbbednrbhkhiqquao.supabase.co';
const KEY = process.env.SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_IT2GxRN9Ypiu5T93Op8Tkg_NZP7hykb';
const md5 = text => createHash('md5').update(text, 'utf8').digest('hex');

const response = await fetch(`${SUPABASE_URL}/rest/v1/pu26_datasets?select=name,md5,updated_at`, { headers: { apikey: KEY } });
if (!response.ok) throw new Error(`pu26_datasets: HTTP ${response.status} ${await response.text()}`);
const remote = Object.fromEntries((await response.json()).map(row => [row.name, row]));

const stale = [];
for (const name of DATASETS) {
  const text = JSON.stringify(JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url), 'utf8')));
  const local = md5(text);
  const same = remote[name]?.md5 === local;
  if (!same) stale.push({ name, text, local });
  console.error(`${same ? 'igual   ' : 'DIVERGE '} ${name.padEnd(22)} local ${local}  banco ${remote[name]?.md5 ?? '(ausente)'}`);
}

if (process.argv.includes('--sql')) {
  for (const { name, text, local } of stale) {
    if (text.includes('$pu26$')) throw new Error(`${name}: o texto contém o delimitador $pu26$`);
    // md5 é coluna gerada (md5(data::text)): o banco calcula; a conferência compara com o MD5 local.
    console.log(`insert into pu26_datasets (name, data, updated_at) values ('${name}', $pu26$${text}$pu26$::json, now())
  on conflict (name) do update set data = excluded.data, updated_at = excluded.updated_at;
select name, md5, md5 = '${local}' as confere from pu26_datasets where name = '${name}';`);
  }
} else if (stale.length) {
  process.exitCode = 1;
}
