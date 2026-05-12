// @ts-nocheck
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { memberId, poolId, userId, poolName } = await req.json()

  await supabase.from('pool_members')
    .update({ payment_status: 'approved' })
    .eq('id', memberId)

  await supabase.rpc('increment_participants', { p_pool_id: poolId })

  await supabase.from('payments')
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('pool_id', poolId)
    .eq('user_id', userId)
    .eq('status', 'pending')

  await supabase.from('users')
    .update({ notification: `Tu pago fue aprobado. Ya puedes predecir en ${poolName}` })
    .eq('id', userId)

  return NextResponse.json({ ok: true })
}