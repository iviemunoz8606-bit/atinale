// @ts-nocheck
'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function UnirsePage() {
  const { id } = useParams()
  const router = useRouter()

  const [pool, setPool] = useState(null)
  const [user, setUser] = useState(null)
  const [membership, setMembership] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      setUser(user)

      const { data: pool } = await supabase
        .from('pools')
        .select('*')
        .eq('id', id)
        .single()
      setPool(pool)

      const { data: membership } = await supabase
        .from('pool_members')
        .select('*')
        .eq('pool_id', id)
        .eq('user_id', user.id)
        .single()
      setMembership(membership)
    }
    load()
  }, [id])

  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const file = fileRef.current?.files?.[0]
    if (!file) { setError('Selecciona tu comprobante'); return }

    setUploading(true)
    try {
      // 1. Subir archivo a Storage
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('comprobantes')
        .upload(path, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('comprobantes')
        .getPublicUrl(path)

      // 2. Insertar en payments
      const { error: payError } = await supabase
        .from('payments')
        .insert({
          pool_id: id,
          user_id: user.id,
          amount: pool.entry_fee,
          proof_url: publicUrl,
          status: 'pending'
        })
      if (payError) throw payError

      // 3. Upsert en pool_members
      const { data: existing } = await supabase
        .from('pool_members')
        .select('id')
        .eq('pool_id', id)
        .eq('user_id', user.id)
        .single()

      if (existing) {
        await supabase
          .from('pool_members')
          .update({ payment_status: 'pending', payment_proof_url: publicUrl })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('pool_members')
          .insert({
            pool_id: id,
            user_id: user.id,
            payment_status: 'pending',
            payment_proof_url: publicUrl,
            points: 0
          })
      }

      setSubmitted(true)
    } catch (err) {
      setError('Hubo un error al subir tu comprobante. Intenta de nuevo.')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  if (!pool) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #FFD700', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  // Ya pagó y fue aprobado
  if (membership?.payment_status === 'paid') return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
        <h2 style={styles.title}>¡Ya estás dentro!</h2>
        <p style={styles.sub}>Tu pago fue aprobado. Ya puedes hacer tus predicciones.</p>
        <button onClick={() => router.push(`/quiniela/${id}`)} style={styles.btnPrimary}>
          Ir a predecir →
        </button>
      </div>
    </div>
  )

  // Ya subió comprobante, esperando aprobación
  if (submitted || membership?.payment_status === 'pending') return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⏳</div>
        <h2 style={styles.title}>Comprobante recibido</h2>
        <p style={styles.sub}>Estamos revisando tu pago. En cuanto se apruebe te avisamos y podrás predecir.</p>
        <p style={{ color: '#888', fontSize: 13, marginTop: 8 }}>¿Tienes dudas? Escríbenos al WhatsApp</p>
        
          href={`https://wa.me/523315445450?text=Hola, subí mi comprobante para la quiniela "${pool.name}" y estoy esperando aprobación`}
          target="_blank"
          rel="noreferrer"
          style={styles.btnWhatsapp}
        <a>
          📲 Escribir al WhatsApp
        </a>
      </div>
    </div>
  )

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        .dato-row:hover { background: #1a1a1a !important; }
        .copy-btn:hover { background: #FFD700 !important; color: #000 !important; }
        .upload-area:hover { border-color: #FFD700 !important; background: #1a1a1a !important; }
      `}</style>

      <div style={styles.card}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28, animation: 'fadeUp 0.5s ease' }}>
          <div style={{ fontSize: 13, color: '#FFD700', fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>
            PASO 1 DE 2
          </div>
          <h1 style={styles.title}>Únete a la quiniela</h1>
          <p style={styles.poolName}>{pool.name}</p>
        </div>

        {/* Monto */}
        <div style={styles.montoBox}>
          <span style={{ color: '#888', fontSize: 13 }}>Costo de entrada</span>
          <span style={{ color: '#FFD700', fontSize: 28, fontWeight: 800 }}>
            ${pool.entry_fee?.toLocaleString('es-MX')} MXN
          </span>
        </div>

        {/* Datos bancarios */}
        <div style={{ marginBottom: 24, animation: 'fadeUp 0.5s ease 0.1s both' }}>
          <p style={styles.sectionLabel}>📤 Transfiere a esta cuenta</p>

          {[
            { label: 'CLABE', value: '722969020127909548' },
            { label: 'Beneficiario', value: 'Ivie Eduardo Muñoz Garcia' },
            { label: 'Institución', value: 'Mercado Pago' },
          ].map(({ label, value }) => (
            <div key={label} className="dato-row" style={styles.datoRow}>
              <div>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 15, color: '#fff', fontWeight: 600 }}>{value}</div>
              </div>
              <button
                className="copy-btn"
                onClick={() => copy(value, label)}
                style={styles.copyBtn}
              >
                {copied === label ? '✓' : 'Copiar'}
              </button>
            </div>
          ))}
        </div>

        {/* Separador */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: '#222' }} />
          <span style={{ color: '#555', fontSize: 12 }}>PASO 2 DE 2</span>
          <div style={{ flex: 1, height: 1, background: '#222' }} />
        </div>

        {/* Upload */}
        <form onSubmit={handleSubmit} style={{ animation: 'fadeUp 0.5s ease 0.2s both' }}>
          <p style={styles.sectionLabel}>📎 Sube tu comprobante</p>

          <label
            className="upload-area"
            style={styles.uploadArea}
            htmlFor="comprobante"
          >
            <input
              id="comprobante"
              type="file"
              accept="image/*,.pdf"
              ref={fileRef}
              onChange={() => {}}
              style={{ display: 'none' }}
            />
            <div style={{ fontSize: 32, marginBottom: 8 }}>🧾</div>
            <div style={{ color: '#ccc', fontSize: 14 }}>
              {fileRef.current?.files?.[0]?.name || 'Toca para seleccionar foto o PDF'}
            </div>
            <div style={{ color: '#555', fontSize: 12, marginTop: 4 }}>JPG, PNG o PDF</div>
          </label>

          {error && (
            <p style={{ color: '#ff4444', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={uploading}
            style={{ ...styles.btnPrimary, width: '100%', opacity: uploading ? 0.7 : 1 }}
          >
            {uploading
              ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  Subiendo...
                </span>
              : 'Enviar comprobante ✓'
            }
          </button>
        </form>

        {/* WhatsApp respaldo */}
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #1a1a1a', textAlign: 'center' }}>
          <p style={{ color: '#555', fontSize: 12, marginBottom: 10 }}>
            ¿Prefieres mandarlo por WhatsApp?
          </p>
          
            href={`https://wa.me/523315445450?text=Hola, quiero unirme a la quiniela "${pool.name}". Te mando mi comprobante de $${pool.entry_fee} MXN`}
            target="_blank"
            style={styles.btnWhatsapp}
          <a>
            📲 Mandar al WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0a',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '24px 16px 80px',
  },
  card: {
    width: '100%',
    maxWidth: 480,
    marginTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    color: '#fff',
    margin: '0 0 4px',
  },
  poolName: {
    color: '#FFD700',
    fontSize: 15,
    fontWeight: 600,
    margin: 0,
  },
  sub: {
    color: '#888',
    fontSize: 14,
    margin: '8px 0 20px',
    lineHeight: 1.5,
  },
  montoBox: {
    background: '#111',
    border: '1px solid #222',
    borderRadius: 12,
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionLabel: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  datoRow: {
    background: '#111',
    border: '1px solid #1e1e1e',
    borderRadius: 10,
    padding: '12px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    transition: 'background 0.15s',
    cursor: 'default',
  },
  copyBtn: {
    background: '#1e1e1e',
    color: '#FFD700',
    border: 'none',
    borderRadius: 6,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  uploadArea: {
    display: 'block',
    border: '2px dashed #333',
    borderRadius: 12,
    padding: '28px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    marginBottom: 16,
    transition: 'all 0.2s',
    background: '#111',
  },
  btnPrimary: {
    background: '#FFD700',
    color: '#000',
    border: 'none',
    borderRadius: 12,
    padding: '14px 24px',
    fontSize: 15,
    fontWeight: 800,
    cursor: 'pointer',
    display: 'block',
    textAlign: 'center',
    textDecoration: 'none',
  },
  btnWhatsapp: {
    display: 'inline-block',
    background: '#25D366',
    color: '#fff',
    borderRadius: 10,
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 700,
    textDecoration: 'none',
  },
}