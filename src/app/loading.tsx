// @ts-nocheck
'use client'

export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#080C16',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 20,
    }}>
      <style>{`
        @keyframes spin-cw  { to { transform: rotate(360deg) } }
        @keyframes spin-ccw { to { transform: rotate(-360deg) } }
        @keyframes fade-in  { from { opacity: 0 } to { opacity: 1 } }
        .ring1 { animation: spin-cw  3s linear infinite; transform-origin: center; }
        .ring2 { animation: spin-ccw 2s linear infinite; transform-origin: center; }
        .ring3 { animation: spin-cw  1.4s linear infinite; transform-origin: center; }
        .ring4 { animation: spin-ccw 1s linear infinite; transform-origin: center; }
        .label { animation: fade-in 0.8s ease 0.4s both; }
      `}</style>

      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Líneas de mira */}
        <line x1="40" y1="4"  x2="40" y2="16" stroke="rgba(245,183,49,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="40" y1="64" x2="40" y2="76" stroke="rgba(245,183,49,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="4"  y1="40" x2="16" y2="40" stroke="rgba(245,183,49,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="64" y1="40" x2="76" y2="40" stroke="rgba(245,183,49,0.4)" strokeWidth="1.5" strokeLinecap="round"/>

        {/* Anillo 4 — más externo, lento */}
        <circle className="ring1" cx="40" cy="40" r="34"
          stroke="rgba(245,183,49,0.15)" strokeWidth="1"
          strokeDasharray="20 8" fill="none"/>

        {/* Anillo 3 */}
        <circle className="ring2" cx="40" cy="40" r="26"
          stroke="rgba(245,183,49,0.25)" strokeWidth="1.2"
          strokeDasharray="14 6" fill="none"/>

        {/* Anillo 2 */}
        <circle className="ring3" cx="40" cy="40" r="18"
          stroke="rgba(245,183,49,0.45)" strokeWidth="1.5"
          strokeDasharray="10 5" fill="none"/>

        {/* Anillo 1 — más interno, rápido */}
        <circle className="ring4" cx="40" cy="40" r="10"
          stroke="#F5B731" strokeWidth="2"
          strokeDasharray="6 4" fill="none"/>

        {/* Centro */}
        <circle cx="40" cy="40" r="3" fill="#F5B731"/>
      </svg>

      <p className="label" style={{
        fontSize: 13,
        color: '#444',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        fontWeight: 500,
      }}>
        Cargando...
      </p>
    </div>
  )
}