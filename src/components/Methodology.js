import { html } from '../lib/html.js';
import { longDate, num, pct, shortDate } from '../lib/format.js';
import { distancia, FINAL_WEEK, resultShares, totais, validos } from '../lib/metrics.js';
import { leadText } from './GapChart.js';
import { BackButton } from './ui.js';

export const REPO = 'https://github.com/matheusmarquesr7-star/pesquisas-urnas-2026';

const SOURCES = [
  ['Resultado nacional para Presidente (100%)', 'https://www.gazetadopovo.com.br/eleicoes/2026/flavio-vence-lula-em-15-estados-df/'],
  ['Mapa de apuração da Exame (brancos, nulos e comparecimento com 99,79%)', 'https://exame.com/eleicoes/2026/apuracao/primeiro-turno/presidente/mapa-de-apuracao/'],
  ['Metrópoles: Flávio vence em 15 UFs, Lula em 12', 'https://www.metropoles.com/brasil/eleicoes-2026-flavio-leva-1o-turno-em-15-estados-lula-em-12'],
  ['Times Brasil: resultado para Presidente no Nordeste', 'https://timesbrasil.com.br/brasil/decisao-2026-confira-o-resultado-da-eleicao-para-presidente-no-nordeste/'],
  ['Rádio Senado: PL elege 19 senadores', 'https://www12.senado.leg.br/radio/1/noticia/2026/10/04/pl-elege-19-senadores-e-tera-a-maior-bancada-do-senado'],
  ['Agência Brasil: quem são os novos senadores', 'https://agenciabrasil.ebc.com.br/politica/noticia/2026-10/veja-quem-sao-os-novos-senadores-e-como-fica-composicao-do-senado'],
  ['TSE: resultados oficiais (para conferência)', 'https://resultados.tse.jus.br/'],
];

const names = polls => polls.map(p => `${p.inst} (${shortDate(p.divulgacao)})`).join(', ');

