'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function reinscrireRappel() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from('proprietaire')
    .update({ optin_rappel_mensuel: true })
    .eq('user_id', user.id)
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { error: 'Non authentifié.' }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (signInError) return { error: 'Mot de passe actuel incorrect.' }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
  if (updateError) {
    if (updateError.message === 'New password should be different from the old password.') {
      return { error: 'Le nouveau mot de passe doit être différent de l\'ancien.' }
    }
    return { error: updateError.message }
  }

  return { success: true }
}
