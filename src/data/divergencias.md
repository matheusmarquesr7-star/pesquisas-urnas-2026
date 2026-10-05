# Divergências e lacunas dos dados

Atualizado em 05/10/2026. Este arquivo lista cada número que mudou em relação aos dados iniciais do briefing e cada lacuna que continuou sem fonte.

## Como os dados foram coletados

- **seuimposto.com, resultados.tse.jus.br e servicodados.ibge.gov.br não puderam ser acessados.** A política de rede do ambiente de coleta bloqueou esses domínios (HTTP 403 no proxy), inclusive via WebFetch. Por isso não foi possível ler o bundle do seuimposto nem os JSON do TSE.
- Os números foram conferidos em reportagens de apuração (Gazeta do Povo, Exame, Metrópoles, Times Brasil, O Tempo, Band, Rádio Senado, Agência Brasil e jornais locais), por meio de resultados de busca. As páginas não puderam ser abertas por inteiro, então cada número vem do trecho exibido pelo buscador.
- Ordem de prioridade aplicada: valor declarado como 100% apurado > maior percentual apurado disponível > dado do briefing.
- **Pendência principal:** quando o acesso ao TSE for liberado, conferir todos os números com os arquivos oficiais. Pela regra do projeto, o TSE vence qualquer outra fonte.

## Presidente — resultado

| Item | Briefing | Agora | Motivo |
| --- | --- | --- | --- |
| AM | Lula 63,95%, Flávio `null` | Lula 47,26%, Flávio 45,82% | O 63,95% era do **Maranhão** (Times Brasil: MA Lula 63,95%, 2.561.100 votos). O AM é parcial, com ~95% das seções (amazonas1.com.br). |
| PI, Lula | 70,99% | 70,97% | Metrópoles: 70,97% e 1.520.985 votos. |
| Caiado, votos | ausente | 2.602.710 | Exame, com 99,79% apurado. O percentual de 2,18% do briefing foi mantido. |
| Zema | ausente | 0,27% (326.134 votos) | Exame, com 99,79%. Zema concorreu pelo Novo. |
| Outros candidatos | ausente | 0,23% somados | Samara (UP), Hertz Dias (PSTU), Edmilson Costa (PCB), Rui Costa Pimenta (PCO). |
| Brancos e nulos | 1,84% / 2,93% "parcial" | mantidos | Confirmados com 99,79% (Exame), como % do comparecimento: 2.297.528 brancos e 3.665.592 nulos sobre 125.020.982 votantes. O número de 100% não foi encontrado. |
| Cury e Renan, votos | 3.448.364 / 2.675.790 | mantidos | A imprensa traz 3.448.237 (99,98%) e 2.673.630 (99,79%). Os do briefing parecem ser os finais. |

**Por UF:** as 27 UFs agora têm fonte, com 15 para Flávio e 12 para Lula. A Gazeta do Povo chegou a publicar 16 × 11, provavelmente antes das viradas de Lula no AM e no AP.

Lacunas e alertas por UF:

- **AL:** só o percentual de Lula (54,73%). O de Flávio não foi encontrado.
- **AP:** Lula 45,71% × Flávio 45,67%, diferença de 225 votos. Fonte única (Exame); vale reconferir.
- **MS:** 58,63% × 40,51% é **suspeito**. Os dois somam 99,14% e deixam menos de 1% para os demais (no país, eles tiveram ~7,8%). Pode ser o percentual só entre os dois.
- **SP:** parcial sem percentual apurado informado (51,92% × 38,20%, Times Brasil).
- **MG, RJ, PA:** parciais do briefing, não reverificadas.
- **BA, CE, PE, MA:** fonte publicada com 98,36% apurado no país.
- **MT, TO, RS:** fonte única com URL exata incerta.
- **Outros candidatos por UF:** só os do PR (100%).

## Presidente — pesquisas

- **Quaest de setembro (03/09, 08/09, 15/09 e 22/09):** os candidatos menores seguem omitidos, porque as colunas da fonte eram suspeitas e a busca não trouxe os valores. As datas de divulgação continuam aproximadas (fim do campo + 2 dias).
- **Nexus/BTG de 31/08:** Cury aparece com 11%, contra 1–2% nas outras rodadas do instituto. Mantido como estava, com alerta.
- **Gerp (02/10):** data aproximada e campo não informado.
- **Vox Brasil (29/08):** data aproximada.
- **AtlasIntel de 10/09:** sem brancos, nulos e indecisos, então os válidos não podem ser recalculados. Ela só aparece na base de votos totais.
- **Pesquisas de 2º turno** divulgadas depois de 04/10: nenhuma encontrada.

