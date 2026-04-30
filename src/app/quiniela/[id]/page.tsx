// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Loading from '@/app/loading'
import BottomNav from '@/components/BottomNav'

type Match = {
  id: string
  match_number: number
  home_team: string
  away_team: string
  home_flag: string
  away_flag: string
  scheduled_at: string
  status: string
  home_score: number | null
  away_score: number | null
  round: string
  group_name: string | null
  venue: string
  city: string
}

type Prediction = {
  id: string
  match_id: string
  predicted_home: number
  predicted_away: number
  points_earned: number
}

type Pool = {
  id: string
  name: string
  competition: string
  entry_fee: number
  total_pot: number
  current_participants: number
  status: string
  registration_closes_at: string
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-MX', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Mexico_City'
  })
}

function isLocked(scheduledAt: string, status: string) {
  if (status === 'live' || status === 'finished') return true
  return new Date(scheduledAt).getTime() <= Date.now()
}

// ─── PANTALLA DE BLOQUEO ─────────────────────────────────────────────────────
function PaywallScreen({ pool, onPay, paying }: {
  pool: Pool | null
  onPay: () => void
  paying: boolean
}) {
  return (
    <div style={{
      minHeight: '100vh', background: '#0A0D12',
      fontFamily: "'Outfit', 'Helvetica Neue', sans-serif",
      display: 'flex', flexDirection: 'column'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.6 } }
        .pay-btn:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(245,183,49,0.5) !important; }
        .pay-btn:active { transform: scale(0.97); }
        .back-btn:hover { background: rgba(255,255,255,0.08) !important; }
      `}</style>

      {/* Header mínimo */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <div className="back-btn" style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, cursor: 'pointer', color: '#fff',
            transition: 'background 0.2s'
          }}>←</div>
        </Link>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1,
          background: 'linear-gradient(135deg, #F5B731, #00C46A)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          {pool?.name || 'Quiniela'}
        </div>
      </div>

      {/* Contenido central */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px', gap: 0,
        animation: 'fadeUp 0.5s ease both'
      }}>

        {/* Ícono candado */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(245,183,49,0.08)',
          border: '1.5px solid rgba(245,183,49,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24, fontSize: 34
        }}>
          🔒
        </div>

        {/* Título */}
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 28, letterSpacing: 1, color: '#fff',
          textAlign: 'center', marginBottom: 10
        }}>
          Esta quiniela requiere pago
        </div>

        {/* Subtítulo */}
        <div style={{
          fontSize: 14, color: '#6B7280', textAlign: 'center',
          lineHeight: 1.6, maxWidth: 280, marginBottom: 28
        }}>
          Únete para hacer tus predicciones y competir por el premio
        </div>

        {/* Card info del pozo */}
        <div style={{
          background: '#111520', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: '20px 28px', marginBottom: 28,
          width: '100%', maxWidth: 340, textAlign: 'center'
        }}>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Pozo acumulado</div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 36,
            color: '#F5B731', letterSpacing: 1, lineHeight: 1
          }}>
            ${((pool?.total_pot || 0) * 0.9).toLocaleString('es-MX')}
          </div>
          <div style={{ fontSize: 11, color: '#444E60', marginTop: 4 }}>
            Premio neto (90% del pozo total)
          </div>

          <div style={{
            marginTop: 16, paddingTop: 16,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', justifyContent: 'space-between', gap: 16
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
                {pool?.current_participants || 0}
              </div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>Participantes</div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#00C46A' }}>
                ${(pool?.entry_fee || 0).toLocaleString('es-MX')}
              </div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>Costo de entrada</div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>10%</div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>Comisión</div>
            </div>
          </div>
        </div>

        {/* Botón pagar */}
        <button
          className="pay-btn"
          onClick={onPay}
          disabled={paying}
          style={{
            width: '100%', maxWidth: 340,
            padding: '18px 24px', borderRadius: 14, border: 'none',
            background: paying ? 'rgba(245,183,49,0.4)' : 'linear-gradient(135deg, #F5B731, #C9930A)',
            color: '#0A0D12', fontFamily: "'Outfit', sans-serif",
            fontWeight: 800, fontSize: 17, cursor: paying ? 'not-allowed' : 'pointer',
            boxShadow: '0 8px 28px rgba(245,183,49,0.35)',
            transition: 'all 0.25s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
          }}
        >
          {paying ? (
            <>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#0A0D12',
                animation: 'spin 0.7s linear infinite'
              }} />
              Abriendo pago...
            </>
          ) : (
            <>
              💳 Pagar ${(pool?.entry_fee || 0).toLocaleString('es-MX')} con Mercado Pago
            </>
          )}
        </button>

        {/* Nota transparencia */}
        <div style={{
          marginTop: 16, fontSize: 11, color: '#444E60',
          textAlign: 'center', lineHeight: 1.6
        }}>
          El pago se procesa de forma segura con Mercado Pago.<br />
          La comisión del 10% siempre es visible para todos.
        </div>

      </div>
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ────────────────────────────────────────────────────────
export default function QuinielaPredictions() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()
  const params = useParams()
  const poolId = params?.id as string

  const [pool, setPool] = useState<Pool | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({})
  const [drafts, setDrafts] = useState<Record<string, { home: string; away: string }>>({})
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeGroup, setActiveGroup] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null) // null = cargando
  const [paying, setPaying] = useState(false)

  useEffect(() => { loadData() }, [poolId])

  async function loadData() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/'); return }
    setUserId(session.user.id)

    // Cargar pool
    const { data: poolData } = await supabase
      .from('pools').select('*').eq('id', poolId).single()
    setPool(poolData)

    // ── VERIFICAR PAGO ──────────────────────────────────────────────────────
    const { data: memberData } = await supabase
      .from('pool_members')
      .select('payment_status')
      .eq('pool_id', poolId)
      .eq('user_id', session.user.id)
      .single()

    const status = memberData?.payment_status ?? 'none'
    setPaymentStatus(status)

    // Si no está aprobado, no necesitamos cargar partidos aún
    if (status !== 'approved') {
      setLoading(false)
      return
    }

    // Cargar partidos solo si el pago está aprobado
    const comp = poolData?.competition
    const roundFilter = poolData?.round_filter

    let matchQuery = supabase
      .from('matches')
      .select('*')
      .eq('competition', comp)
      .order('scheduled_at', { ascending: true })

    if (roundFilter) {
      matchQuery = matchQuery.eq('round', roundFilter)
    }

    const { data: matchData } = await matchQuery

      setMatches(matchData || [])
      if (matchData && matchData.length > 0) {
        const firstGroup = matchData[0].group_name || 'Jornada'
        setActiveGroup(firstGroup)
      }

    const { data: predData } = await supabase
 
      .from('predictions')
      .select('*')
      .eq('pool_id', poolId)
      .eq('user_id', session.user.id)

    const predMap: Record<string, Prediction> = {}
    const draftMap: Record<string, { home: string; away: string }> = {}
    for (const p of predData || []) {
      predMap[p.match_id] = p
      draftMap[p.match_id] = { home: String(p.predicted_home), away: String(p.predicted_away) }
    }
    setPredictions(predMap)
    setDrafts(draftMap)
    setLoading(false)
  }

  // ── INICIAR PAGO CON MERCADO PAGO ─────────────────────────────────────────
  async function handlePay() {
    if (!pool || !userId) return
    setPaying(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch('/api/mp/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pool_id: poolId,
          user_id: userId,
          pool_name: pool.name,
          entry_fee: pool.entry_fee,
          user_email: session?.user?.email || ''
        })
      })

      const data = await res.json()

      if (data.init_point) {
        // Redirigir a Mercado Pago
        window.location.href = data.init_point
      } else {
        throw new Error('No se obtuvo init_point')
      }
    } catch (err) {
      console.error('Error al crear preferencia:', err)
      showToast('❌ Error al iniciar el pago. Intenta de nuevo.', 'err')
      setPaying(false)
    }
  }

  function showToast(msg: string, type: 'ok' | 'err') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const pendingDrafts = Object.entries(drafts).filter(([matchId, draft]) => {
    if (draft.home === '' || draft.away === '') return false
    const existing = predictions[matchId]
    if (!existing) return true
    return existing.predicted_home !== parseInt(draft.home) ||
           existing.predicted_away !== parseInt(draft.away)
  })

  async function saveAll() {
    if (pendingDrafts.length === 0) return
    setSaving(true)
    let errorCount = 0

    for (const [matchId, draft] of pendingDrafts) {
      const home = parseInt(draft.home)
      const away = parseInt(draft.away)
      if (isNaN(home) || isNaN(away) || home < 0 || away < 0) continue

      const existing = predictions[matchId]
      if (existing?.id) {
        const { error } = await supabase
          .from('predictions')
          .update({ predicted_home: home, predicted_away: away })
          .eq('id', existing.id)
        if (error) errorCount++
      } else {
        const { error } = await supabase
          .from('predictions')
          .insert({
            pool_id: poolId, match_id: matchId, user_id: userId,
            predicted_home: home, predicted_away: away, points_earned: 0
          })
        if (error) errorCount++
      }
    }

    setSaving(false)

    if (errorCount > 0) {
      showToast(`❌ ${errorCount} predicciones no se guardaron`, 'err')
    } else {
      showToast(`✅ ${pendingDrafts.length} predicciones guardadas`, 'ok')
      const { data: predData } = await supabase
        .from('predictions').select('*')
        .eq('pool_id', poolId).eq('user_id', userId)

      const predMap: Record<string, Prediction> = {}
      const draftMap: Record<string, { home: string; away: string }> = {}
      for (const p of predData || []) {
        predMap[p.match_id] = p
        draftMap[p.match_id] = { home: String(p.predicted_home), away: String(p.predicted_away) }
      }
      setPredictions(predMap)
      setDrafts(draftMap)
    }
  }

  const groups: Record<string, Match[]> = {}
    for (const m of matches) {
      const g = m.group_name || 'Jornada'
      if (!groups[g]) groups[g] = []
      groups[g].push(m)
    }
  const groupKeys = Object.keys(groups).sort()
  const totalGroup = matches.filter(m => !isLocked(m.scheduled_at, m.status)).length
  const predictedCount = Object.keys(predictions).length
  const pct = totalGroup > 0 ? Math.round((predictedCount / totalGroup) * 100) : 0

  // ── ESTADOS DE CARGA ──────────────────────────────────────────────────────
  if (loading) return <Loading />

  // ── GUARD: SIN PAGO APROBADO ──────────────────────────────────────────────
  if (paymentStatus !== 'approved') {
    return (
      <>
        {toast && (
          <div style={{
            position: 'fixed', bottom: 32, left: '50%',
            transform: 'translateX(-50%)', zIndex: 999,
            padding: '13px 28px', borderRadius: 50,
            background: '#FF4D6D', color: '#fff',
            fontWeight: 700, fontSize: 14,
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap'
          }}>
            {toast.msg}
          </div>
        )}
        <PaywallScreen pool={pool} onPay={handlePay} paying={paying} />
      </>
    )
  }

  // ── PÁGINA NORMAL DE PREDICCIONES (solo si pago aprobado) ─────────────────
  return (
    <div style={{
      background: '#0A0D12', minHeight: '100vh',
      fontFamily: "'Outfit', 'Helvetica Neue', sans-serif", color: '#F0F2F8'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(16px) } to { opacity:1; transform:translateX(-50%) translateY(0) } }
        @keyframes floatIn { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        .score-input::-webkit-inner-spin-button,
        .score-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .score-input { -moz-appearance: textfield; }
        .score-input:focus { background: rgba(245,183,49,0.18) !important; border-color: rgba(245,183,49,0.5) !important; outline: none; }
        .group-tab:hover { color: #F0F2F8 !important; }
        .match-card { transition: border-color 0.25s; }
        .match-card:hover { border-color: rgba(245,183,49,0.25) !important; }
        .save-all-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 35px rgba(245,183,49,0.5) !important; }
        .save-all-btn:active { transform: scale(0.97); }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 100, left: '50%',
          transform: 'translateX(-50%)', zIndex: 999,
          padding: '13px 28px', borderRadius: 50,
          background: toast.type === 'ok' ? '#00C46A' : '#FF4D6D',
          color: '#fff', fontWeight: 700, fontSize: 14,
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          animation: 'toastIn 0.3s ease both', whiteSpace: 'nowrap'
        }}>
          {toast.msg}
        </div>
      )}

      {pendingDrafts.length > 0 && (
        <div style={{ position: 'fixed', bottom: 90, right: 16, zIndex: 200, animation: 'floatIn 0.3s ease both' }}>
          <button
            className="save-all-btn"
            onClick={saveAll}
            disabled={saving}
            style={{
              padding: '14px 22px', borderRadius: 50, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #F5B731, #C9930A)',
              color: '#0A0D12', fontFamily: "'Outfit', sans-serif",
              fontWeight: 800, fontSize: 15,
              boxShadow: '0 8px 25px rgba(245,183,49,0.4)',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
              opacity: saving ? 0.8 : 1
            }}
          >
            {saving ? (
              <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#0A0D12', animation: 'spin 0.7s linear infinite' }} />Guardando...</>
            ) : (
              <>💾 Guardar {pendingDrafts.length} {pendingDrafts.length === 1 ? 'predicción' : 'predicciones'}</>
            )}
          </button>
        </div>
      )}

      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,13,18,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '14px 16px'
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, cursor: 'pointer'
            }}>←</div>
          </Link>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 1,
              background: 'linear-gradient(135deg, #F5B731, #00C46A)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1
            }}>
              {pool?.name || 'Quiniela'}
            </div>
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{matches.length} partidos</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: pct === 100 ? '#00C46A' : '#F5B731', lineHeight: 1 }}>{pct}%</div>
            <div style={{ fontSize: 10, color: '#6B7280' }}>{predictedCount}/{totalGroup}</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '14px 14px 140px' }}>

        <div style={{
          background: '#111520', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, padding: '14px 16px', marginBottom: 14,
          animation: 'fadeUp 0.4s ease both'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Tu progreso</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{predictedCount} de {totalGroup} partidos predichos</div>
            </div>
            {pendingDrafts.length > 0 && (
              <div style={{ fontSize: 11, color: '#F5B731', fontWeight: 600, background: 'rgba(245,183,49,0.1)', padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                ✏️ {pendingDrafts.length} sin guardar
              </div>
            )}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 6, height: 7, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 6, width: `${Math.min(pct, 100)}%`,
              background: pct === 100 ? 'linear-gradient(90deg, #00C46A, #00864A)' : 'linear-gradient(90deg, #F5B731, #00C46A)',
              transition: 'width 0.8s ease'
            }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
          {groupKeys.map(g => {
            const groupMatches = groups[g] || []
            const groupPredicted = groupMatches.filter(m => predictions[m.id]).length
            const allPredicted = groupPredicted === groupMatches.length
            return (
              <button
                key={g} className="group-tab" onClick={() => setActiveGroup(g)}
                style={{
                  padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  whiteSpace: 'nowrap', fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700, fontSize: 13, flexShrink: 0,
                  background: activeGroup === g ? 'linear-gradient(135deg, #F5B731, #C9930A)' : allPredicted ? 'rgba(0,196,106,0.12)' : 'rgba(255,255,255,0.05)',
                  color: activeGroup === g ? '#0A0D12' : allPredicted ? '#00C46A' : '#6B7280',
                  transition: 'all 0.2s',
                  border: allPredicted && activeGroup !== g ? '1px solid rgba(0,196,106,0.2)' : '1px solid transparent'
                }}
              >
                {allPredicted && activeGroup !== g ? '✓ ' : ''}Grupo {g}
              </button>
            )
          })}
        </div>

        {(groups[activeGroup] || []).map((match, i) => {
          const locked = isLocked(match.scheduled_at, match.status)
          const pred = predictions[match.id]
          const draft = drafts[match.id] || { home: '', away: '' }
          const hasDraft = draft.home !== '' && draft.away !== ''
          const isChanged = hasDraft && (!pred || pred.predicted_home !== parseInt(draft.home) || pred.predicted_away !== parseInt(draft.away))

          return (
            <div key={match.id} className="match-card" style={{
              background: '#111520',
              border: `1px solid ${pred && !isChanged ? 'rgba(0,196,106,0.3)' : isChanged ? 'rgba(245,183,49,0.3)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 16, marginBottom: 10, overflow: 'hidden',
              animation: `fadeUp 0.35s ease ${i * 0.03}s both`,
              opacity: locked && !pred ? 0.55 : 1
            }}>
              <div style={{
                padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: locked ? 'rgba(255,255,255,0.015)' : 'transparent'
              }}>
                <div style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                  🕐 {formatDate(match.scheduled_at)}
                  {match.city && <span style={{ color: '#444E60' }}>· 📍 {match.city}</span>}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {pred && !isChanged && <div style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(0,196,106,0.15)', color: '#00C46A', fontWeight: 600 }}>✓ Guardado</div>}
                  {isChanged && <div style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(245,183,49,0.15)', color: '#F5B731', fontWeight: 600 }}>✏️ Editado</div>}
                  {locked && <div style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(107,114,128,0.15)', color: '#6B7280', fontWeight: 600 }}>🔒</div>}
                </div>
              </div>

              <div style={{ padding: '16px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  {match.home_flag && <img src={match.home_flag} style={{ width: 32, height: 32, objectFit: 'contain' }} />}
                  <div style={{ fontSize: 11, fontWeight: 600, textAlign: 'center', maxWidth: 80, lineHeight: 1.2 }}>{match.home_team}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="number" min="0" max="20" className="score-input" disabled={locked}
                    value={match.home_score !== null ? String(match.home_score) : draft.home}
                    onChange={e => setDrafts(prev => ({ ...prev, [match.id]: { home: e.target.value, away: prev[match.id]?.away ?? '' } }))}
                    placeholder="–"
                    style={{ width: 54, height: 54, borderRadius: 12, background: locked ? 'rgba(255,255,255,0.04)' : 'rgba(245,183,49,0.08)', color: locked ? '#4B5563' : '#F5B731', fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, textAlign: 'center', border: '1px solid', borderColor: locked ? 'rgba(255,255,255,0.05)' : isChanged ? 'rgba(245,183,49,0.4)' : 'rgba(245,183,49,0.15)', cursor: locked ? 'not-allowed' : 'text', transition: 'all 0.2s' }}
                  />
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: '#374151' }}>-</div>
                  <input type="number" min="0" max="20" className="score-input" disabled={locked}
                    value={match.away_score !== null ? String(match.away_score) : draft.away}
                    onChange={e => setDrafts(prev => ({ ...prev, [match.id]: { home: prev[match.id]?.home ?? '', away: e.target.value } }))}
                    placeholder="–"
                    style={{ width: 54, height: 54, borderRadius: 12, background: locked ? 'rgba(255,255,255,0.04)' : 'rgba(245,183,49,0.08)', color: locked ? '#4B5563' : '#F5B731', fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, textAlign: 'center', border: '1px solid', borderColor: locked ? 'rgba(255,255,255,0.05)' : isChanged ? 'rgba(245,183,49,0.4)' : 'rgba(245,183,49,0.15)', cursor: locked ? 'not-allowed' : 'text', transition: 'all 0.2s' }}
                  />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  {match.away_flag && <img src={match.away_flag} style={{ width: 32, height: 32, objectFit: 'contain' }} />}
                  <div style={{ fontSize: 11, fontWeight: 600, textAlign: 'center', maxWidth: 80, lineHeight: 1.2 }}>{match.away_team}</div>
                </div>
              </div>

              {locked && pred && (
                <div style={{ padding: '8px 14px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>Tu pred:</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: '#F5B731', background: 'rgba(245,183,49,0.1)', padding: '2px 12px', borderRadius: 8 }}>
                      {pred.predicted_home} - {pred.predicted_away}
                    </div>
                  </div>
                  {match.home_score !== null && (() => {
                    const realResult = match.home_score > match.away_score ? 'home' : match.away_score > match.home_score ? 'away' : 'draw'
                    const predResult = pred.predicted_home > pred.predicted_away ? 'home' : pred.predicted_away > pred.predicted_home ? 'away' : 'draw'
                    const exacto = pred.predicted_home === match.home_score && pred.predicted_away === match.away_score
                    const acierto = predResult === realResult
                    const emoji = exacto ? '🎯' : acierto ? '✅' : '❌'
                    const pts = exacto ? 3 : acierto ? 1 : 0
                    return (
                      <div style={{ fontSize: 13, fontWeight: 700, color: exacto ? '#F5B731' : acierto ? '#00C46A' : '#ff4d4d' }}>
                        {emoji} {pts > 0 ? `+${pts} pts` : 'Sin puntos'}
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          )
        })}
      </div>

    <BottomNav />
    </div>
  )
}