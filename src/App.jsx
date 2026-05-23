import { useState, useRef, useCallback, useEffect } from 'react'
import LanguageSelector from './components/LanguageSelector.jsx'
import HistoryPanel from './components/HistoryPanel.jsx'
import { translateText, LANGUAGES } from './translationService.js'
import { getHistory, addToHistory, clearHistory } from './historyService.js'

export default function App() {
  const [sourceLang, setSourceLang] = useState('es')
  const [targetLang, setTargetLang] = useState('en')
  const [inputText, setInputText] = useState('')
  const [translation, setTranslation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState(getHistory)
  const [charCount, setCharCount] = useState(0)

  const recognitionRef = useRef(null)
  const translateTimerRef = useRef(null)
  const inputRef = useRef(null)
  const MAX_CHARS = 500

  // Auto-translate with debounce
  useEffect(() => {
    clearTimeout(translateTimerRef.current)
    setError(null)

    if (!inputText.trim()) {
      setTranslation('')
      return
    }

    translateTimerRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const result = await translateText(inputText.trim(), sourceLang, targetLang)
        setTranslation(result)
        const newHistory = addToHistory({
          original: inputText.trim(),
          translated: result,
          sourceLang,
          targetLang,
        })
        setHistory(newHistory)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }, 800)

    return () => clearTimeout(translateTimerRef.current)
  }, [inputText, sourceLang, targetLang])

  const handleSwapLanguages = useCallback(() => {
    setSourceLang(targetLang)
    setTargetLang(sourceLang)
    if (translation) {
      setInputText(translation)
      setTranslation(inputText)
    }
  }, [sourceLang, targetLang, inputText, translation])

  const handleInputChange = (e) => {
    const val = e.target.value
    if (val.length <= MAX_CHARS) {
      setInputText(val)
      setCharCount(val.length)
    }
  }

  const handleClearInput = () => {
    setInputText('')
    setTranslation('')
    setCharCount(0)
    setError(null)
    inputRef.current?.focus()
  }

  // Voice input (Speech Recognition)
  const handleVoiceInput = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Tu navegador no soporta reconocimiento de voz')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = LANGUAGES[sourceLang]?.voice || 'es-ES'
    recognition.interimResults = true
    recognition.continuous = false
    recognitionRef.current = recognition

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = (e) => {
      setIsListening(false)
      if (e.error !== 'no-speech') setError('Error de voz: ' + e.error)
    }
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript)
        .join('')
      if (transcript.length <= MAX_CHARS) {
        setInputText(transcript)
        setCharCount(transcript.length)
      }
    }

    recognition.start()
  }, [isListening, sourceLang])

  // Text-to-speech for translation
  const handleSpeak = useCallback(() => {
    if (!translation) return
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(translation)
    utterance.lang = LANGUAGES[targetLang]?.voice || 'en-US'
    utterance.rate = 0.9
    utterance.pitch = 1

    // Try to match a voice for the language
    const voices = window.speechSynthesis.getVoices()
    const match = voices.find(v => v.lang.startsWith(targetLang)) ||
                  voices.find(v => v.lang === utterance.lang)
    if (match) utterance.voice = match

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [translation, targetLang, isSpeaking])

  const handleCopyTranslation = useCallback(async () => {
    if (!translation) return
    try {
      await navigator.clipboard.writeText(translation)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('No se pudo copiar')
    }
  }, [translation])

  const handleSelectHistory = useCallback((item) => {
    setSourceLang(item.sourceLang)
    setTargetLang(item.targetLang)
    setInputText(item.original)
    setTranslation(item.translated)
    setCharCount(item.original.length)
  }, [])

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-primary)',
      maxWidth: '480px',
      margin: '0 auto',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow orbs */}
      <div style={{
        position: 'absolute',
        top: '-80px',
        left: '-60px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-60px',
        right: '-60px',
        width: '280px',
        height: '280px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <header style={{
        padding: '20px 20px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 10,
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '26px',
            fontWeight: 800,
            letterSpacing: '-1px',
            background: 'linear-gradient(135deg, #fff 30%, var(--accent-violet-light))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
          }}>
            LinguaAI
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Traducción inteligente
          </p>
        </div>

        <button
          onClick={() => setShowHistory(true)}
          style={{
            position: 'relative',
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            transition: 'all 0.2s',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {history.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: 'var(--accent-violet)',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: 'white',
            }}>
              {history.length}
            </span>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 20px 20px',
        gap: '12px',
        overflowY: 'auto',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Language Selector */}
        <LanguageSelector
          sourceLang={sourceLang}
          targetLang={targetLang}
          onSwap={handleSwapLanguages}
          onSourceChange={setSourceLang}
          onTargetChange={setTargetLang}
        />

        {/* Input Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: `1px solid ${inputText ? 'var(--border-active)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          transition: 'border-color 0.2s',
          position: 'relative',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '10px',
          }}>
            <span style={{ fontSize: '16px' }}>{LANGUAGES[sourceLang].flag}</span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {LANGUAGES[sourceLang].name}
            </span>
          </div>

          <textarea
            ref={inputRef}
            value={inputText}
            onChange={handleInputChange}
            placeholder="Escribe o dicta algo para traducir..."
            style={{
              width: '100%',
              minHeight: '110px',
              maxHeight: '160px',
              fontSize: '17px',
              lineHeight: 1.5,
              fontWeight: 400,
              color: inputText ? 'var(--text-primary)' : 'var(--text-muted)',
              overflowY: 'auto',
            }}
          />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '10px',
          }}>
            <span style={{ fontSize: '11px', color: charCount > MAX_CHARS * 0.8 ? '#f59e0b' : 'var(--text-muted)' }}>
              {charCount}/{MAX_CHARS}
            </span>

            <div style={{ display: 'flex', gap: '8px' }}>
              {/* Voice button */}
              <button
                onClick={handleVoiceInput}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: isListening
                    ? 'linear-gradient(135deg, #ef4444, #f97316)'
                    : 'var(--bg-glass)',
                  border: `1px solid ${isListening ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isListening ? 'white' : 'var(--text-secondary)',
                  animation: isListening ? 'pulse-glow 1.5s infinite' : 'none',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                title={isListening ? 'Detener' : 'Dictar'}
              >
                {isListening ? (
                  <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: '3px',
                        height: '14px',
                        background: 'white',
                        borderRadius: '2px',
                        animation: `wave 0.8s ease-in-out infinite`,
                        animationDelay: `${i * 0.15}s`,
                      }} />
                    ))}
                  </div>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                )}
              </button>

              {/* Clear button */}
              {inputText && (
                <button
                  onClick={handleClearInput}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Divider with arrow */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: isLoading
              ? 'linear-gradient(135deg, var(--accent-violet), var(--accent-cyan))'
              : 'var(--bg-glass)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {isLoading ? (
              <div style={{
                width: '14px',
                height: '14px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
              </svg>
            )}
          </div>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {/* Translation Result Card */}
        <div style={{
          background: translation
            ? 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.08))'
            : 'var(--bg-card)',
          border: `1px solid ${translation ? 'rgba(124,58,237,0.3)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          minHeight: '140px',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '10px',
          }}>
            <span style={{ fontSize: '16px' }}>{LANGUAGES[targetLang].flag}</span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {LANGUAGES[targetLang].name}
            </span>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}>
            {error ? (
              <p style={{ color: '#ef4444', fontSize: '14px', lineHeight: 1.5 }}>
                ⚠️ {error}
              </p>
            ) : isLoading && !translation ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                {[100, 75, 55].map((w, i) => (
                  <div key={i} style={{
                    height: '14px',
                    width: `${w}%`,
                    borderRadius: '7px',
                    background: 'linear-gradient(90deg, var(--border) 25%, var(--bg-glass-hover) 50%, var(--border) 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite',
                  }} />
                ))}
              </div>
            ) : translation ? (
              <p style={{
                fontSize: '18px',
                lineHeight: 1.5,
                fontWeight: 400,
                color: 'var(--text-primary)',
                animation: 'fadeIn 0.3s ease',
                userSelect: 'text',
                WebkitUserSelect: 'text',
              }}>
                {translation}
              </p>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', fontStyle: 'italic' }}>
                La traducción aparecerá aquí...
              </p>
            )}
          </div>

          {/* Action buttons */}
          {translation && !error && (
            <div style={{
              display: 'flex',
              gap: '8px',
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              animation: 'fadeIn 0.3s ease',
            }}>
              {/* Speak button */}
              <button
                onClick={handleSpeak}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  background: isSpeaking
                    ? 'linear-gradient(135deg, var(--accent-violet), var(--accent-cyan))'
                    : 'var(--bg-glass)',
                  border: `1px solid ${isSpeaking ? 'transparent' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  color: isSpeaking ? 'white' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  boxShadow: isSpeaking ? '0 4px 16px var(--accent-glow-v)' : 'none',
                }}
              >
                {isSpeaking ? (
                  <>
                    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                      {[0,1,2,3].map(i => (
                        <div key={i} style={{
                          width: '3px',
                          background: 'white',
                          borderRadius: '2px',
                          height: `${8 + i * 3}px`,
                          animation: `wave 0.6s ease-in-out infinite`,
                          animationDelay: `${i * 0.1}s`,
                        }} />
                      ))}
                    </div>
                    Detener
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                    Escuchar
                  </>
                )}
              </button>

              {/* Copy button */}
              <button
                onClick={handleCopyTranslation}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  background: copied ? 'rgba(16,185,129,0.15)' : 'var(--bg-glass)',
                  border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  color: copied ? '#10b981' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                {copied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Copiado
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copiar
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Quick tips */}
        {!inputText && (
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            animation: 'fadeIn 0.4s ease',
          }}>
            {['Hola, ¿cómo estás?', 'Gracias por todo', '¿Dónde está el aeropuerto?'].map((tip) => (
              <button
                key={tip}
                onClick={() => { setInputText(tip); setCharCount(tip.length) }}
                style={{
                  padding: '7px 12px',
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border)',
                  borderRadius: '20px',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-active)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                {tip}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Install prompt banner - shown if PWA installable */}
      <InstallBanner />

      {/* History Panel */}
      {showHistory && (
        <HistoryPanel
          history={history}
          onSelect={handleSelectHistory}
          onClear={() => setHistory(clearHistory())}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  )
}

function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!show) return null

  return (
    <div style={{
      margin: '0 20px 20px',
      padding: '14px 16px',
      background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.15))',
      border: '1px solid rgba(124,58,237,0.3)',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      animation: 'slideUp 0.3s ease',
      position: 'relative',
      zIndex: 10,
    }}>
      <div style={{ fontSize: '28px' }}>📲</div>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px' }}>
          Instalar LinguaAI
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>
          Agrega al inicio para acceso rápido
        </p>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={() => setShow(false)}
          style={{
            padding: '6px 10px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-muted)',
            fontSize: '12px',
          }}
        >
          No
        </button>
        <button
          onClick={async () => {
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            setShow(false)
          }}
          style={{
            padding: '6px 12px',
            background: 'linear-gradient(135deg, var(--accent-violet), var(--accent-cyan))',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          Instalar
        </button>
      </div>
    </div>
  )
}
