// Gera casos de referência das diárias rodando as funções do sisdiarias
// (github.com/munizigor/sisdiarias) com uma página simulada, e extrai a tabela
// de valores de diárias para src/lib/diarias/tabelas/.
//
// O arquivo static/js/diarias_data.js do sisdiarias tem, desde 05/03/2026, um
// "{" sobrando na tabela de remuneração que impede o arquivo de carregar. Aqui
// a linha é removida em memória; o repositório original não é alterado.
//
// Uso: node scripts/gerar-referencias-diarias.cjs /caminho/para/sisdiarias
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const origem = path.resolve(process.argv[2] || '../../munizigor/sisdiarias');
const ler = (rel) => fs.readFileSync(path.join(origem, rel), 'utf8');

// ── Página simulada ────────────────────────────────────────────────
const elementos = new Map();
function el(id, valor = '') {
  const e = {
    id,
    value: valor,
    checked: false,
    style: {},
    options: [],
    selectedIndex: 0,
    filhos: [],
    setAttribute() {},
    removeAttribute() {},
    getElementsByTagName() {
      return this.filhos;
    },
  };
  elementos.set(id, e);
  return e;
}
const documento = {
  getElementById: (id) => elementos.get(id) || el(id),
  getElementsByClassName: (c) => (c === 'data' ? [documento.getElementById('data_saida'), documento.getElementById('data_retorno')] : []),
};
const encadeavel = new Proxy(function () {}, { get: () => encadeavel, apply: () => encadeavel });
const ctx = { document: documento, alert: () => {}, $: encadeavel, window: {}, console };
ctx.window = ctx;
vm.createContext(ctx);

