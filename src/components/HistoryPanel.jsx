import { LANGUAGES } from '../translationService.js'
import { formatTime } from '../historyService.js'

export default function HistoryPanel({ history, onSelect, onClear, onClose }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-primary)',
      animation: 'slideUp 0.25s cubic-bezier(0.16,1,0.3,1)',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Historial
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
            Últimas {history.length} traducciones
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {history.length > 0 && (
            <button
              onClick={onClear}
              style={{
                padding: '8px 14px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 'var(--radius-sm)',
                color: '#ef4444',
                fontSize: '13px',
                fontFamily: 'var(--font-body)',
              }}
            >
              Limpiar
            </button>
          )}
          <button
            onClick={onClose}
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {history.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: 'var(--text-muted)',
            paddingTop: '60px',
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px' }}>Sin traducciones aún</p>
            <p style={{ fontSize: '13px', textAlign: 'center' }}>Tus traducciones aparecerán aquí</p>
          </div>
        ) : (
          history.map((item, i) => (
            <button
              key={item.id}
              onClick={() => { onSelect(item); onClose() }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '14px 16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                animation: `fadeIn 0.2s ease ${i * 0.05}s both`,
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--border-active)'
                e.currentTarget.style.background = 'var(--bg-card-hover)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.background = 'var(--bg-card)'
              }}
            >
              {/* Languages row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px' }}>{LANGUAGES[item.sourceLang]?.flag}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                  {LANGUAGES[item.sourceLang]?.name}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
                <span style={{ fontSize: '14px' }}>{LANGUAGES[item.targetLang]?.flag}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                  {LANGUAGES[item.targetLang]?.name}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)' }}>
                  {formatTime(item.timestamp)}
                </span>
              </div>

              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.original}
              </p>
              <p style={{
                fontSize: '15px',
                fontWeight: 500,
                background: 'linear-gradient(90deg, var(--accent-violet-light), var(--accent-cyan-light))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {item.translated}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
