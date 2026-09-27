import { createClient } from '@/lib/supabase/server'
import { PROMO_LMNP } from './promo-config'

/**
 * Campagne à afficher sur le dashboard de l'utilisateur connecté, ou null.
 *
 * Conditions : campagne active en base et dans sa fenêtre de dates, jamais
 * affichée à cet utilisateur, au moins 1 bien meublé et au moins 1 quittance
 * téléchargée ou envoyée (compte déjà actif).
 *
 * Toute erreur (tables absentes car supabase/promo.sql pas encore exécuté,
 * réseau…) renvoie null : la popup ne doit jamais bloquer le dashboard.
 */
export async function getActivePromo(): Promise<{ id: string } | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const nowIso = new Date().toISOString()
    const [campaign, seen, meuble, quittance] = await Promise.all([
      supabase
        .from('promo_campaigns')
        .select('id')
        .eq('id', PROMO_LMNP.id)
        .eq('active', true)
        .lte('starts_at', nowIso)
        .gt('ends_at', nowIso)
        .maybeSingle(),
      supabase
        .from('promo_campaign_views')
        .select('campaign_id')
        .eq('campaign_id', PROMO_LMNP.id)
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('biens')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('type_location', 'meuble'),
      supabase
        .from('quittances')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('action', ['telecharge', 'envoye']),
    ])

    if (campaign.error || seen.error || meuble.error || quittance.error) return null
    if (!campaign.data || seen.data) return null
    if (!meuble.count || !quittance.count) return null
    return { id: PROMO_LMNP.id }
  } catch {
    return null
  }
}
