import { describe, expect, it } from 'vitest';
import { calcularSalario, type EntradaSalario, type ResultadoSalario } from '../src/lib/salario/calculo';
import { TABELAS } from '../src/lib/salario/tabelas';
import referencias from './referencias/salario.json';

// Nome da rubrica no site antigo → campo do resultado novo.
const MAPA: Record<string, keyof ResultadoSalario> = {
  soldo: 'soldo',
  apg: 'adicionalPostoGraduacao',
  ats: 'adicionalTempoServico',
  compl_soldo: 'complementoSoldo',
  aom: 'adicionalOperacoesMilitares',
  gfr: 'gratificacaoRepresentacao',
  acp: 'adicionalCertificacao',
  gcef: 'gcef',
  vpe: 'vpe',
  grv: 'grv',
  gfne: 'gfne',
  gratGDF: 'gratificacaoGDF',
  pttc: 'pttc',
  gsv: 'servicoVoluntario',
  aux_mor: 'auxilioMoradia',
  alim: 'etapaAlimentacao',
  aux_pe: 'auxilioPreEscolar',
  cota_pe: 'cotaPreEscolar',
  pensao_alim: 'pensaoAlimenticia',
  pensao_alim_pe: 'pensaoAlimenticiaPreEscolar',
  contr_pensao_militar: 'pensaoMilitar',
  contr_pensao_militar_adic: 'pensaoMilitarAdicional',
  fundo_saude: 'fundoSaude',
  fundo_saude_adicional: 'fundoSaudeDependentes',
  reparacao_erario: 'reparacaoErario',
  outros_descontos_dedutiveis: 'descontosDedutiveis',
  outros_descontos_nao_dedutiveis: 'descontosNaoDedutiveis',
  irrf: 'impostoRenda',
  remuneracao_total: 'remuneracao',
  direitos_pecuniarios: 'direitosPecuniarios',
  descontos_total: 'descontos',
  rendimento_liquido: 'liquido',
  decimo_terceiro: 'decimoTerceiro',
  ferias: 'ferias',
  auxilio_fardamento: 'auxilioFardamento',
  irrf_decimo_terceiro: 'impostoRendaDecimoTerceiro',
  irrf_ferias: 'impostoRendaFerias',
  pa_decimo_terceiro: 'pensaoAlimenticiaDecimoTerceiro',
};

// Converte a entrada gravada (formato do gerador) para o tipo do módulo.
function entrada(bruta: Record<string, unknown>): EntradaSalario {
  const am = bruta.auxMoradia;
  return {
    ...(bruta as unknown as EntradaSalario),
    auxMoradia: am === 'amcd' ? 'comDependente' : am === 'amsd' ? 'semDependente' : null,
  };
}

describe('cálculo de salário igual ao da calculadora antiga', () => {
  const tabelas = TABELAS['2026-01']!;
  it('cobre todas as rubricas da tabela antiga', () => {
    expect(Object.keys(referencias.casos[0]!.esperado).sort()).toEqual(Object.keys(MAPA).sort());
  });

  referencias.casos.forEach((caso, i) => {
    it(`caso ${i + 1}: ${caso.entrada.posto}, ${caso.entrada.corporacao}, ${caso.entrada.situacao}`, () => {
      const r = calcularSalario(entrada(caso.entrada), tabelas);
      for (const [antigo, novo] of Object.entries(MAPA)) {
        const esperado = (caso.esperado as Record<string, number>)[antigo]!;
        // As referências são gravadas com 6 casas; o porte tem de bater exatamente.
        expect(Math.abs(r[novo] as number - esperado), `${antigo} (${novo})`).toBeLessThan(0.000001);
      }
    });
  });
});
