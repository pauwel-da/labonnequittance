export type BienType = 'meuble' | 'non_meuble'

export interface Bien {
  id: string
  nom: string
  adresse: string
  codePostal: string
  ville: string
  typeLocation: BienType
}

export interface Locataire {
  id: string
  nomPrenom: string
  email: string
  copieEmail: boolean
  bienId: string
  loyer: number
  charges: number
  dateDebut: string
}

export interface QuittanceRecord {
  id: string
  locataireId: string | null
  bienId: string | null
  locataireNomPrenom: string
  bienNom: string
  periode: string
  datePaiement: string
  montantLoyer: number
  montantCharges: number
  action: 'telecharge' | 'envoye' | 'visionne' | 'caf'
  createdAt: string
}

export interface Proprietaire {
  nom: string
  prenom: string
  adresse: string
  codePostal: string
  ville: string
  signature: string
}
