import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'pauwel@outlook.fr'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const [
    { data: usersData, error: usersError },
    { data: statsData, error: statsError },
    { data: todayData, error: todayError },
  ] = await Promise.all([
    supabase.rpc('count_users'),
    supabase.rpc('get_quittance_stats'),
    supabase.rpc('get_quittance_stats_today'),
  ])

  if (usersError || statsError || todayError) {
    return NextResponse.json({ error: usersError?.message || statsError?.message || todayError?.message }, { status: 500 })
  }

  const stats = { telecharge: 0, envoye: 0, visionne: 0, caf: 0 }
  for (const row of (statsData ?? [])) {
    const action = row.action as keyof typeof stats
    if (action in stats) stats[action] = Number(row.count)
  }

  const todayActions = { telecharge: 0, envoye: 0, visionne: 0, caf: 0 }
  for (const row of (todayData ?? [])) {
    const action = row.action as keyof typeof todayActions
    if (action in todayActions) todayActions[action] = Number(row.count)
  }

  const users = (usersData as Array<{ total: number; today: number }> | null)?.[0] ?? { total: 0, today: 0 }

  return NextResponse.json({
    count: Number(users.total),
    countToday: Number(users.today),
    ...stats,
    today: todayActions,
  })
}
