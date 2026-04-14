// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function UnirseCodigoPage() {
  const params = useParams()
  const router = useRouter()
  const codigo = params?.codigo as string

  const [pool, setPool] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [yaEsMiembro, setYaEsMiembro] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  useEffect(() => {
    if (codigo) cargarDatos()
  }, [codigo])

  async function cargarDatos() {
    setLoading(true)
    setError('')

    const { data: { user: u } } = await supabase.auth.getUser()
    setUser(u)

    const { data: poolData, error: poolError } = await supabase
      .from('pools')
      .select('*')
      .eq('access_code', codigo.toUpperCase())
      .single()

    if (poolError || !poolData) {
      setError('Código inválido. Verifica el enlace que recibiste.')
      setLoading(false)
      return
    }

    if (poolData.status === 'closed') {
      setError('Esta sala ya está cerrada. No se aceptan más participantes.')
      setLoading(false)
      return
    }

    if (poolData.current_participants >= poolData.max_participants) {
      setError('Esta sala está llena. Ya no hay lugares disponibles.')
      setLoading(false)
      return
    }

    const cierreAt = new Date(poolData.registration_closes_at)
    if (cierreAt < new Date()) {
      setError('El registro para esta sala ya cerró.')
      setLoading(false)
      return
    }

    if (u) {
      const { data: membresia } = await supabase
        .from('pool_members')
        .select('id, payment_status')
        .eq('pool_id', poolData.id)
        .eq('user_id', u.id)
        .single()

      if (membresia?.payment_status === 'approved') {
        setYaEsMiembro(true)
        setPool(poolData)
        setLoading(false)
        return
      }
    }

    setPool(poolData)
    setLoading(false)
  }

  async function handlePagar() {
    if (!user) {
      router.push(`/registro?redirect=/unirse/${codigo}`)
      return
    }

    setPaying(true)
    try {
      const res = await fetch('/api/mp/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolId: pool.id,
          userId: user.id,
          amount: pool.entry_fee,
          poolName: pool.name,
        }),
      })

      const data = await res.json()

      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        setError('No se pudo iniciar el pago. Intenta de nuevo.')
        setPaying(false)
      }
    } catch (e) {
      setError('Error al conectar con el servidor de pagos.')
      setPaying(false)
    }
  }

  const porcentajeLleno = pool
    ? Math.round((pool.current_participants / pool.max_participants) * 100)
    : 0

  const lugaresDisponibles = pool
    ? pool.max_participants - pool.current_participants
    : 0

  const pozoActual = pool
    ? pool.current_participants * pool.entry_fee
    : 0

  const premioNeto = pool
    ? Math.round(pozoActual * 0.9)
    : 0

  const comision = pozoActual - premioNeto

  function formatFecha(fechaStr) {
    if (!fechaStr) return ''
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#080C16',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid rgba(245,183,49,0.2)',
            borderTop: '3px solid #F5B731',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px',
          }} />
          <p style={{ color: '#666', fontSize: 14 }}>Buscando sala...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#080C16',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}>
        <div style={{
          background: '#111520',
          border: '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '2rem',
          maxWidth: 380,
          width: '100%',
          textAlign: 'center',
        }}>
          <div style={{
            width: 56,
            height: 56,
            background: 'rgba(226,75,74,0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 24,
          }}>✕</div>
          <p style={{ color: '#fff', fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
            No se puede unir
          </p>
          <p style={{ color: '#666', fontSize: 14, lineHeight: 1.6 }}>{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              marginTop: 24,
              background: 'transparent',
              border: '0.5px solid rgba(255,255,255,0.15)',
              color: '#aaa',
              borderRadius: 10,
              padding: '10px 24px',
              fontSize: 14,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Ir al dashboard
          </button>
        </div>
      </div>
    )
  }

  if (yaEsMiembro) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#080C16',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}>
        <div style={{
          background: '#111520',
          border: '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '2rem',
          maxWidth: 380,
          width: '100%',
          textAlign: 'center',
        }}>
          <div style={{
            width: 56,
            height: 56,
            background: 'rgba(76,175,125,0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 24,
          }}>✓</div>
          <p style={{ color: '#fff', fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
            Ya eres miembro
          </p>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>
            Ya estás registrado en <strong style={{ color: '#aaa' }}>{pool?.name}</strong>
          </p>
          <button
            onClick={() => router.push(`/quiniela/${pool.id}`)}
            style={{
              background: '#F5B731',
              color: '#080C16',
              border: 'none',
              borderRadius: 12,
              padding: '14px',
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Ver mis predicciones →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080C16',
      padding: '1.5rem 1rem',
    }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      <div style={{ maxWidth: 420, margin: '0 auto' }}>

        <button
          onClick={() => router.back()}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#666',
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 24,
            padding: 0,
          }}
        >
          ← Volver
        </button>

        <div style={{
          background: '#111520',
          border: '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            padding: '1.5rem',
            borderBottom: '0.5px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(245,183,49,0.12)',
              border: '0.5px solid rgba(245,183,49,0.3)',
              color: '#F5B731',
              fontSize: 11,
              fontWeight: 500,
              padding: '4px 10px',
              borderRadius: 20,
              marginBottom: 12,
            }}>
              <div style={{
                width: 6,
                height: 6,
                background: '#F5B731',
                borderRadius: '50%',
                animation: 'pulse 1.5s infinite',
              }} />
              Sala privada · Abierta
            </div>

            <h1 style={{
              fontSize: 20,
              fontWeight: 500,
              color: '#fff',
              marginBottom: 6,
            }}>
              {pool?.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: '#666' }}>
                {pool?.competition?.replace('_', ' ')}
              </span>
              <span style={{
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: 6,
                padding: '2px 8px',
                fontSize: 12,
                color: '#666',
                fontFamily: 'monospace',
              }}>
                {pool?.access_code}
              </span>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '1.25rem' }}>

            {/* Filas de info */}
            {[
              { label: 'Entrada', value: `$${pool?.entry_fee?.toLocaleString('es-MX')} MXN`, gold: true },
              { label: 'Cierre de registro', value: formatFecha(pool?.registration_closes_at) },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '0.5px solid rgba(255,255,255,0.04)',
              }}>
                <span style={{ fontSize: 13, color: '#666' }}>{row.label}</span>
                <span style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: row.gold ? '#F5B731' : '#ddd',
                }}>
                  {row.value}
                </span>
              </div>
            ))}

            {/* Lugares */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0 6px',
            }}>
              <span style={{ fontSize: 13, color: '#666' }}>Lugares</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#4caf7d' }}>
                {pool?.current_participants} / {pool?.max_participants}
              </span>
            </div>

            {/* Barra de progreso */}
            <div style={{ marginBottom: 16 }}>
              <div style={{
                height: 4,
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 2,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: 4,
                  background: '#4caf7d',
                  borderRadius: 2,
                  width: `${porcentajeLleno}%`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                color: '#555',
                marginTop: 5,
              }}>
                <span>{pool?.current_participants} confirmados</span>
                <span>{lugaresDisponibles} disponibles</span>
              </div>
            </div>

            {/* Pozo */}
            <div style={{
              background: 'rgba(245,183,49,0.04)',
              border: '0.5px solid rgba(245,183,49,0.15)',
              borderRadius: 12,
              padding: '1rem',
              marginBottom: 16,
            }}>
              <p style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                Pozo actual
              </p>
              <p style={{ fontSize: 28, fontWeight: 500, color: '#F5B731' }}>
                ${pozoActual.toLocaleString('es-MX')}
              </p>
              <p style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
                Premio neto: ${premioNeto.toLocaleString('es-MX')} · Comisión 10%: ${comision.toLocaleString('es-MX')}
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={handlePagar}
              disabled={paying}
              style={{
                width: '100%',
                background: paying ? 'rgba(245,183,49,0.4)' : '#F5B731',
                color: '#080C16',
                border: 'none',
                borderRadius: 12,
                padding: '15px',
                fontSize: 15,
                fontWeight: 500,
                cursor: paying ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {paying
                ? 'Redirigiendo a pago...'
                : !user
                ? 'Registrarme para unirme →'
                : `Unirme — pagar $${pool?.entry_fee?.toLocaleString('es-MX')} →`}
            </button>

            {!user && (
              <p style={{ fontSize: 12, color: '#555', textAlign: 'center', marginTop: 10 }}>
                Necesitas una cuenta para unirte. Es rápido con Google.
              </p>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}