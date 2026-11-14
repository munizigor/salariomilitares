// Cálculo da remuneração dos militares do DF (PMDF e CBMDF).
//
// Porte fiel de static/js/calc.js do site antigo. A ordem das somas e os
// arredondamentos foram mantidos de propósito: qualquer mudança aqui altera
// centavos, e os testes em tests/salario.test.ts comparam cada rubrica com os
// valores que a calculadora antiga produz.

import type { Tabelas, Posto, Corporacao } from './tabelas';

export type Situacao = 'ativo' | 'inativo';
export type AuxilioMoradia = 'comDependente' | 'semDependente';
export type IncidenciaPensao = 'liquido' | 'bruto_com_indenizacoes' | 'bruto' | 'sal_minimo';

/** Percentuais do adicional de certificação profissional por nível de curso. */
export type Curso = 10 | 15 | 20 | 30;

export interface PensaoAlimenticia {
  /** Percentual fixado na decisão, por exemplo 20 para 20%. */
  percentual: number;
  tipo: IncidenciaPensao;
  /** Quantos auxílios pré-escolares são revertidos ao alimentando. */
  preEscolarRevertido: number;
}

export interface EntradaSalario {
  posto: Posto;
  corporacao: Corporacao;
  situacao: Situacao;
  auxMoradia: AuxilioMoradia | null;
  cursos: Curso[];
  dependentesIR: number;
  dependentesFundoSaude: number;
  preEscolar: number;
  /** Nível da GFNE (1 a 5); 0 ou null quando não recebe. */
  gfne: number | null;
  /** Código do cargo no GDF (por exemplo "CPE-04"); null quando não recebe. */
  gratificacaoGDF: string | null;
  /** Anos de serviço contados até 05/09/2001. */
  anosATS: number | null;
  pttc: boolean;
  pensaoMilitarAdicional: boolean;
  horasServicoVoluntario: number | null;
  pensaoAlimenticia: PensaoAlimenticia | null;
  reparacaoErario: number | null;
  descontosDedutiveis: number | null;
  descontosNaoDedutiveis: number | null;
}

export interface ResultadoSalario {
  competencia: string;
  // Remuneração
  soldo: number;
  adicionalPostoGraduacao: number;
  adicionalTempoServico: number;
  complementoSoldo: number;
  adicionalOperacoesMilitares: number;
  gratificacaoRepresentacao: number;
  adicionalCertificacao: number;
  gcef: number;
  vpe: number;
  grv: number;
  gfne: number;
  gratificacaoGDF: number;
  pttc: number;
  servicoVoluntario: number;
  // Direitos pecuniários
  auxilioMoradia: number;
  etapaAlimentacao: number;
  auxilioPreEscolar: number;
  // Descontos
  cotaPreEscolar: number;
  pensaoAlimenticia: number;
  pensaoAlimenticiaPreEscolar: number;
  pensaoMilitar: number;
  pensaoMilitarAdicional: number;
  fundoSaude: number;
  fundoSaudeDependentes: number;
  reparacaoErario: number;
  descontosDedutiveis: number;
  descontosNaoDedutiveis: number;
  impostoRenda: number;
  // Totais
  remuneracao: number;
  direitosPecuniarios: number;
  descontos: number;
  liquido: number;
  // Eventuais
  decimoTerceiro: number;
  ferias: number;
  auxilioFardamento: number;
  impostoRendaDecimoTerceiro: number;
  impostoRendaFerias: number;
  pensaoAlimenticiaDecimoTerceiro: number;
}

/** Arredonda para baixo, em centavos, como a folha de pagamento. */
export const truncarCentavos = (x: number) => Math.floor(x * 100) / 100;
const arredondarCentavos = (x: number) => Math.round(x * 100) / 100;
const valorOuZero = (x: number | null | undefined) => (x == null || Number.isNaN(x) ? 0 : x);

type BaseIR = 'remuneracao' | 'pensao_alim' | 'decimo_terceiro' | 'ferias' | 'pa_decimo_terceiro';

