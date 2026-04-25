// @ts-nocheck
'use client'

import { Suspense } from 'react'
import { useEffect, useState, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Loading from '@/app/loading'
import BottomNav from '@/components/BottomNav'

type User = { id: string; name: string }
type PoolMember = {
  id: string; pool_id: string; points: number; rank: number | null
  payment_status: string; pool: {
    id: string; name: string; competition: string; status: string
  }
}
type Prediction = {
  match_id: string; pool_id: string
  predicted_home: number; predicted_away: number
}
type Match = {
  id: string; home_team: string; away_team: string
  home_flag: string; away_flag: string
  scheduled_at: string; status: string
  home_score: number | null; away_score: number | null
  competition: string; round: string; group_name: string | null
  venue: string; city: string
}
type Draft = { home: string; away: string }

function getCompTheme(comp: string) {
  switch (comp) {
    case 'FIFA_2026': return { label: 'Mundial FIFA 2026', icon: '🌍', accent: '#00C46A', accentBg: 'rgba(0,196,106,0.10)', accentBorder: 'rgba(0,196,106,0.25)', leftBorder: '#00C46A' }
    case 'LIGA_MX':   return { label: 'Liga MX', icon: '🦅', accent: '#E8192C', accentBg: 'rgba(232,25,44,0.10)', accentBorder: 'rgba(232,25,44,0.25)', leftBorder: '#E8192C' }
    case 'UEFA_CL':   return { label: 'UEFA Champions', icon: '⭐', accent: '#4FADFF', accentBg: 'rgba(79,173,255,0.10)', accentBorder: 'rgba(79,173,255,0.25)', leftBorder: '#4FADFF' }
    default:          return { label: comp, icon: '🏆', accent: '#6B7280', accentBg: 'rgba(107,114,128,0.10)', accentBorder: 'rgba(107,114,128,0.25)', leftBorder: '#6B7280' }
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-MX', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Mexico_City'
  })
}

function isLocked(scheduledAt: string, status: string) {
  if (status === 'live' || status === 'finished') return true
  return new Date(scheduledAt).getTime() <= Date.now()
}

