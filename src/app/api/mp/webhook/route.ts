// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

// Usamos service role para escribir sin restricciones de RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Mercado Pago solo nos interesa cuando el pago es aprobado
    if (body.type !== 'payment') {
      return NextResponse.json({ ok: true })
    }

    const paymentClient = new Payment(mp)
    const payment = await paymentClient.get({ id: body.data.id })

    if (payment.status !== 'approved') {
      return NextResponse.json({ ok: true })
    }

    // external_reference = "userId|poolId"
    const [userId, poolId] = (payment.external_reference || '').split('|')
    if (!userId || !poolId) {
      return NextResponse.json({ error: 'Referencia inválida' }, { status: 400 })
    }

    const amount = payment.transaction_amount || 0

    // 1. Registrar pago en tabla payments
    await supabase.from('payments').insert({
      user_id: userId,
      pool_id: poolId,
      amount,
      status: 'approved',
      receipt_url: `mp_payment_${payment.id}`,
    })

    // Verificar si algún partido del pool ya inició
    const { data: poolData } = await supabase
      .from('pools')
      .select('competition')
      .eq('id', poolId)
      .single()

    if (poolData?.competition) {
      const { data: startedMatches } = await supabase
        .from('matches')
        .select('id')
        .eq('competition', poolData.competition)
        .in('status', ['live', 'finished'])
        .limit(1)

      if (startedMatches && startedMatches.length > 0) {
        // Pool ya inició — registrar pago pero NO activar membresía
        console.log('Pago rechazado: pool ya inició', poolId)
        return NextResponse.json({ ok: true, skipped: 'pool_started' })
      }
    }

    // 2. Crear o actualizar membresía como aprobada
    await supabase.from('pool_members').upsert(
      {
        user_id: userId,
        pool_id: poolId,
        payment_status: 'approved',
        points: 0,
      },
      { onConflict: 'user_id,pool_id' }
    )

    // 3. Incrementar participantes y pozo
      await supabase.rpc('increment_participants', { p_pool_id: poolId })

      // 4. Sumar al pozo
      const { data: pool } = await supabase.from('pools').select('total_pot').eq('id', poolId).single()
      await supabase.from('pools').update({ total_pot: (pool?.total_pot || 0) + amount }).eq('id', poolId)

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}