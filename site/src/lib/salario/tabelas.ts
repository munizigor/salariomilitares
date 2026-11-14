// Tabelas de remuneração por competência. Cada reajuste entra como um novo
// arquivo JSON em ./tabelas, gerado por scripts/extrair-tabelas-salario.cjs ou
// escrito à mão a partir da lei.

import jan2026 from './tabelas/2026-01.json';

export const POSTOS = [
  'CORONEL',
  'TENENTE-CORONEL',
  'MAJOR',
  'CAPITAO',
  'PRIMEIRO TENENTE',
  'SEGUNDO TENENTE',
  'ASPIRANTE',
  'SUBTENENTE',
  'PRIMEIRO SARGENTO',
  'SEGUNDO SARGENTO',
  'TERCEIRO SARGENTO',
  'CABO',
  'SOLDADO PRIMEIRA CLASSE',
  'SOLDADO SEGUNDA CLASSE',
  'CADETE ULTIMO ANO',
  'CADETE DEMAIS ANOS',
] as const;

export type Posto = (typeof POSTOS)[number];
export type Corporacao = 'pmdf' | 'cbmdf';

/** Nome por extenso para exibição. */
export const NOME_POSTO: Record<Posto, string> = {
  CORONEL: 'Coronel',
  'TENENTE-CORONEL': 'Tenente-coronel',
  MAJOR: 'Major',
  CAPITAO: 'Capitão',
  'PRIMEIRO TENENTE': '1º Tenente',
  'SEGUNDO TENENTE': '2º Tenente',
  ASPIRANTE: 'Aspirante',
  SUBTENENTE: 'Subtenente',
  'PRIMEIRO SARGENTO': '1º Sargento',
  'SEGUNDO SARGENTO': '2º Sargento',
  'TERCEIRO SARGENTO': '3º Sargento',
  CABO: 'Cabo',
  'SOLDADO PRIMEIRA CLASSE': 'Soldado de 1ª classe',
  'SOLDADO SEGUNDA CLASSE': 'Soldado de 2ª classe',
  'CADETE ULTIMO ANO': 'Cadete do último ano',
  'CADETE DEMAIS ANOS': 'Cadete dos demais anos',
};

export interface TabelaPosto {
  soldo: number;
  adicionalPostoGraduacao: number;
  adicionalOperacoesMilitares: number;
  gratificacaoRepresentacao: number;
  vpe: number;
  auxilioMoradia: { comDependente: number; semDependente: number };
  fundoSaudePorDependente: Record<Corporacao, number>;
}

export interface Tabelas {
  /** Mês de referência no formato AAAA-MM. */
  competencia: string;
  salarioMinimo: number;
  aliquotaPensaoMilitar: number;
  aliquotaPensaoMilitarAdicional: number;
  aliquotaFundoSaude: number;
  etapaAlimentacao: number;
  gcef: number;
  grv: number;
  auxilioPreEscolar: number;
  cotaPreEscolar: number;
  valorHoraServicoVoluntario: number;
  percentualPTTC: number;
  gfne: Record<string, number>;
  cargosGDF: Record<string, { representacao: number; remuneracao: number }>;
  irrf: {
    deducaoPorDependente: number;
    faixas: { acimaDe: number; aliquota: number; deducao: number }[];
  };
  postos: Record<Posto, TabelaPosto>;
}

export const TABELAS: Record<string, Tabelas> = {
  '2026-01': jan2026 as Tabelas,
};

/** Competência usada por padrão na calculadora: a mais recente. */
export const COMPETENCIA_ATUAL = Object.keys(TABELAS).sort().at(-1)!;
export const tabelasAtuais = () => TABELAS[COMPETENCIA_ATUAL]!;
