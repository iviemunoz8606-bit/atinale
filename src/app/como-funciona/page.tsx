// @ts-nocheck
'use client'

import Link from 'next/link'

function NavDiana() {
  const size = 32, off1 = Math.round(size * 0.13), off2 = Math.round(size * 0.28)
  const s2 = size - off1 * 2, s3 = size - off2 * 2
  const r1 = size / 2 - 2, r2 = s2 / 2 - 2, r3 = s3 / 2 - 1.5
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, animation: 'navSpin 18s linear infinite' }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
          <circle cx={size/2} cy={size/2} r={r1} fill="none" stroke="rgba(245,183,49,0.10)" strokeWidth="1"/>
          <circle cx={size/2} cy={size/2} r={r1} fill="none" stroke="rgba(245,183,49,0.55)" strokeWidth="1.2" strokeDasharray={`8 ${Math.round(r1*2*Math.PI)-8}`} strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ position: 'absolute', inset: off1, animation: 'navSpinRev 11s linear infinite' }}>
        <svg viewBox={`0 0 ${s2} ${s2}`} width={s2} height={s2}>
          <circle cx={s2/2} cy={s2/2} r={r2} fill="none" stroke="rgba(245,183,49,0.08)" strokeWidth="0.8"/>
          <circle cx={s2/2} cy={s2/2} r={r2} fill="none" stroke="rgba(245,183,49,0.48)" strokeWidth="1" strokeDasharray={`5 ${Math.round(r2*2*Math.PI)-5}`} strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ position: 'absolute', inset: off2, animation: 'navSpin 5s linear infinite' }}>
        <svg viewBox={`0 0 ${s3} ${s3}`} width={s3} height={s3}>
          <circle cx={s3/2} cy={s3/2} r={r3} fill="none" stroke="rgba(245,183,49,0.45)" strokeWidth="0.9" strokeDasharray={`4 ${Math.round(r3*2*Math.PI)-4}`} strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ animation: 'navPulse 1.8s ease-in-out infinite' }}>
          <svg width="5" height="5" viewBox="0 0 24 24" fill="#F5B731"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
        </div>
      </div>
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, transform: 'translateY(-50%)', background: 'linear-gradient(90deg,transparent,rgba(245,183,49,0.28),transparent)' }}/>
      <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, transform: 'translateX(-50%)', background: 'linear-gradient(180deg,transparent,rgba(245,183,49,0.28),transparent)' }}/>
    </div>
  )
}

const pasos = [
  { n: '1', emoji: '🔑', titulo: 'Regístrate con Google', desc: 'Solo necesitas tu cuenta de Google. Sin contraseñas, sin formularios. Tardas 30 segundos y ya tienes tu perfil.' },
  { n: '2', emoji: '💳', titulo: 'Paga tu entrada', desc: 'Elige la quiniela y paga con Mercado Pago. Tu dinero va directo al pozo — visible para todos en tiempo real.' },
  { n: '3', emoji: '🎯', titulo: 'Haz tus predicciones', desc: 'Predice el marcador exacto de cada partido. Puedes editar cuantas veces quieras hasta que arranque el primer juego.' },
  { n: '4', emoji: '📊', titulo: 'Sigue tu ranking en vivo', desc: 'Cada partido que termina actualiza tu posición automáticamente. Ves tus puntos, el ranking de todos y el pozo acumulado.' },
  { n: '5', emoji: '🏆', titulo: 'El que más puntos gana', desc: 'Al terminar la última fecha, el #1 se lleva el 90% del pozo. Si hay empate exacto, el premio se divide en partes iguales.' },
]

const faqs = [
  { q: '¿Puedo cambiar mis predicciones?', a: 'Sí, cuantas veces quieras. Pero solo hasta que arranque cada partido. Una vez que inicia, se bloquea automáticamente.' },
  { q: '¿Cómo sé que mi dinero está seguro?', a: 'El pago va directo a través de Mercado Pago. El pozo total y la comisión del 10% son visibles para todos — nada oculto.' },
  { q: '¿Cuándo veo los resultados de los demás?', a: 'Desde que arranca el primer partido. El ranking se actualiza en vivo conforme terminan los juegos.' },
  { q: '¿Qué pasa si hay empate en puntos?', a: 'El pozo se divide en partes iguales entre todos los que empatan en primer lugar.' },
]

