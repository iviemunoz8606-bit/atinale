// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import JoinPoolModal from '@/components/JoinPoolModal'
import Loading from '@/app/loading'
import BottomNav from '@/components/BottomNav'

type User = {
  id: string; name: string; email: string; avatar_url: string | null
  total_points: number; referral_code: string | null; is_admin: boolean; emoji?: string
}
type Pool = {
  id: string; name: string; competition: string; entry_fee: number
  max_participants: number; current_participants: number; total_pot: number
  status: string; registration_closes_at: string; starts_at: string
  type: string; creator_id: string
}
type PoolMember = {
  id: string; pool_id: string; points: number; rank: number | null
  payment_status: string; pool: Pool
}
type Prediction = {
  id: string; predicted_home: number; predicted_away: number; points_earned: number
  pool_id: string
  match: {
    id: string; home_team: string; away_team: string; home_flag: string; away_flag: string
    scheduled_at: string; status: string; home_score: number | null; away_score: number | null
  }
}
type Match = {
  id: string; home_team: string; away_team: string; home_flag: string; away_flag: string
  scheduled_at: string; status: string; home_score: number | null; away_score: number | null
  pool_id: string; pool_name: string; competition: string
}
type LeaderboardEntry = {
  user_id: string; points: number; rank: number
  user: { name: string; avatar_url: string | null; emoji?: string }
}

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

function getCompTheme(comp: string) {
  switch (comp) {
    case 'FIFA_2026': return { label: 'Mundial FIFA 2026', icon: '🌍', accent: '#00C46A', accentBg: 'rgba(0,196,106,0.10)', accentBorder: 'rgba(0,196,106,0.25)', leftBorder: '#00C46A', barGradient: 'linear-gradient(90deg,#00C46A,#F5B731)' }
    case 'LIGA_MX':   return { label: 'Liga MX', icon: '🦅', accent: '#E8192C', accentBg: 'rgba(232,25,44,0.10)', accentBorder: 'rgba(232,25,44,0.25)', leftBorder: '#E8192C', barGradient: 'linear-gradient(90deg,#E8192C,#006847)' }
    case 'UEFA_CL':   return { label: 'UEFA Champions', icon: '⭐', accent: '#4FADFF', accentBg: 'rgba(79,173,255,0.10)', accentBorder: 'rgba(79,173,255,0.25)', leftBorder: '#4FADFF', barGradient: 'linear-gradient(90deg,#4FADFF,#7B2FF7)' }
    default:          return { label: comp, icon: '🏆', accent: '#6B7280', accentBg: 'rgba(107,114,128,0.10)', accentBorder: 'rgba(107,114,128,0.25)', leftBorder: '#6B7280', barGradient: 'linear-gradient(90deg,#6B7280,#9CA3AF)' }
  }
}

function getInitial(name: string) { return name ? name.charAt(0).toUpperCase() : '?' }

function NavDiana() {
  const size = 32, off1 = Math.round(size * 0.13), off2 = Math.round(size * 0.28)
  const s2 = size - off1 * 2, s3 = size - off2 * 2
  const r1 = size / 2 - 2, r2 = s2 / 2 - 2, r3 = s3 / 2 - 1.5
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, animation: 'navSpin 18s linear infinite' }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
          <circle cx={size/2} cy={size/2} r={r1} fill="none" stroke="rgba(245,183,49,0.10)" strokeWidth="1"/>
          <circle cx={size/2} cy={size/2} r={r1} fill="none" stroke="rgba(245,183,49,0.55)" strokeWidth="1.2" strokeDasharray={`8 ${Math.round(r1*2*Math.PI)-8}`} strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ position: 'absolute', inset: off1, animation: 'navSpinRev 11s linear infinite' }}>
        <svg viewBox={`0 0 ${s2} ${s2}`} width={s2} height={s2}>
          <circle cx={s2/2} cy={s2/2} r={r2} fill="none" stroke="rgba(245,183,49,0.08)" strokeWidth="0.8"/>
          <circle cx={s2/2} cy={s2/2} r={r2} fill="none" stroke="rgba(245,183,49,0.48)" strokeWidth="1" strokeDasharray={`5 ${Math.round(r2*2*Math.PI)-5}`} strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ position: 'absolute', inset: off2, animation: 'navSpin 5s linear infinite' }}>
        <svg viewBox={`0 0 ${s3} ${s3}`} width={s3} height={s3}>
          <circle cx={s3/2} cy={s3/2} r={r3} fill="none" stroke="rgba(245,183,49,0.45)" strokeWidth="0.9" strokeDasharray={`4 ${Math.round(r3*2*Math.PI)-4}`} strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ animation: 'navPulse 1.8s ease-in-out infinite' }}>
          <svg width="5" height="5" viewBox="0 0 24 24" fill="#F5B731"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
        </div>
      </div>
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, transform: 'translateY(-50%)', background: 'linear-gradient(90deg,transparent,rgba(245,183,49,0.28),transparent)' }}/>
      <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, transform: 'translateX(-50%)', background: 'linear-gradient(180deg,transparent,rgba(245,183,49,0.28),transparent)' }}/>
    </div>
  )
}

