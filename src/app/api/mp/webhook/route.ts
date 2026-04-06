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

    // 3. Incrementar participantes en el pool
    await supabase.rpc('increment_participants', { p_pool_id: poolId })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}