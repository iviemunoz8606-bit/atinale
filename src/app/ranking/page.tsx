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

// ── Diana SVG animada para el nav ─────────────────────────────────────────────
function DianaNav({ active }: { active: boolean }) {
  const c1 = active ? '#F5B731' : 'rgba(255,255,255,0.25)'
  const c2 = active ? '#F5B731' : 'rgba(255,255,255,0.32)'
  const c3 = active ? '#F5B731' : 'rgba(255,255,255,0.42)'
  const cd = active ? '#F5B731' : 'rgba(255,255,255,0.52)'
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="9"   stroke={c1} strokeWidth="1" strokeDasharray="4 3"
        style={{ transformOrigin:'50% 50%', animation:'spinOut 8s linear infinite' }} />
      <circle cx="11" cy="11" r="6"   stroke={c2} strokeWidth="1" strokeDasharray="3 2"
        style={{ transformOrigin:'50% 50%', animation:'spinMid 5s linear infinite reverse' }} />
      <circle cx="11" cy="11" r="3.5" stroke={c3} strokeWidth="1"
        style={{ transformOrigin:'50% 50%', animation:'spinIn 3s linear infinite' }} />
      <circle cx="11" cy="11" r="1.5" fill={cd} />
      <line x1="11" y1="2"  x2="11" y2="5"  stroke={c1} strokeWidth="1" />
      <line x1="11" y1="17" x2="11" y2="20" stroke={c1} strokeWidth="1" />
      <line x1="2"  y1="11" x2="5"  y2="11" stroke={c1} strokeWidth="1" />
      <line x1="17" y1="11" x2="20" y2="11" stroke={c1} strokeWidth="1" />
    </svg>
  )
}

// ── Punto rojo pulsante ───────────────────────────────────────────────────────
function LiveDot() {
  return (
    <span style={{
      display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
      background: '#E24B4A', flexShrink: 0,
      animation: 'blink 1s ease-in-out infinite',
    }} />
  )
}

