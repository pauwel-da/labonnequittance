'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    const msg = error.message
    if (msg === 'Invalid login credentials') return { error: 'Email ou mot de passe incorrect.' }
    if (msg === 'Email not confirmed') return {
      error: 'Cet email n\'est pas encore confirmé.',
      kind: 'unconfirmed' as const,
    }
    return { error: msg }
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
