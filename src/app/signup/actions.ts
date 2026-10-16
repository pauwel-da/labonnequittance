'use server'

import { createClient } from '@/lib/supabase/server'
import { claimTrialDrafts } from '@/lib/supabase/claim-trial-draft'
import { contexteDepuisHeaders, donneesConsentementMeta, signalerInscriptionMeta } from '@/lib/meta-capi'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function sendSignupOtp(email: string, metaConsent = false) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, data: donneesConsentementMeta(metaConsent) },
  })
  if (error) return { error: error.message }
  return { ok: true }
}

/** metaConsent : case « informer Meta de mon inscription » cochée (/signup ou /quittance-en-ligne). */
export async function verifySignupOtp(email: string, token: string, metaConsent = false) {
  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
  if (error) {
    // Code déjà utilisé par le bouton de l'email, ouvert dans ce navigateur : la session existe
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email?.toLowerCase() === email.trim().toLowerCase()) redirect('/dashboard')
    return { error: 'Code incorrect, expiré ou déjà utilisé. Vérifiez le code ou demandez-en un nouveau.' }
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

    if (metaConsent === true) {
      const hdrs = await headers()
      const sourceUrl = hdrs.get('referer') || `https://${hdrs.get('host')}/signup`
      await signalerInscriptionMeta(supabase, user, contexteDepuisHeaders(hdrs, sourceUrl))
    }
  }

  redirect('/dashboard')
}