export function calcularSalario(e: EntradaSalario, t: Tabelas): ResultadoSalario {
  const p = t.postos[e.posto];
  if (!p) throw new Error(`Posto ou graduação sem tabela: ${e.posto}`);

  // ── Remuneração fixa ──
  const soldo = p.soldo;
  const apg = p.adicionalPostoGraduacao;
  const aom = p.adicionalOperacoesMilitares;
  const gfr = p.gratificacaoRepresentacao;
  const vpe = p.vpe;
  const gcef = t.gcef;
  const grv = t.grv;
  const complementoSoldo = t.salarioMinimo > soldo ? t.salarioMinimo - soldo : 0;
  const pctCursos = e.cursos.reduce((s, c) => s + c, 0);
  const acp = truncarCentavos((soldo * pctCursos) / 100);
  const ats = e.anosATS == null ? 0 : truncarCentavos(soldo * (Math.trunc(e.anosATS) / 100));

  const remuneracaoFixa =
    soldo + apg + ats + complementoSoldo + aom + gfr + acp + gcef + vpe + grv;

  // ── Remuneração eventual ──
  const gfne = e.gfne ? t.postos.CORONEL.soldo * (t.gfne[String(e.gfne)] ?? 0) : 0;
  const cargo = e.gratificacaoGDF ? t.cargosGDF[e.gratificacaoGDF] : undefined;
  const gratificacaoGDF = cargo
    ? e.situacao === 'ativo'
      ? cargo.representacao
      : cargo.remuneracao
    : 0;
  const pttc = e.pttc ? truncarCentavos(remuneracaoFixa * t.percentualPTTC) : 0;
  const gsv = e.horasServicoVoluntario ? t.valorHoraServicoVoluntario * Math.round(e.horasServicoVoluntario) : 0;

  const remuneracao = remuneracaoFixa + gfne + gratificacaoGDF + pttc + gsv;

  // ── Direitos pecuniários ──
  const auxilioMoradia = e.auxMoradia ? p.auxilioMoradia[e.auxMoradia] : 0;
  const etapaAlimentacao = e.situacao === 'ativo' || e.pttc ? t.etapaAlimentacao : 0;
  const auxilioPreEscolar = e.preEscolar ? e.preEscolar * t.auxilioPreEscolar : 0;
  const direitosPecuniarios = auxilioMoradia + etapaAlimentacao + auxilioPreEscolar;

  // ── Descontos fixos ──
  const cotaPreEscolar = e.preEscolar ? e.preEscolar * t.cotaPreEscolar : 0;
  const pensaoMilitar = truncarCentavos(remuneracaoFixa * t.aliquotaPensaoMilitar);
  const pensaoMilitarAdicional = e.pensaoMilitarAdicional
    ? truncarCentavos(remuneracaoFixa * t.aliquotaPensaoMilitarAdicional)
    : 0;
  const fundoSaude = truncarCentavos(soldo * t.aliquotaFundoSaude);
  const fundoSaudeDependentes =
    Math.trunc(e.dependentesFundoSaude || 0) * p.fundoSaudePorDependente[e.corporacao];
  const reparacaoErario = valorOuZero(e.reparacaoErario);
  const descontosDedutiveis = valorOuZero(e.descontosDedutiveis);
  const descontosNaoDedutiveis = valorOuZero(e.descontosNaoDedutiveis);

  const decimoTerceiro =
    soldo + apg + ats + aom + gfr + acp + gcef + vpe + grv + gfne + gratificacaoGDF + pttc;
  const ferias =
    e.situacao === 'ativo'
      ? arredondarCentavos(decimoTerceiro / 3)
      : e.pttc
        ? arredondarCentavos(pttc / 3)
        : 0;

  // ── Pensão alimentícia e imposto de renda (dependem um do outro) ──
  const pa = e.pensaoAlimenticia;

  function pensaoAlimenticia(base: 'mensal' | 'decimo_terceiro'): number {
    if (!pa || !pa.percentual) return 0;
    const parcelaBase =
      base === 'decimo_terceiro'
        ? decimoTerceiro
        : remuneracao - pensaoMilitar - impostoRenda('pensao_alim') - reparacaoErario;
    let baseCalculo: number;
    switch (pa.tipo) {
      case 'sal_minimo':
        baseCalculo = t.salarioMinimo;
        break;
      case 'liquido':
        baseCalculo = parcelaBase;
        break;
      case 'bruto':
        baseCalculo = remuneracao + etapaAlimentacao + auxilioMoradia;
        break;
      case 'bruto_com_indenizacoes':
        baseCalculo = parcelaBase + etapaAlimentacao + auxilioMoradia;
        break;
      default:
        baseCalculo = 0;
    }
    return truncarCentavos(baseCalculo * (pa.percentual / 100));
  }

  function impostoRenda(tipo: BaseIR): number {
    const deducaoDependentes = t.irrf.deducaoPorDependente * Math.trunc(e.dependentesIR || 0);
    const descontosIR =
      pensaoMilitar +
      pensaoMilitarAdicional +
      fundoSaude +
      fundoSaudeDependentes +
      descontosDedutiveis +
      reparacaoErario;
    let base: number;
    switch (tipo) {
      case 'pensao_alim':
        base = remuneracao - descontosIR;
        break;
      case 'remuneracao':
        base = remuneracao - descontosIR - pensaoAlimenticia('mensal');
        break;
      case 'decimo_terceiro':
        base = decimoTerceiro - pensaoAlimenticia('decimo_terceiro');
        break;
      case 'ferias':
        base = ferias;
        break;
      case 'pa_decimo_terceiro':
        base = decimoTerceiro;
        break;
    }
    base -= deducaoDependentes;
    let imposto = 0;
    for (let i = t.irrf.faixas.length - 1; i >= 0; i--) {
      const faixa = t.irrf.faixas[i]!;
      if (base > faixa.acimaDe) {
        imposto = base * faixa.aliquota - faixa.deducao;
        break;
      }
    }
    return tipo === 'ferias' || tipo === 'decimo_terceiro' || tipo === 'remuneracao'
      ? truncarCentavos(imposto)
      : arredondarCentavos(imposto);
  }

  const pensaoMensal = pensaoAlimenticia('mensal');
  const pensaoAlimenticiaPreEscolar = pa?.preEscolarRevertido
    ? truncarCentavos(pa.preEscolarRevertido * t.auxilioPreEscolar * 0.95)
    : 0;
  const impostoRendaMensal = impostoRenda('remuneracao');

  const descontos =
    cotaPreEscolar +
    pensaoMensal +
    pensaoAlimenticiaPreEscolar +
    pensaoMilitar +
    pensaoMilitarAdicional +
    fundoSaude +
    fundoSaudeDependentes +
    impostoRendaMensal +
    descontosNaoDedutiveis +
    descontosDedutiveis +
    reparacaoErario;

  return {
    competencia: t.competencia,
    soldo,
    adicionalPostoGraduacao: apg,
    adicionalTempoServico: ats,
    complementoSoldo,
    adicionalOperacoesMilitares: aom,
    gratificacaoRepresentacao: gfr,
    adicionalCertificacao: acp,
    gcef,
    vpe,
    grv,
    gfne,
    gratificacaoGDF,
    pttc,
    servicoVoluntario: gsv,
    auxilioMoradia,
    etapaAlimentacao,
    auxilioPreEscolar,
    cotaPreEscolar,
    pensaoAlimenticia: pensaoMensal,
    pensaoAlimenticiaPreEscolar,
    pensaoMilitar,
    pensaoMilitarAdicional,
    fundoSaude,
    fundoSaudeDependentes,
    reparacaoErario,
    descontosDedutiveis,
    descontosNaoDedutiveis,
    impostoRenda: impostoRendaMensal,
    remuneracao,
    direitosPecuniarios,
    descontos,
    liquido: remuneracao + direitosPecuniarios - descontos,
    decimoTerceiro,
    ferias,
    auxilioFardamento: e.situacao === 'ativo' ? truncarCentavos((decimoTerceiro - gratificacaoGDF) / 4) : 0,
    impostoRendaDecimoTerceiro: impostoRenda('decimo_terceiro'),
    impostoRendaFerias: impostoRenda('ferias'),
    pensaoAlimenticiaDecimoTerceiro: pensaoAlimenticia('decimo_terceiro'),
  };
}
