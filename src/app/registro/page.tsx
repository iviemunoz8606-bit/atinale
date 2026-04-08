// @ts-nocheck
'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import '@fontsource/bebas-neue'

export default function Registro() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'login' | 'perfil'>('login')
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [referido, setReferido] = useState('')
  const [error, setError] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  (() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)

    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) setReferido(ref)

    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        const { data: perfil } = await supabase
          .from('users')
          .select('name, phone')
          .eq('id', data.session.user.id)
          .single()
        
        if (!perfil || !perfil.name || !perfil.phone) {
          setStep('perfil')
        } else {
          window.location.href = '/dashboard'
        }
      }
    })

    return () => window.removeEventListener('resize', check)
  }, [])

  const loginConGoogle = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
    if (error) {
      setError('Error al conectar con Google. Intenta de nuevo.')
      setLoading(false)
    }
  }

  const guardarPerfil = async () => {
    if (!nombre.trim()) { setError('Por favor escribe tu nombre'); return }
    if (!telefono.trim() || telefono.length < 10) { setError('Por favor escribe tu teléfono (10 dígitos)'); return }

    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Sesión expirada, vuelve a iniciar sesión'); setLoading(false); return }
useEffect
    const { error } = await supabase.from('users').upsert({
      id: user.id,
      name: nombre.trim(),
      email: user.email,
      phone: telefono.trim(),
      referred_by: referido || null,
    })

    if (error) { setError('Error al guardar tu perfil. Intenta de nuevo.'); setLoading(false); return }

    window.location.href = '/dashboard'
  }

  return (
    <div style={{
      background: 'linear-gradient(160deg, #0A0F2E 0%, #0D0D1A 40%, #0A1628 100%)',
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '2rem 1rem'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'linear-gradient(135deg, #1A1050 0%, #0F1A3A 100%)',
          border: '1px solid #534AB7', borderRadius: 28,
          padding: isMobile ? '2rem 1.5rem' : '3rem 2.5rem',
          width: '100%', maxWidth: 440, position: 'relative', overflow: 'hidden'
        }}>

        <div style={{
          position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
          width: 300, height: 200, borderRadius: '50%',
          background: '#534AB720', filter: 'blur(60px)', pointerEvents: 'none'
        }}/>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, color: '#fff', letterSpacing: '4px', lineHeight: 1 }}>
            ATÍNALE
          </div>
          <div style={{ fontSize: 11, color: '#7F77DD', letterSpacing: '3px' }}>QUINIELAS DEPORTIVAS</div>
        </div>

        {step === 'login' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>
              Únete a la quiniela
            </h2>
            <p style={{ color: '#AFA9EC', fontSize: 15, textAlign: 'center', marginBottom: 32, lineHeight: 1.5 }}>
              Entra con tu cuenta de Google en un clic — sin contraseñas
            </p>
            <div style={{
              background: '#0A0F1E', border: '1px solid #2A2050',
              borderRadius: 16, padding: '1rem', textAlign: 'center', marginBottom: 28
            }}>
              <p style={{ color: '#AFA9EC', fontSize: 12, marginBottom: 4, letterSpacing: 2 }}>💰 PREMIO ACTUAL</p>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#EFC84A', fontSize: 48, lineHeight: 1 }}>$5,400</p>
              <p style={{ color: '#5F6E8A', fontSize: 12 }}>MXN · 30 jugadores</p>
            </div>
            {error && (
              <div style={{ background: '#FF444420', border: '1px solid #FF4444', borderRadius: 12, padding: '12px 16px', color: '#FF6666', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>
                {error}
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={loginConGoogle} disabled={loading}
              style={{
                width: '100%', background: '#ffffff', color: '#1a1a1a', border: 'none',
                borderRadius: 50, padding: '16px 24px', fontSize: 17, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                opacity: loading ? 0.7 : 1
              }}>
              {loading ? <span>Conectando...</span> : (
                <>
                  <svg width="22" height="22" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar con Google
                </>
              )}
            </motion.button>
            <p style={{ color: '#5F6E8A', fontSize: 13, textAlign: 'center', marginTop: 20, lineHeight: 1.5 }}>
              Al continuar aceptas participar en la quiniela bajo las reglas de Atínale
            </p>
          </motion.div>
        )}

        {step === 'perfil' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>
              ¡Ya casi estás!
            </h2>
            <p style={{ color: '#AFA9EC', fontSize: 15, textAlign: 'center', marginBottom: 28 }}>
              Completa tu perfil para aparecer en el ranking
            </p>
            {['NOMBRE COMPLETO', 'TELÉFONO (WhatsApp)', 'CÓDIGO DE REFERIDO'].map((label, i) => (
              <div key={i} style={{ marginBottom: i === 2 ? 24 : 16 }}>
                <label style={{ color: '#AFA9EC', fontSize: 13, fontWeight: 600, letterSpacing: 1, display: 'block', marginBottom: 8 }}>
                  {label} {i === 2 && <span style={{ color: '#5F6E8A', fontWeight: 400 }}>(opcional)</span>}
                </label>
                <input
                  type={i === 1 ? 'tel' : 'text'}
                  value={i === 0 ? nombre : i === 1 ? telefono : referido}
                  onChange={e => {
                    if (i === 0) setNombre(e.target.value)
                    if (i === 1) setTelefono(e.target.value.replace(/\D/g, '').slice(0, 10))
                    if (i === 2) setReferido(e.target.value.toUpperCase())
                  }}
                  placeholder={i === 0 ? 'Como quieres aparecer en el ranking' : i === 1 ? '10 dígitos — para avisarte si ganas' : 'Si alguien te invitó'}
                  style={{
                    width: '100%', background: '#0A0F1E', border: '1px solid #2A2050',
                    borderRadius: 12, padding: '14px 16px',
                    color: i === 2 ? '#EFC84A' : '#fff', fontSize: 16,
                    outline: 'none', boxSizing: 'border-box',
                    letterSpacing: i === 2 ? 2 : 'normal'
                  }}/>
              </div>
            ))}
            {error && (
              <div style={{ background: '#FF444420', border: '1px solid #FF4444', borderRadius: 12, padding: '12px 16px', color: '#FF6666', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>
                {error}
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={guardarPerfil} disabled={loading}
              style={{
                width: '100%', background: '#EFC84A', color: '#0D0D1A', border: 'none',
                borderRadius: 50, padding: '18px 24px', fontSize: 18, fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
              }}>
              {loading ? 'Guardando...' : '🏆 Entrar a la quiniela →'}
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}