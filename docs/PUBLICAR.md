# Publicar la web gratis con tu dominio

**Costo de hosting: 0 Gs.** Lo único que se sigue pagando es la renovación del dominio `.com.py` en NIC.py.

## 1. Crear la cuenta en Cloudflare (gratis)

1. Entrá a https://dash.cloudflare.com/sign-up y creá una cuenta.
2. Andá a **Workers & Pages → Create → Pages → Connect to Git**.
3. Conectá tu GitHub y elegí el repositorio `mi-proyecto`.
4. Configuración de build:
   - **Framework preset:** None
   - **Build command:** *(vacío)*
   - **Build output directory:** `/`
   - **Production branch:** `main`
5. **Save and Deploy.** En un minuto tenés la web en `https://mi-proyecto.pages.dev`.

Cada vez que se actualice el repositorio (por ejemplo, cuando cargo productos nuevos), la web se actualiza sola.

## 2. Recuperar el acceso al dominio en NIC.py

El dominio `.com.py` se administra en **NIC Paraguay** (https://www.nic.py).

- Si lo registró la empresa de hosting, puede estar a nombre de ellos como "contacto técnico". Pediles por escrito:
  1. que el dominio quede **a tu nombre** como titular,
  2. el **usuario y la contraseña** del panel de NIC.py, o que cambien los DNS por los de Cloudflare.
- Si no responden, escribí a NIC.py con tu cédula o RUC: el titular puede recuperar el control.

> ⚠️ No des de baja el servicio viejo hasta tener el dominio bajo tu control. Si el dominio vence, se puede perder.

## 3. Apuntar el dominio a Cloudflare

1. En Cloudflare: **Add a site** → `mycasestore.com.py` → plan **Free**.
2. Cloudflare te da dos *nameservers*, por ejemplo `ana.ns.cloudflare.com` y `bob.ns.cloudflare.com`.
3. En el panel de NIC.py, reemplazá los DNS del dominio por esos dos.
4. Esperá la propagación: puede tardar desde minutos hasta 24 o 48 horas.
5. En tu proyecto de Pages: **Custom domains → Set up a domain** → `www.mycasestore.com.py`. Agregá también `mycasestore.com.py`.

El certificado HTTPS (el candadito) es automático y gratis.

## 4. Correo con tu dominio (opcional)

Con Cloudflare **Email Routing** (gratis) podés recibir en `ventas@mycasestore.com.py` y reenviarlo a tu Gmail.
