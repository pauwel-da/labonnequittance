import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const email = body.email as string | undefined
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Trouve l'utilisateur par email dans auth.users
  const { data: users } = await admin.auth.admin.listUsers()
  const user = users?.users.find(u => u.email === email)
  if (!user) return NextResponse.json({ ok: true }) // Silently ignore unknown emails

  await admin.from('proprietaire').update({ optin_marketing: false }).eq('user_id', user.id)

  return NextResponse.json({ ok: true })
}
