import { createHash } from 'node:crypto'
import { after } from 'next/server'
import type { SupabaseClient, User } from '@supabase/supabase-js'

// API Conversions Meta : seule l'inscription est transmise, et seulement si l'utilisateur
// a coché la case de consentement. Envoi de serveur à serveur : ni script ni cookie Meta
// sur le site. Sans META_CAPI_TOKEN (local, preview), rien ne part.
const DATASET_ID = process.env.META_DATASET_ID || '39052109807767077'
const GRAPH_VERSION = 'v26.0'

// Les mêmes chemins servent à se reconnecter : un compte plus ancien n'est pas une
// inscription. Une heure couvre le délai de saisie du code (créé à l'envoi du code).
const INSCRIPTION_RECENTE_MS = 60 * 60 * 1000

export interface ContexteRequete {
  ip: string | null
  userAgent: string | null
  sourceUrl: string
}

export function contexteDepuisHeaders(hdrs: Headers, sourceUrl: string): ContexteRequete {
  return {
    ip: hdrs.get('x-forwarded-for')?.split(',')[0].trim() || hdrs.get('x-real-ip') || null,
    userAgent: hdrs.get('user-agent'),
    sourceUrl,
  }
}

function sha256(value: string) {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

async function envoyerInscription(user: User, ctx: ContexteRequete) {
  const token = process.env.META_CAPI_TOKEN
  if (!token) {
    console.warn('[meta-capi] META_CAPI_TOKEN absent : inscription non transmise')
    return
  }
  if (!user.email) return
  const event = {
    event_name: 'CompleteRegistration',
    event_time: Math.floor(Date.now() / 1000),
    // Identifiant fixe : Meta ne compte qu'une inscription par compte, même si l'envoi est rejoué.
    event_id: `inscription-${user.id}`,
    action_source: 'website',
    event_source_url: ctx.sourceUrl,
    user_data: {
      em: [sha256(user.email)],
      external_id: [sha256(user.id)],
      country: [sha256('fr')],
      ...(ctx.ip ? { client_ip_address: ctx.ip } : {}),
      ...(ctx.userAgent ? { client_user_agent: ctx.userAgent } : {}),
    },
  }
  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${DATASET_ID}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [event],
        access_token: token,
        // Code de l'onglet « Tester les événements » : à définir le temps d'un test, puis retirer.
        ...(process.env.META_TEST_EVENT_CODE ? { test_event_code: process.env.META_TEST_EVENT_CODE } : {}),
      }),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) console.error('[meta-capi] envoi refusé', res.status, await res.text())
    else console.info('[meta-capi] inscription transmise', await res.text())
  } catch (err) {
    console.error('[meta-capi] envoi impossible', err)
  }
}

/**
 * À appeler après une connexion réussie, quand l'utilisateur a donné son accord.
 * Ne fait rien pour un compte existant. N'échoue jamais : l'inscription passe avant Meta.
 */
export async function signalerInscriptionMeta(supabase: SupabaseClient, user: User, ctx: ContexteRequete) {
  if (Date.now() - Date.parse(user.created_at) > INSCRIPTION_RECENTE_MS) {
    console.info(`[meta-capi] compte existant (créé le ${user.created_at}) : rien à transmettre`)
    return
  }
  // Preuve du consentement (RGPD) : horodatage dans les métadonnées du compte. Sans preuve, pas d'envoi.
  const { error } = await supabase.auth.updateUser({ data: { consentement_meta_at: new Date().toISOString() } })
  if (error) {
    console.error('[meta-capi] consentement non enregistré, inscription non transmise', error.message)
    return
  }
  // Après la réponse : l'utilisateur n'attend pas Meta.
  after(() => envoyerInscription(user, ctx))
}
