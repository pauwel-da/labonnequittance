import { createHmac, timingSafeEqual } from 'node:crypto'
import { SITE_URL } from './admin-email'

// Liens « Se désinscrire » des emails admin : l'adresse est signée (HMAC) pour
// que personne ne puisse désinscrire une autre adresse en modifiant le lien.
// Serveur uniquement.

/** Clé dérivée de la clé service Supabase : pas de secret de plus à gérer, et la clé service ne sort jamais. */
function cle(): Buffer | null {
  const base = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!base) return null
  return createHmac('sha256', base).update('lbq:email-desinscription:v1').digest()
}

function signer(email: string): string | null {
  const k = cle()
  return k ? createHmac('sha256', k).update(email.trim().toLowerCase()).digest('base64url') : null
}

export function signatureValide(email: string, signature: string): boolean {
  const attendue = signer(email)
  if (!attendue || !signature) return false
  const a = Buffer.from(attendue)
  const b = Buffer.from(signature)
  return a.length === b.length && timingSafeEqual(a, b)
}

/** Adresse lue dans le paramètre `e` du lien (base64url), ou null. */
export function lireAdresse(e: string | undefined): string | null {
  if (!e) return null
  const email = Buffer.from(e, 'base64url').toString('utf8').trim().toLowerCase()
  return email.includes('@') ? email : null
}

/**
 * Lien de désinscription propre à une adresse. `test` : lien des emails de test,
 * qui affiche la page sans rien désinscrire. Null si la clé service manque.
 */
export function lienDesinscription(email: string, options: { test?: boolean } = {}): string | null {
  const adresse = email.trim().toLowerCase()
  const signature = signer(adresse)
  if (!signature) return null
  const e = Buffer.from(adresse).toString('base64url')
  return `${SITE_URL}/desinscription?e=${e}&s=${signature}${options.test ? '&test=1' : ''}`
}
