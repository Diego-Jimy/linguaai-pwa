import { useState } from 'react'
import { LANGUAGES } from '../translationService.js'

export default function LanguageSelector({ sourceLang, targetLang, onSwap, onSourceChange, onTargetChange }) {
  const [sourceOpen, setSourceOpen] = useState(false)
  const [targetOpen, setTargetOpen] = useState(false)

  const langs = Object.entries(LANGUAGES)

  const LangPicker = ({ value, onChange, isOpen, onToggle, side }) => (
    <div style={{ position: 'relative', flex: 1 }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          background: isOpen ? 'var(--bg-glass-hover)' : 'var(--bg-glass)',
          border: `1px solid ${isOpen ? 'var(--border-active)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-primary)',
          transition: 'all 0.2s',
          justifyContent: side === 'right' ? 'flex-end' : 'flex-start',
        }}
      >
        <span style={{ fontSize: '20px' }}>{LANGUAGES[value].flag}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '14px' }}>
          {LANGUAGES[value].name}
        </span>
        <svg style={{ marginLeft: 'auto', width: '14px', height: '14px', color: 'var(--text-secondary)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          [side === 'right' ? 'right' : 'left']: 0,
          width: '180px',
          background: '#1a1a28',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          zIndex: 100,
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.15s ease',
        }}>
          {langs.map(([code, lang]) => (
            <button
              key={code}
              onClick={() => { onChange(code); onToggle() }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                background: value === code ? 'rgba(124,58,237,0.15)' : 'transparent',
                color: value === code ? 'var(--accent-violet-light)' : 'var(--text-secondary)',
                fontSize: '14px',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.15s',
                borderBottom: '1px solid var(--border)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = value === code ? 'rgba(124,58,237,0.15)' : 'transparent'}
            >
              <span style={{ fontSize: '18px' }}>{lang.flag}</span>
              <span>{lang.name}</span>
              {value === code && <span style={{ marginLeft: 'auto', color: 'var(--accent-violet-light)' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <LangPicker
        value={sourceLang}
        onChange={onSourceChange}
        isOpen={sourceOpen}
        onToggle={() => { setSourceOpen(!sourceOpen); setTargetOpen(false) }}
        side="left"
      />

      <button
        onClick={onSwap}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-violet), var(--accent-cyan))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'transform 0.3s, box-shadow 0.3s',
          boxShadow: '0 4px 20px var(--accent-glow-v)',
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'rotate(180deg) scale(0.9)'}
        onMouseUp={e => e.currentTarget.style.transform = 'rotate(180deg) scale(1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        title="Intercambiar idiomas"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M7 16V4m0 0L3 8m4-4l4 4" />
          <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      </button>

      <LangPicker
        value={targetLang}
        onChange={onTargetChange}
        isOpen={targetOpen}
        onToggle={() => { setTargetOpen(!targetOpen); setSourceOpen(false) }}
        side="right"
      />
    </div>
  )
}
