// Configuración general de la tienda.
// Cambiá estos valores y la web se actualiza sola (no hace falta tocar nada más).
window.STORE_CONFIG = {
  nombre: "MyCase Store",
  eslogan: "Accesorios para iPhone e impresiones 3D en Paraguay",

  // Número de WhatsApp que recibe los pedidos: código de país + número, sin "+" ni espacios.
  // Ejemplo: 0981 123 456  ->  "595981123456"
  whatsapp: "595900000000",

  instagram: "https://instagram.com/",
  email: "",
  ciudad: "Asunción, Paraguay",

  // Catálogo desde Google Sheets (ver docs/PLANILLA.md).
  // Pegá acá los links "Publicar en la web → CSV" de cada pestaña.
  // Si quedan vacíos, se usa data/products.json.
  hojaProductosCSV: "",
  hojaColoresCSV: "",

  // Mientras sea true se muestra un aviso de "precios de ejemplo" arriba de todo.
  modoDemo: true,

  // Envíos
  envioGratisDesde: 300000, // Gs. Poné 0 para desactivar el mensaje.
  opcionesEntrega: [
    "Delivery en Asunción y Gran Asunción",
    "Envío al interior (encomienda)",
    "Retiro en local / punto de encuentro",
  ],
  opcionesPago: [
    "Transferencia bancaria",
    "Efectivo contra entrega",
    "Tarjeta (te enviamos link de pago)",
  ],

  // ID del Píxel de Meta (Facebook/Instagram Ads). Dejalo vacío hasta tenerlo.
  metaPixelId: "",
};