export default function Dashboard() {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [myPools, setMyPools] = useState<PoolMember[]>([])
  const [availablePools, setAvailablePools] = useState<Pool[]>([])
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([])
  const [lastPredictions, setLastPredictions] = useState<Prediction[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [activeLeaderPoolId, setActiveLeaderPoolId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'mis' | 'disponibles'>('mis')
  const [modalPool, setModalPool] = useState<Pool | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [nextMatchByPool, setNextMatchByPool] = useState<Record<string, { match: any, pred: any }>>({})

  useEffect(() => { loadDashboard() }, [])
  useEffect(() => {
    if (!showUserMenu) return
    const h = () => setShowUserMenu(false)
    document.addEventListener('click', h)
    return () => document.removeEventListener('click', h)
  }, [showUserMenu])

  async function loadDashboard() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }
      const { data: userData } = await supabase.from('users').select('*').eq('id', session.user.id).single()
      if (!userData) { router.push('/registro'); return }
      setUser(userData)

      // Mis quinielas
      const { data: memberData } = await supabase
        .from('pool_members')
        .select('id, pool_id, points, rank, payment_status, pool:pools(*)')
        .eq('user_id', session.user.id)
      const members = (memberData as any) || []
      setMyPools(members)

      // Próximo partido por quiniela con predicción del usuario
        const nextMatchByPool: Record<string, { match: any, pred: any }> = {}
        const now2 = new Date().toISOString()

        for (const member of members.filter((m: any) => m.payment_status === 'approved')) {
          const competition = member.pool?.competition
          if (!competition) continue

          const roundFilter = member.pool?.round_filter
          let nextMatchQuery = supabase
            .from('matches')
            .select('id, home_team, away_team, home_flag, away_flag, scheduled_at, status, competition')
            .eq('competition', competition)
            .eq('status', 'scheduled')
            .gt('scheduled_at', now2)
            .order('scheduled_at', { ascending: true })
            .limit(1)
          if (roundFilter) nextMatchQuery = nextMatchQuery.eq('round', roundFilter)
          const { data: nextMatch } = await nextMatchQuery.single()

          if (!nextMatch) continue

          const { data: predData } = await supabase
            .from('predictions')
            .select('predicted_home, predicted_away')
            .eq('user_id', session.user.id)
            .eq('match_id', nextMatch.id)
            .eq('pool_id', member.pool_id)
            .single()

          nextMatchByPool[member.pool_id] = { match: nextMatch, pred: predData || null }
        }
        setNextMatchByPool(nextMatchByPool)

      // Disponibles — públicas abiertas en las que NO estoy
      const { data: publicPools } = await supabase
        .from('pools').select('*').eq('status', 'open').eq('type', 'public')
        .order('starts_at', { ascending: true })
      const myPoolIds = new Set(members.map((m: any) => m.pool_id))
      setAvailablePools((publicPools || []).filter(p => !myPoolIds.has(p.id)))

      // Leaderboard — primera quiniela aprobada
      const approvedMembers = members.filter((m: any) => m.payment_status === 'approved')
      if (approvedMembers.length > 0) {
        const firstPoolId = approvedMembers[0].pool_id
        setActiveLeaderPoolId(firstPoolId)
        loadLeaderboard(firstPoolId)

        // Próximos partidos sin predecir
        const now = new Date().toISOString()
        const { data: allPreds } = await supabase.from('predictions').select('match_id, pool_id').eq('user_id', session.user.id)
        const predictedSet = new Set((allPreds || []).map((p: any) => `${p.pool_id}-${p.match_id}`))
        const upcoming: Match[] = []
        const seen = new Set<string>()

        for (const member of approvedMembers) {
          const competition = member.pool?.competition
          if (!competition) continue

          const roundFilter2 = member.pool?.round_filter
          let upcomingQuery = supabase
            .from('matches')
            .select('id, home_team, away_team, home_flag, away_flag, scheduled_at, status, home_score, away_score, competition')
            .eq('competition', competition)
            .gt('scheduled_at', now)
            .order('scheduled_at', { ascending: true })
            .limit(10)
          if (roundFilter2) upcomingQuery = upcomingQuery.eq('round', roundFilter2)
          const { data: matchesData } = await upcomingQuery

          for (const m of (matchesData || [])) {
            const key = `${member.pool_id}-${m.id}`
            if (predictedSet.has(key) || seen.has(key)) continue
            seen.add(key)
            upcoming.push({ ...m, pool_id: member.pool_id, pool_name: member.pool?.name || '', competition: member.pool?.competition || '' })
          }
        }
        setUpcomingMatches(upcoming.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()).slice(0, 2))

        // Últimas 2 predicciones con resultado
        const { data: lastPreds } = await supabase.from('predictions')
          .select('id, predicted_home, predicted_away, points_earned, pool_id, match:matches(id, home_team, away_team, home_flag, away_flag, scheduled_at, status, home_score, away_score)')
          .eq('user_id', session.user.id)
          .not('match.home_score', 'is', null)
          .order('created_at', { ascending: false }).limit(2)
        setLastPredictions((lastPreds as any) || [])
      }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  async function loadLeaderboard(poolId: string) {
    const { data } = await supabase.from('pool_members')
      .select('user_id, points, rank, user:users(name, avatar_url, emoji)')
      .eq('pool_id', poolId).eq('payment_status', 'approved')
      .order('points', { ascending: false }).limit(10)
    setLeaderboard((data as any) || [])
    setActiveLeaderPoolId(poolId)
  }

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleModalSuccess() {
    setModalPool(null)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data: memberData } = await supabase.from('pool_members').select('id, pool_id, points, rank, payment_status, pool:pools(*)').eq('user_id', session.user.id)
    setMyPools((memberData as any) || [])
  }

  function handleJoinClick(pool: Pool) {
    const membership = myPools.find(m => m.pool_id === pool.id)
    if (!membership) { setModalPool(pool); return }
    if (membership.payment_status === 'approved') { router.push(`/quiniela/${pool.id}`); return }
    setModalPool({ ...pool, _pendingOnly: true } as any)
  }

  if (loading) return <Loading />
  if (!user) return null

  const approvedPools = myPools.filter(m => m.payment_status === 'approved')
  const myRank = approvedPools.length > 0 ? Math.min(...approvedPools.map(m => m.rank || 999)) : null
  const showRank = myRank !== null && myRank < 999
  const totalPoints = user.total_points || 0

  return (
    <div style={{ background: '#080C16', minHeight: '100vh', fontFamily: "'Outfit','Helvetica Neue',sans-serif", color: '#F0F2F8' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{left:-100%} 100%{left:200%} }
        @keyframes menuIn { from{opacity:0;transform:translateY(-6px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes navSpin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes navSpinRev { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
        @keyframes navPulse   { 0%,100%{transform:scale(1);opacity:.75} 50%{transform:scale(1.35);opacity:1} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
        .pool-card { transition: transform 0.2s; }
        .pool-card:hover { transform: translateY(-2px); }
        .menu-item:hover { background: rgba(255,255,255,0.06) !important; }
        .signout-item:hover { background: rgba(232,25,44,0.12) !important; color: #E8192C !important; }
        .tab-btn { transition: all 0.2s; }
        .leaderboard-tab:hover { opacity: 0.8; }
      `}</style>

      {/* MODALES */}
      {modalPool && !(modalPool as any)._pendingOnly && (
        <JoinPoolModal pool={modalPool} userId={user.id} userEmail={user.email} userName={user.name}
          onClose={() => setModalPool(null)} onSuccess={handleModalSuccess} />
      )}
      {modalPool && (modalPool as any)._pendingOnly && (
        <div onClick={() => setModalPool(null)} style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: '#111520', borderRadius: '24px 24px 0 0', padding: '32px 24px 48px', border: '1px solid rgba(245,183,49,0.2)', borderBottom: 'none', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>⏳</div>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: '#F5B731', letterSpacing: '0.05em', marginBottom: 8 }}>PAGO EN REVISIÓN</h2>
            <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.7 }}>Tu comprobante ya fue enviado.<br />En menos de 24 horas quedas activo.</p>
            <button onClick={() => setModalPool(null)} style={{ marginTop: 24, width: '100%', padding: 14, borderRadius: 12, background: 'rgba(245,183,49,0.1)', color: '#F5B731', fontFamily: 'Bebas Neue', fontSize: '1rem', border: '1px solid rgba(245,183,49,0.3)', cursor: 'pointer' }}>ENTENDIDO</button>
          </div>
        </div>
      )}

      {/* TOPBAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 64, background: 'rgba(8,12,22,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: 5, color: 'rgba(255,255,255,0.3)', letterSpacing: '.5px', textTransform: 'uppercase', lineHeight: .5, marginBottom: 1 }}>Quinielas Deportivas</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: '4px', lineHeight: 1, background: 'linear-gradient(135deg,#F5B731 0%,#E8A020 40%,#F5B731 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ATÍNALE</div>
                <NavDiana />
              </div>
              <div style={{ fontSize: 6, color: 'rgba(255,255,255,0.2)', letterSpacing: '.5px', textTransform: 'uppercase', lineHeight: .5, marginTop: 1 }}>Predice y Gana</div>
            </div>
          </div>
          {user.is_admin && (
            <Link href="/admin" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(245,183,49,0.12)', border: '1px solid rgba(245,183,49,0.3)', color: '#F5B731', fontSize: 11, fontWeight: 700 }}>⚙️ ADMIN</div>
            </Link>
          )}
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name.split(' ')[0]}</div>
            <div style={{ fontSize: 11, color: '#F5B731' }}>⚽ {totalPoints} pts</div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setShowUserMenu(p => !p) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            {user.avatar_url
              ? <img src={user.avatar_url} style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid rgba(245,183,49,0.3)', objectFit: 'cover', display: 'block' }} />
              : <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(245,183,49,0.15)', border: '2px solid rgba(245,183,49,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{user.emoji || '⚽'}</div>
            }
          </button>
          {showUserMenu && (
            <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 50, right: 0, zIndex: 200, background: '#111520', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 6, minWidth: 190, boxShadow: '0 16px 40px rgba(0,0,0,0.6)', animation: 'menuIn 0.2s ease both' }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{user.email}</div>
              </div>
              <Link href="/perfil" style={{ textDecoration: 'none' }} onClick={() => setShowUserMenu(false)}>
                <div className="menu-item" style={{ padding: '10px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#F0F2F8', transition: 'background 0.15s' }}>👤 Mi perfil</div>
              </Link>
              <Link href="/crear-sala" style={{ textDecoration: 'none' }} onClick={() => setShowUserMenu(false)}>
                <div className="menu-item" style={{ padding: '10px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#F0F2F8', transition: 'background 0.15s' }}>🏠 Crear sala privada</div>
              </Link>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '4px 0' }} />
              <button className="signout-item" onClick={handleSignOut} disabled={signingOut}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#FF4D6D', fontFamily: "'Outfit',sans-serif", textAlign: 'left', transition: 'all 0.15s' }}>
                {signingOut ? '⏳ Cerrando...' : '🚪 Cerrar sesión'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 16px 100px' }}>

        {/* SALUDO + STATS */}
        <div style={{ marginBottom: 20, animation: 'fadeUp 0.3s ease both' }}>
          <div style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Bienvenido de vuelta</div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 40, lineHeight: 1, marginBottom: 16 }}>
            HOLA, <span style={{ color: '#F5B731' }}>{user.name.split(' ')[0].toUpperCase()}</span> 👋
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: 'Mis puntos', value: totalPoints, color: '#F5B731', sub: myPools.length > 0 ? `${myPools.length} quiniela${myPools.length > 1 ? 's' : ''}` : 'Sin quinielas' },
              { label: 'Posición', value: showRank ? `#${myRank}` : '—', color: '#00C46A', sub: showRank ? 'mejor ranking' : 'sin rank aún' },
              { label: 'Quinielas', value: myPools.length, color: '#4FADFF', sub: 'activas' },
            ].map((stat, i) => (
              <div key={i} style={{ background: '#111520', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 12px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: stat.color }} />
                <div style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{stat.label}</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['mis', 'disponibles'] as const).map(tab => (
            <button key={tab} className="tab-btn" onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 13,
              background: activeTab === tab ? 'linear-gradient(135deg,#F5B731,#C9930A)' : 'rgba(255,255,255,0.04)',
              color: activeTab === tab ? '#080C16' : '#6B7280',
            }}>
              {tab === 'mis' ? '🎯 Mis Quinielas' : '🏆 Disponibles'}
            </button>
          ))}
        </div>

        {/* TAB: MIS QUINIELAS */}
        {activeTab === 'mis' && (
          <div style={{ animation: 'fadeUp 0.3s ease both' }}>
            {myPools.length === 0 ? (
              <div style={{ background: '#111520', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 32, textAlign: 'center', color: '#6B7280' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Aún no participas en ninguna quiniela</div>
                <button onClick={() => setActiveTab('disponibles')} style={{ marginTop: 12, padding: '10px 20px', borderRadius: 20, background: 'linear-gradient(135deg,#F5B731,#C9930A)', color: '#080C16', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
                  Ver disponibles
                </button>
              </div>
            ) : (
              myPools.map((member, i) => {
                const theme = getCompTheme(member.pool?.competition || '')
                const pot = member.pool?.total_pot > 0 ? member.pool.total_pot : (member.pool?.current_participants || 0) * (member.pool?.entry_fee || 0)
                return (
                  <div key={member.id} className="pool-card" style={{ background: '#111520', borderRadius: 14, border: `0.5px solid ${theme.accentBorder}`, borderLeft: `3px solid ${theme.leftBorder}`, marginBottom: 12, overflow: 'hidden', animation: `fadeUp 0.3s ease ${i * 0.05}s both` }}>
                    <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '0.5px solid rgba(255,255,255,0.05)', background: `linear-gradient(135deg,${theme.accentBg},transparent)` }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: theme.accentBg, border: `0.5px solid ${theme.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{theme.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{member.pool?.name}</div>
                        <div style={{ fontSize: 10, color: theme.accent, fontWeight: 700, letterSpacing: 1, marginTop: 1 }}>{theme.label.toUpperCase()}</div>
                      </div>
                      <div style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, background: member.payment_status === 'approved' ? 'rgba(0,196,106,0.15)' : 'rgba(245,183,49,0.15)', color: member.payment_status === 'approved' ? '#00C46A' : '#F5B731' }}>
                        {member.payment_status === 'approved' ? '✅ Activa' : '⏳ Pendiente'}
                      </div>
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Mis puntos</div>
                          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: '#F5B731', lineHeight: 1 }}>{member.points || 0}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Posición</div>
                          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: '#00C46A', lineHeight: 1 }}>{member.rank ? `#${member.rank}` : '—'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Pozo</div>
                          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: theme.accent, lineHeight: 1 }}>{formatMXN(pot)}</div>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                          {member.payment_status === 'approved' ? (
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 6 }}>
                              <Link href={`/quiniela/${member.pool_id}`} style={{ textDecoration: 'none' }}>
                                <div style={{ background: 'linear-gradient(135deg,#F5B731,#C9930A)', borderRadius: 20, padding: '7px 16px', fontSize: 18, textAlign: 'center', cursor: 'pointer' }}>🎯</div>
                              </Link>
                              <Link href={`/ranking?pool=${member.pool_id}`} style={{ textDecoration: 'none' }}>
                                <div style={{ background: 'rgba(79,173,255,0.15)', border: '0.5px solid rgba(79,173,255,0.3)', borderRadius: 20, padding: '7px 16px', fontSize: 18, textAlign: 'center', cursor: 'pointer' }}>🏆</div>
                              </Link>
                            </div>
                          ) : (
                            <span style={{ fontSize: 11, color: '#F5B731' }}>⏳ Validando</span>
                          )}
                        </div>
                      </div>
                      {(() => {
                        const next = nextMatchByPool[member.pool_id]
                        if (!next) return null
                        const { match, pred } = next
                        const fecha = new Date(match.scheduled_at).toLocaleDateString('es-MX', {
                          weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                          timeZone: 'America/Mexico_City'
                        })
                        return (
                          <div style={{ marginTop: 8, background: '#0d1220', borderRadius: 10, overflow: 'hidden', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ padding: '6px 10px', fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
                              Próximo partido
                            </div>
                            <div style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1 }}>
                                {match.home_flag && <img src={match.home_flag} style={{ width: 22, height: 22, objectFit: 'contain' }} />}
                                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{match.home_team}</span>
                              </div>
                              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>vs</span>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5, flex: 1 }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{match.away_team}</span>
                                {match.away_flag && <img src={match.away_flag} style={{ width: 22, height: 22, objectFit: 'contain' }} />}
                              </div>
                            </div>
                            <div style={{ padding: '0 10px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: 10, color: '#555' }}>{fecha}</span>
                              {pred ? (
                                <span style={{ background: 'rgba(245,183,49,0.12)', border: '0.5px solid rgba(245,183,49,0.3)', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: '#F5B731', fontWeight: 600 }}>
                                  {pred.predicted_home} - {pred.predicted_away} ✓
                                </span>
                              ) : (
                                <Link href={`/predecir`} style={{ textDecoration: 'none' }}>
                                  <span style={{ background: 'rgba(245,183,49,0.9)', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#080C16', fontWeight: 700, cursor: 'pointer' }}>
                                    ⚠️ Predecir
                                  </span>
                                </Link>
                              )}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* TAB: DISPONIBLES */}
        {activeTab === 'disponibles' && (
          <div style={{ animation: 'fadeUp 0.3s ease both' }}>
            {availablePools.length === 0 ? (
              <div style={{ background: '#111520', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 32, textAlign: 'center', color: '#6B7280' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
                <div style={{ fontWeight: 600 }}>No hay quinielas disponibles</div>
              </div>
            ) : (
              availablePools.map((pool, i) => {
                const theme = getCompTheme(pool.competition)
                const pot = pool.total_pot > 0 ? pool.total_pot : pool.current_participants * pool.entry_fee
                const fillPct = Math.min(100, (pool.current_participants / pool.max_participants) * 100)
                return (
                  <div key={pool.id} className="pool-card" style={{ background: '#111520', borderRadius: 14, border: `0.5px solid ${theme.accentBorder}`, borderLeft: `3px solid ${theme.leftBorder}`, marginBottom: 12, overflow: 'hidden', animation: `fadeUp 0.3s ease ${i * 0.05}s both` }}>
                    <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '0.5px solid rgba(255,255,255,0.05)', background: `linear-gradient(135deg,${theme.accentBg},transparent)` }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: theme.accentBg, border: `0.5px solid ${theme.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{theme.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{pool.name}</div>
                        <div style={{ fontSize: 10, color: theme.accent, fontWeight: 700, letterSpacing: 1, marginTop: 1 }}>{theme.label.toUpperCase()}</div>
                      </div>
                      <div style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, background: theme.accentBg, color: theme.accent, border: `0.5px solid ${theme.accentBorder}` }}>Abierta</div>
                    </div>
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ textAlign: 'center', marginBottom: 12 }}>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>💰 Pozo actual</div>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, color: '#F5B731', lineHeight: 1 }}>{formatMXN(pot)}</div>
                        <div style={{ fontSize: 12, color: theme.accent, marginTop: 2 }}>
                          Premio neto: {formatMXN(Math.round(pot * 0.9))} · Comisión: {formatMXN(Math.round(pot * 0.1))} (10%)
                        </div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 4, height: 5, marginBottom: 8, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 4, width: `${fillPct}%`, background: theme.barGradient, position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)', animation: 'shimmer 2s infinite' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>
                        <span>{pool.current_participants} / {pool.max_participants} participantes</span>
                        <span>Entrada: {formatMXN(pool.entry_fee)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>⏰ Cierra en <span style={{ color: '#FF4D6D', fontWeight: 700 }}>{timeUntil(pool.registration_closes_at)}</span></div>
                        <button onClick={() => handleJoinClick(pool)} style={{ padding: '9px 24px', borderRadius: 20, background: 'linear-gradient(135deg,#F5B731,#C9930A)', color: '#080C16', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
                          UNIRSE →
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* PARTIDOS */}
        {(upcomingMatches.length > 0 || lastPredictions.length > 0) && (
          <div style={{ marginTop: 8, animation: 'fadeUp 0.3s ease 0.1s both' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              Partidos
              <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.07)' }} />
            </div>

            {/* Próximos 2 por predecir */}
            {upcomingMatches.length > 0 && (
              <div style={{ background: '#111520', borderRadius: 14, border: '0.5px solid rgba(255,255,255,0.07)', overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ padding: '8px 14px', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1 }}>⚡ Por predecir</span>
                </div>
                {upcomingMatches.map((match, i) => {
                  const theme = getCompTheme(match.competition)
                  return (
                    <div key={`${match.pool_id}-${match.id}`} style={{ padding: '12px 14px', borderBottom: i < upcomingMatches.length - 1 ? '0.5px solid rgba(255,255,255,0.05)' : 'none', borderLeft: `3px solid ${theme.leftBorder}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontSize: 12 }}>{theme.icon}</span>
                          <span style={{ fontSize: 10, color: theme.accent, fontWeight: 700 }}>{match.pool_name}</span>
                        </div>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
                          {new Date(match.scheduled_at).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Mexico_City' })}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src={match.home_flag} style={{ width: match.competition === 'LIGA_MX' ? 24 : 28, height: match.competition === 'LIGA_MX' ? 24 : 19, objectFit: 'contain', borderRadius: match.competition === 'LIGA_MX' ? 0 : 2 }} />
                        <span style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>{match.home_team}</span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', padding: '2px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: 6 }}>VS</span>
                        <span style={{ fontSize: 12, fontWeight: 500, flex: 1, textAlign: 'right' }}>{match.away_team}</span>
                        <img src={match.away_flag} style={{ width: match.competition === 'LIGA_MX' ? 24 : 28, height: match.competition === 'LIGA_MX' ? 24 : 19, objectFit: 'contain', borderRadius: match.competition === 'LIGA_MX' ? 0 : 2 }} />
                        <Link href={`/predecir?pool=${match.pool_id}&match=${match.id}`} style={{ textDecoration: 'none', marginLeft: 8 }}>
                          <div style={{ background: 'linear-gradient(135deg,#F5B731,#C9930A)', borderRadius: 16, padding: '5px 12px', fontSize: 11, fontWeight: 700, color: '#080C16', whiteSpace: 'nowrap' }}>Predecir</div>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Últimas 2 predicciones con resultado */}
            {lastPredictions.length > 0 && (
              <div style={{ background: '#111520', borderRadius: 14, border: '0.5px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                <div style={{ padding: '8px 14px', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1 }}>🕐 Últimas predicciones</span>
                </div>
                {lastPredictions.map((pred, i) => {
                  const isExact = pred.points_earned === 3
                  const isCorrect = pred.points_earned === 1
                  if (!pred.match) return null
                  return (
                    <div key={pred.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderBottom: i < lastPredictions.length - 1 ? '0.5px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                        <img src={pred.match.home_flag} style={{ width: 26, height: 18, objectFit: 'cover', borderRadius: 2 }} />
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, background: 'rgba(255,255,255,0.05)', padding: '2px 10px', borderRadius: 6 }}>
                          {pred.match.home_score} - {pred.match.away_score}
                        </div>
                        <img src={pred.match.away_flag} style={{ width: 26, height: 18, objectFit: 'cover', borderRadius: 2 }} />
                        <div style={{ marginLeft: 4 }}>
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>Tu pred</div>
                          <div style={{ fontSize: 11, color: '#F5B731', fontWeight: 600 }}>{pred.predicted_home} - {pred.predicted_away}</div>
                        </div>
                      </div>
                      <div style={{ background: isExact ? 'rgba(245,183,49,0.15)' : isCorrect ? 'rgba(0,196,106,0.12)' : 'rgba(107,114,128,0.1)', borderRadius: 8, padding: '4px 10px', textAlign: 'center' }}>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: isExact ? '#F5B731' : isCorrect ? '#00C46A' : 'rgba(255,255,255,0.3)' }}>+{pred.points_earned} pts</div>
                        <div style={{ fontSize: 9, color: isExact ? 'rgba(245,183,49,0.6)' : isCorrect ? 'rgba(0,196,106,0.6)' : 'rgba(255,255,255,0.2)' }}>
                          {isExact ? '¡Exacto!' : isCorrect ? 'Resultado ✓' : 'Sin puntos'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TABLA DE POSICIONES */}
        {approvedPools.length > 0 && (
          <div style={{ marginTop: 20, animation: 'fadeUp 0.3s ease 0.15s both' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              Tabla de posiciones
              <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.07)' }} />
            </div>

            {/* Selector de quiniela */}
            {approvedPools.length > 1 && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
                {approvedPools.map(member => {
                  const theme = getCompTheme(member.pool?.competition || '')
                  const isActive = activeLeaderPoolId === member.pool_id
                  return (
                    <button key={member.pool_id} onClick={() => loadLeaderboard(member.pool_id)} className="leaderboard-tab" style={{
                      padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                      fontFamily: "'Outfit',sans-serif", fontSize: 11, fontWeight: 600, transition: 'all 0.2s',
                      background: isActive ? theme.accentBg : 'rgba(255,255,255,0.04)',
                      color: isActive ? theme.accent : 'rgba(255,255,255,0.35)',
                      outline: isActive ? `1px solid ${theme.accentBorder}` : 'none',
                    }}>
                      {theme.icon} {member.pool?.name}
                    </button>
                  )
                })}
              </div>
            )}

            <div style={{ background: '#111520', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'linear-gradient(135deg,rgba(245,183,49,0.06),transparent)' }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{approvedPools.find(m => m.pool_id === activeLeaderPoolId)?.pool?.name || 'Ranking'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#00C46A' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00C46A', animation: 'pulse 1.5s infinite' }} />
                  EN VIVO
                </div>
              </div>
              {leaderboard.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#6B7280', fontSize: 13 }}>Nadie en el ranking aún</div>
              ) : (
                leaderboard.map((entry, i) => {
                  const isMe = entry.user_id === user.id
                  const rankColors = ['#4FADFF,#7B2FF7', '#F5B731,#C9930A', '#00C46A,#00864A', '#FF4D6D,#7B2FF7', '#4FADFF,#00C46A']
                  return (
                    <div key={entry.user_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < leaderboard.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none', background: isMe ? 'rgba(245,183,49,0.05)' : 'transparent', borderLeft: isMe ? '2px solid #F5B731' : '2px solid transparent' }}>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, width: 28, textAlign: 'center', color: i < 3 ? '#F5B731' : '#6B7280' }}>{i + 1}</div>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg,${rankColors[i % rankColors.length]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: 'white', overflow: 'hidden' }}>
                        {entry.user?.avatar_url
                          ? <img src={entry.user.avatar_url} style={{ width: 36, height: 36, objectFit: 'cover' }} />
                          : entry.user?.emoji || getInitial(entry.user?.name || '?')}
                      </div>
                      <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>
                        {entry.user?.name}
                        {isMe && <span style={{ fontSize: 10, color: '#F5B731', marginLeft: 6 }}>← Tú</span>}
                        {i === 0 && <span style={{ marginLeft: 4 }}>👑</span>}
                      </div>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: i < 3 ? '#F5B731' : '#6B7280' }}>{entry.points}</div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

      </div>
      <BottomNav />
    </div>
  )
}