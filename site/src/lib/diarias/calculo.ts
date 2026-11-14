// Cálculo de diárias nacionais e ajuda de custo.
//
// Porte fiel das funções do sisdiarias (calc_datas, diarias, ajudadecusto).
// As regras de período, inclusive o salto entre 60 e 61 dias, foram mantidas
// como estão no sistema antigo; tests/diarias.test.ts compara com ele.

import tabela from './tabelas/decreto-12324-2024.json';
import { truncarCentavos } from '../salario/calculo';
import type { Curso } from '../salario/calculo';
import type { Posto, Tabelas as TabelasSalario } from '../salario/tabelas';

export type PostoDiaria = Posto | 'CEL CMT-GERAL';
export type Destino = keyof typeof tabela.destinos;

export const TABELA_DIARIAS = tabela as {
  norma: string;
  normaLink: string;
  destinos: Record<Destino, { nome: string; valores: Record<PostoDiaria, number> }>;
};

/** Destinos que aparecem na calculadora (Brasília fica de fora: é a sede). */
export const DESTINOS: Destino[] = ['BEL', 'FOR', 'MAN', 'POA', 'REC', 'RIO', 'SAL', 'SAO', 'CAP', 'DES'];

export interface Periodo {
  dias: number;
  /** Missão eventual: menos de 30 dias e sem mudança de domicílio. */
  missaoEventual: boolean;
  /** Se o usuário pode trocar a classificação da missão (30 dias ou mais). */
  missaoEditavel: boolean;
  quantidadeDiarias: number;
  ajudaCustoIda: number;
  ajudaCustoVolta: number;
}

const DIA = 864e5;

/**
 * Dias de afastamento, classificação da missão e quantas diárias e ajudas de
 * custo cabem. Datas no formato AAAA-MM-DD. `missaoEventual` é a escolha do
 * usuário; null usa a classificação automática.
 */
export function calcularPeriodo(saida: string, retorno: string, missaoEventual: boolean | null = null): Periodo | null {
  const s = Date.parse(saida + 'T00:00:00Z');
  const r = Date.parse(retorno + 'T00:00:00Z');
  if (Number.isNaN(s) || Number.isNaN(r) || r < s) return null;
  const dias = Math.ceil(Math.abs(r - s) / DIA) + 1;

  const automatica = dias < 30 ? true : dias < 60 ? false : true;
  const missaoEditavel = dias >= 30;
  const eventual = missaoEditavel && missaoEventual !== null ? missaoEventual : automatica;

  let quantidadeDiarias: number;
  if (dias < 30 && dias > 0) quantidadeDiarias = dias - 0.5;
  else if (dias >= 30 && dias <= 60 && eventual) quantidadeDiarias = dias - 0.5;
  else if (dias >= 30 && dias <= 60) quantidadeDiarias = 0;
  else if (dias > 0 && eventual) quantidadeDiarias = dias - 60;
  else quantidadeDiarias = 0;

  let ida = 0;
  let volta = 0;
  if (dias < 30) [ida, volta] = [0, 0];
  else if (dias <= 60 && !eventual) [ida, volta] = [1, 1];
  else if (dias <= 60 && eventual) [ida, volta] = [0, 0];
  else if (dias > 180) [ida, volta] = [2, 2];
  else if (dias > 90) [ida, volta] = [2, 1];
  else [ida, volta] = [1, 1];

  return { dias, missaoEventual: eventual, missaoEditavel, quantidadeDiarias, ajudaCustoIda: ida, ajudaCustoVolta: volta };
}

export interface ResultadoDiarias {
  valorDiaria: number;
  bruto: number;
  /** Desconto do auxílio-alimentação pelos dias fora (1/30 por diária). */
  descontoAlimentacao: number;
  liquido: number;
}

export function calcularDiarias(
  destino: Destino,
  posto: PostoDiaria,
  quantidade: number,
  etapaAlimentacao: number,
): ResultadoDiarias {
  const valorDiaria = TABELA_DIARIAS.destinos[destino].valores[posto];
  const bruto = Math.round(valorDiaria * quantidade * 100) / 100;
  const descontoAlimentacao = Math.round((etapaAlimentacao / 30) * quantidade * 100) / 100;
  return { valorDiaria, bruto, descontoAlimentacao, liquido: bruto - descontoAlimentacao };
}

export interface ResultadoAjudaCusto {
  remuneracaoBase: number;
  ida: number;
  volta: number;
  total: number;
}

/**
 * Ajuda de custo: uma remuneração por ajuda (ida e volta), pela metade quando
 * o militar não leva dependente. `comDependente` null conta como com.
 */
export function calcularAjudaCusto(
  posto: PostoDiaria,
  cursos: Curso[],
  anosATS: number | null,
  ajudasIda: number,
  ajudasVolta: number,
  comDependente: boolean | null,
  t: TabelasSalario,
): ResultadoAjudaCusto {
  const p = t.postos[posto === 'CEL CMT-GERAL' ? 'CORONEL' : posto];
  const tempoServico = anosATS == null ? 0 : truncarCentavos((anosATS / 100) * p.soldo);
  const pctCursos = cursos.reduce((s, c) => s + c, 0);
  const certificacao = truncarCentavos((pctCursos / 100) * p.soldo);
  const remuneracaoBase = truncarCentavos(
    t.gcef +
      t.grv +
      p.soldo +
      p.vpe +
      p.adicionalPostoGraduacao +
      p.adicionalOperacoesMilitares +
      p.gratificacaoRepresentacao +
      tempoServico +
      certificacao,
  );
  let ida = remuneracaoBase * ajudasIda;
  let volta = remuneracaoBase * ajudasVolta;
  if (comDependente === false) {
    ida = ida / 2;
    volta = volta / 2;
  }
  return { remuneracaoBase, ida, volta, total: ida + volta };
}
