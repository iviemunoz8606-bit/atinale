// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const EMOJIS = [
  '⚽','🏆','🎯','🔥','👑','⚡','🦁','🐯','🦅','🐺',
  '🚀','💀','🌟','🏹','🦊','🐉','🎪','🎭','💎','🛡️',
  '⚔️','🌪️','🦈','🐆','🏔️','🌊','🎸','🤖','👾','🃏',
  '🧨','🎲','🦋','🌙','☄️','🎠','🦚','🐝','🌵','🎯'
]

export default function Registro() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'login' | 'perfil'>('login')
  const [alias, setAlias] = useState('')
  const [emoji, setEmoji] = useState('⚽')
  const [telefono, setTelefono] = useState('')
  const [referido, setReferido] = useState('')
  const [redirectTo, setRedirectTo] = useState('/dashboard')
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) setReferido(ref)
    const redirect = params.get('redirect')
    if (redirect) setRedirectTo(redirect)

    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        const { data: perfil } = await supabase
          .from('users')
          .select('name, phone')
          .eq('id', data.session.user.id)
          .single()
        if (!perfil || !perfil.name || !perfil.phone) {
          setStep('perfil')
        } else {
          const params2 = new URLSearchParams(window.location.search)
          const r = params2.get('redirect') || localStorage.getItem('atinale_redirect') || '/dashboard'
          localStorage.removeItem('atinale_redirect')
          window.location.href = r
        }
      }
    })
  }, [])

  const loginConGoogle = async () => {
    setLoading(true)
    setError('')
    if (typeof window !== 'undefined') {
      localStorage.setItem('atinale_redirect', redirectTo)
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}` }
    })
    if (error) {
      setError('Error al conectar con Google. Intenta de nuevo.')
      setLoading(false)
    }
  }

  const guardarPerfil = async () => {
    if (!alias.trim()) { setError('Elige un apodo para el ranking'); return }
    if (alias.trim().length > 20) { setError('El apodo no puede tener más de 20 caracteres'); return }
    if (!telefono.trim() || telefono.length < 10) { setError('Por favor escribe tu teléfono (10 dígitos)'); return }
    if (referido && referido.startsWith('SALA-')) { 
      setError('Ese es un código de sala, no de referido. Deja ese campo vacío si nadie te invitó directamente.'); 
      return 
}

    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Sesión expirada, vuelve a iniciar sesión'); setLoading(false); return }

    const { error } = await supabase.from('users').upsert({
      id: user.id,
      name: alias.trim(),
      email: user.email,
      phone: telefono.trim(),
      referred_by: referido || null,
      emoji: emoji,
    })

    if (error) { setError('Error al guardar tu perfil. Intenta de nuevo.'); setLoading(false); return }

    window.location.href = redirectTo
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        @keyframes spin-cw  { to { transform: translate(-50%,-50%) rotate(360deg)  } }
        @keyframes spin-ccw { to { transform: translate(-50%,-50%) rotate(-360deg) } }
        @keyframes fadeUp   { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:none } }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .reg-root {
          background: #080C16;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Outfit', sans-serif;
          padding: 24px 16px 48px;
        }
        .reg-card {
          background: #111520;
          border: 0.5px solid rgba(245,183,49,0.15);
          border-radius: 24px;
          width: 100%;
          max-width: 420px;
          padding: 36px 28px 32px;
          animation: fadeUp 0.4s ease both;
          position: relative;
          overflow: hidden;
        }
        .reg-card::before {
          content: '';
          position: absolute;
          top: -60px; left: 50%;
          transform: translateX(-50%);
          width: 280px; height: 160px;
          border-radius: 50%;
          background: rgba(245,183,49,0.06);
          filter: blur(40px);
          pointer-events: none;
        }

        /* DIANA */
        .diana-wrap {
          position: relative;
          width: 72px; height: 72px;
          margin: 0 auto 20px;
        }
        .diana-ring {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid;
          top: 50%; left: 50%;
        }
        .dr1 { width:72px;height:72px; border-color:rgba(245,183,49,0.12); animation: spin-cw  10s linear infinite; }
        .dr2 { width:54px;height:54px; border-color:rgba(245,183,49,0.22); animation: spin-ccw 7s  linear infinite; }
        .dr3 { width:36px;height:36px; border-color:rgba(245,183,49,0.4);  animation: spin-cw  4s  linear infinite; }
        .dr4 { width:20px;height:20px; border-color:rgba(245,183,49,0.7);  animation: spin-ccw 2.5s linear infinite; }
        .diana-dot {
          position: absolute; top:50%; left:50%;
          transform: translate(-50%,-50%);
          width:6px; height:6px;
          background:#F5B731; border-radius:50%;
        }

        /* LOGO */
        .reg-logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 38px;
          letter-spacing: 6px;
          background: linear-gradient(90deg, #C9930A, #F5B731, #fff, #F5B731, #C9930A);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-align: center;
          line-height: 1;
          margin-bottom: 4px;
        }
        .reg-tagline {
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 3px;
          text-transform: uppercase;
          text-align: center;
          margin-bottom: 28px;
        }

        /* POZO CARD */
        .pozo-card {
          background: #0d1220;
          border: 0.5px solid rgba(245,183,49,0.2);
          border-radius: 14px;
          padding: 14px 18px;
          text-align: center;
          margin-bottom: 24px;
        }
        .pozo-label { font-size:10px; color:rgba(255,255,255,0.3); letter-spacing:2px; text-transform:uppercase; margin-bottom:4px; }
        .pozo-num   { font-family:'Bebas Neue',sans-serif; font-size:44px; color:#F5B731; line-height:1; }
        .pozo-sub   { font-size:11px; color:rgba(255,255,255,0.2); margin-top:2px; }

        /* GOOGLE BTN */
        .btn-google {
          width: 100%;
          background: #fff;
          color: #111;
          border: none;
          border-radius: 50px;
          padding: 15px 24px;
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: opacity 0.2s, transform 0.1s;
          margin-bottom: 16px;
        }
        .btn-google:hover  { opacity: 0.93; }
        .btn-google:active { transform: scale(0.98); }
        .btn-google:disabled { opacity: 0.6; cursor: not-allowed; }

        /* INPUTS */
        .field-label {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 2px;
          display: block;
          margin-bottom: 8px;
        }
        .field-optional { color: rgba(255,255,255,0.2); font-size:10px; text-transform:none; letter-spacing:0; }
        .reg-input {
          width: 100%;
          background: #0d1220;
          border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 13px 16px;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          color: #fff;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
          margin-bottom: 16px;
        }
        .reg-input:focus { border-color: rgba(245,183,49,0.4); }
        .reg-input::placeholder { color: rgba(255,255,255,0.2); }
        .reg-input.referido { color:#F5B731; letter-spacing:2px; }

        /* ALIAS ROW */
        .alias-row {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 16px;
        }
        .emoji-selected {
          width: 52px; height: 52px;
          background: #0d1220;
          border: 0.5px solid rgba(245,183,49,0.3);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 26px;
          cursor: pointer;
          flex-shrink: 0;
          transition: border-color 0.2s;
        }
        .emoji-selected:hover { border-color: rgba(245,183,49,0.6); }
        .alias-row .reg-input { margin-bottom: 0; flex: 1; }

        /* EMOJI GRID */
        .emoji-grid-wrap {
          background: #0d1220;
          border: 0.5px solid rgba(245,183,49,0.15);
          border-radius: 14px;
          padding: 14px;
          margin-bottom: 16px;
        }
        .emoji-grid-label {
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .emoji-grid {
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          gap: 4px;
        }
        .emoji-btn {
          aspect-ratio: 1;
          background: transparent;
          border: 1.5px solid transparent;
          border-radius: 8px;
          font-size: 20px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, border-color 0.15s;
          padding: 0;
        }
        .emoji-btn:hover    { background: rgba(245,183,49,0.08); }
        .emoji-btn.selected { border-color: #F5B731; background: rgba(245,183,49,0.12); }

        /* PREVIEW RANKING */
        .preview-ranking {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(245,183,49,0.05);
          border: 0.5px solid rgba(245,183,49,0.15);
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 20px;
        }
        .preview-avatar {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: rgba(245,183,49,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }
        .preview-info { flex: 1; }
        .preview-name { font-size: 14px; font-weight: 600; color: #fff; }
        .preview-sub  { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 1px; }
        .preview-pts  { font-family:'Bebas Neue',sans-serif; font-size:22px; color:#F5B731; }

        /* BTN GOLD */
        .btn-gold {
          width: 100%;
          background: #F5B731;
          color: #080C16;
          border: none;
          border-radius: 50px;
          padding: 16px 24px;
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
        }
        .btn-gold:hover  { opacity: 0.92; }
        .btn-gold:active { transform: scale(0.98); }
        .btn-gold:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ERROR */
        .reg-error {
          background: rgba(226,75,74,0.1);
          border: 0.5px solid rgba(226,75,74,0.3);
          border-radius: 10px;
          padding: 11px 14px;
          color: #E24B4A;
          font-size: 13px;
          text-align: center;
          margin-bottom: 14px;
        }

        .reg-fine {
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          text-align: center;
          margin-top: 14px;
          line-height: 1.5;
        }

        @media (max-width: 420px) {
          .reg-card { padding: 28px 18px 24px; }
          .emoji-grid { grid-template-columns: repeat(8, 1fr); }
        }
      `}</style>

      <div className="reg-root">
        <div className="reg-card">

          {/* DIANA */}
          <div className="diana-wrap">
            <div className="diana-ring dr1" />
            <div className="diana-ring dr2" />
            <div className="diana-ring dr3" />
            <div className="diana-ring dr4" />
            <div className="diana-dot" />
          </div>

          {/* LOGO */}
          <div className="reg-logo">ATÍNALE</div>
          <div className="reg-tagline">Predice y Gana</div>

          {/* ── STEP LOGIN ── */}
          {step === 'login' && (
            <div>
              <div style={{ textAlign:'center', marginBottom:24 }}>
                <div style={{ fontSize:22, fontWeight:700, color:'#fff', marginBottom:6 }}>
                  Únete a la quiniela
                </div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.5 }}>
                  Entra con Google en un clic — sin contraseñas
                </div>
              </div>

              <div className="pozo-card">
                <div className="pozo-label">Pozo acumulado</div>
                <div className="pozo-num">$5,400</div>
                <div className="pozo-sub">Premio neto estimado · 30 jugadores</div>
              </div>

              {error && <div className="reg-error">{error}</div>}

              <button className="btn-google" onClick={loginConGoogle} disabled={loading}>
                {loading ? 'Conectando...' : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continuar con Google
                  </>
                )}
              </button>

              <p className="reg-fine">
                Al continuar aceptas participar bajo las reglas de Atínale
              </p>
            </div>
          )}

          {/* ── STEP PERFIL ── */}
          {step === 'perfil' && (
            <div>
              <div style={{ textAlign:'center', marginBottom:24 }}>
                <div style={{ fontSize:22, fontWeight:700, color:'#fff', marginBottom:6 }}>
                  ¡Ya casi estás!
                </div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.5 }}>
                  Elige tu apodo y emoji — así aparecerás en el ranking público
                </div>
              </div>

              {/* ALIAS + EMOJI SELECTED */}
              <label className="field-label">Tu apodo en el ranking</label>
              <div className="alias-row">
                <div
                  className="emoji-selected"
                  onClick={() => {}}
                  title="Elige tu emoji abajo"
                >
                  {emoji}
                </div>
                <input
                  className="reg-input"
                  type="text"
                  value={alias}
                  onChange={e => setAlias(e.target.value.slice(0, 20))}
                  placeholder="Ej: ElReyDelGol"
                  maxLength={20}
                />
              </div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.2)', marginTop:-10, marginBottom:14 }}>
                {alias.length}/20 caracteres · Este nombre será público
              </div>

              {/* EMOJI GRID */}
              <div className="emoji-grid-wrap">
                <div className="emoji-grid-label">Elige tu emoji</div>
                <div className="emoji-grid">
                  {EMOJIS.map((e, i) => (
                    <button
                      key={i}
                      className={`emoji-btn${emoji === e ? ' selected' : ''}`}
                      onClick={() => setEmoji(e)}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* PREVIEW */}
              <div className="preview-ranking">
                <div className="preview-avatar">{emoji}</div>
                <div className="preview-info">
                  <div className="preview-name">{alias || 'Tu apodo'}</div>
                  <div className="preview-sub">Así te verán en el ranking</div>
                </div>
                <div className="preview-pts">0</div>
              </div>

              {/* TELÉFONO */}
              <label className="field-label">Teléfono WhatsApp</label>
              <input
                className="reg-input"
                type="tel"
                value={telefono}
                onChange={e => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10 dígitos — para avisarte si ganas"
              />

              {/* REFERIDO */}
              <label className="field-label">
                Código de referido <span className="field-optional">(opcional)</span>
              </label>
              <input
                className="reg-input referido"
                type="text"
                value={referido}
                onChange={e => setReferido(e.target.value.toUpperCase())}
                placeholder="Código de un amigo (no de sala)"
              />

              {error && <div className="reg-error">{error}</div>}

              <button className="btn-gold" onClick={guardarPerfil} disabled={loading}>
                {loading ? 'Guardando...' : '🏆 Entrar a la quiniela →'}
              </button>

              <p className="reg-fine">
                Tu número solo se usa para avisarte si ganas · Sin spam
              </p>
            </div>
          )}

        </div>
      </div>
    </>
  )
}