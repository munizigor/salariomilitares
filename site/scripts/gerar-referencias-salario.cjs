// Gera casos de referência rodando a calculadora antiga (index.html na raiz do
// repositório) num navegador headless. Cada caso guarda a entrada no formato do
// módulo novo e o valor bruto de cada rubrica calculado pelo código antigo.
// Uso: node scripts/gerar-referencias-salario.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..');
const SAIDA = path.resolve(__dirname, '..', 'tests', 'referencias', 'salario.json');

const POSTOS = [
  'CORONEL', 'TENENTE-CORONEL', 'MAJOR', 'CAPITAO', 'PRIMEIRO TENENTE', 'SEGUNDO TENENTE',
  'ASPIRANTE', 'SUBTENENTE', 'PRIMEIRO SARGENTO', 'SEGUNDO SARGENTO', 'TERCEIRO SARGENTO',
  'CABO', 'SOLDADO PRIMEIRA CLASSE', 'SOLDADO SEGUNDA CLASSE', 'CADETE ULTIMO ANO', 'CADETE DEMAIS ANOS',
];
const GRAT_GDF = [null, 'nao_recebe', 'CPE-01', 'CPE-04', 'CPE-08', 'CPC-08', 'CPC-05', 'CPC-01'];
const TIPOS_PA = ['liquido', 'bruto_com_indenizacoes', 'bruto', 'sal_minimo'];

// Gerador pseudoaleatório com semente fixa, para os casos serem sempre os mesmos.
let semente = 20261114;
function aleatorio() {
  semente = (semente * 1103515245 + 12345) % 2147483648;
  return semente / 2147483648;
}
const escolher = (lista) => lista[Math.floor(aleatorio() * lista.length)];
const chance = (p) => aleatorio() < p;
const inteiro = (min, max) => min + Math.floor(aleatorio() * (max - min + 1));

function casoAleatorio() {
  const situacao = escolher(['ativo', 'inativo']);
  const cursos = [10, 15, 20, 30].filter(() => chance(0.5));
  const comPA = chance(0.3);
  const preEscolar = chance(0.3) ? inteiro(1, 3) : 0;
  return {
    posto: escolher(POSTOS),
    corporacao: escolher(['pmdf', 'cbmdf']),
    situacao,
    auxMoradia: escolher(['amcd', 'amsd', null]),
    cursos,
    dependentesIR: chance(0.5) ? inteiro(0, 4) : 0,
    dependentesFundoSaude: chance(0.5) ? inteiro(0, 4) : 0,
    preEscolar,
    gfne: chance(0.25) ? inteiro(0, 5) : null,
    gratificacaoGDF: chance(0.25) ? escolher(GRAT_GDF) : null,
    anosATS: chance(0.3) ? inteiro(1, 30) : null,
    pttc: situacao === 'inativo' && chance(0.4),
    pensaoMilitarAdicional: chance(0.2),
    horasServicoVoluntario: chance(0.25) ? escolher([8, 12, 24, 36, 48]) : null,
    pensaoAlimenticia: comPA
      ? {
          percentual: escolher([10, 15, 20, 25, 30, 33.3]),
          tipo: escolher(TIPOS_PA),
          preEscolarRevertido: preEscolar > 0 && chance(0.5) ? inteiro(1, preEscolar) : 0,
        }
      : null,
    reparacaoErario: chance(0.15) ? escolher([150, 432.1, 1000]) : null,
    descontosDedutiveis: chance(0.2) ? escolher([89.9, 350, 1200.5]) : null,
    descontosNaoDedutiveis: chance(0.2) ? escolher([45, 780.33, 2500]) : null,
  };
}

function casosFixos() {
  const base = {
    corporacao: 'pmdf', situacao: 'ativo', auxMoradia: 'amsd', cursos: [10],
    dependentesIR: 0, dependentesFundoSaude: 0, preEscolar: 0, gfne: null,
    gratificacaoGDF: null, anosATS: null, pttc: false, pensaoMilitarAdicional: false,
    horasServicoVoluntario: null, pensaoAlimenticia: null, reparacaoErario: null,
    descontosDedutiveis: null, descontosNaoDedutiveis: null,
  };
  const casos = [];
  for (const posto of POSTOS) {
    casos.push({ ...base, posto });
    casos.push({ ...base, posto, corporacao: 'cbmdf', situacao: 'inativo', auxMoradia: 'amcd', cursos: [10, 15, 20, 30], dependentesFundoSaude: 2 });
  }
  return casos;
}

// Preenche o formulário antigo e devolve o valor bruto de cada rubrica.
async function calcular(pagina, caso) {
  return pagina.evaluate((c) => {
    const valor = (id, v) => { document.getElementById(id).value = v == null ? '' : String(v); };
    valor('posto', c.posto);
    valor('corporacao', c.corporacao);
    valor('situacao_funcional', c.situacao);
    valor('aux_moradia_dependente', c.auxMoradia);
    for (const el of document.getElementsByClassName('acp')) el.checked = c.cursos.includes(Number(el.value));
    valor('dep_ir', c.dependentesIR);
    valor('dep_fs', c.dependentesFundoSaude);
    valor('pre_escolar', c.preEscolar);
    valor('tipo_gfne', c.gfne);
    valor('tipo_gratGDF', c.gratificacaoGDF);
    valor('pct_ats', c.anosATS);
    valor('bool_pttc', c.pttc ? 'sim' : '');
    valor('pensao_militar_adicional', c.pensaoMilitarAdicional ? 'sim' : '');
    valor('horas_gsv', c.horasServicoVoluntario);
    valor('percentual_pa', c.pensaoAlimenticia ? c.pensaoAlimenticia.percentual : '');
    valor('tipo_pa', c.pensaoAlimenticia ? c.pensaoAlimenticia.tipo : 'liquido');
    valor('pre_escolar_pensao', c.pensaoAlimenticia ? c.pensaoAlimenticia.preEscolarRevertido : '');
    valor('soma_reparacao_erario', c.reparacaoErario);
    valor('soma_descontos_dedutiveis', c.descontosDedutiveis);
    valor('soma_descontos_nao_dedutiveis', c.descontosNaoDedutiveis);

    const ids = Array.from(document.getElementById('salario').rows)
      .map((r) => r.id)
      .filter((id) => id && id !== 'mes');
    const resultado = {};
    window.mes = window.getMes(1);
    for (const id of ids) {
      const v = window.verbas1[id]();
      resultado[id] = Math.round(v * 1e6) / 1e6;
    }
    return resultado;
  }, caso);
}

(async () => {
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage();
  await pagina.route('**/*', (r) => (r.request().url().startsWith('file:') ? r.continue() : r.abort()));
  pagina.on('dialog', (d) => d.dismiss());
  const erros = [];
  pagina.on('pageerror', (e) => erros.push(e.message));
  await pagina.goto('file://' + path.join(RAIZ, 'index.html'));

  const casos = [...casosFixos()];
  for (let i = 0; i < 400; i++) casos.push(casoAleatorio());

  const referencias = [];
  for (const entrada of casos) {
    referencias.push({ entrada, esperado: await calcular(pagina, entrada) });
  }
  await navegador.close();
  if (erros.length) {
    console.error('Erros na página antiga:', erros);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
  fs.writeFileSync(SAIDA, JSON.stringify({ competencia: '01/01/2026', casos: referencias }, null, 1) + '\n');
  console.log(`${referencias.length} casos gravados em ${path.relative(process.cwd(), SAIDA)}`);
})();
