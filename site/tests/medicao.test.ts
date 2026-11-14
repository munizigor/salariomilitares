import { describe, expect, it } from 'vitest';
import { faixaDias } from '../src/lib/medicao';

describe('faixaDias', () => {
  it('agrupa nas mesmas faixas das regras de diárias e ajuda de custo', () => {
    expect(faixaDias(1)).toBe('menos de 30');
    expect(faixaDias(29)).toBe('menos de 30');
    expect(faixaDias(30)).toBe('30 a 60');
    expect(faixaDias(60)).toBe('30 a 60');
    expect(faixaDias(61)).toBe('61 a 90');
    expect(faixaDias(91)).toBe('91 a 180');
    expect(faixaDias(181)).toBe('mais de 180');
  });
});
