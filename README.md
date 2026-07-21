# 🏗️ Tecnorampa Pro-Store: Manual de Operación Final

Este repositorio contiene el sistema oficial de venta de refacciones industriales para Tecnorampa S.A. de C.V.

## 🚀 Estado del Dominio de Producción
Tu tienda ya está en vivo en el dominio permanente:
`https://tecnorampa-tienda--studio-1924852802-ce47d.us-east4.hosted.app`

## 🌐 Cómo conectar tu propio dominio (ej: tecnorampa.mx)
Para que tu tienda tenga una dirección profesional, sigue estos pasos:

1. **En la Consola de Firebase**:
   - Ve a **App Hosting** en el menú izquierdo.
   - Haz clic en tu backend (`Tecnorampa-pro-store`).
   - Ve a la pestaña **Configuración** (Settings) -> **Dominios**.
   - Haz clic en **"Conectar dominio personalizado"**.
   - Escribe tu dominio (ej: `tienda.tecnorampa.mx` o `tecnorampa.mx`).

2. **En tu proveedor de dominio (GoDaddy, Namecheap, etc.)**:
   - Firebase te dará unos valores llamados **Registros A** (direcciones IP).
   - Copia esos valores y pégalos en la configuración DNS de tu dominio.
   - **Nota**: El certificado de seguridad (SSL/HTTPS) se generará automáticamente y gratis una vez que los DNS se reconozcan.

## 🛠️ Configuración de Secretos (Mantenimiento)
Si el sistema llegara a mostrar errores de "Secret missing", verifica en la **Consola de Firebase -> App Hosting -> Settings -> Environment Variables** que existan estos valores marcados con el candado de **Secret**:
- `STRIPE_SECRET_KEY`: Tu clave `sk_live_...`
- `STRIPE_WEBHOOK_SECRET`: Tu clave `whsec_...`
- `GOOGLE_GENAI_API_KEY`: Tu llave de Gemini para la IA.

## 🛠️ Herramientas Administrativas
- **Gestión de Inventario**: Accede a `/admin/products` para subir nuevos equipos.
- **Grupos Industriales**: Accede a `/admin/categories` para organizar el catálogo.
- **Control de Entregas**: En `/admin/deliveries` verás las ventas pagadas y registrarás la foto de evidencia.
- **Asistente IA**: Ubicado en `/assistant` para consultoría técnica automatizada.

## 📞 Soporte de Facturación y Logística
Leyenda oficial en el sistema: *Para solicitar factura o envío, favor de comunicarse por whatsapp al 427 276 1410*.

---
**Certificación:** Sistema configurado para Modo Real (Live) con Stripe y Gemini 1.5 Flash.
