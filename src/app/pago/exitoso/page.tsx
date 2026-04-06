// @ts-nocheck
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PagoExitoso() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => router.push('/dashboard'), 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ background: '#0A0D12', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;600&display=swap');`}</style>

      <div style={{ fontSize: '4rem' }}>🎉</div>
      <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: '#00C46A', letterSpacing: '0.05em', textAlign: 'center' }}>
        ¡PAGO EXITOSO!
      </h1>
      <p style={{ color: '#888', fontSize: '1rem', textAlign: 'center', lineHeight: 1.6, fontFamily: 'Outfit' }}>
        Tu lugar está confirmado.<br />Ya puedes hacer tus predicciones.
      </p>
      <div style={{ marginTop: 8, padding: '12px 24px', borderRadius: 12, background: 'rgba(0,196,106,0.1)', border: '1px solid rgba(0,196,106,0.3)', color: '#00C46A', fontSize: '0.85rem', fontFamily: 'Outfit' }}>
        Redirigiendo al dashboard en 4 segundos...
      </div>
    </div>
  )
}