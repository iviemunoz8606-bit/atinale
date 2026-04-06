// @ts-nocheck
'use client'

import { useState } from 'react'

export default function JoinPoolModal({ pool, userId, userEmail, userName, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handlePagar = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/mp/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          poolId:    pool.id,
          poolName:  pool.name,
          entryFee:  pool.entry_fee,
          userEmail,
          userName,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Error al crear el pago')

      // Redirigir a Mercado Pago Checkout Pro
      window.location.href = data.url
    } catch (err) {
      setError(err.message || 'Error al conectar con Mercado Pago')
      setLoading(false)
    }
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)',
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 440,
          background: '#111520', borderRadius: 20,
          border: '1px solid rgba(245,183,49,0.2)',
          padding: '28px 24px 32px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: '#F5B731', letterSpacing: '0.05em', lineHeight: 1 }}>
              ÚNETE A LA QUINIELA
            </h2>
            <p style={{ color: '#666', fontSize: '0.82rem', marginTop: 4 }}>{pool.name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', fontSize: '1.6rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {/* Resumen del pago */}
        <div style={{ background: 'rgba(245,183,49,0.07)', border: '1px solid rgba(245,183,49,0.2)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ color: '#888', fontSize: '0.85rem' }}>Inscripción</span>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: '1.6rem', color: '#F5B731' }}>${pool.entry_fee} MXN</span>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 16 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666' }}>
            <span>Premio neto estimado</span>
            <span style={{ color: '#00C46A' }}>${Math.round(pool.entry_fee * 0.9 * (pool.current_participants + 1))} MXN</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666', marginTop: 6 }}>
            <span>Comisión plataforma</span>
            <span>10% visible siempre</span>
          </div>
        </div>

        {/* Métodos de pago aceptados */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {['💳 Tarjeta', '🏦 SPEI', '🏪 OXXO', '📱 CoDi'].map(m => (
            <span key={m} style={{ padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', fontSize: '0.75rem' }}>
              {m}
            </span>
          ))}
        </div>

        {error && (
          <p style={{ color: '#ff4d4d', fontSize: '0.82rem', marginBottom: 12, textAlign: 'center' }}>
            ⚠️ {error}
          </p>
        )}

        {/* Botón pagar */}
        <button
          onClick={handlePagar}
          disabled={loading}
          style={{
            width: '100%', padding: '16px', borderRadius: 14, border: 'none',
            fontFamily: 'Bebas Neue', fontSize: '1.2rem', letterSpacing: '0.1em',
            cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? '#1e2230' : 'linear-gradient(135deg,#F5B731,#e0a820)',
            color: loading ? '#444' : '#000',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {loading ? (
            <>
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #444', borderTopColor: '#888', animation: 'spin 0.8s linear infinite' }} />
              CONECTANDO...
            </>
          ) : (
            'PAGAR CON MERCADO PAGO →'
          )}
        </button>

        <p style={{ color: '#444', fontSize: '0.74rem', textAlign: 'center', marginTop: 12 }}>
          Pago 100% seguro · Powered by Mercado Pago
        </p>

        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )
}