'use client'
import { motion, animate } from 'framer-motion'
import { useEffect, useState } from 'react'
import '@fontsource/bebas-neue'

function CountUp({ target, duration = 2.5 }: { target: number, duration?: number }) {
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

export default function Home() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  async function handleLogin() {
    const { createBrowserClient } = await import('@supabase/ssr')
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  return (
    <div style={{
      background: 'linear-gradient(160deg, #0A0F2E 0%, #0D0D1A 40%, #0A1628 100%)',
      minHeight: '100vh', fontFamily: 'system-ui, sans-serif'
    }}>

      {/* ══ NAVBAR ══ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: '#0A0F2Ecc', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #1E2A4A',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem', height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '2px solid #534AB7' }}/>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2.5px solid #534AB7' }}/>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 26, height: 26, borderRadius: '50%', border: '2px solid #7F77DD'
            }}/>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 13, height: 13, borderRadius: '50%', background: '#534AB7'
            }}/>
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
                width: 6, height: 6, borderRadius: '50%',
                background: '#EFC84A', boxShadow: '0 0 8px #EFC84A'
              }}/>
            {[
              { top: 2, left: '50%', transform: 'translateX(-50%)', width: 2, height: 8 },
              { bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 2, height: 8 },
              { left: 2, top: '50%', transform: 'translateY(-50%)', width: 8, height: 2 },
              { right: 2, top: '50%', transform: 'translateY(-50%)', width: 8, height: 2 },
            ].map((s, i) => (
              <div key={i} style={{ position: 'absolute', background: '#EFC84A', borderRadius: 1, ...s as any }}/>
            ))}
          </div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 22 : 30, color: '#fff', letterSpacing: '3px', lineHeight: 1 }}>
              ATÍNALE
            </div>
            {!isMobile && (
              <div style={{ fontSize: 9, color: '#7F77DD', letterSpacing: '3px' }}>QUINIELAS DEPORTIVAS</div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {!isMobile && (
            <span style={{ color: '#AFA9EC', fontSize: 15, cursor: 'pointer', fontWeight: 500 }}>¿Cómo funciona?</span>
          )}
          <motion.button
            onClick={handleLogin}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{
              background: '#534AB7', color: '#fff', border: 'none',
              borderRadius: 50, padding: isMobile ? '8px 16px' : '10px 24px',
              fontSize: isMobile ? 13 : 15, fontWeight: 600, cursor: 'pointer'
            }}>Entrar →</motion.button>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? 24 : 48,
        padding: isMobile ? '80px 5% 48px' : '100px 5% 60px',
        maxWidth: 1200, margin: '0 auto',
      }}>

        {/* IZQUIERDA */}
        <motion.div
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{ flex: 1 }}>

          <p style={{ color: '#AFA9EC', fontSize: isMobile ? 11 : 13, letterSpacing: 4, marginBottom: 16, fontWeight: 700 }}>
            🏆 FIFA WORLD CUP 2026 · QUINIELA ACTIVA
          </p>

          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            color: '#EFC84A', fontSize: isMobile ? 64 : 96,
            lineHeight: 0.9, letterSpacing: '2px', marginBottom: 10
          }}>CÓBRATE.</h2>

          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            color: '#ffffff', fontSize: isMobile ? 42 : 64,
            lineHeight: 1, letterSpacing: '2px', marginBottom: 28
          }}>
            ¿CUÁNTO SABES<br />DE FÚTBOL?
          </h1>

          <div style={{ marginBottom: 28 }}>
            {[
              { icon: '💰', text: 'Predice marcadores y acumula puntos' },
              { icon: '🎯', text: 'El que más acierta gana el pozo' },
              { icon: '👥', text: 'Refiere amigos y gana puntos extra' },
              { icon: '🔒', text: 'Comisión 10% visible para todos' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                <p style={{ color: '#ffffff', fontSize: isMobile ? 15 : 18, fontWeight: 600, lineHeight: 1.2 }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <motion.button
              onClick={handleLogin}
              whileHover={{ scale: 1.05, boxShadow: '0 0 28px #EFC84A60' }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: '#EFC84A', color: '#0D0D1A', border: 'none',
                borderRadius: 50, padding: isMobile ? '16px 32px' : '20px 44px',
                fontSize: isMobile ? 16 : 18, fontWeight: 800, cursor: 'pointer',
                width: isMobile ? '100%' : 'auto'
              }}>
              🏆 Quiero ganar el pozo
            </motion.button>
            {!isMobile && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                style={{
                  background: 'transparent', color: '#ffffff',
                  border: '1px solid #534AB7', borderRadius: 50,
                  padding: '20px 32px', fontSize: 16,
                  cursor: 'pointer', fontWeight: 600
                }}>
                ¿Cómo funciona?
              </motion.button>
            )}
          </div>

          <p style={{ color: '#7F8EA8', fontSize: 13 }}>
            Entra con{' '}
            <span onClick={handleLogin} style={{ color: '#AFA9EC', cursor: 'pointer', fontWeight: 700 }}>Google</span>
            {' '}o{' '}
            <span style={{ color: '#AFA9EC', cursor: 'pointer', fontWeight: 700 }}>Facebook</span>
            {' '}— solo toma 15 segundos
          </p>
        </motion.div>

        {/* DERECHA */}
        <motion.div
          initial={{ opacity: 0, x: isMobile ? 0 : 30, y: isMobile ? 20 : 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ flex: isMobile ? 'none' : 1.1, display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Premio */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            style={{
              background: 'linear-gradient(135deg, #1A1050 0%, #0F1A3A 100%)',
              border: '1px solid #534AB7',
              borderRadius: 24, padding: isMobile ? '1.25rem' : '1.75rem 2rem',
              position: 'relative', overflow: 'hidden', textAlign: 'center'
            }}>
            <div style={{
              position: 'absolute', top: -60, left: '50%',
              transform: 'translateX(-50%)',
              width: 300, height: 200, borderRadius: '50%',
              background: '#EFC84A08', filter: 'blur(40px)'
            }}/>
            <p style={{ color: '#AFA9EC', fontSize: 11, letterSpacing: 4, marginBottom: 8, fontWeight: 700 }}>
              💵 PREMIO NETO · QUINIELA ACTIVA
            </p>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              color: '#EFC84A', fontSize: isMobile ? 72 : 96,
              lineHeight: 1, letterSpacing: '2px', marginBottom: 2,
              textShadow: '0 0 40px #EFC84A50'
            }}>
              $<CountUp target={5400} duration={2.5} />
            </div>
            <p style={{ color: '#AFA9EC', fontSize: 13, marginBottom: 14, fontWeight: 700, letterSpacing: 3 }}>MXN</p>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
              borderTop: '1px solid #2A2050', paddingTop: 14
            }}>
              {[
                { label: 'Pozo total', value: '$6,000', sub: '30 × $200' },
                { label: 'Jugadores', value: '30', sub: 'inscritos' },
                { label: 'Comisión', value: '$600', sub: '10% visible' },
              ].map((s, i) => (
                <div key={i} style={{
                  textAlign: 'center',
                  borderRight: i < 2 ? '1px solid #2A2050' : 'none',
                  padding: '0 4px'
                }}>
                  <p style={{ color: '#AFA9EC', fontSize: 11, marginBottom: 4, fontWeight: 600 }}>{s.label}</p>
                  <p style={{ color: '#ffffff', fontSize: isMobile ? 18 : 22, fontWeight: 800, marginBottom: 2 }}>{s.value}</p>
                  <p style={{ color: '#5F6E8A', fontSize: 10 }}>{s.sub}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Partido inaugural */}
          <div style={{
            background: '#111827', border: '1px solid #1E2A4A',
            borderRadius: 24, overflow: 'hidden'
          }}>
            <div style={{
              background: '#0A0F1E', padding: '0.75rem 1.25rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: '1px solid #1E2A4A'
            }}>
              <span style={{ color: '#AFA9EC', fontSize: isMobile ? 11 : 13, letterSpacing: 2, fontWeight: 700 }}>
                ⚽ PARTIDO INAUGURAL
              </span>
              <span style={{
                background: '#EFC84A15', color: '#EFC84A',
                fontSize: isMobile ? 11 : 13, padding: '4px 12px', borderRadius: 20,
                fontWeight: 700, border: '1px solid #EFC84A30'
              }}>11 jun · 17:00 CST</span>
            </div>

            <div style={{ padding: '1rem 1.25rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 14
              }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <motion.div whileHover={{ scale: 1.05 }} style={{
                    width: isMobile ? 56 : 72, height: isMobile ? 56 : 72,
                    borderRadius: '50%', overflow: 'hidden',
                    margin: '0 auto 8px',
                    border: '3px solid #534AB7', boxShadow: '0 0 20px #534AB760'
                  }}>
                    <img src="https://flagcdn.com/w160/mx.png" alt="México"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  </motion.div>
                  <p style={{ color: '#ffffff', fontSize: isMobile ? 14 : 17, fontWeight: 800 }}>México</p>
                  <p style={{ color: '#AFA9EC', fontSize: 11, fontWeight: 600 }}>EL TRI</p>
                </div>

                <div style={{ textAlign: 'center', padding: '0 0.5rem' }}>
                  <div style={{
                    background: '#0A0F1E', border: '2px solid #534AB7',
                    borderRadius: 10, padding: '6px 12px', marginBottom: 4
                  }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#534AB7', fontSize: 20, letterSpacing: '2px' }}>VS</span>
                  </div>
                  <p style={{ color: '#5F6E8A', fontSize: 10 }}>Ciudad de México</p>
                </div>

                <div style={{ textAlign: 'center', flex: 1 }}>
                  <motion.div whileHover={{ scale: 1.05 }} style={{
                    width: isMobile ? 56 : 72, height: isMobile ? 56 : 72,
                    borderRadius: '50%', overflow: 'hidden',
                    margin: '0 auto 8px', border: '3px solid #1E2A4A'
                  }}>
                    <img src="https://flagcdn.com/w160/za.png" alt="Sudáfrica"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  </motion.div>
                  <p style={{ color: '#ffffff', fontSize: isMobile ? 14 : 17, fontWeight: 800 }}>Sudáfrica</p>
                  <p style={{ color: '#5F6E8A', fontSize: 11, fontWeight: 600 }}>BAFANA BAFANA</p>
                </div>
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
                background: '#0A0F1E', borderRadius: 12, overflow: 'hidden'
              }}>
                {[
                  { pts: '3 PTS', label: '🎯 Exacto', color: '#EFC84A' },
                  { pts: '1 PT', label: '✓ Resultado', color: '#AFA9EC' },
                  { pts: '0 PTS', label: '✗ Fallo', color: '#3A4A6A' },
                ].map((item, i) => (
                  <div key={i} style={{
                    textAlign: 'center', padding: '0.75rem 0',
                    borderRight: i < 2 ? '1px solid #1E2A4A' : 'none'
                  }}>
                    <p style={{ fontFamily: "'Bebas Neue', sans-serif", color: item.color, fontSize: 18 }}>{item.pts}</p>
                    <p style={{ color: '#AFA9EC', fontSize: isMobile ? 11 : 13, fontWeight: 600 }}>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══ 3 PASOS ══ */}
      <section style={{
        padding: isMobile ? '3rem 5%' : '5rem 5%',
        maxWidth: 1200, margin: '0 auto',
        borderTop: '1px solid #1E2A4A'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: isMobile ? 36 : 56 }}>
          <p style={{ color: '#AFA9EC', fontSize: 12, letterSpacing: 5, marginBottom: 12, fontWeight: 700 }}>
            ⚡ ASÍ DE FÁCIL
          </p>
          <h3 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            color: '#fff', fontSize: isMobile ? 48 : 72,
            letterSpacing: '3px', lineHeight: 1, marginBottom: 16
          }}>
            3 PASOS PARA<br />
            <span style={{ color: '#EFC84A' }}>GANAR EL POZO</span>
          </h3>
          <p style={{ color: '#AFA9EC', fontSize: isMobile ? 15 : 18, fontWeight: 600 }}>
            Sin complicaciones — predice, compite y cobra
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 48px 1fr 48px 1fr',
          gap: isMobile ? 16 : 0,
          alignItems: 'center',
          marginBottom: 48
        }}>
          {[
            {
              num: '01', icon: '💳', word: 'REGÍSTRATE',
              desc: 'Crea tu cuenta, elige tu quiniela y paga $100 o $200 vía Mercado Pago.',
              color: '#534AB7'
            },
            null,
            {
              num: '02', icon: '🎯', word: 'PREDICE',
              desc: 'Escribe el marcador de cada partido antes de que empiece. Se bloquea solo al iniciar.',
              color: '#EFC84A'
            },
            null,
            {
              num: '03', icon: '🏆', word: 'GANA',
              desc: 'El que más puntos acumule se lleva el pozo. Ranking en tiempo real.',
              color: '#1D9E75'
            },
          ].map((step, i) => {
            if (step === null) {
              if (isMobile) return null
              return (
                <div key={i} style={{ textAlign: 'center' }}>
                  <motion.div
                    animate={{ x: [0, 6, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    style={{ color: '#534AB760', fontSize: 36 }}>→</motion.div>
                </div>
              )
            }
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (i / 2) * 0.2 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                style={{
                  background: '#111827',
                  border: `1px solid ${step.color}40`,
                  borderTop: `4px solid ${step.color}`,
                  borderRadius: 24,
                  padding: isMobile ? '1.5rem' : '2rem 1.75rem',
                  textAlign: 'center',
                  position: 'relative', overflow: 'hidden',
                  display: isMobile ? 'flex' : 'block',
                  alignItems: isMobile ? 'center' : 'initial',
                  gap: isMobile ? 16 : 0,
                }}>
                <div style={{
                  position: 'absolute', bottom: -20, right: 10,
                  fontFamily: "'Bebas Neue', sans-serif",
                  color: step.color, fontSize: 120,
                  opacity: 0.05, lineHeight: 1, userSelect: 'none'
                }}>{step.num}</div>
                <div style={{ fontSize: isMobile ? 48 : 80, lineHeight: 1, marginBottom: isMobile ? 0 : 16, flexShrink: 0 }}>
                  {step.icon}
                </div>
                <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
                  <div style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    color: '#ffffff', fontSize: isMobile ? 32 : 44,
                    letterSpacing: '3px', marginBottom: 8
                  }}>{step.word}</div>
                  <p style={{
                    color: '#ffffff', fontSize: isMobile ? 14 : 15,
                    fontWeight: 500, lineHeight: 1.5,
                    marginBottom: 12, opacity: 0.85
                  }}>{step.desc}</p>
                  <div style={{
                    display: 'inline-block',
                    background: `${step.color}20`,
                    border: `1px solid ${step.color}60`,
                    borderRadius: 50, padding: '4px 16px',
                  }}>
                    <span style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      color: step.color, fontSize: 14, letterSpacing: '2px'
                    }}>PASO {step.num}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div style={{ textAlign: 'center' }}>
          <motion.button
            onClick={handleLogin}
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px #EFC84A50' }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: '#EFC84A', color: '#0D0D1A',
              border: 'none', borderRadius: 50,
              padding: isMobile ? '18px 48px' : '22px 72px',
              fontSize: isMobile ? 20 : 24,
              fontWeight: 800, cursor: 'pointer',
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: '2px',
              width: isMobile ? '100%' : 'auto'
            }}>
            🏆 QUIERO GANAR EL POZO →
          </motion.button>
          <p style={{ color: '#7F8EA8', fontSize: 14, marginTop: 16 }}>
            🎁 Refiere amigos y gana puntos extra en cada quiniela
          </p>
        </div>
      </section>

    </div>
  )
}