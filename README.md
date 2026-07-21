
# 🏗️ Tecnorampa Pro-Store: Manual de Operación Final

Este repositorio contiene el sistema oficial de venta de refacciones industriales para Tecnorampa S.A. de C.V.

## 🚀 Despliegue a Producción (Paso Final)

Como ya hiciste el `git push`, tu código ya está en la nube. Sigue estos pasos para prender la página:

1. **Entra a la Consola**: Ve a [Firebase App Hosting](https://console.firebase.google.com/project/_/apphosting).
2. **Crea un Backend**: Dale a "Comenzar" y selecciona tu repositorio: `supplychain-maker/Tecnorampa-pro-store`.
3. **Configura los Secretos (CRÍTICO)**: Durante el flujo de creación, Firebase te pedirá las variables de entorno. Debes crear estos "Secretos":
   - `STRIPE_SECRET_KEY`: Tu clave `sk_live_...`
   - `STRIPE_WEBHOOK_SECRET`: Tu clave `whsec_...`
   - `GOOGLE_GENAI_API_KEY`: Tu llave de Gemini para el Asistente IA.
4. **URL de la Página**: Una vez que termine el despliegue (tarda unos 3-5 minutos), verás un enlace azul en el dashboard de App Hosting. 
   - El dominio suele ser algo como: `https://[id-de-tu-proyecto].web.app` o `https://[nombre-app].apphosting.app`.

## 🌐 Configuración del Dominio
Si quieres usar un dominio propio (ej. `tienda.tecnorampa.com.mx`):
1. En la pestaña **"App Hosting"**, ve a la sección de **"Settings"** o **"Domains"**.
2. Dale a **"Add Custom Domain"** y sigue las instrucciones para configurar los registros DNS.

## 🛠️ Herramientas Administrativas
- **Gestión de Inventario**: Accede a `/admin/products` para subir nuevos equipos.
- **Control de Entregas**: En `/admin/deliveries` podrás ver las ventas pagadas y registrar la foto de evidencia al entregar.
- **Asistente IA**: Ubicado en `/assistant` para ayudar a clientes con dudas técnicas.

## 📞 Soporte de Facturación
Leyenda oficial incluida en el sistema: *Para solicitar factura, favor de comunicarse por whatsapp al 427 276 1410*.

---
**Estado del Sistema:** Producción / Live (Stripe Activado)
