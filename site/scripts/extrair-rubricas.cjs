// Extrai do index.html antigo a descrição, os valores e a base legal de cada
// rubrica (atributos data-* das linhas da tabela) para src/lib/salario/rubricas.json.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.route('**/*', (r) => (r.request().url().startsWith('file:') ? r.continue() : r.abort()));
  await p.goto('file://' + path.resolve(__dirname, '..', '..', 'index.html'));
  const dados = await p.evaluate(() => {
    const limpa = (s) => (s == null ? null : s.replace(/\s+/g, ' ').trim());
    const out = {};
    for (const tr of document.querySelectorAll('#salario tr[id]')) {
      if (tr.id === 'mes') continue;
      out[tr.id] = {
        rotulo: limpa(tr.querySelector('td')?.textContent),
        descricao: limpa(tr.dataset.description),
        calculo: limpa(tr.dataset.calculo),
        baseLegal: limpa(tr.dataset.legal_base),
        baseLegalLink: limpa(tr.dataset.legal_base_link),
      };
    }
    out.pa_forma_calculo = limpa(document.getElementById('pa_forma_calculo').dataset.title);
    return out;
  });
  await b.close();
  fs.writeFileSync(path.resolve(__dirname, '..', 'src', 'lib', 'salario', 'rubricas-antigas.json'), JSON.stringify(dados, null, 2) + '\n');
  console.log(Object.keys(dados).length, 'rubricas');
})();
