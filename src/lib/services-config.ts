// Catalogue de la page /services : services partenaires (liens affiliés) et
// services édités par AYIVI. Ajouter un partenaire = ajouter une entrée ici
// (+ son logo dans public/partners/).

export interface ServiceOffer {
  id: string
  name: string
  kind: 'partenaire' | 'interne'
  description: string
  url: string
  logo: { src: string; width: number; height: number; className: string }
}

export interface ServiceCategory {
  id: string
  label: string
  offers: ServiceOffer[]
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'assurance',
    label: 'Assurance des loyers',
    offers: [
      {
        id: 'cautioneo',
        name: 'Cautioneo',
        kind: 'partenaire',
        description: 'Sécurisez vos loyers avec une garantie loyers impayés, à un tarif parmi les plus bas du marché.',
        // Lien d'affiliation Cautioneo (referral_id = attribution des contrats, kind=lessor = bailleur).
        // À garder tel quel : pas de paramètres UTM ajoutés, les clics sont comptés côté Simple Analytics.
        url: 'https://www.cautioneo.com/r/?referral_id=4399d743-2b59-4e20-a7a2-6043451db27e&kind=lessor&returnUrl=https%3A%2F%2Fpro.cautioneo.com%2Fpbi%2Fstart%2F',
        logo: { src: '/partners/cautioneo-logo.svg', width: 1075, height: 201, className: 'h-[22px] w-auto' },
      },
    ],
  },
  {
    id: 'fiscal',
    label: 'Déclaration fiscale',
    offers: [
      {
        id: 'lmnp-simple',
        name: 'LMNP Simple',
        kind: 'interne',
        description: 'Votre déclaration LMNP : 99 € TTC, plusieurs biens, reprise de comptabilité et télétransmission.',
        url: 'https://lmnpsimple.fr/?utm_source=labonnequittance&utm_medium=services&utm_campaign=lbq_services',
        logo: { src: '/promo/lmnp-simple-logo.png', width: 640, height: 285, className: 'h-[34px] w-auto' },
      },
    ],
  },
]
