// @ts-nocheck
'use client'
import { motion, animate } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

function CountUp({ target, duration = 2.5 }: { target: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const controls = animate(0, target, {
      duration, ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return controls.stop
  }, [target, duration])
  return <>{display.toLocaleString('es-MX')}</>
}

function DianaHero({ size = 124, bg }: { size?: number; bg: string }) {
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
        @keyframes spin    { from{transform:rotate(0deg)}   to{transform:rotate(360deg)} }
        @keyframes spinRev { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }
      `}</style>
      {/* Anillo 1 */}
      <div style={{ position:'absolute', inset:0, animation:'spin 18s linear infinite' }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
          <circle cx={size/2} cy={size/2} r={r1} fill="none" stroke="rgba(245,183,49,0.10)" strokeWidth="1"/>
          <circle cx={size/2} cy={size/2} r={r1} fill="none" stroke="rgba(245,183,49,0.55)" strokeWidth="1.2"
            strokeDasharray={`26 ${Math.round(r1*2*Math.PI)-26}`} strokeLinecap="round"/>
          <circle cx={size/2} cy={size/2} r={r1} fill="none" stroke="rgba(245,183,49,0.20)" strokeWidth="0.6"
            strokeDasharray={`9 ${Math.round(r1*2*Math.PI)-9}`} strokeDashoffset={Math.round(r1*Math.PI*0.6)} strokeLinecap="round"/>
        </svg>
      </div>
      {/* Anillo 2 */}
      <div style={{ position:'absolute', inset:off1, animation:'spinRev 11s linear infinite' }}>
        <svg viewBox={`0 0 ${s2} ${s2}`} width={s2} height={s2}>
          <circle cx={s2/2} cy={s2/2} r={r2} fill="none" stroke="rgba(245,183,49,0.08)" strokeWidth="1"/>
          <circle cx={s2/2} cy={s2/2} r={r2} fill="none" stroke="rgba(245,183,49,0.48)" strokeWidth="1"
            strokeDasharray={`18 ${Math.round(r2*2*Math.PI)-18}`} strokeLinecap="round"/>
        </svg>
      </div>
      {/* Anillo 3 */}
      <div style={{ position:'absolute', inset:off2, animation:'spin 7s linear infinite' }}>
        <svg viewBox={`0 0 ${s3} ${s3}`} width={s3} height={s3}>
          <circle cx={s3/2} cy={s3/2} r={r3} fill="none" stroke="rgba(245,183,49,0.10)" strokeWidth="0.8"/>
          <circle cx={s3/2} cy={s3/2} r={r3} fill="none" stroke="rgba(245,183,49,0.42)" strokeWidth="0.8"
            strokeDasharray={`12 ${Math.round(r3*2*Math.PI)-12}`} strokeLinecap="round"/>
        </svg>
      </div>
      {/* Anillo 4 */}
      <div style={{ position:'absolute', inset:off3, animation:'spinRev 4s linear infinite' }}>
        <svg viewBox={`0 0 ${s4} ${s4}`} width={s4} height={s4}>
          <circle cx={s4/2} cy={s4/2} r={r4} fill="none" stroke="rgba(245,183,49,0.50)" strokeWidth="0.8"
            strokeDasharray={`7 ${Math.round(r4*2*Math.PI)-7}`} strokeLinecap="round"/>
        </svg>
      </div>
      {/* Estrella */}
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(245,183,49,0.9)">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
        </svg>
      </div>
      {/* Crosshair */}
      <div style={{ position:'absolute', top:'50%', left:0, right:0, height:1, transform:'translateY(-50%)', background:'linear-gradient(90deg,transparent,rgba(245,183,49,0.2),rgba(245,183,49,0.3),rgba(245,183,49,0.2),transparent)' }}/>
      <div style={{ position:'absolute', left:'50%', top:0, bottom:0, width:1, transform:'translateX(-50%)', background:'linear-gradient(180deg,transparent,rgba(245,183,49,0.2),rgba(245,183,49,0.3),rgba(245,183,49,0.2),transparent)' }}/>
    </>
  )
}

function NavDiana() {
  return (
    <div style={{ position:'relative', width:36, height:36, flexShrink:0 }}>
      <style>{`
        @keyframes navSpin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes navSpinRev { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
        @keyframes navPulse   { 0%,100%{transform:scale(1);opacity:.7} 50%{transform:scale(1.3);opacity:1} }
      `}</style>
      <div style={{ position:'absolute', inset:0, animation:'navSpin 6s linear infinite' }}>
        <svg viewBox="0 0 36 36" width="36" height="36">
          <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(245,183,49,0.12)" strokeWidth="1"/>
          <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(245,183,49,0.6)" strokeWidth="1.2" strokeDasharray="10 91" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ position:'absolute', inset:8, animation:'navSpinRev 4s linear infinite' }}>
        <svg viewBox="0 0 20 20" width="20" height="20">
          <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(245,183,49,0.5)" strokeWidth="1" strokeDasharray="6 45" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ animation:'navPulse 1.8s ease-in-out infinite' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="#F5B731">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
        </div>
      </div>
      <div style={{ position:'absolute', top:'50%', left:0, right:0, height:1, transform:'translateY(-50%)', background:'linear-gradient(90deg,transparent,rgba(245,183,49,0.25),transparent)' }}/>
      <div style={{ position:'absolute', left:'50%', top:0, bottom:0, width:1, transform:'translateX(-50%)', background:'linear-gradient(180deg,transparent,rgba(245,183,49,0.25),transparent)' }}/>
    </div>
  )
}

export default function Home() {
  const [isMobile, setIsMobile] = useState(false)
  const BG = '#080C16'
  const CARD = '#111520'

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  async function handleLogin() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  // Tamaño de la diana según pantalla
  const dianaSize = isMobile ? 110 : 140

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: "'Outfit', sans-serif", color: '#F0F2F8', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer  { 0%{left:-100%} 100%{left:200%} }
        @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:.3} }
        .cta-gold {
          background: linear-gradient(135deg,#F5B731,#C9930A);
          color: #080C16; border: none; border-radius: 12px;
          padding: 16px 0; font-family: 'Bebas Neue', sans-serif;
          font-size: 20px; letter-spacing: 2px; cursor: pointer;
          width: 100%; position: relative; overflow: hidden;
          transition: transform .15s, box-shadow .15s;
        }
        .cta-gold:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(245,183,49,0.35); }
        .cta-gold::after {
          content:''; position:absolute; top:0; left:-100%;
          width:60%; height:100%;
          background: linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);
          animation: shimmer 2.5s ease-in-out infinite;
        }
        .step-card {
          background: #111520; border-radius: 14px; padding: 16px 14px;
          border: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: flex-start; gap: 14px;
          transition: transform .2s, border-color .2s;
        }
        .step-card:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.12); }
      `}</style>

      {/* ══ NAVBAR ══ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(8,12,22,0.94)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 60,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <NavDiana />
          <div>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: isMobile ? 20 : 26, letterSpacing: '3px', lineHeight: 1,
              background: 'linear-gradient(135deg,#F5B731,#C9930A)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              ATÍNALE
            </div>
            {!isMobile && (
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.28)', letterSpacing: '3px', textTransform: 'uppercase' }}>
                Quinielas Deportivas
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!isMobile && (
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
              ¿Cómo funciona?
            </span>
          )}
          <button onClick={handleLogin} style={{
            background: 'linear-gradient(135deg,#F5B731,#C9930A)', color: '#080C16',
            border: 'none', borderRadius: 20,
            padding: isMobile ? '8px 16px' : '9px 22px',
            fontSize: isMobile ? 12 : 13, fontWeight: 800, cursor: 'pointer',
            fontFamily: "'Outfit', sans-serif"
          }}>
            Entrar →
          </button>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{ padding: isMobile ? '80px 20px 48px' : '100px 5% 60px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 32 : 60, alignItems: isMobile ? 'stretch' : 'center' }}>

          {/* IZQUIERDA */}
          <motion.div
            initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }}
            transition={{ duration:.6 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* ── ATÍNALE + Diana ── */}
            {/*
              TÉCNICA PARA LA DIANA:
              - El wrapper tiene position:relative + display:inline-block
              - El texto tiene padding-right = dianaSize/2 (para dejar espacio a la mitad de la diana)
              - overflow:hidden en el texto oculta el espacio en blanco
              - La diana se posiciona con right: -(dianaSize/2) para centrarla en el borde de la E
            */}
            <div style={{ marginBottom: 8, animation: 'fadeUp .6s ease .1s both' }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 8 }}>
                Quinielas Deportivas
              </div>

              <div style={{ position: 'relative', display: 'inline-block', lineHeight: 1 }}>
                {/* Diana — centrada en el borde derecho del texto */}
                <div style={{
                  position: 'absolute',
                  width: dianaSize,
                  height: dianaSize,
                  right: -(dianaSize / 2),
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                  pointerEvents: 'none'
                }}>
                  <DianaHero size={dianaSize} bg={BG} />
                </div>

                {/* Texto — clip visual con overflow hidden para tapar el espacio en blanco */}
                <div style={{
                  position: 'relative',
                  zIndex: 2,
                  background: BG,
                  display: 'inline-block',
                  paddingRight: dianaSize / 2,
                  // overflow hidden elimina el espacio visible a la derecha
                  // pero el background sigue tapando los anillos debajo del texto
                  clipPath: `inset(0 0 0 0)`,
                }}>
                  <div style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: isMobile ? 56 : 72,
                    letterSpacing: '5px', lineHeight: 1,
                    background: 'linear-gradient(135deg,#C9930A 0%,#F5B731 35%,#fff 55%,#F5B731 75%,#C9930A 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text', whiteSpace: 'nowrap',
                    // Margen negativo elimina el hueco visible
                    marginRight: -(dianaSize / 2),
                  }}>
                    ATÍNALE
                  </div>
                </div>
              </div>

              {/* Predice. Compite. Gana. */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
                <div style={{ height: 2, width: 26, background: 'linear-gradient(90deg,rgba(255,255,255,0.4),rgba(255,255,255,0.05))', borderRadius: 2 }}/>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 300, letterSpacing: '3px' }}>
                  Predice. Compite. Gana.
                </div>
              </div>
            </div>

            {/* Tagline */}
            <div style={{ animation: 'fadeUp .6s ease .25s both', marginBottom: 16 }}>
              <div style={{ fontSize: isMobile ? 10 : 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 4, fontWeight: 700, marginBottom: 10 }}>
                🏆 FIFA WORLD CUP 2026 · QUINIELA ACTIVA
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#fff', fontSize: isMobile ? 52 : 68, lineHeight: 0.9, letterSpacing: '2px', marginBottom: 8 }}>
                CÓBRATE.
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", color: 'rgba(255,255,255,0.7)', fontSize: isMobile ? 30 : 42, lineHeight: 1, letterSpacing: '2px' }}>
                ¿CUÁNTO SABES<br />DE FÚTBOL?
              </div>
            </div>

            {/* Features */}
            <div style={{ animation: 'fadeUp .6s ease .4s both', marginBottom: 22 }}>
              {[
                { icon: '💰', text: 'Predice marcadores y acumula puntos' },
                { icon: '🎯', text: 'El que más acierta gana el pozo' },
                { icon: '👥', text: 'Refiere amigos y gana +5 puntos extra' },
                { icon: '🔒', text: 'Comisión 10% siempre visible para todos' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 9 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: isMobile ? 13 : 14, fontWeight: 500 }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ animation: 'fadeUp .6s ease .5s both', marginBottom: 10 }}>
              <button className="cta-gold" onClick={handleLogin}>
                🏆 QUIERO GANAR EL POZO →
              </button>
            </div>
            <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', animation: 'fadeUp .6s ease .6s both' }}>
              Entra con <span onClick={handleLogin} style={{ color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontWeight: 700 }}>Google</span> · Solo 15 segundos · Pago con Mercado Pago
            </div>
          </motion.div>

          {/* DERECHA */}
          <motion.div
            initial={{ opacity:0, x: isMobile ? 0 : 30, y: isMobile ? 20 : 0 }}
            animate={{ opacity:1, x:0, y:0 }}
            transition={{ duration:.6, delay:.2 }}
            style={{ flex: isMobile ? 'none' : 1, display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Pozo card — sin azul, uniforme */}
            <div style={{
              background: CARD, border: '1px solid rgba(245,183,49,0.2)',
              borderRadius: 18, padding: '18px 20px', textAlign: 'center'
            }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: 3, marginBottom: 6, fontWeight: 700 }}>
                💵 PREMIO NETO · QUINIELA ACTIVA
              </div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                color: '#F5B731', fontSize: isMobile ? 64 : 80,
                lineHeight: 1, letterSpacing: '2px', marginBottom: 2
              }}>
                $<CountUp target={5400} duration={2.5} />
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 3, marginBottom: 14 }}>MXN</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>
                {[
                  { label: 'Pozo total', value: '$6,000', sub: '30 × $200' },
                  { label: 'Jugadores',  value: '30',     sub: 'inscritos' },
                  { label: 'Comisión',   value: '$600',   sub: '10% visible' },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none', padding: '0 4px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, marginBottom: 4, fontWeight: 600 }}>{s.label}</div>
                    <div style={{ color: '#fff', fontSize: isMobile ? 16 : 18, fontWeight: 800, marginBottom: 2 }}>{s.value}</div>
                    <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9 }}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Partido inaugural */}
            <div style={{ background: CARD, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,196,106,0.05)' }}>
                <span style={{ fontSize: 9, color: '#00C46A', letterSpacing: 2, fontWeight: 700, textTransform: 'uppercase' }}>⚽ Partido Inaugural</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF4D6D', display: 'inline-block', animation: 'pulseDot 1.2s ease-in-out infinite' }}/>
                  <span style={{ fontSize: 9, color: '#FF4D6D', fontWeight: 700 }}>11 JUN · 5:00 PM CST</span>
                </span>
              </div>
              <div style={{ padding: '16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <img src="https://flagcdn.com/w80/mx.png" alt="México" style={{ width: isMobile ? 44 : 52, height: isMobile ? 29 : 34, objectFit: 'cover', borderRadius: 4, display: 'block', margin: '0 auto 8px', boxShadow: '0 2px 10px rgba(0,0,0,0.4)' }}/>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>México</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>EL TRI</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: 'rgba(255,255,255,0.12)', letterSpacing: 2 }}>VS</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: 2 }}>Grupo A · CDMX</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <img src="https://flagcdn.com/w80/za.png" alt="Sudáfrica" style={{ width: isMobile ? 44 : 52, height: isMobile ? 29 : 34, objectFit: 'cover', borderRadius: 4, display: 'block', margin: '0 auto 8px', boxShadow: '0 2px 10px rgba(0,0,0,0.4)' }}/>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Sudáfrica</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>BAFANA BAFANA</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {[
                  { pts: '3 PTS', label: '🎯 Exacto',   color: '#F5B731' },
                  { pts: '1 PT',  label: '✓ Resultado', color: '#00C46A' },
                  { pts: '0 PTS', label: '✗ Fallo',     color: '#374151' },
                ].map((item, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '10px 0', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", color: item.color, fontSize: 15 }}>{item.pts}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Referidos */}
            <div style={{ background: CARD, border: '1px solid rgba(0,196,106,0.15)', borderRadius: 14, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 24, flexShrink: 0 }}>👥</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 3 }}>Refiere amigos y sube más rápido</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                  Cada amigo que pague te da <span style={{ color: '#00C46A', fontWeight: 700 }}>+5 puntos</span> en el ranking
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </section>

      {/* ══ 3 PASOS ══ */}
      <section style={{ padding: isMobile ? '40px 20px' : '56px 5%', maxWidth: 1200, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 24 : 40 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 5, marginBottom: 10, fontWeight: 700 }}>⚡ ASÍ DE FÁCIL</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#fff', fontSize: isMobile ? 40 : 60, letterSpacing: '3px', lineHeight: 1, marginBottom: 10 }}>
            3 PASOS PARA<br/><span style={{ color: '#F5B731' }}>GANAR EL POZO</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: isMobile ? 13 : 15, fontWeight: 400 }}>
            Sin complicaciones — predice, compite y cobra
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
          {[
            { num: '01', icon: '💳', title: 'Regístrate y paga',       desc: 'Crea tu cuenta y paga $100 vía Mercado Pago. En menos de 2 minutos estás dentro.',       accent: 'rgba(245,183,49,0.12)',  border: 'rgba(245,183,49,0.25)',  num_color: 'rgba(245,183,49,0.12)' },
            { num: '02', icon: '🎯', title: 'Predice los 48 partidos', desc: 'Escribe el marcador exacto de cada partido. Se bloquea automáticamente al iniciar.',       accent: 'rgba(0,196,106,0.1)',    border: 'rgba(0,196,106,0.2)',    num_color: 'rgba(0,196,106,0.12)'  },
            { num: '03', icon: '🏆', title: 'Sube al ranking y gana',  desc: 'El que más aciertos tenga se lleva el 90% del pozo. Ranking en tiempo real.',              accent: 'rgba(79,173,255,0.08)',  border: 'rgba(79,173,255,0.18)',  num_color: 'rgba(79,173,255,0.1)'  },
          ].map((step, i) => (
            <div key={i} className="step-card">
              <div style={{ width: 38, height: 38, borderRadius: 10, background: step.accent, border: `1px solid ${step.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>
                {step.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{step.title}</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: step.num_color }}>{step.num}</div>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <button className="cta-gold" onClick={handleLogin}>
          🏆 QUIERO GANAR EL POZO →
        </button>
        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,0.2)', lineHeight: 1.8 }}>
          Pago seguro con Mercado Pago · Comisión 10% siempre visible<br/>
          <span style={{ color: 'rgba(245,183,49,0.4)' }}>atinale-ecru.vercel.app</span>
        </div>
      </section>

    </div>
  )
}