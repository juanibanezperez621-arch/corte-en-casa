// ============================================================
//  Comparador interactivo de CorteEnCasa
//  Lee los productos del JSON incrustado en la página, rellena los
//  desplegables y dibuja la tabla cara a cara. La selección se guarda en
//  la URL (?c=id1,id2,id3) para poder compartirla.
// ============================================================
(function () {
  var datosEl = document.getElementById('datos-comparador');
  var form = document.getElementById('comparador');
  var salida = document.getElementById('resultado');
  if (!datosEl || !form || !salida) return;
  var productos = JSON.parse(datosEl.textContent);
  var cat = form.querySelector('#cat');
  var selects = Array.prototype.slice.call(form.querySelectorAll('[data-producto]'));

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function nota(n) { return String(n).replace('.', ','); }
  function porId(id) { for (var i = 0; i < productos.length; i++) if (productos[i].id === id) return productos[i]; return null; }

  // Rellena los 3 desplegables con los productos de la categoría elegida.
  function rellenar(categoria, elegidos) {
    var lista = productos.filter(function (p) { return !categoria || p.categoria === categoria; });
    selects.forEach(function (sel, i) {
      var opciones = '<option value="">' + (i === 2 ? 'Ninguno' : 'Elige un producto') + '</option>' +
        lista.map(function (p) { return '<option value="' + esc(p.id) + '">' + esc(p.nombre) + ' (' + nota(p.valoracion) + ')</option>'; }).join('');
      sel.innerHTML = opciones;
      sel.disabled = false;
      var v = elegidos && elegidos[i];
      if (v && lista.some(function (p) { return p.id === v; })) sel.value = v;
      else if (!v && i < 2 && lista[i]) sel.value = lista[i].id;
    });
  }

  function botonAmazon(p) {
    return '<a class="boton boton--primario" href="' + esc(p.enlace) + '" rel="sponsored nofollow noopener" target="_blank" aria-label="Ver precio en Amazon: ' + esc(p.nombre) + ' (se abre en una pestaña nueva)">Ver precio en Amazon</a>';
  }

  function dibujar() {
    var ids = selects.map(function (s) { return s.value; }).filter(Boolean);
    var vistos = {};
    var prods = ids.filter(function (id) { if (vistos[id]) return false; vistos[id] = 1; return true; }).map(porId).filter(Boolean);
    if (prods.length < 2) {
      salida.innerHTML = '<p class="comparador__vacio">Elige al menos dos productos distintos para compararlos.</p>';
      guardar(prods);
      return;
    }
    var claves = [];
    prods.forEach(function (p) { Object.keys(p.specs).forEach(function (k) { if (claves.indexOf(k) < 0) claves.push(k); }); });
    function fila(th, celdas) { return '<tr><th scope="row">' + th + '</th>' + celdas.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }
    function lista(arr, clase) { return '<ul class="lista ' + clase + '">' + arr.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; }
    var html = '<div class="tabla-scroll" role="region" aria-label="Comparación de productos" tabindex="0"><table class="tabla tabla--cara"><thead><tr><th scope="col"><span class="visually-hidden">Característica</span></th>' +
      prods.map(function (p) { return '<th scope="col">' + esc(p.nombre) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      fila('Nuestra nota', prods.map(function (p) { return nota(p.valoracion) + ' de 5'; })) +
      claves.map(function (k) { return fila(esc(k), prods.map(function (p) { return esc(p.specs[k] || 'No aplica'); })); }).join('') +
      fila('Para quién es', prods.map(function (p) { return esc(p.paraQuien); })) +
      fila('Lo bueno', prods.map(function (p) { return lista(p.pros, 'lista--pros'); })) +
      fila('Lo malo', prods.map(function (p) { return lista(p.contras, 'lista--contras'); })) +
      fila('Precio', prods.map(botonAmazon)) +
      '</tbody></table></div>';
    salida.innerHTML = html;
    guardar(prods);
  }

  // Guarda la comparación en la URL sin recargar la página.
  function guardar(prods) {
    var url = new URL(location.href);
    if (cat.value) url.searchParams.set('cat', cat.value); else url.searchParams.delete('cat');
    if (prods.length) url.searchParams.set('c', prods.map(function (p) { return p.id; }).join(',')); else url.searchParams.delete('c');
    history.replaceState(null, '', url.pathname + (url.search || ''));
  }

  // Estado inicial: lo que venga en la URL o la comparación por defecto.
  var q = new URLSearchParams(location.search);
  var iniciales = (q.get('c') || 'philips-hc5630,wahl-magic-clip,remington-genius').split(',');
  var catInicial = q.get('cat') || '';
  if (!catInicial && porId(iniciales[0])) {
    var c0 = porId(iniciales[0]).categoria;
    if (iniciales.every(function (id) { var p = porId(id); return !p || p.categoria === c0; })) catInicial = c0;
  }
  cat.value = catInicial;
  rellenar(catInicial, iniciales);
  if (q.get('c')) dibujar();

  cat.addEventListener('change', function () { rellenar(cat.value, null); dibujar(); });
  selects.forEach(function (s) { s.addEventListener('change', dibujar); });
  form.addEventListener('submit', function (e) { e.preventDefault(); dibujar(); });
})();
