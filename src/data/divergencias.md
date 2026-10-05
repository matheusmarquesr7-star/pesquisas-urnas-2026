# Divergências e lacunas dos dados

Atualizado em 05/10/2026, depois de uma segunda rodada de revisão. Este arquivo lista cada número que mudou em relação aos dados iniciais do briefing, o que foi confirmado e cada lacuna que continuou sem fonte.

## Como os dados foram conferidos

- **seuimposto.com, resultados.tse.jus.br e servicodados.ibge.gov.br não puderam ser acessados**: a política de rede do ambiente de coleta bloqueou esses domínios (HTTP 403 no proxy), inclusive via WebFetch. Não foi possível ler o bundle do seuimposto nem os JSON do TSE.
- **Fontes usadas:** reportagens de apuração e de pesquisas, lidas por resultados de busca. Entre elas, Exame, Gazeta do Povo, Metrópoles, Poder360, CNN, Times Brasil, Money Times, Jornal Opção, O Povo, Rádio Senado e jornais locais. As páginas não puderam ser abertas por inteiro; cada número vem do trecho exibido pelo buscador, com a URL registrada no campo `fonte` dos JSON.
- **Prioridade aplicada:** valor declarado como 100% apurado > maior percentual apurado disponível > conjunto coerente com os votos absolutos > dado do briefing.
- **Pendência principal:** quando o acesso ao TSE for liberado, conferir todos os números com os arquivos oficiais. Pela regra do projeto, o TSE vence qualquer outra fonte.

## Presidente — resultado

| Item | Briefing | Agora | Fonte / motivo |
| --- | --- | --- | --- |
| AM | Lula 63,95%, Flávio `null` | **Lula 48,20%, Flávio 45,03%** (99,94%) | O 63,95% era do **Maranhão**. Exame. |
| MS | (sem dado) → 1ª revisão: Lula 40,51 | **Flávio 58,60%, Lula 34,68%** (100%) | O 40,51 somava 99,14% com Flávio e não deixava espaço aos demais. Exame. |
| MA | (como "AM") 63,95 × 30,93 | **63,92 × 30,96** (99,60%) | Exame. |
| BA | 66,12 × 28,58 (1ª revisão) | **66,17 × 28,54** (99,98%) | Exame. O BNews, “com quase 100%”, dá 66,07 × 28,62. |
| PA | Lula 49,90, Flávio 44,50 (parcial) | **49,87 × 44,53** (99,81%) | Exame. |
| RS | Flávio 55,54 (1ª revisão) | **Flávio 55,64**, Lula 35,73 (100%) | Exame (o endereço da página traz “5564”). |
| AL | só Lula 54,73 | **Lula 54,73, Flávio 40,45** | Gazetaweb; os votos 995.459 × 735.718 batem com a diferença de 259 mil. |
| SP | 51,92 × 38,20 (parcial) | **51,93 × 38,20** (99,9%) | Exame. |
| MG | 48,24 × 43,32 (parcial) | **48,25 × 43,31** | Estado de Minas; sem % apurado explícito. |
| PI, Lula | 70,99% | 70,97% | Metrópoles. |
| Zema | ausente | **0,27%, 326.486 votos** | CNN, depois da apuração. |
| Abstenção | — | **21,08%** (100%) | Brasil61. Brancos 1,84% e nulos 2,93% do comparecimento confirmados. |

- **Confirmados:**
  - AP: 45,71 × 45,67, diferença de 225 votos, com 100%.
  - MT: 65,15 × 29,18, com 100%.
  - RJ: 53,01 × 39,41, com 99,97%.
  - TO: 50,4 × 43,42.
  - DF, ES, GO, PR, SC, RO, RR, PB, RN e SE: sem mudança.
- **Sem número de 100%:**
  - CE e PE: valores de fontes publicadas com 98% do país apurado.
  - Caiado: 2,19% com 99,79%; o site mostra 2,18% do briefing.
  - O total de votos válidos a 100% não apareceu explícito.
- **Contagem de UFs:** 15 para Flávio e 12 para Lula, confirmada. A Gazeta do Povo chegou a publicar 16 × 11, antes das viradas de Lula no AM e no AP.

