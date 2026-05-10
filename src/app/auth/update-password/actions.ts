'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    const msg = error.message
    if (msg === 'New password should be different from the old password.')
      return { error: 'Le nouveau mot de passe doit être différent de l\'ancien.' }
    return { error: msg }
  }

  redirect('/dashboard')
}
