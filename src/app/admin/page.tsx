// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Loading from '@/app/loading'

const fmt = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)

function compColor(comp) {
  if (comp === 'FIFA_2026') return '#00C46A'
  if (comp === 'LIGA_MX') return '#E8192C'
  if (comp === 'UEFA_CL') return '#4FADFF'
  return '#6B7280'
}

function compLabel(comp) {
  if (comp === 'FIFA_2026') return '🌍 FIFA 2026'
  if (comp === 'LIGA_MX') return '🦅 Liga MX'
  return comp
}

export default function AdminPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'jugadores' | 'resultados' | 'analisis'>('jugadores')
  const [members, setMembers] = useState([])
  const [pools, setPools] = useState([])
  const [matches, setMatches] = useState([])
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [filterPool, setFilterPool] = useState<string>('todos')
  const [filterComp, setFilterComp] = useState<string>('todos')

  useEffect(() => { init() }, [])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    const { data: userData } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
    if (!userData?.is_admin) { router.push('/dashboard'); return }
    await loadData()
    setLoading(false)
  }

  async function loadData() {
    // Pools
    const { data: poolsData } = await supabase
      .from('pools')
      .select('id, name, competition, entry_fee, total_pot, current_participants, max_participants')
      .order('created_at', { ascending: false })
    setPools(poolsData || [])

    const res = await fetch('/api/admin/members')
    const combined = await res.json()
    setMembers(combined)

    const approvedM = combined.filter(m => m.payment_status === 'approved')
    const recaudado = approvedM.reduce((s, m) => s + (m.poolData?.entry_fee || 0), 0)
    const pendientes = combined.filter(m => m.payment_status === 'pending').length
    setStats({ recaudado, comision: recaudado * 0.1, participantes: approvedM.length, pendientes })

    // Partidos
    const { data: matchesData } = await supabase
      .from('matches')
      .select('*')
      .order('scheduled_at', { ascending: true })
    setMatches(matchesData || [])
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function handleApprove(member) {
    const { error } = await supabase
      .from('pool_members').update({ payment_status: 'approved' }).eq('id', member.id)
    if (error) { showToast('❌ Error al aprobar'); return }
    await supabase.rpc('increment_participants', { p_pool_id: member.pool_id })
    showToast(`✅ ${member.userData?.name} aprobado`)
    await loadData()
  }

  async function handleReject(member) {
    await supabase.from('pool_members').update({ payment_status: 'rejected' }).eq('id', member.id)
    showToast(`🚫 ${member.userData?.name} rechazado`)
    await loadData()
  }

  async function handleSaveResult(match) {
    const s = scores[match.id]
    if (!s || s.home === '' || s.away === '') { showToast('⚠️ Ingresa ambos marcadores'); return }
    setSavingId(match.id)

    const homeScore = parseInt(s.home)
    const awayScore = parseInt(s.away)

    const { error } = await supabase
      .from('matches')
      .update({ home_score: homeScore, away_score: awayScore, status: 'finished' })
      .eq('id', match.id)
    if (error) { showToast('❌ Error guardando'); setSavingId(null); return }

    const { data: preds } = await supabase.from('predictions').select('*').eq('match_id', match.id)
    const realResult = homeScore > awayScore ? 'home' : awayScore > homeScore ? 'away' : 'draw'

    for (const pred of preds || []) {
      const predResult = pred.predicted_home > pred.predicted_away ? 'home'
        : pred.predicted_away > pred.predicted_home ? 'away' : 'draw'
      let pts = 0
      if (pred.predicted_home === homeScore && pred.predicted_away === awayScore) pts = 3
      else if (predResult === realResult) pts = 1
      if (pts > 0) {
        await supabase.from('predictions').update({ points_earned: pts }).eq('id', pred.id)
        await supabase.rpc('add_points_to_member', { p_user_id: pred.user_id, p_pool_id: pred.pool_id, p_points: pts })
      }
    }

    setScores(prev => { const n = { ...prev }; delete n[match.id]; return n })
    setSavingId(null)
    showToast(`⚽ ${match.home_team} ${homeScore}-${awayScore} ${match.away_team}`)
    await loadData()
  }

  if (loading) return <Loading />

  // Stats globales
  const approvedMembers = members.filter(m => m.payment_status === 'approved')
  const pendingMembers = members.filter(m => m.payment_status === 'pending')
  const recaudadoTotal = approvedMembers.reduce((s, m) => s + (m.poolData?.entry_fee || 0), 0)

  // Stats por quiniela
  const poolStats = pools.map(pool => {
    const poolMembers = approvedMembers.filter(m => m.pool_id === pool.id)
    const recaudado = poolMembers.reduce((s, m) => s + (pool.entry_fee || 0), 0)
    return { ...pool, recaudado, participantesActivos: poolMembers.length }
  })

  // Filtros jugadores
  const filteredMembers = filterPool === 'todos'
    ? members
    : members.filter(m => m.pool_id === filterPool)

  const activeMembers = filteredMembers.filter(m => m.payment_status === 'approved')
  const pendingFiltered = filteredMembers.filter(m => m.payment_status === 'pending')
  const rejectedMembers = filteredMembers.filter(m => m.payment_status === 'rejected')

  // Filtros partidos
  const filteredMatches = filterComp === 'todos'
    ? matches
    : matches.filter(m => m.competition === filterComp)

  const pendingMatches = filteredMatches.filter(m => m.status !== 'finished' && new Date(m.scheduled_at) < new Date())
  const upcomingMatches = filteredMatches.filter(m => m.status !== 'finished' && new Date(m.scheduled_at) >= new Date())
  const finishedMatches = filteredMatches.filter(m => m.status === 'finished')

  const competitions = [...new Set(matches.map(m => m.competition))]

  // Análisis — mejor predictor
  const bestPredictor = [...approvedMembers].sort((a, b) => (b.points || 0) - (a.points || 0))[0]

  return (
    <div style={{ background: '#080C16', minHeight: '100vh', fontFamily: "'Outfit', sans-serif", color: '#F0F2F8' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        .chip { cursor: pointer; transition: all 0.2s; border: none; font-family: 'Outfit', sans-serif; }
        .approve-btn:hover { opacity: 0.8; }
        .reject-btn:hover { opacity: 0.8; }
      `}</style>

      {toast && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 999, background: '#1a1f2e', border: '1px solid rgba(245,183,49,0.3)', borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 600, color: '#fff', animation: 'slideIn 0.3s ease', whiteSpace: 'nowrap', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          {toast}
        </div>
      )}

      {/* TOPBAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'rgba(8,12,22,0.96)', backdropFilter: 'blur(20px)', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
        <div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, letterSpacing: 2, color: '#F5B731' }}>ATÍNALE</div>
          <div style={{ fontSize: 9, color: '#F5B731', letterSpacing: 2 }}>PANEL DE ADMIN</div>
        </div>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '7px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', color: '#666', fontSize: 12, cursor: 'pointer' }}>← Dashboard</div>
        </Link>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '16px 16px 80px' }}>

        {/* ── RESUMEN GLOBAL ── */}
        <div style={{ background: '#111520', borderRadius: 16, padding: 16, marginBottom: 14, border: '0.5px solid rgba(245,183,49,0.15)', animation: 'fadeUp 0.3s ease both' }}>
          <div style={{ fontSize: 10, color: '#F5B731', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14 }}>Resumen global</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'Total recaudado', value: fmt(recaudadoTotal), color: '#00C46A' },
              { label: 'Comisión 10%', value: fmt(recaudadoTotal * 0.1), color: '#F5B731' },
              { label: 'Participantes activos', value: approvedMembers.length, color: '#4FADFF' },
              { label: 'Pagos pendientes', value: pendingMembers.length, color: pendingMembers.length > 0 ? '#f97316' : '#444' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#0d1220', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Desglose por quiniela */}
          <div style={{ fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Por quiniela</div>
          {poolStats.map(pool => (
            <div key={pool.id} style={{ background: '#0d1220', borderRadius: 10, padding: '10px 12px', marginBottom: 6, borderLeft: `3px solid ${compColor(pool.competition)}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{pool.name}</div>
                  <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{pool.participantesActivos} participantes · {compLabel(pool.competition)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#F5B731' }}>{fmt(pool.recaudado)}</div>
                  <div style={{ fontSize: 10, color: '#00C46A' }}>{fmt(pool.recaudado * 0.9)} premio</div>
                </div>
              </div>
            </div>
          ))}

          {/* Barra meta */}
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#555', marginBottom: 4 }}>
              <span>Meta: {fmt(5000)}</span>
              <span style={{ color: '#00C46A' }}>{Math.round((recaudadoTotal / 5000) * 100)}% alcanzado</span>
            </div>
            <div style={{ background: '#1a1f2e', borderRadius: 4, height: 5, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (recaudadoTotal / 5000) * 100)}%`, height: '100%', background: '#00C46A', borderRadius: 4, transition: 'width 0.5s' }} />
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 14 }}>
          {[
            { key: 'jugadores', label: '👥 Jugadores', badge: pendingMembers.length },
            { key: 'resultados', label: '⚽ Resultados', badge: pendingMatches.length },
            { key: 'analisis', label: '📊 Análisis', badge: 0 },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{
              padding: '10px 4px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontFamily: 'Bebas Neue, sans-serif', fontSize: 13, letterSpacing: 1,
              background: activeTab === tab.key ? '#F5B731' : '#111520',
              color: activeTab === tab.key ? '#080C16' : '#555',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}>
              {tab.label}
              {tab.badge > 0 && (
                <span style={{ background: activeTab === tab.key ? '#080C16' : '#f97316', color: '#fff', borderRadius: '50%', width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══ TAB JUGADORES ══ */}
        {activeTab === 'jugadores' && (
          <div style={{ animation: 'fadeUp 0.3s ease both' }}>
            {/* Filtro por quiniela */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 12, paddingBottom: 2 }}>
              {[{ id: 'todos', name: 'Todas' }, ...pools].map(pool => (
                <button key={pool.id} className="chip" onClick={() => setFilterPool(pool.id)} style={{
                  padding: '5px 14px', borderRadius: 20, whiteSpace: 'nowrap', fontSize: 11,
                  fontWeight: filterPool === pool.id ? 700 : 400,
                  background: filterPool === pool.id ? '#F5B731' : 'rgba(255,255,255,.06)',
                  color: filterPool === pool.id ? '#080C16' : 'rgba(255,255,255,.4)',
                }}>
                  {pool.name}
                </button>
              ))}
            </div>

            {members.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#555' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
                <p>Nadie se ha unido aún</p>
              </div>
            )}

            {pendingFiltered.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: '#f97316', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: 2, marginBottom: 8 }}>⏳ PENDIENTES ({pendingFiltered.length})</div>
                {pendingFiltered.map(m => <MemberCard key={m.id} member={m} onApprove={handleApprove} onReject={handleReject} showActions />)}
              </div>
            )}

            {activeMembers.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: '#00C46A', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: 2, marginBottom: 8 }}>✅ ACTIVOS ({activeMembers.length})</div>
                {activeMembers.map(m => <MemberCard key={m.id} member={m} onApprove={handleApprove} onReject={handleReject} showActions={false} />)}
              </div>
            )}

            {rejectedMembers.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: '#ff4d4d', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: 2, marginBottom: 8 }}>🚫 RECHAZADOS ({rejectedMembers.length})</div>
                {rejectedMembers.map(m => <MemberCard key={m.id} member={m} onApprove={handleApprove} onReject={handleReject} showActions={false} />)}
              </div>
            )}
          </div>
        )}

        {/* ══ TAB RESULTADOS ══ */}
        {activeTab === 'resultados' && (
          <div style={{ animation: 'fadeUp 0.3s ease both' }}>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 12, paddingBottom: 2 }}>
              {[{ id: 'todos', label: 'Todas' }, ...competitions.map(c => ({ id: c, label: compLabel(c) }))].map(opt => (
                <button key={opt.id} className="chip" onClick={() => setFilterComp(opt.id)} style={{
                  padding: '5px 14px', borderRadius: 20, whiteSpace: 'nowrap', fontSize: 11,
                  fontWeight: filterComp === opt.id ? 700 : 400,
                  background: filterComp === opt.id ? '#F5B731' : 'rgba(255,255,255,.06)',
                  color: filterComp === opt.id ? '#080C16' : 'rgba(255,255,255,.4)',
                }}>
                  {opt.label}
                </button>
              ))}
            </div>

            {pendingMatches.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: '#f97316', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: 2, marginBottom: 8 }}>⚠️ NECESITAN RESULTADO ({pendingMatches.length})</div>
                {pendingMatches.map(m => <MatchCard key={m.id} match={m} scores={scores} setScores={setScores} savingId={savingId} onSave={handleSaveResult} highlight />)}
              </div>
            )}

            {upcomingMatches.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: '#555', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: 2, marginBottom: 8 }}>📅 PRÓXIMOS ({upcomingMatches.length})</div>
                {upcomingMatches.slice(0, 10).map(m => <MatchCard key={m.id} match={m} scores={scores} setScores={setScores} savingId={savingId} onSave={handleSaveResult} highlight={false} />)}
              </div>
            )}

            {finishedMatches.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: '#00C46A', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: 2, marginBottom: 8 }}>✅ FINALIZADOS ({finishedMatches.length})</div>
                {finishedMatches.map(m => (
                  <div key={m.id} style={{ background: '#111520', borderRadius: 10, padding: '10px 14px', marginBottom: 6, border: '0.5px solid rgba(0,196,106,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.7 }}>
                    <span style={{ fontSize: 12, color: '#ccc', flex: 1 }}>{m.home_team}</span>
                    <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: '#00C46A', padding: '2px 12px', background: 'rgba(0,196,106,0.1)', borderRadius: 8, margin: '0 8px' }}>
                      {m.home_score} - {m.away_score}
                    </span>
                    <span style={{ fontSize: 12, color: '#ccc', flex: 1, textAlign: 'right' }}>{m.away_team}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ TAB ANÁLISIS ══ */}
        {activeTab === 'analisis' && (
          <div style={{ animation: 'fadeUp 0.3s ease both' }}>

            {/* Mini stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <div style={{ background: '#111520', borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Mejor predictor</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#F5B731' }}>{bestPredictor?.userData?.name || '—'}</div>
                <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{bestPredictor?.points || 0} pts</div>
              </div>
              <div style={{ background: '#111520', borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Partidos jugados</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#4FADFF', lineHeight: 1 }}>{finishedMatches.length}/{matches.length}</div>
                <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>total</div>
              </div>
            </div>

            {/* Tabla de posiciones */}
            <div style={{ background: '#111520', borderRadius: 12, padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Tabla de posiciones</div>
              {approvedMembers.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#555', fontSize: 12, padding: '20px 0' }}>Sin participantes aún</div>
              ) : (
                [...approvedMembers]
                  .sort((a, b) => (b.points || 0) - (a.points || 0))
                  .map((m, i) => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < approvedMembers.length - 1 ? '0.5px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: i === 0 ? '#F5B731' : i === 1 ? '#9CA3AF' : i === 2 ? '#CD7F32' : '#444', width: 24 }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{m.userData?.name || 'Usuario'}</div>
                        <div style={{ fontSize: 10, color: '#555' }}>{m.poolData?.name}</div>
                      </div>
                      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: i === 0 ? '#F5B731' : '#4FADFF' }}>{m.points || 0}</div>
                    </div>
                  ))
              )}
            </div>

            {/* Gráfica pozo por quiniela */}
            <div style={{ background: '#111520', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Recaudado por quiniela</div>
              {poolStats.map(pool => (
                <div key={pool.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#ccc', marginBottom: 4 }}>
                    <span>{pool.name}</span>
                    <span style={{ color: '#F5B731' }}>{fmt(pool.recaudado)}</span>
                  </div>
                  <div style={{ background: '#1a1f2e', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${pool.max_participants > 0 ? Math.min(100, (pool.participantesActivos / pool.max_participants) * 100) : 0}%`, height: '100%', background: compColor(pool.competition), borderRadius: 4, transition: 'width 0.5s' }} />
                  </div>
                  <div style={{ fontSize: 10, color: '#555', marginTop: 3 }}>{pool.participantesActivos} / {pool.max_participants} participantes</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MemberCard({ member, onApprove, onReject, showActions }) {
  const color = member.payment_status === 'approved' ? '#00C46A' : member.payment_status === 'pending' ? '#f97316' : '#ff4d4d'
  return (
    <div style={{ background: '#111520', borderRadius: 12, padding: 12, marginBottom: 8, borderLeft: `3px solid ${color}`, animation: 'fadeUp 0.3s ease both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: showActions ? 10 : 0 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{member.userData?.name || 'Sin nombre'}</div>
          <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{member.userData?.email}</div>
          {member.userData?.phone && <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>📱 {member.userData.phone}</div>}
          <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>📋 {member.poolData?.name}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: '#F5B731' }}>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(member.poolData?.entry_fee || 0)}</div>
          <div style={{ fontSize: 10, fontWeight: 700, color, marginTop: 2 }}>{member.payment_status.toUpperCase()}</div>
          {member.payment_status === 'approved' && (
            <div style={{ fontSize: 10, color: '#4FADFF', marginTop: 2 }}>{member.points || 0} pts · #{member.rank || '—'}</div>
          )}
        </div>
      </div>
      {showActions && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button className="approve-btn" onClick={() => onApprove(member)} style={{ padding: '9px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'rgba(0,196,106,0.15)', color: '#00C46A', fontFamily: 'Bebas Neue, sans-serif', fontSize: 13, letterSpacing: 1 }}>✅ APROBAR</button>
          <button className="reject-btn" onClick={() => onReject(member)} style={{ padding: '9px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', fontFamily: 'Bebas Neue, sans-serif', fontSize: 13, letterSpacing: 1 }}>✗ RECHAZAR</button>
        </div>
      )}
    </div>
  )
}

