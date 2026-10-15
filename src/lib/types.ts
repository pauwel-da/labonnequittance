export type BienType = 'meuble' | 'non_meuble'

export interface Bien {
  id: string
  nom: string
  adresse: string
  codePostal: string
  ville: string
  typeLocation: BienType
}

/** Autre personne du même bail (colocation, couple). */
export interface Colocataire {
  nomPrenom: string
  email: string
}

/** Bail à deux : un seul foyer (couple) ou foyers séparés (colocation). Voir src/lib/colocation.ts. */
export type Foyer = 'couple' | 'colocation'

export interface Locataire {
  id: string
  /** Locataire principal */
  nomPrenom: string
  email: string
  copieEmail: boolean
  bienId: string
  /** Loyer et charges du bail entier */
  loyer: number
  charges: number
  dateDebut: string
  /** Autres personnes du bail (5 au plus) ; vide pour un locataire seul */
  colocataires: Colocataire[]
  foyer: Foyer | null
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
  optinRappelMensuel?: boolean | null
}
