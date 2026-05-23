// ─────────────────────────────────────────────────────────────────────────────
// translationService.js
// Usa el endpoint informal de Google Translate (sin API key, gratuito).
// Fallback a MyMemory (también gratuito) si Google falla.
// ─────────────────────────────────────────────────────────────────────────────

export const LANGUAGES = {
  es: { name: 'Español',    flag: '🇪🇸', voice: 'es-ES' },
  en: { name: 'English',    flag: '🇬🇧', voice: 'en-US' },
  fr: { name: 'Français',   flag: '🇫🇷', voice: 'fr-FR' },
  pt: { name: 'Português',  flag: '🇧🇷', voice: 'pt-BR' },
  de: { name: 'Deutsch',    flag: '🇩🇪', voice: 'de-DE' },
  it: { name: 'Italiano',   flag: '🇮🇹', voice: 'it-IT' },
  ja: { name: '日本語',      flag: '🇯🇵', voice: 'ja-JP' },
  zh: { name: '中文',        flag: '🇨🇳', voice: 'zh-CN' },
  ko: { name: '한국어',      flag: '🇰🇷', voice: 'ko-KR' },
  ru: { name: 'Русский',    flag: '🇷🇺', voice: 'ru-RU' },
  ar: { name: 'العربية',    flag: '🇸🇦', voice: 'ar-SA' },
  hi: { name: 'हिन्दी',     flag: '🇮🇳', voice: 'hi-IN' },
}

// ── Google Translate (endpoint público, sin key) ──────────────────────────────
async function translateWithGoogle(text, sourceLang, targetLang) {
  const url =
    `https://translate.googleapis.com/translate_a/single` +
    `?client=gtx&sl=${sourceLang}&tl=${targetLang}` +
    `&dt=t&q=${encodeURIComponent(text)}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Google HTTP ${res.status}`)

  const data = await res.json()
  // data[0] = array of [translated_chunk, original_chunk, ...]
  const translated = data[0]
    .map(chunk => chunk[0])
    .filter(Boolean)
    .join('')

  if (!translated) throw new Error('Respuesta vacía de Google Translate')
  return translated
}

// ── MyMemory (fallback gratuito, 1000 peticiones/día sin key) ─────────────────
async function translateWithMyMemory(text, sourceLang, targetLang) {
  const langPair = `${sourceLang}|${targetLang}`
  const url =
    `https://api.mymemory.translated.net/get` +
    `?q=${encodeURIComponent(text)}&langpair=${langPair}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`MyMemory HTTP ${res.status}`)

  const data = await res.json()
  const result = data?.responseData?.translatedText
  if (!result || data.responseStatus !== 200)
    throw new Error(data.responseDetails || 'Error MyMemory')

  return result
}

// ── Función principal con fallback automático ─────────────────────────────────
export async function translateText(text, sourceLang, targetLang) {
  if (!text.trim()) return ''
  if (sourceLang === targetLang) return text

  // Intenta Google primero; si falla, usa MyMemory
  try {
    return await translateWithGoogle(text, sourceLang, targetLang)
  } catch (errGoogle) {
    console.warn('Google Translate falló, usando MyMemory:', errGoogle.message)
    try {
      return await translateWithMyMemory(text, sourceLang, targetLang)
    } catch (errMM) {
      throw new Error(`Traducción no disponible: ${errMM.message}`)
    }
  }
}
