'use server'

import { createClient } from '@/lib/supabase/server'
import { claimTrialDrafts } from '@/lib/supabase/claim-trial-draft'
import { redirect } from 'next/navigation'

export async function sendSignupOtp(email: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  })
  if (error) return { error: error.message }
  return { ok: true }
}

export async function verifySignupOtp(email: string, token: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
  if (error) {
    return { error: 'Code incorrect ou expiré. Vérifiez le code ou demandez-en un nouveau.' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    // Réclamer un éventuel brouillon d'essai (formulaire /quittance-en-ligne)
    const claimed = user.email ? await claimTrialDrafts(supabase, user.id, user.email) : false

    // Si aucun brouillon (signup direct), créer la ligne proprietaire avec optin
    if (!claimed) {
      await supabase
        .from('proprietaire')
        .upsert({ user_id: user.id, optin_marketing: true }, { onConflict: 'user_id' })
    }
  }

  redirect('/dashboard')
}
