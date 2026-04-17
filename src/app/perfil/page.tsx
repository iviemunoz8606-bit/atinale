// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Loading from '@/app/loading'

export default function Perfil() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [myPools, setMyPools] = useState([])
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => { loadPerfil() }, [])

  async function loadPerfil() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/'); return }

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
    setUser(userData)

    const { data: memberData } = await supabase
      .from('pool_members')
      .select('id, points, rank, payment_status, pool:pools(name, competition, entry_fee)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    setMyPools(memberData || [])
    setLoading(false)
  }

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/')
  }

  function getInitial(name) {
    return name ? name.charAt(0).toUpperCase() : '?'
  }

  function compColor(comp) {
    if (comp === 'FIFA_2026') return '#00C46A'
    if (comp === 'LIGA_MX') return '#E8192C'
    if (comp === 'UEFA_CL') return '#4FADFF'
    return '#6B7280'
  }

  function compLabel(comp) {
    if (comp === 'FIFA_2026') return '🌍 Mundial FIFA 2026'
    if (comp === 'LIGA_MX') return '🦅 Liga MX'
    if (comp === 'UEFA_CL') return '⭐ UEFA Champions'
    return comp
  }

  if (loading) return <Loading />

  const totalPoints = user?.total_points || 0
  const quinielasAprobadas = myPools.filter(m => m.payment_status === 'approved').length

  return (
    <div style={{ background: '#080C16', minHeight: '100vh', fontFamily: "'Outfit','Helvetica Neue',sans-serif", color: '#F0F2F8', paddingBottom: 100 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      {/* TOPBAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', background: 'rgba(8,12,22,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer', color: '#fff' }}>←</div>
        </Link>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 2, background: 'linear-gradient(135deg,#F5B731,#00C46A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          MI PERFIL
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px' }}>

        {/* AVATAR + NOMBRE */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24, animation: 'fadeUp 0.4s ease both' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#F5B731,#00C46A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 32, color: '#080C16', border: '3px solid rgba(245,183,49,0.3)', marginBottom: 12, overflow: 'hidden' }}>
            {user?.avatar_url ? <img src={user.avatar_url} style={{ width: 80, height: 80, objectFit: 'cover' }} /> : getInitial(user?.name)}
          </div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: 1 }}>{user?.name}</div>
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{user?.email}</div>
          {user?.referral_code && (
            <div style={{ marginTop: 8, padding: '4px 14px', background: 'rgba(245,183,49,0.1)', border: '1px solid rgba(245,183,49,0.25)', borderRadius: 20, fontSize: 12, color: '#F5B731', fontWeight: 700, letterSpacing: 1 }}>
              Código: {user.referral_code}
            </div>
          )}
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20, animation: 'fadeUp 0.4s ease 0.05s both' }}>
          {[
            { label: 'Puntos', value: totalPoints, color: '#F5B731' },
            { label: 'Quinielas', value: quinielasAprobadas, color: '#00C46A' },
            { label: 'Historial', value: myPools.length, color: '#4FADFF' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#111520', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 12px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.color }} />
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#6B7280', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* MIS QUINIELAS */}
        <div style={{ marginBottom: 16, animation: 'fadeUp 0.4s ease 0.1s both' }}>
          <div style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            Mis quinielas
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>
          {myPools.length === 0 ? (
            <div style={{ background: '#111520', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 24, textAlign: 'center', color: '#6B7280' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
              <div style={{ fontSize: 13 }}>Aún no te has unido a ninguna quiniela</div>
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <button style={{ marginTop: 12, padding: '8px 20px', borderRadius: 20, background: 'linear-gradient(135deg,#F5B731,#C9930A)', color: '#080C16', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
                  Ver quinielas →
                </button>
              </Link>
            </div>
          ) : (
            myPools.map((m, i) => (
              <div key={m.id} style={{ background: '#111520', border: `1px solid rgba(255,255,255,0.07)`, borderLeft: `3px solid ${compColor(m.pool?.competition)}`, borderRadius: 12, padding: '12px 14px', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{m.pool?.name}</div>
                    <div style={{ fontSize: 10, color: compColor(m.pool?.competition), marginTop: 2, fontWeight: 700, letterSpacing: 1 }}>{compLabel(m.pool?.competition)}</div>
                  </div>
                  <div style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: m.payment_status === 'approved' ? 'rgba(0,196,106,0.15)' : 'rgba(245,183,49,0.15)', color: m.payment_status === 'approved' ? '#00C46A' : '#F5B731' }}>
                    {m.payment_status === 'approved' ? '✅ Activa' : '⏳ Pendiente'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#6B7280' }}>MIS PUNTOS</div>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: '#F5B731' }}>{m.points || 0}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#6B7280' }}>POSICIÓN</div>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: '#00C46A' }}>{m.rank ? `#${m.rank}` : '—'}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DATOS DE CONTACTO */}
        <div style={{ background: '#111520', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 16px', marginBottom: 16, animation: 'fadeUp 0.4s ease 0.15s both' }}>
          <div style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Datos de contacto</div>
          {[
            { label: 'Nombre', value: user?.name },
            { label: 'Email', value: user?.email },
            { label: 'Teléfono', value: user?.phone || '—' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div style={{ fontSize: 13, color: '#6B7280' }}>{item.label}</div>
              <div style={{ fontSize: 13, color: '#F0F2F8', fontWeight: 600 }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* CERRAR SESIÓN */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'rgba(232,25,44,0.08)', border: '1px solid rgba(232,25,44,0.25)', color: '#FF4D6D', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 15, cursor: signingOut ? 'not-allowed' : 'pointer', opacity: signingOut ? 0.6 : 1, animation: 'fadeUp 0.4s ease 0.2s both' }}>
          {signingOut ? '⏳ Cerrando sesión...' : '🚪 Cerrar sesión'}
        </button>

      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,13,18,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', padding: '8px 0 20px' }}>
        {[
          { icon: '🏠', label: 'Inicio',    href: '/dashboard', active: false },
          { icon: '⚽', label: 'Quinielas', href: '/dashboard', active: false },
          { icon: '🎯', label: 'Predecir',  href: '/dashboard', active: false },
          { icon: '🏆', label: 'Ranking',   href: '/ranking',   active: false },
          { icon: '👤', label: 'Perfil',    href: '/perfil',    active: true  },
        ].map((item) => (
          <Link key={item.label} href={item.href} style={{ flex: 1, textDecoration: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 6 }}>
              <div style={{ fontSize: 22, filter: item.active ? 'drop-shadow(0 0 6px #F5B731)' : 'none' }}>{item.icon}</div>
              <div style={{ fontSize: 10, color: item.active ? '#F5B731' : '#6B7280' }}>{item.label}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}