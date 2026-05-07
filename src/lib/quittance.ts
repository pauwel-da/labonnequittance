import type { Bien, Locataire, Proprietaire } from './types'

const API_URL = '/api/generer-quittance'

function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function firstDayOfMonth(dateStr: string): Date {
  const d = new Date(dateStr)
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function lastDayOfMonth(dateStr: string): Date {
  const d = new Date(dateStr)
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

export function buildQuittancePayload(
  locataire: Locataire,
  bien: Bien,
  proprietaire: Proprietaire,
  datePeriode: string,
  dateReglement: string,
) {
  const dateDebut = firstDayOfMonth(datePeriode)
  const dateFin = lastDayOfMonth(datePeriode)
  return {
    proprietaire_prenom_nom: `${proprietaire.prenom} ${proprietaire.nom}`.trim(),
    proprietaire_rue: proprietaire.adresse,
    proprietaire_code_postal_ville_pays: `${proprietaire.codePostal} ${proprietaire.ville} - France`,
    locataire_prenom_nom: locataire.nomPrenom,
    locataire_rue: bien.adresse,
    locataire_code_postal_ville: `${bien.codePostal} ${bien.ville}`,
    locataire_rue_code_postal_ville: `${bien.adresse}, ${bien.codePostal} ${bien.ville}`,
    montant_loyer_hors_charges_raw: locataire.loyer,
    montant_charges_raw: locataire.charges,
    date_debut_periode_paiement: formatDate(dateDebut),
    date_fin_periode_paiement: formatDate(dateFin),
    date_paiement: formatDate(new Date(dateReglement)),
    fait_a: proprietaire.ville,
    signature_image: proprietaire.signature || '',
    type_location: bien.typeLocation,
    _filename: `quittance_${locataire.nomPrenom.replace(/\s+/g, '_')}_${formatDate(dateDebut).replace(/\//g, '-')}.pdf`,
  }
}

export async function fetchQuittanceBlob(
  locataire: Locataire,
  bien: Bien,
  proprietaire: Proprietaire,
  datePeriode: string,
  dateReglement: string,
): Promise<{ blob: Blob; filename: string }> {
  const payload = buildQuittancePayload(locataire, bien, proprietaire, datePeriode, dateReglement)
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`)
  return { blob: await response.blob(), filename: payload._filename }
}

export async function genererQuittance(
  locataire: Locataire,
  bien: Bien,
  proprietaire: Proprietaire,
  datePeriode: string,
  dateReglement: string,
): Promise<void> {
  const { blob, filename } = await fetchQuittanceBlob(locataire, bien, proprietaire, datePeriode, dateReglement)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
