# militaresdf.com.br (site novo)

Site em [Astro](https://astro.build) com as calculadoras de salário e de diárias da PMDF e do CBMDF. Ainda não está
publicado: o site no ar continua sendo o `index.html` da raiz do repositório.

## Comandos

```sh
npm install
npm run dev      # servidor local em http://localhost:4321
npm test         # testes dos cálculos
npm run check    # checagem de tipos
npm run build    # gera o site em dist/
```

## Onde fica cada coisa

| Caminho | Conteúdo |
| --- | --- |
| `src/lib/salario/calculo.ts` | Cálculo do salário, função pura |
| `src/lib/salario/tabelas/AAAA-MM.json` | Tabelas de remuneração por competência |
| `src/lib/diarias/calculo.ts` | Período da missão, diárias e ajuda de custo |
| `src/lib/diarias/tabelas/` | Valores de diárias por destino e posto |
| `src/styles/global.css` | Design system (cores, tipos, componentes) |
| `src/pages/` | Páginas do site |
| `tests/referencias/` | Casos gerados a partir das calculadoras antigas |

## Reajuste de tabelas

1. Crie `src/lib/salario/tabelas/AAAA-MM.json` copiando o mais recente e trocando os valores.
2. Registre o arquivo em `TABELAS`, em `src/lib/salario/tabelas.ts`. A calculadora passa a usar a competência mais
   recente.
3. Rode `npm test`. Os testes antigos continuam comparando com jan/2026.

## Casos de referência

Os testes comparam o cálculo novo com o antigo em milhares de combinações. Os casos foram gerados com:

```sh
node scripts/gerar-referencias-salario.cjs                       # usa o index.html da raiz
node scripts/gerar-referencias-diarias.cjs ../../munizigor/sisdiarias
```

Os scripts usam o Playwright instalado no ambiente.
