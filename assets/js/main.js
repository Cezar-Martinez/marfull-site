// MARFULL Engenharia — scripts do site
(function () {
  var WHATSAPP = '554896843672';

  // Menu mobile
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('menu');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.querySelector('use').setAttribute('href', 'assets/img/icons.svg#' + (open ? 'i-close' : 'i-menu'));
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.querySelector('use').setAttribute('href', 'assets/img/icons.svg#i-menu');
      });
    });
  }

  // Rastreia cliques de contato (funciona quando o Google Analytics/Tag Manager estiver instalado)
  function track(action, label) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', action, { event_category: 'contato', event_label: label });
    }
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: action, contato_origem: label });
    }
  }
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href');
    var origem = link.getAttribute('data-origem') || location.pathname;
    if (href.indexOf('wa.me') !== -1) track('clique_whatsapp', origem);
    else if (href.indexOf('tel:') === 0) track('clique_telefone', origem);
    else if (href.indexOf('mailto:') === 0) track('clique_email', origem);
  });

  // Formulário de orçamento -> abre o WhatsApp com a mensagem pronta
  var form = document.getElementById('form-orcamento');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var linhas = [
        'Olá, MARFULL! Vim pelo site e gostaria de um orçamento.',
        '',
        '*Nome:* ' + d.get('nome'),
        '*Telefone:* ' + d.get('telefone'),
        '*Cidade:* ' + d.get('cidade'),
        '*Serviço:* ' + d.get('servico'),
        '*Local:* ' + d.get('imovel')
      ];
      if (d.get('veiculo')) linhas.push('*Veículo/carregador:* ' + d.get('veiculo'));
      if (d.get('mensagem')) linhas.push('', d.get('mensagem'));

      track('envio_formulario', 'orcamento');
      window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(linhas.join('\n')), '_blank', 'noopener');

      var btn = form.querySelector('button[type="submit"]');
      var original = btn.innerHTML;
      btn.textContent = 'Abrindo o WhatsApp…';
      btn.disabled = true;
      setTimeout(function () { btn.innerHTML = original; btn.disabled = false; form.reset(); }, 3500);
    });
  }

  // Ano no rodapé
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
