// @ts-nocheck
'use client'

import Link from 'next/link'

export default function LiguillaCuartos() {
  const escudo = (team: string) =>
    `https://pqrcwbevquhpsymmpryi.supabase.co/storage/v1/object/public/escudos/${team}.png`

  const cruces = [
    { local: 'Pumas', visita: 'América', localSlug: 'pumas', visitaSlug: 'america', tag: 'Clásico Capitalino 🔥' },
    { local: 'Chivas', visita: 'Tigres', localSlug: 'chivas', visitaSlug: 'tigres', tag: 'Clásico Regio 🔥' },
    { local: 'Atlas', visita: 'Cruz Azul', localSlug: 'atlas', visitaSlug: 'cruz-azul', tag: 'Sáb 2 mayo' },
    { local: 'Pachuca', visita: 'Toluca', localSlug: 'pachuca', visitaSlug: 'toluca', tag: 'Dom 3 mayo' },
  ]

  return (
    <div style={{ background: '#080C16', minHeight: '100vh', color: '#F0F2F8', fontFamily: "'Outfit','Helvetica Neue',sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(232,25,44,0.2)} 50%{box-shadow:0 0 40px rgba(232,25,44,0.4)} }
        .cta-btn:hover { transform: translateY(-3px); box-shadow: 0 14px 40px rgba(232,25,44,0.5) !important; }
        .cta-btn:active { transform: scale(0.97); }
        .match-card:hover { border-color: rgba(232,25,44,0.35) !important; transform: translateY(-2px); }
        .match-card { transition: all 0.2s; }
      `}</style>

      {/* Fondo */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse 70% 40% at 15% 15%, rgba(232,25,44,0.10) 0%, transparent 60%), radial-gradient(ellipse 50% 35% at 85% 85%, rgba(245,183,49,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28, animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ fontSize: 11, letterSpacing: 5, color: 'rgba(245,183,49,0.5)', marginBottom: 10, textTransform: 'uppercase' }}>⚽ Atínale · Quinielas Deportivas</div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, lineHeight: 1, letterSpacing: 2, background: 'linear-gradient(135deg,#E8192C 0%,#F5B731 60%,#fff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6 }}>
            LIGUILLA<br />CUARTOS 2026
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 3, textTransform: 'uppercase' }}>Liga MX · Clausura 2026</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, background: 'rgba(255,77,109,0.12)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: '#FF4D6D', animation: 'pulse 2s ease-in-out infinite' }}>
            🔥 Cierra el sabado 2 de mayo
          </div>
        </div>

        {/* Pozo */}
        <div style={{ background: 'linear-gradient(135deg,rgba(232,25,44,0.08),rgba(245,183,49,0.04))', border: '1px solid rgba(232,25,44,0.2)', borderRadius: 20, padding: 24, textAlign: 'center', marginBottom: 20, animation: 'fadeUp 0.5s ease 0.1s both' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 4 }}>💰 Pozo acumulado</div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 72, color: '#F5B731', lineHeight: 1, letterSpacing: 2 }}>$0</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>Premio neto · 90% del pozo total</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[['0/50','Participantes'],['$100','Entrada'],['8','Partidos']].map(([val,lbl]) => (
              <div key={lbl} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: '#fff' }}>{val}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cruces */}
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 12, textAlign: 'center' }}>Los 4 cruces · Ida y vuelta</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24, animation: 'fadeUp 0.5s ease 0.2s both' }}>
          {cruces.map(({ local, visita, localSlug, visitaSlug, tag }) => (
            <div key={local} className="match-card" style={{ background: '#111520', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 10px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                <img src={escudo(localSlug)} style={{ width: 30, height: 30, objectFit: 'contain' }} />
                <span style={{ fontSize: 11, fontWeight: 700 }}>{local}</span>
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: 2, textTransform: 'uppercase', margin: '4px 0' }}>vs</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
                <img src={escudo(visitaSlug)} style={{ width: 30, height: 30, objectFit: 'contain' }} />
                <span style={{ fontSize: 11, fontWeight: 700 }}>{visita}</span>
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: 1 }}>{tag}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ animation: 'fadeUp 0.5s ease 0.3s both' }}>
          <Link href="/quiniela/64206e4c-46a7-416c-b0d3-6ef5bbf8b5ee" style={{ textDecoration: 'none' }}>
            <div className="cta-btn" style={{ display: 'block', width: '100%', padding: '18px 24px', borderRadius: 16, background: 'linear-gradient(135deg,#E8192C,#F5B731)', color: '#fff', fontWeight: 800, fontSize: 18, textAlign: 'center', cursor: 'pointer', letterSpacing: 1, boxShadow: '0 8px 32px rgba(232,25,44,0.35)', transition: 'all 0.2s', marginBottom: 12, animation: 'glow 2s ease-in-out infinite' }}>
              🏆 Unirme a la quiniela →
            </div>
          </Link>
          <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', lineHeight: 1.7 }}>
            Pago seguro con Mercado Pago · Solo $100 MXN<br />
            Máximo 50 participantes · ¡Lugares limitados!
          </div>
        </div>

        {/* Cómo funciona */}
        <div style={{ marginTop: 28, animation: 'fadeUp 0.5s ease 0.4s both' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 12, textAlign: 'center' }}>¿Cómo funciona?</div>
          {[
            ['1','Regístrate','con tu cuenta de Google — tarda 30 segundos'],
            ['2','Paga $100','con Mercado Pago de forma segura'],
            ['3','Predice','el marcador de los 8 partidos de ida y vuelta'],
            ['4','Gana','el 90% del pozo si acumulas más puntos que todos'],
          ].map(([num, bold, rest]) => (
            <div key={num} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#111520', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: '#E8192C', width: 28, flexShrink: 0, lineHeight: 1 }}>{num}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}><strong style={{ color: '#fff' }}>{bold}</strong> {rest}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 32, textAlign: 'center', animation: 'fadeUp 0.5s ease 0.5s both' }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 4, color: 'rgba(245,183,49,0.4)' }}>ATÍNALE</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', marginTop: 4 }}>Predice · Compite · Gana</div>
        </div>

      </div>
    </div>
  )
}