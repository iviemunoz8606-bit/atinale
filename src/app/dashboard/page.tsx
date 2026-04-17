// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import JoinPoolModal from '@/components/JoinPoolModal'

// ─── TIPOS ───────────────────────────────────────────────────────────────────
type User = {
  id: string; name: string; email: string; avatar_url: string | null
  total_points: number; referral_code: string | null; is_admin: boolean
}
type Pool = {
  id: string; name: string; description: string; competition: string
  entry_fee: number; max_participants: number; current_participants: number
  total_pot: number; net_prize: number; platform_commission: number
  status: string; registration_closes_at: string; starts_at: string
}
type PoolMember = {
  id: string; pool_id: string; points: number; rank: number | null
  payment_status: string; pool: Pool
}
type Prediction = {
  id: string; predicted_home: number; predicted_away: number; points_earned: number
  match: { home_team: string; away_team: string; home_flag: string; away_flag: string
    scheduled_at: string; status: string; home_score: number | null; away_score: number | null }
}
type LeaderboardEntry = {
  user_id: string; points: number; rank: number
  user: { name: string; avatar_url: string | null }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getInitial(name: string) { return name ? name.charAt(0).toUpperCase() : '?' }

function formatMXN(amount: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(amount)
}

function timeUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff <= 0) return 'Cerrada'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  if (days > 0) return `${days}d ${hours}h`
  return `${hours}h`
}

// ─── COMPETENCIA: colores y etiquetas ────────────────────────────────────────
function getCompTheme(comp: string) {
  switch (comp) {
    case 'FIFA_2026': return {
      label: '⚽ Mundial FIFA 2026', icon: '🌍',
      accent: '#00C46A', accentBg: 'rgba(0,196,106,0.10)',
      accentBorder: 'rgba(0,196,106,0.25)', leftBorder: '#00C46A',
      headerBg: 'linear-gradient(135deg,rgba(0,196,106,0.08),transparent)',
      potColor: '#F5B731', netColor: '#00C46A',
      barGradient: 'linear-gradient(90deg,#00C46A,#F5B731)',
    }
    case 'LIGA_MX': return {
      label: '🦅 Liga MX', icon: '🦅',
      accent: '#E8192C', accentBg: 'rgba(232,25,44,0.10)',
      accentBorder: 'rgba(232,25,44,0.25)', leftBorder: '#E8192C',
      headerBg: 'linear-gradient(135deg,rgba(232,25,44,0.08),transparent)',
      potColor: '#E8192C', netColor: '#006847',
      barGradient: 'linear-gradient(90deg,#E8192C,#006847)',
    }
    case 'UEFA_CL': return {
      label: '⭐ UEFA Champions', icon: '⭐',
      accent: '#4FADFF', accentBg: 'rgba(79,173,255,0.10)',
      accentBorder: 'rgba(79,173,255,0.25)', leftBorder: '#4FADFF',
      headerBg: 'linear-gradient(135deg,rgba(79,173,255,0.08),transparent)',
      potColor: '#4FADFF', netColor: '#7B2FF7',
      barGradient: 'linear-gradient(90deg,#4FADFF,#7B2FF7)',
    }
    default: return {
      label: comp, icon: '🏆',
      accent: '#6B7280', accentBg: 'rgba(107,114,128,0.10)',
      accentBorder: 'rgba(107,114,128,0.25)', leftBorder: '#6B7280',
      headerBg: 'transparent', potColor: '#F5B731', netColor: '#00C46A',
      barGradient: 'linear-gradient(90deg,#6B7280,#9CA3AF)',
    }
  }
}

