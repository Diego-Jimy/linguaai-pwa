const HISTORY_KEY = 'linguaai_history'
const MAX_ITEMS = 5

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

export function addToHistory(item) {
  const history = getHistory()
  const entry = {
    id: Date.now(),
    ...item,
    timestamp: new Date().toISOString()
  }
  const updated = [entry, ...history.filter(h => h.original !== item.original || h.targetLang !== item.targetLang)].slice(0, MAX_ITEMS)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  return updated
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY)
  return []
}

export function formatTime(iso) {
  const date = new Date(iso)
  const now = new Date()
  const diff = (now - date) / 1000
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
  return date.toLocaleDateString('es', { day: 'numeric', month: 'short' })
}
