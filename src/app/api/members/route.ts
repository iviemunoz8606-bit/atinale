// @ts-nocheck
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: membersRaw } = await supabase
    .from('pool_members')
    .select('id, pool_id, user_id, payment_status, points, rank')

  const userIds = [...new Set((membersRaw || []).map(m => m.user_id))]
  const poolIds = [...new Set((membersRaw || []).map(m => m.pool_id))]

  const { data: usersData } = await supabase
    .from('users').select('id, name, email, phone').in('id', userIds)

  const { data: poolsData } = await supabase
    .from('pools').select('id, name, competition, entry_fee').in('id', poolIds)

  const usersMap = Object.fromEntries((usersData || []).map(u => [u.id, u]))
  const poolsMap = Object.fromEntries((poolsData || []).map(p => [p.id, p]))

  const combined = (membersRaw || []).map(m => ({
    ...m,
    userData: usersMap[m.user_id] || null,
    poolData: poolsMap[m.pool_id] || null,
  }))

  return NextResponse.json(combined)
}