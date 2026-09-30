# Próximos pasos

## Fase 1: Web online (ahora)
- [x] Tienda con catálogo, variantes (modelo + color), carrito y pedido por WhatsApp
- [ ] Poner número de WhatsApp real e Instagram en `assets/js/config.js`
- [ ] Recuperar el dominio en NIC.py y publicar en Cloudflare Pages ([PUBLICAR.md](PUBLICAR.md))
- [x] Catálogo administrable desde Google Sheets ([PLANILLA.md](PLANILLA.md))
- [ ] Importar la plantilla a Google Sheets, publicarla y pegar los links en `config.js`
- [ ] Cargar productos y precios reales, y sacar fotos ([FOTOS.md](FOTOS.md))
- [ ] n8n: cargar productos mandando foto + texto por WhatsApp o Telegram
- [ ] Pasar el contenido de jazzlab3d.netlify.app a la sección de Impresiones 3D
- [ ] `modoDemo: false`

## Fase 2: Publicidad
- [ ] Crear el Píxel de Meta y pegar el ID en `config.js`. La web ya envía los eventos ViewContent, AddToCart, InitiateCheckout y Contact.
- [ ] Catálogo de productos en Meta (Facebook/Instagram Shopping y anuncios de catálogo), generado desde `data/products.json`
- [ ] Google Business Profile, para aparecer en Maps

## Fase 3: Pago online
- [ ] Integrar una pasarela paraguaya (Pagopar o Bancard) con una función serverless gratuita (Cloudflare Workers)

## Fase 4: Atención 24 hs + CRM
- [ ] WhatsApp Business: mensaje de bienvenida, de ausencia y respuestas rápidas (gratis, desde la app)
- [ ] WhatsApp Cloud API (Meta) + n8n + Claude: respuestas automáticas con catálogo, precios y stock reales, y derivación a una persona cuando haga falta
- [ ] CRM: cada contacto y pedido se guarda automáticamente (Google Sheets al principio, HubSpot gratis después)
- [ ] n8n instalado en un VPS propio (unos 5 US$ por mes), sin plan pago

## Fase 5: Contenido con IA
- [ ] Guiones para Reels y TikTok por producto (Claude)
- [ ] Videos de producto con Higgsfield a partir de las fotos reales
- [ ] Plantillas de marca en Canva para posts, historias y anuncios
- [ ] Calendario de publicaciones automatizado con n8n
