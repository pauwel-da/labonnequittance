import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'pauwel@outlook.fr'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const [{ data: usersData, error: usersError }, { data: quittancesData, error: statsError }] = await Promise.all([
    supabase.rpc('count_users'),
    supabase.from('quittances').select('action'),
  ])

  if (usersError || statsError) {
    return NextResponse.json({ error: usersError?.message || statsError?.message }, { status: 500 })
  }

  const stats = { telecharge: 0, envoye: 0, visionne: 0, caf: 0 }
  for (const row of (quittancesData ?? [])) {
    if (row.action in stats) stats[row.action as keyof typeof stats]++
  }

  return NextResponse.json({ count: Number(usersData), ...stats })
}
