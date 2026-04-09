// @ts-nocheck
'use client'
import { motion, animate } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

function CountUp({ target, duration = 2.5, active = true }: { target: number; duration?: number; active?: boolean }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (!active) return
    const controls = animate(0, target, {
      duration, ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return controls.stop
  }, [target, duration, active])
  return <>{(active ? display : target).toLocaleString('es-MX')}</>
}

function NavDiana() {
  const size = 32
  const off1 = Math.round(size * 0.13)
  const off2 = Math.round(size * 0.28)
  const s2   = size - off1 * 2
  const s3   = size - off2 * 2
  const r1   = size / 2 - 2
  const r2   = s2 / 2 - 2
  const r3   = s3 / 2 - 1.5
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{`
        @keyframes navSpin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes navSpinRev { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
        @keyframes navPulse   { 0%,100%{transform:scale(1);opacity:.75} 50%{transform:scale(1.35);opacity:1} }
      `}</style>
      <div style={{ position:'absolute', inset:0, animation:'navSpin 18s linear infinite' }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
          <circle cx={size/2} cy={size/2} r={r1} fill="none" stroke="rgba(245,183,49,0.10)" strokeWidth="1"/>
          <circle cx={size/2} cy={size/2} r={r1} fill="none" stroke="rgba(245,183,49,0.55)" strokeWidth="1.2"
            strokeDasharray={`8 ${Math.round(r1*2*Math.PI)-8}`} strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ position:'absolute', inset:off1, animation:'navSpinRev 11s linear infinite' }}>
        <svg viewBox={`0 0 ${s2} ${s2}`} width={s2} height={s2}>
          <circle cx={s2/2} cy={s2/2} r={r2} fill="none" stroke="rgba(245,183,49,0.08)" strokeWidth="0.8"/>
          <circle cx={s2/2} cy={s2/2} r={r2} fill="none" stroke="rgba(245,183,49,0.48)" strokeWidth="1"
            strokeDasharray={`5 ${Math.round(r2*2*Math.PI)-5}`} strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ position:'absolute', inset:off2, animation:'navSpin 5s linear infinite' }}>
        <svg viewBox={`0 0 ${s3} ${s3}`} width={s3} height={s3}>
          <circle cx={s3/2} cy={s3/2} r={r3} fill="none" stroke="rgba(245,183,49,0.45)" strokeWidth="0.9"
            strokeDasharray={`4 ${Math.round(r3*2*Math.PI)-4}`} strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ animation:'navPulse 1.8s ease-in-out infinite', display:'flex', alignItems:'center', justifyContent:'center', width:'100%', height:'100%' }}>
          <svg width="5" height="5" viewBox="0 0 24 24" fill="#F5B731">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
        </div>
      </div>
      <div style={{ position:'absolute', top:'50%', left:0, right:0, height:1, transform:'translateY(-50%)', background:'linear-gradient(90deg,transparent,rgba(245,183,49,0.28),transparent)' }}/>
      <div style={{ position:'absolute', left:'50%', top:0, bottom:0, width:1, transform:'translateX(-50%)', background:'linear-gradient(180deg,transparent,rgba(245,183,49,0.28),transparent)' }}/>
    </div>
  )
}

function DianaHero({ size = 180 }: { size?: number }) {
  const off1 = Math.round(size * 0.13)
  const off2 = Math.round(size * 0.234)
  const off3 = Math.round(size * 0.347)
  const s2 = size - off1 * 2
  const s3 = size - off2 * 2
  const s4 = size - off3 * 2
  const r1 = size / 2 - 3
  const r2 = s2 / 2 - 3
  const r3 = s3 / 2 - 2
  const r4 = s4 / 2 - 2
  return (
    <>
      <style>{`
        @keyframes spin      { from{transform:rotate(0deg)}   to{transform:rotate(360deg)} }
        @keyframes spinRev   { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }
        @keyframes starPulse { 0%,100%{opacity:.85;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }
      `}</style>
      <div style={{ position:'absolute', inset:0, animation:'spin 22s linear infinite' }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
          <circle cx={size/2} cy={size/2} r={r1} fill="none" stroke="rgba(245,183,49,0.07)" strokeWidth="1.2"/>
          <circle cx={size/2} cy={size/2} r={r1} fill="none" stroke="rgba(245,183,49,0.48)" strokeWidth="1.4"
            strokeDasharray={`30 ${Math.round(r1*2*Math.PI)-30}`} strokeLinecap="round"/>
          <circle cx={size/2} cy={size/2} r={r1} fill="none" stroke="rgba(245,183,49,0.15)" strokeWidth="0.7"
            strokeDasharray={`10 ${Math.round(r1*2*Math.PI)-10}`} strokeDashoffset={Math.round(r1*Math.PI*0.6)} strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ position:'absolute', inset:off1, animation:'spinRev 13s linear infinite' }}>
        <svg viewBox={`0 0 ${s2} ${s2}`} width={s2} height={s2}>
          <circle cx={s2/2} cy={s2/2} r={r2} fill="none" stroke="rgba(245,183,49,0.06)" strokeWidth="1"/>
          <circle cx={s2/2} cy={s2/2} r={r2} fill="none" stroke="rgba(245,183,49,0.42)" strokeWidth="1.1"
            strokeDasharray={`20 ${Math.round(r2*2*Math.PI)-20}`} strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ position:'absolute', inset:off2, animation:'spin 8s linear infinite' }}>
        <svg viewBox={`0 0 ${s3} ${s3}`} width={s3} height={s3}>
          <circle cx={s3/2} cy={s3/2} r={r3} fill="none" stroke="rgba(245,183,49,0.08)" strokeWidth="0.9"/>
          <circle cx={s3/2} cy={s3/2} r={r3} fill="none" stroke="rgba(245,183,49,0.38)" strokeWidth="0.9"
            strokeDasharray={`14 ${Math.round(r3*2*Math.PI)-14}`} strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ position:'absolute', inset:off3, animation:'spinRev 5s linear infinite' }}>
        <svg viewBox={`0 0 ${s4} ${s4}`} width={s4} height={s4}>
          <circle cx={s4/2} cy={s4/2} r={r4} fill="none" stroke="rgba(245,183,49,0.45)" strokeWidth="0.9"
            strokeDasharray={`8 ${Math.round(r4*2*Math.PI)-8}`} strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ animation:'starPulse 2.2s ease-in-out infinite' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#F5B731">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
        </div>
      </div>
      <div style={{ position:'absolute', top:'50%', left:0, right:0, height:1, transform:'translateY(-50%)', background:'linear-gradient(90deg,transparent,rgba(245,183,49,0.15),rgba(245,183,49,0.25),rgba(245,183,49,0.15),transparent)' }}/>
      <div style={{ position:'absolute', left:'50%', top:0, bottom:0, width:1, transform:'translateX(-50%)', background:'linear-gradient(180deg,transparent,rgba(245,183,49,0.15),rgba(245,183,49,0.25),rgba(245,183,49,0.15),transparent)' }}/>
    </>
  )
}