export default function Ranking() {
  const router = useRouter()
  const [users, setUsers]                 = useState([])
  const [loading, setLoading]             = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [currentUser, setCurrentUser]     = useState(null)
  const [filter, setFilter]               = useState<'top' | 'vecinos' | 'todos'>('top')

  useEffect(() => { loadRanking() }, [])

  async function loadRanking() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/'); return }
    setCurrentUserId(session.user.id)

    // Query original conservada — suma total_points de todas las quinielas
    const { data } = await supabase
      .from('users')
      .select('id, name, alias, emoji, avatar_url, total_points')
      .order('total_points', { ascending: false })
      .limit(100)

    if (data) {
      const ranked = data.map((u, i) => ({ ...u, rank: i + 1 }))
      setUsers(ranked)
      const me = ranked.find(u => u.id === session.user.id)
      if (me) setCurrentUser(me)
    }
    setLoading(false)
  }

  function getInitial(name) {
    return name ? name.charAt(0).toUpperCase() : '?'
  }

  function getDisplayName(u) {
    return u.alias || u.name?.split(' ')[0] || 'Jugador'
  }

  // Filtrar lista
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

  // Podio
  const podioColors  = ['#9CA3AF', '#F5B731', '#CD7F32']
  const podioBorders = ['rgba(107,114,128,0.4)', 'rgba(245,183,49,0.8)', 'rgba(205,127,50,0.5)']
  const podioHeights = [38, 54, 26]
  const podioSizes   = [52, 64, 48]
  const podioOrder   = [1, 0, 2] // 2do, 1ro, 3ro

  if (loading) return <Loading />

  const list   = getList()
  const myRank = currentUser?.rank ?? null
  const myPts  = currentUser?.total_points ?? 0
  const top3   = users.slice(0, 3)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600&display=swap');
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes spinOut { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes spinMid { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes spinIn  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }
        html { scrollbar-width: none; }
      `}</style>

      <div style={{
        background: '#080C16', minHeight: '100vh', color: '#fff',
        fontFamily: "'Outfit', sans-serif", paddingBottom: 90,
      }}>

        {/* ── TOPBAR ── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px 12px',
          background: 'rgba(8,12,22,0.96)', backdropFilter: 'blur(20px)',
          borderBottom: '0.5px solid rgba(255,255,255,0.07)',
        }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: '#fff', cursor: 'pointer',
            }}>←</div>
          </Link>
          <div>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 3,
              background: 'linear-gradient(90deg,#C9930A,#F5B731,#fff)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>RANKING GLOBAL</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 1 }}>
              Puntos acumulados entre todas las quinielas
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
            <LiveDot />
            <span style={{ fontSize: 10, color: '#E24B4A', fontWeight: 600, letterSpacing: 1 }}>EN VIVO</span>
          </div>
        </div>

        <div style={{ maxWidth: 480, margin: '0 auto' }}>

          {/* ── MI POSICIÓN ── */}
          {currentUser && (
            <div style={{
              margin: '12px 16px 0',
              background: 'rgba(79,173,255,0.05)', border: '1px solid rgba(79,173,255,0.2)',
              borderRadius: 13, padding: '11px 13px',
              animation: 'fadeUp 0.3s ease both',
            }}>
              <div style={{ fontSize: 9, color: '#4FADFF', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 7 }}>
                📍 Tu posición
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: '#4FADFF', lineHeight: 1 }}>
                    {myRank}
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(79,173,255,.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
                    de {users.length}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                    {currentUser.emoji || ''} {getDisplayName(currentUser)}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 2 }}>
                    Puntos acumulados globales
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: '#4FADFF', lineHeight: 1 }}>
                    {myPts}
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(79,173,255,.4)' }}>puntos</div>
                </div>
              </div>
            </div>
          )}

          {/* ── FILTROS ── */}
          <div style={{ display: 'flex', gap: 6, padding: '10px 16px 6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {(['top', 'vecinos', 'todos'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                whiteSpace: 'nowrap', padding: '5px 14px', borderRadius: 20,
                fontSize: 11, cursor: 'pointer', flexShrink: 0,
                fontFamily: "'Outfit', sans-serif", transition: 'all .2s',
                background: filter === f ? '#F5B731' : 'transparent',
                color: filter === f ? '#080C16' : 'rgba(255,255,255,.35)',
                border: `0.5px solid ${filter === f ? '#F5B731' : 'rgba(255,255,255,.1)'}`,
                fontWeight: filter === f ? 700 : 400,
              }}>
                {f === 'top' ? 'Top 10' : f === 'vecinos' ? 'Mis vecinos' : `Todos (${users.length})`}
              </button>
            ))}
          </div>

          {/* ── PODIO TOP 3 ── */}
          {filter === 'top' && top3.length >= 3 && (
            <div style={{ padding: '12px 16px 4px', animation: 'fadeUp 0.4s ease both' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10 }}>
                {podioOrder.map((pi, vi) => {
                  const u = top3[pi]
                  if (!u) return null
                  return (
                    <div key={pi} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      {/* Avatar con corona */}
                      <div style={{ position: 'relative', marginBottom: 5 }}>
                        {vi === 1 && (
                          <span style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontSize: 14 }}>👑</span>
                        )}
                        <div style={{
                          width: podioSizes[vi], height: podioSizes[vi], borderRadius: '50%',
                          border: `2px solid ${podioBorders[vi]}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'rgba(255,255,255,.05)', overflow: 'hidden',
                        }}>
                          {u.emoji ? (
                            <span style={{ fontSize: podioSizes[vi] * 0.42 }}>{u.emoji}</span>
                          ) : u.avatar_url ? (
                            <img src={u.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontWeight: 700, fontSize: podioSizes[vi] * 0.35, color: podioColors[vi] }}>
                              {getInitial(u.name)}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Nombre */}
                      <div style={{
                        fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,.85)',
                        textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden',
                        maxWidth: 80, textOverflow: 'ellipsis', marginBottom: 1,
                      }}>
                        {getDisplayName(u)}
                      </div>
                      {/* Puntos */}
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, color: podioColors[vi], marginBottom: 4 }}>
                        {u.total_points || 0}
                      </div>
                      {/* Barra del podio */}
                      <div style={{
                        width: '100%', height: podioHeights[vi], borderRadius: '5px 5px 0 0',
                        background: vi === 1
                          ? 'rgba(245,183,49,.18)'
                          : vi === 0 ? 'rgba(156,163,175,.12)' : 'rgba(205,127,50,.14)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: podioColors[vi],
                      }}>
                        {pi + 1}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── SEPARADOR MIS VECINOS ── */}
          {filter === 'vecinos' && myRank && myRank > 3 && (
            <div style={{
              padding: '7px 14px', fontSize: 10, color: 'rgba(79,173,255,.4)',
              background: 'rgba(79,173,255,.03)',
              borderTop: '0.5px solid rgba(79,173,255,.1)',
              borderBottom: '0.5px solid rgba(79,173,255,.1)',
              textAlign: 'center',
            }}>
              · · · {myRank - 3} jugadores arriba · · ·
            </div>
          )}

          {/* ── CABECERA LISTA ── */}
          <div style={{
            display: 'flex', padding: '5px 16px', margin: '4px 0 0',
            fontSize: 9, color: 'rgba(255,255,255,.2)',
            textTransform: 'uppercase', letterSpacing: 1,
            borderBottom: '0.5px solid rgba(255,255,255,.05)',
          }}>
            <span style={{ width: 30 }}>#</span>
            <span style={{ flex: 1 }}>Jugador</span>
            <span style={{ width: 44, textAlign: 'right' }}>Pts</span>
          </div>

          {/* ── LISTA ── */}
          <div style={{ animation: 'fadeUp 0.5s ease 0.1s both' }}>
            {users.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,.25)' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🏆</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Nadie en el ranking aún</div>
                <div style={{ fontSize: 13 }}>¡Sé el primero en predecir y ganar puntos!</div>
              </div>
            ) : (
              list.map((u) => {
                const isMe = u.id === currentUserId
                const rankColor = u.rank === 1 ? '#F5B731'
                  : u.rank === 2 ? '#9CA3AF'
                  : u.rank === 3 ? '#CD7F32'
                  : 'rgba(255,255,255,.28)'
                return (
                  <div key={u.id} style={{
                    display: 'flex', alignItems: 'center', padding: '10px 16px',
                    borderBottom: '0.5px solid rgba(255,255,255,.05)',
                    background: isMe ? 'rgba(79,173,255,.04)' : 'transparent',
                    borderLeft: isMe ? '2px solid #4FADFF' : '2px solid transparent',
                    transition: 'background .15s',
                  }}>
                    {/* Número */}
                    <div style={{
                      fontFamily: "'Bebas Neue',sans-serif", fontSize: 16,
                      width: 30, flexShrink: 0, color: rankColor,
                    }}>
                      {u.rank}
                    </div>

                    {/* Avatar: emoji > foto Google > inicial */}
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      marginRight: 10, background: 'rgba(255,255,255,.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', fontSize: 18,
                    }}>
                      {u.emoji
                        ? u.emoji
                        : u.avatar_url
                          ? <img src={u.avatar_url} style={{ width: 32, height: 32, objectFit: 'cover' }} />
                          : <span style={{ fontWeight: 700, fontSize: 12, color: '#F5B731' }}>{getInitial(u.name)}</span>
                      }
                    </div>

                    {/* Nombre + badge "tú" */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 500, color: '#fff',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        {getDisplayName(u)}
                        {isMe && (
                          <span style={{
                            fontSize: 9, padding: '1px 5px', borderRadius: 3,
                            background: 'rgba(79,173,255,.15)', color: '#4FADFF',
                            border: '0.5px solid rgba(79,173,255,.25)', flexShrink: 0,
                          }}>tú</span>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', marginTop: 1 }}>
                        {u.rank === 1 ? '🔥 Líder actual' : u.rank <= 3 ? '⭐ Top 3' : `Posición #${u.rank}`}
                      </div>
                    </div>

                    {/* Puntos */}
                    <div style={{
                      fontFamily: "'Bebas Neue',sans-serif", fontSize: 22,
                      color: rankColor, minWidth: 44, textAlign: 'right',
                    }}>
                      {u.total_points || 0}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* ── NOTA INFERIOR ── */}
          <div style={{
            margin: '14px 16px', padding: '10px 14px',
            background: 'rgba(245,183,49,0.04)', border: '0.5px solid rgba(245,183,49,0.12)',
            borderRadius: 10, fontSize: 11, color: 'rgba(255,255,255,.25)', textAlign: 'center',
          }}>
            Puntos acumulados entre todas las quinielas en las que hayas participado
          </div>

        </div>
      </div>

      {/* ── BOTTOM NAV (5 items — igual que antes) ── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,13,18,0.97)', backdropFilter: 'blur(20px)',
        borderTop: '0.5px solid rgba(255,255,255,.07)',
        display: 'flex', padding: '8px 0 16px',
      }}>
        {[
          { icon: '🏠',    label: 'Inicio',    href: '/dashboard', active: false, isDiana: false },
          { icon: 'diana', label: 'Quinielas', href: '/dashboard', active: false, isDiana: true  },
          { icon: '🎯',    label: 'Predecir',  href: '/dashboard', active: false, isDiana: false },
          { icon: '🏆',    label: 'Ranking',   href: '/ranking',   active: true,  isDiana: false },
          { icon: '👤',    label: 'Perfil',    href: '/perfil',    active: false, isDiana: false },
        ].map((item) => (
          <Link key={item.label} href={item.href} style={{ flex: 1, textDecoration: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: 4 }}>
              {item.isDiana
                ? <DianaNav active={item.active} />
                : (
                  <span style={{
                    fontSize: 20,
                    filter: item.active
                      ? 'drop-shadow(0 0 6px #F5B731)'
                      : 'grayscale(1) brightness(.4)',
                  }}>{item.icon}</span>
                )
              }
              <span style={{
                fontSize: 9,
                color: item.active ? '#F5B731' : 'rgba(255,255,255,.25)',
                textTransform: 'uppercase', letterSpacing: 1,
              }}>
                {item.label}
              </span>
            </div>
          </Link>
        ))}
      </nav>
    </>
  )
}