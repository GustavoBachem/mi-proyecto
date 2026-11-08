# Tienda actual: mycasestore.com.py (WordPress + WooCommerce)

Relevamiento del 1/10/2026, hecho desde la API pública de la tienda.

## Estado
- WordPress con WooCommerce, tema **Kadence**, plugin de WhatsApp **Joinchat** (creame-whatsapp-me).
- El dominio canónico es `mycasestore.com.py`, sin www. `www.` redirige con 301.
- Moneda: PYG.
- 8 productos publicados:

| Producto | Tipo | Precio | Variantes |
|---|---|---|---|
| Case MagSafe Reforzado — iPhone 17 Pro | variable | 70.000 | Color: Negro, Marrón, Naranja |
| Tarjetero MagSafe | variable | 60.000 | Colores: Azul Oscuro, Negro, Marrón |
| Case Tornasolado MagSafe — iPhone 17 Pro Max | simple | 70.000 | — |
| Case MagSafe Borde de Color — iPhone 15 Pro | simple | 55.000 | — |
| Case MagSafe Transparente — iPhone 14 Pro | simple | 50.000 | — |
| Case Chili Peppers — iPhone 15 Pro | simple | 50.000 | — |
| Case de Silicona — iPhone 11 | variable | 40.000 | Color: 11 colores |
| Case MagSafe Reforzado con Protector de Cámara | simple | 65.000 | — (categoría iPhone 16) |

- Categorías: Cases, Tarjeteros y **una categoría por modelo de iPhone** (iPhone 14 Pro, 15 Pro, 16, 17 Pro, 17 Pro Max).
- Atributos globales: solo `pa_color`. El Tarjetero usa un atributo local "Colores".

## Problema principal
Se crea **un producto por cada modelo de iPhone** ("Case X — iPhone 15 Pro"). Con 18 modelos, cada diseño nuevo implica hasta 18 productos, y por eso cargar el catálogo se vuelve interminable.

## Plan
1. Crear el atributo global **Modelo** (`pa_modelo`) con todos los iPhone y unificar **Color** (`pa_color`).
2. **Un producto por diseño**, variable con Modelo × Color, y una foto por color.
   Ejemplo: "Case de Silicona" pasa a ser 1 producto en lugar de 18, y el cliente elige su modelo y su color.
3. Pasar los productos actuales a ese formato con la API REST (`/wp-json/wc/v3`) y redirigir las URLs viejas.
4. Carga masiva de productos nuevos desde la planilla (`docs/plantilla-catalogo.xlsx`) mediante la API.
5. Más adelante: un bot de Telegram con n8n que crea productos en WooCommerce a partir de una foto y un texto.

## Acceso
- Credencial "WooCommerce MyCase" (tipo Basic, Consumer key y secret con permisos de lectura/escritura) guardada en el entorno de la nube.
  Los sitios permitidos tienen que incluir **`mycasestore.com.py`** (sin www), porque la API responde ahí.
- Las credenciales del entorno se aplican al abrir una sesión nueva.
