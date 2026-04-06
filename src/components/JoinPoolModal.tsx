// @ts-nocheck
'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function JoinPoolModal({ pool, userId, onClose, onSuccess }) {
  const [file, setFile]         = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError]       = useState('')
  const [preview, setPreview]   = useState(null)
  const [done, setDone]         = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (selected.size > 5 * 1024 * 1024) {
      setError('El archivo no puede pesar más de 5MB')
      return
    }
    setFile(selected)
    setError('')
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result)
    reader.readAsDataURL(selected)
  }

  const handleSubmit = async () => {
    if (!file) { setError('Selecciona tu comprobante de pago'); return }
    setUploading(true)
    setError('')
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${userId}-${pool.id}-${Date.now()}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('comprobantes').upload(fileName, file)
      if (uploadError) throw uploadError

      const { error: paymentError } = await supabase.from('payments').insert({
        user_id: userId, pool_id: pool.id,
        amount: pool.entry_fee, status: 'pending',
        receipt_url: uploadData.path,
      })
      if (paymentError) throw paymentError

      const { error: memberError } = await supabase.from('pool_members').upsert(
        { user_id: userId, pool_id: pool.id, payment_status: 'pending', points: 0 },
        { onConflict: 'user_id,pool_id' }
      )
      if (memberError) throw memberError

      setDone(true)
    } catch (err) {
      setError('Error: ' + (err.message || 'Intenta de nuevo'))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)',
        padding: '16px',               // margen en todos lados
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 440,
          background: '#111520',
          borderRadius: 20,
          border: '1px solid rgba(245,183,49,0.2)',
          // scroll interno si el contenido es largo
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
          padding: '24px 20px 28px',
        }}
      >

        {/* ── Pantalla de éxito ── */}
        {done ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>✅</div>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: '#00C46A', letterSpacing: '0.05em', marginBottom: 8 }}>
              ¡COMPROBANTE ENVIADO!
            </h2>
            <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Tu pago está en revisión.<br />Te avisamos en menos de 24 horas.
            </p>
            <button onClick={onSuccess} style={{ marginTop: 24, width: '100%', padding: 14, borderRadius: 12, background: 'linear-gradient(135deg,#F5B731,#e0a820)', color: '#000', fontFamily: 'Bebas Neue', fontSize: '1.1rem', letterSpacing: '0.1em', border: 'none', cursor: 'pointer' }}>
              ENTENDIDO
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '1.7rem', color: '#F5B731', letterSpacing: '0.05em', lineHeight: 1 }}>
                  ÚNETE A LA QUINIELA
                </h2>
                <p style={{ color: '#666', fontSize: '0.82rem', marginTop: 4 }}>{pool.name}</p>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', fontSize: '1.6rem', cursor: 'pointer', lineHeight: 1, padding: '0 4px', flexShrink: 0 }}>×</button>
            </div>

            {/* Instrucciones de pago */}
            <div style={{ background: 'rgba(245,183,49,0.07)', border: '1px solid rgba(245,183,49,0.25)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <p style={{ color: '#F5B731', fontWeight: 700, fontSize: '0.82rem', marginBottom: 10, letterSpacing: '0.05em' }}>
                💳 INSTRUCCIONES DE PAGO
              </p>
              <p style={{ color: '#ccc', fontSize: '0.85rem', lineHeight: 1.8 }}>
                Monto: <strong style={{ color: '#fff' }}>${pool.entry_fee} MXN</strong><br />
                Transferencia SPEI / CoDi:<br />
                <strong style={{ color: '#F5B731', fontSize: '1rem' }}>CLABE: 0000 0000 0000 0000 00</strong><br />
                <span style={{ color: '#666', fontSize: '0.78rem' }}>⚠️ Actualiza tu CLABE real antes de lanzar</span><br />
                Concepto: <strong style={{ color: '#fff' }}>Atínale + tu nombre</strong>
              </p>
            </div>

            {/* Subir comprobante */}
            <p style={{ color: '#ccc', fontSize: '0.83rem', fontWeight: 600, marginBottom: 10 }}>
              📎 Sube tu comprobante de pago:
            </p>

            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              minHeight: 100, borderRadius: 14, cursor: 'pointer',
              border: `2px dashed ${preview ? '#00C46A' : 'rgba(245,183,49,0.35)'}`,
              background: preview ? 'rgba(0,196,106,0.05)' : 'rgba(255,255,255,0.02)',
              transition: 'all 0.2s', overflow: 'hidden',
            }}>
              {preview ? (
                <img src={preview} alt="Comprobante" style={{ maxHeight: 140, borderRadius: 10, objectFit: 'contain', padding: 8 }} />
              ) : (
                <div style={{ textAlign: 'center', padding: 16 }}>
                  <p style={{ fontSize: '2rem', marginBottom: 6 }}>📷</p>
                  <p style={{ color: '#777', fontSize: '0.82rem' }}>Toca para seleccionar imagen</p>
                  <p style={{ color: '#444', fontSize: '0.75rem', marginTop: 4 }}>JPG, PNG o PDF — máx. 5MB</p>
                </div>
              )}
              <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>

            {preview && (
              <p style={{ color: '#00C46A', fontSize: '0.78rem', marginTop: 6, textAlign: 'center' }}>✓ {file?.name}</p>
            )}
            {error && (
              <p style={{ color: '#ff4d4d', fontSize: '0.8rem', marginTop: 8, textAlign: 'center' }}>⚠️ {error}</p>
            )}

            {/* Botón — siempre visible */}
            <button
              onClick={handleSubmit}
              disabled={uploading || !file}
              style={{
                width: '100%', marginTop: 16, padding: 15,
                borderRadius: 14, border: 'none',
                fontFamily: 'Bebas Neue', fontSize: '1.15rem', letterSpacing: '0.1em',
                cursor: uploading || !file ? 'not-allowed' : 'pointer',
                background: uploading || !file ? '#1e2230' : 'linear-gradient(135deg,#F5B731,#e0a820)',
                color: uploading || !file ? '#444' : '#000',
                transition: 'all 0.2s',
              }}
            >
              {uploading ? 'SUBIENDO COMPROBANTE...' : 'ENVIAR COMPROBANTE'}
            </button>

            <p style={{ color: '#444', fontSize: '0.74rem', textAlign: 'center', marginTop: 10 }}>
              Tu pago se valida en menos de 24 hrs · Te avisamos por WhatsApp
            </p>
          </>
        )}
      </div>
    </div>
  )
}