# 🏗️ Tecnorampa Pro-Store: Manual de Operación Final

Este repositorio contiene el sistema oficial de venta de refacciones industriales para Tecnorampa S.A. de C.V.

## 🚀 Conexión de Dominio (GoDaddy) - SOLUCIÓN A IPs EN ROJO

Si en Firebase te aparecen valores en rojo que "se deben quitar" (como `13.248.243.5` o similares) y no los ves en tu lista de DNS de GoDaddy, sigue estos pasos exactos:

1. **En GoDaddy (DNS Management):**
   - Baja hasta el final de la página de DNS y busca la sección **"Reenvío" (Forwarding)**.
   - Si hay algo configurado en "Dominio" o "Subdominio", **ELIMÍNALO**. Esto es lo que crea las IPs en rojo.
   - Busca en la tabla de registros un registro de tipo **A** que tenga el valor `Parked`. **BÓRRALO**.

2. **Configuración Correcta:**
   - Solo debe quedar **UN solo registro tipo A** con el nombre `@` apuntando a la IP de Firebase: `35.219.200.195`.
   - Si usas `www`, asegúrate de que sea un **CNAME** apuntando a `tecnorampastore.com`.

3. **Espera la propagación:**
   - Una vez eliminado el Reenvío y el registro "Parked", Firebase tardará de 15 a 30 minutos en dejar de ver las IPs viejas. En cuanto el recuadro rojo desaparezca, tu tienda aparecerá automáticamente.

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
