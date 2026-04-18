// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Loading from '@/app/loading'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const MONTOS = [50, 100, 150, 200, 300, 400, 500, 750, 1000]

function getComisionPct(personas: number) {
  if (personas < 25) return 3
  if (personas < 50) return 4
  return 5
}

function generarCodigo() {
  return 'SALA-' + Math.random().toString(36).substr(2, 4).toUpperCase()
}

export default function CrearSala() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [nombre, setNombre] = useState('')
  const [competencia, setCompetencia] = useState('LIGA_MX')
  const [montoIdx, setMontoIdx] = useState(1)
  const [personas, setPersonas] = useState(15)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [creada, setCreada] = useState(null)

  const monto = MONTOS[montoIdx]
  const comPct = getComisionPct(personas)
  const pozo = monto * personas
  const comision = Math.round(pozo * comPct / 100)
  const premio = Math.round(pozo * (100 - 10 - comPct) / 100)
  
  const fmt = (n: number) => '$' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/'); return }
      setUser(data.user)
    })
  }, [])

  async function handleCrear() {
    if (!nombre.trim()) { setError('Ponle nombre a tu sala'); return }
    setError('')
    setLoading(true)

    const codigo = generarCodigo()

    const { data, error: dbError } = await supabase
      .from('pools')
      .insert({
        name: nombre.trim(),
        type: 'private',
        competition: competencia,
        entry_fee: monto,
        max_participants: personas,
        current_participants: 0,
        total_pot: 0,
        net_prize: 0,
        platform_commission: 0,
        creator_id: user.id,
        creator_commission_pct: comPct,
        access_code: codigo,
        status: 'open',
      })
      .select()
      .single()

    setLoading(false)

    if (dbError) {
      setError('Error al crear la sala. Intenta de nuevo.')
      console.error(dbError)
      return
    }

    setCreada({ ...data, codigo })
  }

  // ── PANTALLA DE ÉXITO ──
  if (creada) {
    return (
      <div style={styles.page}>
        <div style={styles.exitoWrap}>
          <div style={styles.exitoIcon}>🎉</div>
          <div style={styles.exitoTitle}>¡Sala creada!</div>
          <div style={styles.exitoSub}>Comparte este código con tus invitados</div>

          <div style={styles.codigoBox}>
            <div style={styles.codigoLabel}>Tu código de invitación</div>
            <div style={styles.codigoVal}>{creada.access_code}</div>
            <button
              style={styles.copiarBtn}
              onClick={() => {
                navigator.clipboard.writeText(
                  `¡Únete a mi sala "${creada.name}" en Atínale! 🎯\nUsa el código: ${creada.access_code}\nEntra en: ${window.location.origin}/unirse/${creada.access_code}`
                )
                alert('¡Copiado! Pégalo en WhatsApp 📲')
              }}
            >
              📋 Copiar y compartir por WhatsApp
            </button>
          </div>

          <div style={styles.resumenExito}>
            <div style={styles.resRow}>
              <span style={styles.resKey}>Sala</span>
              <span style={styles.resVal}>{creada.name}</span>
            </div>
            <div style={styles.resRow}>
              <span style={styles.resKey}>Entrada</span>
              <span style={{ ...styles.resVal, color: '#F5B731' }}>${creada.entry_fee} MXN</span>
            </div>
            <div style={styles.resRow}>
              <span style={styles.resKey}>Máximo</span>
              <span style={styles.resVal}>{creada.max_participants} personas</span>
            </div>
            <div style={styles.resRow}>
              <span style={styles.resKey}>Tu comisión</span>
              <span style={{ ...styles.resVal, color: '#00C46A' }}>{creada.creator_commission_pct}% si se llena</span>
            </div>
          </div>

          <button style={styles.btnPrimary} onClick={() => router.push('/dashboard')}>
            Ir al Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ── FORMULARIO ──
  return (
    <div style={styles.page}>

      {/* TOPBAR */}
      <div style={styles.topbar}>
        <button style={styles.backBtn} onClick={() => router.back()}>←</button>
        <div>
          <div style={styles.topTitle}>Crear Mi Sala</div>
          <div style={styles.topSub}>Sala privada · Solo con tu código</div>
        </div>
      </div>

      {/* HERO INFO */}
      <div style={styles.heroInfo}>
        <div style={styles.heroIcon}>🔒</div>
        <div style={{ flex: 1 }}>
          <div style={styles.heroTitle}>Tú decides las reglas</div>
          <div style={styles.heroDesc}>
            Crea tu sala, elige el monto y comparte el código. Tú ganas comisión por cada persona que se una.
          </div>
          <div style={styles.comRow}>
            {[
              { pct: '3%', label: 'Menos de 25', check: personas < 25 },
              { pct: '4%', label: '25 a 49', check: personas >= 25 && personas < 50 },
              { pct: '5%', label: '50 o más', check: personas >= 50 },
            ].map((c, i) => (
              <div key={i} style={{
                ...styles.comBadge,
                ...(c.check ? styles.comBadgeActive : {})
              }}>
                <div style={{ ...styles.comPct, color: c.check ? '#00C46A' : 'rgba(255,255,255,0.3)' }}>{c.pct}</div>
                <div style={styles.comRange}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NOMBRE */}
      <div style={styles.section}>
        <div style={styles.fieldLabel}>Nombre de tu sala <span style={styles.req}>Requerido</span></div>
        <input
          style={{ ...styles.input, ...(error && !nombre.trim() ? styles.inputError : {}) }}
          placeholder="Ej: Sala Familia, Sala del Trabajo..."
          value={nombre}
          onChange={e => { setNombre(e.target.value); setError('') }}
          maxLength={40}
        />
        {error ? <div style={styles.errorText}>{error}</div> : null}
      </div>

      {/* COMPETENCIA */}
      <div style={styles.section}>
        <div style={styles.fieldLabel}>Competencia</div>
        <div style={styles.compGrid}>
          {[
            { id: 'LIGA_MX', icon: '🦅', name: 'Liga MX', sub: 'Liguilla 2026' },
            { id: 'FIFA_2026', icon: '🌍', name: 'Mundial FIFA', sub: '11 jun 2026' },
          ].map(c => (
            <div
              key={c.id}
              style={{
                ...styles.compBtn,
                ...(competencia === c.id ? styles.compBtnSelected : {})
              }}
              onClick={() => setCompetencia(c.id)}
            >
              <div style={{ fontSize: 20 }}>{c.icon}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: competencia === c.id ? '#F5B731' : '#fff' }}>{c.name}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{c.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MONTO SLIDER */}
      <div style={styles.section}>
        <div style={styles.fieldLabel}>Monto de entrada por persona <span style={styles.req}>Requerido</span></div>
        <div style={styles.montoWrap}>
          <div style={styles.montoDisplay}>
            <span style={styles.montoSigno}>$</span>
            <span style={styles.montoNum}>{monto.toLocaleString()}</span>
            <span style={styles.montoMoneda}>MXN</span>
          </div>
          <input
            type="range"
            min={0}
            max={8}
            step={1}
            value={montoIdx}
            onChange={e => setMontoIdx(Number(e.target.value))}
            style={styles.slider}
          />
          <div style={styles.montoOpciones}>
            {MONTOS.map(m => (
              <span key={m} style={{
                fontSize: 9,
                color: m === monto ? 'rgba(245,183,49,0.8)' : 'rgba(255,255,255,0.2)'
              }}>
                ${m >= 1000 ? '1k' : m.toString()}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* PERSONAS */}
      <div style={styles.section}>
        <div style={styles.fieldLabel}>Máximo de personas <span style={styles.req}>Requerido</span></div>
        <div style={styles.personasGrid}>
          {[5, 10, 15, 20, 30, 50, 100, 200].map(n => (
            <div
              key={n}
              style={{
                ...styles.perBtn,
                ...(personas === n ? styles.perBtnSelected : {})
              }}
              onClick={() => setPersonas(n)}
            >
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 20,
                lineHeight: 1,
                color: personas === n ? '#F5B731' : 'rgba(255,255,255,0.5)'
              }}>{n}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2 }}>pers</div>
            </div>
          ))}
        </div>
      </div>

      {/* RESUMEN */}
      <div style={styles.resumen}>
        <div style={styles.resumenTitle}>Resumen de tu sala</div>
        {[
          { key: 'Entrada', val: `${fmt(monto)} MXN`, color: '#F5B731' },
          { key: 'Personas máx', val: `${personas} personas`, color: '#fff' },
          { key: 'Pozo máximo', val: fmt(pozo), color: '#F5B731' },
          { key: `Tu comisión (${comPct}%)`, val: `${fmt(comision)} si se llena`, color: '#00C46A' },
          { key: 'Premio neto ganador', val: fmt(premio), color: '#4FADFF' },
        ].map((r, i) => (
          <div key={i} style={styles.resRow}>
            <span style={styles.resKey}>{r.key}</span>
            <span style={{ ...styles.resVal, color: r.color }}>{r.val}</span>
          </div>
        ))}
      </div>

      {/* CÓDIGO PREVIEW */}
      <div style={styles.codigoPreview}>
        <div style={{ fontSize: 20 }}>🔗</div>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(79,173,255,0.5)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 3 }}>Tu código de invitación</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#4FADFF', letterSpacing: 3 }}>SALA-XXXX</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>Se genera automáticamente al crear</div>
        </div>
      </div>

      {/* BOTÓN */}
      <button
        style={{ ...styles.btnPrimary, opacity: loading ? 0.7 : 1 }}
        onClick={handleCrear}
        disabled={loading}
      >
        {loading ? 'Creando sala...' : '🔒 Crear Mi Sala'}
      </button>

      <div style={styles.disclaimer}>
        Al crear la sala aceptas los términos de Atínale.<br />
        Tu comisión se paga por transferencia al terminar la quiniela.
      </div>

    </div>
  )
}

