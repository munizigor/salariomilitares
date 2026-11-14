import { describe, expect, it } from 'vitest';
import { lerDecimal, lerEntrada } from '../src/lib/salario/formulario';

describe('lerDecimal', () => {
  it('aceita formato brasileiro, com ou sem R$', () => {
    expect(lerDecimal('1.234,56')).toBe(1234.56);
    expect(lerDecimal('R$ 89,90')).toBe(89.9);
    expect(lerDecimal('20')).toBe(20);
    expect(lerDecimal('33.3')).toBe(33.3);
  });
  it('devolve null para vazio ou texto inválido', () => {
    expect(lerDecimal('')).toBeNull();
    expect(lerDecimal('abc')).toBeNull();
    expect(lerDecimal(null)).toBeNull();
  });
});

describe('lerEntrada', () => {
  const base = { posto: 'CAPITAO', corporacao: 'cbmdf', situacao: 'ativo' };

  it('exige posto, corporação e situação', () => {
    expect(lerEntrada({ ...base, posto: '' })).toBeNull();
    expect(lerEntrada({ ...base, corporacao: '' })).toBeNull();
    expect(lerEntrada({ ...base, situacao: '' })).toBeNull();
    expect(lerEntrada(base)).not.toBeNull();
  });

  it('só considera PTTC para inativos', () => {
    expect(lerEntrada({ ...base, pttc: 'sim' })!.pttc).toBe(false);
    expect(lerEntrada({ ...base, situacao: 'inativo', pttc: 'sim' })!.pttc).toBe(true);
  });

  it('monta a pensão alimentícia só com percentual informado', () => {
    expect(lerEntrada({ ...base, tipoPensao: 'bruto' })!.pensaoAlimenticia).toBeNull();
    const e = lerEntrada({ ...base, percentualPensao: '20,5', tipoPensao: 'bruto', preEscolar: '1', preEscolarRevertido: '3' })!;
    expect(e.pensaoAlimenticia).toEqual({ percentual: 20.5, tipo: 'bruto', preEscolarRevertido: 1 });
  });

  it('lê os cursos marcados', () => {
    expect(lerEntrada({ ...base, cursos: ['10', '20'] })!.cursos).toEqual([10, 20]);
  });
});
