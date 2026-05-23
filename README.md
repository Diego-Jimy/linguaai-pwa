# LinguaAI – Traductor Inteligente PWA

Aplicación móvil PWA de traducción en tiempo real. Funciona sin API key, es instalable desde Android/iOS y soporta entrada por voz y síntesis de audio.

---

## Stack

| Tecnología | Uso |
|---|---|
| React 18 + Vite | UI y empaquetado |
| vite-plugin-pwa | Service Worker + Manifest |
| Google Translate (endpoint público) | Traducción principal |
| MyMemory API | Fallback gratuito |
| Web Speech API | Reconocimiento de voz |
| SpeechSynthesis API | Lectura de traducciones |
| localStorage | Historial local |

---

## Instalación y uso

```bash
# 1. Instalar dependencias
npm install

# 2. Servidor de desarrollo
npm run dev

# 3. Build de producción
npm run build

# 4. Preview del build (simula producción)
npm run preview
```

### Probar en celular (red local)

```bash
npm run dev -- --host
```

Luego abre en el celular: `http://IP-DE-TU-PC:5173`

---

## Verificar instalación PWA en Android

1. Abre la app en **Chrome para Android**
2. Toca el menú ⋮ (tres puntos)
3. Selecciona **"Agregar a pantalla de inicio"**
4. Confirma → aparecerá el ícono en tu launcher

✅ Si ves ícono propio, splash screen y pantalla completa → PWA correctamente implementada.

> **Nota:** Para que el Service Worker funcione en producción, el sitio debe servirse por **HTTPS**. En desarrollo local funciona sin HTTPS.

---

## Funcionalidades

- 🌍 **12 idiomas**: ES, EN, FR, PT, DE, IT, JA, ZH, KO, RU, AR, HI
- 🔄 **Traducción automática** con debounce (800ms)
- 🎙️ **Entrada por voz** (Web Speech API)
- 🔊 **Leer traducción** (SpeechSynthesis)
- 📋 **Copiar al portapapeles**
- 🕐 **Historial** de las últimas 5 traducciones (localStorage)
- 📲 **Instalable** como app nativa (PWA)
- ⚡ **Sin API key** — usa Google Translate público + MyMemory como fallback

---

## Arquitectura de traducción

```
Usuario escribe / dicta
        ↓
  translateText()
        ↓
  Google Translate ──► OK → devuelve resultado
  (translate.googleapis.com)
        ↓ falla
  MyMemory API ────────► OK → devuelve resultado
  (api.mymemory.translated.net)
        ↓ falla
  Error mostrado en UI
```

---

## Estructura del proyecto

```
linguaai-pwa/
├── public/
│   └── icons/
│       ├── icon-192x192.png
│       └── icon-512x512.png
├── src/
│   ├── components/
│   │   ├── LanguageSelector.jsx
│   │   └── HistoryPanel.jsx
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── translationService.js   ← Google Translate + MyMemory
│   └── historyService.js       ← localStorage helpers
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## Despliegue recomendado

| Plataforma | Comando |
|---|---|
| **Netlify** | Arrastra la carpeta `/dist` a netlify.com/drop |
| **Vercel** | `npx vercel --prod` desde la raíz |
| **GitHub Pages** | Sube `/dist` a la rama `gh-pages` |

---

## Licencia

MIT — Libre para uso académico y personal.
