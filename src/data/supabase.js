// Conexão com o Supabase (projeto lp-cliente-mib, tabelas pu26_*). A chave publicável é pública
// por definição: as tabelas só têm política de leitura, e escrita só pelo painel ou pelo MCP.
export const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL ?? 'https://yvedbbednrbhkhiqquao.supabase.co';
export const SUPABASE_KEY = import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_IT2GxRN9Ypiu5T93Op8Tkg_NZP7hykb';
export const DATASETS = ['resultado-presidente', 'pesquisas-presidente', 'resultado-senado', 'pesquisas-senado'];
