// Metadados fixos: UFs, candidatos a presidente e blocos partidários.

export const STATES = {
  AC: ['Acre', 'Norte'], AL: ['Alagoas', 'Nordeste'], AP: ['Amapá', 'Norte'], AM: ['Amazonas', 'Norte'],
  BA: ['Bahia', 'Nordeste'], CE: ['Ceará', 'Nordeste'], DF: ['Distrito Federal', 'Centro-Oeste'],
  ES: ['Espírito Santo', 'Sudeste'], GO: ['Goiás', 'Centro-Oeste'], MA: ['Maranhão', 'Nordeste'],
  MT: ['Mato Grosso', 'Centro-Oeste'], MS: ['Mato Grosso do Sul', 'Centro-Oeste'], MG: ['Minas Gerais', 'Sudeste'],
  PA: ['Pará', 'Norte'], PB: ['Paraíba', 'Nordeste'], PR: ['Paraná', 'Sul'], PE: ['Pernambuco', 'Nordeste'],
  PI: ['Piauí', 'Nordeste'], RJ: ['Rio de Janeiro', 'Sudeste'], RN: ['Rio Grande do Norte', 'Nordeste'],
  RS: ['Rio Grande do Sul', 'Sul'], RO: ['Rondônia', 'Norte'], RR: ['Roraima', 'Norte'],
  SC: ['Santa Catarina', 'Sul'], SP: ['São Paulo', 'Sudeste'], SE: ['Sergipe', 'Nordeste'], TO: ['Tocantins', 'Norte'],
};
export const UFS = Object.keys(STATES);
export const stateName = uf => STATES[uf]?.[0] ?? uf;

/** Os dois primeiros colocados têm cor própria; os demais usam a neutra. */
export const CANDIDATES = {
  F: { name: 'Flávio Bolsonaro', short: 'Flávio', party: 'PL', tone: 'blue' },
  L: { name: 'Lula', short: 'Lula', party: 'PT', tone: 'red' },
  Caiado: { name: 'Ronaldo Caiado', short: 'Caiado', party: 'PSD', tone: 'other' },
  Renan: { name: 'Renan Santos', short: 'Renan', party: 'Missão', tone: 'other' },
  Cury: { name: 'Augusto Cury', short: 'Cury', party: 'Avante', tone: 'other' },
  Zema: { name: 'Romeu Zema', short: 'Zema', party: 'Novo', tone: 'other' },
};
export const MINOR = ['Caiado', 'Renan', 'Cury', 'Zema'];

/**
 * Blocos usados nas cores do Senado: esquerda e centro-esquerda (vermelho), direita (azul), centro (bege).
 * Partidos fora da lista caem no centro.
 */
export const BLOCS = {
  esquerda: { label: 'Esquerda e centro-esquerda', parties: ['PT', 'PSB', 'PDT', 'Rede', 'PSOL', 'PCdoB', 'PV', 'UP', 'PSTU', 'PCB', 'PCO'] },
  direita: { label: 'Direita', parties: ['PL', 'Novo', 'PP', 'Republicanos', 'União', 'PRD', 'Missão', 'PRTB', 'DC'] },
  centro: { label: 'Centro', parties: ['MDB', 'PSD', 'PSDB', 'Podemos', 'Avante', 'Solidariedade', 'Cidadania', 'Agir', 'Mobiliza'] },
};
export const BLOC_ORDER = ['esquerda', 'centro', 'direita'];

export function blocOf(party) {
  if (!party) return null;
  for (const [key, bloc] of Object.entries(BLOCS)) if (bloc.parties.includes(party)) return key;
  return 'centro';
}
