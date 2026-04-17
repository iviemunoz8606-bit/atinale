// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Loading from '@/app/loading'

export default function Ranking() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)

  useEffect(() => {
    loadRanking()
  }, [])

  async function loadRanking() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/'); return }
    setCurrentUserId(session.user.id)

    const { data } = await supabase
      .from('users')
      .select('id, name, avatar_url, total_points')
      .order('total_points', { ascending: false })
      .limit(50)

    setUsers(data || [])
    setLoading(false)
  }

  function getInitial(name) {
    return name ? name.charAt(0).toUpperCase() : '?'
  }

  const avatarColors = [
    '#F5B731,#C9930A', '#00C46A,#00864A', '#4FADFF,#7B2FF7',
    '#FF4D6D,#C9930A', '#F5B731,#00C46A'
  ]

  if (loading) return <Loading /> 

  return (
    <div style={{ background: '#080C16', minHeight: '100vh', fontFamily: "'Outfit','Helvetica Neue',sans-serif", color: '#F0F2F8', paddingBottom: 100 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
      `}</style>

      {/* TOPBAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', background: 'rgba(8,12,22,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer', color: '#fff' }}>←</div>
        </Link>
        <div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 2, background: 'linear-gradient(135deg,#F5B731,#00C46A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            RANKING GLOBAL
          </div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>Puntos acumulados entre todas las quinielas</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#00C46A' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00C46A', animation: 'pulse 1.5s infinite' }} />
          EN VIVO
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px' }}>

        {/* TOP 3 */}
        {users.length >= 3 && (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, marginBottom: 24, animation: 'fadeUp 0.4s ease both' }}>
            {/* 2do lugar */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg,${avatarColors[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, color: '#080C16', margin: '0 auto 8px', border: '2px solid rgba(107,114,128,0.5)', overflow: 'hidden' }}>
                {users[1]?.avatar_url ? <img src={users[1].avatar_url} style={{ width: 56, height: 56, objectFit: 'cover' }} /> : getInitial(users[1]?.name)}
              </div>
              <div style={{ background: '#111520', border: '1px solid rgba(107,114,128,0.3)', borderRadius: 12, padding: '10px 8px', height: 80, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: 18 }}>🥈</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: '#9CA3AF' }}>{users[1]?.total_points || 0}</div>
                <div style={{ fontSize: 10, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{users[1]?.name?.split(' ')[0]}</div>
              </div>
            </div>
            {/* 1er lugar */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ width: 68, height: 68, borderRadius: '50%', background: `linear-gradient(135deg,${avatarColors[0]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 26, color: '#080C16', margin: '0 auto 8px', border: '3px solid #F5B731', overflow: 'hidden' }}>
                {users[0]?.avatar_url ? <img src={users[0].avatar_url} style={{ width: 68, height: 68, objectFit: 'cover' }} /> : getInitial(users[0]?.name)}
              </div>
              <div style={{ background: 'linear-gradient(135deg,rgba(245,183,49,0.1),rgba(245,183,49,0.05))', border: '1px solid rgba(245,183,49,0.3)', borderRadius: 12, padding: '10px 8px', height: 96, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: 22 }}>👑</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: '#F5B731' }}>{users[0]?.total_points || 0}</div>
                <div style={{ fontSize: 10, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{users[0]?.name?.split(' ')[0]}</div>
              </div>
            </div>
            {/* 3er lugar */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg,${avatarColors[2]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, color: '#fff', margin: '0 auto 8px', border: '2px solid rgba(205,127,50,0.5)', overflow: 'hidden' }}>
                {users[2]?.avatar_url ? <img src={users[2].avatar_url} style={{ width: 56, height: 56, objectFit: 'cover' }} /> : getInitial(users[2]?.name)}
              </div>
              <div style={{ background: '#111520', border: '1px solid rgba(205,127,50,0.3)', borderRadius: 12, padding: '10px 8px', height: 72, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: 18 }}>🥉</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: '#CD7F32' }}>{users[2]?.total_points || 0}</div>
                <div style={{ fontSize: 10, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{users[2]?.name?.split(' ')[0]}</div>
              </div>
            </div>
          </div>
        )}

        {/* LISTA COMPLETA */}
        <div style={{ background: '#111520', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, overflow: 'hidden', animation: 'fadeUp 0.5s ease 0.1s both' }}>
          {users.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Nadie en el ranking aún</div>
              <div style={{ fontSize: 13 }}>¡Sé el primero en predecir y ganar puntos!</div>
            </div>
          ) : (
            users.map((u, i) => {
              const isMe = u.id === currentUserId
              return (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < users.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', background: isMe ? 'rgba(245,183,49,0.05)' : 'transparent', borderLeft: isMe ? '2px solid #F5B731' : '2px solid transparent' }}>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, width: 28, textAlign: 'center', color: i === 0 ? '#F5B731' : i === 1 ? '#9CA3AF' : i === 2 ? '#CD7F32' : '#4B5563', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg,${avatarColors[i % avatarColors.length]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: i < 2 ? '#080C16' : '#fff', overflow: 'hidden' }}>
                    {u.avatar_url ? <img src={u.avatar_url} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} /> : getInitial(u.name)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {u.name}
                      {isMe && <span style={{ fontSize: 10, color: '#F5B731', marginLeft: 6, fontWeight: 400 }}>← Tú</span>}
                    </div>
                    <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>
                      {i === 0 ? '🔥 Líder actual' : i < 3 ? '⭐ Top 3' : `Posición #${i + 1}`}
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: i === 0 ? '#F5B731' : i === 1 ? '#9CA3AF' : i === 2 ? '#CD7F32' : '#4B5563' }}>
                    {u.total_points || 0}
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(245,183,49,0.05)', border: '1px solid rgba(245,183,49,0.15)', borderRadius: 12, fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
          Puntos acumulados entre todas las quinielas en las que hayas participado
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,13,18,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', padding: '8px 0 20px' }}>
        {[
          { icon: '🏠', label: 'Inicio',    href: '/dashboard', active: false },
          { icon: '⚽', label: 'Quinielas', href: '/dashboard', active: false },
          { icon: '🎯', label: 'Predecir',  href: '/dashboard', active: false },
          { icon: '🏆', label: 'Ranking',   href: '/ranking',   active: true  },
          { icon: '👤', label: 'Perfil',    href: '/perfil',    active: false },
        ].map((item) => (
          <Link key={item.label} href={item.href} style={{ flex: 1, textDecoration: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 6 }}>
              <div style={{ fontSize: 22, filter: item.active ? 'drop-shadow(0 0 6px #F5B731)' : 'none' }}>{item.icon}</div>
              <div style={{ fontSize: 10, color: item.active ? '#F5B731' : '#6B7280' }}>{item.label}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}