// ── ESTILOS ──
const styles: Record<string, React.CSSProperties> = {
  page: {
    background: '#080C16',
    minHeight: '100vh',
    color: '#fff',
    fontFamily: "'Outfit', sans-serif",
    maxWidth: 480,
    margin: '0 auto',
    paddingBottom: 40,
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 16px 12px',
    borderBottom: '0.5px solid rgba(255,255,255,0.06)',
  },
  backBtn: {
    width: 34, height: 34,
    background: '#111520',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 9,
    color: '#fff',
    fontSize: 16,
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  topTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 20,
    letterSpacing: 2,
    color: '#fff',
  },
  topSub: { fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: -1 },
  heroInfo: {
    margin: '14px 16px',
    background: '#111520',
    border: '0.5px solid rgba(245,183,49,0.2)',
    borderRadius: 14,
    padding: '14px 16px',
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
  },
  heroIcon: { fontSize: 28, flexShrink: 0, marginTop: 2 },
  heroTitle: { fontSize: 14, fontWeight: 600, marginBottom: 4 },
  heroDesc: { fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 },
  comRow: { display: 'flex', gap: 6, marginTop: 10 },
  comBadge: {
    flex: 1,
    background: '#0d1220',
    borderRadius: 8,
    padding: '8px 6px',
    textAlign: 'center',
    border: '0.5px solid rgba(255,255,255,0.06)',
  },
  comBadgeActive: {
    borderColor: 'rgba(0,196,106,0.4)',
    background: 'rgba(0,196,106,0.05)',
  },
  comPct: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, lineHeight: 1 },
  comRange: { fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.5px' },
  section: { padding: '0 16px', marginBottom: 6 },
  fieldLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    marginBottom: 8,
    marginTop: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  req: {
    fontSize: 9,
    color: '#E24B4A',
    background: 'rgba(226,75,74,0.1)',
    padding: '1px 6px',
    borderRadius: 4,
    textTransform: 'none',
    letterSpacing: 0,
  },
  input: {
    width: '100%',
    background: '#111520',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '13px 16px',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 15,
    color: '#fff',
    outline: 'none',
  },
  inputError: { borderColor: 'rgba(226,75,74,0.5)' },
  errorText: { fontSize: 12, color: '#E24B4A', marginTop: 6 },
  compGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  compBtn: {
    background: '#111520',
    border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: '12px 10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  compBtnSelected: {
    borderColor: 'rgba(245,183,49,0.4)',
    background: 'rgba(245,183,49,0.06)',
  },
  montoWrap: {
    background: '#111520',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
  },
  montoDisplay: { display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 14 },
  montoSigno: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: 'rgba(245,183,49,0.6)' },
  montoNum: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: '#F5B731', lineHeight: 1 },
  montoMoneda: { fontSize: 14, color: 'rgba(255,255,255,0.3)', marginLeft: 2 },
  slider: {
    width: '100%',
    height: 4,
    background: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    outline: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    accentColor: '#F5B731',
  },
  montoOpciones: { display: 'flex', justifyContent: 'space-between', marginTop: 8 },
  personasGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 },
  perBtn: {
    background: '#111520',
    border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: '10px 6px',
    textAlign: 'center',
    cursor: 'pointer',
  },
  perBtnSelected: {
    background: 'rgba(245,183,49,0.1)',
    borderColor: 'rgba(245,183,49,0.4)',
  },
  resumen: {
    margin: '16px 16px',
    background: '#111520',
    border: '0.5px solid rgba(0,196,106,0.2)',
    borderRadius: 14,
    padding: '14px 16px',
  },
  resumenTitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.25)',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: 12,
  },
  resRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: '0.5px solid rgba(255,255,255,0.04)',
    fontSize: 13,
  },
  resKey: { color: 'rgba(255,255,255,0.4)' },
  resVal: { fontWeight: 600 },
  codigoPreview: {
    margin: '0 16px 16px',
    background: 'rgba(79,173,255,0.05)',
    border: '0.5px solid rgba(79,173,255,0.2)',
    borderRadius: 12,
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  btnPrimary: {
    display: 'block',
    width: 'calc(100% - 32px)',
    margin: '0 16px',
    padding: 15,
    background: '#F5B731',
    color: '#080C16',
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 20,
    letterSpacing: 2,
    border: 'none',
    borderRadius: 14,
    cursor: 'pointer',
    textAlign: 'center',
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(255,255,255,0.2)',
    padding: '10px 16px 0',
    lineHeight: 1.6,
  },
  // ÉXITO
  exitoWrap: {
    padding: '40px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  exitoIcon: { fontSize: 56, marginBottom: 8 },
  exitoTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 2 },
  exitoSub: { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 16 },
  codigoBox: {
    background: '#111520',
    border: '0.5px solid rgba(79,173,255,0.3)',
    borderRadius: 16,
    padding: '20px 24px',
    textAlign: 'center',
    width: '100%',
    marginBottom: 8,
  },
  codigoLabel: { fontSize: 11, color: 'rgba(79,173,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 8 },
  codigoVal: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, color: '#4FADFF', letterSpacing: 6, marginBottom: 16 },
  copiarBtn: {
    width: '100%',
    padding: '12px',
    background: '#00C46A',
    color: '#080C16',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
  },
}