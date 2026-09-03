# 🏗️ Tecnorampa Pro-Store: Manual de Operación Final

Este repositorio contiene el sistema oficial de venta de refacciones industriales para Tecnorampa S.A. de C.V.

## 🚀 Conexión de Dominio Propio (GoDaddy)
Sigue estos pasos exactos para que tu tienda funcione en tu nuevo dominio:

### 1. En la Consola de Firebase:
1. Ve a **App Hosting** -> Selecciona tu backend -> **Configuración** (Settings).
2. Haz clic en la pestaña **"Dominios"**.
3. Haz clic en **"Conectar dominio personalizado"**.
4. Escribe tu dominio (ej: `tecnorampa.com.mx` o `tienda.tecnorampa.mx`).
5. Firebase te mostrará unos valores llamados **Registros A** (son direcciones IP como `151.101.x.x`). **Cópialos**.

### 2. En tu cuenta de GoDaddy:
1. Entra a **Mis Productos** -> Busca tu dominio -> Clic en **DNS**.
2. En la tabla de registros, busca si hay algún registro de tipo **A** con el nombre `@` y elíminalo (o edítalo).
3. Agrega los registros que te dio Firebase:
   - **Tipo**: A
   - **Nombre**: @
   - **Valor**: (Pega la IP que te dio Firebase)
   - **TTL**: Predeterminado / 1 hora.
4. Si Firebase te dio más de una IP, agrega otro registro A igual, solo cambiando el valor por la segunda IP.
5. **Espera**: GoDaddy puede tardar de 1 a 24 horas en avisar a todo internet del cambio, aunque usualmente queda en 30 minutos.

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
