// Converte os campos do formulário da calculadora em EntradaSalario.

import type { AuxilioMoradia, Curso, EntradaSalario, IncidenciaPensao, Situacao } from './calculo';
import { POSTOS, type Corporacao, type Posto } from './tabelas';

/** Lê um valor digitado no formato brasileiro ("1.234,56", "R$ 89,90", "20"). */
export function lerDecimal(texto: string | null | undefined): number | null {
  if (texto == null) return null;
  let s = String(texto).replace(/R\$|\s/g, '');
  if (!s) return null;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

const inteiro = (texto: string | null) => {
  const n = texto ? Number.parseInt(texto, 10) : 0;
  return Number.isFinite(n) ? n : 0;
};

/** Valores do formulário, por nome do campo (o que FormData devolve). */
export type Campos = Record<string, string | string[]>;

export function camposDe(form: HTMLFormElement): Campos {
  const dados = new FormData(form);
  const campos: Campos = {};
  for (const nome of new Set(dados.keys())) {
    const todos = dados.getAll(nome).map(String);
    campos[nome] = nome === 'cursos' ? todos : (todos[0] ?? '');
  }
  return campos;
}

const um = (c: Campos, nome: string): string => {
  const v = c[nome];
  return Array.isArray(v) ? (v[0] ?? '') : (v ?? '');
};

/**
 * Monta a entrada do cálculo. Devolve null enquanto faltar posto,
 * corporação ou situação, que são obrigatórios.
 */
export function lerEntrada(c: Campos): EntradaSalario | null {
  const posto = um(c, 'posto');
  const corporacao = um(c, 'corporacao');
  const situacao = um(c, 'situacao');
  if (!(POSTOS as readonly string[]).includes(posto)) return null;
  if (corporacao !== 'pmdf' && corporacao !== 'cbmdf') return null;
  if (situacao !== 'ativo' && situacao !== 'inativo') return null;

  const auxMoradia = um(c, 'auxMoradia');
  const cursos = (Array.isArray(c.cursos) ? c.cursos : c.cursos ? [c.cursos] : [])
    .map(Number)
    .filter((n): n is Curso => [10, 15, 20, 30].includes(n));
  const percentualPA = lerDecimal(um(c, 'percentualPensao'));
  const gfne = inteiro(um(c, 'gfne'));
  const cargo = um(c, 'gratificacaoGDF');
  const preEscolar = inteiro(um(c, 'preEscolar'));

  return {
    posto: posto as Posto,
    corporacao: corporacao as Corporacao,
    situacao: situacao as Situacao,
    auxMoradia: auxMoradia === 'comDependente' || auxMoradia === 'semDependente' ? (auxMoradia as AuxilioMoradia) : null,
    cursos,
    dependentesIR: inteiro(um(c, 'dependentesIR')),
    dependentesFundoSaude: inteiro(um(c, 'dependentesFundoSaude')),
    preEscolar,
    gfne: gfne > 0 ? gfne : null,
    gratificacaoGDF: cargo && cargo !== 'nao_recebe' ? cargo : null,
    anosATS: lerDecimal(um(c, 'anosATS')),
    pttc: situacao === 'inativo' && um(c, 'pttc') === 'sim',
    pensaoMilitarAdicional: um(c, 'pensaoMilitarAdicional') === 'sim',
    horasServicoVoluntario: lerDecimal(um(c, 'horasServicoVoluntario')),
    pensaoAlimenticia: percentualPA
      ? {
          percentual: percentualPA,
          tipo: (um(c, 'tipoPensao') || 'liquido') as IncidenciaPensao,
          preEscolarRevertido: Math.min(inteiro(um(c, 'preEscolarRevertido')), preEscolar),
        }
      : null,
    reparacaoErario: lerDecimal(um(c, 'reparacaoErario')),
    descontosDedutiveis: lerDecimal(um(c, 'descontosDedutiveis')),
    descontosNaoDedutiveis: lerDecimal(um(c, 'descontosNaoDedutiveis')),
  };
}

export const formatarReais = (x: number) =>
  x.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
