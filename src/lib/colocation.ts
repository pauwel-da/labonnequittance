// Colocation : plusieurs personnes sur un même bail. La quittance est unique
// (tous les noms, loyer entier) ; l'attestation CAF dépend du foyer :
// couple = une attestation aux deux noms, colocation = une par personne.
import type { Colocataire, Foyer, Locataire } from './types'

/** Personnes par bail, locataire principal compris. */
export const MAX_PERSONNES = 6

export function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

/** Toutes les personnes du bail, locataire principal en premier. */
export function personnes(l: Pick<Locataire, 'nomPrenom' | 'email' | 'colocataires'>): Colocataire[] {
  return [{ nomPrenom: l.nomPrenom, email: l.email }, ...(l.colocataires ?? [])]
}

/** « Marie Dupont », « Marie Dupont et Luc Bernard », « Marie Dupont, Luc Bernard et Ana Silva ». */
export function joinNoms(noms: string[]): string {
  const n = noms.map(s => s.trim()).filter(Boolean)
  if (n.length <= 1) return n[0] ?? ''
  return `${n.slice(0, -1).join(', ')} et ${n[n.length - 1]}`
}

export function nomsLocataires(l: Pick<Locataire, 'nomPrenom' | 'email' | 'colocataires'>): string {
  return joinNoms(personnes(l).map(p => p.nomPrenom))
}

/** Emails valides du bail, sans doublon (destinataires de la quittance). */
export function emailsLocataires(l: Pick<Locataire, 'nomPrenom' | 'email' | 'colocataires'>): string[] {
  const vus = new Set<string>()
  const emails: string[] = []
  for (const p of personnes(l)) {
    const e = p.email.trim()
    if (e && isValidEmail(e) && !vus.has(e.toLowerCase())) {
      vus.add(e.toLowerCase())
      emails.push(e)
    }
  }
  return emails
}

/**
 * Foyer pour la CAF : null pour une personne seule (ou deux personnes sans réponse
 * encore), « colocation » d'office à partir de trois personnes.
 */
export function foyerEffectif(l: Pick<Locataire, 'colocataires' | 'foyer'>): Foyer | null {
  const n = 1 + (l.colocataires?.length ?? 0)
  if (n === 1) return null
  if (n >= 3) return 'colocation'
  return l.foyer
}

/** Libellé court pour les cartes : « Couple », « Colocation · 3 », ou null. */
export function badgeFoyer(l: Pick<Locataire, 'colocataires' | 'foyer'>): string | null {
  const foyer = foyerEffectif(l)
  if (foyer === 'couple') return 'Couple'
  if (foyer === 'colocation') return `Colocation · ${1 + l.colocataires.length}`
  return null
}

/** Lecture tolérante de la colonne jsonb `colocataires` (absente avant supabase/colocation.sql). */
export function parseColocataires(value: unknown): Colocataire[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((c): c is Record<string, unknown> => !!c && typeof c === 'object')
    .map(c => ({ nomPrenom: String(c.nom_prenom ?? '').trim(), email: String(c.email ?? '').trim() }))
    .filter(c => c.nomPrenom)
    .slice(0, MAX_PERSONNES - 1)
}

export function parseFoyer(value: unknown): Foyer | null {
  return value === 'couple' || value === 'colocation' ? value : null
}
