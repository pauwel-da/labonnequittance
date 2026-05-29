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
  proRata?: { jourDebut: number; jourFin: number },
) {
  let dateDebut: Date
  let dateFin: Date
  let loyer = locataire.loyer
  let charges = locataire.charges

  if (proRata) {
    const d = new Date(datePeriode)
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
    const ratio = (proRata.jourFin - proRata.jourDebut + 1) / daysInMonth
    loyer = Math.round(locataire.loyer * ratio * 100) / 100
    charges = Math.round(locataire.charges * ratio * 100) / 100
    dateDebut = new Date(d.getFullYear(), d.getMonth(), proRata.jourDebut)
    dateFin = new Date(d.getFullYear(), d.getMonth(), proRata.jourFin)
  } else {
    dateDebut = firstDayOfMonth(datePeriode)
    dateFin = lastDayOfMonth(datePeriode)
  }

  return {
    proprietaire_prenom_nom: `${proprietaire.prenom} ${proprietaire.nom}`.trim(),
    proprietaire_rue: proprietaire.adresse,
    proprietaire_code_postal_ville_pays: `${proprietaire.codePostal} ${proprietaire.ville} - France`,
    locataire_prenom_nom: locataire.nomPrenom,
    locataire_rue: bien.adresse,
    locataire_code_postal_ville: `${bien.codePostal} ${bien.ville}`,
    locataire_rue_code_postal_ville: `${bien.adresse}, ${bien.codePostal} ${bien.ville}`,
    montant_loyer_hors_charges_raw: loyer,
    montant_charges_raw: charges,
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
  proRata?: { jourDebut: number; jourFin: number },
): Promise<{ blob: Blob; filename: string }> {
  const payload = buildQuittancePayload(locataire, bien, proprietaire, datePeriode, dateReglement, proRata)
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`)
  return { blob: await response.blob(), filename: payload._filename }
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export async function genererQuittance(
  locataire: Locataire,
  bien: Bien,
  proprietaire: Proprietaire,
  datePeriode: string,
  dateReglement: string,
  proRata?: { jourDebut: number; jourFin: number },
): Promise<void> {
  const { blob, filename } = await fetchQuittanceBlob(locataire, bien, proprietaire, datePeriode, dateReglement, proRata)

  // Sur iOS, utiliser le Web Share API pour déclencher "Enregistrer dans Fichiers"
  if (isIOS() && navigator.share) {
    const file = new File([blob], filename, { type: 'application/pdf' })
    if (navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Quittance de loyer' })
      return
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
