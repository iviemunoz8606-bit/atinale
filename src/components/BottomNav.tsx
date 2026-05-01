// @ts-nocheck
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import WAButton from './WAButton'

const NAV_ITEMS = [
  { label: 'Inicio',    href: '/dashboard',  icon: '🏠' },
  { label: 'Quinielas', href: '/quinielas',  icon: '⚽' },
  { label: 'Predecir',  href: '/predecir',   icon: '🎯' },
  { label: 'Ranking',   href: '/ranking',    icon: '🏆' },
  { label: 'Perfil',    href: '/perfil',     icon: '👤' },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600&display=swap');
        .bnav-item { transition: opacity 0.15s; }
        .bnav-item:active { opacity: 0.7; }
      `}</style>
      <WAButton />
      <nav style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:100, background:'rgba(10,13,18,0.97)', backdropFilter:'blur(20px)', borderTop:'0.5px solid rgba(255,255,255,0.07)', display:'flex', padding:'8px 0 20px' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{ flex:1, textDecoration:'none' }}>
              <div className="bnav-item" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'4px 0' }}>
                <span style={{ fontSize:22, filter:isActive ? 'drop-shadow(0 0 6px #F5B731)' : 'grayscale(1) brightness(0.4)', transition:'filter 0.2s' }}>
                  {item.icon}
                </span>
                <span style={{ fontFamily:"'Outfit', sans-serif", fontSize:9, color:isActive ? '#F5B731' : 'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'1px', transition:'color 0.2s' }}>
                  {item.label}
                </span>
              </div>
            </Link>
          )
        })}
      </nav>
    </>
  )
}