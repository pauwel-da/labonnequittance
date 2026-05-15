'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function saveOptin(optin: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('proprietaire').update({
    optin_marketing: optin,
  }).eq('user_id', user.id)

  redirect('/dashboard')
}
