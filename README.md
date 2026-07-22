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

## 🛠️ Configuración de Secretos (IMPORTANTE)
Para que el sistema funcione, los siguientes secretos DEBEN estar configurados en **App Hosting -> Settings -> Environment Variables**:

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
