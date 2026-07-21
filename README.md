# 🏗️ Tecnorampa Pro-Store: Manual de Operación Final

Este repositorio contiene el sistema oficial de venta de refacciones industriales para Tecnorampa S.A. de C.V.

## 🚀 Despliegue a Producción (Paso Final)

Como ya hiciste el `git push`, tu código ya está en la nube. Sigue estos pasos para prender la página:

1. **Entra a la Consola**: Ve a [Firebase App Hosting](https://console.firebase.google.com/project/_/apphosting).
2. **Crea un Backend**: Dale a "Comenzar" y selecciona tu repositorio: `supplychain-maker/Tecnorampa-pro-store`.
3. **Configura los Secretos (CRÍTICO)**: Durante el flujo de creación, Firebase te pedirá las variables de entorno. Debes crear estos "Secretos":
   - `STRIPE_SECRET_KEY`: Tu clave `sk_live_...`
   - `STRIPE_WEBHOOK_SECRET`: Tu clave `whsec_...`
   - `GOOGLE_GENAI_API_KEY`: Tu llave de Gemini para el Asistente IA (Obtenla en [AI Studio](https://aistudio.google.com/app/apikey)).
4. **URL de la Página**: Una vez que termine el despliegue (tarda unos 3-5 minutos), verás un enlace azul en el dashboard de App Hosting. 
   - El dominio suele ser algo como: `https://[id-de-tu-proyecto].web.app`.

## 🛠️ Solución a "Secret mal configurado"
Si ves un error rojo en App Hosting sobre `GOOGLE_GENAI_API_KEY`:
1. Ve a la configuración de tu Backend en App Hosting.
2. Ve a la pestaña **Settings** -> **Environment Variables**.
3. Asegúrate de que `GOOGLE_GENAI_API_KEY` esté agregada y guardada como un **Secret**.
4. Haz clic en el botón de los tres puntos y selecciona **"Grant Access"** si te lo solicita.
5. Crea un nuevo lanzamiento.

## 🛠️ Herramientas Administrativas
- **Gestión de Inventario**: Accede a `/admin/products` para subir nuevos equipos.
- **Control de Entregas**: En `/admin/deliveries` podrás ver las ventas pagadas y registrar la foto de evidencia al entregar.
- **Asistente IA**: Ubicado en `/assistant` para ayudar a clientes con dudas técnicas.

## 📞 Soporte de Facturación
Leyenda oficial incluida en el sistema: *Para solicitar factura, favor de comunicarse por whatsapp al 427 276 1410*.

---
**Estado del Sistema:** Producción / Live (Stripe Activado)