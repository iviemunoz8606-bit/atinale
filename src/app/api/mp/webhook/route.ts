// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.type !== 'payment') {
      return NextResponse.json({ ok: true })
    }

    const paymentClient = new Payment(mp)
    const payment = await paymentClient.get({ id: body.data.id })

    if (payment.status !== 'approved') {
      return NextResponse.json({ ok: true })
    }

    const [userId, poolId] = (payment.external_reference || '').split('|')
    if (!userId || !poolId) {
      return NextResponse.json({ error: 'Referencia inválida' }, { status: 400 })
    }

    const amount = payment.transaction_amount || 0

    // 1. Registrar pago — ignorar si ya existe (pago duplicado)
    const { error: paymentError } = await supabase.from('payments').insert({
      user_id: userId,
      pool_id: poolId,
      amount,
      status: 'approved',
      receipt_url: 'mp_payment_' + payment.id,
    })
    if (paymentError) {
      console.error('Error insertando payment:', paymentError)
    }

    // 2. Verificar si el pool ya inició
    const { data: poolData } = await supabase
      .from('pools')
      .select('competition, total_pot, round_filter')
      .eq('id', poolId)
      .single()

    if (poolData?.competition) {
      let matchQuery = supabase
        .from('matches')
        .select('id')
        .eq('competition', poolData.competition)
        .in('status', ['live', 'finished'])
        .limit(1)

      if (poolData.round_filter) {
        matchQuery = matchQuery.eq('round', poolData.round_filter)
      }

      const { data: startedMatches } = await matchQuery

      if (startedMatches && startedMatches.length > 0) {
        console.log('Pago rechazado: pool ya inicio', poolId)
        return NextResponse.json({ ok: true, skipped: 'pool_started' })
      }
    }

    // 3. Verificar si ya existe el member antes de insertar
    const { data: existingMember } = await supabase
      .from('pool_members')
      .select('id')
      .eq('user_id', userId)
      .eq('pool_id', poolId)
      .single()

    if (existingMember) {
      // Ya existe — solo actualizar status
      const { error: updateError } = await supabase
        .from('pool_members')
        .update({ payment_status: 'approved' })
        .eq('user_id', userId)
        .eq('pool_id', poolId)
      if (updateError) {
        console.error('Error actualizando member:', updateError)
      }
    } else {
      // No existe — insertar nuevo
      const { error: insertError } = await supabase
        .from('pool_members')
        .insert({
          user_id: userId,
          pool_id: poolId,
          payment_status: 'approved',
          points: 0,
          rank: 0,
        })
      if (insertError) {
        console.error('Error insertando member:', insertError)
      }
    }

    // 4. Actualizar participantes y pozo
    await supabase.rpc('increment_participants', { p_pool_id: poolId })

    const newPot = (poolData?.total_pot || 0) + amount
    await supabase.from('pools').update({ total_pot: newPot }).eq('id', poolId)

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}