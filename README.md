# DOGTOR PETS — Demo · Orquesta Supply

Demo funcional (datos ficticios). Posicionamiento: **capa de atención que se conecta con Vetmanger, no lo reemplaza** — el asistente captura y agenda; el expediente y la gestión siguen en Vetmanger.

- **index.html** (raíz) — chat Aura a pantalla completa (formato de los demos CETEC/solar).
- ~~asistente.html~~ — Asistente virtual probable: detecta urgencias, especies, precios y horarios; captura datos y agenda citas de verdad.
- **panel.html** — Panel de la clínica: resumen, pacientes (con envío de cartilla), calendario de citas y recordatorios de salud + reposición por consumo promedio.

Lo que se agenda en el asistente aparece en el panel (localStorage del navegador).
Para reiniciar el demo: link "Reiniciar demo" al pie del panel.

## IA real (asistente conectado)

El asistente llama a `/api/chat` (función serverless). En Vercel → Settings → **Environment Variables** agrega UNA de estas:

- `ANTHROPIC_API_KEY` → usa Claude (modelo por defecto `claude-haiku-4-5`)
- `OPENAI_API_KEY` → usa GPT (modelo por defecto `gpt-4o-mini`)
- Opcional: `AI_MODEL` para cambiar el modelo.

Redeploy después de agregar la variable. **Sin key configurada, el asistente cae automáticamente al motor guiado local** — el demo nunca se queda mudo.

## Deploy (GitHub → Vercel)

```bash
git init
git add .
git commit -m "Demo DOGTOR PETS"
git branch -M main
git remote add origin https://github.com/elviejofeo/dogtorpets-demo.git
git push -u origin main
```

Luego en Vercel: **Add New → Project → Import** `dogtorpets-demo` → Deploy (sin build, es estático).

## Personalización rápida

- Fotos de mascotas: campo `photo` en `data.js` (si la URL falla, cae al emoji).
- Colores: variables al inicio de `styles.css`.
- Pacientes, citas y consumos: `data.js`.
