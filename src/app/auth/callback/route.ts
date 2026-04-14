import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && session) {
      const { data: profile } = await supabase
        .from('users')
        .select('id, name, phone')
        .eq('id', session.user.id)
        .single()

      if (profile && profile.name && profile.phone) {
        return NextResponse.redirect(`${origin}${redirectTo}`)
      } else {
        return NextResponse.redirect(`${origin}/registro?redirect=${encodeURIComponent(redirectTo)}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/`)
}