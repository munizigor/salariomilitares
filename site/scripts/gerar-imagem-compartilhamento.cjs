// Gera public/compartilhamento.png (1200x630), a imagem que aparece quando o
// link do site é compartilhado. Usa as fontes IBM Plex instaladas pelo npm.
// Uso: node scripts/gerar-imagem-compartilhamento.cjs ["Título"] [saida.png]
const { chromium } = require('playwright');
const path = require('path');

const titulo = process.argv[2] || 'Simule seu contracheque';
const saida = path.resolve(process.argv[3] || path.join(__dirname, '..', 'public', 'compartilhamento.png'));
const fs = require('fs');
// Fontes embutidas em base64: uma página aberta com setContent não lê file://.
const fonte = (pacote, arquivo) =>
  'data:font/woff2;base64,' +
  fs.readFileSync(path.resolve(__dirname, '..', 'node_modules', '@fontsource', pacote, 'files', arquivo)).toString('base64');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Cond; font-weight: 700; src: url(${fonte('ibm-plex-sans-condensed', 'ibm-plex-sans-condensed-latin-700-normal.woff2')}); }
@font-face { font-family: Cond; font-weight: 500; src: url(${fonte('ibm-plex-sans-condensed', 'ibm-plex-sans-condensed-latin-500-normal.woff2')}); }
@font-face { font-family: Sans; font-weight: 400; src: url(${fonte('ibm-plex-sans', 'ibm-plex-sans-latin-400-normal.woff2')}); }
@font-face { font-family: Mono; font-weight: 400; src: url(${fonte('ibm-plex-mono', 'ibm-plex-mono-latin-400-normal.woff2')}); }
@font-face { font-family: Mono; font-weight: 600; src: url(${fonte('ibm-plex-mono', 'ibm-plex-mono-latin-600-normal.woff2')}); }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; position: relative; overflow: hidden; color: #1a2330;
  background-color: #f2f5f1;
  background-image:
    repeating-radial-gradient(circle at 0 0, transparent 0 9px, rgba(43,96,74,.08) 9px 10px),
    repeating-radial-gradient(circle at 100% 100%, transparent 0 9px, rgba(43,96,74,.08) 9px 10px); }
.txt { position: absolute; left: 72px; top: 64px; width: 600px; display: grid; gap: 28px; }
.marca { font-family: Cond; font-weight: 700; font-size: 40px; }
.marca span { color: #5b6672; font-weight: 500; }
h1 { font-family: Cond; font-weight: 700; font-size: 76px; line-height: 1.04; }
.sub { font-family: Sans; font-size: 30px; line-height: 1.35; color: #5b6672; }
.url { position: absolute; left: 72px; bottom: 56px; font-family: Mono; font-size: 28px; }
.folha { position: absolute; right: 72px; top: 92px; width: 400px; background: #fbfcfa; border: 2px solid #1a2330;
  font-family: Mono; font-size: 22px; padding: 26px 28px; display: grid; gap: 12px; }
.folha div { display: flex; justify-content: space-between; border-bottom: 1px dotted #c8d2cb; padding-bottom: 8px; }
.cr { color: #1d6a48; } .db { color: #a03a2b; }
.folha .liq { border: 2px solid #1a2330; padding: 12px 14px; margin-top: 8px; font-weight: 600; font-size: 26px; }
</style></head><body>
<div class="txt">
  <div class="marca">militares<span>df</span></div>
  <h1>${titulo}</h1>
  <div class="sub">Calculadora de salário da PMDF e do CBMDF</div>
</div>
<div class="folha">
  <div><span>Soldo</span><span class="cr">3.657,60</span></div>
  <div><span>VPE</span><span class="cr">10.170,43</span></div>
  <div><span>Pensão mil.</span><span class="db">2.070,76</span></div>
  <div><span>IRRF</span><span class="db">3.868,58</span></div>
  <div class="liq"><span>Líquido</span><span>17.792,27</span></div>
</div>
<div class="url">militaresdf.com.br</div>
</body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.setContent(html, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: saida });
  await b.close();
  console.log('gravado', saida);
})();
