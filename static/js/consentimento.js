// Banner de consentimento de cookies (LGPD) integrado ao Google Consent Mode.
(function () {
  var CHAVE = 'consentimento_cookies';

  function lerEscolha() {
    try { return localStorage.getItem(CHAVE); } catch (e) { return null; }
  }

  function salvarEscolha(valor) {
    try { localStorage.setItem(CHAVE, valor); } catch (e) {}
  }

  function aplicar(aceito) {
    var estado = aceito ? 'granted' : 'denied';
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        ad_storage: estado,
        ad_user_data: estado,
        ad_personalization: estado,
        analytics_storage: estado
      });
    }
  }

  function fecharBanner() {
    var banner = document.getElementById('banner-cookies');
    if (banner) banner.remove();
  }

  function mostrarBanner() {
    if (document.getElementById('banner-cookies')) return;
    var banner = document.createElement('div');
    banner.id = 'banner-cookies';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Aviso de cookies');
    banner.innerHTML =
      '<p>Usamos cookies do Google Analytics e do Google AdSense para medir o uso do site e ' +
      'exibir anúncios que ajudam a mantê-lo gratuito. Saiba mais na ' +
      '<a href="privacidade.html">Política de Privacidade</a>.</p>' +
      '<div class="banner-cookies-botoes">' +
      '<button type="button" class="btn btn-sm btn-outline-light" data-escolha="recusado">Recusar</button>' +
      '<button type="button" class="btn btn-sm btn-light" data-escolha="aceito">Aceitar</button>' +
      '</div>';
    banner.addEventListener('click', function (ev) {
      var escolha = ev.target.getAttribute('data-escolha');
      if (!escolha) return;
      salvarEscolha(escolha);
      aplicar(escolha === 'aceito');
      fecharBanner();
    });
    document.body.appendChild(banner);
  }

  if (!lerEscolha()) mostrarBanner();

  var link = document.getElementById('gerenciar-cookies');
  if (link) {
    link.addEventListener('click', function (ev) {
      ev.preventDefault();
      mostrarBanner();
    });
  }
})();
