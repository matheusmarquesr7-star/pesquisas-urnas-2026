# Divergências e lacunas dos dados

Atualizado em 05/10/2026, na terceira rodada: a conferência com os arquivos oficiais de resultado do TSE e com o registro de pesquisas do TSE. Este arquivo lista cada número que mudou em relação aos dados iniciais do briefing, o que foi confirmado e cada lacuna que continuou sem fonte.

## 3ª rodada: conferência com o TSE

### Fonte

- Arquivos oficiais de resultado do TSE, lidos em 05/10/2026, com **100% das seções totalizadas** em todas as UFs:
  - Presidente: eleição **6257**, `https://resultados.tse.jus.br/oficial/ele2026/6257/dados/{uf}/{uf}-c0001-e006257-u.json` (`br` = país, `zz` = exterior). Arquivos gerados em 05/10 às 02:59.
  - Senado: eleição **6259**, `https://resultados.tse.jus.br/oficial/ele2026/6259/dados/{uf}/{uf}-c0005-e006259-u.json`. Totalização final marcada em todas as UFs; arquivos gerados entre 04/10, 20:23, e 05/10, 06:08.
- Os códigos vêm do arquivo de configuração do TSE, `https://resultados.tse.jus.br/oficial/comum/config/ele-c.json` (pleito 3220, ciclo `ele2026`). Não foram deduzidos do padrão de 2022: o caminho `dados-simplificados/…-r.json` não existe mais, nem para 2022.
- Percentuais: o valor de 2 casas que o próprio TSE publica (`pvap`), em votos válidos.
- Pela regra do projeto, o TSE substitui qualquer número de imprensa. As tabelas abaixo comparam com a versão anterior do site.

### Lacunas que ficaram fechadas

| Lacuna | Antes | TSE (100%) |
| --- | --- | --- |
| MG, Senado, com 99,01% apurado | Domingos Sávio 24,29; Marília Campos 19,40; Aro 11,60; Aécio 4,02 | **24,21; 19,44; 11,63; 4,08**. Carlos Viana 17,46, Áurea Carolina 12,98 e Superman 9,24 confirmados |
| PI, Senado, com 99,56% | Marcelo Castro 35,65; Júlio César 26,96; Tiago Junqueira 8,87 | **35,67; 26,98; 8,85**. Ciro Nogueira 24,68 confirmado |
| MT, 3º e 4º lugares | Janaina Riva entre 14,19 e 14,48; Fávaro entre 11,35 e 11,42 | **Janaina Riva 14,53; Fávaro 11,50**. Os dois ficaram acima das faixas das parciais |
| AP, 4º e 5º lugares | Acácio Favacho 14,87; Alliny Serrão 9,68 (parciais) | **Confirmados**: 14,87 e 9,68 |
| RO, Mariana Carvalho | 11,63 ou 11,81 | **11,62**. Máximo 31,97 e Scheid 26,56 confirmados |
| RJ, Crivella | 3,31 com 85,95% apurado | **3,39** |
| CE e PE, Presidente, sem 100% | CE Flávio 31,28 × Lula 63,28; PE 31,03 × 63,45 | **CE 31,27 × 63,29**; PE confirmado |
| Caiado, nacional | 2,18%, com votos de 99,79% | **2,18%, 2.605.148 votos** |

### Revisões anteriores que estavam erradas

- **RR, Senado:** os dados iniciais (Nicoletti 22,68, Teresa Surita 19,24) estavam certos. A "correção" da 1ª revisão para 22,89 / 19,22 veio de uma parcial. Também mudaram Helena da Asatur (17,23 → 17,50), Chico Rodrigues (13,38 → 13,43) e Hélio Negão (13,08 → 12,97).
- **AL, Senado:** a "outra fonte" citada (28,87 / 28,20 / 22,25) estava mais perto do TSE (28,87 / 28,20 / 22,24) do que os números da Gazetaweb usados (28,82 / 28,16 / 22,32).
- **CE, Senado:** o conjunto escolhido (Cid 30,86, Luizianne 28,72) era o mais distante. O TSE dá 31,22 / 29,05, perto dos 31,21 / 29,04 descartados.
- **AC, Senado:** a nota dizia que os votos de Gladson Cameli foram "contados normalmente". No arquivo do TSE, eles aparecem como **anulados sub judice** (145.244 votos). Ele ficou em 3º, então as vagas não mudam. O TSE calcula os percentuais de todos com esses votos na base: em AC, os votos válidos somam 83,41%.
- **PI, Presidente:** Lula tem 70,99%, o número dos dados iniciais. O 70,97% do Metrópoles era parcial.
- **Presidente, "outros":** 0,22%, não 0,23%. São seis candidatos: Samara (UP), Hertz Dias (PSTU), Clariana Barao (DC), Edmilson Costa (PCB), Veterinário Wilson Grassi (Democrata) e Rui Costa Pimenta (PCO).

