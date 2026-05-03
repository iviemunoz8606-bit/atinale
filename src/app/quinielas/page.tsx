// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import JoinPoolModal from '@/components/JoinPoolModal'
import Loading from '@/app/loading'
import BottomNav from '@/components/BottomNav'

type User = { id: string; name: string; email: string; is_admin: boolean }
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
    case 'FIFA_2026': return { label: 'Mundial FIFA 2026', icon: '🌍', accent: '#00C46A', accentBg: 'rgba(0,196,106,0.10)', accentBorder: 'rgba(0,196,106,0.25)', leftBorder: '#00C46A', barGradient: 'linear-gradient(90deg,#00C46A,#F5B731)', potColor: '#F5B731', netColor: '#00C46A' }
    case 'LIGA_MX':   return { label: 'Liga MX', icon: '🦅', accent: '#E8192C', accentBg: 'rgba(232,25,44,0.10)', accentBorder: 'rgba(232,25,44,0.25)', leftBorder: '#E8192C', barGradient: 'linear-gradient(90deg,#E8192C,#006847)', potColor: '#E8192C', netColor: '#006847' }
    case 'UEFA_CL':   return { label: 'UEFA Champions', icon: '⭐', accent: '#4FADFF', accentBg: 'rgba(79,173,255,0.10)', accentBorder: 'rgba(79,173,255,0.25)', leftBorder: '#4FADFF', barGradient: 'linear-gradient(90deg,#4FADFF,#7B2FF7)', potColor: '#4FADFF', netColor: '#7B2FF7' }
    default:          return { label: comp, icon: '🏆', accent: '#6B7280', accentBg: 'rgba(107,114,128,0.10)', accentBorder: 'rgba(107,114,128,0.25)', leftBorder: '#6B7280', barGradient: 'linear-gradient(90deg,#6B7280,#9CA3AF)', potColor: '#F5B731', netColor: '#6B7280' }
  }
}

