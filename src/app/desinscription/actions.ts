'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/admin'
import { logAdminEvent } from '@/lib/admin-events'
import { lireAdresse, signatureValide } from '@/lib/email-desinscription'

/** Bouton « Me désinscrire » de /desinscription (lien signé reçu par email). */
export async function confirmerDesinscription(formData: FormData) {
  const e = String(formData.get('e') ?? '')
  const s = String(formData.get('s') ?? '')
  const email = lireAdresse(e)
  if (!email || !signatureValide(email, s)) redirect('/desinscription')

  let ok = true
  try {
    const { error } = await createAdminClient().rpc('desinscrire_email', { p_email: email })
    if (error) throw new Error(error.message)
    await logAdminEvent({ source: 'desinscription', level: 'info', message: `Désinscription des emails : ${email}` })
  } catch (err) {
    ok = false
    await logAdminEvent({
      source: 'desinscription',
      message: `Désinscription impossible (${email}) : ${err instanceof Error ? err.message : String(err)}`,
    })
  }

  const params = new URLSearchParams({ e, s, [ok ? 'ok' : 'erreur']: '1' })
  redirect(`/desinscription?${params}`)
}
