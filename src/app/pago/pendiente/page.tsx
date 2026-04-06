// @ts-nocheck
'use client'

import { useRouter } from 'next/navigation'

export default function PagoPendiente() {
  const router = useRouter()

  return (
    <div style={{ background: '#0A0D12', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;600&display=swap');`}</style>

      <div style={{ fontSize: '4rem' }}>⏳</div>
      <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: '#F5B731', letterSpacing: '0.05em', textAlign: 'center' }}>
        PAGO EN PROCESO
      </h1>
      <p style={{ color: '#888', fontSize: '1rem', textAlign: 'center', lineHeight: 1.6, fontFamily: 'Outfit' }}>
        Tu pago está siendo procesado.<br />Te avisamos cuando se confirme.
      </p>
      <button
        onClick={() => router.push('/dashboard')}
        style={{ marginTop: 8, padding: '14px 32px', borderRadius: 12, background: 'rgba(245,183,49,0.1)', color: '#F5B731', fontFamily: 'Bebas Neue', fontSize: '1.1rem', letterSpacing: '0.1em', border: '1px solid rgba(245,183,49,0.3)', cursor: 'pointer' }}
      >
        IR AL DASHBOARD
      </button>
    </div>
  )
}