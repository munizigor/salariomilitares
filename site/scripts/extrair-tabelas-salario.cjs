// Extrai de static/js/dados_remuneracao.js (site antigo) as tabelas de uma
// competência e grava src/lib/salario/tabelas/<AAAA-MM>.json.
// Uso: node scripts/extrair-tabelas-salario.cjs 01/01/2026
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const competencia = process.argv[2] || '01/01/2026';
const [, mm, aaaa] = competencia.split('/');
const origem = path.resolve(__dirname, '..', '..', 'static', 'js', 'dados_remuneracao.js');
const ctx = {};
vm.runInNewContext(fs.readFileSync(origem, 'utf8'), ctx);

const postos = {};
for (const [posto, t] of Object.entries(ctx.remuneracao)) {
  if (typeof t !== 'object') continue;
  postos[posto] = {
    soldo: t.soldo[competencia],
    adicionalPostoGraduacao: t.apg[competencia],
    adicionalOperacoesMilitares: t.aom[competencia],
    gratificacaoRepresentacao: t.gfr[competencia],
    vpe: t.vpe[competencia],
    auxilioMoradia: { comDependente: t.amcd[competencia], semDependente: t.amsd[competencia] },
    fundoSaudePorDependente: { ...t.cotafsa },
  };
}

const tabelas = {
  competencia: `${aaaa}-${mm}`,
  salarioMinimo: ctx.salario_minimo[competencia],
  aliquotaPensaoMilitar: ctx.pensao_militar[competencia],
  aliquotaPensaoMilitarAdicional: 0.015,
  aliquotaFundoSaude: 0.02,
  etapaAlimentacao: ctx.remuneracao.alim,
  gcef: ctx.remuneracao.gcef,
  grv: ctx.remuneracao.grv,
  auxilioPreEscolar: ctx.remuneracao.pre_escolar,
  cotaPreEscolar: ctx.remuneracao.cota_pre_escolar,
  valorHoraServicoVoluntario: 760 / 8,
  percentualPTTC: 0.3,
  gfne: Object.fromEntries(Object.entries(ctx.gfne).map(([k, v]) => [k, v])),
  cargosGDF: Object.fromEntries(
    Object.entries(ctx.cargosGDF).map(([k, v]) => [k, { representacao: v.repr, remuneracao: v.remun }]),
  ),
  irrf: {
    deducaoPorDependente: 189.59,
    faixas: Object.values(ctx.faixas_irrf).map((f) => ({ acimaDe: f.piso, aliquota: f.aliquota, deducao: f.deducao })),
  },
  postos,
};

const destino = path.resolve(__dirname, '..', 'src', 'lib', 'salario', 'tabelas', `${aaaa}-${mm}.json`);
fs.writeFileSync(destino, JSON.stringify(tabelas, null, 2) + '\n');
console.log('gravado', path.relative(process.cwd(), destino));