### Presidente — nacional

| Item | Antes | TSE |
| --- | --- | --- |
| Flávio Bolsonaro | 47,03%, 56.102.126 | 47,03%, **56.104.503** |
| Lula | 45,16%, 53.866.947 | 45,16%, **53.879.538** |
| Augusto Cury | 2,89%, 3.448.364 | 2,89%, **3.448.569** |
| Renan Santos | 2,24%, 2.675.790 | 2,24%, **2.675.887** |
| Ronaldo Caiado | 2,18%, 2.602.710 | 2,18%, **2.605.148** |
| Romeu Zema | 0,27%, 326.486 | 0,27%, **326.488** |
| Outros | 0,23% | **0,22%** |
| Comparecimento | 125.020.982 | **125.275.835** |
| Votos válidos | 119.057.862 | **119.300.788** |
| Brancos | 2.297.528 (1,84%) | **2.300.798** (1,84%) |
| Nulos | 3.665.592 (2,93%) | **3.674.249** (2,93%), com 5.246 nulos técnicos |
| Abstenção | 33.378.099 (21,08%) | **33.469.244** (21,08%) |

Os percentuais nacionais não mudaram. A distância Flávio − Lula continua +1,87 pp, e os erros das pesquisas também.

### Presidente — UFs

| UF | Antes (Flávio × Lula) | TSE |
| --- | --- | --- |
| AM | 45,03 × 48,20 | **45,00 × 48,23** |
| BA | 28,54 × 66,17 | **28,53** × 66,17 |
| CE | 31,28 × 63,28 | **31,27 × 63,29** |
| MA | 30,96 × 63,92 | **30,90 × 63,99** |
| MG | 48,25 × 43,31 | **48,24 × 43,33** |
| PA | 44,53 × 49,87 | **44,50 × 49,91** |
| PI | 24,09 × 70,97 | 24,09 × **70,99** |

- As outras 20 UFs estavam certas.
- Votos absolutos corrigidos em CE, PB e PI.
- Todas as 27 UFs agora têm, do TSE: votos de Flávio e Lula, os percentuais de Cury, Renan, Caiado e Zema, apuração de 100% e confiança "alta". A fonte de cada UF é o arquivo do TSE.
- O placar de 15 UFs para Flávio e 12 para Lula está confirmado. AP: Lula venceu por 225 votos (212.503 × 212.278).
- Notas que só explicavam a origem dos números saíram do site. Ficaram as do AP, de RR (melhor resultado de Flávio) e do TO.

### Senado

Os **54 eleitos conferem** com o TSE, e a bancada continua PL 19. Mudaram percentuais e partidos:

| UF | O que mudou |
| --- | --- |
| AC | Cameli 16,60 → 16,59 (anulados sub judice); Eduardo Velloso — → 10,87 (Solidariedade) |
| AL | Lira 28,82 → 28,87; Marina JHC 28,16 → 28,20; Renan 22,32 → 22,24; Dr. Wanderley 10,92 → 10,91; Davi Davino Filho 8,91 → 8,92; Alexandre Fleming — → 0,79 (UP) |
| AM | Braga 32,26 → 32,29; Plínio Valério 24,69 → 24,70; Alberto Neto 23,69 → 23,66; Wilson Lima 11,88 → 11,89; Professora Evany — → 5,75 (PSOL) |
| AP | Capi — → 2,19 |
| BA | Rui Costa 29,99 → 30,07; Jaques Wagner 27,56 → 27,65; Angelo Coronel 20,17 → 20,11; João Roma 20,05 → 19,97; Professora Delliana — → 1,49 (PSOL) |
| CE | Cid 30,86 → 31,22; Luizianne 28,72 → 29,05; Capitão Wagner 21,01 → 20,70; Alcides Fernandes 18,62 → 18,28 |
| DF | Leila 21,27 → 21,25; Erika Kokay 18,94 → 18,91 |
| ES | Marcos do Val — → 4,17 (Avante); Rose de Freitas — → 4,08 (MDB) |
| GO | Vanderlan 9,48 → 9,49 |
| MA | Roseana 16,40 → 16,41; Cidônio Gonçalves — → 8,44 (PL); Hilton — → 6,42 (Mobiliza) |
| MG | ver lacunas |
| MT | Janaina Riva 14,42 → 14,53; Fávaro 11,42 → 11,50; Pedro Taques — → 6,28 (PSB) |
| PB | João Azevêdo 32,51 → 32,50; Veneziano 22,75 → 22,76; André Gadelha 2,82 → 2,83 |
| PE | Humberto Costa 27,16 → 27,19; Mendonça Filho 18,61 → 18,57; Eduardo da Fonte 13,83 → 13,84; Carlos Sant'Anna 7,52 → 7,50; Túlio Gadêlha 7,19 → 7,22 |
| PI | ver lacunas |
| PR | Karen Guerreiro — → 0,81 (Missão) |
| RJ | Crivella 3,31 → 3,39 |
| RO | Mariana Carvalho 11,81 → 11,62; Luciana Oliveira 5,52 → 5,40; Acir Gurgacz 4,08 → 4,06 |
| RR | ver acima |
| RS | Rigotto 3,65 → 3,67 |
| SC | Amin 15,37 → 15,31; Décio Lima 10,27 → 10,22 |
| TO | Paulo Mourão — → 7,85 (PT); Ronaldo Dimas — → 5,62 (Podemos); Vanderlei Luxemburgo — → 4,11 (Podemos); Professor Osvaldo — → 2,16 (PSOL) |

