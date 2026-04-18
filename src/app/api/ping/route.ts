// @ts-nocheck
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (error) throw error

    return NextResponse.json({ 
      ok: true, 
      timestamp: new Date().toISOString(),
      message: 'Atinale alive 🎯'
    })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}