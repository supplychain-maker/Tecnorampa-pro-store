# 🏗️ Tecnorampa Pro-Store: Manual de Operación Final

Este repositorio contiene el sistema oficial de venta de refacciones industriales para Tecnorampa S.A. de C.V.

## 🚀 Estado del Dominio de Producción
Tu tienda ya está en vivo en el dominio:
`https://tecnorampa-tienda--studio-1924852802-ce47d.us-east4.hosted.app`

**Nota Importante:** Este dominio es **permanente**. Funciona 24/7 de forma independiente al editor (Studio). Es el enlace oficial para tus clientes.

## 🛠️ Configuración de Secretos (Mantenimiento)
Si el sistema llegara a mostrar errores de "Secret missing", verifica en la **Consola de Firebase -> App Hosting -> Settings** que existan estas variables marcadas como **Secret**:
- `STRIPE_SECRET_KEY`: Tu clave `sk_live_...`
- `STRIPE_WEBHOOK_SECRET`: Tu clave `whsec_...`
- `GOOGLE_GENAI_API_KEY`: Tu llave de Gemini.

## 🛠️ Herramientas Administrativas
- **Gestión de Inventario**: Accede a `/admin/products` para subir nuevos equipos.
- **Grupos Industriales**: Accede a `/admin/categories` para organizar el catálogo.
- **Control de Entregas**: En `/admin/deliveries` verás las ventas pagadas y registrarás la foto de evidencia.
- **Asistente IA**: Ubicado en `/assistant` para consultoría técnica automatizada.

## 📞 Soporte de Facturación
Leyenda oficial en el sistema: *Para solicitar factura, favor de comunicarse por whatsapp al 427 276 1410*.

---
**Certificación:** Sistema configurado para Modo Real (Live) con Stripe y Gemini 1.5 Flash.