// ─── DIANA ANIMADA (igual que landing) ───────────────────────────────────────
function NavDiana() {
  const size = 32
  const off1 = Math.round(size * 0.13)
  const off2 = Math.round(size * 0.28)
  const s2 = size - off1 * 2
  const s3 = size - off2 * 2
  const r1 = size / 2 - 2
  const r2 = s2 / 2 - 2
  const r3 = s3 / 2 - 1.5
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, animation: 'navSpin 18s linear infinite' }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
          <circle cx={size/2} cy={size/2} r={r1} fill="none" stroke="rgba(245,183,49,0.10)" strokeWidth="1"/>
          <circle cx={size/2} cy={size/2} r={r1} fill="none" stroke="rgba(245,183,49,0.55)" strokeWidth="1.2"
            strokeDasharray={`8 ${Math.round(r1*2*Math.PI)-8}`} strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ position: 'absolute', inset: off1, animation: 'navSpinRev 11s linear infinite' }}>
        <svg viewBox={`0 0 ${s2} ${s2}`} width={s2} height={s2}>
          <circle cx={s2/2} cy={s2/2} r={r2} fill="none" stroke="rgba(245,183,49,0.08)" strokeWidth="0.8"/>
          <circle cx={s2/2} cy={s2/2} r={r2} fill="none" stroke="rgba(245,183,49,0.48)" strokeWidth="1"
            strokeDasharray={`5 ${Math.round(r2*2*Math.PI)-5}`} strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ position: 'absolute', inset: off2, animation: 'navSpin 5s linear infinite' }}>
        <svg viewBox={`0 0 ${s3} ${s3}`} width={s3} height={s3}>
          <circle cx={s3/2} cy={s3/2} r={r3} fill="none" stroke="rgba(245,183,49,0.45)" strokeWidth="0.9"
            strokeDasharray={`4 ${Math.round(r3*2*Math.PI)-4}`} strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ animation: 'navPulse 1.8s ease-in-out infinite', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="5" height="5" viewBox="0 0 24 24" fill="#F5B731">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
        </div>
      </div>
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, transform: 'translateY(-50%)', background: 'linear-gradient(90deg,transparent,rgba(245,183,49,0.28),transparent)' }}/>
      <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, transform: 'translateX(-50%)', background: 'linear-gradient(180deg,transparent,rgba(245,183,49,0.28),transparent)' }}/>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Dashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [pools, setPools] = useState<Pool[]>([])
  const [myPools, setMyPools] = useState<PoolMember[]>([])
  const [recentPredictions, setRecentPredictions] = useState<Prediction[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [activePoolId, setActivePoolId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'disponibles' | 'mis-quinielas'>('disponibles')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [modalPool, setModalPool] = useState<Pool | null>(null)

  useEffect(() => { loadDashboard() }, [])

  useEffect(() => {
    if (!showUserMenu) return
    const handler = () => setShowUserMenu(false)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [showUserMenu])

  async function loadDashboard() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }
      const { data: userData } = await supabase.from('users').select('*').eq('id', session.user.id).single()
      if (!userData) { router.push('/registro'); return }
      setUser(userData)
      const { data: poolsData } = await supabase.from('pools').select('*')const { data: publicPools } = await supabase.from('pools').select('*').eq('status', 'open').eq('type', 'public').order('starts_at', { ascending: true })
      const { data: myPrivatePools } = await supabase.from('pools').select('*').eq('status', 'open').eq('type', 'private').eq('creator_id', session.user.id).order('starts_at', { ascending: true })
      const allPools = [...(publicPools || []), ...(myPrivatePools || [])]
      setPools(allPools)
      setPools(poolsData || [])
      const { data: memberData } = await supabase.from('pool_members').select('id, pool_id, points, rank, payment_status, pool:pools(*)').eq('user_id', session.user.id)
      setMyPools((memberData as any) || [])
      const { data: predsData } = await supabase.from('predictions')
        .select('id, predicted_home, predicted_away, points_earned, match:matches(home_team, away_team, home_flag, away_flag, scheduled_at, status, home_score, away_score)')
        .eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(5)
      setRecentPredictions(predsData || [])
      if (poolsData && poolsData.length > 0) { setActivePoolId(poolsData[0].id); loadLeaderboard(poolsData[0].id) }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  async function loadLeaderboard(poolId: string) {
    const { data } = await supabase.from('pool_members')
      .select('user_id, points, rank, user:users(name, avatar_url)')
      .eq('pool_id', poolId).eq('payment_status', 'approved')
      .order('points', { ascending: false }).limit(10)
    setLeaderboard(data || [])
    setActivePoolId(poolId)
  }

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/')
  }

  function handlePredictClick(pool: Pool) {
    const membership = myPools.find(m => m.pool_id === pool.id)
    if (!membership) { setModalPool(pool); return }
    if (membership.payment_status === 'approved') { router.push(`/quiniela/${pool.id}`); return }
    setModalPool({ ...pool, _pendingOnly: true } as any)
  }

  async function handleModalSuccess() {
    setModalPool(null)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data: memberData } = await supabase.from('pool_members').select('id, pool_id, points, rank, payment_status, pool:pools(*)').eq('user_id', session.user.id)
    setMyPools((memberData as any) || [])
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080C16', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(245,183,49,0.2)', borderTopColor: '#F5B731', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#6B7280', fontSize: 14 }}>Cargando...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (!user) return null

  const myRank = myPools.length > 0 ? Math.min(...myPools.map(m => m.rank || 999)) : null
  const totalMyPoints = user.total_points || 0

  return (
    <div style={{ background: '#080C16', minHeight: '100vh', fontFamily: "'Outfit','Helvetica Neue',sans-serif", color: '#F0F2F8' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080C16; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
        @keyframes shimmer { 0%{left:-100%} 100%{left:200%} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes menuIn  { from{opacity:0;transform:translateY(-8px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes navSpin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes navSpinRev { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
        @keyframes navPulse   { 0%,100%{transform:scale(1);opacity:.75} 50%{transform:scale(1.35);opacity:1} }
        .pool-card  { transition: transform 0.2s, box-shadow 0.2s; }
        .pool-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
        .btn-predict:hover { transform: scale(1.04); box-shadow: 0 6px 20px rgba(245,183,49,0.45) !important; }
        .tab-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .avatar-btn:hover { opacity: 0.85; }
        .menu-item:hover { background: rgba(255,255,255,0.06) !important; }
        .signout-item:hover { background: rgba(232,25,44,0.12) !important; color: #E8192C !important; }
        .pred-card:hover { background: rgba(255,255,255,0.03) !important; }
      `}</style>

      {/* ── MODALES ── */}
      {modalPool && !(modalPool as any)._pendingOnly && (
        <JoinPoolModal pool={modalPool} userId={user.id} userEmail={user.email} userName={user.name}
          onClose={() => setModalPool(null)} onSuccess={handleModalSuccess} />
      )}
      {modalPool && (modalPool as any)._pendingOnly && (
        <div onClick={() => setModalPool(null)} style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: '#111520', borderRadius: '24px 24px 0 0', padding: '32px 24px 48px', border: '1px solid rgba(245,183,49,0.2)', borderBottom: 'none', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>⏳</div>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: '#F5B731', letterSpacing: '0.05em', marginBottom: 8 }}>PAGO EN REVISIÓN</h2>
            <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.7 }}>Tu comprobante ya fue enviado.<br/>En menos de 24 horas quedas activo.</p>
            <button onClick={() => setModalPool(null)} style={{ marginTop: 24, width: '100%', padding: 14, borderRadius: 12, background: 'rgba(245,183,49,0.1)', color: '#F5B731', fontFamily: 'Bebas Neue', fontSize: '1rem', letterSpacing: '0.1em', border: '1px solid rgba(245,183,49,0.3)', cursor: 'pointer' }}>ENTENDIDO</button>
          </div>
        </div>
      )}

      {/* ── TOPBAR ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 64, background: 'rgba(8,12,22,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>

        {/* Logo igual que landing */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: 5, color: 'rgba(255,255,255,0.3)', letterSpacing: '.5px', textTransform: 'uppercase', lineHeight: .5, marginBottom: 1 }}>Quinielas Deportivas</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: '4px', lineHeight: 1, background: 'linear-gradient(135deg,#F5B731 0%,#E8A020 40%,#F5B731 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  ATÍNALE
                </div>
                <NavDiana />
              </div>
              <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.2)', letterSpacing: '.5px', textTransform: 'uppercase', lineHeight: .5, marginTop: 1 }}>Predice y Gana</div>
            </div>
          </div>

          {user.is_admin && (
            <Link href="/admin" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(245,183,49,0.12)', border: '1px solid rgba(245,183,49,0.3)', color: '#F5B731', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
                ⚙️ ADMIN
              </div>
            </Link>
          )}
        </div>

        {/* Avatar + menú */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/crear-sala" style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '7px 14px', borderRadius: 20,
                background: 'linear-gradient(135deg,#F5B731,#C9930A)',
                color: '#080C16', fontSize: 12, fontWeight: 700,
                letterSpacing: '0.5px', whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}>
                + Crear sala
              </div>
            </Link>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: 11, color: '#F5B731' }}>⚽ {totalMyPoints} pts</div>
            </div>
            <button className="avatar-btn" onClick={(e) => { e.stopPropagation(); setShowUserMenu(prev => !prev) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, borderRadius: '50%', transition: 'opacity 0.2s' }}>
              {user.avatar_url
                ? <img src={user.avatar_url} alt={user.name} style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid rgba(245,183,49,0.3)', objectFit: 'cover', display: 'block' }} />
                : <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#F5B731,#00C46A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#080C16', border: '2px solid rgba(245,183,49,0.3)' }}>{getInitial(user.name)}</div>
              }
            </button>
          </div>

          {showUserMenu && (
            <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 48, right: 0, zIndex: 200, background: '#111520', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '6px', minWidth: 190, boxShadow: '0 16px 40px rgba(0,0,0,0.6)', animation: 'menuIn 0.2s ease both' }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F0F2F8' }}>{user.name}</div>
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{user.email}</div>
              </div>
              <Link href="/perfil" style={{ textDecoration: 'none' }} onClick={() => setShowUserMenu(false)}>
                <div className="menu-item" style={{ padding: '10px 12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#F0F2F8', transition: 'background 0.15s' }}>
                  👤 Mi perfil
                </div>
              </Link>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '4px 0' }} />
              <button className="signout-item" onClick={handleSignOut} disabled={signingOut}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'none', border: 'none', cursor: signingOut ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#FF4D6D', fontFamily: "'Outfit',sans-serif", transition: 'background 0.15s, color 0.15s', opacity: signingOut ? 0.6 : 1 }}>
                {signingOut ? '⏳ Cerrando...' : '🚪 Cerrar sesión'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px 100px' }}>

        {/* SALUDO */}
        <div style={{ marginBottom: 24, animation: 'fadeUp 0.4s ease both' }}>
          <div style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Bienvenido de vuelta</div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 40, lineHeight: 1 }}>
            HOLA, <span style={{ color: '#F5B731' }}>{user.name.split(' ')[0].toUpperCase()}</span> 👋
          </div>
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Mis puntos', value: totalMyPoints, color: '#F5B731', sub: myPools.length > 0 ? `${myPools.length} quiniela${myPools.length > 1 ? 's' : ''}` : 'Sin quinielas' },
            { label: 'Posición', value: myRank ? `#${myRank}` : '—', color: '#00C46A', sub: myPools.length > 0 ? 'mejor ranking' : 'únete ya' },
            { label: 'Quinielas', value: myPools.length, color: '#4FADFF', sub: 'activas' },
          ].map((stat, i) => (
            <div key={i} style={{ background: '#111520', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 12px', position: 'relative', overflow: 'hidden', animation: `fadeUp 0.5s ease ${0.05 + i * 0.05}s both` }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: stat.color }} />
              <div style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{stat.label}</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['disponibles', 'mis-quinielas'] as const).map(tab => (
            <button key={tab} className="tab-btn" onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 13, background: activeTab === tab ? 'linear-gradient(135deg,#F5B731,#C9930A)' : 'rgba(255,255,255,0.04)', color: activeTab === tab ? '#080C16' : '#6B7280', transition: 'all 0.2s' }}>
              {tab === 'disponibles' ? '🏆 Disponibles' : '🎯 Mis Quinielas'}
            </button>
          ))}
        </div>

        {/* ── QUINIELAS DISPONIBLES ── */}
        {activeTab === 'disponibles' && (
          <div style={{ animation: 'fadeUp 0.3s ease both' }}>
            {pools.length === 0 ? (
              <div style={{ background: '#111520', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 32, textAlign: 'center', color: '#6B7280' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>No hay quinielas abiertas</div>
                <div style={{ fontSize: 13 }}>Vuelve pronto — el Mundial arranca el 11 de junio</div>
              </div>
            ) : (
              pools.map((pool, i) => {
                const theme = getCompTheme(pool.competition)
                const pot = pool.total_pot > 0 ? pool.total_pot : pool.current_participants * pool.entry_fee
                const netPrize = Math.round(pot * 0.9)
                const commission = Math.round(pot * 0.1)
                const fillPct = Math.min(100, (pool.current_participants / pool.max_participants) * 100)
                const membership = myPools.find(m => m.pool_id === pool.id)
                const isMember = !!membership
                const isPending = membership?.payment_status === 'pending'
                const isApproved = membership?.payment_status === 'approved'

                return (
                  <div key={pool.id} className="pool-card" style={{ background: '#111520', borderRadius: 18, overflow: 'hidden', marginBottom: 16, animation: `fadeUp 0.5s ease ${0.1 + i * 0.08}s both`, border: `1px solid ${theme.accentBorder}`, borderLeft: `3px solid ${theme.leftBorder}` }}>

                    {/* Header con color de competencia */}
                    <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, background: theme.headerBg, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: theme.accentBg, border: `1px solid ${theme.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                        {theme.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#F0F2F8' }}>{pool.name}</div>
                        <div style={{ fontSize: 10, color: theme.accent, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 2, fontWeight: 700 }}>{theme.label}</div>
                      </div>
                      <div style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: theme.accentBg, color: theme.accent, border: `1px solid ${theme.accentBorder}` }}>
                        {pool.status === 'open' ? 'Abierta' : 'Próximo'}
                      </div>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ fontSize: 11, color: '#6B7280' }}>💰 Pozo en tiempo real</div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: theme.potColor, lineHeight: 1 }}>{formatMXN(pot)}</div>
                          <div style={{ fontSize: 11, color: theme.netColor }}>Premio neto: {formatMXN(netPrize)}</div>
                          <div style={{ fontSize: 10, color: '#6B7280' }}>Comisión: {formatMXN(commission)} (10%)</div>
                        </div>
                      </div>

                      {/* Barra progreso */}
                      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 4, height: 5, marginBottom: 6, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 4, width: `${fillPct}%`, background: theme.barGradient, position: 'relative', overflow: 'hidden', transition: 'width 1s ease' }}>
                          <div style={{ position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)', animation: 'shimmer 2s infinite' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#6B7280', marginBottom: 12 }}>
                        <span>{pool.current_participants} participantes</span>
                        <span>Entrada: {formatMXN(pool.entry_fee)}</span>
                      </div>

                      {/* Fecha cierre */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, fontSize: 12 }}>
                        <span>⏰</span>
                        <span style={{ color: '#6B7280' }}>Cierra en:</span>
                        <span style={{ color: '#FF4D6D', fontWeight: 700 }}>{timeUntil(pool.registration_closes_at)}</span>
                        <span style={{ color: '#6B7280', marginLeft: 'auto', fontSize: 10 }}>
                          {pool.registration_closes_at ? new Date(pool.registration_closes_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', timeZone: 'America/Mexico_City' }) : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Footer — botón SIEMPRE amarillo */}
                    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>
                        {isApproved && '✅ Ya participas'}
                        {isPending && '⏳ Pago en revisión'}
                        {!isMember && `${pool.max_participants - pool.current_participants} lugares`}
                      </div>
                      <button className="btn-predict" onClick={() => handlePredictClick(pool)} style={{
                        padding: '9px 20px', borderRadius: 20, border: 'none', cursor: 'pointer',
                        fontWeight: 700, fontSize: 13, fontFamily: "'Outfit',sans-serif", transition: 'all 0.15s',
                        background: isApproved
                          ? 'linear-gradient(135deg,#00C46A,#00864A)'
                          : isPending
                            ? 'rgba(245,183,49,0.1)'
                            : 'linear-gradient(135deg,#F5B731,#C9930A)',
                        color: isPending ? '#F5B731' : '#080C16',
                        boxShadow: isApproved ? '0 4px 15px rgba(0,196,106,0.3)' : isPending ? 'none' : '0 4px 15px rgba(245,183,49,0.3)',
                      }}>
                        {isApproved ? 'VER PREDICCIONES →' : isPending ? '⏳ EN REVISIÓN' : 'UNIRSE →'}
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ── MIS QUINIELAS ── */}
        {activeTab === 'mis-quinielas' && (
          <div style={{ animation: 'fadeUp 0.3s ease both' }}>
            {myPools.length === 0 ? (
              <div style={{ background: '#111520', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 32, textAlign: 'center', color: '#6B7280' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Aún no participas en ninguna quiniela</div>
                <button onClick={() => setActiveTab('disponibles')} style={{ marginTop: 12, padding: '10px 20px', borderRadius: 20, background: 'linear-gradient(135deg,#F5B731,#C9930A)', color: '#080C16', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
                  Ver quinielas disponibles
                </button>
              </div>
            ) : (
              myPools.map((member, i) => {
                const theme = getCompTheme(member.pool?.competition || '')
                return (
                  <div key={member.id} style={{ background: '#111520', border: `1px solid ${theme.accentBorder}`, borderLeft: `3px solid ${theme.leftBorder}`, borderRadius: 14, padding: 16, marginBottom: 12, animation: `fadeUp 0.4s ease ${i * 0.06}s both` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{member.pool?.name}</div>
                        <div style={{ fontSize: 10, color: theme.accent, marginTop: 2, fontWeight: 700, letterSpacing: 1 }}>{theme.label}</div>
                      </div>
                      <div style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, background: member.payment_status === 'approved' ? 'rgba(0,196,106,0.15)' : 'rgba(245,183,49,0.15)', color: member.payment_status === 'approved' ? '#00C46A' : '#F5B731' }}>
                        {member.payment_status === 'approved' ? '✅ Pagado' : '⏳ Pendiente'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 10, color: '#6B7280' }}>MIS PUNTOS</div>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: '#F5B731' }}>{member.points}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#6B7280' }}>POSICIÓN</div>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: '#00C46A' }}>{member.rank ? `#${member.rank}` : '—'}</div>
                      </div>
                      <div style={{ marginLeft: 'auto' }}>
                        {member.payment_status === 'approved' ? (
                          <Link href={`/quiniela/${member.pool_id}`} style={{ textDecoration: 'none' }}>
                            <button style={{ padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#F5B731,#C9930A)', color: '#080C16', fontWeight: 700, fontSize: 13 }}>Ver →</button>
                          </Link>
                        ) : (
                          <span style={{ fontSize: 12, color: '#F5B731' }}>⏳ Validando</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ── PREDICCIONES RECIENTES ── */}
        {recentPredictions.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              Mis predicciones recientes
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            </div>
            {recentPredictions.map((pred, i) => {
              const isExact = pred.points_earned === 3
              const isCorrect = pred.points_earned === 1
              return (
                <div key={pred.id} className="pred-card" style={{ background: '#111520', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '12px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12, animation: `fadeUp 0.4s ease ${0.1 + i * 0.06}s both`, transition: 'background 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    <img src={pred.match?.home_flag} alt="" style={{ width: 32, height: 22, objectFit: 'cover', borderRadius: 3 }} />
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, padding: '3px 10px', background: '#181E2C', borderRadius: 8 }}>
                      {pred.predicted_home} - {pred.predicted_away}
                    </div>
                    <img src={pred.match?.away_flag} alt="" style={{ width: 32, height: 22, objectFit: 'cover', borderRadius: 3 }} />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, padding: '3px 10px', borderRadius: 8, background: isExact ? 'rgba(245,183,49,0.15)' : isCorrect ? 'rgba(0,196,106,0.15)' : 'rgba(107,114,128,0.12)', color: isExact ? '#F5B731' : isCorrect ? '#00C46A' : '#6B7280' }}>
                      +{pred.points_earned} pts
                    </div>
                    <div style={{ fontSize: 10, color: '#6B7280', marginTop: 3 }}>
                      {isExact ? '¡Marcador exacto!' : isCorrect ? 'Resultado correcto' : 'Sin puntos'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── LEADERBOARD ── */}
        {pools.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              Tabla de posiciones
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            </div>
            {pools.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
                {pools.map(pool => {
                  const t = getCompTheme(pool.competition)
                  return (
                    <button key={pool.id} onClick={() => loadLeaderboard(pool.id)} style={{ padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', background: activePoolId === pool.id ? t.accentBg : 'rgba(255,255,255,0.04)', color: activePoolId === pool.id ? t.accent : '#6B7280', fontSize: 12, fontWeight: 600, borderWidth: 1, borderStyle: 'solid', borderColor: activePoolId === pool.id ? t.accentBorder : 'transparent' }}>
                      {pool.name}
                    </button>
                  )
                })}
              </div>
            )}
            <div style={{ background: '#111520', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, overflow: 'hidden', animation: 'fadeUp 0.5s ease both' }}>
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'linear-gradient(135deg,rgba(245,183,49,0.06),transparent)' }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{pools.find(p => p.id === activePoolId)?.name || 'Ranking'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#00C46A' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00C46A', animation: 'pulse 1.5s infinite' }} />
                  EN VIVO
                </div>
              </div>
              {leaderboard.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#6B7280', fontSize: 13 }}>Nadie en el ranking aún — ¡sé el primero!</div>
              ) : (
                leaderboard.map((entry, i) => {
                  const isMe = entry.user_id === user.id
                  const avatarColors = ['#4FADFF,#7B2FF7', '#F5B731,#C9930A', '#00C46A,#00864A', '#FF4D6D,#7B2FF7', '#4FADFF,#00C46A']
                  return (
                    <div key={entry.user_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < leaderboard.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none', background: isMe ? 'rgba(245,183,49,0.05)' : 'transparent', borderLeft: isMe ? '2px solid #F5B731' : '2px solid transparent' }}>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, width: 28, textAlign: 'center', color: i < 3 ? '#F5B731' : '#6B7280' }}>{i + 1}</div>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg,${avatarColors[i % avatarColors.length]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: 'white', overflow: 'hidden' }}>
                        {entry.user?.avatar_url
                          ? <img src={entry.user.avatar_url} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                          : getInitial(entry.user?.name || '?')}
                      </div>
                      <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>
                        {entry.user?.name}
                        {isMe && <span style={{ fontSize: 10, color: '#F5B731', marginLeft: 6 }}>← Tú</span>}
                        {i === 0 && <span style={{ marginLeft: 4 }}>👑</span>}
                      </div>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: '#F5B731' }}>{entry.points}</div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,13,18,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', padding: '8px 0 20px' }}>
        {[
          { icon: '🏠', label: 'Inicio',    href: '/dashboard', active: true  },
          { icon: '⚽', label: 'Quinielas', href: '/dashboard', active: false },
          { icon: '🎯', label: 'Predecir',  href: '/dashboard', active: false },
          { icon: '🏆', label: 'Ranking',   href: '/ranking',   active: false },
          { icon: '👤', label: 'Perfil',    href: '/perfil',    active: false },
        ].map((item) => (
          <Link key={item.label} href={item.href} style={{ flex: 1, textDecoration: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 6 }}>
              <div style={{ fontSize: 22, filter: item.active ? 'drop-shadow(0 0 6px #F5B731)' : 'none' }}>{item.icon}</div>
              <div style={{ fontSize: 10, color: item.active ? '#F5B731' : '#6B7280', transition: 'color 0.2s' }}>{item.label}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}