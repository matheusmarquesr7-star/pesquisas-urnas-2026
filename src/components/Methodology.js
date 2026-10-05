import { html } from '../lib/html.js';
import { longDate, num, pct, shortDate } from '../lib/format.js';
import { distancia, FINAL_WEEK, resultShares, totais, validos } from '../lib/metrics.js';
import { leadText } from './GapChart.js';
import { BackButton } from './ui.js';

export const REPO = 'https://github.com/matheusmarquesr7-star/pesquisas-urnas-2026';

const SOURCES = [
  ['TSE: resultado oficial para Presidente, Brasil (100% das seções)', 'https://resultados.tse.jus.br/oficial/ele2026/6257/dados/br/br-c0001-e006257-u.json'],
  ['TSE: resultado oficial para Senado, São Paulo (troque sp pela sigla da UF)', 'https://resultados.tse.jus.br/oficial/ele2026/6259/dados/sp/sp-c0005-e006259-u.json'],
  ['TSE: painel de resultados', 'https://resultados.tse.jus.br/'],
  ['Rádio Senado: PL elege 19 senadores', 'https://www12.senado.leg.br/radio/1/noticia/2026/10/04/pl-elege-19-senadores-e-tera-a-maior-bancada-do-senado'],
  ['Agência Brasil: quem são os novos senadores', 'https://agenciabrasil.ebc.com.br/politica/noticia/2026-10/veja-quem-sao-os-novos-senadores-e-como-fica-composicao-do-senado'],
];

const names = polls => polls.map(p => `${p.inst} (${shortDate(p.divulgacao)})`).join(', ');

export function Methodology({ result, polls, onBack, updated, source }) {
  const blank = result.comparecimento.brancos_pct + result.comparecimento.nulos_pct;
  const dates = polls.map(p => p.divulgacao).filter(Boolean).sort();
  const noValid = polls.filter(p => !validos(p));
  const noTotal = polls.filter(p => !totais(p));
  const gap = leadText(distancia(resultShares(result)), 2);
  const unconfirmed = polls.filter(p => p.confirmada === false);
  return html`<article class="methodology" aria-labelledby="metodologia-titulo">
    <div class="methodology-nav"><${BackButton} to="o painel" onClick=${onBack}/></div>
    <h2 id="metodologia-titulo">Como o site compara pesquisas e urnas</h2>
    <p class="lead">Juntamos as principais pesquisas divulgadas entre ${longDate(dates[0])} e ${longDate(dates.at(-1))} de 2026 e medimos quanto cada uma se afastou do resultado do 1º turno, em ${longDate(result.data)}. Dados atualizados em ${longDate(updated)}.</p>

    <section>
      <h3>Votos válidos × votos totais</h3>
      <p><b>Votos válidos</b> são os dados a candidatos, sem brancos e nulos. É assim que o TSE divulga o resultado, e é a base padrão do site. <b>Votos totais</b> incluem brancos, nulos e, nas pesquisas, os indecisos. Para comparar uma pesquisa em votos totais com as urnas, convertemos o resultado: válido × (1 − brancos e nulos ÷ 100). Brancos e nulos somaram ${pct(blank, 2)} do comparecimento (${pct(result.comparecimento.brancos_pct, 2)} + ${pct(result.comparecimento.nulos_pct, 2)}, ${result.comparecimento.apurado_ref === 100 ? 'segundo o TSE' : `com ${num(result.comparecimento.apurado_ref, 2)}% apurado`}). Ainda assim, a comparação em totais pende contra as pesquisas, porque elas têm indecisos e a urna não.</p>
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
      <p>Cores dos partidos: esquerda e centro-esquerda (PT, PSB, PDT, Rede, PSOL) em vermelho; direita (PL, Novo, PP, Republicanos, União) em azul; centro (MDB, PSD, PSDB, Podemos) em bege.</p>
    </section>

    <section>
      <h3>Pesquisas não confirmadas (†)</h3>
      <p>Os dados iniciais foram revisados em ${longDate(updated)} contra reportagens publicadas e o registro de pesquisas do TSE. ${unconfirmed.length ? `${unconfirmed.length} pesquisas presidenciais não apareceram em nenhuma fonte aberta encontrada: ${names(unconfirmed)}. Elas continuam no site, marcadas com †, porque vieram de quem montou os dados, mas devem ser conferidas no registro do TSE.` : 'Todas as pesquisas foram encontradas em fontes abertas.'}</p>
    </section>

    <section>
      <h3>Datas</h3>
      <p>Cada pesquisa fica na data de <b>divulgação</b>. Quando não achamos a data exata, usamos o fim do campo + 2 dias e marcamos com <b>≈</b>. Pesquisas divulgadas no mesmo dia são levemente afastadas no gráfico para não se sobreporem.</p>
    </section>

    <section>
      <h3>Fontes e limitações</h3>
      <p>O resultado vem dos arquivos oficiais do TSE, com 100% das seções totalizadas. As pesquisas foram conferidas em reportagens e no registro de pesquisas do TSE. O que mudou em cada revisão e o que ficou sem fonte está em <a href="./divergencias.md" target="_blank" rel="noopener">divergencias.md</a>.</p>
      <p>Os dados ficam no Supabase, na tabela <code>pu26_datasets</code>, e o site os lê ao vivo: corrigir um número ali atualiza o site sem novo deploy. ${source === 'supabase' ? 'Esta visita está usando os dados ao vivo.' : 'Nesta visita o Supabase não respondeu, e o site usa a cópia dos dados embutida no último build.'}</p>
      <ul class="sources">${SOURCES.map(([label, url]) => html`<li key=${url}><a href=${url} target="_blank" rel="noopener">${label}</a></li>`)}</ul>
      <p class="note">Desenho da interface baseado no projeto open-apuracao-brazil (MIT), na linguagem visual do seuimposto.com. Código: <a href=${REPO} target="_blank" rel="noopener">${REPO.replace('https://', '')}</a>.</p>
    </section>
  </article>`;
}
