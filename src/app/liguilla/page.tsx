// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import JoinPoolModal from '@/components/JoinPoolModal'
import Loading from '@/app/loading'
import DianaHero from '@/components/DianaHero'

const POOL_ID = 'c7b6e451-d671-41d8-b615-723a98098fb8'

type Pool = {
  id: string; name: string; competition: string; entry_fee: number
  max_participants: number; current_participants: number; total_pot: number
  status: string; registration_closes_at: string
}
type User = { id: string; name: string; email: string }

function formatMXN(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
}

function timeUntil(d: string) {
  const diff = new Date(d).getTime() - Date.now()
  if (diff <= 0) return 'Cerrada'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  if (days > 0) return `${days}d ${hours}h`
  return `${hours}h`
}

export default function LiguillaMX() {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const router = useRouter()

  const [pool, setPool] = useState<Pool | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [membership, setMembership] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const { data: poolData } = await supabase.from('pools').select('*').eq('id', POOL_ID).single()
      setPool(poolData)

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: userData } = await supabase.from('users').select('*').eq('id', session.user.id).single()
        setUser(userData)
        const { data: memberData } = await supabase.from('pool_members').select('*').eq('pool_id', POOL_ID).eq('user_id', session.user.id).maybeSingle()
        setMembership(memberData)
      }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  async function handleCTA() {
    if (!user) {
      const supabase2 = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      await supabase2.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback?redirect=/liguilla` }
      })
      return
    }
    if (!membership) { setShowModal(true); return }
    if (membership.payment_status === 'approved') { router.push(`/quiniela/${POOL_ID}`); return }
    setShowModal(true)
  }

  async function handleModalSuccess() {
    setShowModal(false)
    const { data: memberData } = await supabase.from('pool_members').select('*').eq('pool_id', POOL_ID).eq('user_id', user!.id).maybeSingle()
    setMembership(memberData)
  }

  if (loading) return <Loading />
  if (!pool) return null

  const pot = pool.total_pot > 0 ? pool.total_pot : pool.current_participants * pool.entry_fee
  const fillPct = Math.min(100, (pool.current_participants / pool.max_participants) * 100)
  const isApproved = membership?.payment_status === 'approved'
  const isPending = membership?.payment_status === 'pending'

  return (
    <div style={{ background: '#080C16', minHeight: '100vh', fontFamily: "'Outfit',sans-serif", color: '#F0F2F8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 16px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{left:-100%} 100%{left:200%} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
      `}</style>

      {showModal && user && (
        <JoinPoolModal pool={pool} userId={user.id} userEmail={user.email} userName={user.name}
          onClose={() => setShowModal(false)} onSuccess={handleModalSuccess} />
      )}

      <div style={{ maxWidth: 400, width: '100%', animation: 'fadeUp 0.4s ease both' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ position: 'relative', display: 'inline-block', paddingRight: 20 }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, letterSpacing: '4px', background: 'linear-gradient(135deg,#C9930A,#F5B731,#fff,#F5B731,#C9930A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', position: 'relative', zIndex: 2 }}>
              ATÍNALE
            </div>
            <div style={{ position: 'absolute', width: 48, height: 48, right: -18, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
              <DianaHero size={48} />
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 6 }}>Quinielas Deportivas</div>
        </div>

        {/* Card principal */}
        <div style={{ background: '#111520', borderRadius: 20, overflow: 'hidden', border: '0.5px solid rgba(232,25,44,.3)', borderTop: '3px solid #E8192C' }}>

          {/* Header */}
          <div style={{ padding: '20px 20px 16px', background: 'linear-gradient(135deg,rgba(232,25,44,.08),transparent)', borderBottom: '0.5px solid rgba(255,255,255,.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(232,25,44,.12)', border: '0.5px solid rgba(232,25,44,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🦅</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17 }}>{pool.name}</div>
                <div style={{ fontSize: 11, color: '#E8192C', fontWeight: 700, letterSpacing: 1.5, marginTop: 2 }}>🦅 LIGA MX · LIGUILLA</div>
              </div>
            </div>
          </div>

          {/* Pozo */}
          <div style={{ padding: '20px 20px 16px', textAlign: 'center', borderBottom: '0.5px solid rgba(255,255,255,.06)' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>💰 Pozo acumulado</div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 64, color: '#E8192C', lineHeight: 1 }}>{formatMXN(pot)}</div>
            <div style={{ fontSize: 13, color: '#006847', marginTop: 4 }}>
              🏆 ¡Te puedes ganar hasta {formatMXN(Math.round(pot * 0.9))}!
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>
              Comisión plataforma: {formatMXN(Math.round(pot * 0.1))} (10%)
            </div>
          </div>

          {/* Stats */}
          <div style={{ padding: '14px 20px', borderBottom: '0.5px solid rgba(255,255,255,.06)' }}>
            <div style={{ background: 'rgba(255,255,255,.04)', borderRadius: 6, height: 6, marginBottom: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 6, width: `${fillPct}%`, background: 'linear-gradient(90deg,#E8192C,#006847)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.4),transparent)', animation: 'shimmer 2s infinite' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,.4)' }}>
              <span>{pool.current_participants} / {pool.max_participants} participantes</span>
              <span>Entrada: {formatMXN(pool.entry_fee)}</span>
            </div>
          </div>

          {/* Info */}
          <div style={{ padding: '12px 20px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
              <div style={{ color: 'rgba(255,255,255,.4)' }}>
                ⏰ Cierra en: <span style={{ color: '#FF4D6D', fontWeight: 700 }}>{timeUntil(pool.registration_closes_at)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#00C46A', fontSize: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C46A', animation: 'pulse 1.5s infinite' }} />
                Abierta
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: 20 }}>
          {isApproved ? (
            <button onClick={() => router.push(`/quiniela/${POOL_ID}`)} style={{ width: '100%', padding: '16px', borderRadius: 16, background: 'linear-gradient(135deg,#00C46A,#00864A)', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", letterSpacing: '0.5px' }}>
              VER MIS PREDICCIONES →
            </button>
          ) : isPending ? (
            <div style={{ width: '100%', padding: '16px', borderRadius: 16, background: 'rgba(245,183,49,.1)', color: '#F5B731', fontWeight: 700, fontSize: 15, textAlign: 'center', border: '1px solid rgba(245,183,49,.3)' }}>
              ⏳ Pago en revisión — en menos de 24hrs quedas activo
            </div>
          ) : (
            <button onClick={handleCTA} style={{ width: '100%', padding: '16px', borderRadius: 16, background: 'linear-gradient(135deg,#F5B731,#C9930A)', color: '#080C16', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", letterSpacing: '0.5px', animation: 'pulse 2s ease-in-out infinite' }}>
              {user ? 'UNIRME AHORA →' : 'REGISTRARME Y UNIRME →'}
            </button>
          )}
        </div>

        {/* Reglas rápidas */}
        <div style={{ marginTop: 20, background: '#111520', borderRadius: 14, padding: '14px 16px', border: '0.5px solid rgba(255,255,255,.07)' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>Cómo funciona</div>
          {[
            { icon: '🎯', text: 'Predice el marcador de cada partido de la Liguilla' },
            { icon: '⭐', text: 'Marcador exacto = 3 pts · Resultado correcto = 1 pt' },
            { icon: '🏆', text: 'El jugador con más puntos se lleva el pozo' },
            { icon: '💰', text: `Entrada: ${formatMXN(pool.entry_fee)} · Comisión plataforma: 10%` },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: i < 3 ? 8 : 0 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', lineHeight: 1.5 }}>{item.text}</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: 'rgba(255,255,255,.2)' }}>
          atinale-ecru.vercel.app
        </div>
      </div>
    </div>
  )
}