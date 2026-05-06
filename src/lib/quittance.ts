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

export async function genererQuittance(
  locataire: Locataire,
  bien: Bien,
  proprietaire: Proprietaire,
  datePaiement: string
): Promise<void> {
  const dateDebut = firstDayOfMonth(datePaiement)
  const dateFin = lastDayOfMonth(datePaiement)

  const payload = {
    // Identité
    proprietaire_prenom_nom: `${proprietaire.prenom} ${proprietaire.nom}`.trim(),
    proprietaire_rue: proprietaire.adresse,
    proprietaire_code_postal_ville_pays: `${proprietaire.codePostal} ${proprietaire.ville} - France`,
    locataire_prenom_nom: `${locataire.prenom} ${locataire.nom}`.trim(),
    locataire_rue: bien.adresse,
    locataire_code_postal_ville: `${bien.codePostal} ${bien.ville}`,
    locataire_rue_code_postal_ville: `${bien.adresse}, ${bien.codePostal} ${bien.ville}`,
    // Montants bruts — le serveur calcule le total et formate
    montant_loyer_hors_charges_raw: locataire.loyer,
    montant_charges_raw: locataire.charges,
    // Dates
    date_debut_periode_paiement: formatDate(dateDebut),
    date_fin_periode_paiement: formatDate(dateFin),
    date_paiement: formatDate(new Date(datePaiement)),
    fait_a: proprietaire.ville,
    // fait_le est généré côté serveur au moment de la création du PDF
    // signature est une image PNG base64 dessinée par l'utilisateur
    signature_image: proprietaire.signature || '',
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Erreur serveur: ${response.status}`)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `quittance_${locataire.nom}_${formatDate(dateDebut).replace(/\//g, '-')}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