export default function ComoFunciona() {
  return (
    <div style={{ background: '#080C16', minHeight: '100vh', color: '#F0F2F8', fontFamily: "'Outfit','Helvetica Neue',sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes navSpin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes navSpinRev { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
        @keyframes navPulse   { 0%,100%{transform:scale(1);opacity:.75} 50%{transform:scale(1.35);opacity:1} }
        @keyframes pulse      { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes shimmer    { 0%{left:-100%} 100%{left:200%} }
        .step-card { transition: border-color 0.2s, transform 0.2s; }
        .step-card:hover { border-color: rgba(245,183,49,0.3) !important; transform: translateX(4px); }
        .faq-card { transition: border-color 0.2s; }
        .faq-card:hover { border-color: rgba(245,183,49,0.2) !important; }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 40px rgba(245,183,49,0.4) !important; }
        .cta-btn:active { transform: scale(0.97); }
      `}</style>

      {/* Fondo */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 40% at 10% 10%, rgba(245,183,49,0.07) 0%, transparent 60%), radial-gradient(ellipse 50% 35% at 90% 80%, rgba(232,25,44,0.06) 0%, transparent 60%)' }} />

      {/* Topbar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 60, background: 'rgba(8,12,22,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', cursor: 'pointer' }}>←</div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 4, background: 'linear-gradient(135deg,#F5B731,#E8A020)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ATÍNALE</div>
          <NavDiana />
        </div>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto', padding: '32px 20px 64px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 36, animation: 'fadeUp 0.4s ease both' }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: 'rgba(245,183,49,0.45)', textTransform: 'uppercase', marginBottom: 10 }}>Guía completa</div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 52, lineHeight: 0.95, letterSpacing: 2, color: '#fff', marginBottom: 8 }}>
            ¿CÓMO<br /><span style={{ color: '#F5B731' }}>FUNCIONA?</span>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, maxWidth: 300, margin: '0 auto' }}>
            Todo lo que necesitas saber para predecir, competir y ganar
          </div>
        </div>

        {/* Separador */}
        {(title => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.07)' }} />
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: 3, textTransform: 'uppercase' }}>{title}</div>
            <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.07)' }} />
          </div>
        ))('El flujo completo')}

        {/* Pasos */}
        <div style={{ marginBottom: 28 }}>
          {pasos.map((p, i) => (
            <div key={p.n} className="step-card" style={{ background: '#111520', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '16px 14px', marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 14, animation: `fadeUp 0.4s ease ${i * 0.07}s both` }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, color: '#F5B731', lineHeight: 1 }}>{p.n}</div>
                <div style={{ fontSize: 18 }}>{p.emoji}</div>
              </div>
              <div style={{ paddingTop: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 4 }}>{p.titulo}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Separador puntos */}
        {(title => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.07)' }} />
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: 3, textTransform: 'uppercase' }}>{title}</div>
            <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.07)' }} />
          </div>
        ))('Sistema de puntos')}

        {/* Puntos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12, animation: 'fadeUp 0.4s ease 0.35s both' }}>
          {[
            { pts: '3', color: '#F5B731', emoji: '🎯', lbl: 'Marcador exacto', sub: 'Aciertas el resultado exacto' },
            { pts: '1', color: '#00C46A', emoji: '✅', lbl: 'Resultado correcto', sub: 'Aciertas quién gana o empate' },
            { pts: '0', color: 'rgba(255,255,255,0.2)', emoji: '❌', lbl: 'Sin acierto', sub: 'Ni el resultado acertaste' },
          ].map(({ pts, color, emoji, lbl, sub }) => (
            <div key={pts} style={{ background: '#111520', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, marginBottom: 4 }}>{emoji}</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 44, color, lineHeight: 1, marginBottom: 4 }}>{pts}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, lineHeight: 1.3 }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Ejemplo */}
        <div style={{ background: 'rgba(245,183,49,0.05)', border: '1px solid rgba(245,183,49,0.15)', borderRadius: 14, padding: '14px 16px', marginBottom: 28, animation: 'fadeUp 0.4s ease 0.42s both' }}>
          <div style={{ fontSize: 10, color: '#F5B731', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Ejemplo real</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
            Predices <span style={{ color: '#fff', fontWeight: 700 }}>Pumas 2 - América 1</span>.<br />
            Resultado final: Pumas 2 - América 1 → <span style={{ color: '#F5B731', fontWeight: 700 }}>+3 puntos 🎯</span><br />
            Si predijiste Pumas ganando con otro marcador → <span style={{ color: '#00C46A', fontWeight: 700 }}>+1 punto ✅</span><br />
            Si predijiste América ganando → <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>0 puntos ❌</span>
          </div>
        </div>

        {/* Separador timeline */}
        {(title => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.07)' }} />
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: 3, textTransform: 'uppercase' }}>{title}</div>
            <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.07)' }} />
          </div>
        ))('Cuándo pasa qué')}

        {/* Timeline */}
        <div style={{ background: '#111520', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '18px 16px 18px 44px', marginBottom: 28, position: 'relative', animation: 'fadeUp 0.4s ease 0.49s both' }}>
          <div style={{ position: 'absolute', left: 28, top: 24, bottom: 24, width: '1px', background: 'rgba(255,255,255,0.08)' }} />
          {[
            { color: '#00C46A', title: 'Quiniela abierta', sub: 'Te unes, pagas y haces tus predicciones' },
            { color: '#F5B731', title: 'Arranca el primer partido', sub: 'Las predicciones se bloquean automáticamente' },
            { color: '#F5B731', title: 'Durante los partidos', sub: 'Sigues tu ranking y los puntos de todos en vivo' },
            { color: '#E8192C', title: 'Termina el último partido', sub: 'Se consolida el ranking final' },
            { color: '#F5B731', title: '¡El ganador cobra!', sub: '90% del pozo para el #1 · Split si hay empate' },
          ].map(({ color, title, sub }, i) => (
            <div key={i} style={{ position: 'relative', marginBottom: i < 4 ? 16 : 0 }}>
              <div style={{ position: 'absolute', left: -28, top: 4, width: 10, height: 10, borderRadius: '50%', background: color, border: `2px solid #080C16` }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{title}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Separador FAQ */}
        {(title => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.07)' }} />
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: 3, textTransform: 'uppercase' }}>{title}</div>
            <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.07)' }} />
          </div>
        ))('Preguntas frecuentes')}

        {/* FAQs */}
        <div style={{ marginBottom: 32 }}>
          {faqs.map((f, i) => (
            <div key={i} className="faq-card" style={{ background: '#111520', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 16px', marginBottom: 8, animation: `fadeUp 0.4s ease ${0.56 + i * 0.07}s both` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#F5B731', marginBottom: 6 }}>{f.q}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{f.a}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ animation: 'fadeUp 0.4s ease 0.84s both' }}>
          <Link href="/quinielas" style={{ textDecoration: 'none' }}>
            <div className="cta-btn" style={{ display: 'block', padding: '18px 24px', borderRadius: 16, background: 'linear-gradient(135deg,#F5B731,#C9930A)', color: '#080C16', fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 17, textAlign: 'center', cursor: 'pointer', letterSpacing: 0.5, boxShadow: '0 8px 28px rgba(245,183,49,0.3)', transition: 'all 0.2s', marginBottom: 12 }}>
              🏆 Ver quinielas disponibles →
            </div>
          </Link>
          <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
            Predice · Compite · Gana
          </div>
        </div>

      </div>
    </div>
  )
}