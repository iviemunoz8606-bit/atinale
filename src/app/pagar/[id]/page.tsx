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
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
        <div style={{ width: 32, height: 32, border: '3px solid #FFD700', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (membership?.payment_status === 'paid') {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>{'✅'}</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{'¡Ya estas dentro!'}</h2>
          <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>{'Tu pago fue aprobado. Ya puedes predecir.'}</p>
          <button onClick={() => router.push('/quiniela/' + id)} style={{ background: '#FFD700', color: '#000', border: 'none', borderRadius: 12, padding: '14px 24px', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
            {'Ir a predecir'}
          </button>
        </div>
      </div>
    )
  }

  if (submitted || membership?.payment_status === 'pending') {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>{'⏳'}</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{'Comprobante recibido'}</h2>
          <p style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>{'Estamos revisando tu pago. Te avisamos cuando se apruebe.'}</p>
          <a href={WA_LINK} target="_blank" rel="noreferrer" style={{ display: 'inline-block', background: '#25D366', color: '#fff', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
            {'Escribir al WhatsApp'}
          </a>
        </div>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 20 }}>{'Estamos revisando tu pago. Te avisamos cuando se apruebe.'}</p>
        <a href={WA_LINK} target="_blank" rel="noreferrer" style={{ display: 'inline-block', background: '#25D366', color: '#fff', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
          {'Escribir al WhatsApp'}
        </a>
        <br /><br />
        <a href="/dashboard" style={{ display: 'inline-block', background: '#1a1a1a', color: '#FFD700', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 700, textDecoration: 'none', border: '1px solid #333' }}>
          {'Ir al dashboard'}
        </a>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '24px 16px 80px', display: 'flex', justifyContent: 'center' }}>
      <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
      <div style={{ width: '100%', maxWidth: 480, marginTop: 16 }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 13, color: '#FFD700', fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>{'UNETE A LA QUINIELA'}</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{pool.name}</h1>
        </div>

        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ color: '#888', fontSize: 13 }}>{'Costo de entrada'}</span>
          <span style={{ color: '#FFD700', fontSize: 28, fontWeight: 800 }}>${pool.entry_fee} MXN</span>
        </div>

        <p style={{ color: '#aaa', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{'PASO 1 - Transfiere a esta cuenta'}</p>

        {[
          { label: 'CLABE', value: '722969020127909548' },
          { label: 'Beneficiario', value: 'Ivie Eduardo Munoz Garcia' },
          { label: 'Institucion', value: 'Mercado Pago' },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: '#666', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 15, color: '#fff', fontWeight: 600 }}>{value}</div>
            </div>
            <button onClick={() => copy(value, label)} style={{ background: copied === label ? '#FFD700' : '#1e1e1e', color: copied === label ? '#000' : '#FFD700', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              {copied === label ? '✓' : 'Copiar'}
            </button>
          </div>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#222' }} />
          <span style={{ color: '#555', fontSize: 12 }}>{'PASO 2'}</span>
          <div style={{ flex: 1, height: 1, background: '#222' }} />
        </div>

        <p style={{ color: '#aaa', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{'Sube tu comprobante'}</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="comprobante" style={{ display: 'block', border: '2px dashed #333', borderRadius: 12, padding: '28px 20px', textAlign: 'center', cursor: 'pointer', marginBottom: 16, background: '#111' }}>
            <input id="comprobante" type="file" accept="image/*,.pdf" ref={fileRef} onChange={(e) => setFileName(e.target.files?.[0]?.name || '')} style={{ display: 'none' }} />
            <div style={{ color: '#ccc', fontSize: 14 }}>{fileName || 'Toca para seleccionar foto o PDF'}</div>
            <div style={{ color: '#555', fontSize: 12, marginTop: 4 }}>{'JPG, PNG o PDF'}</div>
          </label>

          {error && <p style={{ color: '#ff4444', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</p>}

          <button type="submit" disabled={uploading} style={{ background: '#FFD700', color: '#000', border: 'none', borderRadius: 12, padding: '14px 24px', fontSize: 15, fontWeight: 800, cursor: 'pointer', width: '100%', opacity: uploading ? 0.7 : 1 }}>
            {uploading ? 'Subiendo...' : 'Enviar comprobante'}
          </button>
        </form>

        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #1a1a1a', textAlign: 'center' }}>
          <p style={{ color: '#555', fontSize: 12, marginBottom: 10 }}>{'Prefieres mandarlo por WhatsApp?'}</p>
          <a href={WA_LINK} target="_blank" rel="noreferrer" style={{ display: 'inline-block', background: '#25D366', color: '#fff', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
            {'Mandar al WhatsApp'}
          </a>
        </div>

      </div>
    </div>
  )
}