import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'pauwel@outlook.fr'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { data, error } = await supabase.rpc('count_users')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ count: Number(data) })
}
