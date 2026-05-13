// @ts-nocheck
'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const WA_LINK = 'https://wa.me/523315445450'

function getCompTheme(comp) {
  switch (comp) {
    case 'FIFA_2026': return { accent: '#00C46A', accentBg: 'rgba(0,196,106,0.10)', accentBorder: 'rgba(0,196,106,0.25)', leftBorder: '#00C46A', icon: '🌍', label: 'Mundial FIFA 2026' }
    case 'LIGA_MX':   return { accent: '#E8192C', accentBg: 'rgba(232,25,44,0.10)', accentBorder: 'rgba(232,25,44,0.25)', leftBorder: '#E8192C', icon: '🦅', label: 'Liga MX' }
    default:          return { accent: '#F5B731', accentBg: 'rgba(245,183,49,0.10)', accentBorder: 'rgba(245,183,49,0.25)', leftBorder: '#F5B731', icon: '🏆', label: 'Quiniela' }
  }
}

export default function PagarPage() {
  const { id } = useParams()
  const router = useRouter()
  const [pool, setPool] = useState(null)
  const [user, setUser] = useState(null)
  const [membership, setMembership] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState('')
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      setUser(user)
      const { data: pool } = await supabase.from('pools').select('*').eq('id', id).single()
      setPool(pool)
      const { data: membership } = await supabase.from('pool_members').select('*').eq('pool_id', id).eq('user_id', user.id).single()
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
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('comprobantes').upload(path, file)
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('comprobantes').getPublicUrl(path)
      const publicUrl = urlData.publicUrl
      const { error: payError } = await supabase.from('payments').insert({ pool_id: id, user_id: user.id, amount: pool.entry_fee, proof_url: publicUrl, status: 'pending' })
      if (payError) throw payError
      const { data: existing } = await supabase.from('pool_members').select('id').eq('pool_id', id).eq('user_id', user.id).single()
      if (existing) {
        await supabase.from('pool_members').update({ payment_status: 'pending', payment_proof_url: publicUrl }).eq('id', existing.id)
      } else {
        await supabase.from('pool_members').insert({ pool_id: id, user_id: user.id, payment_status: 'pending', payment_proof_url: publicUrl, points: 0 })
      }
      setSubmitted(true)
    } catch (err) {
      setError('Error al subir comprobante. Intenta de nuevo.')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  if (!pool) {
    return (
      <div style={{ minHeight: '100vh', background: '#080C16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
        <div style={{ width: 36, height: 36, border: '3px solid rgba(245,183,49,0.3)', borderTopColor: '#F5B731', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  const theme = getCompTheme(pool.competition)

  if (membership?.payment_status === 'approved') {
    return (
      <div style={{ minHeight: '100vh', background: '#080C16', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 3, color: '#00C46A', marginBottom: 8 }}>¡YA ESTÁS DENTRO!</div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>Tu pago fue aprobado. Ya puedes predecir.</p>
          <button onClick={() => router.push('/predecir')} style={{ width: '100%', padding: 15, borderRadius: 14, background: 'linear-gradient(135deg,#F5B731,#C9930A)', color: '#080C16', fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Ir a predecir →
          </button>
        </div>
      </div>
    )
  }

  if (submitted || membership?.payment_status === 'pending') {
    return (
      <div style={{ minHeight: '100vh', background: '#080C16', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⏳</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 3, color: '#F5B731', marginBottom: 8 }}>COMPROBANTE RECIBIDO</div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
            Estamos revisando tu pago.<br />Te avisamos cuando se apruebe.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href={WA_LINK} target="_blank" rel="noreferrer" style={{ display: 'block', background: '#25D366', color: '#fff', borderRadius: 14, padding: '14px 24px', fontSize: 15, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
              Escribir al WhatsApp
            </a>
            <button onClick={() => router.push('/dashboard')} style={{ width: '100%', padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              Ir al dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080C16', fontFamily: "'Outfit', sans-serif", color: '#F0F2F8' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .copy-btn:hover { opacity: 0.85; }
        .upload-area:hover { border-color: rgba(245,183,49,0.5) !important; background: rgba(245,183,49,0.04) !important; }
      `}</style>

      <div style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px 12px', background: 'rgba(8,12,22,0.96)', backdropFilter: 'blur(20px)', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
        <button onClick={() => router.back()} style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', cursor: 'pointer' }}>←</button>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3, background: 'linear-gradient(90deg,#C9930A,#F5B731)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ÚNETE A LA QUINIELA</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{pool.name}</div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 16px 80px', animation: 'fadeUp 0.3s ease both' }}>

        <div style={{ background: '#111520', borderRadius: 14, border: `0.5px solid ${theme.accentBorder}`, borderLeft: `3px solid ${theme.leftBorder}`, padding: '14px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: theme.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{theme.icon}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{pool.name}</div>
              <div style={{ fontSize: 10, color: theme.accent, fontWeight: 700, letterSpacing: 1, marginTop: 2 }}>{theme.label.toUpperCase()}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>Entrada</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#F5B731', lineHeight: 1 }}>${pool.entry_fee}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>MXN</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(245,183,49,0.15)', border: '0.5px solid rgba(245,183,49,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#F5B731', fontWeight: 700, flexShrink: 0 }}>1</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 2 }}>Transfiere a esta cuenta</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {[
            { label: 'CLABE', value: '722969020127909548' },
            { label: 'Beneficiario', value: 'Ivie Eduardo Muñoz Garcia' },
            { label: 'Institución', value: 'Mercado Pago' },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: '#111520', borderRadius: 12, border: '0.5px solid rgba(255,255,255,0.07)', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#F0F2F8', wordBreak: 'break-all' }}>{value}</div>
              </div>
              <button className="copy-btn" onClick={() => copy(value, label)} style={{ flexShrink: 0, background: copied === label ? 'rgba(0,196,106,0.15)' : 'rgba(245,183,49,0.12)', border: `0.5px solid ${copied === label ? 'rgba(0,196,106,0.4)' : 'rgba(245,183,49,0.3)'}`, borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, color: copied === label ? '#00C46A' : '#F5B731', cursor: 'pointer' }}>
                {copied === label ? '✓' : 'Copiar'}
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(245,183,49,0.15)', border: '0.5px solid rgba(245,183,49,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#F5B731', fontWeight: 700, flexShrink: 0 }}>2</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 2 }}>Sube tu comprobante</div>
        </div>

        <label htmlFor="comprobante" className="upload-area" style={{ display: 'block', background: '#111520', borderRadius: 14, border: '1.5px dashed rgba(245,183,49,0.25)', padding: '28px 20px', textAlign: 'center', cursor: 'pointer', marginBottom: 14, transition: 'all 0.2s' }}>
          <input id="comprobante" type="file" accept="image/*,.pdf" ref={fileRef} onChange={(e) => setFileName(e.target.files?.[0]?.name || '')} style={{ display: 'none' }} />
          <div style={{ fontSize: 28, marginBottom: 8 }}>📎</div>
          <div style={{ fontSize: 14, color: fileName ? '#F5B731' : 'rgba(255,255,255,0.5)', fontWeight: fileName ? 600 : 400 }}>
            {fileName || 'Toca para seleccionar foto o PDF'}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>JPG, PNG o PDF</div>
        </label>

        {error && <p style={{ color: '#FF4D6D', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</p>}

        <button onClick={handleSubmit} disabled={uploading} style={{ width: '100%', padding: 15, borderRadius: 14, background: uploading ? 'rgba(245,183,49,0.4)' : 'linear-gradient(135deg,#F5B731,#C9930A)', color: '#080C16', fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, border: 'none', cursor: uploading ? 'not-allowed' : 'pointer', marginBottom: 16 }}>
          {uploading ? 'Subiendo...' : 'Enviar comprobante →'}
        </button>

        <div style={{ background: 'rgba(37,211,102,0.06)', border: '0.5px solid rgba(37,211,102,0.2)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>¿Prefieres mandarlo por WhatsApp?</div>
          <a href={WA_LINK} target="_blank" rel="noreferrer" style={{ flexShrink: 0, background: '#25D366', color: '#fff', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
            WhatsApp
          </a>
        </div>

      </div>
    </div>
  )
}