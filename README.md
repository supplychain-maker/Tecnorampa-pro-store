# 🏗️ Tecnorampa Pro-Store: Manual de Operación Final

Este repositorio contiene el sistema oficial de venta de refacciones industriales para Tecnorampa S.A. de C.V.

## 🚀 Estado del Dominio de Producción
Tu tienda ya está en vivo en el dominio permanente:
`https://tecnorampa-tienda--studio-1924852802-ce47d.us-east4.hosted.app`

## 🌐 Cómo conectar tu propio dominio (ej: tecnorampa.mx)
Para que tu tienda tenga una dirección profesional, sigue estos pasos:

1. **En la Consola de Firebase**:
   - Ve a **App Hosting** -> Tu backend -> **Configuración** (Settings) -> **Dominios**.
   - Haz clic en **"Conectar dominio personalizado"**.
   - Escribe tu dominio (ej: `tienda.tecnorampa.mx`).

2. **En tu proveedor de dominio**:
   - Firebase te dará unos valores llamados **Registros A**. Cópialos y pégalos en la configuración DNS de tu dominio.

## 🔑 Solución a Error de Autenticación (Git Push)
Si al hacer `git push` sale el error "Invalid username or token", sigue esta guía exacta:

### 1. Genera un Token en GitHub:
- Ve a [GitHub.com](https://github.com) e inicia sesión.
- Haz clic en tu **foto de perfil** (arriba a la derecha) -> **Settings**.
- En la barra lateral izquierda, baja hasta el final y haz clic en **<> Developer settings**.
- Haz clic en **Personal access tokens** -> **Tokens (classic)**.
- Haz clic en **Generate new token** -> **Generate new token (classic)**.
- **Configuración del Token**:
  - **Note**: Ponle "Tecnorampa-Key".
  - **Expiration**: 90 días (recomendado).
  - **Scopes**: Marca únicamente la casilla **'repo'** (esto permite subir código).
- Haz clic en "Generate token" al final de la página.
- **IMPORTANTE**: Copia el código que aparece (empieza con `ghp_`). No se volverá a mostrar.

### 2. Actualiza la terminal de este editor:
Escribe este comando reemplazando `<TOKEN>` por el código que copiaste:
`git remote set-url origin https://<TOKEN>@github.com/supplychain-maker/Tecnorampa-pro-store.git`

### 3. Intenta de nuevo:
`git add .`
`git commit -m "Actualización de sistema"`
`git push`

## 🛠️ Configuración de Secretos (IMPORTANTE)
Para que el sistema funcione, los siguientes secretos DEBEN estar configurados en **App Hosting -> Settings -> Environment Variables** como **Secrets**:

### Llaves de Negocio
- `STRIPE_SECRET_KEY`: Tu clave `sk_live_...`
- `STRIPE_WEBHOOK_SECRET`: Tu clave `whsec_...`
- `GOOGLE_GENAI_API_KEY`: Tu llave de Gemini IA.

### Llaves de Conexión (Firebase)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## 🛠️ Herramientas Administrativas
- **Gestión de Inventario**: `/admin/products`
- **Control de Entregas**: `/admin/deliveries`
- **Asistente IA**: `/assistant`

## 📞 Soporte
*Para solicitar factura o envío, favor de comunicarse por whatsapp al 427 276 1410*.
