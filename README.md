
# Tecnorampa Pro-Store 🚀

Sistema industrial de refacciones con inteligencia artificial y pagos seguros.

## Guía de Despliegue Rápido (Gratis)

1. **GitHub**: Crea un repositorio vacío en GitHub y sube tu código:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git add .
   git commit -m "Deploy: Version oficial"
   git push -u origin main
   ```

2. **Consola de Firebase**:
   - Ve a [Firebase Console](https://console.firebase.google.com/).
   - Entra en tu proyecto y busca **App Hosting** en el menú lateral.
   - Haz clic en **"Comenzar"** y conecta tu repositorio de GitHub.

3. **Configuración de Secretos**:
   Durante el flujo de creación, asegúrate de añadir estos "Secretos":
   - `STRIPE_SECRET_KEY`: Tu llave `sk_live_...`
   - `STRIPE_WEBHOOK_SECRET`: Tu secreto `whsec_...`
   - `GOOGLE_GENAI_API_KEY`: Tu llave de Gemini para el asistente.

4. **Dominio**:
   Firebase te asignará una URL automática como `https://tecnorampa-xxx.web.app`. ¡Esa es tu página real!

---
Desarrollado para Tecnorampa S.A. de C.V.
