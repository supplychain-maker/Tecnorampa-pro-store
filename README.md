
# 🏗️ Tecnorampa Pro-Store: Manual de Operación

Este repositorio contiene el sistema oficial de venta de refacciones industriales para Tecnorampa S.A. de C.V.

## 🏁 Verificación de GitHub

Para saber si tu código está ligado a GitHub y si está al día, ejecuta estos comandos en la terminal:

1. **¿Tengo un repositorio conectado?**
   ```bash
   git remote -v
   ```
   *Si te aparece una URL de github.com, ¡ya tienes el repositorio ligado!*

2. **¿Qué fue lo último que subí?**
   ```bash
   git log -n 1
   ```
   *Esto te mostrará el mensaje del último "commit". Si dice "Final: Produccion oficial...", estás al día.*

3. **¿Hay cambios pendientes por subir?**
   ```bash
   git status
   ```
   *Si ves archivos en rojo o un mensaje que dice "Your branch is ahead of origin/main", significa que tienes cambios aquí que aún no están en GitHub.*

## 🚀 Despliegue a Producción (Gratis)

Si ya verificaste que tienes cambios pendientes, ejecuta la secuencia final:
```bash
git add .
git commit -m "Final: Sincronización completa de tienda industrial"
git push
```

### Pasos en Firebase Console:
1. Ve a [Firebase App Hosting](https://console.firebase.google.com/).
2. Conecta tu cuenta de GitHub y elige este repositorio.
3. Configura las variables de entorno (Secretos):
   - `STRIPE_SECRET_KEY`: Tu clave `sk_live_...`
   - `STRIPE_WEBHOOK_SECRET`: Tu clave `whsec_...`
   - `GOOGLE_GENAI_API_KEY`: Tu llave de Gemini.

## 🛠️ Soporte Técnico
El sistema cuenta con:
- **Modo Real (Live)**: Activado mediante variables de entorno.
- **Asistente IA**: Recomendaciones técnicas basadas en Gemini.
- **Gestión de Entregas**: Registro de evidencia fotográfica para administradores.

---
Desarrollado para Tecnorampa S.A. de C.V.
