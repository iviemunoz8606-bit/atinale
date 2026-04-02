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
        padding: '0 2rem', height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ position: 'relative', width: 48, height: 48 }}>
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '2px solid #534AB7' }}/>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2.5px solid #534AB7' }}/>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 32, height: 32, borderRadius: '50%', border: '2px solid #7F77DD'
            }}/>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 16, height: 16, borderRadius: '50%', background: '#534AB7'
            }}/>
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
                width: 7, height: 7, borderRadius: '50%',
                background: '#EFC84A', boxShadow: '0 0 8px #EFC84A'
              }}/>
            {[
              { top: 2, left: '50%', transform: 'translateX(-50%)', width: 2, height: 10 },
              { bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 2, height: 10 },
              { left: 2, top: '50%', transform: 'translateY(-50%)', width: 10, height: 2 },
              { right: 2, top: '50%', transform: 'translateY(-50%)', width: 10, height: 2 },
            ].map((s, i) => (
              <div key={i} style={{ position: 'absolute', background: '#EFC84A', borderRadius: 1, ...s as any }}/>
            ))}
          </div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, color: '#fff', letterSpacing: '3px', lineHeight: 1 }}>
              ATÍNALE
            </div>
            <div style={{ fontSize: 9, color: '#7F77DD', letterSpacing: '3px' }}>QUINIELAS DEPORTIVAS</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: '#AFA9EC', fontSize: 15, cursor: 'pointer', fontWeight: 500 }}>¿Cómo funciona?</span>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{
              background: '#534AB7', color: '#fff', border: 'none',
              borderRadius: 50, padding: '10px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer'
            }}>Entrar →</motion.button>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{
        minHeight: '100vh',
        display: 'grid', gridTemplateColumns: '1fr 1.1fr',
        alignItems: 'center', gap: 48,
        padding: '100px 5% 60px',
        maxWidth: 1200, margin: '0 auto',
      }}>

        {/* IZQUIERDA */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>

          <p style={{ color: '#AFA9EC', fontSize: 13, letterSpacing: 4, marginBottom: 20, fontWeight: 700 }}>
            🏆 FIFA WORLD CUP 2026 · QUINIELA ACTIVA
          </p>

          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            color: '#EFC84A', fontSize: 96,
            lineHeight: 0.9, letterSpacing: '2px', marginBottom: 10
          }}>CÓBRATE.</h2>

          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            color: '#ffffff', fontSize: 64,
            lineHeight: 1, letterSpacing: '2px', marginBottom: 32
          }}>
            ¿CUÁNTO SABES<br />DE FÚTBOL?
          </h1>

          {/* Beneficios — compactos, blancos */}
          <div style={{ marginBottom: 36 }}>
            {[
              { icon: '💰', text: 'Predice marcadores y acumula puntos' },
              { icon: '🎯', text: 'El que más acierta gana el pozo' },
              { icon: '👥', text: 'Refiere amigos y gana puntos extra' },
              { icon: '🔒', text: 'Comisión 10% visible para todos' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center',
                gap: 12, marginBottom: 10
              }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</span>
                <p style={{ color: '#ffffff', fontSize: 18, fontWeight: 600, lineHeight: 1.2 }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 28px #EFC84A60' }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: '#EFC84A', color: '#0D0D1A', border: 'none',
                borderRadius: 50, padding: '20px 44px',
                fontSize: 18, fontWeight: 800, cursor: 'pointer',
              }}>
              🏆 Quiero ganar el pozo
            </motion.button>
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
          </div>

          <p style={{ color: '#7F8EA8', fontSize: 14 }}>
            Entra con{' '}
            <span style={{ color: '#AFA9EC', cursor: 'pointer', fontWeight: 700 }}>Google</span>
            {' '}o{' '}
            <span style={{ color: '#AFA9EC', cursor: 'pointer', fontWeight: 700 }}>Facebook</span>
            {' '}— solo toma 15 segundos
          </p>
        </motion.div>

        {/* DERECHA — Premio + Partido juntos */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Premio centrado */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            style={{
              background: 'linear-gradient(135deg, #1A1050 0%, #0F1A3A 100%)',
              border: '1px solid #534AB7',
              borderRadius: 24, padding: '1.75rem 2rem',
              position: 'relative', overflow: 'hidden',
              textAlign: 'center'
            }}>
            <div style={{
              position: 'absolute', top: -60, left: '50%',
              transform: 'translateX(-50%)',
              width: 300, height: 200, borderRadius: '50%',
              background: '#EFC84A08', filter: 'blur(40px)'
            }}/>

            <p style={{ color: '#AFA9EC', fontSize: 12, letterSpacing: 5, marginBottom: 8, fontWeight: 700 }}>
              💵 PREMIO NETO · QUINIELA ACTIVA
            </p>

            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              color: '#EFC84A', fontSize: 96,
              lineHeight: 1, letterSpacing: '2px', marginBottom: 2,
              textShadow: '0 0 40px #EFC84A50'
            }}>
              $<CountUp target={5400} duration={2.5} />
            </div>

            <p style={{ color: '#AFA9EC', fontSize: 14, marginBottom: 16, fontWeight: 700, letterSpacing: 3 }}>
              MXN
            </p>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
              borderTop: '1px solid #2A2050', paddingTop: 14, gap: 0
            }}>
              {[
                { label: 'Pozo total', value: '$6,000', sub: '30 × $200' },
                { label: 'Jugadores', value: '30', sub: 'inscritos' },
                { label: 'Comisión', value: '$600', sub: '10% visible' },
              ].map((s, i) => (
                <div key={i} style={{
                  textAlign: 'center',
                  borderRight: i < 2 ? '1px solid #2A2050' : 'none',
                  padding: '0 8px'
                }}>
                  <p style={{ color: '#AFA9EC', fontSize: 12, marginBottom: 4, fontWeight: 600 }}>{s.label}</p>
                  <p style={{ color: '#ffffff', fontSize: 22, fontWeight: 800, marginBottom: 2 }}>{s.value}</p>
                  <p style={{ color: '#5F6E8A', fontSize: 11 }}>{s.sub}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Partido inaugural pegado abajo */}
          <div style={{
            background: '#111827', border: '1px solid #1E2A4A',
            borderRadius: 24, overflow: 'hidden'
          }}>
            <div style={{
              background: '#0A0F1E', padding: '0.75rem 1.5rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: '1px solid #1E2A4A'
            }}>
              <span style={{ color: '#AFA9EC', fontSize: 13, letterSpacing: 3, fontWeight: 700 }}>
                ⚽ PARTIDO INAUGURAL
              </span>
              <span style={{
                background: '#EFC84A15', color: '#EFC84A',
                fontSize: 13, padding: '4px 14px', borderRadius: 20,
                fontWeight: 700, border: '1px solid #EFC84A30'
              }}>11 jun · 17:00 CST</span>
            </div>

            <div style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 16
              }}>
                {/* México */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <motion.div whileHover={{ scale: 1.05 }} style={{
                    width: 72, height: 72, borderRadius: '50%',
                    overflow: 'hidden', margin: '0 auto 10px',
                    border: '3px solid #534AB7', boxShadow: '0 0 20px #534AB760'
                  }}>
                    <img src="https://flagcdn.com/w160/mx.png" alt="México"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  </motion.div>
                  <p style={{ color: '#ffffff', fontSize: 17, fontWeight: 800 }}>México</p>
                  <p style={{ color: '#AFA9EC', fontSize: 12, fontWeight: 600 }}>EL TRI</p>
                </div>

                <div style={{ textAlign: 'center', padding: '0 0.5rem' }}>
                  <div style={{
                    background: '#0A0F1E', border: '2px solid #534AB7',
                    borderRadius: 12, padding: '8px 14px', marginBottom: 4
                  }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#534AB7', fontSize: 22, letterSpacing: '2px' }}>VS</span>
                  </div>
                  <p style={{ color: '#5F6E8A', fontSize: 11 }}>Ciudad de México</p>
                </div>

                {/* Sudáfrica */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <motion.div whileHover={{ scale: 1.05 }} style={{
                    width: 72, height: 72, borderRadius: '50%',
                    overflow: 'hidden', margin: '0 auto 10px',
                    border: '3px solid #1E2A4A'
                  }}>
                    <img src="https://flagcdn.com/w160/za.png" alt="Sudáfrica"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  </motion.div>
                  <p style={{ color: '#ffffff', fontSize: 17, fontWeight: 800 }}>Sudáfrica</p>
                  <p style={{ color: '#5F6E8A', fontSize: 12, fontWeight: 600 }}>BAFANA BAFANA</p>
                </div>
              </div>

              {/* Puntos */}
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
                    textAlign: 'center', padding: '0.875rem 0',
                    borderRight: i < 2 ? '1px solid #1E2A4A' : 'none'
                  }}>
                    <p style={{ fontFamily: "'Bebas Neue', sans-serif", color: item.color, fontSize: 22 }}>{item.pts}</p>
                    <p style={{ color: '#AFA9EC', fontSize: 13, fontWeight: 600 }}>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══ 3 PASOS ══ */}
      <section style={{
        padding: '5rem 5%', maxWidth: 1200,
        margin: '0 auto', borderTop: '1px solid #1E2A4A'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ color: '#AFA9EC', fontSize: 13, letterSpacing: 5, marginBottom: 12, fontWeight: 700 }}>
            ⚡ ASÍ DE FÁCIL
          </p>
          <h3 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            color: '#fff', fontSize: 72,
            letterSpacing: '3px', lineHeight: 1, marginBottom: 16
          }}>
            3 PASOS PARA<br />
            <span style={{ color: '#EFC84A' }}>GANAR EL POZO</span>
          </h3>
          <p style={{ color: '#AFA9EC', fontSize: 18, fontWeight: 600 }}>
            Sin complicaciones — predice, compite y cobra
          </p>
        </motion.div>

        {/* Tarjetas con flechas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 48px 1fr 48px 1fr',
          alignItems: 'center', gap: 0, marginBottom: 56
        }}>
          {[
            {
              num: '01', icon: '💳', word: 'REGÍSTRATE',
              desc: 'Crea tu cuenta, elige tu quiniela y paga $100 o $200 vía Mercado Pago. Listo.',
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
              desc: 'El que más puntos acumule se lleva el pozo. El ranking se actualiza en tiempo real.',
              color: '#1D9E75'
            },
          ].map((step, i) => {
            if (step === null) return (
              <div key={i} style={{ textAlign: 'center' }}>
                <motion.div
                  animate={{ x: [0, 6, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  style={{ color: '#534AB760', fontSize: 36 }}>→</motion.div>
              </div>
            )
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
                  borderRadius: 24, padding: '2rem 1.75rem',
                  textAlign: 'center', position: 'relative', overflow: 'hidden',
                }}>
                {/* Número fondo */}
                <div style={{
                  position: 'absolute', bottom: -20, right: 10,
                  fontFamily: "'Bebas Neue', sans-serif",
                  color: step.color, fontSize: 120,
                  opacity: 0.05, lineHeight: 1, userSelect: 'none'
                }}>{step.num}</div>

                {/* Emoji grande */}
                <div style={{ fontSize: 80, lineHeight: 1, marginBottom: 16 }}>
                  {step.icon}
                </div>

                {/* Palabra clave */}
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  color: '#ffffff', fontSize: 44,
                  letterSpacing: '3px', marginBottom: 12
                }}>{step.word}</div>

                {/* Descripción corta — blanca y legible */}
                <p style={{
                  color: '#ffffff', fontSize: 15,
                  fontWeight: 500, lineHeight: 1.5,
                  marginBottom: 16, opacity: 0.85
                }}>{step.desc}</p>

                {/* Badge */}
                <div style={{
                  display: 'inline-block',
                  background: `${step.color}20`,
                  border: `1px solid ${step.color}60`,
                  borderRadius: 50, padding: '5px 18px',
                }}>
                  <span style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    color: step.color, fontSize: 16, letterSpacing: '2px'
                  }}>PASO {step.num}</span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* CTA final */}
        <div style={{ textAlign: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px #EFC84A50' }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: '#EFC84A', color: '#0D0D1A',
              border: 'none', borderRadius: 50,
              padding: '22px 72px', fontSize: 24,
              fontWeight: 800, cursor: 'pointer',
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: '2px'
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