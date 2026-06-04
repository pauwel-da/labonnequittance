'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password: formData.get('password') as string,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) return { error: error.message }

  if (data.user?.identities?.length === 0) {
    return { kind: 'existing' as const, email }
  }

  redirect('/login?message=Vérifiez votre email pour confirmer votre compte.')
}

export async function resendConfirmation(email: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
    },
  })
  if (error) {
    if (error.message.toLowerCase().includes('already') && error.message.toLowerCase().includes('confirmed')) {
      return { error: 'Ce compte est déjà confirmé. Vous pouvez vous connecter directement.' }
    }
    return { error: error.message }
  }
  return { success: true }
}
