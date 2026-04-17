// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const [loading, setLoading]         = useState(true)
  const [activeTab, setActiveTab]     = useState<'comprobantes' | 'resultados'>('comprobantes')
  const [payments, setPayments]       = useState([])
  const [matches, setMatches]         = useState([])
  const [stats, setStats]             = useState({ recaudado: 0, comision: 0, participantes: 0, pendientes: 0 })
  const [savingId, setSavingId]       = useState<string | null>(null)
  const [scores, setScores]           = useState<Record<string, { home: string; away: string }>>({})
  const [toast, setToast]             = useState<string | null>(null)

  // ── Verificar admin al entrar ──
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const { data: userData } = await supabase
        .from('users').select('is_admin').eq('id', user.id).single()

      if (!userData?.is_admin) { router.push('/dashboard'); return }

      await loadData()
      setLoading(false)
    }
    init()
  }, [])

  // ── Cargar todos los datos ──
  async function loadData() {
    // Pagos con info de usuario y quiniela
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('*, users(name, email, phone), pools(name, entry_fee)')
      .order('created_at', { ascending: false })
    setPayments(paymentsData || [])

    // Partidos sin resultado todavía
    const { data: matchesData } = await supabase
      .from('matches')
      .select('*')
      .eq('round', 'Fase de Grupos')
      .order('match_date', { ascending: true })
    setMatches(matchesData || [])

    // Stats generales
    const { data: approved } = await supabase
      .from('payments').select('amount').eq('status', 'approved')
    const total = approved?.reduce((s, p) => s + (p.amount || 0), 0) || 0
    const pending = paymentsData?.filter(p => p.status === 'pending').length || 0

    const { count: participantes } = await supabase
      .from('pool_members')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'approved')

    setStats({ recaudado: total, comision: total * 0.1, participantes: participantes || 0, pendientes: pending })
  }

  // ── Mostrar toast ──
  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // ── Aprobar pago ──
  async function handleApprove(payment) {
    const { error: e1 } = await supabase
      .from('payments').update({ status: 'approved' }).eq('id', payment.id)
    if (e1) { showToast('❌ Error al aprobar'); return }

    const { error: e2 } = await supabase
      .from('pool_members')
      .update({ payment_status: 'approved' })
      .eq('user_id', payment.user_id)
      .eq('pool_id', payment.pool_id)
    if (e2) { showToast('❌ Error actualizando membresía'); return }

    // Incrementar participantes en el pool
    await supabase.rpc('increment_participants', { p_pool_id: payment.pool_id })

    showToast('✅ Pago aprobado — usuario activo')
    await loadData()
  }

  // ── Rechazar pago ──
  async function handleReject(paymentId: string) {
    await supabase.from('payments').update({ status: 'rejected' }).eq('id', paymentId)
    showToast('🚫 Pago rechazado')
    await loadData()
  }

  // ── Ver comprobante ──
  async function verComprobante(path: string) {
    const { data } = await supabase.storage
      .from('comprobantes').createSignedUrl(path, 3600)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    else showToast('❌ No se pudo abrir el comprobante')
  }

  // ── Guardar resultado y calcular puntos ──
  async function handleSaveResult(match) {
    const s = scores[match.id]
    if (!s || s.home === '' || s.away === '') {
      showToast('⚠️ Ingresa ambos marcadores')
      return
    }

    setSavingId(match.id)
    const homeScore = parseInt(s.home)
    const awayScore = parseInt(s.away)

    // 1. Guardar resultado en matches
    const { error: matchError } = await supabase
      .from('matches')
      .update({ home_score: homeScore, away_score: awayScore, status: 'finished' })
      .eq('id', match.id)

    if (matchError) { showToast('❌ Error guardando resultado'); setSavingId(null); return }

    // 2. Obtener todas las predicciones de este partido
    const { data: predictions } = await supabase
      .from('predictions').select('*').eq('match_id', match.id)

    if (predictions && predictions.length > 0) {
      const realResult = homeScore > awayScore ? 'home' : awayScore > homeScore ? 'away' : 'draw'

      for (const pred of predictions) {
        // Calcular puntos
        const predResult = pred.predicted_home > pred.predicted_away ? 'home'
          : pred.predicted_away > pred.predicted_home ? 'away' : 'draw'

        let pts = 0
        if (pred.predicted_home === homeScore && pred.predicted_away === awayScore) {
          pts = 3 // Marcador exacto ⭐
        } else if (predResult === realResult) {
          pts = 1 // Resultado correcto
        }

        // Actualizar puntos en la predicción
        if (pts > 0) {
          await supabase
            .from('predictions').update({ points: pts }).eq('id', pred.id)

          // Sumar puntos al miembro del pool
          await supabase.rpc('add_points_to_member', {
            p_user_id: pred.user_id,
            p_pool_id: pred.pool_id,
            p_points: pts,
          })
        }
      }
    }

    // Limpiar el score del input
    setScores(prev => { const n = { ...prev }; delete n[match.id]; return n })
    setSavingId(null)
    showToast(`⚽ Resultado guardado: ${match.home_team} ${homeScore}-${awayScore} ${match.away_team}`)
    await loadData()
  }

  // ── Formato dinero ──
  const fmt = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)

  // ── Loading ──
  if (loading) return null

  const tabStyle = (tab) => ({
    padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
    fontFamily: 'Bebas Neue, sans-serif', fontSize: '0.95rem', letterSpacing: '0.08em',
    background: activeTab === tab ? '#F5B731' : 'rgba(255,255,255,0.05)',
    color: activeTab === tab ? '#000' : '#666',
    transition: 'all 0.2s',
    position: 'relative' as const,
  })

  const finishedMatches  = matches.filter(m => m.status === 'finished')
  const pendingMatches   = matches.filter(m => m.status !== 'finished' && new Date(m.match_date) < new Date())
  const upcomingMatches  = matches.filter(m => m.status !== 'finished' && new Date(m.match_date) >= new Date())

  return (
    <div style={{ background: '#0A0D12', minHeight: '100vh', fontFamily: "'Outfit', sans-serif", color: '#F0F2F8' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideIn { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      {/* ── TOAST ── */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 999, background: '#1a1f2e', border: '1px solid rgba(245,183,49,0.3)', borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 600, color: '#fff', animation: 'slideIn 0.3s ease', whiteSpace: 'nowrap', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          {toast}
        </div>
      )}

      {/* ── TOPBAR ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'rgba(10,13,18,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, letterSpacing: 2, background: 'linear-gradient(135deg,#F5B731,#00C46A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ATÍNALE
          </div>
          <div style={{ fontSize: 10, color: '#F5B731', letterSpacing: '0.15em', marginTop: -2 }}>PANEL DE ADMIN</div>
        </div>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '8px 16px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#888', fontSize: 13, cursor: 'pointer' }}>
            ← Dashboard
          </div>
        </Link>
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px 16px 80px' }}>

        {/* ── STATS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'TOTAL RECAUDADO', value: fmt(stats.recaudado), color: '#00C46A',  icon: '💰' },
            { label: 'COMISIÓN 10%',    value: fmt(stats.comision),  color: '#F5B731',  icon: '📊' },
            { label: 'PARTICIPANTES',   value: stats.participantes,  color: '#4FADFF',  icon: '👥' },
            { label: 'PAGOS PENDIENTES',value: stats.pendientes,     color: stats.pendientes > 0 ? '#f97316' : '#555', icon: '⏳' },
          ].map((card, i) => (
            <div key={i} style={{ background: '#111520', borderRadius: 14, padding: 16, border: `1px solid rgba(255,255,255,0.06)`, position: 'relative', overflow: 'hidden', animation: `fadeUp 0.4s ease ${i * 0.05}s both` }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: card.color }} />
              <div style={{ fontSize: 18, marginBottom: 6 }}>{card.icon}</div>
              <div style={{ color: '#555', fontSize: '0.68rem', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.12em', marginBottom: 4 }}>{card.label}</div>
              <div style={{ color: card.color, fontSize: '1.6rem', fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.03em', lineHeight: 1 }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* ── TABS ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button style={tabStyle('comprobantes')} onClick={() => setActiveTab('comprobantes')}>
            📎 Comprobantes
            {stats.pendientes > 0 && (
              <span style={{ marginLeft: 6, background: '#f97316', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
                {stats.pendientes}
              </span>
            )}
          </button>
          <button style={tabStyle('resultados')} onClick={() => setActiveTab('resultados')}>
            ⚽ Resultados
            {pendingMatches.length > 0 && (
              <span style={{ marginLeft: 6, background: '#F5B731', color: '#000', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
                {pendingMatches.length}
              </span>
            )}
          </button>
        </div>

        {/* ══════════════════════════════════
            TAB: COMPROBANTES
        ══════════════════════════════════ */}
        {activeTab === 'comprobantes' && (
          <div>
            {payments.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#555' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
                <p>No hay comprobantes todavía</p>
              </div>
            )}

            {/* Pendientes primero */}
            {['pending', 'approved', 'rejected'].map(statusGroup => {
              const group = payments.filter(p => p.status === statusGroup)
              if (group.length === 0) return null

              const groupLabel = statusGroup === 'pending' ? '⏳ Pendientes de revisión'
                : statusGroup === 'approved' ? '✅ Aprobados' : '🚫 Rechazados'

              return (
                <div key={statusGroup} style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10, fontFamily: 'Bebas Neue, sans-serif', fontSize: '0.85rem' }}>
                    {groupLabel} ({group.length})
                  </div>

                  {group.map(payment => (
                    <div key={payment.id} style={{ background: '#111520', borderRadius: 14, padding: 16, marginBottom: 10, border: `1px solid ${statusGroup === 'pending' ? 'rgba(249,115,22,0.3)' : statusGroup === 'approved' ? 'rgba(0,196,106,0.2)' : 'rgba(255,77,77,0.15)'}`, animation: 'fadeUp 0.3s ease both' }}>

                      {/* Info usuario */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>
                            {payment.users?.name || 'Sin nombre'}
                          </div>
                          <div style={{ color: '#666', fontSize: 12, marginTop: 2 }}>{payment.users?.email}</div>
                          {payment.users?.phone && (
                            <div style={{ color: '#555', fontSize: 12 }}>📱 {payment.users.phone}</div>
                          )}
                          <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                            📋 {payment.pools?.name}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.4rem', color: '#F5B731' }}>
                            {fmt(payment.amount)}
                          </div>
                          <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                            {new Date(payment.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      {/* Ver comprobante */}
                      {payment.receipt_url && (
                        <button
                          onClick={() => verComprobante(payment.receipt_url)}
                          style={{ width: '100%', padding: '8px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#aaa', fontSize: 13, cursor: 'pointer', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                        >
                          👁️ Ver comprobante de pago
                        </button>
                      )}

                      {/* Botones aprobar/rechazar — solo si pendiente */}
                      {statusGroup === 'pending' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <button
                            onClick={() => handleApprove(payment)}
                            style={{ padding: '11px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'rgba(0,196,106,0.15)', color: '#00C46A', fontFamily: 'Bebas Neue, sans-serif', fontSize: '1rem', letterSpacing: '0.08em', transition: 'all 0.15s' }}
                          >
                            ✅ APROBAR
                          </button>
                          <button
                            onClick={() => handleReject(payment.id)}
                            style={{ padding: '11px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', fontFamily: 'Bebas Neue, sans-serif', fontSize: '1rem', letterSpacing: '0.08em', transition: 'all 0.15s' }}
                          >
                            ✗ RECHAZAR
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}

        {/* ══════════════════════════════════
            TAB: RESULTADOS
        ══════════════════════════════════ */}
        {activeTab === 'resultados' && (
          <div>
            {/* Partidos jugados sin resultado cargado */}
            {pendingMatches.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: '0.85rem', fontFamily: 'Bebas Neue, sans-serif', color: '#f97316', letterSpacing: '0.12em', marginBottom: 10 }}>
                  ⚠️ NECESITAN RESULTADO ({pendingMatches.length})
                </div>
                {pendingMatches.map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    scores={scores}
                    setScores={setScores}
                    savingId={savingId}
                    onSave={handleSaveResult}
                    highlight
                  />
                ))}
              </div>
            )}

            {/* Próximos partidos */}
            {upcomingMatches.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: '0.85rem', fontFamily: 'Bebas Neue, sans-serif', color: '#555', letterSpacing: '0.12em', marginBottom: 10 }}>
                  📅 PRÓXIMOS PARTIDOS ({upcomingMatches.length})
                </div>
                {upcomingMatches.slice(0, 6).map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    scores={scores}
                    setScores={setScores}
                    savingId={savingId}
                    onSave={handleSaveResult}
                    highlight={false}
                  />
                ))}
              </div>
            )}

            {/* Resultados ya cargados */}
            {finishedMatches.length > 0 && (
              <div>
                <div style={{ fontSize: '0.85rem', fontFamily: 'Bebas Neue, sans-serif', color: '#00C46A', letterSpacing: '0.12em', marginBottom: 10 }}>
                  ✅ RESULTADOS CARGADOS ({finishedMatches.length})
                </div>
                {finishedMatches.map(match => (
                  <div key={match.id} style={{ background: '#111520', borderRadius: 12, padding: '12px 14px', marginBottom: 8, border: '1px solid rgba(0,196,106,0.15)', display: 'flex', alignItems: 'center', gap: 10, opacity: 0.7 }}>
                    {match.home_flag && <img src={match.home_flag} style={{ width: 22, height: 15, borderRadius: 3, objectFit: 'cover' }} />}
                    <span style={{ color: '#ccc', fontSize: 13, flex: 1 }}>{match.home_team}</span>
                    <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: '#00C46A', padding: '2px 12px', background: 'rgba(0,196,106,0.1)', borderRadius: 8 }}>
                      {match.home_score} - {match.away_score}
                    </span>
                    <span style={{ color: '#ccc', fontSize: 13, flex: 1, textAlign: 'right' }}>{match.away_team}</span>
                    {match.away_flag && <img src={match.away_flag} style={{ width: 22, height: 15, borderRadius: 3, objectFit: 'cover' }} />}
                  </div>
                ))}
              </div>
            )}

            {pendingMatches.length === 0 && upcomingMatches.length === 0 && finishedMatches.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#555' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚽</div>
                <p>No hay partidos cargados</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

// ── Componente tarjeta de partido ──
function MatchCard({ match, scores, setScores, savingId, onSave, highlight }) {
  const matchDate = new Date(match.match_date)
  const isSaving  = savingId === match.id
  const s         = scores[match.id] || { home: '', away: '' }

  return (
    <div style={{ background: '#111520', borderRadius: 14, padding: 16, marginBottom: 10, border: `1px solid ${highlight ? 'rgba(249,115,22,0.35)' : 'rgba(255,255,255,0.06)'}`, animation: 'fadeUp 0.3s ease both' }}>
      {/* Fecha y grupo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 11, color: '#555' }}>
        <span>Grupo {match.group_name}</span>
        <span>{matchDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      {/* Equipos */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
          {match.home_flag && <img src={match.home_flag} style={{ width: 26, height: 18, borderRadius: 3, objectFit: 'cover' }} />}
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{match.home_team}</span>
        </div>
        <span style={{ color: '#444', fontSize: 12 }}>vs</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' }}>
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{match.away_team}</span>
          {match.away_flag && <img src={match.away_flag} style={{ width: 26, height: 18, borderRadius: 3, objectFit: 'cover' }} />}
        </div>
      </div>

      {/* Inputs de marcador */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="number" min="0" max="20" placeholder="0"
          value={s.home}
          onChange={e => setScores(prev => ({ ...prev, [match.id]: { ...prev[match.id], home: e.target.value } }))}
          style={{ width: 56, padding: '10px 8px', borderRadius: 10, background: '#1a1f2e', border: '1px solid rgba(245,183,49,0.3)', color: '#fff', textAlign: 'center', fontSize: '1.2rem', fontFamily: 'Bebas Neue, sans-serif', outline: 'none' }}
        />
        <span style={{ color: '#444', fontSize: 18, fontFamily: 'Bebas Neue, sans-serif' }}>-</span>
        <input
          type="number" min="0" max="20" placeholder="0"
          value={s.away}
          onChange={e => setScores(prev => ({ ...prev, [match.id]: { ...prev[match.id], away: e.target.value } }))}
          style={{ width: 56, padding: '10px 8px', borderRadius: 10, background: '#1a1f2e', border: '1px solid rgba(245,183,49,0.3)', color: '#fff', textAlign: 'center', fontSize: '1.2rem', fontFamily: 'Bebas Neue, sans-serif', outline: 'none' }}
        />
        <button
          onClick={() => onSave(match)}
          disabled={isSaving || s.home === '' || s.away === ''}
          style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: isSaving || s.home === '' || s.away === '' ? 'not-allowed' : 'pointer', background: isSaving || s.home === '' || s.away === '' ? '#1a1f2e' : 'linear-gradient(135deg,#F5B731,#e0a820)', color: isSaving || s.home === '' || s.away === '' ? '#444' : '#000', fontFamily: 'Bebas Neue, sans-serif', fontSize: '0.95rem', letterSpacing: '0.08em', transition: 'all 0.15s' }}
        >
          {isSaving ? 'GUARDANDO...' : 'GUARDAR ⚡'}
        </button>
      </div>
    </div>
  )
}