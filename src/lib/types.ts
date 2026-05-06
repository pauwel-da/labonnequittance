export type BienType = 'studio' | 'appartement'

export interface Bien {
  id: string
  adresse: string
  codePostal: string
  ville: string
  type: BienType
}

export interface Locataire {
  id: string
  nom: string
  prenom: string
  bienId: string
  loyer: number
  charges: number
  dateDebut: string
}

export interface Proprietaire {
  nom: string
  prenom: string
  adresse: string
  codePostal: string
  ville: string
  signature: string
}