Nas UFs fora da tabela (MS, PA, RN, SE e SP), os números já estavam certos. Algumas só ganharam candidatos, listados abaixo.

- **Candidatos acrescentados** (todos os que tiveram 1% ou mais e não estavam nos dados):
  - AC: Professor Inacio Moreira (PSOL) 2,25; Dr. Junior Feitosa (DC) 2,20.
  - AM: Xuxa do Amazonas (Mobiliza) 1,22.
  - DF: Sebastião Coelho (Novo) 2,09.
  - ES: Callegari (DC) 1,24; Professor Fabian (PSOL) 1,06.
  - GO: Isaura Lemos (PSB) 5,21; Cintia Dias (PSOL) 4,32.
  - MA: Enilton Rodrigues (PSOL) 1,18.
  - MS: Roberto Oshiro (Novo) 3,96.
  - MT: Galvan (Avante) 4,73; Margareth Buzetti (PP) 1,83.
  - RJ: Marcos Dias (Podemos) 1,22.
  - RN: Tércio Tinôco (União) 2,85.
  - RO: Neidinha (PSB) 1,42, com votos anulados sub judice; Luis Fernando (PSD) 1,33.
  - RR: Regina Tio Ivo (Novo) 7,44; Pastor Isamar (União) 2,96; Bartô Macuxi (PSOL) 1,62.
  - RS: Frederico Antunes (PSD) 1,95.
  - SC: Afrânio Boppré (PSOL) 8,16; Lunelli (MDB) 5,99.
  - SE: Eduardo Amorim (Republicanos) 9,55; Edvaldo (PDT) 8,04; Rodrigo Valadares (PL) 5,54; Iran Barbosa (PSOL) 3,36, com votos anulados sub judice; Coronel Rocha (PL) 1,73.
  - Os nomes seguem a grafia de urna do TSE. Os demais, abaixo de 1%, entram na linha "Demais candidatos" do site.
- **Confirmados pelo TSE:** Soraya Thronicke é do PSB; André Gadelha é do MDB, como Veneziano; Ciro Nogueira é do PP.
- **PR, Deltan Dallagnol:** no arquivo do TSE, os votos dele estão como válidos. A situação judicial descrita abaixo continua.
- **SP, Ricardo Salles:** não está no arquivo do TSE, porque desistiu antes da eleição. Continua nas pesquisas, com percentual `null`.
- **Margens refeitas com os votos do TSE:** PA, Chicão sobre Éder Mauro por 16.641 votos (confirmado); RN, Zenaide Maia a 5.765 votos da vaga (confirmado); RR, Teresa Surita sobre Helena da Asatur por 10.618 votos (nota nova).
- `apurado` passou a 100 em todas as UFs. As notas que só explicavam a origem dos números saíram do site.
- Um teste de métrica usava o Crivella real (3,31): o caso calculado à mão foi refeito com 3,39.

### Pesquisas presidenciais marcadas com †

As seis estão no registro de pesquisas do TSE (conjunto "Pesquisas Eleitorais - 2026" do Portal de Dados Abertos, `https://cdn.tse.jus.br/estatistica/sead/odsele/pesquisa_eleitoral/pesquisa_eleitoral_2026.zip`, gerado em 04/10/2026) e foram encontradas na imprensa. **Todas foram confirmadas**: o † saiu do site e cada uma ganhou `fonte`. Nenhuma foi removida.

