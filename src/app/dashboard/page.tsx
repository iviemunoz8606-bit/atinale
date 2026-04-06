// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import JoinPoolModal from '@/components/JoinPoolModal'

type User = {
  id: string
  name: string
  email: string
  avatar_url: string | null
  total_points: number
  referral_code: string | null
  is_admin: boolean
}

type Pool = {
  id: string
  name: string
  description: string
  competition: string
  entry_fee: number
  max_participants: number
  current_participants: number
  total_pot: number
  net_prize: number
  platform_commission: number
  status: string
  registration_closes_at: string
  starts_at: string
}

type PoolMember = {
  id: string
  pool_id: string
  points: number
  rank: number | null
  payment_status: string
  pool: Pool
}

type Prediction = {
  id: string
  predicted_home: number
  predicted_away: number
  points_earned: number
  match: {
    home_team: string
    away_team: string
    home_flag: string
    away_flag: string
    scheduled_at: string
    status: string
    home_score: number | null
    away_score: number | null
  }
}

type LeaderboardEntry = {
  user_id: string
  points: number
  rank: number
  user: {
    name: string
    avatar_url: string | null
  }
}

function getInitial(name: string) {
  return name ? name.charAt(0).toUpperCase() : '?'
}

function formatMXN(amount: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN', maximumFractionDigits: 0
  }).format(amount)
}

function timeUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff <= 0) return 'Cerrada'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  if (days > 0) return `${days}d ${hours}h`
  return `${hours}h`
}

function competitionLabel(comp: string) {
  switch (comp) {
    case 'FIFA_2026': return { label: '⚽ Mundial FIFA 2026', color: '#00C46A', bg: 'rgba(0,196,106,0.12)' }
    case 'UEFA_CL':   return { label: '⭐ UEFA Champions',   color: '#4FADFF', bg: 'rgba(79,173,255,0.12)' }
    case 'LIGA_MX':   return { label: '🦅 Liga MX',          color: '#F5B731', bg: 'rgba(245,183,49,0.12)' }
    default:          return { label: comp,                   color: '#6B7280', bg: 'rgba(107,114,128,0.12)' }
  }
}