export function Methodology({ result, polls, onBack, updated }) {
  const blank = result.comparecimento.brancos_pct + result.comparecimento.nulos_pct;
  const dates = polls.map(p => p.divulgacao).filter(Boolean).sort();
  const noValid = polls.filter(p => !validos(p));
  const noTotal = polls.filter(p => !totais(p));
  const gap = leadText(distancia(resultShares(result)), 2);
  return html`<article class="methodology" aria-labelledby="metodologia-titulo">
    <div class="methodology-nav"><${BackButton} to="o painel" onClick=${onBack}/></div>
    <h2 id="metodologia-titulo">Como o site compara pesquisas e urnas</h2>
    <p class="lead">Juntamos as principais pesquisas divulgadas entre ${longDate(dates[0])} e ${longDate(dates.at(-1))} de 2026 e medimos quanto cada uma se afastou do resultado do 1º turno, em ${longDate(result.data)}. Dados atualizados em ${longDate(updated)}.</p>

    <section>
      <h3>Votos válidos × votos totais</h3>
      <p><b>Votos válidos</b> são os dados a candidatos, sem brancos e nulos. É assim que o TSE divulga o resultado, e é a base padrão do site. <b>Votos totais</b> incluem brancos, nulos e, nas pesquisas, os indecisos. Para comparar uma pesquisa em votos totais com as urnas, convertemos o resultado: válido × (1 − brancos e nulos ÷ 100). Brancos e nulos somaram ${pct(blank, 2)} do comparecimento (${pct(result.comparecimento.brancos_pct, 2)} + ${pct(result.comparecimento.nulos_pct, 2)}, com ${num(result.comparecimento.apurado_ref, 2)}% apurado). Ainda assim, a comparação em totais pende contra as pesquisas, porque elas têm indecisos e a urna não.</p>
    </section>

    <section>
      <h3>Quando recalculamos os válidos</h3>
      <p>Se o instituto só divulgou votos totais, recalculamos: <code>válido = total × 100 ÷ (100 − brancos − nulos − indecisos)</code>. Esses valores aparecem com <b>*</b>.${noValid.length ? ` Sem brancos, nulos e indecisos divulgados (${names(noValid)}), não há como recalcular, e a pesquisa só aparece em votos totais.` : ''}${noTotal.length ? ` ${names(noTotal)} ${noTotal.length > 1 ? 'divulgaram' : 'divulgou'} apenas válidos e por isso ${noTotal.length > 1 ? 'ficam' : 'fica'} de fora da base de votos totais.` : ''}</p>
    </section>

    <section>
      <h3>As medidas de erro</h3>
      <ul>
        <li><b>Distância</b> = Flávio − Lula. Positiva: Flávio à frente. Nas urnas: ${gap}.</li>
        <li><b>Erro na distância</b> = |distância da pesquisa − distância das urnas|. É a medida principal do ranking: diz quanto a pesquisa errou a diferença entre os dois primeiros.</li>
        <li><b>Erro médio</b> = média de |pesquisa − urna| entre os candidatos que aparecem na pesquisa e no resultado.</li>
        <li><b>Viés</b> = distância da pesquisa − distância das urnas, com sinal. Negativo: subestimou Flávio em relação a Lula.</li>
        <li><b>Ordem</b>: “certa” quando a pesquisa pôs à frente quem terminou em 1º.</li>
        <li><b>Pesquisas finais</b>: a última de cada instituto divulgada a partir de ${longDate(FINAL_WEEK)} (semana da eleição). A média delas aparece no placar.</li>
        <li><b>Média móvel</b>: para cada dia, a média das pesquisas divulgadas nos 10 dias anteriores (inclusive).</li>
      </ul>
    </section>

    <section>
      <h3>Senado: “acertou a dupla?”</h3>
      <p>Em cada UF, duas vagas. Pegamos os dois primeiros da pesquisa e contamos quantos foram eleitos: 2/2 (verde), 1/2 (amarelo) ou 0/2 (vermelho). Quando só o líder foi divulgado, a pesquisa não é avaliável (cinza). Se o 2º e o 3º empatam, os empatados que foram eleitos ocupam a vaga restante, e o selo ganha um *. No resumo, vale a última pesquisa de cada instituto em cada UF; na mesma data, preferimos a versão em votos válidos.</p>
      <p>As bases variam: <b>VV</b> (1º + 2º voto reescalados a 100%) é comparável ao resultado; <b>VT</b> (votos totais) inclui indecisos; <b>Soma 200%</b> soma as menções, já que cada eleitor cita dois nomes. Para exibir as de 200% junto das demais, dividimos cada valor pela soma dos nomes listados e multiplicamos por 100 (“normalizado”). Só a base VV entra no erro médio e no ranking de erro do Senado. As outras aparecem nas tabelas com o selo da base.</p>
      <p>Cores do mapa: esquerda e centro-esquerda (PT, PSB, PDT, Rede, PSOL) em vermelho; direita (PL, Novo, PP, Republicanos, União) em azul; centro (MDB, PSD, PSDB, Podemos) em bege. Cada metade da UF é uma vaga.</p>
    </section>

    <section>
      <h3>Datas</h3>
      <p>Cada pesquisa fica na data de <b>divulgação</b>. Quando não achamos a data exata, usamos o fim do campo + 2 dias e marcamos com <b>≈</b>. Pesquisas divulgadas no mesmo dia são levemente afastadas no gráfico para não se sobreporem.</p>
    </section>

    <section>
      <h3>Fontes e limitações</h3>
      <p>Os números do TSE e do seuimposto.com não puderam ser lidos diretamente durante a coleta. O resultado foi conferido em veículos de imprensa que publicaram a apuração, e as divergências entre fontes, os dados parciais e as lacunas estão listados em <a href="./divergencias.md" target="_blank" rel="noopener">divergencias.md</a>. Quando o TSE publicar os arquivos finais, basta atualizar os JSON em <code>src/data/</code>.</p>
      <ul class="sources">${SOURCES.map(([label, url]) => html`<li key=${url}><a href=${url} target="_blank" rel="noopener">${label}</a></li>`)}</ul>
      <p class="note">Malha estadual: IBGE (via gis-dataset-brasil, licença DbCL), simplificada com mapshaper. Desenho da interface baseado no projeto open-apuracao-brazil (MIT), na linguagem visual do seuimposto.com. Código: <a href=${REPO} target="_blank" rel="noopener">${REPO.replace('https://', '')}</a>.</p>
    </section>
  </article>`;
}
