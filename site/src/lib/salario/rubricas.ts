// Linhas da folha de contracheque: em que grupo cada rubrica aparece, se é
// vantagem ou desconto, o rótulo e o que mostrar na coluna "Ref.".
// A descrição e a base legal vêm de rubricas-antigas.json, extraído do site
// antigo por scripts/extrair-rubricas.cjs.

import type { EntradaSalario, ResultadoSalario } from './calculo';
import type { Tabelas } from './tabelas';
import antigas from './rubricas-antigas.json';

export type Grupo = 'remuneracao' | 'direitos' | 'descontos' | 'eventuais';
export type Natureza = 'credito' | 'debito';

export interface Rubrica {
  campo: keyof ResultadoSalario;
  rotulo: string;
  grupo: Grupo;
  natureza: Natureza;
  /** Chave da rubrica no site antigo, para buscar descrição e base legal. */
  antiga: keyof typeof antigas;
  /** Texto da coluna "Ref." (percentual, quantidade, nível). */
  referencia?: (e: EntradaSalario, t: Tabelas) => string;
}

const pct = (x: number) => `${(x * 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;

export const RUBRICAS: Rubrica[] = [
  { campo: 'soldo', rotulo: 'Soldo', grupo: 'remuneracao', natureza: 'credito', antiga: 'soldo' },
  { campo: 'adicionalPostoGraduacao', rotulo: 'Adicional de posto ou graduação', grupo: 'remuneracao', natureza: 'credito', antiga: 'apg' },
  {
    campo: 'adicionalTempoServico', rotulo: 'Adicional de tempo de serviço', grupo: 'remuneracao', natureza: 'credito', antiga: 'ats',
    referencia: (e) => (e.anosATS ? `${Math.trunc(e.anosATS)}%` : ''),
  },
  { campo: 'complementoSoldo', rotulo: 'Complemento de soldo', grupo: 'remuneracao', natureza: 'credito', antiga: 'compl_soldo' },
  { campo: 'adicionalOperacoesMilitares', rotulo: 'Adicional de operações militares', grupo: 'remuneracao', natureza: 'credito', antiga: 'aom' },
  { campo: 'gratificacaoRepresentacao', rotulo: 'Gratificação de representação militar', grupo: 'remuneracao', natureza: 'credito', antiga: 'gfr' },
  {
    campo: 'adicionalCertificacao', rotulo: 'Adicional de certificação profissional', grupo: 'remuneracao', natureza: 'credito', antiga: 'acp',
    referencia: (e) => `${e.cursos.reduce((s, c) => s + c, 0)}%`,
  },
  { campo: 'gcef', rotulo: 'GCEF', grupo: 'remuneracao', natureza: 'credito', antiga: 'gcef' },
  { campo: 'vpe', rotulo: 'Vantagem pecuniária especial (VPE)', grupo: 'remuneracao', natureza: 'credito', antiga: 'vpe' },
  { campo: 'grv', rotulo: 'Gratificação por risco de vida', grupo: 'remuneracao', natureza: 'credito', antiga: 'grv' },
  {
    campo: 'gfne', rotulo: 'GFNE', grupo: 'remuneracao', natureza: 'credito', antiga: 'gfne',
    referencia: (e) => (e.gfne ? `nível ${['', 'I', 'II', 'III', 'IV', 'V'][e.gfne] ?? e.gfne}` : ''),
  },
  {
    campo: 'gratificacaoGDF', rotulo: 'Gratificação de cargo no GDF', grupo: 'remuneracao', natureza: 'credito', antiga: 'gratGDF',
    referencia: (e) => e.gratificacaoGDF ?? '',
  },
  {
    campo: 'pttc', rotulo: 'PTTC', grupo: 'remuneracao', natureza: 'credito', antiga: 'pttc',
    referencia: (_e, t) => pct(t.percentualPTTC),
  },
  {
    campo: 'servicoVoluntario', rotulo: 'Gratificação de serviço voluntário', grupo: 'remuneracao', natureza: 'credito', antiga: 'gsv',
    referencia: (e) => (e.horasServicoVoluntario ? `${Math.round(e.horasServicoVoluntario)} h` : ''),
  },

  {
    campo: 'auxilioMoradia', rotulo: 'Auxílio-moradia', grupo: 'direitos', natureza: 'credito', antiga: 'aux_mor',
    referencia: (e) => (e.auxMoradia === 'comDependente' ? 'c/ dep.' : e.auxMoradia === 'semDependente' ? 's/ dep.' : ''),
  },
  { campo: 'etapaAlimentacao', rotulo: 'Etapa alimentação', grupo: 'direitos', natureza: 'credito', antiga: 'alim' },
  {
    campo: 'auxilioPreEscolar', rotulo: 'Auxílio pré-escolar', grupo: 'direitos', natureza: 'credito', antiga: 'aux_pe',
    referencia: (e) => (e.preEscolar ? `${e.preEscolar} dep.` : ''),
  },

  {
    campo: 'pensaoMilitar', rotulo: 'Contribuição para pensão militar', grupo: 'descontos', natureza: 'debito', antiga: 'contr_pensao_militar',
    referencia: (_e, t) => pct(t.aliquotaPensaoMilitar),
  },
  {
    campo: 'pensaoMilitarAdicional', rotulo: 'Pensão militar adicional', grupo: 'descontos', natureza: 'debito', antiga: 'contr_pensao_militar_adic',
    referencia: (_e, t) => pct(t.aliquotaPensaoMilitarAdicional),
  },
  {
    campo: 'fundoSaude', rotulo: 'Fundo de saúde', grupo: 'descontos', natureza: 'debito', antiga: 'fundo_saude',
    referencia: (_e, t) => pct(t.aliquotaFundoSaude),
  },
  {
    campo: 'fundoSaudeDependentes', rotulo: 'Fundo de saúde, dependentes', grupo: 'descontos', natureza: 'debito', antiga: 'fundo_saude_adicional',
    referencia: (e) => (e.dependentesFundoSaude ? `${e.dependentesFundoSaude} dep.` : ''),
  },
  {
    campo: 'cotaPreEscolar', rotulo: 'Cota pré-escolar', grupo: 'descontos', natureza: 'debito', antiga: 'cota_pe',
    referencia: (e) => (e.preEscolar ? `${e.preEscolar} dep.` : ''),
  },
  {
    campo: 'pensaoAlimenticia', rotulo: 'Pensão alimentícia', grupo: 'descontos', natureza: 'debito', antiga: 'pensao_alim',
    referencia: (e) => (e.pensaoAlimenticia ? `${e.pensaoAlimenticia.percentual.toLocaleString('pt-BR')}%` : ''),
  },
  {
    campo: 'pensaoAlimenticiaPreEscolar', rotulo: 'Pensão alimentícia sobre pré-escolar', grupo: 'descontos', natureza: 'debito', antiga: 'pensao_alim_pe',
    referencia: (e) => (e.pensaoAlimenticia?.preEscolarRevertido ? `${e.pensaoAlimenticia.preEscolarRevertido} dep.` : ''),
  },
  { campo: 'reparacaoErario', rotulo: 'Reparação ao erário', grupo: 'descontos', natureza: 'debito', antiga: 'reparacao_erario' },
  { campo: 'descontosDedutiveis', rotulo: 'Outros descontos dedutíveis', grupo: 'descontos', natureza: 'debito', antiga: 'outros_descontos_dedutiveis' },
  { campo: 'descontosNaoDedutiveis', rotulo: 'Outros descontos não dedutíveis', grupo: 'descontos', natureza: 'debito', antiga: 'outros_descontos_nao_dedutiveis' },
  {
    campo: 'impostoRenda', rotulo: 'Imposto de renda retido na fonte', grupo: 'descontos', natureza: 'debito', antiga: 'irrf',
    referencia: (e) => (e.dependentesIR ? `${e.dependentesIR} dep.` : ''),
  },

  { campo: 'decimoTerceiro', rotulo: 'Gratificação natalina (13º)', grupo: 'eventuais', natureza: 'credito', antiga: 'decimo_terceiro' },
  { campo: 'impostoRendaDecimoTerceiro', rotulo: 'Imposto de renda sobre o 13º', grupo: 'eventuais', natureza: 'debito', antiga: 'irrf_decimo_terceiro' },
  { campo: 'pensaoAlimenticiaDecimoTerceiro', rotulo: 'Pensão alimentícia sobre o 13º', grupo: 'eventuais', natureza: 'debito', antiga: 'pa_decimo_terceiro' },
  { campo: 'ferias', rotulo: 'Adicional de férias (1/3)', grupo: 'eventuais', natureza: 'credito', antiga: 'ferias' },
  { campo: 'impostoRendaFerias', rotulo: 'Imposto de renda sobre férias', grupo: 'eventuais', natureza: 'debito', antiga: 'irrf_ferias' },
  { campo: 'auxilioFardamento', rotulo: 'Auxílio fardamento', grupo: 'eventuais', natureza: 'credito', antiga: 'auxilio_fardamento' },
];

export const GRUPOS: { id: Grupo; titulo: string }[] = [
  { id: 'remuneracao', titulo: 'Remuneração' },
  { id: 'direitos', titulo: 'Direitos pecuniários' },
  { id: 'descontos', titulo: 'Descontos' },
];

export interface Explicacao {
  descricao: string | null;
  calculo: string | null;
  baseLegal: string | null;
  baseLegalLink: string | null;
}

/** Descrição, valores e base legal da rubrica, em HTML vindo do site antigo. */
export function explicacao(r: Rubrica): Explicacao | null {
  const a = antigas[r.antiga];
  if (!a || typeof a === 'string') return null;
  if (!a.descricao && !a.baseLegal && !a.calculo) return null;
  return {
    descricao: a.descricao,
    calculo: a.calculo,
    baseLegal: a.baseLegal,
    baseLegalLink: a.baseLegalLink,
  };
}

export const FORMAS_PENSAO_HTML = antigas.pa_forma_calculo as string;