export default function Dashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [user, setUser]                     = useState<User | null>(null)
  const [pools, setPools]                   = useState<Pool[]>([])
  const [myPools, setMyPools]               = useState<PoolMember[]>([])
  const [recentPredictions, setRecentPredictions] = useState<Prediction[]>([])
  const [leaderboard, setLeaderboard]       = useState<LeaderboardEntry[]>([])
  const [activePoolId, setActivePoolId]     = useState<string | null>(null)
  const [loading, setLoading]               = useState(true)
  const [activeTab, setActiveTab]           = useState<'disponibles' | 'mis-quinielas'>('disponibles')

  // ── Modal de pago ──
  const [modalPool, setModalPool]           = useState<Pool | null>(null)

  useEffect(() => { loadDashboard() }, [])

  async function loadDashboard() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }

      const { data: userData } = await supabase
        .from('users').select('*').eq('id', session.user.id).single()
      if (!userData) { router.push('/registro'); return }
      setUser(userData)

      const { data: poolsData } = await supabase
        .from('pools').select('*').eq('status', 'open')
        .order('starts_at', { ascending: true })
      setPools(poolsData || [])

      const { data: memberData } = await supabase
        .from('pool_members')
        .select('id, pool_id, points, rank, payment_status, pool:pools(*)')
        .eq('user_id', session.user.id)
      setMyPools((memberData as any) || [])

      const { data: predsData } = await supabase
        .from('predictions')
        .select('id, predicted_home, predicted_away, points_earned, match:matches(home_team, away_team, home_flag, away_flag, scheduled_at, status, home_score, away_score)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      setRecentPredictions(predsData || [])

      if (poolsData && poolsData.length > 0) {
        setActivePoolId(poolsData[0].id)
        loadLeaderboard(poolsData[0].id)
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadLeaderboard(poolId: string) {
    const { data } = await supabase
      .from('pool_members')
      .select('user_id, points, rank, user:users(name, avatar_url)')
      .eq('pool_id', poolId)
      .eq('payment_status', 'approved')
      .order('points', { ascending: false })
      .limit(10)
    setLeaderboard(data || [])
    setActivePoolId(poolId)
  }

  // ── Lógica del botón PREDECIR ──
  function handlePredictClick(pool: Pool) {
    const membership = myPools.find(m => m.pool_id === pool.id)

    if (!membership) {
      // No es miembro → abrir modal de pago
      setModalPool(pool)
      return
    }

    if (membership.payment_status === 'approved') {
      // Pago aprobado → ir directo
      router.push(`/quiniela/${pool.id}`)
      return
    }

    // Pago pendiente → avisar
    setModalPool({ ...pool, _pendingOnly: true } as any)
  }

  // ── Cerrar modal y recargar membresías ──
  async function handleModalSuccess() {
    setModalPool(null)
    // Recargar myPools para que el estado se actualice
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data: memberData } = await supabase
      .from('pool_members')
      .select('id, pool_id, points, rank, payment_status, pool:pools(*)')
      .eq('user_id', session.user.id)
    setMyPools((memberData as any) || [])
  }

  // ── Loading ──
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0D12', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(245,183,49,0.2)', borderTopColor: '#F5B731', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#6B7280', fontSize: 14 }}>Cargando tu dashboard...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!user) return null

  const myRank        = myPools.length > 0 ? Math.min(...myPools.map(m => m.rank || 999)) : null
  const totalMyPoints = user.total_points || 0

  return (
    <div style={{ background: '#0A0D12', minHeight: '100vh', fontFamily: "'Outfit','Helvetica Neue',sans-serif", color: '#F0F2F8' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0D12; }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse   { 0%,100% { opacity:1; transform:scale(1) } 50% { opacity:.5; transform:scale(1.4) } }
        @keyframes shimmer { 0% { left:-100% } 100% { left:200% } }
        @keyframes spin    { to { transform:rotate(360deg) } }
        .pool-card:hover  { transform:translateY(-2px) !important; border-color:rgba(245,183,49,0.3) !important; }
        .pred-card:hover  { background:rgba(255,255,255,0.03) !important; }
        .btn-predict:hover { transform:scale(1.04); box-shadow:0 6px 20px rgba(245,183,49,0.45) !important; }
        .tab-btn:hover    { background:rgba(255,255,255,0.06) !important; }
      `}</style>

      {/* ── MODAL DE PAGO ── */}
      {modalPool && !(modalPool as any)._pendingOnly && (
        <JoinPoolModal
          pool={modalPool}
          userId={user.id}
          userEmail={user.email}
          userName={user.name}
          onClose={() => setModalPool(null)}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* ── MODAL PAGO PENDIENTE ── */}
      {modalPool && (modalPool as any)._pendingOnly && (
        <div
          onClick={() => setModalPool(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 480, background: '#111520', borderRadius: '24px 24px 0 0', padding: '32px 24px 48px', border: '1px solid rgba(245,183,49,0.2)', borderBottom: 'none', textAlign: 'center' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>⏳</div>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', color: '#F5B731', letterSpacing: '0.05em', marginBottom: 8 }}>
              PAGO EN REVISIÓN
            </h2>
            <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.7 }}>
              Tu comprobante ya fue enviado.<br />
              Estamos validando tu pago — en menos de 24 horas quedas activo.
            </p>
            <button
              onClick={() => setModalPool(null)}
              style={{ marginTop: 24, width: '100%', padding: 14, borderRadius: 12, background: 'rgba(245,183,49,0.1)', color: '#F5B731', fontFamily: 'Bebas Neue', fontSize: '1rem', letterSpacing: '0.1em', border: '1px solid rgba(245,183,49,0.3)', cursor: 'pointer' }}
            >
              ENTENDIDO
            </button>
          </div>
        </div>
      )}

      {/* ── TOPBAR ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'rgba(10,13,18,0.90)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: 2, background: 'linear-gradient(135deg,#F5B731,#00C46A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ATÍNALE
          </div>
          {/* Botón admin — solo visible si is_admin */}
          {user.is_admin && (
            <Link href="/admin" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(245,183,49,0.12)', border: '1px solid rgba(245,183,49,0.3)', color: '#F5B731', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
                ⚙️ ADMIN
              </div>
            </Link>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{user.name}</div>
            <div style={{ fontSize: 11, color: '#F5B731' }}>⚽ {totalMyPoints} pts totales</div>
          </div>
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid rgba(245,183,49,0.3)', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#F5B731,#00C46A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#0A0D12', border: '2px solid rgba(245,183,49,0.3)' }}>
              {getInitial(user.name)}
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
            { label: 'Mis puntos', value: totalMyPoints,             color: '#F5B731', sub: myPools.length > 0 ? `${myPools.length} quiniela${myPools.length > 1 ? 's' : ''}` : 'Sin quinielas' },
            { label: 'Posición',   value: myRank ? `#${myRank}` : '—', color: '#00C46A', sub: myPools.length > 0 ? 'mejor ranking' : 'únete ya' },
            { label: 'Quinielas',  value: myPools.length,             color: '#4FADFF', sub: 'activas' },
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
            <button key={tab} className="tab-btn" onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 13, background: activeTab === tab ? 'linear-gradient(135deg,#F5B731,#C9930A)' : 'rgba(255,255,255,0.04)', color: activeTab === tab ? '#0A0D12' : '#6B7280', transition: 'all 0.2s' }}>
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
                const comp      = competitionLabel(pool.competition)
                // ── Fix total_pot: usar participantes × entrada si total_pot es 0 ──
                const pot       = pool.total_pot > 0 ? pool.total_pot : pool.current_participants * pool.entry_fee
                const netPrize  = Math.round(pot * 0.9)
                const commission = Math.round(pot * 0.1)
                const fillPct   = Math.min(100, (pool.current_participants / pool.max_participants) * 100)
                const membership = myPools.find(m => m.pool_id === pool.id)
                const isMember  = !!membership
                const isPending = membership?.payment_status === 'pending'
                const isApproved = membership?.payment_status === 'approved'

                return (
                  <div key={pool.id} className="pool-card" style={{ background: '#111520', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, overflow: 'hidden', marginBottom: 14, animation: `fadeUp 0.5s ease ${0.1 + i * 0.08}s both`, transition: 'transform 0.2s, border-color 0.2s' }}>

                    {/* Header */}
                    <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, background: `linear-gradient(135deg,${comp.bg},transparent)`, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: `linear-gradient(135deg,${comp.color},${comp.color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🏆</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{pool.name}</div>
                        <div style={{ fontSize: 11, color: comp.color, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>{comp.label}</div>
                      </div>
                      <div style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: pool.status === 'open' ? 'rgba(0,196,106,0.15)' : 'rgba(245,183,49,0.15)', color: pool.status === 'open' ? '#00C46A' : '#F5B731', border: `1px solid ${pool.status === 'open' ? 'rgba(0,196,106,0.3)' : 'rgba(245,183,49,0.3)'}` }}>
                        {pool.status === 'open' ? 'Abierta' : 'Próximo'}
                      </div>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '14px 16px' }}>
                      {/* Pozo */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{ fontSize: 11, color: '#6B7280' }}>💰 Pozo en tiempo real</div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: '#F5B731', lineHeight: 1 }}>
                            {formatMXN(pot)}
                          </div>
                          <div style={{ fontSize: 11, color: '#00C46A' }}>Premio neto: {formatMXN(netPrize)}</div>
                          <div style={{ fontSize: 10, color: '#6B7280' }}>Comisión plataforma: {formatMXN(commission)} (10%)</div>
                        </div>
                      </div>

                      {/* Barra participantes */}
                      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 4, height: 4, marginBottom: 6, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 4, width: `${fillPct}%`, background: 'linear-gradient(90deg,#00C46A,#F5B731)', position: 'relative', overflow: 'hidden', transition: 'width 1s ease' }}>
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
                        <span style={{ color: '#FF4D6D', fontWeight: 600 }}>{timeUntil(pool.registration_closes_at)}</span>
                        <span style={{ color: '#6B7280', marginLeft: 'auto', fontSize: 10 }}>
                          {new Date(pool.registration_closes_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>

                    {/* Footer con botón inteligente */}
                    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>
                        {isApproved  && '✅ Ya participas'}
                        {isPending   && '⏳ Pago en revisión'}
                        {!isMember   && `${pool.max_participants - pool.current_participants} lugares disponibles`}
                      </div>

                      <button
                        className="btn-predict"
                        onClick={() => handlePredictClick(pool)}
                        style={{
                          padding: '9px 20px', borderRadius: 20, border: 'none', cursor: 'pointer',
                          fontWeight: 700, fontSize: 13, fontFamily: "'Outfit',sans-serif",
                          transition: 'all 0.15s',
                          boxShadow: isApproved ? '0 4px 15px rgba(0,196,106,0.3)' : isPending ? 'none' : '0 4px 15px rgba(245,183,49,0.3)',
                          background: isApproved
                            ? 'linear-gradient(135deg,#00C46A,#00864A)'
                            : isPending
                              ? 'rgba(245,183,49,0.1)'
                              : 'linear-gradient(135deg,#F5B731,#C9930A)',
                          color: isPending ? '#F5B731' : '#0A0D12',
                        }}
                      >
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
                <button onClick={() => setActiveTab('disponibles')} style={{ marginTop: 12, padding: '10px 20px', borderRadius: 20, background: 'linear-gradient(135deg,#F5B731,#C9930A)', color: '#0A0D12', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
                  Ver quinielas disponibles
                </button>
              </div>
            ) : (
              myPools.map((member, i) => (
                <div key={member.id} style={{ background: '#111520', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 16, marginBottom: 12, animation: `fadeUp 0.4s ease ${i * 0.06}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{member.pool?.name}</div>
                    <div style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, background: member.payment_status === 'approved' ? 'rgba(0,196,106,0.15)' : 'rgba(245,183,49,0.15)', color: member.payment_status === 'approved' ? '#00C46A' : '#F5B731' }}>
                      {member.payment_status === 'approved' ? '✅ Pagado' : '⏳ Pendiente'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 10, color: '#6B7280' }}>MIS PUNTOS</div>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: '#F5B731' }}>{member.points}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: '#6B7280' }}>POSICIÓN</div>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: '#00C46A' }}>{member.rank ? `#${member.rank}` : '—'}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                      {member.payment_status === 'approved' ? (
                        <Link href={`/quiniela/${member.pool_id}`} style={{ textDecoration: 'none' }}>
                          <button style={{ padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', background: 'rgba(0,196,106,0.15)', color: '#00C46A', fontWeight: 600, fontSize: 13 }}>
                            Ver →
                          </button>
                        </Link>
                      ) : (
                        <span style={{ fontSize: 12, color: '#F5B731' }}>⏳ Validando</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
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
              const isExact   = pred.points_earned === 3
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
                {pools.map(pool => (
                  <button key={pool.id} onClick={() => loadLeaderboard(pool.id)} style={{ padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', background: activePoolId === pool.id ? 'rgba(245,183,49,0.15)' : 'rgba(255,255,255,0.04)', color: activePoolId === pool.id ? '#F5B731' : '#6B7280', fontSize: 12, fontWeight: 600 }}>
                    {pool.name}
                  </button>
                ))}
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
                <div style={{ padding: 32, textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
                  Nadie en el ranking aún — ¡sé el primero!
                </div>
              ) : (
                leaderboard.map((entry, i) => {
                  const isMe = entry.user_id === user.id
                  const avatarColors = ['#4FADFF,#7B2FF7','#F5B731,#C9930A','#00C46A,#00864A','#FF4D6D,#7B2FF7','#4FADFF,#00C46A']
                  return (
                    <div key={entry.user_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < leaderboard.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none', background: isMe ? 'rgba(245,183,49,0.05)' : 'transparent', borderLeft: isMe ? '2px solid #F5B731' : '2px solid transparent' }}>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, width: 28, textAlign: 'center', color: i < 3 ? '#F5B731' : '#6B7280' }}>{i + 1}</div>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg,${avatarColors[i % avatarColors.length]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: isMe ? '#0A0D12' : 'white' }}>
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
          { icon: '⚽', label: 'Quinielas', href: '/quinielas', active: false },
          { icon: '🎯', label: 'Predecir',  href: '/quinielas', active: false },
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