## Presidente — pesquisas

A lista passou de 22 para **44 pesquisas**.

**Rodadas que faltavam, todas com fonte:**

| Instituto | Rodadas acrescentadas |
| --- | --- |
| Datafolha | 03/09, 11/09 e 17/09 |
| PoderData | 10/09≈, 17/09, 24/09≈ (só válidos) e 03/10≈ |
| Nexus/BTG | 08/09, 14/09, 21/09 e 28/09 |
| Real Time Big Data | 01/09, 24/09 e 01/10 |
| AtlasIntel | 23/09 |
| Quaest | 28/09 |
| CNT/MDA | 15/09 |
| Futura | 03/09, 16/09≈, 24/09≈ e 30/09 |
| Ideia | 30/09≈ |

**Correções nas pesquisas do briefing:**

- **Quaest:**
  - Datas: 02/09 (era ~03/09), 07/09 (era ~08/09), 14/09 (era ~15/09) e 21/09 (era ~22/09). Deixaram de ser aproximadas.
  - Os candidatos menores foram incluídos. Por exemplo, na de 07/09: Cury 8, Renan 3, Caiado 3 e Zema 2.
  - Brancos/nulos e indecisos confirmados (nv 18, 18, 17 e 15).
- **AtlasIntel de 10/09:** campo 4–9 set; menores incluídos. Com brancos/nulos 0,6 e não sabe 0,4, os válidos agora podem ser recalculados.
- **AtlasIntel de 29/09:** campo 23–28 set; menores em votos totais.
- **Datafolha:**
  - 24/09: menores e nv 7 (brancos/nulos 5 + indecisos 2).
  - 01/10: menores e nv 7.
- **Vox Brasil:** divulgação confirmada em 29/08.
- **Nexus/BTG de 31/08:** Cury 11% confere ("Cury salta para 11").
- **Gerp:**
  - A "Gerp ~02/10" (válidos Flávio 46, Lula 44) **não foi encontrada em nenhuma fonte**.
  - A única Gerp do período é a de **29/09** (campo 24–28 set; válidos Flávio 44, Lula 42), que entrou no lugar. A distância é a mesma (Flávio +2) e o erro também (0,13 pp).
  - Os totais da Gerp (F37, L34) e os válidos não são proporcionais entre si.
- **Nomes unificados:**
  - "AtlasIntel/Bloomberg" → AtlasIntel.
  - "PoderData/Aya" → PoderData.
  - "Indexa/Broadcast" → Indexa.
  - "Futura/100% Cidades" → Futura.
  - "Ideia/Meio" → Ideia.
  - O contratante fica no campo `contratante`.

**Sem confirmação em fonte aberta**, mantidas e marcadas com † no site:

- Datafolha de 03/10, AtlasIntel de 03/10 e Quaest de 03/10. São as finais do briefing. A busca não as encontrou, mas há indício da Datafolha final: uma manchete da CNN fala em "empate de 45% no 2º turno".
- Futura de 03/10. Pode ser a mesma Futura de 30/09 (totais F42,2, L39,4), mas os números não batem exatamente.
- Nexus/BTG de 17/08.
- AtlasIntel de 31/08: brancos, nulos e indecisos (0,3) não confirmados.
- PoderData de 27/08: menores não confirmados.

**Não encontrados no período:**

- Ipsos-Ipec: só aparece a rodada de dez/2025.
- Paraná Pesquisas nacional: a última é de mar/2026.
- Não verificados: Vox Brasil em setembro, Palver e Futura/Apex.

## Senado — resultado

