// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Loading from '@/app/loading'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const fmt = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)

export default function AdminPage() {
  const router = useRouter()
  const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'participantes' | 'resultados'>('participantes')
  const [members, setMembers] = useState([])
  const [matches, setMatches] = useState([])
  const [pools, setPools] = useState([])
  const [stats, setStats] = useState({ recaudado: 0, comision: 0, participantes: 0, pendientes: 0 })
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
    const { data: poolsData } = await supabase.from('pools').select('id, name, competition, entry_fee, total_pot, current_participants').order('created_at', { ascending: false })
    setPools(poolsData || [])

    // Miembros con info de usuario y pool
    const { data: membersData } = await supabase
      .from('pool_members')
      .select('id, pool_id, user_id, payment_status, points, rank, pools(id, name, competition, entry_fee), users(id, name, email, phone)')
      .order('pool_id', { ascending: true })
    setMembers(membersData || [])

    // Partidos de todas las competencias activas
    const { data: matchesData } = await supabase
      .from('matches')
      .select('*')
      .order('scheduled_at', { ascending: true })
    setMatches(matchesData || [])

    // Stats
    const approved = (membersData || []).filter(m => m.payment_status === 'approved')
    const recaudado = approved.reduce((s, m) => s + (m.pool?.entry_fee || 0), 0)
    const pendientes = (membersData || []).filter(m => m.payment_status === 'pending').length

    setStats({
      recaudado,
      comision: recaudado * 0.1,
      participantes: approved.length,
      pendientes,
    })
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function handleApprove(member) {
    const { error } = await supabase
      .from('pool_members')
      .update({ payment_status: 'approved' })
      .eq('id', member.id)
    if (error) { showToast('❌ Error al aprobar'); return }
    await supabase.rpc('increment_participants', { p_pool_id: member.pool_id })
    showToast(`✅ ${member.user?.name} aprobado`)
    await loadData()
  }

  async function handleReject(member) {
    await supabase.from('pool_members').update({ payment_status: 'rejected' }).eq('id', member.id)
    showToast(`🚫 ${member.users?.name} rechazado`)
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

    // Calcular puntos
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
    showToast(`⚽ ${match.home_team} ${homeScore}-${awayScore} ${match.away_team} guardado`)
    await loadData()
  }

  if (loading) return <Loading />

  const filteredMembers = members.filter(m => filterPool === 'todos' || m.pool_id === filterPool)
  const pendingMembers = filteredMembers.filter(m => m.payment_status === 'pending')
  const approvedMembers = filteredMembers.filter(m => m.payment_status === 'approved')
  const rejectedMembers = filteredMembers.filter(m => m.payment_status === 'rejected')

  const filteredMatches = matches.filter(m => filterComp === 'todos' || m.competition === filterComp)
  const competitions = [...new Set(matches.map(m => m.competition))]

  const finishedMatches = filteredMatches.filter(m => m.status === 'finished')
  const pendingMatches = filteredMatches.filter(m => m.status !== 'finished' && new Date(m.scheduled_at) < new Date())
  const upcomingMatches = filteredMatches.filter(m => m.status !== 'finished' && new Date(m.scheduled_at) >= new Date())

  return (
    <div style={{ background: '#0A0D12', minHeight: '100vh', fontFamily: "'Outfit', sans-serif", color: '#F0F2F8' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {toast && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 999, background: '#1a1f2e', border: '1px solid rgba(245,183,49,0.3)', borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 600, color: '#fff', animation: 'slideIn 0.3s ease', whiteSpace: 'nowrap', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          {toast}
        </div>
      )}

      {/* TOPBAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'rgba(10,13,18,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, letterSpacing: 2, background: 'linear-gradient(135deg,#F5B731,#00C46A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ATÍNALE</div>
          <div style={{ fontSize: 10, color: '#F5B731', letterSpacing: '0.15em', marginTop: -2 }}>PANEL DE ADMIN</div>
        </div>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '8px 16px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#888', fontSize: 13, cursor: 'pointer' }}>← Dashboard</div>
        </Link>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 16px 80px' }}>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'RECAUDADO', value: fmt(stats.recaudado), color: '#00C46A', icon: '💰' },
            { label: 'COMISIÓN 10%', value: fmt(stats.comision), color: '#F5B731', icon: '📊' },
            { label: 'PARTICIPANTES', value: stats.participantes, color: '#4FADFF', icon: '👥' },
            { label: 'PENDIENTES', value: stats.pendientes, color: stats.pendientes > 0 ? '#f97316' : '#555', icon: '⏳' },
          ].map((card, i) => (
            <div key={i} style={{ background: '#111520', borderRadius: 12, padding: 14, border: '0.5px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden', animation: `fadeUp 0.3s ease ${i * 0.05}s both` }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: card.color }} />
              <div style={{ fontSize: 16, marginBottom: 4 }}>{card.icon}</div>
              <div style={{ color: '#444', fontSize: 9, fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.12em', marginBottom: 2 }}>{card.label}</div>
              <div style={{ color: card.color, fontSize: 26, fontFamily: 'Bebas Neue, sans-serif', lineHeight: 1 }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[
            { key: 'participantes', label: '👥 Participantes', badge: stats.pendientes },
            { key: 'resultados', label: '⚽ Resultados', badge: pendingMatches.length },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{
              flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontFamily: 'Bebas Neue, sans-serif', fontSize: 15, letterSpacing: 1,
              background: activeTab === tab.key ? '#F5B731' : 'rgba(255,255,255,0.05)',
              color: activeTab === tab.key ? '#000' : '#666', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              {tab.label}
              {tab.badge > 0 && (
                <span style={{ background: activeTab === tab.key ? '#000' : '#f97316', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── TAB PARTICIPANTES ── */}
        {activeTab === 'participantes' && (
          <div>
            {/* Filtro por quiniela */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 16, paddingBottom: 2 }}>
              <button onClick={() => setFilterPool('todos')} style={{ padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 11, fontFamily: 'Outfit, sans-serif', fontWeight: filterPool === 'todos' ? 700 : 400, background: filterPool === 'todos' ? '#F5B731' : 'rgba(255,255,255,.06)', color: filterPool === 'todos' ? '#080C16' : 'rgba(255,255,255,.4)' }}>
                Todas
              </button>
              {pools.map(pool => (
                <button key={pool.id} onClick={() => setFilterPool(pool.id)} style={{ padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 11, fontFamily: 'Outfit, sans-serif', fontWeight: filterPool === pool.id ? 700 : 400, background: filterPool === pool.id ? '#F5B731' : 'rgba(255,255,255,.06)', color: filterPool === pool.id ? '#080C16' : 'rgba(255,255,255,.4)' }}>
                  {pool.name}
                </button>
              ))}
            </div>

            {members.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#555' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
                <p>Nadie se ha unido aún</p>
              </div>
            )}

            {/* Pendientes */}
            {pendingMembers.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: '#f97316', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: 2, marginBottom: 10 }}>⏳ PENDIENTES ({pendingMembers.length})</div>
                {pendingMembers.map(m => (
                  <MemberCard key={m.id} member={m} onApprove={handleApprove} onReject={handleReject} showActions />
                ))}
              </div>
            )}

            {/* Aprobados */}
            {approvedMembers.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: '#00C46A', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: 2, marginBottom: 10 }}>✅ ACTIVOS ({approvedMembers.length})</div>
                {approvedMembers.map(m => (
                  <MemberCard key={m.id} member={m} onApprove={handleApprove} onReject={handleReject} showActions={false} />
                ))}
              </div>
            )}

            {/* Rechazados */}
            {rejectedMembers.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: '#ff4d4d', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: 2, marginBottom: 10 }}>🚫 RECHAZADOS ({rejectedMembers.length})</div>
                {rejectedMembers.map(m => (
                  <MemberCard key={m.id} member={m} onApprove={handleApprove} onReject={handleReject} showActions={false} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB RESULTADOS ── */}
        {activeTab === 'resultados' && (
          <div>
            {/* Filtro por competencia */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 16, paddingBottom: 2 }}>
              <button onClick={() => setFilterComp('todos')} style={{ padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 11, fontFamily: 'Outfit, sans-serif', fontWeight: filterComp === 'todos' ? 700 : 400, background: filterComp === 'todos' ? '#F5B731' : 'rgba(255,255,255,.06)', color: filterComp === 'todos' ? '#080C16' : 'rgba(255,255,255,.4)' }}>
                Todas
              </button>
              {competitions.map(comp => (
                <button key={comp} onClick={() => setFilterComp(comp)} style={{ padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 11, fontFamily: 'Outfit, sans-serif', fontWeight: filterComp === comp ? 700 : 400, background: filterComp === comp ? '#F5B731' : 'rgba(255,255,255,.06)', color: filterComp === comp ? '#080C16' : 'rgba(255,255,255,.4)' }}>
                  {comp === 'LIGA_MX' ? '🦅 Liga MX' : comp === 'FIFA_2026' ? '🌍 FIFA 2026' : comp}
                </button>
              ))}
            </div>

            {/* Necesitan resultado */}
            {pendingMatches.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: '#f97316', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: 2, marginBottom: 10 }}>⚠️ NECESITAN RESULTADO ({pendingMatches.length})</div>
                {pendingMatches.map(match => (
                  <MatchCard key={match.id} match={match} scores={scores} setScores={setScores} savingId={savingId} onSave={handleSaveResult} highlight />
                ))}
              </div>
            )}

            {/* Próximos */}
            {upcomingMatches.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: '#555', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: 2, marginBottom: 10 }}>📅 PRÓXIMOS ({upcomingMatches.length})</div>
                {upcomingMatches.slice(0, 10).map(match => (
                  <MatchCard key={match.id} match={match} scores={scores} setScores={setScores} savingId={savingId} onSave={handleSaveResult} highlight={false} />
                ))}
              </div>
            )}

            {/* Finalizados */}
            {finishedMatches.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: '#00C46A', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: 2, marginBottom: 10 }}>✅ FINALIZADOS ({finishedMatches.length})</div>
                {finishedMatches.map(match => (
                  <div key={match.id} style={{ background: '#111520', borderRadius: 12, padding: '10px 14px', marginBottom: 8, border: '0.5px solid rgba(0,196,106,0.15)', display: 'flex', alignItems: 'center', gap: 10, opacity: 0.7 }}>
                    <span style={{ color: '#ccc', fontSize: 13, flex: 1 }}>{match.home_team}</span>
                    <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: '#00C46A', padding: '2px 14px', background: 'rgba(0,196,106,0.1)', borderRadius: 8 }}>
                      {match.home_score} - {match.away_score}
                    </span>
                    <span style={{ color: '#ccc', fontSize: 13, flex: 1, textAlign: 'right' }}>{match.away_team}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Tarjeta de miembro ──
function MemberCard({ member, onApprove, onReject, showActions }) {
  const statusColor = member.payment_status === 'approved' ? '#00C46A' : member.payment_status === 'pending' ? '#f97316' : '#ff4d4d'
  return (
    <div style={{ background: '#111520', borderRadius: 12, padding: 14, marginBottom: 8, border: `0.5px solid ${statusColor}30`, animation: 'fadeUp 0.3s ease both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: showActions ? 10 : 0 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{member.users?.name || 'Sin nombre'}</div>
          <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{member.users?.email}</div>
          {member.user?.phone && <div style={{ fontSize: 11, color: '#555' }}>📱 {member.users.phone}</div>}
          <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>📋 {member.pools?.name}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: '#F5B731' }}>{fmt(member.pools?.entry_fee || 0)}</div>
          <div style={{ fontSize: 10, color: statusColor, fontWeight: 700, marginTop: 2, textTransform: 'uppercase' }}>{member.payment_status}</div>
          {member.payment_status === 'approved' && (
            <div style={{ fontSize: 11, color: '#4FADFF', marginTop: 2 }}>{member.points || 0} pts · #{member.rank || '—'}</div>
          )}
        </div>
      </div>
      {showActions && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button onClick={() => onApprove(member)} style={{ padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'rgba(0,196,106,0.15)', color: '#00C46A', fontFamily: 'Bebas Neue, sans-serif', fontSize: 14, letterSpacing: 1 }}>✅ APROBAR</button>
          <button onClick={() => onReject(member)} style={{ padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', fontFamily: 'Bebas Neue, sans-serif', fontSize: 14, letterSpacing: 1 }}>✗ RECHAZAR</button>
        </div>
      )}
    </div>
  )
}

// ── Tarjeta de partido ──
function MatchCard({ match, scores, setScores, savingId, onSave, highlight }) {
  const isSaving = savingId === match.id
  const s = scores[match.id] || { home: '', away: '' }
  const fecha = new Date(match.scheduled_at).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Mexico_City'
  })
  return (
    <div style={{ background: '#111520', borderRadius: 12, padding: 14, marginBottom: 8, border: `0.5px solid ${highlight ? 'rgba(249,115,22,0.35)' : 'rgba(255,255,255,0.06)'}`, animation: 'fadeUp 0.3s ease both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 10, color: '#555' }}>
        <span>{match.competition === 'LIGA_MX' ? '🦅 Liga MX' : '🌍 FIFA 2026'}</span>
        <span>{fecha}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, flex: 1 }}>{match.home_team}</span>
        <span style={{ color: '#444', fontSize: 11 }}>vs</span>
        <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, flex: 1, textAlign: 'right' }}>{match.away_team}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="number" min="0" max="20" placeholder="0" value={s.home}
          onChange={e => setScores(prev => ({ ...prev, [match.id]: { ...prev[match.id], home: e.target.value } }))}
          style={{ width: 52, padding: '8px', borderRadius: 10, background: '#1a1f2e', border: '1px solid rgba(245,183,49,0.3)', color: '#fff', textAlign: 'center', fontSize: 20, fontFamily: 'Bebas Neue, sans-serif', outline: 'none' }}
        />
        <span style={{ color: '#444', fontSize: 16, fontFamily: 'Bebas Neue, sans-serif' }}>-</span>
        <input type="number" min="0" max="20" placeholder="0" value={s.away}
          onChange={e => setScores(prev => ({ ...prev, [match.id]: { ...prev[match.id], away: e.target.value } }))}
          style={{ width: 52, padding: '8px', borderRadius: 10, background: '#1a1f2e', border: '1px solid rgba(245,183,49,0.3)', color: '#fff', textAlign: 'center', fontSize: 20, fontFamily: 'Bebas Neue, sans-serif', outline: 'none' }}
        />
        <button onClick={() => onSave(match)} disabled={isSaving || s.home === '' || s.away === ''}
          style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: isSaving || s.home === '' || s.away === '' ? 'not-allowed' : 'pointer', background: isSaving || s.home === '' || s.away === '' ? '#1a1f2e' : 'linear-gradient(135deg,#F5B731,#C9930A)', color: isSaving || s.home === '' || s.away === '' ? '#444' : '#000', fontFamily: 'Bebas Neue, sans-serif', fontSize: 14, letterSpacing: 1 }}>
          {isSaving ? 'GUARDANDO...' : 'GUARDAR ⚡'}
        </button>
      </div>
    </div>
  )
}