/* MyCase Store — tienda estática (sin servidor).
   Lee el catálogo de data/products.json, guarda el carrito en el navegador
   y envía el pedido armado por WhatsApp. */
(function () {
  "use strict";

  const CFG = window.STORE_CONFIG || {};
  const CART_KEY = "mycase_carrito_v1";
  let DATA = null;

  // ---------- utilidades ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[c]);
  }

  function gs(n) {
    return "Gs. " + Math.round(n).toLocaleString("es-PY").replace(/,/g, ".");
  }

  function shade(hex, amt) {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    const clamp = (v) => Math.max(0, Math.min(255, v));
    const r = clamp((n >> 16) + amt), g = clamp(((n >> 8) & 255) + amt), b = clamp((n & 255) + amt);
    return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
  }

  function isLight(hex) {
    const n = parseInt(hex.replace("#", ""), 16);
    const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return (r * 299 + g * 587 + b * 114) / 1000 > 170;
  }

  function params() {
    return new URLSearchParams(location.search);
  }

  // ---------- datos ----------
  async function loadData() {
    if (DATA) return DATA;
    const res = await fetch("data/products.json", { cache: "no-cache" });
    DATA = await res.json();
    DATA.modeloPorId = Object.fromEntries(DATA.modelos.map((m) => [m.id, m]));
    DATA.categoriaPorId = Object.fromEntries(DATA.categorias.map((c) => [c.id, c]));
    DATA.productoPorId = Object.fromEntries(DATA.productos.map((p) => [p.id, p]));
    return DATA;
  }

  function lineaDe(p) {
    return DATA.categoriaPorId[p.categoria]?.linea || "iphone";
  }

  function modelosDe(p) {
    if (lineaDe(p) !== "iphone" || !p.modelos) return [];
    if (p.modelos === "todos") return DATA.modelos;
    return p.modelos.map((id) => DATA.modeloPorId[id]).filter(Boolean);
  }

  // ---------- imágenes ----------
  // Si el color o el producto tienen "imagen", se usa la foto real.
  // Si no, se dibuja una ilustración con el color, para que la web se vea bien
  // mientras se cargan las fotos.
  function placeholderSVG(p, hex) {
    const c = hex || "#d2d2d7";
    const dark = shade(c, -35), light = shade(c, 30);
    const cat = p.categoria;
    let body;
    if (cat === "fundas") {
      body = `
        <rect x="58" y="18" width="104" height="214" rx="26" fill="${c}"/>
        <rect x="58" y="18" width="104" height="214" rx="26" fill="url(#g)" opacity=".5"/>
        <rect x="70" y="30" width="46" height="46" rx="13" fill="${dark}"/>
        <circle cx="84" cy="44" r="8" fill="#111" stroke="${light}" stroke-width="2"/>
        <circle cx="102" cy="62" r="8" fill="#111" stroke="${light}" stroke-width="2"/>
        <circle cx="102" cy="44" r="3" fill="${light}"/>
        <circle cx="110" cy="140" r="30" fill="none" stroke="${dark}" stroke-width="3" opacity=".6"/>`;
    } else if (cat === "protectores") {
      body = `
        <rect x="58" y="18" width="104" height="214" rx="24" fill="#1d1d1f"/>
        <rect x="64" y="24" width="92" height="202" rx="19" fill="${c}"/>
        <path d="M70 60 L150 30 L150 70 L70 120 Z" fill="#fff" opacity=".35"/>
        <rect x="95" y="30" width="30" height="8" rx="4" fill="#1d1d1f"/>`;
    } else if (cat === "carga") {
      body = `
        <rect x="70" y="40" width="80" height="80" rx="16" fill="${c}" stroke="#c7c7cc" stroke-width="2"/>
        <rect x="100" y="70" width="20" height="8" rx="3" fill="#8e8e93"/>
        <path d="M110 120 C110 170 60 160 70 210" fill="none" stroke="${shade(c, -10)}" stroke-width="9" stroke-linecap="round"/>
        <rect x="62" y="205" width="18" height="30" rx="4" fill="${shade(c, -15)}" stroke="#c7c7cc"/>`;
    } else {
      body = `
        <polygon points="110,40 170,75 110,110 50,75" fill="${light}"/>
        <polygon points="50,75 110,110 110,190 50,155" fill="${c}"/>
        <polygon points="170,75 110,110 110,190 170,155" fill="${dark}"/>
        <g stroke="#000" stroke-opacity=".08">
          ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<line x1="50" y1="${85 + i * 11}" x2="110" y2="${120 + i * 11}"/><line x1="110" y1="${120 + i * 11}" x2="170" y2="${85 + i * 11}"/>`).join("")}
        </g>`;
    }
    return `<svg viewBox="0 0 220 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(p.nombre)}">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
      ${body}</svg>`;
  }

  function imagen(p, color) {
    const src = color?.imagen || p.imagen;
    if (src) return `<img src="${esc(src)}" alt="${esc(p.nombre)}${color ? " — " + esc(color.nombre) : ""}" loading="lazy">`;
    return placeholderSVG(p, color?.hex || p.colores?.[0]?.hex);
  }

  // ---------- carrito ----------
  function readCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return window.__cartFallback || [];
    }
  }

  function writeCart(items) {
    window.__cartFallback = items;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (e) { /* modo privado: queda en memoria */ }
    renderCart();
  }

  function addToCart(item) {
    const items = readCart();
    const key = [item.id, item.modelo || "", item.color || "", item.nota || ""].join("|");
    const found = items.find((i) => i.key === key);
    if (found) found.qty += item.qty;
    else items.push({ ...item, key });
    writeCart(items);
    track("AddToCart", { content_ids: [item.id], content_type: "product" });
  }

  function cartTotal(items) {
    return items.reduce((t, i) => {
      const p = DATA.productoPorId[i.id];
      return t + (p && !p.aCotizar ? p.precio * i.qty : 0);
    }, 0);
  }

  function renderCart() {
    if (!DATA) return;
    const items = readCart().filter((i) => DATA.productoPorId[i.id]);
    const count = items.reduce((t, i) => t + i.qty, 0);
    $$(".cart-count").forEach((el) => {
      el.textContent = count;
      el.hidden = count === 0;
    });

    const list = $("#cart-items");
    if (!list) return;
    if (!items.length) {
      list.innerHTML = `<div class="cart-empty"><p>Tu carrito está vacío.</p><a class="btn" href="catalogo.html">Ver productos</a></div>`;
      $("#cart-footer").hidden = true;
      return;
    }
    $("#cart-footer").hidden = false;
    list.innerHTML = items.map((i) => {
      const p = DATA.productoPorId[i.id];
      const color = p.colores?.find((c) => c.nombre === i.color);
      const modelo = i.modelo ? DATA.modeloPorId[i.modelo]?.nombre : "";
      const detalle = [modelo, i.color, i.nota ? `“${i.nota}”` : ""].filter(Boolean).map(esc).join(" · ");
      return `<div class="cart-item" data-key="${esc(i.key)}">
        <div class="cart-thumb">${imagen(p, color)}</div>
        <div class="cart-info">
          <strong>${esc(p.nombre)}</strong>
          <small>${detalle}</small>
          <div class="qty">
            <button type="button" data-act="menos" aria-label="Restar">−</button>
            <span>${i.qty}</span>
            <button type="button" data-act="mas" aria-label="Sumar">+</button>
            <button type="button" class="link" data-act="quitar">Quitar</button>
          </div>
        </div>
        <div class="cart-price">${p.aCotizar ? "A cotizar" : gs(p.precio * i.qty)}</div>
      </div>`;
    }).join("");

    const total = cartTotal(items);
    $("#cart-total").textContent = gs(total);
    const envio = $("#cart-envio");
    if (CFG.envioGratisDesde > 0) {
      envio.hidden = false;
      envio.textContent = total >= CFG.envioGratisDesde
        ? "¡Tenés envío gratis en Asunción!"
        : `Te faltan ${gs(CFG.envioGratisDesde - total)} para envío gratis en Asunción.`;
    } else envio.hidden = true;
  }

  function openCart(show = true) {
    $("#cart").classList.toggle("open", show);
    $("#cart-overlay").hidden = !show;
    document.body.classList.toggle("no-scroll", show);
    if (show) $("#cart-step-form").hidden = true, $("#cart-step-items").hidden = false;
  }

  function buildWhatsAppMessage(form) {
    const items = readCart().filter((i) => DATA.productoPorId[i.id]);
    const lines = items.map((i, n) => {
      const p = DATA.productoPorId[i.id];
      const partes = [p.nombre];
      if (i.modelo) partes.push(DATA.modeloPorId[i.modelo]?.nombre);
      if (i.color) partes.push("Color: " + i.color);
      if (i.nota) partes.push("Detalle: " + i.nota);
      const precio = p.aCotizar ? "a cotizar" : gs(p.precio * i.qty);
      return `${n + 1}) ${partes.join(" — ")} x${i.qty} → ${precio}`;
    });
    const msg = [
      `¡Hola ${CFG.nombre}! Quiero hacer este pedido:`,
      "",
      ...lines,
      "",
      `*Total: ${gs(cartTotal(items))}*`,
      "",
      `Nombre: ${form.nombre}`,
      `Ciudad / barrio: ${form.ciudad}`,
      `Entrega: ${form.entrega}`,
      `Pago: ${form.pago}`,
    ];
    if (form.nota) msg.push(`Nota: ${form.nota}`);
    return msg.join("\n");
  }

  function waLink(text) {
    return `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(text)}`;
  }

  // ---------- estructura común ----------
  function renderShell() {
    const page = document.body.dataset.page;
    if (CFG.modoDemo) {
      document.body.insertAdjacentHTML("afterbegin",
        `<div class="demo-bar">Sitio en construcción — productos y precios de ejemplo.</div>`);
    }
    const header = `
      <header class="site-header">
        <div class="container header-inner">
          <a class="logo" href="index.html" aria-label="${esc(CFG.nombre)} — inicio">
            <span class="logo-mark">◐</span><span>${esc(CFG.nombre)}</span>
          </a>
          <nav class="main-nav" aria-label="Principal">
            <a href="catalogo.html?linea=iphone" ${page === "catalogo" && params().get("linea") === "iphone" ? 'aria-current="page"' : ""}>Accesorios iPhone</a>
            <a href="catalogo.html?linea=3d" ${page === "catalogo" && params().get("linea") === "3d" ? 'aria-current="page"' : ""}>Impresiones 3D</a>
            <a href="index.html#como-comprar">Cómo comprar</a>
          </nav>
          <button class="cart-btn" type="button" id="open-cart" aria-label="Abrir carrito">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM5.2 4l.4 2H20a1 1 0 0 1 1 1.2l-1.4 7A2 2 0 0 1 17.6 16H8.1a2 2 0 0 1-2-1.6L4.1 3.8A1 1 0 0 0 3.1 3H2V1h1.1a3 3 0 0 1 2.9 2.4Z"/></svg>
            <span class="cart-count" hidden>0</span>
          </button>
        </div>
      </header>`;
    const footer = `
      <footer class="site-footer">
        <div class="container footer-grid">
          <div>
            <a class="logo" href="index.html"><span class="logo-mark">◐</span><span>${esc(CFG.nombre)}</span></a>
            <p>${esc(CFG.eslogan)}</p>
            <p>${esc(CFG.ciudad)}</p>
          </div>
          <div>
            <h4>Tienda</h4>
            <a href="catalogo.html?linea=iphone">Accesorios iPhone</a>
            <a href="catalogo.html?linea=3d">Impresiones 3D</a>
            <a href="producto.html?id=3d-impresion-a-pedido">Impresión a pedido</a>
          </div>
          <div>
            <h4>Contacto</h4>
            <a href="${waLink("¡Hola! Tengo una consulta.")}" target="_blank" rel="noopener">WhatsApp</a>
            ${CFG.instagram ? `<a href="${esc(CFG.instagram)}" target="_blank" rel="noopener">Instagram</a>` : ""}
            ${CFG.email ? `<a href="mailto:${esc(CFG.email)}">${esc(CFG.email)}</a>` : ""}
          </div>
        </div>
        <div class="container footer-bottom">© ${new Date().getFullYear()} ${esc(CFG.nombre)}</div>
      </footer>
      <a class="wa-float" href="${waLink("¡Hola! Tengo una consulta.")}" target="_blank" rel="noopener" aria-label="Escribinos por WhatsApp">
        <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><path fill="#fff" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3Zm0 23.7c-2 0-4-.5-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.7 10.7 0 1 1 16 26.7Zm5.9-8c-.3-.2-1.9-1-2.2-1-.3-.1-.5-.2-.7.1l-1 1.2c-.2.2-.4.3-.7.1a8.8 8.8 0 0 1-4.4-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.6 3.6 0 0 0-1.1 2.7 6.3 6.3 0 0 0 1.3 3.3c.2.2 2.2 3.4 5.4 4.8 2 .9 2.8.9 3.8.8.6-.1 1.9-.8 2.1-1.5.3-.7.3-1.4.2-1.5l-.6-.4Z"/></svg>
      </a>
      <div id="cart-overlay" class="cart-overlay" hidden></div>
      <aside id="cart" class="cart" aria-label="Carrito">
        <div class="cart-head">
          <h2>Tu pedido</h2>
          <button type="button" class="icon-btn" id="close-cart" aria-label="Cerrar carrito">✕</button>
        </div>
        <div id="cart-step-items">
          <div id="cart-items" class="cart-items"></div>
          <div id="cart-footer" class="cart-footer" hidden>
            <p id="cart-envio" class="cart-envio"></p>
            <div class="cart-total-row"><span>Total</span><strong id="cart-total"></strong></div>
            <button type="button" class="btn btn-primary btn-block" id="go-checkout">Continuar</button>
          </div>
        </div>
        <form id="cart-step-form" class="checkout" hidden>
          <label>Nombre y apellido<input name="nombre" required autocomplete="name"></label>
          <label>Ciudad / barrio<input name="ciudad" required autocomplete="address-level2"></label>
          <label>Entrega<select name="entrega">${(CFG.opcionesEntrega || []).map((o) => `<option>${esc(o)}</option>`).join("")}</select></label>
          <label>Forma de pago<select name="pago">${(CFG.opcionesPago || []).map((o) => `<option>${esc(o)}</option>`).join("")}</select></label>
          <label>Nota (opcional)<textarea name="nota" rows="2" placeholder="Dirección, horario, etc."></textarea></label>
          <button type="submit" class="btn btn-wa btn-block">Enviar pedido por WhatsApp</button>
          <button type="button" class="btn btn-ghost btn-block" id="back-to-items">Volver al carrito</button>
          <p class="fine">Te respondemos por WhatsApp para confirmar stock, envío y pago.</p>
        </form>
      </aside>`;
    document.body.insertAdjacentHTML("afterbegin", header);
    if (CFG.modoDemo) document.body.prepend($(".demo-bar"));
    document.body.insertAdjacentHTML("beforeend", footer);

    $("#open-cart").addEventListener("click", () => openCart(true));
    $("#close-cart").addEventListener("click", () => openCart(false));
    $("#cart-overlay").addEventListener("click", () => openCart(false));
    document.addEventListener("keydown", (e) => e.key === "Escape" && openCart(false));

    $("#cart-items").addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-act]");
      if (!btn) return;
      const key = btn.closest(".cart-item").dataset.key;
      let items = readCart();
      const it = items.find((i) => i.key === key);
      if (!it) return;
      if (btn.dataset.act === "mas") it.qty++;
      if (btn.dataset.act === "menos") it.qty--;
      if (btn.dataset.act === "quitar" || it.qty < 1) items = items.filter((i) => i.key !== key);
      writeCart(items);
    });

    $("#go-checkout").addEventListener("click", () => {
      $("#cart-step-items").hidden = true;
      $("#cart-step-form").hidden = false;
      track("InitiateCheckout");
    });
    $("#back-to-items").addEventListener("click", () => {
      $("#cart-step-form").hidden = true;
      $("#cart-step-items").hidden = false;
    });
    $("#cart-step-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const form = Object.fromEntries(new FormData(e.target));
      track("Contact");
      window.open(waLink(buildWhatsAppMessage(form)), "_blank", "noopener");
    });
  }

  // ---------- tarjetas ----------
  function card(p) {
    const colores = p.colores || [];
    const dots = colores.slice(0, 6).map((c) => `<span class="dot" style="background:${esc(c.hex)}" title="${esc(c.nombre)}"></span>`).join("");
    const extra = colores.length > 6 ? `<span class="more">+${colores.length - 6}</span>` : "";
    const modelos = modelosDe(p);
    return `<a class="card" href="producto.html?id=${encodeURIComponent(p.id)}">
      <div class="card-media">${imagen(p, colores[0])}
        ${(p.etiquetas || []).slice(0, 1).map((t) => `<span class="badge">${esc(t)}</span>`).join("")}
      </div>
      <div class="card-body">
        <h3>${esc(p.nombre)}</h3>
        <p class="card-sub">${modelos.length ? (modelos.length === DATA.modelos.length ? "Todos los modelos" : `${modelos.length} modelos`) : esc(DATA.categoriaPorId[p.categoria]?.nombre || "")}</p>
        <div class="card-foot">
          <span class="price">${p.aCotizar ? "A cotizar" : gs(p.precio)}${p.precioAntes ? ` <s>${gs(p.precioAntes)}</s>` : ""}</span>
          <span class="dots">${dots}${extra}</span>
        </div>
      </div>
    </a>`;
  }

  // ---------- páginas ----------
  function pageInicio() {
    const dest = DATA.productos.filter((p) => p.destacado);
    $("#destacados").innerHTML = dest.map(card).join("");
    const heroIphone = DATA.productoPorId["funda-silicona-magsafe"];
    const hero3d = DATA.productoPorId["3d-maceta-geometrica"];
    if (heroIphone) $("#hero-iphone").innerHTML = imagen(heroIphone, heroIphone.colores[3]);
    if (hero3d) $("#hero-3d").innerHTML = imagen(hero3d, hero3d.colores[1]);
    $$("[data-wa]").forEach((a) => (a.href = waLink(a.dataset.wa)));
  }

  function pageCatalogo() {
    const q = params();
    const state = {
      linea: q.get("linea") || "",
      cat: q.get("cat") || "",
      modelo: q.get("modelo") || "",
      texto: q.get("q") || "",
    };

    const modeloSel = $("#f-modelo");
    modeloSel.innerHTML = `<option value="">Todos los modelos</option>` +
      DATA.modelos.slice().reverse().map((m) => `<option value="${m.id}">${esc(m.nombre)}</option>`).join("");
    $("#f-texto").value = state.texto;

    function syncURL() {
      const u = new URLSearchParams();
      Object.entries({ linea: state.linea, cat: state.cat, modelo: state.modelo, q: state.texto })
        .forEach(([k, v]) => v && u.set(k, v));
      history.replaceState(null, "", "catalogo.html" + (u.toString() ? "?" + u : ""));
    }

    function render() {
      $$("#f-linea button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.linea === state.linea)));
      const cats = DATA.categorias.filter((c) => !state.linea || c.linea === state.linea);
      if (state.cat && !cats.some((c) => c.id === state.cat)) state.cat = "";
      $("#f-cat").innerHTML = [`<button type="button" data-cat="" aria-pressed="${!state.cat}">Todo</button>`]
        .concat(cats.map((c) => `<button type="button" data-cat="${c.id}" aria-pressed="${state.cat === c.id}">${esc(c.nombre)}</button>`)).join("");
      $("#f-modelo-wrap").hidden = state.linea === "3d";
      modeloSel.value = state.modelo;

      const t = state.texto.trim().toLowerCase();
      const list = DATA.productos.filter((p) => {
        if (state.linea && lineaDe(p) !== state.linea) return false;
        if (state.cat && p.categoria !== state.cat) return false;
        if (state.modelo && state.linea !== "3d") {
          if (lineaDe(p) !== "iphone") return false;
          if (!modelosDe(p).some((m) => m.id === state.modelo)) return false;
        }
        if (t && !(p.nombre + " " + (p.resumen || "") + " " + (p.colores || []).map((c) => c.nombre).join(" ")).toLowerCase().includes(t)) return false;
        return true;
      });

      const titulo = state.linea === "iphone" ? "Accesorios para iPhone" : state.linea === "3d" ? "Impresiones 3D" : "Todos los productos";
      $("#cat-title").textContent = titulo;
      document.title = `${titulo} | ${CFG.nombre}`;
      $("#cat-count").textContent = `${list.length} producto${list.length === 1 ? "" : "s"}`;
      $("#grid").innerHTML = list.length ? list.map(card).join("")
        : `<p class="empty">No encontramos productos con esos filtros. <a href="${waLink("¡Hola! Estoy buscando: " + state.texto)}" target="_blank" rel="noopener">Consultanos por WhatsApp</a>.</p>`;
      syncURL();
    }

    $("#f-linea").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      state.linea = b.dataset.linea; state.cat = ""; render();
    });
    $("#f-cat").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      state.cat = b.dataset.cat; render();
    });
    modeloSel.addEventListener("change", () => { state.modelo = modeloSel.value; render(); });
    $("#f-texto").addEventListener("input", (e) => { state.texto = e.target.value; render(); });
    render();
  }

  function pageProducto() {
    const p = DATA.productoPorId[params().get("id")];
    const root = $("#producto");
    if (!p) {
      root.innerHTML = `<div class="empty"><h1>Producto no encontrado</h1><a class="btn" href="catalogo.html">Ver catálogo</a></div>`;
      return;
    }
    document.title = `${p.nombre} | ${CFG.nombre}`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = p.resumen || p.descripcion || "";
    track("ViewContent", { content_ids: [p.id], content_type: "product", value: p.precio, currency: "PYG" });

    const colores = p.colores || [];
    const modelos = modelosDe(p);
    const cat = DATA.categoriaPorId[p.categoria];
    let color = colores[0] || null;
    const preModelo = params().get("modelo");

    root.innerHTML = `
      <nav class="crumbs"><a href="catalogo.html?linea=${cat.linea}">${cat.linea === "3d" ? "Impresiones 3D" : "Accesorios iPhone"}</a> / <a href="catalogo.html?linea=${cat.linea}&cat=${cat.id}">${esc(cat.nombre)}</a></nav>
      <div class="pdp">
        <div class="pdp-media" id="pdp-media">${imagen(p, color)}</div>
        <div class="pdp-info">
          ${(p.etiquetas || []).map((t) => `<span class="badge static">${esc(t)}</span>`).join(" ")}
          <h1>${esc(p.nombre)}</h1>
          <p class="pdp-price">${p.aCotizar ? "Precio a cotizar" : gs(p.precio)}${p.precioAntes ? ` <s>${gs(p.precioAntes)}</s>` : ""}</p>
          <p class="pdp-lead">${esc(p.resumen || "")}</p>
          <form id="add-form" class="pdp-form">
            ${modelos.length ? `
              <label class="field">Modelo de iPhone
                <select name="modelo" required>
                  <option value="">Elegí tu modelo</option>
                  ${modelos.slice().reverse().map((m) => `<option value="${m.id}" ${m.id === preModelo ? "selected" : ""}>${esc(m.nombre)}</option>`).join("")}
                </select>
              </label>` : ""}
            ${colores.length ? `
              <fieldset class="field">
                <legend>Color: <strong id="color-name">${esc(color.nombre)}</strong></legend>
                <div class="swatches">
                  ${colores.map((c, i) => `<label class="swatch" title="${esc(c.nombre)}">
                    <input type="radio" name="color" value="${esc(c.nombre)}" ${i === 0 ? "checked" : ""}>
                    <span style="background:${esc(c.hex)}" class="${isLight(c.hex) ? "light" : ""}"></span>
                  </label>`).join("")}
                </div>
              </fieldset>` : ""}
            ${p.personalizable ? `
              <label class="field">${esc(p.personalizable)}
                <input name="nota" required maxlength="120">
              </label>` : ""}
            <div class="pdp-actions">
              <div class="qty big">
                <button type="button" data-q="-1" aria-label="Restar">−</button>
                <input name="qty" type="number" min="1" max="99" value="1" aria-label="Cantidad">
                <button type="button" data-q="1" aria-label="Sumar">+</button>
              </div>
              <button type="submit" class="btn btn-primary grow">${p.aCotizar ? "Agregar para cotizar" : "Agregar al carrito"}</button>
            </div>
            <p id="added-msg" class="added-msg" hidden>Agregado ✓ <button type="button" class="link" id="see-cart">Ver carrito</button></p>
          </form>
          <a class="btn btn-ghost btn-block" id="ask-wa" target="_blank" rel="noopener">Consultar por WhatsApp</a>
          <div class="pdp-desc">
            <h2>Descripción</h2>
            <p>${esc(p.descripcion || "")}</p>
            <ul class="perks">
              <li>Envíos a todo Paraguay</li>
              <li>Atención personalizada por WhatsApp</li>
              <li>Cambios si el modelo no coincide</li>
            </ul>
          </div>
        </div>
      </div>
      <section class="related">
        <h2>También te puede gustar</h2>
        <div class="grid">${DATA.productos.filter((o) => o.id !== p.id && lineaDe(o) === cat.linea).slice(0, 4).map(card).join("")}</div>
      </section>`;

    const form = $("#add-form");
    const qtyInput = form.elements.qty;

    function updateAsk() {
      const modelo = form.elements.modelo?.value;
      const txt = `¡Hola! Quiero consultar por: ${p.nombre}` +
        (modelo ? ` para ${DATA.modeloPorId[modelo].nombre}` : "") +
        (color ? `, color ${color.nombre}` : "");
      $("#ask-wa").href = waLink(txt);
    }

    form.addEventListener("change", (e) => {
      if (e.target.name === "color") {
        color = colores.find((c) => c.nombre === e.target.value);
        $("#color-name").textContent = color.nombre;
        $("#pdp-media").innerHTML = imagen(p, color);
      }
      updateAsk();
    });
    form.addEventListener("click", (e) => {
      const b = e.target.closest("[data-q]"); if (!b) return;
      qtyInput.value = Math.max(1, Math.min(99, (+qtyInput.value || 1) + +b.dataset.q));
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = new FormData(form);
      addToCart({
        id: p.id,
        modelo: f.get("modelo") || "",
        color: f.get("color") || "",
        nota: (f.get("nota") || "").trim(),
        qty: Math.max(1, Math.min(99, +f.get("qty") || 1)),
      });
      $("#added-msg").hidden = false;
    });
    $("#see-cart").addEventListener("click", () => openCart(true));
    updateAsk();
  }

  // ---------- Píxel de Meta ----------
  function initPixel() {
    if (!CFG.metaPixelId) return;
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq("init", CFG.metaPixelId);
    window.fbq("track", "PageView");
  }

  function track(evento, datos) {
    if (window.fbq) window.fbq("track", evento, datos || {});
  }

  // ---------- inicio ----------
  async function init() {
    renderShell();
    initPixel();
    try {
      await loadData();
    } catch (e) {
      const main = $("main");
      if (main) main.insertAdjacentHTML("afterbegin", `<p class="empty">No se pudo cargar el catálogo. Recargá la página.</p>`);
      return;
    }
    renderCart();
    const page = document.body.dataset.page;
    if (page === "inicio") pageInicio();
    if (page === "catalogo") pageCatalogo();
    if (page === "producto") pageProducto();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