## Senado — resultado

| UF | Briefing | Agora | Motivo |
| --- | --- | --- | --- |
| MA | Lahesio Bonfim 1º (21,42), Fufuca 2º (20,62) | **Fufuca 1º (21,43), Lahesio 2º (20,61)** | Todas as fontes dão Fufuca à frente (99,97% apurado). |
| RR | Nicoletti 22,68, Teresa 19,24 | 22,89 e 19,22 | Os valores do briefing eram parciais. |
| RN | Styvenson 29,29, Samanda 17,76 | 29,25 e 17,63 | Valores de 100%. Zenaide Maia ficou a 5.765 votos da vaga. |
| DF | Leila 21,31 | 21,25 | Final. O de Erika Kokay (18,97) ainda é parcial. |
| SC | Esperidião Amin `null` | 15,37 | Outras fontes dão entre 15,31 e ~15,4. |
| PI | Ciro Nogueira PP ou PL? | PP | Metrópoles: "Ciro Nogueira (PP) perde eleição". |
| PA | Chicão eleito? | Confirmado | Virada de 16.641 votos sobre Éder Mauro com 100% apurado. Alguns veículos publicaram Éder eleito com base em parcial. |
| Bancada | "PL elegeu 16" | **PL 19** | Recalculado a partir dos 54 eleitos e confirmado pela Rádio Senado e pela CNN. O "16" era de apuração em andamento. |

Não eleitos que entraram (percentual dos válidos):

- **AC:** Gladson Cameli (PP) 16,60, Jorge Viana (PT) 14,17, Sérgio Petecão (PSD) 10,38.
- **AL:** Renan Calheiros (MDB) 22,25, Davi Davino Filho (Republicanos) 7,81.
- **AP:** Randolfe Rodrigues (PT) 18,55.
- **AM:** Capitão Alberto Neto (PL) 23,69, Wilson Lima (União) 11,88.
- **CE:** Alcides Fernandes (PL) 18,42.
- **ES:** Maguinha Malta (PL) 18,90, Fabiano Contarato (PT) 12,94, Sergio Meneguelli (PSD) 7,49.
- **GO:** Zacharias Calil (MDB) 14,94, Oséias Varão (PL) 10,13, Vanderlan Cardoso (PSD) 9,48, Gustavo Mendanha (PRD) 8,66.
- **MA:** Roseana Sarney (MDB) 16,40, Weverton Rocha (PDT) 15,21, Eliziane Gama (PT) 9,75.
- **MT:** Janaina Riva (MDB) 14,42, Carlos Fávaro (PSD) 11,42.
- **MS:** Vander Loubet (PT) 13,88, Soraya Thronicke (PSB) 13,07.
- **RN:** Zenaide Maia (PSD) 17,47, Coronel Hélio (PL) 17,20.
- **RO:** Sílvia Cristina (PP) 17,03, Mariana Carvalho (Republicanos) 11,81.
- **RR:** Helena da Asatur (PSD) 17,23, Chico Rodrigues (PSB) 13,38, Hélio Negão (PL) 13,08.
- **SE:** Delegado André David (Republicanos) 16,23, André Moura (União) 16,19.
- **TO:** Eli Borges (Republicanos) 16,44, Gaguim (União) 15,45.

Lacunas e alertas:

