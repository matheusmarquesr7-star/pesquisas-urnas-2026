# Pesquisas × Urnas 2026

Site estático que compara as principais pesquisas eleitorais com o resultado real do **1º turno das eleições gerais de 4 de outubro de 2026**, para **Presidente** e **Senado** (27 UFs, 54 vagas). Para cada disputa, o site mostra:

- o resultado das urnas;
- as pesquisas reunidas na data de divulgação (16/ago a 3/out);
- o erro de cada pesquisa em relação ao resultado;
- um ranking de institutos, de quem mais acertou a quem mais errou.

A interface parte do projeto [open-apuracao-brazil](https://github.com/bpinheiroms/open-apuracao-brazil) (MIT), que reproduz a linguagem visual do [seuimposto.com](https://seuimposto.com): tema escuro `#0F0E0D`, fonte Geist, mapa em Canvas 2D, três colunas no desktop e a URL como fonte da verdade.

## O que tem

- **Presidente**
  - Placar Flávio × Lula, com a média das pesquisas finais e o desvio de cada um.
  - Resumo dos erros.
  - Gráfico da distância Flávio − Lula ao longo da campanha: a linha das urnas e o traço de erro de cada pesquisa, com destaque por instituto e navegação por teclado.
  - Gráfico de linhas com média móvel de 10 dias.
  - Ranking da véspera, tabela completa e mapa por UF.
- **Senado**
  - Mapa com cada UF dividida nas duas vagas, colorida pelo bloco do partido.
  - Vagas por partido, recalculadas dos eleitos.
  - Acerto da dupla por instituto, maiores erros e viés por partido.
  - Detalhe de cada UF:
    - resultado;
    - matriz candidato × pesquisa com a diferença para a urna;
    - selo "acertou a dupla?";
    - minigráficos de evolução;
    - notas de divergência e sub judice.
- **Institutos:** tabela que junta Presidente e Senado, destaques calculados a partir dos dados e mapa de onde cada instituto acertou.
- **Metodologia:** votos válidos × totais, recálculo dos válidos, normalização das pesquisas em 200%, datas aproximadas e fontes.
- **Controles:**
  - Seletor de base (válidos ou totais).
  - Busca por UF ou instituto (tecla `/`).
  - Tema claro e escuro.
  - Layout em 3 colunas a partir de 1440px, mapa com abas entre 1000 e 1439px e gaveta no celular.

## Como rodar

Requisitos: Node.js 20.19 ou mais recente e npm.

```sh
npm install
npm run dev        # servidor local com recarga
npm test           # testes (executor nativo do Node)
npm run build      # site estático em dist/
npm run preview    # serve dist/ para conferência
```

Não há backend próprio: o site roda no navegador. Ao abrir, ele lê os dados da tabela `pu26_datasets` no Supabase com a chave publicável (só leitura). Se o Supabase não responder em 5 s, usa a cópia dos JSON embutida no build.

### URLs

| URL | Tela |
| --- | --- |
| `/#presidente?base=validos` | Presidente (padrão) |
| `/#presidente/MG?base=totais` | Presidente, com Minas Gerais aberta, em votos totais |
| `/#senado/SP?base=validos` | Senado em São Paulo |
| `/#institutos/datafolha?base=validos` | Instituto Datafolha |
| `/#metodologia` | Metodologia |

Abrir uma UF ou um instituto cria uma entrada no histórico, então o voltar do navegador (ou `Esc`) sobe um nível.

## Hospedagem: Vercel + Supabase

| Peça | Onde | Para quê |
| --- | --- | --- |
| Site | Vercel, projeto `pesquisas-urnas-2026` | Hospeda o build estático |
| Dados | Supabase (projeto lp-cliente-mib), tabela `pu26_datasets` | Os 4 JSON lidos ao vivo pelo site |
| Código | Supabase, tabela `pu26_site_files` | Fonte que o build da Vercel baixa |

As tabelas `pu26_*` têm RLS com leitura pública e nenhuma escrita pela API: alterações só pelo painel do Supabase ou pelo MCP.

No build da Vercel, `npm run build:vercel` roda `scripts/bootstrap-supabase.mjs`. Ele:

1. baixa os arquivos de `pu26_site_files`, conferindo o MD5 de cada um;
2. grava os dados de `pu26_datasets` em `src/data/`, que viram a cópia embutida;
3. gera a malha das UFs a partir do shapefile público;
4. roda o `vite build`.

Para corrigir um número, atualize a linha em `pu26_datasets`: o site passa a mostrar o valor novo na próxima visita, sem novo deploy. Para mudar o código, atualize `pu26_site_files` e faça um novo deploy na Vercel.

## De onde vêm os dados

Os dados também ficam versionados em `src/data/`:

| Arquivo | Conteúdo |
| --- | --- |
| `resultado-presidente.json` | Resultado nacional (100%), brancos/nulos e as 27 UFs, com fonte e grau de confiança |
| `pesquisas-presidente.json` | 44 pesquisas nacionais (`t` = votos totais, `v` = válidos, `nv` = brancos + nulos + indecisos, `aprox` = data estimada, `confirmada: false` = não encontrada em fonte aberta, marcada com † no site) |
| `resultado-senado.json` | Candidatos por UF: `[nome, partido, % válidos, eleito]`, observações e fontes |
| `pesquisas-senado.json` | 129 levantamentos nas 27 UFs, com base `VV`, `VT`, `200` ou `n/e` |
| `divergencias.md` | Tudo o que mudou em relação aos dados iniciais e o que ficou sem fonte |

O TSE e o seuimposto.com não puderam ser acessados durante a coleta: os domínios estavam bloqueados pela rede do ambiente. Por isso os números foram conferidos em reportagens de apuração e de pesquisas, numa revisão em duas rodadas. A revisão corrigiu datas e números do briefing, acrescentou 23 rodadas presidenciais e 72 levantamentos de Senado, e marcou com † as pesquisas não encontradas em fonte aberta. Os detalhes estão em [`src/data/divergencias.md`](src/data/divergencias.md).

### Como atualizar

1. Edite os JSON em `src/data/`. Prioridade das fontes: **TSE** (arquivos públicos em `resultados.tse.jus.br`), depois seuimposto.com, depois imprensa.
2. Nas pesquisas de Senado, use **exatamente** o mesmo nome de candidato do resultado da UF; o teste de dados falha se não bater. Candidatos sem resultado conhecido entram com percentual `null`.
3. Rode `npm test` e `npm run build`.

Todos os números do site (rankings, médias, destaques) são calculados em `src/lib/metrics.js` a partir dos JSON. Nada é escrito à mão.

### Mapa

`public/data/brasil-uf.topo.json` (37 KB) é gerado por `scripts/build-map.sh` com o mapshaper. O script projeta em Albers equivalente e simplifica a malha. A versão publicada usa a malha estadual do IBGE redistribuída em [gis-dataset-brasil](https://github.com/fititnt/gis-dataset-brasil) (licença DbCL). Para usar a malha oficial mais recente, baixe `BR_UF_2024.zip` no [IBGE](https://www.ibge.gov.br/geociencias/organizacao-do-territorio/malhas-territoriais.html) e rode:

```sh
sh scripts/build-map.sh BR_UF_2024.shp SIGLA_UF
```

## Regras de cálculo

Implementadas e testadas em `src/lib/metrics.js` (`tests/metrics.test.js`):

- `validos(poll)`: usa `v`; senão `t × 100 / (100 − nv)`; senão `null`. Valores recalculados aparecem com `*`.
- Resultado em votos totais = válido × (1 − (brancos + nulos) / 100).
- `erroDistancia = |(F − L) da pesquisa − (F − L) da urna|`. Exemplo: Datafolha final, Lula +3 contra Flávio +1,87, dá erro de **4,87 pp**.
- `erroMedio` = média de |pesquisa − urna| entre os candidatos presentes nos dois.
- Pesquisas finais = a última de cada instituto divulgada a partir de 27/09.
- Senado:
  - `acertouDupla`: os dois primeiros da pesquisa ∩ eleitos dá 2, 1 ou 0; quando só o líder foi divulgado, a pesquisa não é avaliável.
  - Empate na 2ª vaga: os empatados que foram eleitos ocupam a vaga restante, e o selo ganha `*`.
  - Só a base VV entra no erro médio. Pesquisas em 200% são normalizadas pela soma dos nomes listados.

## Organização do código

```
index.html            página única; aplica o tema antes da primeira pintura
src/
  main.js             carrega a malha e monta o app
  App.js              rota, layouts e composição das telas
  components/         TopBar, President, Senate, Institutes, GapChart, LinesChart,
                      SearchDialog, Methodology, ui (selos, avatares, barras), Icon
  hooks/              useRoute (URL), useTheme, useHotkey, useMediaQuery, useWidth
  map/                BrazilMap (canvas), geography (TopoJSON → Path2D), colors
  lib/                metrics (regras de cálculo), format (pt-BR), html (htm)
  data/               JSON versionados, meta (UFs, blocos), divergencias.md
  styles/             tokens, base, layout, components, map, charts, tables
scripts/build-map.sh  gera a malha das UFs
tests/                métricas (casos calculados à mão) e integridade dos dados
```

Stack: Preact + [htm](https://github.com/developit/htm) (sem JSX), CSS puro, Canvas 2D, Vite e testes com o executor nativo do Node.

## Créditos e licença

- Código sob a licença MIT (veja `LICENSE`). A base de interface é de Bruno Pinheiro ([open-apuracao-brazil](https://github.com/bpinheiroms/open-apuracao-brazil)).
- Nenhum ativo proprietário do seuimposto.com foi copiado. Os retratos viraram círculos com iniciais, e a malha e as zonas eleitorais de lá foram removidas.
- Fonte [Geist](https://vercel.com/font), da Vercel, sob a SIL Open Font License.
- Malha estadual: IBGE, via gis-dataset-brasil (DbCL).
