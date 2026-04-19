// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Loading from '@/app/loading'

const EMOJIS = [
  '⚽','🏆','🎯','🔥','👑','⚡','🦁','🐯','🦅','🐺',
  '🚀','💀','🌟','🏹','🦊','🐉','🎪','🎭','💎','🛡️',
  '⚔️','🌪️','🦈','🐆','🏔️','🌊','🎸','🤖','👾','🃏',
  '🧨','🎲','🦋','🌙','☄️','🎠','🦚','🐝','🌵','🎯'
]

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

function PoolCopyButtons({ code }) {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  function copyCode() {
    navigator.clipboard?.writeText(code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  function copyLink() {
    navigator.clipboard?.writeText(`${window.location.origin}/unirse/${code}`)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        onClick={copyCode}
        style={{ flex: 1, fontSize: 12, padding: '8px 0', borderRadius: 10, background: copiedCode ? 'rgba(0,196,106,0.12)' : 'rgba(245,183,49,0.08)', border: `0.5px solid ${copiedCode ? 'rgba(0,196,106,0.4)' : 'rgba(245,183,49,0.3)'}`, color: copiedCode ? '#00C46A' : '#F5B731', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
        {copiedCode ? '✅ ¡Copiado!' : '📋 Copiar código'}
      </button>
      <button
        onClick={copyLink}
        style={{ flex: 1, fontSize: 12, padding: '8px 0', borderRadius: 10, background: copiedLink ? 'rgba(0,196,106,0.12)' : 'rgba(255,255,255,0.04)', border: `0.5px solid ${copiedLink ? 'rgba(0,196,106,0.4)' : 'rgba(255,255,255,0.1)'}`, color: copiedLink ? '#00C46A' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
        {copiedLink ? '✅ ¡Copiado!' : '🔗 Copiar link'}
      </button>
    </div>
  )
}

export default function Perfil() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [myPools, setMyPools] = useState([])
  const [predictions, setPredictions] = useState([])
  const [payments, setPayments] = useState([])
  const [myCreatedPools, setMyCreatedPools] = useState([])
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editAlias, setEditAlias] = useState('')
  const [editEmoji, setEditEmoji] = useState('⚽')
  const [editPhone, setEditPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => { loadPerfil() }, [])

  async function loadPerfil() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/'); return }

    const { data: userData } = await supabase
      .from('users').select('*').eq('id', session.user.id).single()
    setUser(userData)
    setEditAlias(userData?.name || '')
    setEditEmoji(userData?.emoji || '⚽')
    setEditPhone(userData?.phone || '')

    const { data: memberData } = await supabase
      .from('pool_members')
      .select('id, points, rank, payment_status, pool:pools(id, name, competition, entry_fee, status, access_code, type)')
      .eq('user_id', session.user.id)
    setMyPools(memberData || [])

    const { data: predsData } = await supabase
      .from('predictions')
      .select('id, points_earned, created_at, match:matches(home_team, away_team, home_flag, away_flag, home_score, away_score, status)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    setPredictions(predsData || [])

   const { data: createdPools } = await supabase
      .from('pools')
      .select('id, name, competition, entry_fee, max_participants, current_participants, total_pot, creator_commission_pct, access_code, status')
      .eq('creator_id', session.user.id)
      .order('created_at', { ascending: false })

    if (createdPools && createdPools.length > 0) {
      const poolIds = createdPools.map(p => p.id)
      const { data: membersData } = await supabase
        .from('pool_members')
        .select('id, pool_id, payment_status, user_id, users(name, emoji)')
        .in('pool_id', poolIds)
      
      const poolsWithMembers = createdPools.map(pool => ({
        ...pool,
        pool_members: (membersData || []).filter(m => m.pool_id === pool.id)
      }))
      setMyCreatedPools(poolsWithMembers)
    } else {
      setMyCreatedPools([])
    }

    const { data: paysData } = await supabase
      .from('payments')
      .select('id, amount, status, created_at, pool:pools(name)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    setPayments(paysData || [])

    setLoading(false)
  }

  async function guardarEdicion() {
    if (!editAlias.trim()) { setSaveMsg('El apodo no puede estar vacío'); return }
    if (editAlias.trim().length > 20) { setSaveMsg('Máximo 20 caracteres'); return }
    setSaving(true)
    setSaveMsg('')
    const { data: { session } } = await supabase.auth.getSession()
    const { error } = await supabase
      .from('users')
      .update({
        name: editAlias.trim(),
        emoji: editEmoji,
        phone: editPhone.trim(),
      })
      .eq('id', session.user.id)

    if (error) { setSaveMsg('Error al guardar. Intenta de nuevo.'); setSaving(false); return }
    setUser(prev => ({ ...prev, name: editAlias.trim(), emoji: editEmoji, phone: editPhone.trim() }))
    setSaving(false)
    setSaveMsg('¡Guardado!')
    setTimeout(() => { setSaveMsg(''); setEditOpen(false) }, 1200)
  }

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <Loading />

  const totalPoints = user?.total_points || 0
  const quinielasAprobadas = myPools.filter(m => m.payment_status === 'approved').length
  const exactos = predictions.filter(p => p.points_earned === 3).length
  const bestRank = myPools.reduce((best, m) => {
    if (m.rank && (!best || m.rank < best)) return m.rank
    return best
  }, null)

  // BADGES automáticos
  const badges = []
  if (payments.some(p => p.status === 'approved')) badges.push({ icon: '💳', label: 'Primer pago', color: '#00C46A' })
  if (exactos > 0) badges.push({ icon: '🎯', label: 'Primer exacto', color: '#F5B731' })
  if (bestRank && bestRank <= 3) badges.push({ icon: '🥉', label: 'Top 3', color: '#CD7C3A' })
  if (bestRank === 1) badges.push({ icon: '👑', label: 'Líder', color: '#F5B731' })
  if (quinielasAprobadas >= 3) badges.push({ icon: '🔥', label: 'Fan activo', color: '#E24B4A' })
  if (user?.referred_by) badges.push({ icon: '🤝', label: 'Referido', color: '#4FADFF' })

  // FEED últimos 5 eventos
  const feedItems = []
  myPools.forEach(m => {
    feedItems.push({
      icon: '🎟️',
      text: `Te uniste a ${m.pool?.name}`,
      time: new Date().toISOString(),
      color: '#4FADFF',
    })
    if (m.payment_status === 'approved') {
      feedItems.push({
        icon: '✅',
        text: `Pago aprobado · ${m.pool?.name}`,
        time: new Date().toISOString(),
        color: '#00C46A',
      })
    }
  })
  predictions.filter(p => p.points_earned > 0).forEach(p => {
    feedItems.push({
      icon: p.points_earned === 3 ? '🎯' : '✓',
      text: `+${p.points_earned}pts · ${p.match?.home_team} vs ${p.match?.away_team}`,
      time: p.created_at,
      color: p.points_earned === 3 ? '#F5B731' : '#00C46A',
    })
  })
  feedItems.sort((a, b) => new Date(b.time) - new Date(a.time))
  const feed = feedItems.slice(0, 5)

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `hace ${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `hace ${hrs}h`
    const days = Math.floor(hrs / 24)
    return `hace ${days}d`
  }

  return (
    <div style={{ background: '#080C16', minHeight: '100vh', fontFamily: "'Outfit','Helvetica Neue',sans-serif", color: '#F0F2F8', paddingBottom: 100 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes spin-cw  { to { transform: translate(-50%,-50%) rotate(360deg)  } }
        @keyframes spin-ccw { to { transform: translate(-50%,-50%) rotate(-360deg) } }
        .edit-input {
          width: 100%; background: #0d1220;
          border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 11px 14px;
          color: #fff; font-size: 14px;
          font-family: 'Outfit', sans-serif;
          outline: none; margin-bottom: 12px;
          transition: border-color 0.2s;
        }
        .edit-input:focus { border-color: rgba(245,183,49,0.4); }
        .edit-input::placeholder { color: rgba(255,255,255,0.2); }
        .emj-btn {
          aspect-ratio: 1; background: transparent;
          border: 1.5px solid transparent; border-radius: 6px;
          font-size: 18px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, border-color 0.15s;
        }
        .emj-btn:hover { background: rgba(245,183,49,0.08); }
        .emj-btn.sel { border-color: #F5B731; background: rgba(245,183,49,0.12); }
        .pool-card { background: #111520; border: 0.5px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 14px 16px; margin-bottom: 10px; }
        .feed-row { display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; border-bottom: 0.5px solid rgba(255,255,255,0.05); }
        .feed-row:last-child { border-bottom: none; }
        .badge-pill { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 500; }
        .sec-label { font-size: 10px; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
        .sec-label::after { content: ''; flex: 1; height: 0.5px; background: rgba(255,255,255,0.06); }
      `}</style>

      {/* TOPBAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', background: 'rgba(8,12,22,0.97)', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', cursor: 'pointer' }}>←</div>
        </Link>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 3, color: '#F5B731' }}>MI PERFIL</div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>

        {/* HERO */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24, animation: 'fadeUp 0.4s ease both' }}>
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'rgba(245,183,49,0.1)', border: '2px solid rgba(245,183,49,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>
              {user?.emoji || '⚽'}
            </div>
            <button
              onClick={() => setEditOpen(o => !o)}
              style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: '#F5B731', border: '2px solid #080C16', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, cursor: 'pointer', color: '#080C16', fontWeight: 700 }}>
              ✏
            </button>
          </div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: 2 }}>{user?.name}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3, marginBottom: 10 }}>{user?.email}</div>
          {user?.referral_code && (
            <div
              onClick={() => navigator.clipboard?.writeText(user.referral_code)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,183,49,0.08)', border: '0.5px solid rgba(245,183,49,0.25)', borderRadius: 20, padding: '5px 14px', fontSize: 12, color: '#F5B731', cursor: 'pointer' }}>
              🔗 Código: {user.referral_code} · Copiar
            </div>
          )}
        </div>

        {/* PANEL EDICIÓN */}
        {editOpen && (
          <div style={{ background: '#111520', border: '0.5px solid rgba(245,183,49,0.2)', borderRadius: 16, padding: 16, marginBottom: 20, animation: 'fadeUp 0.25s ease both' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Apodo público</div>
            <input className="edit-input" value={editAlias} onChange={e => setEditAlias(e.target.value.slice(0, 20))} placeholder="Tu apodo en el ranking" maxLength={20} />
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Teléfono WhatsApp</div>
            <input className="edit-input" type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10 dígitos" />
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Tu emoji</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 3, marginBottom: 14 }}>
              {EMOJIS.map((e, i) => (
                <button key={i} className={`emj-btn${editEmoji === e ? ' sel' : ''}`} onClick={() => setEditEmoji(e)}>{e}</button>
              ))}
            </div>
            {saveMsg && (
              <div style={{ fontSize: 13, color: saveMsg === '¡Guardado!' ? '#00C46A' : '#E24B4A', textAlign: 'center', marginBottom: 10 }}>{saveMsg}</div>
            )}
            <button
              onClick={guardarEdicion}
              disabled={saving}
              style={{ width: '100%', background: '#F5B731', color: '#080C16', border: 'none', borderRadius: 50, padding: '13px', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'inherit' }}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        )}

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20, animation: 'fadeUp 0.4s ease 0.05s both' }}>
          {[
            { label: 'Puntos totales',       value: totalPoints,           color: '#F5B731' },
            { label: 'Mejor posición',        value: bestRank ? `#${bestRank}` : '—', color: '#00C46A' },
            { label: 'Quinielas jugadas',     value: quinielasAprobadas,    color: '#4FADFF' },
            { label: 'Predicciones exactas',  value: exactos,               color: '#F5B731' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#111520', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.color, borderRadius: '14px 14px 0 0' }} />
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* LOGROS */}
        {badges.length > 0 && (
          <div style={{ marginBottom: 20, animation: 'fadeUp 0.4s ease 0.1s both' }}>
            <div className="sec-label">Logros</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {badges.map((b, i) => (
                <div key={i} className="badge-pill" style={{ background: `${b.color}18`, border: `0.5px solid ${b.color}40`, color: b.color }}>
                  {b.icon} {b.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MIS QUINIELAS */}
        <div style={{ marginBottom: 20, animation: 'fadeUp 0.4s ease 0.12s both' }}>
          <div className="sec-label">Mis quinielas</div>
          {myPools.length === 0 ? (
            <div style={{ background: '#111520', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
              <div style={{ fontSize: 13 }}>Aún no te has unido a ninguna quiniela</div>
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <button style={{ marginTop: 12, padding: '8px 20px', borderRadius: 20, background: '#F5B731', color: '#080C16', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Ver quinielas →
                </button>
              </Link>
            </div>
          ) : (
            myPools.map(m => (
              <div key={m.id} className="pool-card" style={{ borderLeft: `3px solid ${compColor(m.pool?.competition)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{m.pool?.name}</div>
                    <div style={{ fontSize: 10, color: compColor(m.pool?.competition), fontWeight: 700, letterSpacing: 1 }}>{compLabel(m.pool?.competition)}</div>
                  </div>
                  <div style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: m.payment_status === 'approved' ? 'rgba(0,196,106,0.12)' : 'rgba(245,183,49,0.12)', color: m.payment_status === 'approved' ? '#00C46A' : '#F5B731' }}>
                    {m.pool?.status === 'open' ? '✅ Activa' : m.pool?.status === 'closed' ? '🔒 Cerrada' : '⏳ Pendiente'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>MIS PUNTOS</div>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: '#F5B731', lineHeight: 1 }}>{m.points || 0}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>POSICIÓN</div>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: '#00C46A', lineHeight: 1 }}>{m.rank ? `#${m.rank}` : '—'}</div>
                  </div>
                </div>
                {m.pool?.access_code && m.pool?.type === 'private' && (
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Link invitación:</div>
                    <div style={{ fontSize: 11, color: '#F5B731', fontWeight: 700, letterSpacing: 1 }}>{m.pool.access_code}</div>
                    <button
                      onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/unirse/${m.pool.access_code}`)}
                      style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(245,183,49,0.1)', border: '0.5px solid rgba(245,183,49,0.3)', color: '#F5B731', cursor: 'pointer', fontFamily: 'inherit' }}>
                      📋 Copiar link
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* SALAS QUE ADMINISTRO */}
        {myCreatedPools.length > 0 && (
          <div style={{ marginBottom: 20, animation: 'fadeUp 0.4s ease 0.13s both' }}>
            <div className="sec-label">
              Salas que administro
              <span style={{ fontSize: 11, background: 'rgba(245,183,49,0.12)', color: '#F5B731', borderRadius: 20, padding: '2px 8px', fontWeight: 600, letterSpacing: 0 }}>
                {myCreatedPools.length}
              </span>
            </div>
            {myCreatedPools.map(pool => {
              const filled = pool.current_participants || 0
              const max = pool.max_participants || 1
              const pct = Math.round((filled / max) * 100)
              const commPct = pool.creator_commission_pct || 3
              const comm = Math.round((pool.total_pot || 0) * commPct / 100)
              return (
                <div key={pool.id} className="pool-card" style={{ borderLeft: `3px solid ${compColor(pool.competition)}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{pool.name}</div>
                      <div style={{ fontSize: 10, color: compColor(pool.competition), fontWeight: 700, letterSpacing: 1 }}>{compLabel(pool.competition)}</div>
                    </div>
                    <div style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: pool.status === 'open' ? 'rgba(0,196,106,0.12)' : 'rgba(226,75,74,0.12)', color: pool.status === 'open' ? '#00C46A' : '#E24B4A' }}>
                      {pool.status === 'open' ? 'Abierta' : 'Cerrada'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 10, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>ENTRADA</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#F5B731' }}>${(pool.entry_fee || 0).toLocaleString('es-MX')}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>PARTICIPANTES</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#F0F2F8' }}>{filled} / {max}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>POZO</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#F5B731' }}>${(pool.total_pot || 0).toLocaleString('es-MX')}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>MI COMISIÓN ({commPct}%)</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#00C46A' }}>${comm.toLocaleString('es-MX')}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 5 }}>
                      <div style={{ width: `${pct}%`, background: '#F5B731', borderRadius: 4, height: 5, transition: 'width 0.4s' }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{pct}%</span>
                  </div>
                  {pool.pool_members && pool.pool_members.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Participantes</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {pool.pool_members.map((m, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 16 }}>{m.user?.emoji || '⚽'}</span>
                              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{m.user?.name || 'Usuario'}</span>
                            </div>
                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600, background: m.payment_status === 'approved' ? 'rgba(0,196,106,0.12)' : 'rgba(245,183,49,0.12)', color: m.payment_status === 'approved' ? '#00C46A' : '#F5B731' }}>
                              {m.payment_status === 'approved' ? '✅ Pagó' : '⏳ Pendiente'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {pool.access_code && (
                    <PoolCopyButtons code={pool.access_code} />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* FEED ACTIVIDAD */}
        {feed.length > 0 && (
          <div style={{ marginBottom: 20, animation: 'fadeUp 0.4s ease 0.15s both' }}>
            <div className="sec-label">Actividad reciente</div>
            <div style={{ background: '#111520', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '4px 14px' }}>
              {feed.map((f, i) => (
                <div key={i} className="feed-row">
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginTop: 2 }}>{f.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{f.text}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{timeAgo(f.time)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CERRAR SESIÓN */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          style={{ width: '100%', padding: 14, borderRadius: 14, background: 'rgba(226,75,74,0.08)', border: '0.5px solid rgba(226,75,74,0.25)', color: '#E24B4A', fontFamily: 'inherit', fontWeight: 700, fontSize: 15, cursor: signingOut ? 'not-allowed' : 'pointer', opacity: signingOut ? 0.6 : 1, animation: 'fadeUp 0.4s ease 0.2s both' }}>
          {signingOut ? '⏳ Cerrando sesión...' : '🚪 Cerrar sesión'}
        </button>

      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,13,18,0.97)', borderTop: '0.5px solid rgba(255,255,255,0.07)', display: 'flex', padding: '8px 0 20px' }}>
        {[
          { icon: '🏠', label: 'Inicio',    href: '/dashboard', active: false },
          { icon: '⚽', label: 'Quinielas', href: '/dashboard', active: false },
          { icon: '🎯', label: 'Predecir',  href: '/dashboard', active: false },
          { icon: '🏆', label: 'Ranking',   href: '/ranking',   active: false },
          { icon: '👤', label: 'Perfil',    href: '/perfil',    active: true  },
        ].map(item => (
          <Link key={item.label} href={item.href} style={{ flex: 1, textDecoration: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 6 }}>
              <div style={{ fontSize: 22 }}>{item.icon}</div>
              <div style={{ fontSize: 10, color: item.active ? '#F5B731' : 'rgba(255,255,255,0.3)' }}>{item.label}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}