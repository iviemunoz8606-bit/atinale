// @ts-nocheck
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { memberId, poolId, userId, poolName } = await req.json()

  // 1. Aprobar el miembro
  await supabase.from('pool_members')
    .update({ payment_status: 'approved' })
    .eq('id', memberId)

  // 2. Aprobar el pago
  await supabase.from('payments')
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('pool_id', poolId)
    .eq('user_id', userId)
    .eq('status', 'pending')

  // 3. Recalcular participantes y pozo desde cero (evita doble conteo)
  const { data: pool } = await supabase
    .from('pools').select('entry_fee').eq('id', poolId).single()

  const { count } = await supabase
    .from('pool_members')
    .select('id', { count: 'exact', head: true })
    .eq('pool_id', poolId)
    .eq('payment_status', 'approved')

  const totalPot = (count || 0) * (pool?.entry_fee || 0)

  await supabase.from('pools').update({
    current_participants: count || 0,
    total_pot: totalPot
  }).eq('id', poolId)

  // 4. Notificar al usuario
  await supabase.from('users')
    .update({ notification: `Tu pago fue aprobado. Ya puedes predecir en ${poolName}` })
    .eq('id', userId)

  return NextResponse.json({ ok: true })
}