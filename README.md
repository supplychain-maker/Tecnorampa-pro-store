
# 🏗️ Tecnorampa Pro-Store: Manual de Operación Final

Este repositorio contiene el sistema oficial de venta de refacciones industriales para Tecnorampa S.A. de C.V.

## 🚀 Despliegue a Producción (Paso Final)

Como ya hiciste el `git push`, tu código ya está listo. Sigue estos pasos para prender la página:

1. **Entra a la Consola**: Ve a [Firebase App Hosting](https://console.firebase.google.com/project/_/apphosting).
2. **Crea un Backend**: Dale a "Comenzar" y selecciona tu repositorio: `supplychain-maker/Tecnorampa-pro-store`.
3. **Configura los Secretos (CRÍTICO)**: Durante el flujo de creación, Firebase te pedirá las variables de entorno. Debes crear estos "Secretos":
   - `STRIPE_SECRET_KEY`: Tu clave `sk_live_...`
   - `STRIPE_WEBHOOK_SECRET`: Tu clave `whsec_...` (Obtenla en Stripe -> Developers -> Webhooks).
   - `GOOGLE_GENAI_API_KEY`: Tu llave de Gemini para el Asistente IA.
4. **URL del Webhook**: Una vez que Firebase te dé tu dominio (ej. `tecnorampa.web.app`), ve a Stripe y asegúrate de que el Webhook apunte a `https://tu-dominio.com/api/stripe/webhook`.

## 🛠️ Herramientas Administrativas
- **Gestión de Inventario**: Accede a `/admin/products` para subir nuevos equipos.
- **Control de Entregas**: En `/admin/deliveries` podrás ver las ventas pagadas y registrar la foto de evidencia al entregar.
- **Asistente IA**: Ubicado en `/assistant` para ayudar a clientes con dudas técnicas.

## 📞 Soporte de Facturación
Leyenda oficial incluida en el sistema: *Para solicitar factura, favor de comunicarse por whatsapp al 427 276 1410*.

---
**Estado del Sistema:** Producción / Live (Stripe Activado)
