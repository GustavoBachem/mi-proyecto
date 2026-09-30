# Administrar la web desde Google Sheets

La planilla **es** la web. Agregás un producto, cambiás un precio o marcás un color sin stock desde el celular, y la web se actualiza sola. No hay que tocar código ni publicar nada.

## Configuración (una sola vez, unos 10 minutos)

1. **Subí la plantilla a Google Drive:** `docs/plantilla-catalogo.xlsx` → en Drive, clic derecho → *Abrir con → Hojas de cálculo de Google* → *Archivo → Guardar como Hojas de cálculo de Google*.
2. **Publicala como CSV:** *Archivo → Compartir → Publicar en la web*.
   - En el primer desplegable elegí la pestaña **productos**; en el segundo, **Valores separados por comas (.csv)** → *Publicar*. Copiá el link.
   - Repetí lo mismo con la pestaña **colores** y copiá ese segundo link.
3. **Pegá los dos links** en `assets/js/config.js`, en `hojaProductosCSV` y `hojaColoresCSV`. O pasámelos y lo hago yo.

Listo. Desde ese momento la web lee el catálogo de la planilla.

> Google tarda unos **5 minutos** en reflejar los cambios publicados.
> Si alguna vez la planilla no responde, la web muestra el catálogo de respaldo (`data/products.json`), así nunca queda vacía.

## Uso diario

| Quiero… | Hago… |
|---|---|
| Agregar un producto | Fila nueva en **productos** + una fila por color en **colores** |
| Cambiar un precio | Edito la columna `precio` |
| Poner una oferta | Precio viejo en `precio_antes` (se muestra tachado) |
| Sin stock de un color | `disponible = no` en **colores** |
| Ocultar un producto | `activo = no` en **productos** |
| Mostrarlo en el inicio | `destacado = si` |

### Fotos
- Subí las fotos a una carpeta de Google Drive y compartila como *"Cualquier persona con el enlace"*.
- Copiá el link de cada foto en la columna `imagen` de su color. La web convierte sola los links de Drive.
- **Una foto por color** alcanza. Ver [FOTOS.md](FOTOS.md).

### Modelos de iPhone
En la columna `modelos` escribí `todos` o una lista separada por comas: `15, 15 Pro, 15 Pro Max`. También funciona con "iPhone" adelante (`iPhone 15 Pro`). La lista completa está en la pestaña **listas**.

## Siguiente nivel: cargar productos sin abrir la planilla

Como el catálogo está en Google Sheets, n8n lo puede llenar solo:

1. Mandás una **foto + "Funda glitter, 15 Pro y 16 Pro, 110 mil"** a un bot de WhatsApp o Telegram.
2. n8n guarda la foto en Drive y Claude arma la fila: nombre, descripción, categoría, modelos y precio.
3. n8n agrega la fila a la planilla y la web se actualiza.

La misma planilla puede alimentar el **catálogo de Meta** (Facebook e Instagram Shopping y anuncios de catálogo) y el **bot de atención 24 hs**, que responde con precios y stock reales.
