# 🏗️ Tecnorampa Pro-Store: Manual de Operación Final

Este repositorio contiene el sistema oficial de venta de refacciones industriales para Tecnorampa S.A. de C.V.

## 🚀 Conexión de Dominio (GoDaddy) - SOLUCIÓN A IPs EN ROJO

Si en Firebase te aparecen valores en rojo que "se deben quitar" (como `13.248.243.5` o similares) y no los ves en tu lista de DNS de GoDaddy, sigue estos pasos exactos:

1. **En GoDaddy (Pestaña DNS Records):**
   - Busca en la tabla principal de registros un registro de tipo **A** que tenga el valor `Parked`. **BÓRRALO**.
   - Si ves un registro de tipo **AAAA**, **BÓRRALO** también (Firebase no lo necesita y causa conflictos).
   - Busca el registro tipo **A** con nombre `@`. Asegúrate de que **SOLO HAYA UNO** y que apunte a la IP de Firebase: `35.219.200.195`.

2. **Configuración Correcta:**
   - Registro **A** | Host: `@` | Value: `35.219.200.195`
   - Registro **CNAME** | Host: `www` | Value: `tecnorampastore.com` (o `@`)

3. **Espera la propagación:**
   - Una vez eliminado el registro "Parked", Firebase tardará de 15 a 30 minutos en dejar de ver las IPs viejas. En cuanto el recuadro rojo desaparezca, tu tienda aparecerá automáticamente con su certificado de seguridad.

---

## 🔑 Solución a Error de Autenticación (GitHub Token)
Si al hacer `git push` sale el error "Invalid username or token", sigue esta guía:

1. **Genera un Token en GitHub**:
   - Perfil -> **Settings** -> **<> Developer settings** -> **Personal access tokens** -> **Tokens (classic)**.
   - **Note**: "Acceso-Studio".
   - **Expiration**: 90 días.
   - **Scopes**: Marca únicamente la casilla **'repo'**.
2. **Actualiza la terminal**:
   `git remote set-url origin https://<TU_TOKEN_AQUI>@github.com/supplychain-maker/Tecnorampa-pro-store.git`

---

## 🛠️ Configuración de Secretos (IMPORTANTE)
Para que el catálogo y los pagos funcionen en el dominio real, estas variables deben estar en **App Hosting -> Settings -> Environment Variables** como **Secrets**:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## 📞 Soporte
*Para solicitar factura o envío, favor de comunicarse por whatsapp al 427 276 1410*.