| Pesquisa | Registro no TSE | Fonte dos números | O que mudou |
| --- | --- | --- | --- |
| Datafolha, 03/10 | BR-01708/2026; campo 2–3/10; 4.006 entrevistas | CartaCapital | Totais ganharam Caiado 4, Renan 3 e Cury 3; nv 7 (brancos e nulos 4 + indecisos 3); contratante Folha e Globo. Válidos (45 / 42 / 4 / 3 / 3 / 1) confirmados |
| AtlasIntel, 03/10 | BR-00999/2026; campo 27/09–02/10; 4.945 entrevistas | Exame | nv 0,6 (brancos e nulos 0,3 + não sabem 0,3). Totais e válidos confirmados |
| Quaest, 03/10 | BR-02197/2026; campo 2–3/10; 3.702 entrevistas | Brasil de Fato | Totais e válidos ganharam Cury, Renan e Caiado, com 3 cada; nv 13 (brancos, nulos e não votarão 10 + indecisos 3); contratante Globo |
| Futura, 03/10 | BR-02431/2026, registrada pela 100% Cidades; 2.000 entrevistas | Brasil em Folhas | **Campo corrigido**: 2–3/10, não 25–29/09. Não é a mesma pesquisa de 30/09. Válidos ganharam Zema 0,8 |
| Nexus/BTG, 17/08 | BR-03317/2026; campo 14–16/08; 2.003 entrevistas | Página da Nexus | Lula 41, Flávio 36, Caiado 5, Renan 4 e Zema 4 confirmados |
| PoderData, 27/08 | BR-04974/2026; campo 23–26/08; 2.400 entrevistas | Poder360 | Todos os números confirmados, inclusive os menores e o nv 7 (brancos e nulos 5 + não sabem 2). Pablo Marçal (PRTB) tinha 3% e não chegou à urna |

- **Quaest, 03/10:** os válidos (46 / 45) não são proporcionais aos totais (40 / 38 com 13% de nv: 38 ÷ 87 = 43,7). A Quaest calcula os válidos com um modelo de eleitor provável. Os dois ficaram como publicados, e o site usa os válidos divulgados.
- **Datafolha, 03/10:** a CNN publicou o protocolo BR-03669/2026, com 2.002 entrevistas de 1º a 3/10. No registro do TSE, esse protocolo é o da Datafolha de 03/09 (campo 1º a 3/09, 2.002 entrevistas). Valem o BR-01708/2026 e a CartaCapital.
- **Ainda sem fonte:** na Nexus/BTG de 17/08, Cury (1%) e brancos, nulos e indecisos (7%) vêm dos dados iniciais. A divulgação da Nexus não traz esses números. Eles ficaram, com nota no JSON, porque o nv entra no recálculo dos válidos.
- Os registros também mostram que a série da Futura é registrada pela 100% Cidades Participações, e não com o nome Futura.

## 1ª e 2ª rodadas (imprensa)

As seções abaixo descrevem as duas revisões feitas antes do acesso ao TSE. Os números de resultado citados nelas foram substituídos pelos da 3ª rodada e ficam aqui como histórico. As seções de pesquisas continuam valendo.

### Como os dados foram conferidos

- **seuimposto.com, resultados.tse.jus.br e servicodados.ibge.gov.br não puderam ser acessados**: a política de rede do ambiente de coleta bloqueou esses domínios (HTTP 403 no proxy), inclusive via WebFetch. Não foi possível ler o bundle do seuimposto nem os JSON do TSE.
- **Fontes usadas:** reportagens de apuração e de pesquisas, lidas por resultados de busca. Entre elas, Exame, Gazeta do Povo, Metrópoles, Poder360, CNN, Times Brasil, Money Times, Jornal Opção, O Povo, Rádio Senado e jornais locais. As páginas não puderam ser abertas por inteiro; cada número vem do trecho exibido pelo buscador, com a URL registrada no campo `fonte` dos JSON.
- **Prioridade aplicada:** valor declarado como 100% apurado > maior percentual apurado disponível > conjunto coerente com os votos absolutos > dado do briefing.
- **Pendência principal (resolvida na 3ª rodada):** conferir todos os números com os arquivos oficiais do TSE, que vence qualquer outra fonte.

### Presidente — resultado

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

### Presidente — pesquisas

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

**Sem confirmação em fonte aberta** na 2ª rodada, marcadas com † (todas confirmadas na 3ª rodada; veja acima):

- Datafolha de 03/10, AtlasIntel de 03/10 e Quaest de 03/10. São as finais do briefing. A busca não as encontrou, mas há indício da Datafolha final: uma manchete da CNN fala em "empate de 45% no 2º turno".
- Futura de 03/10. Pode ser a mesma Futura de 30/09 (totais F42,2, L39,4), mas os números não batem exatamente.
- Nexus/BTG de 17/08.
- AtlasIntel de 31/08: brancos, nulos e indecisos (0,3) não confirmados.
- PoderData de 27/08: menores não confirmados.

**Não encontrados no período:**

- Ipsos-Ipec: só aparece a rodada de dez/2025.
- Paraná Pesquisas nacional: a última é de mar/2026.
- Não verificados: Vox Brasil em setembro, Palver e Futura/Apex.

### Senado — resultado

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

### Senado — pesquisas

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

- Em 05/10/2026 o mapa das UFs saiu do site, trocado pelos gráficos de pesquisa × urna. A malha estadual (gis-dataset-brasil, IBGE, DbCL) deixou de ser usada.