function NavLogo({ isMobile }: { isMobile: boolean }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ display:'flex', flexDirection:'column', justifyContent:'center' }}>
        {!isMobile && (
          <div style={{ fontSize:5, color:'rgba(255,255,255,0.3)', letterSpacing:'.5px', textTransform:'uppercase', lineHeight:.5, marginBottom:1 }}>
            Quinielas Deportivas
          </div>
        )}
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <div style={{
            fontFamily:"'Bebas Neue', sans-serif",
            fontSize: isMobile ? 18 : 22,
            letterSpacing:'4px', lineHeight:1,
            background:'linear-gradient(135deg,#F5B731 0%,#E8A020 40%,#F5B731 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          }}>
            ATÍNALE
          </div>
          <NavDiana />
        </div>
        {!isMobile && (
          <div style={{ fontSize:6, color:'rgba(255,255,255,0.2)', letterSpacing:'.5px', textTransform:'uppercase', lineHeight:.5, marginTop:1 }}>
            Predice y Gana
          </div>
        )}
      </div>
    </div>
  )
}

function Acordeon({ icon, titulo, subtitulo, color, children }: any) {
  const [abierto, setAbierto] = useState(false)
  return (
    <div style={{ background:'#111520', border:`1px solid ${color}`, borderRadius:14, overflow:'hidden' }}>
      <div onClick={() => setAbierto(!abierto)}
        style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
        <span style={{ fontSize:20, flexShrink:0 }}>{icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{titulo}</div>
          {!abierto && <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{subtitulo}</div>}
        </div>
        <span style={{
          color:'rgba(255,255,255,0.3)', fontSize:18, flexShrink:0,
          transition:'transform .25s',
          transform: abierto ? 'rotate(90deg)' : 'rotate(0deg)'
        }}>›</span>
      </div>
      {abierto && (
        <div style={{ padding:'0 16px 16px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const BG   = '#080C16'
  const CARD = '#111520'

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    setMounted(true)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleLogin = async () => {
  // Verificar si ya hay sesión activa antes de ir a Google
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    // Ya hay sesión — verificar si tiene perfil completo
    const { data: profile } = await supabase
      .from('users')
      .select('name, phone')
      .eq('id', session.user.id)
      .single()
    
    if (profile && profile.name && profile.phone) {
      window.location.href = '/dashboard'
    } else {
      window.location.href = '/registro'
    }
    return // ← Importante: corta aquí, no sigue a Google
  }

  // Solo si NO hay sesión → ir a Google
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    console.error('Error login:', error.message)
  }
}

  const dianaSize    = isMobile ? 120 : 148
  const heroFontSize = isMobile ? 80  : 104

  return (
    <div style={{ background:BG, minHeight:'100vh', fontFamily:"'Outfit', sans-serif", color:'#F0F2F8', overflowX:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer   { 0%{left:-100%} 100%{left:200%} }
        @keyframes pulseDot  { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes btnPulse  { 0%,100%{box-shadow:0 0 0 0 rgba(245,183,49,0.4)} 50%{box-shadow:0 0 0 8px rgba(245,183,49,0)} }
        @keyframes neonPulse { 0%,100%{text-shadow:0 0 12px rgba(255,255,255,0.25),0 0 28px rgba(255,255,255,0.1)} 50%{text-shadow:0 0 20px rgba(255,255,255,0.45),0 0 50px rgba(255,255,255,0.15)} }

        .hero-mobile  { display: none; }
        .hero-desktop { display: block; }
        .desktop-only { display: block; }
        @media (max-width: 767px) {
          .hero-mobile  { display: block; }
          .hero-desktop { display: none; }
          .desktop-only { display: none; }
        }

        .cta-gold {
          background: linear-gradient(135deg,#F5B731,#C9930A);
          color:#080C16; border:none; border-radius:14px;
          padding:18px 0; font-family:'Bebas Neue',sans-serif;
          font-size:22px; letter-spacing:2.5px; cursor:pointer;
          width:100%; position:relative; overflow:hidden;
          transition:transform .15s, box-shadow .15s;
        }
        .cta-gold:hover { transform:translateY(-2px); box-shadow:0 14px 36px rgba(245,183,49,0.38); }
        .cta-gold::after {
          content:''; position:absolute; top:0; left:-100%; width:60%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent);
          animation:shimmer 2.8s ease-in-out infinite;
        }
        .btn-entrar {
          background:linear-gradient(135deg,#F5B731,#C9930A);
          color:#080C16; border:none; border-radius:22px;
          font-weight:800; cursor:pointer;
          font-family:'Outfit',sans-serif; letter-spacing:.5px;
          animation:btnPulse 2.4s ease-in-out infinite;
          transition:transform .15s;
        }
        .btn-entrar:hover { transform:scale(1.05); }
        .feature-row {
          display:flex; align-items:flex-start; gap:14px;
          padding:11px 0; border-bottom:1px solid rgba(255,255,255,0.05);
        }
        .feature-row:last-child { border-bottom:none; }
        .step-card {
          background:#111520; border-radius:16px; padding:22px 18px;
          border:1px solid rgba(255,255,255,0.07);
          display:flex; flex-direction:column; gap:12px;
          transition:transform .2s, border-color .2s;
          flex:1;
        }
        .step-card:hover { transform:translateY(-4px); border-color:rgba(255,255,255,0.14); }
        .sala-tier {
          border-radius:14px; padding:20px 16px;
          text-align:center; transition:transform .2s;
          display:flex; flex-direction:column; align-items:center; gap:6px;
        }
        .sala-tier:hover { transform:translateY(-4px); }
        .neon-cobrate {
          font-family:'Bebas Neue',sans-serif;
          color:#ffffff;
          animation:neonPulse 3s ease-in-out infinite;
        }
      `}</style>

      {/* ══ NAVBAR ══ */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        background:'rgba(8,12,22,0.96)', backdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(255,255,255,0.07)',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 28px', height:64,
      }}>
        <NavLogo isMobile={isMobile} />
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          {!isMobile && (
            <span style={{ color:'rgba(255,255,255,0.4)', fontSize:13, cursor:'pointer', fontWeight:500 }}>
              ¿Cómo funciona?
            </span>
          )}
          <button onClick={handleLogin} className="btn-entrar"
            style={{ padding: isMobile ? '8px 18px' : '10px 26px', fontSize: isMobile ? 12 : 14 }}>
            Entrar →
          </button>
        </div>
      </nav>

      {/* ══ HERO MOBILE — CSS oculta en desktop ══ */}
      <div className="hero-mobile">
        <section style={{ padding:'84px 20px 48px' }}>

          {/* 1 — ATÍNALE + diana */}
          <div style={{ marginBottom:16 }}>
            <div style={{ position:'relative', display:'inline-block', paddingRight:34 }}>
              <div style={{
                fontFamily:"'Bebas Neue', sans-serif", fontSize:80,
                letterSpacing:'6px', lineHeight:1,
                background:'linear-gradient(135deg,#C9930A 0%,#F5B731 28%,#fff 50%,#F5B731 72%,#C9930A 100%)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                backgroundClip:'text', whiteSpace:'nowrap', position:'relative', zIndex:2,
              }}>
                ATÍNALE
              </div>
              <div style={{
                position:'absolute', width:120, height:120,
                right:-34, top:'45%', transform:'translateY(-50%)',
                zIndex:1, pointerEvents:'none',
              }}>
                <DianaHero size={120} />
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:8 }}>
              <div style={{ height:1, width:28, background:'linear-gradient(90deg,rgba(245,183,49,0.55),rgba(245,183,49,0.05))', borderRadius:2 }}/>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontWeight:400, letterSpacing:'4.5px', textTransform:'uppercase' }}>
                Predice y Gana
              </div>
            </div>
          </div>

          {/* 2 — GANATE */}
          <div style={{ marginBottom:16 }}>
            <div className="neon-cobrate" style={{ fontSize:52, letterSpacing:'3px', lineHeight:1 }}>
              GANATE!
            </div>
          </div>

          {/* 3 — $5,400 */}
          <div style={{ background:CARD, border:'1px solid rgba(245,183,49,0.22)', borderRadius:18, padding:'16px 18px', marginBottom:12 }}>
            <div style={{ fontSize:9, color:'rgba(245,183,49,0.7)', letterSpacing:'2.5px', fontWeight:700, textAlign:'center', marginBottom:4 }}>
              🏆 FIFA WORLD CUP 2026 · QUINIELA ACTIVA
            </div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.28)', letterSpacing:3, marginBottom:4, fontWeight:700, textAlign:'center' }}>
              💵 PREMIO NETO
            </div>
            <div style={{ textAlign:'center', marginBottom:4 }}>
              <span style={{ fontFamily:"'Bebas Neue', sans-serif", color:'#F5B731', fontSize:72, lineHeight:1, letterSpacing:'2px' }}>
                $<CountUp target={5400} duration={2.5} active={mounted} />
              </span>
            </div>
            <div style={{ textAlign:'center', fontSize:10, color:'rgba(255,255,255,0.22)', letterSpacing:2, marginBottom:10 }}>
              60 jugadores × $100 MXN · Comisión 10% visible
            </div>
            <div style={{ background:'rgba(0,196,106,0.06)', border:'1px solid rgba(0,196,106,0.2)', borderRadius:10, padding:'8px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.38)' }}>📈 Si se llena (200 personas)</div>
              <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:20, color:'#00C46A' }}>$18,000</div>
            </div>
          </div>

          {/* 4 — Partido inaugural */}
          <div style={{ background:CARD, border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, overflow:'hidden', marginBottom:12 }}>
            <div style={{ padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(255,255,255,0.05)', background:'rgba(0,196,106,0.05)' }}>
              <span style={{ fontSize:10, color:'#00C46A', letterSpacing:2, fontWeight:700 }}>⚽ PARTIDO INAUGURAL</span>
              <span style={{ display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#FF4D6D', display:'inline-block', animation:'pulseDot 1.2s ease-in-out infinite' }}/>
                <span style={{ fontSize:9, color:'#FF4D6D', fontWeight:700 }}>11 JUN · 1 PM (hora centro)</span>
              </span>
            </div>
            <div style={{ padding:'14px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
              <div style={{ flex:1, textAlign:'center' }}>
                <img src="https://flagcdn.com/w80/mx.png" alt="México" style={{ width:44, height:29, objectFit:'cover', borderRadius:4, display:'block', margin:'0 auto 6px', boxShadow:'0 2px 10px rgba(0,0,0,0.5)' }}/>
                <div style={{ fontSize:13, fontWeight:700 }}>México</div>
                <div style={{ fontSize:8, color:'rgba(255,255,255,0.3)', marginTop:1 }}>EL TRI</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:18, color:'rgba(255,255,255,0.10)' }}>VS</div>
                <div style={{ fontSize:8, color:'rgba(255,255,255,0.3)', marginTop:2 }}>Grupo A · CDMX</div>
              </div>
              <div style={{ flex:1, textAlign:'center' }}>
                <img src="https://flagcdn.com/w80/za.png" alt="Sudáfrica" style={{ width:44, height:29, objectFit:'cover', borderRadius:4, display:'block', margin:'0 auto 6px', boxShadow:'0 2px 10px rgba(0,0,0,0.5)' }}/>
                <div style={{ fontSize:13, fontWeight:700 }}>Sudáfrica</div>
                <div style={{ fontSize:8, color:'rgba(255,255,255,0.3)', marginTop:1 }}>BAFANA BAFANA</div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', background:'rgba(0,0,0,0.25)', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
              {[
                { pts:'3 PTS', label:'Exacto',    color:'#F5B731', icon:'🎯' },
                { pts:'1 PT',  label:'Resultado', color:'#00C46A', icon:'✓' },
                { pts:'0 PTS', label:'Fallo',     color:'rgba(255,255,255,0.2)', icon:'✗' },
              ].map((item, i) => (
                <div key={i} style={{ textAlign:'center', padding:'9px 0', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ fontFamily:"'Bebas Neue', sans-serif", color:item.color, fontSize:14 }}>{item.pts}</div>
                  <div style={{ fontSize:8, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{item.icon} {item.label}</div>
                </div>
              ))}
            </div>
          </div>

          
            <div style={{ fontSize:14, color:'rgba(255,255,255,0.4)', fontWeight:300 }}>
              ¿Cuánto sabes de fútbol?
            </div>
          <div style={{ height:1, background:'linear-gradient(90deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))', borderRadius:2, margin:'8px 0 6px' }}/>      
          {/* 5 — Features */}
          <div style={{ marginBottom:16 }}>
            {[
              { icon:'⚽', text:'El fútbol se disfruta más cuando sabes que sabes' },
              { icon:'🎯', text:'3 pts exacto — 1 pt resultado correcto' },
              { icon:'🏆', text:'El que más acierta gana el 90% del pozo' },
              { icon:'🔒', text:'Comisión 10% siempre visible — sin sorpresas' },
            ].map((item, i) => (
              <div key={i} className="feature-row">
                <span style={{ fontSize:15, flexShrink:0, marginTop:1 }}>{item.icon}</span>
                <span style={{ color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:500, lineHeight:1.5 }}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* 6 — CTA */}
          <div style={{ marginBottom:20 }}>
            <button className="cta-gold" onClick={handleLogin}>🏆 QUIERO GANAR EL POZO →</button>
            <div style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.22)', marginTop:8, lineHeight:1.8 }}>
              Entra con <span onClick={handleLogin} style={{ color:'rgba(255,255,255,0.48)', cursor:'pointer', fontWeight:700 }}>Google</span>
              {' '}· Solo 15 segundos · Mercado Pago
            </div>
          </div>

          <div style={{ marginBottom:14,textAlign:'center'}}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:'3px', textTransform:'uppercase', marginBottom:6 }}>
              ⚡ Así de fácil
            </div>
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:36, lineHeight:1.1 }}>
              3 PASOS PARA<br/>
              <span style={{ color:'#F5B731' }}>GANAR EL POZO</span>
            </div>
          </div>

          {/* 7 — 3 Pasos mobile */}
          <div style={{ marginBottom:10 }}>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { num:'01', icon:'💳', title:'Regístrate y paga', desc:'Crea tu cuenta con Google y paga $100 vía Mercado Pago. En menos de 2 minutos estás dentro.' },
                { num:'02', icon:'🎯', title:'Predice los 48 partidos', desc:'Escribe el marcador exacto de cada partido. Se bloquea automáticamente al pitazo.' },
                { num:'03', icon:'🏆', title:'Sube al ranking y cobra', desc:'El que más aciertos tenga se lleva el 90% del pozo. Ranking en tiempo real.' },
              ].map((step, i) => (
                <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'10px', background:'rgba(0,0,0,0.2)', borderRadius:10 }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{step.icon}</span>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#fff', marginBottom:2 }}>{step.num} — {step.title}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', lineHeight:1.5 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 8 — Salas colapsable */}
          <div style={{ marginBottom:10 }}>
            <Acordeon icon="🏠" titulo="Crea tu sala y gana comisión" subtitulo="Toca para ver cómo funciona" color="rgba(245,183,49,0.2)">
              <div style={{ paddingTop:12, display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  { icon:'🏷️', title:'Nombra tu sala', desc:'¿"Los Godinez FC"? ¿"Secu Imparable"? Tú decides y compartes el código.' },
                  { icon:'👥', title:'Convoca a los suyos', desc:'Mínimo 5 para arrancar. El admin autoriza. Tus cuates se unen con tu código.' },
                  { icon:'💰', title:'Cobra tu comisión', desc:'Entre más gente invites, más te cae — hasta 5% del pozo.' },
                ].map((item, i) => (
                  <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                    <span style={{ fontSize:16, flexShrink:0 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:'#fff', marginBottom:2 }}>{item.title}</div>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', lineHeight:1.5 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginTop:4 }}>
                  {[
                    { label:'ARRANQUE',  pct:'3%', color:'#F5B731', bg:'rgba(245,183,49,0.06)',  border:'rgba(245,183,49,0.25)',  rango:'< 25' },
                    { label:'CRECIENDO', pct:'4%', color:'#00C46A', bg:'rgba(0,196,106,0.07)',   border:'rgba(0,196,106,0.28)',   rango:'25-49' },
                    { label:'EXPLOSIVO', pct:'5%', color:'#4FADFF', bg:'rgba(79,173,255,0.07)',  border:'rgba(79,173,255,0.28)',  rango:'50+' },
                  ].map((tier, i) => (
                    <div key={i} style={{ background:tier.bg, border:`1px solid ${tier.border}`, borderRadius:10, padding:'10px 8px', textAlign:'center' }}>
                      <div style={{ fontSize:7, color:tier.color, letterSpacing:1, fontWeight:700, marginBottom:2 }}>{tier.label}</div>
                      <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:32, color:tier.color, lineHeight:1 }}>{tier.pct}</div>
                      <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', marginTop:3 }}>{tier.rango}</div>
                    </div>
                  ))}
                </div>
                <button onClick={handleLogin} className="btn-entrar" style={{ padding:'12px 0', fontSize:15, letterSpacing:2, fontFamily:"'Bebas Neue', sans-serif", width:'100%', marginTop:4 }}>
                  CREAR MI SALA →
                </button>
              </div>
            </Acordeon>
          </div>

          {/* 9 — Referidos colapsable */}
          <Acordeon icon="👥" titulo="Refiere amigos y sube más rápido" subtitulo="Toca para ver los premios" color="rgba(0,196,106,0.2)">
            <div style={{ paddingTop:12, display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.55)', lineHeight:1.6 }}>
                Los 3 mejores promotores ganan quiniela gratis para <span style={{ color:'#00C46A', fontWeight:700 }}>Champions o Liga MX</span>.
              </div>
              {[
                { pos:'🥇', label:'1er lugar', premio:'Quiniela gratis + mención especial' },
                { pos:'🥈', label:'2do lugar', premio:'Quiniela gratis — siguiente competencia' },
                { pos:'🥉', label:'3er lugar', premio:'Quiniela gratis — siguiente competencia' },
              ].map((item, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:'rgba(0,0,0,0.2)', borderRadius:8 }}>
                  <span style={{ fontSize:18 }}>{item.pos}</span>
                  <div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', fontWeight:700 }}>{item.label}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>{item.premio}</div>
                  </div>
                </div>
              ))}
            </div>
          </Acordeon>

        </section>
      </div>

      {/* ══ HERO DESKTOP — CSS oculta en mobile ══ */}
      <div className="hero-desktop">
        <section style={{ padding:'96px 5% 60px', maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'flex', flexDirection:'row', gap:52, alignItems:'flex-start' }}>

            <motion.div initial={{ opacity:0, x:-24 }} animate={{ opacity:1, x:0 }} transition={{ duration:.65 }}
              style={{ flex:'0 0 auto', width:'46%' }}>
              <div style={{ animation:'fadeUp .55s ease .05s both', marginBottom:22 }}>
                <div style={{ position:'relative', display:'inline-block', paddingRight: dianaSize * 0.28 }}>
                  <div style={{
                    fontFamily:"'Bebas Neue', sans-serif", fontSize:heroFontSize,
                    letterSpacing:'6px', lineHeight:1,
                    background:'linear-gradient(135deg,#C9930A 0%,#F5B731 28%,#fff 50%,#F5B731 72%,#C9930A 100%)',
                    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                    backgroundClip:'text', whiteSpace:'nowrap', position:'relative', zIndex:2,
                  }}>
                    ATÍNALE
                  </div>
                  <div style={{
                    position:'absolute', width:dianaSize, height:dianaSize,
                    right:-(dianaSize * 0.28), top:'45%', transform:'translateY(-50%)',
                    zIndex:1, pointerEvents:'none',
                  }}>
                    <DianaHero size={dianaSize} />
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:8 }}>
                  <div style={{ height:1, width:28, background:'linear-gradient(90deg,rgba(245,183,49,0.55),rgba(245,183,49,0.05))', borderRadius:2 }}/>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontWeight:400, letterSpacing:'4.5px', textTransform:'uppercase' }}>
                    Predice y Gana
                  </div>
                </div>
                <div style={{ marginTop:16, marginBottom:4 }}>
                  <div className="neon-cobrate" style={{ fontSize:66, letterSpacing:'3px', lineHeight:1 }}>
                    CÓBRATE!
                  </div>
                  <div style={{ height:1, background:'linear-gradient(90deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))', borderRadius:2, margin:'10px 0 8px' }}/>
                  <div style={{ fontSize:16, color:'rgba(255,255,255,0.4)', fontWeight:300 }}>
                    ¿Cuánto sabes de fútbol?
                  </div>
                </div>
              </div>
              <div style={{ animation:'fadeUp .55s ease .18s both', marginBottom:26 }}>
                {[
                  { icon:'⚽', text:'El fútbol se disfruta más cuando sabes que sabes' },
                  { icon:'🎯', text:'3 pts marcador exacto — 1 pt resultado correcto' },
                  { icon:'🏆', text:'El que más acierta gana el 90% del pozo' },
                  { icon:'🔒', text:'Comisión 10% siempre visible — sin sorpresas' },
                ].map((item, i) => (
                  <div key={i} className="feature-row">
                    <span style={{ fontSize:17, flexShrink:0, marginTop:1 }}>{item.icon}</span>
                    <span style={{ color:'rgba(255,255,255,0.65)', fontSize:15, fontWeight:500, lineHeight:1.5 }}>{item.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ animation:'fadeUp .55s ease .32s both', marginBottom:11 }}>
                <button className="cta-gold" onClick={handleLogin}>🏆 QUIERO GANAR EL POZO →</button>
              </div>
              <div style={{ textAlign:'center', fontSize:12, color:'rgba(255,255,255,0.22)', lineHeight:1.8 }}>
                Entra con <span onClick={handleLogin} style={{ color:'rgba(255,255,255,0.48)', cursor:'pointer', fontWeight:700 }}>Google</span>
                {' '}· Solo 15 segundos · Pago con Mercado Pago
              </div>
            </motion.div>

            <motion.div initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} transition={{ duration:.65, delay:.15 }}
              style={{ flex:1, display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ background:CARD, border:'1px solid rgba(245,183,49,0.22)', borderRadius:18, padding:'18px 20px' }}>
                <div style={{ fontSize:9, color:'rgba(245,183,49,0.7)', letterSpacing:'2.5px', fontWeight:700, textAlign:'center', marginBottom:8 }}>
                  🏆 FIFA WORLD CUP 2026 · QUINIELA ACTIVA
                </div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.28)', letterSpacing:3, marginBottom:6, fontWeight:700, textAlign:'center' }}>
                  💵 PREMIO NETO
                </div>
                <div style={{ textAlign:'center', marginBottom:4 }}>
                  <span style={{ fontFamily:"'Bebas Neue', sans-serif", color:'#F5B731', fontSize:88, lineHeight:1, letterSpacing:'2px' }}>
                    $<CountUp target={5400} duration={2.5} active={mounted} />
                  </span>
                </div>
                <div style={{ textAlign:'center', fontSize:10, color:'rgba(255,255,255,0.22)', letterSpacing:2, marginBottom:12 }}>
                  60 jugadores X 100 MXN · Pozo $6,000 · Comisión 10% siempre visible
                </div>
                <div style={{ background:'rgba(0,196,106,0.06)', border:'1px solid rgba(0,196,106,0.2)', borderRadius:10, padding:'9px 14px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.38)' }}>📈 Si llega hasta (200 participantes), ganarías...</div>
                  <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:22, color:'#00C46A', letterSpacing:1 }}>$18,000</div>
                </div>
              </div>
              <div style={{ background:CARD, border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, overflow:'hidden' }}>
                <div style={{ padding:'10px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(255,255,255,0.05)', background:'rgba(0,196,106,0.05)' }}>
                  <span style={{ fontSize:10, color:'#00C46A', letterSpacing:2, fontWeight:700 }}>⚽ PARTIDO INAUGURAL</span>
                  <span style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:'#FF4D6D', display:'inline-block', animation:'pulseDot 1.2s ease-in-out infinite' }}/>
                    <span style={{ fontSize:9, color:'#FF4D6D', fontWeight:700 }}>11 JUN · 1:00 PM (hora centro)</span>
                  </span>
                </div>
                <div style={{ padding:'16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                  <div style={{ flex:1, textAlign:'center' }}>
                    <img src="https://flagcdn.com/w80/mx.png" alt="México" style={{ width:58, height:38, objectFit:'cover', borderRadius:5, display:'block', margin:'0 auto 8px', boxShadow:'0 2px 12px rgba(0,0,0,0.5)' }}/>
                    <div style={{ fontSize:14, fontWeight:700 }}>México</div>
                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginTop:2, letterSpacing:1 }}>EL TRI</div>
                  </div>
                  <div style={{ textAlign:'center', padding:'0 8px' }}>
                    <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:22, color:'rgba(255,255,255,0.10)', letterSpacing:2 }}>VS</div>
                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', fontWeight:600, marginTop:3 }}>Grupo A · CDMX</div>
                  </div>
                  <div style={{ flex:1, textAlign:'center' }}>
                    <img src="https://flagcdn.com/w80/za.png" alt="Sudáfrica" style={{ width:58, height:38, objectFit:'cover', borderRadius:5, display:'block', margin:'0 auto 8px', boxShadow:'0 2px 12px rgba(0,0,0,0.5)' }}/>
                    <div style={{ fontSize:14, fontWeight:700 }}>Sudáfrica</div>
                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginTop:2, letterSpacing:1 }}>BAFANA BAFANA</div>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', background:'rgba(0,0,0,0.25)', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                  {[
                    { pts:'3 PTS', label:'Exacto',    color:'#F5B731', icon:'🎯' },
                    { pts:'1 PT',  label:'Resultado', color:'#00C46A', icon:'✓' },
                    { pts:'0 PTS', label:'Fallo',     color:'rgba(255,255,255,0.2)', icon:'✗' },
                  ].map((item, i) => (
                    <div key={i} style={{ textAlign:'center', padding:'11px 0', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <div style={{ fontFamily:"'Bebas Neue', sans-serif", color:item.color, fontSize:16, letterSpacing:1 }}>{item.pts}</div>
                      <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{item.icon} {item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <a href="#salas" style={{ textDecoration:'none' }}>
                <div style={{ background:CARD, border:'1px solid rgba(245,183,49,0.18)', borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, cursor:'pointer', transition:'border-color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='rgba(245,183,49,0.45)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='rgba(245,183,49,0.18)'}>
                  <span style={{ fontSize:22, flexShrink:0 }}>🏠</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:3 }}>Crea tu sala privada y gana comisión</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.38)', lineHeight:1.5 }}>
                      Convoca a tu grupo y gana hasta <span style={{ color:'#F5B731', fontWeight:700 }}>5% del pozo</span> solo por invitar
                    </div>
                  </div>
                  <span style={{ color:'rgba(255,255,255,0.2)', fontSize:18, flexShrink:0 }}>›</span>
                </div>
              </a>
              <a href="#referidos" style={{ textDecoration:'none' }}>
                <div style={{ background:CARD, border:'1px solid rgba(0,196,106,0.2)', borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, cursor:'pointer', transition:'border-color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='rgba(0,196,106,0.5)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='rgba(0,196,106,0.2)'}>
                  <span style={{ fontSize:22, flexShrink:0 }}>👥</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:3 }}>Refiere amigos y sube más rápido</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.38)', lineHeight:1.5 }}>
                      Cada amigo que pague te sube en el ranking. Top 3 gana quiniela gratis para UEFA o Liga MX
                    </div>
                  </div>
                  <span style={{ color:'rgba(255,255,255,0.2)', fontSize:18, flexShrink:0 }}>›</span>
                </div>
              </a>
            </motion.div>
          </div>
        </section>
      </div>

      {/* ══ 3 PASOS — solo desktop ══ */}
      <div className="desktop-only">
        <section style={{ padding:'64px 5%', maxWidth:1200, margin:'0 auto', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:5, marginBottom:12, fontWeight:700 }}>⚡ ASÍ DE FÁCIL</div>
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", color:'#fff', fontSize:62, letterSpacing:'3px', lineHeight:1, marginBottom:12 }}>
              3 PASOS PARA<br/><span style={{ color:'#F5B731' }}>GANAR EL POZO</span>
            </div>
            <div style={{ color:'rgba(255,255,255,0.38)', fontSize:16 }}>
              Sin complicaciones — predice, compite y cobra
            </div>
          </div>
          <div style={{ display:'flex', gap:12, marginBottom:36 }}>
            {[
              { num:'01', icon:'💳', title:'Regístrate y paga',       desc:'Crea tu cuenta con Google y paga $100 vía Mercado Pago. En menos de 2 minutos estás dentro.',  accent:'rgba(245,183,49,0.10)', border:'rgba(245,183,49,0.22)', num_color:'rgba(245,183,49,0.25)' },
              { num:'02', icon:'🎯', title:'Predice los 48 partidos', desc:'Escribe el marcador exacto de cada partido. Se bloquea automáticamente al pitazo inicial.',      accent:'rgba(0,196,106,0.09)', border:'rgba(0,196,106,0.2)',   num_color:'rgba(0,196,106,0.25)' },
              { num:'03', icon:'🏆', title:'Sube al ranking y cobra',  desc:'El que más aciertos tenga se lleva el 90% del pozo. Ranking actualizado en tiempo real.',       accent:'rgba(79,173,255,0.07)', border:'rgba(79,173,255,0.18)', num_color:'rgba(79,173,255,0.22)' },
            ].map((step, i) => (
              <div key={i} className="step-card">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:step.accent, border:`1px solid ${step.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                    {step.icon}
                  </div>
                  <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:28, color:step.num_color }}>{step.num}</div>
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:15, color:'#fff', marginBottom:6 }}>{step.title}</div>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,0.38)', lineHeight:1.65 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ maxWidth:520, margin:'0 auto' }}>
            <button className="cta-gold" onClick={handleLogin}>🏆 QUIERO GANAR EL POZO →</button>
            <div style={{ textAlign:'center', marginTop:12, fontSize:11, color:'rgba(255,255,255,0.18)', lineHeight:1.9 }}>
              Pago seguro con Mercado Pago · Comisión 10% siempre visible
            </div>
          </div>
        </section>
      </div>

      {/* ══ SALAS PRIVADAS — solo desktop ══ */}
      <div className="desktop-only">
        <section id="salas" style={{ padding:'64px 5%', maxWidth:1200, margin:'0 auto', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:5, marginBottom:12, fontWeight:700 }}>🏠 PARA GRUPOS</div>
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", color:'#fff', fontSize:56, letterSpacing:'3px', lineHeight:1, marginBottom:12 }}>
              CREA TU SALA<br/><span style={{ color:'#F5B731' }}>Y GANA COMISIÓN</span>
            </div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:15, maxWidth:540, margin:'0 auto' }}>
              Arma tu quiniela privada y tú cobras por cada persona que se une. Sin complicaciones.
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:28 }}>
            {[
              { icon:'🏷️', step:'01', title:'Nombra tu sala',      desc:'¿"Los Godinez FC"? ¿"La Prepa 5 Bravos"? ¿"Secu Imparable"? Tú decides el nombre y compartes tu código.' },
              { icon:'👥', step:'02', title:'Convoca a los suyos', desc:'Mínimo 5 para arrancar. El admin autoriza tu sala. Tus cuates se unen con tu código — así de fácil.' },
              { icon:'💰', step:'03', title:'Cobra tu comisión',   desc:'Entre más gente invites, más dinero te cae. Tu ganancia proyectada se actualiza en tiempo real.' },
            ].map((item, i) => (
              <div key={i} style={{ background:CARD, borderRadius:16, padding:'20px 18px', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize:28, marginBottom:10 }}>{item.icon}</div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:12, color:'rgba(245,183,49,0.4)', letterSpacing:2 }}>{item.step}</div>
                  <div style={{ fontWeight:700, fontSize:15, color:'#fff' }}>{item.title}</div>
                </div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.65 }}>{item.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ background:CARD, borderRadius:18, padding:'24px 20px', border:'1px solid rgba(245,183,49,0.15)', marginBottom:20 }}>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.25)', letterSpacing:3, fontWeight:700, marginBottom:6 }}>TU GANANCIA COMO CREADOR DE SALA</div>
              <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:28, color:'#fff', letterSpacing:2 }}>COMISIÓN ESCALONADA</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
              {[
                { label:'ARRANQUE',  pct:'3%', color:'#F5B731', border:'rgba(245,183,49,0.25)', bg:'rgba(245,183,49,0.06)', rango:'Menos de 25', ejemplo:'20 personas × $100', ganancia:'$60' },
                { label:'CRECIENDO', pct:'4%', color:'#00C46A', border:'rgba(0,196,106,0.28)',  bg:'rgba(0,196,106,0.07)',  rango:'25 a 49',      ejemplo:'35 personas × $100', ganancia:'$140' },
                { label:'EXPLOSIVO', pct:'5%', color:'#4FADFF', border:'rgba(79,173,255,0.28)', bg:'rgba(79,173,255,0.07)', rango:'50 o más',     ejemplo:'60 personas × $100', ganancia:'$300' },
              ].map((tier, i) => (
                <div key={i} className="sala-tier" style={{ border:`1px solid ${tier.border}`, background:tier.bg }}>
                  <div style={{ fontSize:9, color:tier.color, letterSpacing:3, fontWeight:700 }}>{tier.label}</div>
                  <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:52, color:tier.color, lineHeight:1 }}>{tier.pct}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.38)', lineHeight:1.5, textAlign:'center' }}>{tier.rango}<br/>participantes</div>
                  <div style={{ width:'100%', borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:10, marginTop:4 }}>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.2)', marginBottom:3 }}>Ej. {tier.ejemplo}</div>
                    <div style={{ fontSize:15, color:tier.color, fontWeight:800 }}>{tier.ganancia} para ti</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:16, padding:'10px 14px', background:'rgba(255,255,255,0.03)', borderRadius:10, border:'1px solid rgba(255,255,255,0.05)', textAlign:'center' }}>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.32)' }}>
                💡 La comisión sale del 10% que retiene la plataforma. El premio neto <span style={{ color:'rgba(255,255,255,0.6)', fontWeight:600 }}>nunca se toca.</span>
              </span>
            </div>
          </div>
          <div style={{ background:'rgba(245,183,49,0.05)', border:'1px solid rgba(245,183,49,0.2)', borderRadius:16, padding:'20px', display:'flex', alignItems:'center', gap:20 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:15, color:'#fff', marginBottom:6 }}>¿Listo para crear tu sala?</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.6 }}>
                Requisito: estar inscrito en al menos una quiniela pagada.<br/>
                El admin autoriza tu sala — normalmente en menos de 24 hrs.
              </div>
            </div>
            <button onClick={handleLogin} className="btn-entrar" style={{ padding:'14px 28px', fontSize:16, letterSpacing:2, fontFamily:"'Bebas Neue', sans-serif", whiteSpace:'nowrap', flexShrink:0 }}>
              CREAR MI SALA →
            </button>
          </div>
        </section>
      </div>

      {/* ══ REFERIDOS — solo desktop ══ */}
      <div className="desktop-only">
        <section id="referidos" style={{ padding:'64px 5%', maxWidth:1200, margin:'0 auto', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:5, marginBottom:12, fontWeight:700 }}>🌟 RANKING DE PROMOTORES</div>
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", color:'#fff', fontSize:62, letterSpacing:'3px', lineHeight:1, marginBottom:12 }}>
              REFIERE MÁS,<br/><span style={{ color:'#F5B731' }}>GANA MÁS.</span>
            </div>
            <div style={{ color:'rgba(255,255,255,0.38)', fontSize:16, maxWidth:560, margin:'0 auto' }}>
              Los 3 mejores promotores del Mundial ganan una quiniela gratis para Champions o Liga MX.
            </div>
          </div>
          <div style={{ display:'flex', gap:12, marginBottom:28 }}>
            {[
              { pos:'🥇', label:'1er lugar', premio:'Quiniela gratis + mención especial en la plataforma', color:'rgba(245,183,49,0.2)', border:'rgba(245,183,49,0.3)' },
              { pos:'🥈', label:'2do lugar', premio:'Quiniela gratis para la siguiente competencia',        color:'rgba(255,255,255,0.05)', border:'rgba(255,255,255,0.1)' },
              { pos:'🥉', label:'3er lugar', premio:'Quiniela gratis para la siguiente competencia',        color:'rgba(255,255,255,0.05)', border:'rgba(255,255,255,0.1)' },
            ].map((item, i) => (
              <div key={i} style={{ flex:1, background:item.color, border:`1px solid ${item.border}`, borderRadius:16, padding:'20px 18px', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:8 }}>
                <span style={{ fontSize:32 }}>{item.pos}</span>
                <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:18, color:'#fff', letterSpacing:1 }}>{item.label}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', lineHeight:1.5 }}>{item.premio}</div>
              </div>
            ))}
          </div>
          <div style={{ background:CARD, borderRadius:16, padding:'20px', border:'1px solid rgba(245,183,49,0.15)', maxWidth:600, margin:'0 auto' }}>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.22)', letterSpacing:3, fontWeight:700, marginBottom:16, textAlign:'center' }}>
              CÓMO SE VE EN TU DASHBOARD
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
              {[
                { label:'Referidos',   value:'7',   color:'#F5B731' },
                { label:'Activos',     value:'5',   color:'#00C46A' },
                { label:'Mi posición', value:'#4',  color:'#4FADFF' },
                { label:'Pts ranking', value:'310', color:'#F5B731' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign:'center', padding:'12px 0', background:'rgba(0,0,0,0.25)', borderRadius:10 }}>
                  <div style={{ fontSize:24, fontWeight:800, color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.28)', marginTop:4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ══ CTA FINAL ══ */}
      <section style={{ padding:'60px 5% 80px', maxWidth:1200, margin:'0 auto', borderTop:'1px solid rgba(255,255,255,0.06)', textAlign:'center' }}>
        
        <div style={{ fontFamily:"'Bebas Neue', sans-serif", color:'#fff', fontSize: isMobile ? 40  : 60, letterSpacing:'3px', lineHeight:1, marginBottom:6 }}>
          EL MUNDIAL EMPIEZA
        </div>
        <div style={{ fontFamily:"'Bebas Neue', sans-serif", color:'#F5B731', fontSize: isMobile ? 48 : 68, letterSpacing:'3px', lineHeight:1, marginBottom:16 }}>
          11 DE JUNIO
        </div>
        <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'rgba(255,77,109,0.08)', border:'1px solid rgba(255,77,109,0.25)', borderRadius:12, padding:'10px 20px', marginBottom:28 }}>
          <span style={{ fontSize:14 }}>⚠️</span>
          <span style={{ fontSize:12, color:'rgba(255,150,150,0.9)', fontWeight:600, letterSpacing:.5 }}>
            El registro cierra el <span style={{ color:'#FF4D6D' }}>11 de junio 12:50 PM</span> — después no puedes participar
          </span>
        </div>
        <div style={{ color:'rgba(255,255,255,0.35)', fontSize: isMobile ? 13 : 15, maxWidth:460, margin:'0 auto 32px' }}>
          México vs Sudáfrica · Estadio Azteca · 1:00 PM (hora centro)<br/>
          Tus predicciones se bloquean automáticamente al pitazo.
        </div>
        <div style={{ maxWidth:520, margin:'0 auto' }}>
          <button className="cta-gold" onClick={handleLogin}>🏆 QUIERO GANAR EL POZO →</button>
          <div style={{ marginTop:14, fontSize:11, color:'rgba(255,255,255,0.18)', lineHeight:1.9 }}>
            Pago seguro con Mercado Pago · Comisión 10% siempre visible<br/>
            <span style={{ color:'rgba(245,183,49,0.35)' }}>atinale-ecru.vercel.app</span>
          </div>
        </div>
      </section>

    </div>
  )
}