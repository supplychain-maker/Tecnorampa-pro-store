# 🏗️ Tecnorampa Pro-Store: Manual de Operación Final

Este repositorio contiene el sistema oficial de venta de refacciones industriales para Tecnorampa S.A. de C.V.

## 🚀 Conexión de Dominio (GoDaddy) - SOLUCIÓN A IPs EN ROJO

Si en Firebase te aparecen valores en rojo que "se deben quitar" (como `13.248.243.5` o similares) y no los ves en GoDaddy, sigue estos pasos:

1. **En GoDaddy (DNS Management):**
   - Busca los registros de tipo **A** con el nombre `@`.
   - Si ves alguno que NO sea el de Firebase (`35.219.200.195`), elimínalo.
   - **IMPORTANTE:** Si no ves más registros A, busca una sección que diga **"Reenvío" (Forwarding)** o **"Estacionamiento de dominio"**. Si están activos, desactívalos/elimínalos, ya que ellos crean esos registros "ocultos".
2. **El registro "Parked":**
   - A veces GoDaddy tiene un registro A llamado `@` con valor `Parked`. **Bórralo**.
3. **Configuración en Firebase:**
   - En la ventana de "Editar dominio", selecciona siempre **"Entregar tráfico desde este dominio"**.
4. **Espera la propagación:**
   - Una vez que solo quede el registro A de Firebase en tu lista de GoDaddy, Firebase tardará desde unos minutos hasta un par de horas en dejar de ver los anteriores. Cuando el recuadro rojo desaparezca, tu sitio estará al 100%.

---

## 🔑 Solución a Error de Autenticación (GitHub Token)
Si al hacer `git push` sale el error "Invalid username or token", sigue esta guía:

1. **Genera un Token en GitHub**:
   - Perfil -> **Settings** -> **<> Developer settings** -> **Personal access tokens** -> **Tokens (classic)**.
   - **Note**: "Tecnorampa-Pro-Key".
   - **Expiration**: 90 días.
   - **Scopes**: Marca únicamente la casilla **'repo'**.
2. **Actualiza la terminal**:
   `git remote set-url origin https://<TU_TOKEN_AQUI>@github.com/supplychain-maker/Tecnorampa-pro-store.git`

---

## 🛠️ Configuración de Secretos (IMPORTANTE)
Para que el catálogo y los pagos funcionen en el dominio real, estas variables deben estar en **App Hosting -> Settings -> Environment Variables** como **Secrets**:

- `STRIPE_SECRET_KEY`
- `GOOGLE_GENAI_API_KEY`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## 📞 Soporte
*Para solicitar factura o envío, favor de comunicarse por whatsapp al 427 276 1410*.