let dados = ler('static/js/diarias_data.js').replace(/("grv":1000,\s*\n)\s*\{\s*\n/, '$1');
vm.runInContext(dados, ctx);
vm.runInContext(ler('static/js/variaveis.js'), ctx);
vm.runInContext(ler('static/js/diarias.js'), ctx);

const dinheiro = (s) => Number(s.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
const celulas = (html) => [...html.matchAll(/<td>(.*?)<\/td>/g)].map((m) => m[1]);

// ── Período: dias, missão, quantidade de diárias e de ajudas de custo ──
function dataBr(d) {
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
}
const periodos = [];
const saida = new Date(Date.UTC(2026, 1, 1));
for (let dias = 1; dias <= 200; dias++) {
  const retorno = new Date(saida.getTime() + (dias - 1) * 864e5);
  for (const escolha of [null, 'True', 'False']) {
    documento.getElementById('data_saida').value = dataBr(saida);
    documento.getElementById('data_retorno').value = dataBr(retorno);
    ctx.calc_datas({ target: { id: 'data_saida' } });
    const automatica = documento.getElementById('missao').value;
    if (escolha) {
      if (dias < 30) continue; // missão travada como eventual
      documento.getElementById('missao').value = escolha;
      ctx.calc_datas({ target: { id: 'missao' } });
    }
    periodos.push({
      entrada: { saida: saida.toISOString().slice(0, 10), retorno: retorno.toISOString().slice(0, 10), missaoEventual: escolha === null ? null : escolha === 'True' },
      esperado: {
        dias: Number(documento.getElementById('qtde_dias').value),
        missaoAutomaticaEventual: automatica === 'True',
        missaoEventual: documento.getElementById('missao').value === 'True',
        quantidadeDiarias: Number(documento.getElementById('qtde_diarias').value),
        ajudaCustoIda: Number(documento.getElementById('ajudadecusto_ida').value),
        ajudaCustoVolta: Number(documento.getElementById('ajudadecusto_volta').value),
      },
    });
  }
}

// ── Valor das diárias ──────────────────────────────────────────────
const POSTOS = Object.keys(ctx.diarias_nac.BSB);
const DESTINOS = Object.keys(ctx.diarias_nac);
const diarias = [];
for (const destino of DESTINOS) {
  for (const posto of POSTOS) {
    for (const quantidade of [0.5, 1.5, 4.5, 13, 29.5, 40, 75]) {
      documento.getElementById('destino').value = destino;
      documento.getElementById('posto-1').value = posto;
      documento.getElementById('qtde_diarias').value = String(quantidade);
      documento.getElementById('matricula-1').value = '';
      documento.getElementById('nome-1').value = '';
      const [, , , valor, bruto, alim, liquido] = celulas(ctx.diarias(1));
      diarias.push({
        entrada: { destino, posto, quantidade },
        esperado: { valorDiaria: dinheiro(valor), bruto: dinheiro(bruto), descontoAlimentacao: -dinheiro(alim), liquido: dinheiro(liquido) },
      });
    }
  }
}

// ── Ajuda de custo ─────────────────────────────────────────────────
const ajudas = [];
let semente = 7;
const aleatorio = () => ((semente = (semente * 1103515245 + 12345) % 2147483648) / 2147483648);
const MATRICULA = '9999999';
for (const posto of POSTOS) {
  for (let k = 0; k < 8; k++) {
    const cursos = [10, 15, 20, 30].filter(() => aleatorio() < 0.5);
    const anosATS = aleatorio() < 0.4 ? 1 + Math.floor(aleatorio() * 30) : null;
    const [ida, volta] = [[0, 0], [1, 1], [2, 1], [2, 2]][k % 4];
    const comDependente = [null, true, false][Math.floor(aleatorio() * 3)];
    const acp = documento.getElementById('acp-1');
    acp.filhos = [10, 15, 20, 30].map((v) => ({ value: String(v), checked: cursos.includes(v) }));
    documento.getElementById('posto-1').value = posto;
    documento.getElementById('matricula-1').value = MATRICULA;
    ctx.ats[MATRICULA] = anosATS == null ? undefined : String(anosATS);
    documento.getElementById('ajudadecusto_ida').value = String(ida);
    documento.getElementById('ajudadecusto_volta').value = String(volta);
    const dep = documento.getElementById('dep-1');
    dep.value = comDependente === null ? 'null' : comDependente ? '1' : '2';
    dep.options = [{ text: '' }];
    dep.selectedIndex = 0;
    const c = celulas(ctx.ajudadecusto(1));
    ajudas.push({
      entrada: { posto, cursos, anosATS, ida, volta, comDependente },
      esperado: { remuneracaoBase: dinheiro(c[3]), ida: dinheiro(c[5]), volta: dinheiro(c[6]), total: dinheiro(c[7]) },
    });
  }
}

// Confere que a remuneração do sisdiarias é a mesma tabela de jan/2026 do salário.
const salario = require('../src/lib/salario/tabelas/2026-01.json');
for (const [posto, t] of Object.entries(ctx.remuneracao)) {
  if (typeof t !== 'object') continue;
  const s = salario.postos[posto];
  if (!s || s.soldo !== t.soldo || s.vpe !== t.vpe || s.adicionalPostoGraduacao !== t.apg) {
    throw new Error(`Remuneração do sisdiarias diferente da tabela de jan/2026 em ${posto}`);
  }
}

const NOMES = {
  BSB: 'Brasília', MAN: 'Manaus', RIO: 'Rio de Janeiro', BEL: 'Belo Horizonte', FOR: 'Fortaleza', POA: 'Porto Alegre',
  REC: 'Recife', SAL: 'Salvador', SAO: 'São Paulo', CAP: 'Demais capitais', DES: 'Demais deslocamentos',
};
const tabela = {
  norma: 'Decreto Federal nº 12.324, de 19 de dezembro de 2024',
  normaLink: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/Decreto/D12324.htm',
  destinos: Object.fromEntries(DESTINOS.map((d) => [d, { nome: NOMES[d], valores: ctx.diarias_nac[d] }])),
};
const destTabela = path.resolve(__dirname, '..', 'src', 'lib', 'diarias', 'tabelas', 'decreto-12324-2024.json');
fs.mkdirSync(path.dirname(destTabela), { recursive: true });
fs.writeFileSync(destTabela, JSON.stringify(tabela, null, 2) + '\n');

const destRef = path.resolve(__dirname, '..', 'tests', 'referencias', 'diarias.json');
fs.writeFileSync(destRef, JSON.stringify({ periodos, diarias, ajudas }, null, 1) + '\n');
console.log(`${periodos.length} períodos, ${diarias.length} diárias, ${ajudas.length} ajudas de custo`);