- **CE:** fontes divergem (O Povo 31,04/28,87; SRZD 31,13/28,97; lista nacional 31,21/29,04). Nenhuma declara 100% apurado. Mantidos os do O Povo.
- **PE:** o 5º lugar não foi resolvido (Túlio Gadêlha, PSD, ou Carlos Sant'anna, Novo). Os dois aparecem sem percentual.
- **AP:** 4º colocado não encontrado.
- **AL:** Davi Davino Filho como 4º não foi confirmado explicitamente.
- **MT:** 3º e 4º lugares não consolidados (Janaina Riva entre 14,19 e 14,42).
- **RO:** Mariana Carvalho com ~98% apurado.
- **MG (99,01%), PR (99,98%), PI (99,56%), AM (99,87%), MA (99,97%):** sem número de 100%.
- **RN:** percentual de Rafael Motta não encontrado.
- **AC:** uma fonte descreve os votos de Gladson Cameli como "anulados sub judice". A confirmar no TSE.
- **PR:** Deltan Dallagnol concorreu com o registro "deferido com recurso". Em 03/10 um ministro do TSE anulou os votos dele; em 04/10 a presidência do TSE suspendeu a decisão. O mandato depende do plenário.
- **RR:** Hélio Negão (Helio Fernando Barbosa Lopes, PL) aparece com 13,08% em uma única fonte.
- **Grafias a conferir:** "Veneziano Vital do Rêgo" (uma fonte usa só "Veneziano"); "Aliny Serrão" ou "Alliny Serrão" (AP).
- **Nomes citados em pesquisas sem percentual nas urnas:** Ricardo Salles, Soninha Francine (SP); Marcelo Crivella (RJ); Dr. Wanderley, Alexandre Fleming (AL); Acácio Favacho, Aliny Serrão, Capi (AP); Professora Evany (AM); Rose de Freitas, Marcos do Val (ES); Eduardo Velloso (AC).
- Nenhuma UF tem a lista completa de candidatos, então o campo `completo` fica falso em todas e a soma dos válidos não chega a 100%. A diferença aparece como "Demais candidatos e não listados".

## Senado — pesquisas

- **Pesquisas novas:** 35, em 11 UFs que não tinham pesquisas no briefing: AC (10), AL (5), AP (4), AM (3), ES (5), MA (1), MS (2), PI (1), RR (2), SE (1) e TO (1). Cada uma tem `fonte` com a URL da reportagem.
- **Ainda sem pesquisas:**
  - MT: existe uma Quaest de setembro, mas sem números acessíveis.
  - PB: uma TDL de 30/09 traz só Veneziano e Nabor empatados com 30% e não informa João Azevêdo. Não foi incluída.
  - RO: só uma Real Time Big Data de 15/07, fora da janela.
- **Não verificadas por falta de cota de buscas:** pesquisas extras em GO, BA, CE, RS, PR, SC, PA e RN, além das do briefing. Também é provável que a Quaest tenha feito uma rodada final em 02–03/10 em MA, SE, MS, PI, RR, TO, PB e MT.
- **Bases atribuídas pela coleta:**
  - Quaest e Real Time Big Data publicam o "consolidado" (1º + 2º voto sobre o total, com indecisos): marcados como VT.
  - As Quaest de 03/10 que divulgaram votos válidos: VV.
  - Paraná Pesquisas e Veritá somam as menções: 200.
  - AtlasIntel no AC e no AP: `n/e`.
  - Census (RR) normaliza a soma dos dois votos para 100%: tratado como VV.
- **RN · Exatus de 24/09:** marcada como base 200 no briefing, mas os três nomes somam 99,23%. A base parece errada ou faltam nomes. Ficou como estava.
- **Datas aproximadas (≈):** AC Delta e IP Sensus de 03/10; ES Quaest de setembro e as duas Real Time Big Data; RR Real Time Big Data; AP AtlasIntel; MS Ranking Brasil e IPEMS; AL Quaest de 25/09 e Paraná Pesquisas de 21/09; AM Paraná Pesquisas.
- **Sem data (`null`):** RJ Prefab, PA Real Time Big Data, PA AtlasIntel (marcada como `final`), RN Consult, RR Census.
- **Nomes de instituto unificados:** "Delta/AcreEmDia" virou "Delta"; "AtlasIntel/MeioNorte" virou "AtlasIntel", com o contratante anotado em `obs`.
- **AL · Paraná Pesquisas:** uma busca trouxe 43,9/42,4/38,1, sem confirmação. Foram usados os números do título da Metrópoles (45,6/41,6/36,9).

## Mapa

- A malha estadual vem de `uf/shapefile/uf.shp` em github.com/fititnt/gis-dataset-brasil: malha do IBGE redistribuída pelo extinto brasilemcidades.gov.br, licença DbCL.
- Primeiro tentei dissolver a malha municipal do IBGE em domínio público (tbrugz/geodata-br, de 2010), mas ela tem municípios faltando e deixava buracos no AM, GO, MT, PA e BA.
- Para usar a malha oficial mais recente (BR_UF_2024), rode `scripts/build-map.sh` com o shapefile do IBGE.
