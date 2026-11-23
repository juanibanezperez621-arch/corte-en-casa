// ============================================================
//  Consentimiento de cookies (RGPD / LSSI)
//  - Rechazar y Aceptar tienen el mismo tamaño y estilo.
//  - La analítica (Google Analytics 4) SOLO se carga tras "Aceptar".
//  - El enlace "Configurar cookies" del pie vuelve a abrir el aviso.
//  El ID de GA4 se configura en src/config.mjs (ANALITICA_GA4).
// ============================================================
(function () {
  var CLAVE = 'cec-consentimiento';
  var aviso = document.getElementById('aviso-cookies');
  var idGA = document.documentElement.getAttribute('data-ga');

  function leer() { try { return localStorage.getItem(CLAVE); } catch (e) { return null; } }
  function guardar(v) { try { localStorage.setItem(CLAVE, v); } catch (e) { /* modo privado: no pasa nada */ } }

  function cargarAnalitica() {
    if (!idGA || window.__cecGA) return;
    window.__cecGA = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(idGA);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', idGA, { anonymize_ip: true });
  }

  function decidir(valor) {
    guardar(valor);
    if (aviso) aviso.hidden = true;
    if (valor === 'aceptado') cargarAnalitica();
    // Si se retira el consentimiento, recargamos para que la analítica deje de ejecutarse.
    else if (window.__cecGA) location.reload();
  }

  var estado = leer();
  if (estado === 'aceptado') cargarAnalitica();
  else if (!estado && aviso) aviso.hidden = false;

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cookies]');
    if (b) decidir(b.getAttribute('data-cookies') === 'aceptar' ? 'aceptado' : 'rechazado');
    if (e.target.closest('[data-abrir-cookies]') && aviso) { aviso.hidden = false; var primero = aviso.querySelector('button'); if (primero) primero.focus(); }
  });

  // Aviso en consola si quedan ASIN de ejemplo (solo para ti, no lo ve el visitante).
  if (document.querySelector('[data-asin-pendiente]')) console.warn('CorteEnCasa: esta página tiene productos con ASIN de ejemplo (PENDIENTE). Cámbialos en src/data/productos.json');
})();
