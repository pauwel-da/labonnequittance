import type { Proprietaire, Bien, Locataire, QuittanceRecord } from './types'

export function isProfileComplete(p: Proprietaire | null) {
  if (!p) return false
  return !!(p.nom && p.prenom && p.adresse && p.codePostal && p.ville && p.signature)
}

export function isOnboardingComplete(
  proprietaire: Proprietaire | null,
  biens: Bien[],
  locataires: Locataire[],
  quittances: QuittanceRecord[],
) {
  if (!isProfileComplete(proprietaire)) return false
  if (biens.length === 0) return false
  if (locataires.length === 0) return false
  if (!quittances.some(q => q.action === 'telecharge' || q.action === 'envoye')) return false
  return true
}
