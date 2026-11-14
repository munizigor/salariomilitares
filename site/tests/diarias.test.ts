import { describe, expect, it } from 'vitest';
import { calcularAjudaCusto, calcularDiarias, calcularPeriodo, type Destino, type PostoDiaria } from '../src/lib/diarias/calculo';
import type { Curso } from '../src/lib/salario/calculo';
import { TABELAS } from '../src/lib/salario/tabelas';
import referencias from './referencias/diarias.json';

const salario = TABELAS['2026-01']!;
// O sisdiarias só mostra valores formatados com 2 casas; compara-se do mesmo jeito.
const reais = (x: number) => x.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const perto = (a: number, b: number) => expect(reais(a)).toBe(reais(b));

describe('período da missão igual ao sisdiarias', () => {
  for (const { entrada, esperado } of referencias.periodos) {
    it(`${esperado.dias} dias, escolha ${entrada.missaoEventual}`, () => {
      const p = calcularPeriodo(entrada.saida, entrada.retorno, entrada.missaoEventual)!;
      expect(p.dias).toBe(esperado.dias);
      expect(p.missaoEventual).toBe(esperado.missaoEventual);
      expect(p.quantidadeDiarias).toBe(esperado.quantidadeDiarias);
      expect(p.ajudaCustoIda).toBe(esperado.ajudaCustoIda);
      expect(p.ajudaCustoVolta).toBe(esperado.ajudaCustoVolta);
    });
  }

  it('recusa retorno antes da saída', () => {
    expect(calcularPeriodo('2026-02-10', '2026-02-09')).toBeNull();
  });
});

describe('valor das diárias igual ao sisdiarias', () => {
  for (const { entrada, esperado } of referencias.diarias) {
    it(`${entrada.destino}, ${entrada.posto}, ${entrada.quantidade}`, () => {
      const r = calcularDiarias(entrada.destino as Destino, entrada.posto as PostoDiaria, entrada.quantidade, salario.etapaAlimentacao);
      perto(r.valorDiaria, esperado.valorDiaria);
      perto(r.bruto, esperado.bruto);
      perto(r.descontoAlimentacao, esperado.descontoAlimentacao);
      perto(r.liquido, esperado.liquido);
    });
  }
});

describe('ajuda de custo igual ao sisdiarias', () => {
  for (const { entrada, esperado } of referencias.ajudas) {
    it(`${entrada.posto}, ${entrada.ida}+${entrada.volta}, dependente ${entrada.comDependente}`, () => {
      const r = calcularAjudaCusto(
        entrada.posto as PostoDiaria,
        entrada.cursos as Curso[],
        entrada.anosATS,
        entrada.ida,
        entrada.volta,
        entrada.comDependente,
        salario,
      );
      perto(r.remuneracaoBase, esperado.remuneracaoBase);
      perto(r.ida, esperado.ida);
      perto(r.volta, esperado.volta);
      perto(r.total, esperado.total);
    });
  }
});