| UF | Briefing | Agora | Motivo |
| --- | --- | --- | --- |
| MA | Lahesio 1º (21,42), Fufuca 2º (20,62) | **Fufuca 1º (21,43), Lahesio 2º (20,61)** | Todas as fontes (99,97%). |
| RR | 22,68 / 19,24 | **22,89 / 19,22** | O briefing era parcial. |
| RN | 29,29 / 17,76 | **29,25 / 17,63**; Rafael Motta 14,16 | 100%. |
| DF | Leila 21,31, Erika 18,97 (parciais) | **Leila 21,27, Erika 18,94** | 100%. |
| CE | Cid 31,04, Luizianne 28,87, Wagner 20,87 | **30,86 / 28,72 / 21,01**; Alcides Fernandes 18,62 | Conjunto com votos absolutos (Cid 2.764.444), provavelmente o mais recente. Outras fontes trouxeram 31,04/28,87, 31,13/28,97 e 31,21/29,04. |
| AL | Lira 28,87, Marina 28,20 | **Lira 28,82, Marina 28,16, Renan 22,32, Dr. Wanderley 10,92, Davi Davino 8,91** | Gazetaweb, coerente com os votos absolutos. O 4º é Dr. Wanderley, não Davi Davino. |
| PR | Filipe Barros 27,26 | **27,25** (100%) | Exame. |
| PB | 32,50 / 22,76 | **32,51 / 22,75** (99,89%) | O nome "Veneziano Vital do Rêgo" foi confirmado. |
| PE | 5º lugar incerto | **Carlos Sant'Anna (Novo) 7,52; Túlio Gadêlha (PSD) 7,19** | 99,6%. |
| AP | 4º lugar desconhecido | **Acácio Favacho (MDB) 14,87; Alliny Serrão (União) 9,68** (parciais) | A grafia certa é "Alliny". |
| SC | Amin `null` | **15,37**; Décio Lima 10,27 | — |
| SP | Salles e Soninha sem % | **Soninha 0,38%**; Salles desistiu em 28/09 | — |
| RJ | Crivella sem % | **3,31%**, parcial (85,95%) | — |
| PI | Ciro Nogueira PP ou PL? | **PP** | Metrópoles. |
| PA | Chicão eleito? | **Confirmado**: virou por 16.641 votos | Alguns veículos publicaram Éder Mauro eleito com base em parcial. |
| Bancada | "PL elegeu 16" | **PL 19** | Recalculado dos 54 eleitos; confirmado pela Rádio Senado e pela CNN. O "16" era de apuração em andamento. |

**Não eleitos acrescentados na primeira revisão:**

- AC: Cameli, Viana, Petecão.
- AM: Alberto Neto, Wilson Lima.
- ES: Maguinha Malta, Contarato, Meneguelli.
- GO: Calil, Varão, Vanderlan, Mendanha.
- MA: Roseana, Weverton, Eliziane.
- MT: Janaina Riva, Fávaro.
- MS: Vander Loubet, Soraya.
- RN: Zenaide, Coronel Hélio.
- RO: Sílvia Cristina, Mariana Carvalho, Luciana Oliveira, Acir Gurgacz.
- RR: Helena da Asatur, Chico Rodrigues, Hélio Negão.
- SE: André David, André Moura.
- TO: Eli Borges, Gaguim.
- Cada um com fonte no JSON.

**Ainda sem número final:**

- MG, com 99,01% apurado: Áurea, Aro, Superman e Aécio não reapareceram.
- PI, com 99,56%.
- MT: Janaina Riva entre 14,19 e 14,48; Fávaro entre 11,35 e 11,42.
- RO: Mariana Carvalho com 11,63 ou 11,81. Outra fonte dá Máximo 31,77 e Scheid 26,24; mantidos 31,97 e 26,56, de 100%.
- AP: 4º e 5º lugares parciais.

**Situações judiciais:**

- **PR, Deltan Dallagnol:** concorreu com o registro "deferido com recurso". Em 03/10 o relator negou o registro; em 04/10 a presidência do TSE suspendeu a decisão. Os votos foram contados, mas dependem do plenário.
- **AC, Gladson Cameli:** disputou sub judice e teve os votos contados normalmente. Como ficou em 3º, isso não muda o resultado.

**Partido a conferir:** PB, André Gadelha veio como MDB, o mesmo partido de Veneziano.

## Senado — pesquisas

A coleta passou de 57 levantamentos em 13 UFs no briefing para **129 em 27 UFs**. **Todas as UFs agora têm pesquisa.**