function MatchCard({ match, scores, setScores, savingId, onSave, highlight }) {
  const isSaving = savingId === match.id
  const s = scores[match.id] || { home: '', away: '' }
  const fecha = new Date(match.scheduled_at).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Mexico_City'
  })
  return (
    <div style={{ background: '#111520', borderRadius: 12, padding: 14, marginBottom: 8, borderLeft: `3px solid ${highlight ? '#f97316' : 'rgba(255,255,255,0.1)'}`, animation: 'fadeUp 0.3s ease both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#555', marginBottom: 10 }}>
        <span>{match.competition === 'LIGA_MX' ? '🦅 Liga MX' : '🌍 FIFA 2026'}</span>
        <span>{fecha}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', flex: 1 }}>{match.home_team}</span>
        <span style={{ fontSize: 11, color: '#444' }}>vs</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', flex: 1, textAlign: 'right' }}>{match.away_team}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="number" min="0" max="20" placeholder="0" value={s.home}
          onChange={e => setScores(prev => ({ ...prev, [match.id]: { ...prev[match.id], home: e.target.value } }))}
          style={{ width: 50, padding: '8px', borderRadius: 10, background: '#1a1f2e', border: '1px solid rgba(245,183,49,0.3)', color: '#F5B731', textAlign: 'center', fontSize: 18, fontFamily: 'Bebas Neue, sans-serif', outline: 'none' }}
        />
        <span style={{ color: '#444', fontSize: 14 }}>-</span>
        <input type="number" min="0" max="20" placeholder="0" value={s.away}
          onChange={e => setScores(prev => ({ ...prev, [match.id]: { ...prev[match.id], away: e.target.value } }))}
          style={{ width: 50, padding: '8px', borderRadius: 10, background: '#1a1f2e', border: '1px solid rgba(245,183,49,0.3)', color: '#F5B731', textAlign: 'center', fontSize: 18, fontFamily: 'Bebas Neue, sans-serif', outline: 'none' }}
        />
        <button onClick={() => onSave(match)} disabled={isSaving || s.home === '' || s.away === ''}
          style={{ flex: 1, padding: '9px', borderRadius: 10, border: 'none', cursor: isSaving || s.home === '' || s.away === '' ? 'not-allowed' : 'pointer', background: isSaving || s.home === '' || s.away === '' ? '#1a1f2e' : 'linear-gradient(135deg,#F5B731,#C9930A)', color: isSaving || s.home === '' || s.away === '' ? '#444' : '#080C16', fontFamily: 'Bebas Neue, sans-serif', fontSize: 13, letterSpacing: 1 }}>
          {isSaving ? 'GUARDANDO...' : 'GUARDAR ⚡'}
        </button>
      </div>
    </div>
  )
}