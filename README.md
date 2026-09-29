# 🏗️ Tecnorampa Pro-Store: Manual de Operación Final

Este repositorio contiene el sistema oficial de venta de refacciones industriales para Tecnorampa S.A. de C.V.

## 🚀 Conexión de Dominio (GoDaddy) - SOLUCIÓN DEFINITIVA

Si tu página muestra el Website Builder de GoDaddy en lugar de tu tienda, sigue estos pasos exactos en tu tabla de registros DNS:

1. **Borra el registro conflictivo**:
   - Busca el registro tipo **A** que en la columna "Data" dice **`WebsiteBuilder Site`**.
   - Haz clic en el icono del **Bote de Basura (Delete)** a la derecha de ese registro y confirma.

2. **Verifica el registro correcto**:
   - Asegúrate de que **SOLO QUEDE UN registro tipo A** con el nombre `@`.
   - Ese registro debe tener el valor: **`35.219.200.195`**.

3. **Limpia registros invisibles**:
   - Si ves algún registro tipo **AAAA**, bórralo también (Firebase no lo usa y causa errores).

4. **Espera la propagación**:
   - Una vez que borres el registro de "WebsiteBuilder", tu tienda aparecerá automáticamente. Esto puede tardar de 5 a 15 minutos en reflejarse en tu navegador.

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
Para que el catálogo y los pagos funcionen, estas variables deben estar en **App Hosting -> Settings -> Environment Variables** como **Secrets**:
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## 📞 Soporte
*Para solicitar factura o envío, favor de comunicarse por whatsapp al 427 276 1410*.