- **MT, PB e RO**, que não tinham pesquisa:
  - MT: Quaest (25/08 e 03/10), Real Time Big Data (03/09) e AtlasIntel (~03/10). A AtlasIntel foi a única que pôs Zé Medeiros, eleito, em 1º.
  - PB: Quaest (22/09 e 03/10) e Real Time Big Data (~02/10).
  - RO: Quaest (24/09 e 03/10), Real Time Big Data (30/09) e Veritá (03/10, só Bruno Scheid).
- **Rodada final da Quaest (02–03/10, votos válidos)** acrescentada em MA, SE, MS, RR, TO, BA, PR, RN, MT, PB e RO.
- **Outras finais:**
  - AtlasIntel: MA, PI, RR (só os 2 primeiros), SE (base n/e), RS e MT.
  - Datafolha: PI.
  - Instituto GP1: PI.
  - Real Time Big Data: TO, MG, CE (set), SC (set) e SE (2 rodadas de set).
  - SP: Datafolha de ~01/10, provavelmente votos totais.
- **Completadas:**
  - PA, AtlasIntel: ganhou data (03/10) e Celso Sabino.
  - PA, Real Time Big Data: ganhou data (15/09). Chicão aparece com 13, não 16 como no briefing.
  - RJ, AtlasIntel: antes só tinha o líder, agora tem todos os candidatos.
- **Divergência mantida:** RJ, Datafolha final. O briefing tem Portinho 19 e Jordy 18; outra fonte inverte (Jordy 19, Portinho 18). O erro médio da pesquisa não muda.
- **PE, Quaest:** fontes divergem em Mendonça Filho e Eduardo da Fonte (18/15 contra 12/10). Mantido 18/15, mais coerente com votos válidos.
- **Bases:**
  - A AtlasIntel publica o "consolidado reduzido a 100%". Foi tratada como VV quando a fonte diz "votos válidos" (MA, PA, SC) e nos casos análogos (MT, PI, RS, RJ). Em SE e RR ficou n/e.
  - As Quaest anteriores à rodada final são votos totais (VT).
- **RN, Exatus de 24/09:** marcada como base 200 no briefing, mas os três nomes somam 99,23%.
- **Datas aproximadas (≈):** várias AtlasIntel finais e algumas Real Time Big Data de setembro.
- **Sem data:** RJ Prefab, RN Consult e RR Census.
- **Fora dos dados, só nas notas da coleta:** pesquisas sem data confirmada (PI Veritá e Datamax, RR Veritá, RJ Gerp, uma Quaest anterior em TO).
- **Nomes unificados:** "Fufuca" → André Fufuca, "Leila Barros" → Leila do Vôlei, "Carol De Toni" → Carol de Toni, "Delta/AcreEmDia" → Delta, "Futura/100% Cidades" → Futura.
- **Candidatos citados em pesquisas e sem percentual nas urnas:**
  - Pedro Taques (MT).
  - Cidônio Gonçalves e Hilton (MA).
  - Paulo Mourão, Vanderlei Luxemburgo, Ronaldo Dimas e Professor Osvaldo (TO).
  - Professora Delliana (BA).
  - Karen Guerreiro (PR).
  - Ricardo Salles (SP).
  - Dr. Wanderley (AL) agora tem 10,92.
  - Os demais listados no JSON.
- **Ainda não verificado:**
  - Real Time Big Data final em SE e MA.
  - Real Time Big Data e AtlasIntel finais em GO, CE e BA.
  - Ipsos-Ipec: nenhuma pesquisa de Senado de 2026 encontrada.

## Mapa

- A malha estadual vem de `uf/shapefile/uf.shp` em github.com/fititnt/gis-dataset-brasil (IBGE, via o extinto brasilemcidades.gov.br, licença DbCL).
- Primeiro tentei dissolver a malha municipal do IBGE de 2010 (tbrugz/geodata-br, CC0), mas ela tem municípios faltando e deixava buracos no AM, GO, MT, PA e BA.
- Para usar a malha oficial mais recente (BR_UF_2024), rode `scripts/build-map.sh` com o shapefile do IBGE.
