// Constantes des campagnes promo du dashboard, partagées client / serveur.
// (La logique d'éligibilité, qui dépend du client Supabase serveur, est dans promo.ts.)

export const PROMO_LMNP = {
  id: 'lmnp_simple_2026',
  url: 'https://lmnpsimple.fr/?utm_source=labonnequittance&utm_medium=popup&utm_campaign=lbq_dashboard_2026',
} as const

export type PromoEvent = 'shown' | 'closed' | 'discover' | 'notify'