function PredecirInner() {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const router = useRouter()
  const searchParams = useSearchParams()

  const [user, setUser] = useState<User | null>(null)
  const [myPools, setMyPools] = useState<PoolMember[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [activeFilter, setActiveFilter] = useState<string>('todos')
  const [loading, setLoading] = useState(true)
  const matchRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    const matchId = searchParams.get('match')
    const poolId = searchParams.get('pool')
    if (matchId && poolId && !loading) {
      if (poolId !== 'todos') setActiveFilter(poolId)
      setTimeout(() => {
        const key = `${poolId}-${matchId}`
        const el = matchRefs.current[key]
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    }
  }, [loading, searchParams])

  async function loadData() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }
      const { data: userData } = await supabase.from('users').select('id, name').eq('id', session.user.id).single()
      if (!userData) { router.push('/registro'); return }
      setUser(userData)

      const { data: memberData } = await supabase
        .from('pool_members')
        .select('id, pool_id, points, rank, payment_status, pool:pools(id, name, competition, status)')
        .eq('user_id', session.user.id)
        .eq('payment_status', 'approved')
      const members = (memberData as any) || []
      setMyPools(members)
      if (members.length === 0) { setLoading(false); return }

      const { data: predsData } = await supabase
        .from('predictions').select('match_id, pool_id, predicted_home, predicted_away')
        .eq('user_id', session.user.id)
      const preds = predsData || []
      setPredictions(preds)

      const initialDrafts: Record<string, Draft> = {}
      for (const p of preds) {
        initialDrafts[`${p.pool_id}-${p.match_id}`] = { home: String(p.predicted_home), away: String(p.predicted_away) }
      }
      setDrafts(initialDrafts)

      const competitions = [...new Set(members.map((m: any) => m.pool?.competition).filter(Boolean))]
      const { data: matchesData } = await supabase
        .from('matches')
        .select('id, home_team, away_team, home_flag, away_flag, scheduled_at, status, home_score, away_score, competition, round, group_name, venue, city')
        .in('competition', competitions)
        .order('scheduled_at', { ascending: true })
      setMatches(matchesData || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  async function savePrediction(matchId: string, poolId: string, home: string, away: string) {
    if (home === '' || away === '') return
    const homeNum = parseInt(home)
    const awayNum = parseInt(away)
    if (isNaN(homeNum) || isNaN(awayNum) || homeNum < 0 || awayNum < 0) return
    const key = `${poolId}-${matchId}`
    setSaving(s => ({ ...s, [key]: true }))
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      await supabase.from('predictions').upsert({
        user_id: session.user.id, match_id: matchId, pool_id: poolId,
        predicted_home: homeNum, predicted_away: awayNum, points_earned: 0,
      }, { onConflict: 'pool_id,match_id,user_id' })
      setPredictions(prev => {
        const filtered = prev.filter(p => !(p.match_id === matchId && p.pool_id === poolId))
        return [...filtered, { match_id: matchId, pool_id: poolId, predicted_home: homeNum, predicted_away: awayNum }]
      })
      setSaved(s => ({ ...s, [key]: true }))
      setTimeout(() => setSaved(s => ({ ...s, [key]: false })), 2000)
    } catch (e) { console.error(e) }
    finally { setSaving(s => ({ ...s, [key]: false })) }
  }

  function getPrediction(matchId: string, poolId: string) {
    return predictions.find(p => p.match_id === matchId && p.pool_id === poolId)
  }

  function getFilteredMatches(): { match: Match; pool: PoolMember }[] {
    const result: { match: Match; pool: PoolMember }[] = []
    for (const match of matches) {
      const pools = myPools.filter(m => m.pool?.competition === match.competition)
      for (const pool of pools) {
        const matchesFilter = activeFilter === 'todos' || activeFilter === 'pendientes' || activeFilter === pool.pool_id
        if (!matchesFilter) continue
        if (activeFilter === 'pendientes') {
          const pred = getPrediction(match.id, pool.pool_id)
          const locked = isLocked(match.scheduled_at, match.status)
          if (pred || locked) continue
        }
        result.push({ match, pool })
      }
    }
    if (activeFilter === 'todos' || activeFilter === 'pendientes') {
      const seen = new Set<string>()
      return result.filter(({ match, pool }) => {
        const key = `${pool.pool_id}-${match.id}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }
    return result
  }

  if (loading) return <Loading />
  if (!user) return null

  const totalMatches = activeFilter === 'todos' || activeFilter === 'pendientes'
  ? filteredMatches.length
  : matches.filter(m => myPools.find(p => p.pool_id === activeFilter)?.pool?.competition === m.competition).length

  const predictedCount = activeFilter === 'todos' || activeFilter === 'pendientes'
    ? new Set(predictions.map(p => p.match_id)).size
    : predictions.filter(p => p.pool_id === activeFilter).length

  const filteredMatches = getFilteredMatches()
  const activePool = myPools.find(m => m.pool_id === activeFilter)

  function groupByDate(items: { match: Match; pool: PoolMember }[]) {
    const groups: Record<string, { match: Match; pool: PoolMember }[]> = {}
    for (const item of items) {
      const dateKey = new Date(item.match.scheduled_at).toLocaleDateString('es-MX', {
        weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Mexico_City'
      })
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(item)
    }
    return groups
  }

  const grouped = groupByDate(filteredMatches)

  return (
    <div style={{ background: '#080C16', minHeight: '100vh', fontFamily: "'Outfit','Helvetica Neue',sans-serif", color: '#F0F2F8' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes savedPop { 0%{transform:scale(1)} 50%{transform:scale(1.08)} 100%{transform:scale(1)} }
        @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:.4} }
        .chip { transition: all 0.2s; cursor: pointer; }
        .score-input {
          width: 56px; height: 56px; border-radius: 12px;
          background: rgba(255,255,255,.06); border: 1.5px solid rgba(255,255,255,.12);
          color: #F0F2F8; font-family: 'Bebas Neue', sans-serif; font-size: 32px;
          text-align: center; outline: none; transition: all 0.2s;
          -moz-appearance: textfield;
        }
        .score-input::-webkit-outer-spin-button,
        .score-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .score-input:focus { border-color: #F5B731; background: rgba(245,183,49,.08); color: #F5B731; }
        .score-input.filled { border-color: rgba(0,196,106,.4); background: rgba(0,196,106,.08); color: #00C46A; }
        .score-input.locked { border-color: rgba(255,255,255,.06); color: rgba(255,255,255,.3); cursor: not-allowed; }
        .save-btn { transition: all 0.2s; cursor: pointer; border: none; font-family: 'Outfit', sans-serif; }
        .save-btn:hover { transform: scale(1.04); }
        .save-btn:active { transform: scale(0.97); }
      `}</style>

      {/* TOPBAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px 12px', background: 'rgba(8,12,22,0.96)', backdropFilter: 'blur(20px)', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', cursor: 'pointer' }}>←</div>
        </Link>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 3, background: 'linear-gradient(90deg,#C9930A,#F5B731,#fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PREDECIR</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 1 }}>Elige quiniela y haz tus predicciones</div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 16px 100px' }}>
        {myPools.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,.25)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>No tienes quinielas activas</div>
            <div style={{ fontSize: 13, marginBottom: 24 }}>Únete a una quiniela para poder predecir</div>
            <Link href="/quinielas" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'inline-block', padding: '10px 24px', borderRadius: 20, background: 'linear-gradient(135deg,#F5B731,#C9930A)', color: '#080C16', fontWeight: 700, fontSize: 13 }}>Ver quinielas →</div>
            </Link>
          </div>
        ) : (
          <>
            {/* FILTROS */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4, marginBottom: 14 }}>
              <button className="chip" onClick={() => setActiveFilter('todos')} style={{
                padding: '6px 16px', borderRadius: 20, border: 'none', whiteSpace: 'nowrap',
                fontFamily: "'Outfit',sans-serif", fontSize: 12, fontWeight: activeFilter === 'todos' ? 700 : 400,
                background: activeFilter === 'todos' ? '#F5B731' : 'rgba(255,255,255,.06)',
                color: activeFilter === 'todos' ? '#080C16' : 'rgba(255,255,255,.4)',
              }}>Todos</button>

              <button className="chip" onClick={() => setActiveFilter('pendientes')} style={{
                padding: '6px 16px', borderRadius: 20,
                border: activeFilter === 'pendientes' ? '1px solid rgba(255,77,109,.4)' : 'none',
                whiteSpace: 'nowrap', fontFamily: "'Outfit',sans-serif", fontSize: 12,
                fontWeight: activeFilter === 'pendientes' ? 700 : 400,
                background: activeFilter === 'pendientes' ? 'rgba(255,77,109,.15)' : 'rgba(255,255,255,.06)',
                color: activeFilter === 'pendientes' ? '#FF4D6D' : 'rgba(255,255,255,.4)',
              }}>⚡ Pendientes</button>

              {myPools.map(member => {
                const theme = getCompTheme(member.pool?.competition || '')
                const isActive = activeFilter === member.pool_id
                return (
                  <button key={member.pool_id} className="chip" onClick={() => setActiveFilter(member.pool_id)} style={{
                    padding: '6px 16px', borderRadius: 20,
                    border: isActive ? `1px solid ${theme.accentBorder}` : 'none',
                    whiteSpace: 'nowrap', fontFamily: "'Outfit',sans-serif", fontSize: 12,
                    fontWeight: isActive ? 700 : 400,
                    background: isActive ? theme.accentBg : 'rgba(255,255,255,.06)',
                    color: isActive ? theme.accent : 'rgba(255,255,255,.4)',
                  }}>
                    {theme.icon} {member.pool?.name}
                  </button>
                )
              })}
            </div>

            {/* PROGRESO */}
            <div style={{ background: '#111520', borderRadius: 12, padding: '12px 14px', marginBottom: 16, border: '0.5px solid rgba(255,255,255,.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>
                  {activeFilter === 'todos' || activeFilter === 'pendientes' ? 'Progreso total' : activePool?.pool?.name}
                </span>
                <span style={{ fontSize: 11, color: '#F5B731', fontWeight: 600 }}>{predictedCount} / {totalMatches} predichos</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,.06)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 4, width: `${totalMatches > 0 ? Math.round((predictedCount / totalMatches) * 100) : 0}%`, background: 'linear-gradient(90deg,#F5B731,#C9930A)', transition: 'width 0.5s ease' }} />
              </div>
            </div>

            {/* PARTIDOS */}
            {filteredMatches.length === 0 && activeFilter === 'pendientes' ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,.25)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>¡Todo predicho!</div>
                <div style={{ fontSize: 13 }}>No tienes partidos pendientes por predecir</div>
              </div>
            ) : (
              Object.entries(grouped).map(([dateLabel, items]) => (
                <div key={dateLabel} style={{ marginBottom: 20, animation: 'fadeUp 0.3s ease both' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {dateLabel}
                    <div style={{ flex: 1, height: '.5px', background: 'rgba(255,255,255,.07)' }} />
                  </div>

                  {items.map(({ match, pool }) => {
                    const theme = getCompTheme(pool.pool?.competition || '')
                    const pred = getPrediction(match.id, pool.pool_id)
                    const locked = isLocked(match.scheduled_at, match.status)
                    const key = `${pool.pool_id}-${match.id}`
                    const draft = drafts[key] || { home: '', away: '' }
                    const hasDraft = draft.home !== '' && draft.away !== ''
                    const isDirty = hasDraft && (!pred || parseInt(draft.home) !== pred.predicted_home || parseInt(draft.away) !== pred.predicted_away)
                    const isSaving = saving[key]
                    const justSaved = saved[key]
                    const hoursUntil = (new Date(match.scheduled_at).getTime() - Date.now()) / 3600000
                    const isUrgent = !pred && !locked && hoursUntil <= 24 && hoursUntil > 0

                    return (
                      <div
                        key={key}
                        id={key}
                        ref={el => matchRefs.current[key] = el}
                        style={{ background: '#111520', borderRadius: 14, border: isUrgent ? '0.5px solid rgba(255,77,109,.3)' : '0.5px solid rgba(255,255,255,.07)', borderLeft: `3px solid ${isUrgent ? '#FF4D6D' : theme.leftBorder}`, marginBottom: 10, overflow: 'hidden' }}
                      >
                        {/* Header */}
                        <div style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isUrgent ? 'rgba(255,77,109,.05)' : 'rgba(0,0,0,.2)', borderBottom: '0.5px solid rgba(255,255,255,.05)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 12 }}>{theme.icon}</span>
                            <span style={{ fontSize: 10, color: isUrgent ? '#FF4D6D' : theme.accent, fontWeight: 700 }}>
                              {activeFilter === 'todos' || activeFilter === 'pendientes' ? pool.pool?.name : (match.group_name ? `Grupo ${match.group_name}` : match.round)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)' }}>📍 {match.city}</span>
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)' }}>{formatDate(match.scheduled_at)}</span>
                            {justSaved && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#00C46A', background: 'rgba(0,196,106,.12)', padding: '2px 8px', borderRadius: 6, animation: 'savedPop 0.3s ease' }}>✓ Guardado</span>
                            )}
                            {!justSaved && pred && !locked && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#00C46A', background: 'rgba(0,196,106,.12)', padding: '2px 8px', borderRadius: 6 }}>✓ Guardado</span>
                            )}
                            {locked && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#6B7280', background: 'rgba(107,114,128,.12)', padding: '2px 8px', borderRadius: 6 }}>🔒 Cerrado</span>
                            )}
                            {isUrgent && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#FF4D6D', background: 'rgba(255,77,109,.15)', padding: '2px 8px', borderRadius: 6, border: '0.5px solid rgba(255,77,109,.4)', animation: 'blink 1s ease-in-out infinite' }}>🔥 ¡Hoy!</span>
                            )}
                            {!pred && !locked && !justSaved && !isUrgent && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#FF4D6D', background: 'rgba(255,77,109,.1)', padding: '2px 8px', borderRadius: 6 }}>⚡ Pendiente</span>
                            )}
                          </div>
                        </div>

                        {/* Contenido */}
                        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                            
                            <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,.8)', textAlign: 'center', lineHeight: 1.2 }}>{match.home_team}</span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            {match.home_score !== null ? (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, background: 'rgba(255,255,255,.08)', padding: '4px 14px', borderRadius: 10 }}>{match.home_score}</div>
                                  <span style={{ color: 'rgba(255,255,255,.2)', fontSize: 16 }}>-</span>
                                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, background: 'rgba(255,255,255,.08)', padding: '4px 14px', borderRadius: 10 }}>{match.away_score}</div>
                                </div>
                                {pred && (
                                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>
                                    Tu pred: <span style={{ color: '#F5B731' }}>{pred.predicted_home} - {pred.predicted_away}</span>
                                  </div>
                                )}
                              </div>
                            ) : locked ? (
                              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <input className="score-input locked" type="number" value={draft.home} readOnly />
                                <span style={{ color: 'rgba(255,255,255,.2)', fontSize: 20, fontFamily: "'Bebas Neue',sans-serif" }}>-</span>
                                <input className="score-input locked" type="number" value={draft.away} readOnly />
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                  <input
                                    className={`score-input ${draft.home !== '' ? 'filled' : ''}`}
                                    type="number" min="0" max="99"
                                    value={draft.home} placeholder="0"
                                    onChange={e => setDrafts(d => ({ ...d, [key]: { ...d[key] || { home: '', away: '' }, home: e.target.value } }))}
                                    onBlur={() => { if (hasDraft && isDirty) savePrediction(match.id, pool.pool_id, draft.home, draft.away) }}
                                  />
                                  <span style={{ color: 'rgba(255,255,255,.2)', fontSize: 20, fontFamily: "'Bebas Neue',sans-serif" }}>-</span>
                                  <input
                                    className={`score-input ${draft.away !== '' ? 'filled' : ''}`}
                                    type="number" min="0" max="99"
                                    value={draft.away} placeholder="0"
                                    onChange={e => setDrafts(d => ({ ...d, [key]: { ...d[key] || { home: '', away: '' }, away: e.target.value } }))}
                                    onBlur={() => { if (hasDraft && isDirty) savePrediction(match.id, pool.pool_id, draft.home, draft.away) }}
                                  />
                                </div>
                                {isDirty && (
                                  <button className="save-btn" onClick={() => savePrediction(match.id, pool.pool_id, draft.home, draft.away)} disabled={isSaving} style={{
                                    padding: '6px 20px', borderRadius: 16,
                                    background: isSaving ? 'rgba(245,183,49,.3)' : 'linear-gradient(135deg,#F5B731,#C9930A)',
                                    color: '#080C16', fontWeight: 700, fontSize: 12,
                                  }}>
                                    {isSaving ? 'Guardando...' : 'Guardar'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                            
                            <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,.8)', textAlign: 'center', lineHeight: 1.2 }}>{match.away_team}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  )
}

export default function Predecir() {
  return (
    <Suspense fallback={<Loading />}>
      <PredecirInner />
    </Suspense>
  )
}