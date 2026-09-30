# MyCase Store — www.mycasestore.com.py

Tienda online de **accesorios para iPhone** e **impresiones 3D** (JazzLab 3D) en un solo sitio.

- Sitio estático: HTML + CSS + JavaScript, sin servidor ni base de datos.
- Hosting gratis en Cloudflare Pages (o Netlify / GitHub Pages).
- El cliente arma el carrito (modelo de iPhone + color + cantidad) y el pedido le llega **armado a tu WhatsApp**.
- Listo para Meta Ads: solo hay que pegar el ID del Píxel en la configuración.

## Estructura

```
index.html            Inicio (hero, buscador por modelo, destacados, cómo comprar, FAQ)
catalogo.html         Catálogo con filtros: línea, categoría, modelo de iPhone y búsqueda
producto.html         Ficha de producto (?id=...) con modelo, colores, cantidad y carrito
data/products.json    ← EL CATÁLOGO: productos, precios, colores, modelos
assets/js/config.js   ← CONFIGURACIÓN: WhatsApp, envíos, formas de pago, Píxel de Meta
assets/js/app.js      Lógica de la tienda (no hace falta tocarlo)
assets/css/styles.css Diseño
assets/img/productos/ Fotos de productos
docs/                 Guías (publicar, fotos, roadmap)
```

## Lo primero que tenés que cambiar

En `assets/js/config.js`:

1. `whatsapp`: tu número, por ejemplo `"595981123456"`.
2. `instagram`: el link a tu cuenta.
3. `modoDemo: false` cuando los precios sean los reales.

## Cargar o editar productos

**Recomendado: desde Google Sheets**, sin tocar código. Ver [docs/PLANILLA.md](docs/PLANILLA.md). La plantilla lista para importar está en `docs/plantilla-catalogo.xlsx`.

Si no hay planilla configurada, la web usa `data/products.json`, que también funciona como respaldo. Cada producto se ve así:

```json
{
  "id": "funda-silicona-magsafe",          // sin espacios ni tildes; se usa en el link
  "nombre": "Funda de silicona MagSafe",
  "categoria": "fundas",                   // ver lista "categorias"
  "precio": 120000,
  "precioAntes": 150000,                   // opcional: muestra el precio tachado
  "destacado": true,                       // opcional: aparece en el inicio
  "etiquetas": ["Más vendido"],            // opcional
  "resumen": "Frase corta",
  "descripcion": "Texto largo",
  "modelos": "todos",                      // o una lista: ["15", "15p", "16"]
  "colores": [
    { "nombre": "Negro", "hex": "#1d1d1f", "imagen": "assets/img/productos/silicona-negro.webp" }
  ]
}
```

- **Una foto por color**, no por modelo. El modelo de iPhone se elige en una lista, así un producto con 8 colores y 18 modelos necesita solo 8 fotos.
- Si un color no tiene `imagen`, se muestra una ilustración del color. Así la web se ve prolija mientras sacás las fotos.
- `"aCotizar": true` es para productos sin precio fijo, como la impresión 3D a pedido.
- `"personalizable": "Texto a pedir"` agrega un campo de texto, por ejemplo para el nombre de un llavero.

También me lo podés pedir a mí (Claude Code): *"agregá la funda X en estos colores a este precio"*.

## Ver la web en tu computadora

```bash
python3 -m http.server 8080
# abrir http://localhost:8080
```

## Guías

- [docs/PLANILLA.md](docs/PLANILLA.md): administrar productos, precios y stock desde Google Sheets.
- [docs/PUBLICAR.md](docs/PUBLICAR.md): publicar gratis y conectar el dominio `.com.py`.
- [docs/FOTOS.md](docs/FOTOS.md): cómo hacer las fotos del catálogo rápido y con calidad profesional, con ayuda de IA.
- [docs/ROADMAP.md](docs/ROADMAP.md): próximos pasos (pagos online, WhatsApp 24 hs, CRM, contenido con IA).