export default function Quinielas() {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [myPools, setMyPools] = useState<PoolMember[]>([])
  const [availablePools, setAvailablePools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)
  const [modalPool, setModalPool] = useState<Pool | null>(null)
  const [codigo, setCodigo] = useState('')
  const [codigoLoading, setCodigoLoading] = useState(false)
  const [codigoError, setCodigoError] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }
      const { data: userData } = await supabase.from('users').select('*').eq('id', session.user.id).single()
      if (!userData) { router.push('/registro'); return }
      setUser(userData)

      const { data: memberData } = await supabase
        .from('pool_members')
        .select('id, pool_id, points, rank, payment_status, pool:pools(*)')
        .eq('user_id', session.user.id)
      const members = (memberData as any) || []
      setMyPools(members)

      const { data: publicPools } = await supabase
        .from('pools').select('*').eq('status', 'open').eq('type', 'public')
        .order('starts_at', { ascending: true })
      const myPoolIds = new Set(members.map((m: any) => m.pool_id))
      setAvailablePools((publicPools || []).filter(p => !myPoolIds.has(p.id)))

    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  async function handleModalSuccess() {
    setModalPool(null)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data: memberData } = await supabase
      .from('pool_members').select('id, pool_id, points, rank, payment_status, pool:pools(*)')
      .eq('user_id', session.user.id)
    setMyPools((memberData as any) || [])
  }

  function handleJoinClick(pool: Pool) {
    const membership = myPools.find(m => m.pool_id === pool.id)
    if (!membership) { setModalPool(pool); return }
    if (membership.payment_status === 'approved') { router.push(`/quiniela/${pool.id}`); return }
    setModalPool({ ...pool, _pendingOnly: true } as any)
  }

  async function handleCodigo() {
    const code = codigo.trim().toUpperCase()
    if (!code) { setCodigoError('Escribe un código de sala'); return }
    if (!code.startsWith('SALA-')) { setCodigoError('El código debe empezar con SALA-'); return }
    setCodigoLoading(true)
    setCodigoError('')
    const { data: pool } = await supabase
      .from('pools')
      .select('*')
      .eq('access_code', code)
      .eq('status', 'open')
      .single()
    setCodigoLoading(false)
    if (!pool) { setCodigoError('Código no encontrado o sala cerrada'); return }
    router.push('/unirse/' + code)
  }

  if (loading) return <Loading />
  if (!user) return null

  return (
    <div style={{ background: '#080C16', minHeight: '100vh', fontFamily: "'Outfit','Helvetica Neue',sans-serif", color: '#F0F2F8' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{left:-100%} 100%{left:200%} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        .pool-card { transition: transform 0.2s; }
        .pool-card:hover { transform: translateY(-2px); }
        .codigo-input:focus { border-color: rgba(79,173,255,0.5) !important; outline: none; }
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
      <div style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px 12px', background: 'rgba(8,12,22,0.96)', backdropFilter: 'blur(20px)', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', cursor: 'pointer' }}>←</div>
        </Link>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 3, background: 'linear-gradient(90deg,#C9930A,#F5B731,#fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>QUINIELAS</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 1 }}>Únete y compite por el pozo</div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 16px 100px' }}>

        {/* ACCIONES RÁPIDAS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20, animation: 'fadeUp 0.3s ease both' }}>
          
          {/* Código de sala */}
          <div style={{ background: 'rgba(79,173,255,0.08)', border: '1px solid rgba(79,173,255,0.25)', borderRadius: 14, padding: '14px 12px' }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>🔑</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 2 }}>¿Tienes código?</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 10, lineHeight: 1.4 }}>Úsalo para entrar a una sala privada</div>
            <input
              className="codigo-input"
              type="text"
              value={codigo}
              onChange={e => { setCodigo(e.target.value.toUpperCase()); setCodigoError('') }}
              placeholder="SALA-XXXX"
              maxLength={9}
              style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(79,173,255,0.25)', borderRadius: 8, padding: '8px 10px', color: '#4FADFF', fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, letterSpacing: 2, marginBottom: 8 }}
            />
            <button
              onClick={handleCodigo}
              disabled={codigoLoading}
              style={{ width: '100%', padding: '8px', borderRadius: 8, background: 'linear-gradient(135deg,#4FADFF,#2E86DE)', color: '#080C16', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", opacity: codigoLoading ? 0.7 : 1 }}
            >
              {codigoLoading ? '...' : 'Entrar →'}
            </button>
            {codigoError && <div style={{ fontSize: 10, color: '#FF4D6D', marginTop: 6 }}>{codigoError}</div>}
          </div>

          {/* Crear sala */}
          <div
            onClick={() => router.push('/crear-sala')}
            style={{ background: 'rgba(245,183,49,0.08)', border: '1px solid rgba(245,183,49,0.25)', borderRadius: 14, padding: '14px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ fontSize: 20, marginBottom: 6 }}>🏠</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 2 }}>Crea tu sala</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 10, lineHeight: 1.4, flex: 1 }}>Invita a tu grupo y gana comisión</div>
            <div style={{ width: '100%', padding: '8px', borderRadius: 8, background: 'linear-gradient(135deg,#F5B731,#C9930A)', color: '#080C16', fontWeight: 700, fontSize: 12, textAlign: 'center', fontFamily: "'Outfit',sans-serif" }}>
              Crear →
            </div>
          </div>

        </div>

        {/* MIS QUINIELAS */}
        {myPools.length > 0 && (
          <div style={{ marginBottom: 24, animation: 'fadeUp 0.3s ease 0.05s both' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              Mis quinielas
              <div style={{ flex: 1, height: '.5px', background: 'rgba(255,255,255,.07)' }} />
            </div>
            {myPools.map((member, i) => {
              const theme = getCompTheme(member.pool?.competition || '')
              const pot = member.pool?.total_pot > 0 ? member.pool.total_pot : (member.pool?.current_participants || 0) * (member.pool?.entry_fee || 0)
              const fillPct = Math.min(100, ((member.pool?.current_participants || 0) / (member.pool?.max_participants || 1)) * 100)
              return (
                <div key={member.id} className="pool-card" style={{ background: '#111520', borderRadius: 16, border: `0.5px solid ${theme.accentBorder}`, borderLeft: `3px solid ${theme.leftBorder}`, marginBottom: 14, overflow: 'hidden', animation: `fadeUp 0.3s ease ${i * 0.05}s both` }}>
                  <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '0.5px solid rgba(255,255,255,.06)', background: `linear-gradient(135deg,${theme.accentBg},transparent)` }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: theme.accentBg, border: `0.5px solid ${theme.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{theme.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{member.pool?.name}</div>
                      <div style={{ fontSize: 10, color: theme.accent, fontWeight: 700, letterSpacing: 1.5, marginTop: 2 }}>{theme.label.toUpperCase()}</div>
                    </div>
                    <div style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: member.payment_status === 'approved' ? 'rgba(0,196,106,.15)' : 'rgba(245,183,49,.15)', color: member.payment_status === 'approved' ? '#00C46A' : '#F5B731', border: `0.5px solid ${member.payment_status === 'approved' ? 'rgba(0,196,106,.3)' : 'rgba(245,183,49,.3)'}` }}>
                      {member.payment_status === 'approved' ? '✅ Activa' : '⏳ Pendiente'}
                    </div>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ textAlign: 'center', marginBottom: 12 }}>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>💰 Pozo actual</div>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, color: theme.potColor, lineHeight: 1 }}>{formatMXN(pot)}</div>
                      <div style={{ fontSize: 12, color: theme.netColor, marginTop: 2 }}>
                        Premio neto: {formatMXN(Math.round(pot * 0.9))} · Comisión: {formatMXN(Math.round(pot * 0.1))} (10%)
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,.05)', borderRadius: 4, height: 5, marginBottom: 8, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 4, width: `${fillPct}%`, background: theme.barGradient, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.4),transparent)', animation: 'shimmer 2s infinite' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,.35)', marginBottom: 14 }}>
                      <span>{member.pool?.current_participants} / {member.pool?.max_participants} participantes</span>
                      <span>Entrada: {formatMXN(member.pool?.entry_fee || 0)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: 16 }}>
                        <div>
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase' }}>Mis puntos</div>
                          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: '#F5B731', lineHeight: 1 }}>{member.points || 0}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase' }}>Posición</div>
                          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: '#00C46A', lineHeight: 1 }}>{member.rank ? `#${member.rank}` : '—'}</div>
                        </div>
                      </div>
                      {member.payment_status === 'approved' ? (
                        <Link href={`/quiniela/${member.pool_id}`} style={{ textDecoration: 'none' }}>
                          <div style={{ background: 'linear-gradient(135deg,#00C46A,#00864A)', borderRadius: 20, padding: '9px 24px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>VER →</div>
                        </Link>
                      ) : (
                        <div style={{ fontSize: 12, color: '#F5B731' }}>⏳ Validando pago</div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* DISPONIBLES */}
        <div style={{ animation: 'fadeUp 0.3s ease 0.1s both' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            Disponibles ahora
            <div style={{ flex: 1, height: '.5px', background: 'rgba(255,255,255,.07)' }} />
          </div>
          {availablePools.length === 0 ? (
            <div style={{ background: '#111520', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: 32, textAlign: 'center', color: '#6B7280' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🏆</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>No hay quinielas disponibles</div>
              <div style={{ fontSize: 13 }}>El Mundial arranca el 11 de junio — vuelve pronto</div>
            </div>
          ) : (
            availablePools.map((pool, i) => {
              const theme = getCompTheme(pool.competition)
              const pot = pool.total_pot > 0 ? pool.total_pot : pool.current_participants * pool.entry_fee
              const fillPct = Math.min(100, (pool.current_participants / pool.max_participants) * 100)
              return (
                <div key={pool.id} className="pool-card" style={{ background: '#111520', borderRadius: 16, border: `0.5px solid ${theme.accentBorder}`, borderLeft: `3px solid ${theme.leftBorder}`, marginBottom: 14, overflow: 'hidden', animation: `fadeUp 0.3s ease ${0.1 + i * 0.05}s both` }}>
                  <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '0.5px solid rgba(255,255,255,.06)', background: `linear-gradient(135deg,${theme.accentBg},transparent)` }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: theme.accentBg, border: `0.5px solid ${theme.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{theme.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{pool.name}</div>
                      <div style={{ fontSize: 10, color: theme.accent, fontWeight: 700, letterSpacing: 1.5, marginTop: 2 }}>{theme.label.toUpperCase()}</div>
                    </div>
                    <div style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: theme.accentBg, color: theme.accent, border: `0.5px solid ${theme.accentBorder}` }}>Abierta</div>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ textAlign: 'center', marginBottom: 12 }}>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>💰 Pozo actual</div>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, color: '#F5B731', lineHeight: 1 }}>{formatMXN(pot)}</div>
                      <div style={{ fontSize: 12, color: theme.netColor, marginTop: 2 }}>
                        Premio neto: {formatMXN(Math.round(pot * 0.9))} · Comisión: {formatMXN(Math.round(pot * 0.1))} (10%)
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,.05)', borderRadius: 4, height: 5, marginBottom: 8, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 4, width: `${fillPct}%`, background: theme.barGradient, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.4),transparent)', animation: 'shimmer 2s infinite' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,.35)', marginBottom: 14 }}>
                      <span>{pool.current_participants} / {pool.max_participants} participantes</span>
                      <span>Entrada: {formatMXN(pool.entry_fee)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>
                        {timeUntil(pool.registration_closes_at) === 'Cerrada'
                          ? <span style={{ color: '#FF4D6D', fontWeight: 700 }}>⏰ Cerrada</span>
                          : <>⏰ Cierra en <span style={{ color: '#FF4D6D', fontWeight: 700 }}>{timeUntil(pool.registration_closes_at)}</span></>
                        }
                      </div>
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

      </div>
      <BottomNav />
    </div>
  )
}