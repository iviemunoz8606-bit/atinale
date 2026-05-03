// @ts-nocheck
'use client'

import { useEffect, useState, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Loading from '@/app/loading'
import BottomNav from '@/components/BottomNav'

function LiveDot() {
  return (
    <span style={{
      display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
      background: '#E24B4A', flexShrink: 0,
      animation: 'blink 1s ease-in-out infinite',
    }} />
  )
}

function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : '?'
}

function getDisplayName(u) {
  return u?.alias || u?.name?.split(' ')[0] || 'Jugador'
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('es-MX', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Mexico_City'
  })
}

export default function Ranking() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const channelRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [filter, setFilter] = useState('top')
  const [myPools, setMyPools] = useState([])
  const [activePool, setActivePool] = useState(null)
  const [poolView, setPoolView] = useState<'partidos' | 'ranking'>('ranking')
  const [poolMembers, setPoolMembers] = useState([])
  const [poolMatches, setPoolMatches] = useState([])
  const [allPredictions, setAllPredictions] = useState([])
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)
  const [loadingPool, setLoadingPool] = useState(false)
  const [realtimeFlash, setRealtimeFlash] = useState(false)

  const activePoolRef = useRef(null)
  const currentUserIdRef = useRef(null)

  useEffect(() => { init() }, [])

  useEffect(() => {
    activePoolRef.current = activePool
  }, [activePool])

  useEffect(() => {
    currentUserIdRef.current = currentUserId
  }, [currentUserId])

  useEffect(() => {
    if (myPools.length === 0) return
    const params = new URLSearchParams(window.location.search)
    const poolId = params.get('pool')
    if (poolId) {
      const found = myPools.find(m => m.pool?.id === poolId)
      if (found) loadPoolData(found.pool)
    }
  }, [myPools])

  // Limpiar canal al salir
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    setCurrentUserId(user.id)
    currentUserIdRef.current = user.id

    await loadGlobalRanking(user.id)

    const { data: memberData } = await supabase
      .from('pool_members')
      .select('pool_id, points, rank, pool:pools(id, name, competition, entry_fee, total_pot, current_participants, round_filter)')
      .eq('user_id', user.id)
      .eq('payment_status', 'approved')

    setMyPools(memberData || [])
    setLoading(false)

    // Iniciar Realtime
    setupRealtime()
  }

  async function loadGlobalRanking(userId?) {
    const uid = userId || currentUserIdRef.current
    const { data: usersData } = await supabase
      .from('users')
      .select('id, name, alias, emoji, avatar_url, total_points')
      .order('total_points', { ascending: false })
      .limit(100)

    if (usersData) {
      const ranked = usersData.map((u, i) => ({ ...u, rank: i + 1 }))
      setUsers(ranked)
      const me = ranked.find(u => u.id === uid)
      if (me) setCurrentUser(me)
    }
  }

  async function loadPoolData(pool) {
    setLoadingPool(true)
    setActivePool(pool)
    activePoolRef.current = pool
    setExpandedMatch(null)

    const { data: members } = await supabase
      .from('pool_members')
      .select('user_id, points')
      .eq('pool_id', pool.id)
      .eq('payment_status', 'approved')
      .order('points', { ascending: false })

    const userIds = (members || []).map(m => m.user_id)
    const { data: usersData } = await supabase
      .from('users')
      .select('id, name, alias, emoji, avatar_url')
      .in('id', userIds)

    const ranked = (members || []).map((m, i) => ({
      ...m,
      poolRank: i + 1,
      users: usersData?.find(u => u.id === m.user_id) || null
    }))
    setPoolMembers(ranked)

    let matchQuery = supabase
      .from('matches')
      .select('*')
      .eq('competition', pool.competition)
      .order('scheduled_at', { ascending: true })

    if (pool.round_filter) {
      matchQuery = matchQuery.eq('round', pool.round_filter)
    }

    const { data: matchesData } = await matchQuery
    setPoolMatches(matchesData || [])

    const liveOrFinished = (matchesData || [])
      .filter(m => m.status === 'live' || m.status === 'finished')
      .map(m => m.id)

    if (liveOrFinished.length > 0) {
      const { data: preds } = await supabase
        .from('predictions')
        .select('match_id, user_id, predicted_home, predicted_away, points_earned')
        .eq('pool_id', pool.id)
        .in('match_id', liveOrFinished)
      setAllPredictions(preds || [])
    } else {
      setAllPredictions([])
    }

    setLoadingPool(false)
  }

  function setupRealtime() {
    // Cancelar canal anterior si existe
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    const channel = supabase
      .channel('ranking-realtime')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'pool_members',
      }, async () => {
        // Flash visual para indicar actualización
        setRealtimeFlash(true)
        setTimeout(() => setRealtimeFlash(false), 800)

        // Recargar ranking global siempre
        await loadGlobalRanking()

        // Si hay una quiniela activa, recargarla también
        if (activePoolRef.current) {
          await loadPoolData(activePoolRef.current)
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches',
      }, async () => {
        // Si hay quiniela activa, recargar partidos para ver marcadores en vivo
        if (activePoolRef.current) {
          await loadPoolData(activePoolRef.current)
        }
      })
      .subscribe()

    channelRef.current = channel
  }

  function backToGlobal() {
    setActivePool(null)
    activePoolRef.current = null
    setPoolMembers([])
    setPoolMatches([])
    setAllPredictions([])
    setExpandedMatch(null)
  }

  function getList() {
    if (filter === 'top') return users.slice(0, 10)
    if (filter === 'vecinos') {
      const mi = users.findIndex(u => u.id === currentUserId)
      if (mi === -1) return users.slice(0, 5)
      const s = Math.max(0, mi - 2)
      const e = Math.min(users.length, mi + 3)
      return users.slice(s, e)
    }
    return users
  }

  const podioColors  = ['#9CA3AF', '#F5B731', '#CD7F32']
  const podioBorders = ['rgba(107,114,128,0.4)', 'rgba(245,183,49,0.8)', 'rgba(205,127,50,0.5)']
  const podioHeights = [38, 54, 26]
  const podioSizes   = [52, 64, 48]
  const podioOrder   = [1, 0, 2]

  if (loading) return <Loading />

  const list   = getList()
  const myRank = currentUser?.rank ?? null
  const myPts  = currentUser?.total_points ?? 0
  const top3   = users.slice(0, 3)
  const top3Pool = poolMembers.slice(0, 3)
  const myPoolMember = poolMembers.find(m => m.user_id === currentUserId)

  function compColor(comp) {
    if (comp === 'FIFA_2026') return '#00C46A'
    if (comp === 'LIGA_MX') return '#E8192C'
    if (comp === 'UEFA_CL') return '#4FADFF'
    return '#6B7280'
  }

  function getPredictionsForMatch(matchId) {
    return allPredictions.filter(p => p.match_id === matchId)
  }

  function getMatchEmoji(match, pred) {
    if (match.home_score === null || pred === undefined) return null
    const realResult = match.home_score > match.away_score ? 'home' : match.away_score > match.home_score ? 'away' : 'draw'
    const predResult = pred.predicted_home > pred.predicted_away ? 'home' : pred.predicted_away > pred.predicted_home ? 'away' : 'draw'
    if (pred.predicted_home === match.home_score && pred.predicted_away === match.away_score) return '🎯'
    if (predResult === realResult) return '✅'
    return '❌'
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600&display=swap');
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes flashGreen { 0%{background:rgba(0,196,106,0.15)} 100%{background:transparent} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }
        html { scrollbar-width: none; }
        .pool-chip { cursor:pointer; transition:all .2s; border:none; font-family:'Outfit',sans-serif; white-space:nowrap; }
        .pool-chip:hover { opacity:.85; }
        .ver-btn { width:100%; padding:7px; border:none; border-top:0.5px solid rgba(255,255,255,.07); background:rgba(255,255,255,.03); color:rgba(255,255,255,.35); font-size:11px; cursor:pointer; font-family:'Outfit',sans-serif; transition:all .2s; }
        .ver-btn:hover { background:rgba(255,255,255,.06); color:rgba(255,255,255,.7); }
        .tab-view { padding:7px 0; border-radius:20px; font-size:12px; cursor:pointer; border:none; font-family:'Outfit',sans-serif; transition:all .2s; flex:1; }
        .realtime-flash { animation: flashGreen 0.8s ease both; }
      `}</style>

      <div style={{ background: '#080C16', minHeight: '100vh', color: '#fff', fontFamily: "'Outfit', sans-serif", paddingBottom: 90 }}>

        {/* TOPBAR */}
        <div style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px 12px', background: 'rgba(8,12,22,0.96)', backdropFilter: 'blur(20px)', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
          {activePool ? (
            <button onClick={backToGlobal} style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', cursor: 'pointer' }}>←</button>
          ) : (
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', cursor: 'pointer' }}>←</div>
            </Link>
          )}
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 3, background: 'linear-gradient(90deg,#C9930A,#F5B731,#fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {activePool ? activePool.name : 'RANKING GLOBAL'}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 1 }}>
              {activePool ? `${activePool.competition === 'LIGA_MX' ? '🦅 Liga MX' : '🌍 FIFA 2026'} · ${poolMembers.length} participantes` : 'Puntos acumulados entre todas las quinielas'}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
            <LiveDot />
            <span style={{ fontSize: 10, color: realtimeFlash ? '#00C46A' : '#E24B4A', fontWeight: 600, letterSpacing: 1, transition: 'color 0.3s' }}>
              {realtimeFlash ? 'ACTUALIZADO' : 'EN VIVO'}
            </span>
          </div>
        </div>

        <div style={{ maxWidth: 480, margin: '0 auto' }}>

          {/* ── VISTA GLOBAL ── */}
          {!activePool && (
            <>
              {currentUser && (
                <div className={realtimeFlash ? 'realtime-flash' : ''} style={{ margin: '12px 16px 0', background: 'rgba(79,173,255,0.05)', border: '1px solid rgba(79,173,255,0.2)', borderRadius: 13, padding: '11px 13px', animation: 'fadeUp 0.3s ease both' }}>
                  <div style={{ fontSize: 9, color: '#4FADFF', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 7 }}>📍 Tu posición</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: '#4FADFF', lineHeight: 1 }}>{myRank}</div>
                      <div style={{ fontSize: 9, color: 'rgba(79,173,255,.4)', textTransform: 'uppercase', letterSpacing: 1 }}>de {users.length}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{currentUser.emoji || ''} {getDisplayName(currentUser)}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>Puntos acumulados globales</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: '#4FADFF', lineHeight: 1 }}>{myPts}</div>
                      <div style={{ fontSize: 9, color: 'rgba(79,173,255,.4)' }}>puntos</div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 6, padding: '10px 16px 6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {(['top', 'vecinos', 'todos'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)} className="pool-chip" style={{
                    padding: '5px 14px', borderRadius: 20, fontSize: 11, flexShrink: 0,
                    background: filter === f ? '#F5B731' : 'transparent',
                    color: filter === f ? '#080C16' : 'rgba(255,255,255,.35)',
                    border: `0.5px solid ${filter === f ? '#F5B731' : 'rgba(255,255,255,.1)'}`,
                    fontWeight: filter === f ? 700 : 400,
                  }}>
                    {f === 'top' ? 'Top 10' : f === 'vecinos' ? 'Mis vecinos' : `Todos (${users.length})`}
                  </button>
                ))}
                {myPools.map(m => {
                  const pool = m.pool
                  const color = compColor(pool?.competition)
                  return (
                    <button key={pool?.id} onClick={() => loadPoolData(pool)} className="pool-chip" style={{
                      padding: '5px 14px', borderRadius: 20, fontSize: 11, flexShrink: 0,
                      background: `rgba(${pool?.competition === 'LIGA_MX' ? '232,25,44' : pool?.competition === 'FIFA_2026' ? '0,196,106' : '79,173,255'},.15)`,
                      color, border: `0.5px solid ${color}`, fontWeight: 600,
                    }}>
                      {pool?.competition === 'LIGA_MX' ? '🦅' : '🌍'} {pool?.name}
                    </button>
                  )
                })}
              </div>

              {filter === 'top' && top3.length >= 3 && (
                <div style={{ padding: '12px 16px 4px', animation: 'fadeUp 0.4s ease both' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10 }}>
                    {podioOrder.map((pi, vi) => {
                      const u = top3[pi]
                      if (!u) return null
                      return (
                        <div key={pi} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                          <div style={{ position: 'relative', marginBottom: 5 }}>
                            {vi === 1 && <span style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontSize: 14 }}>👑</span>}
                            <div style={{ width: podioSizes[vi], height: podioSizes[vi], borderRadius: '50%', border: `2px solid ${podioBorders[vi]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.05)', overflow: 'hidden' }}>
                              {u.emoji ? <span style={{ fontSize: podioSizes[vi] * 0.42 }}>{u.emoji}</span>
                                : u.avatar_url ? <img src={u.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <span style={{ fontWeight: 700, fontSize: podioSizes[vi] * 0.35, color: podioColors[vi] }}>{getInitial(u.name)}</span>}
                            </div>
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,.85)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 80, textOverflow: 'ellipsis', marginBottom: 1 }}>{getDisplayName(u)}</div>
                          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, color: podioColors[vi], marginBottom: 4 }}>{u.total_points || 0}</div>
                          <div style={{ width: '100%', height: podioHeights[vi], borderRadius: '5px 5px 0 0', background: vi === 1 ? 'rgba(245,183,49,.18)' : vi === 0 ? 'rgba(156,163,175,.12)' : 'rgba(205,127,50,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: podioColors[vi] }}>
                            {pi + 1}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {filter === 'vecinos' && myRank && myRank > 3 && (
                <div style={{ padding: '7px 14px', fontSize: 10, color: 'rgba(79,173,255,.4)', background: 'rgba(79,173,255,.03)', borderTop: '0.5px solid rgba(79,173,255,.1)', borderBottom: '0.5px solid rgba(79,173,255,.1)', textAlign: 'center' }}>
                  · · · {myRank - 3} jugadores arriba · · ·
                </div>
              )}

              <div style={{ display: 'flex', padding: '5px 16px', margin: '4px 0 0', fontSize: 9, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '0.5px solid rgba(255,255,255,.05)' }}>
                <span style={{ width: 30 }}>#</span>
                <span style={{ flex: 1 }}>Jugador</span>
                <span style={{ width: 44, textAlign: 'right' }}>Pts</span>
              </div>

              <div style={{ animation: 'fadeUp 0.5s ease 0.1s both' }}>
                {users.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,.25)' }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>🏆</div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>Nadie en el ranking aún</div>
                    <div style={{ fontSize: 13 }}>¡Sé el primero en predecir y ganar puntos!</div>
                  </div>
                ) : (
                  list.map(u => {
                    const isMe = u.id === currentUserId
                    const rankColor = u.rank === 1 ? '#F5B731' : u.rank === 2 ? '#9CA3AF' : u.rank === 3 ? '#CD7F32' : 'rgba(255,255,255,.28)'
                    return (
                      <div key={u.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: '0.5px solid rgba(255,255,255,.05)', background: isMe ? 'rgba(79,173,255,.04)' : 'transparent', borderLeft: isMe ? '2px solid #4FADFF' : '2px solid transparent' }}>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, width: 30, flexShrink: 0, color: rankColor }}>{u.rank}</div>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, marginRight: 10, background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: 18 }}>
                          {u.emoji ? u.emoji : u.avatar_url ? <img src={u.avatar_url} style={{ width: 32, height: 32, objectFit: 'cover' }} /> : <span style={{ fontWeight: 700, fontSize: 12, color: '#F5B731' }}>{getInitial(u.name)}</span>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {getDisplayName(u)}
                            {isMe && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'rgba(79,173,255,.15)', color: '#4FADFF', border: '0.5px solid rgba(79,173,255,.25)', flexShrink: 0 }}>tú</span>}
                          </div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', marginTop: 1 }}>
                            {u.rank === 1 ? '🔥 Líder actual' : u.rank <= 3 ? '⭐ Top 3' : `Posición #${u.rank}`}
                          </div>
                        </div>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: rankColor, minWidth: 44, textAlign: 'right' }}>{u.total_points || 0}</div>
                      </div>
                    )
                  })
                )}
              </div>

              <div style={{ margin: '14px 16px', padding: '10px 14px', background: 'rgba(245,183,49,0.04)', border: '0.5px solid rgba(245,183,49,0.12)', borderRadius: 10, fontSize: 11, color: 'rgba(255,255,255,.25)', textAlign: 'center' }}>
                Puntos acumulados entre todas las quinielas en las que hayas participado
              </div>
            </>
          )}

          {/* ── VISTA QUINIELA ── */}
          {activePool && (
            <>
              {loadingPool ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,.3)' }}>Cargando...</div>
              ) : (
                <div style={{ animation: 'fadeUp 0.3s ease both', padding: '12px 16px 0' }}>

                  {myPoolMember && (
                    <div className={realtimeFlash ? 'realtime-flash' : ''} style={{ background: 'rgba(79,173,255,0.05)', border: '1px solid rgba(79,173,255,0.2)', borderRadius: 13, padding: '11px 13px', marginBottom: 12 }}>
                      <div style={{ fontSize: 9, color: '#4FADFF', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 7 }}>📍 Tu posición · {activePool.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div>
                          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: '#4FADFF', lineHeight: 1 }}>{myPoolMember.poolRank}</div>
                          <div style={{ fontSize: 9, color: 'rgba(79,173,255,.4)', textTransform: 'uppercase', letterSpacing: 1 }}>de {poolMembers.length}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{currentUser?.emoji || ''} {getDisplayName(currentUser || {})}</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>Puntos en esta quiniela</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: '#4FADFF', lineHeight: 1 }}>{myPoolMember.points || 0}</div>
                          <div style={{ fontSize: 9, color: 'rgba(79,173,255,.4)' }}>puntos</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                    <button className="tab-view" onClick={() => setPoolView('ranking')} style={{ background: poolView === 'ranking' ? '#F5B731' : 'rgba(255,255,255,.06)', color: poolView === 'ranking' ? '#080C16' : 'rgba(255,255,255,.4)', fontWeight: poolView === 'ranking' ? 700 : 400 }}>🏆 Ranking</button>
                    <button className="tab-view" onClick={() => setPoolView('partidos')} style={{ background: poolView === 'partidos' ? '#F5B731' : 'rgba(255,255,255,.06)', color: poolView === 'partidos' ? '#080C16' : 'rgba(255,255,255,.4)', fontWeight: poolView === 'partidos' ? 700 : 400 }}>⚽ Partidos</button>
                  </div>

                  {poolView === 'ranking' && (
                    <>
                      {top3Pool.length >= 3 && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10 }}>
                            {podioOrder.map((pi, vi) => {
                              const m = top3Pool[pi]
                              if (!m) return null
                              const u = m.users
                              return (
                                <div key={pi} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                  <div style={{ position: 'relative', marginBottom: 5 }}>
                                    {vi === 1 && <span style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontSize: 14 }}>👑</span>}
                                    <div style={{ width: podioSizes[vi], height: podioSizes[vi], borderRadius: '50%', border: `2px solid ${podioBorders[vi]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.05)', overflow: 'hidden' }}>
                                      {u?.emoji ? <span style={{ fontSize: podioSizes[vi] * 0.42 }}>{u.emoji}</span>
                                        : u?.avatar_url ? <img src={u.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        : <span style={{ fontWeight: 700, fontSize: podioSizes[vi] * 0.35, color: podioColors[vi] }}>{getInitial(u?.name)}</span>}
                                    </div>
                                  </div>
                                  <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,.85)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 80, textOverflow: 'ellipsis', marginBottom: 1 }}>{getDisplayName(u || {})}</div>
                                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, color: podioColors[vi], marginBottom: 4 }}>{m.points || 0}</div>
                                  <div style={{ width: '100%', height: podioHeights[vi], borderRadius: '5px 5px 0 0', background: vi === 1 ? 'rgba(245,183,49,.18)' : vi === 0 ? 'rgba(156,163,175,.12)' : 'rgba(205,127,50,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: podioColors[vi] }}>
                                    {pi + 1}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', padding: '5px 4px', margin: '4px 0 0', fontSize: 9, color: 'rgba(255,255,255,.2)', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '0.5px solid rgba(255,255,255,.05)' }}>
                        <span style={{ width: 30 }}>#</span>
                        <span style={{ flex: 1 }}>Jugador</span>
                        <span style={{ width: 44, textAlign: 'right' }}>Pts</span>
                      </div>

                      {poolMembers.map(m => {
                        const u = m.users
                        const isMe = m.user_id === currentUserId
                        const rankColor = m.poolRank === 1 ? '#F5B731' : m.poolRank === 2 ? '#9CA3AF' : m.poolRank === 3 ? '#CD7F32' : 'rgba(255,255,255,.28)'
                        return (
                          <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', padding: '10px 4px', borderBottom: '0.5px solid rgba(255,255,255,.05)', background: isMe ? 'rgba(79,173,255,.04)' : 'transparent', borderLeft: isMe ? '2px solid #4FADFF' : '2px solid transparent', paddingLeft: isMe ? 6 : 4 }}>
                            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, width: 30, flexShrink: 0, color: rankColor }}>{m.poolRank}</div>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, marginRight: 10, background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: 18 }}>
                              {u?.emoji ? u.emoji : u?.avatar_url ? <img src={u.avatar_url} style={{ width: 32, height: 32, objectFit: 'cover' }} /> : <span style={{ fontWeight: 700, fontSize: 12, color: '#F5B731' }}>{getInitial(u?.name)}</span>}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 4 }}>
                                {getDisplayName(u || {})}
                                {isMe && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'rgba(79,173,255,.15)', color: '#4FADFF', border: '0.5px solid rgba(79,173,255,.25)', flexShrink: 0 }}>tú</span>}
                              </div>
                              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', marginTop: 1 }}>
                                {m.poolRank === 1 ? '🔥 Líder' : m.poolRank <= 3 ? '⭐ Top 3' : `Posición #${m.poolRank}`}
                              </div>
                            </div>
                            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: rankColor, minWidth: 44, textAlign: 'right' }}>{m.points || 0}</div>
                          </div>
                        )
                      })}

                      <div style={{ margin: '12px 0', padding: '10px 14px', background: 'rgba(245,183,49,0.04)', border: '0.5px solid rgba(245,183,49,0.12)', borderRadius: 10, fontSize: 11, color: 'rgba(255,255,255,.25)', textAlign: 'center' }}>
                        Pozo: ${((activePool.total_pot || 0) * 0.9).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} neto · {poolMembers.length} participantes
                      </div>
                    </>
                  )}

                  {poolView === 'partidos' && (
                    <div>
                      {poolMatches.map(match => {
                        const isLive = match.status === 'live'
                        const isFinished = match.status === 'finished'
                        const isOpen = expandedMatch === match.id
                        const preds = getPredictionsForMatch(match.id)
                        const borderColor = isLive ? '#ff4d4d' : isFinished ? '#00C46A' : 'rgba(255,255,255,.08)'
                        const statusLabel = isLive ? '🔴 En vivo' : isFinished ? '✅ Final' : null

                        return (
                          <div key={match.id} style={{ background: '#111520', borderRadius: 10, marginBottom: 8, overflow: 'hidden', borderLeft: `3px solid ${borderColor}`, opacity: (!isLive && !isFinished) ? 0.6 : 1 }}>
                            <div style={{ padding: '7px 10px', display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,.3)' }}>
                              <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{formatDate(match.scheduled_at)}</span>
                              {statusLabel && <span style={{ fontSize: 10, color: isLive ? '#ff4d4d' : '#00C46A', fontWeight: 700 }}>{statusLabel}</span>}
                            </div>

                            <div style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                                {match.home_flag && <img src={match.home_flag} style={{ width: 24, height: 24, objectFit: 'contain' }} />}
                                <span style={{ fontSize: 12, fontWeight: 600 }}>{match.home_team}</span>
                              </div>
                              {(isLive || isFinished) ? (
                                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: isLive ? '#ff4d4d' : '#00C46A', background: isLive ? 'rgba(255,77,77,.1)' : 'rgba(0,196,106,.1)', padding: '2px 12px', borderRadius: 8 }}>
                                  {match.home_score} - {match.away_score}
                                </div>
                              ) : (
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.2)' }}>vs</div>
                              )}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, flex: 1 }}>
                                <span style={{ fontSize: 12, fontWeight: 600 }}>{match.away_team}</span>
                                {match.away_flag && <img src={match.away_flag} style={{ width: 24, height: 24, objectFit: 'contain' }} />}
                              </div>
                            </div>

                            {isOpen && (isLive || isFinished) && (
                              <div style={{ padding: '0 8px 8px' }}>
                                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.2)', letterSpacing: 1, padding: '4px 0 4px', textTransform: 'uppercase' }}>Predicciones del grupo</div>
                                {poolMembers.map(m => {
                                  const u = m.users
                                  const pred = preds.find(p => p.user_id === m.user_id)
                                  const isMe = m.user_id === currentUserId
                                  const emoji = pred ? getMatchEmoji(match, pred) : null
                                  const pts = (() => {
                                    if (!pred || match.home_score === null) return 0
                                    const realResult = match.home_score > match.away_score ? 'home' : match.away_score > match.home_score ? 'away' : 'draw'
                                    const predResult = pred.predicted_home > pred.predicted_away ? 'home' : pred.predicted_away > pred.predicted_home ? 'away' : 'draw'
                                    if (pred.predicted_home === match.home_score && pred.predicted_away === match.away_score) return 3
                                    if (predResult === realResult) return 1
                                    return 0
                                  })()
                                  return (
                                    <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderTop: '0.5px solid rgba(255,255,255,.05)', opacity: pred ? 1 : 0.35 }}>
                                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: isMe ? 'rgba(245,183,49,.15)' : 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>
                                        {u?.emoji || '⚽'}
                                      </div>
                                      <span style={{ fontSize: 12, flex: 1, color: isMe ? '#F5B731' : 'rgba(255,255,255,.7)', fontWeight: isMe ? 600 : 400 }}>
                                        {getDisplayName(u || {})}
                                      </span>
                                      {pred ? (
                                        <>
                                          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: isMe ? '#F5B731' : 'rgba(255,255,255,.4)' }}>
                                            {pred.predicted_home} - {pred.predicted_away}
                                          </span>
                                          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: pts === 3 ? 'rgba(245,183,49,.12)' : pts === 1 ? 'rgba(0,196,106,.12)' : 'rgba(255,255,255,.05)', color: pts === 3 ? '#F5B731' : pts === 1 ? '#00C46A' : '#555' }}>
                                            {emoji} {pts > 0 ? `+${pts}` : '0'}
                                          </span>
                                        </>
                                      ) : (
                                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.2)', fontStyle: 'italic' }}>Sin pred</span>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            )}

                            {(isLive || isFinished) ? (
                              <button className="ver-btn" onClick={() => setExpandedMatch(isOpen ? null : match.id)}>
                                {isOpen ? '▲ Ocultar predicciones' : '👁 Ver predicciones del grupo'}
                              </button>
                            ) : (
                              <div style={{ padding: '6px 10px 8px', fontSize: 10, color: 'rgba(255,255,255,.2)', fontStyle: 'italic' }}>🔒 Predicciones se revelan al iniciar</div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <BottomNav />
    </>
  )
}