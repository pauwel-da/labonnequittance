'use server'

import { headers } from 'next/headers'
import { redirect, RedirectType } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { claimTrialDrafts } from '@/lib/supabase/claim-trial-draft'
import { contexteDepuisHeaders, signalerInscriptionMeta } from '@/lib/meta-capi'
import { jetonLien } from './jeton'

/** Bouton « Me connecter » de /auth/confirm : mêmes étapes que la saisie du code (verifySignupOtp). */
export async function confirmerLien(formData: FormData) {
  const jeton = jetonLien(formData.get('token_hash'), formData.get('type'))
  const supabase = await createClient()

  let user: User | null = null
  if (jeton) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: jeton, type: 'email' })
    if (error) console.info('[auth/confirm] lien refusé :', error.message)
    user = data.user
  }

  if (!user) {
    // Lien déjà utilisé par ce navigateur (bouton recliqué, retour arrière) : la session est là
    const { data: { user: connecte } } = await supabase.auth.getUser()
    redirect(connecte ? '/dashboard' : '/auth/confirm?erreur=1', RedirectType.replace)
  }

  // Brouillon d'essai (/quittance-en-ligne) : rattaché au compte, inscription comme connexion
  const claimed = user.email ? await claimTrialDrafts(supabase, user.id, user.email) : false

  // Inscription directe : ligne proprietaire avec optin, comme verifySignupOtp. Compte existant : inchangé.
  if (!claimed) {
    await supabase
      .from('proprietaire')
      .upsert({ user_id: user.id, optin_marketing: true }, { onConflict: 'user_id', ignoreDuplicates: true })
  }

  // Case Meta cochée à la demande du code, retenue dans le compte (sendSignupOtp, sendTrialOtp)
  if (user.user_metadata?.consentement_meta_at) {
    const hdrs = await headers()
    await signalerInscriptionMeta(supabase, user, contexteDepuisHeaders(hdrs, `https://${hdrs.get('host')}/auth/confirm`))
  }

  redirect('/dashboard', RedirectType.replace)
}
