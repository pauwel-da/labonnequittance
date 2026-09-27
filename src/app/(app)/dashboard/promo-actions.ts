'use server'

import { createClient } from '@/lib/supabase/server'
import { PROMO_LMNP, type PromoEvent } from '@/lib/promo-config'

const EVENT_COLUMN = {
  closed: 'closed_at',
  discover: 'discover_clicked_at',
  notify: 'notify_optin_at',
} as const

/**
 * Enregistre une interaction avec la popup promo pour l'utilisateur connecté.
 * 'shown' crée la ligne (la popup ne sera plus proposée) ; les autres
 * événements horodatent leur colonne une seule fois (premier clic conservé).
 */
export async function recordPromoEvent(campaignId: string, event: PromoEvent): Promise<{ ok: boolean }> {
  if (campaignId !== PROMO_LMNP.id) return { ok: false }
  if (event !== 'shown' && !(event in EVENT_COLUMN)) return { ok: false }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false }

  const now = new Date().toISOString()

  // Crée la ligne si elle n'existe pas encore (au cas où 'shown' aurait échoué).
  const { error: insertError } = await supabase
    .from('promo_campaign_views')
    .upsert(
      { campaign_id: campaignId, user_id: user.id, shown_at: now },
      { onConflict: 'campaign_id,user_id', ignoreDuplicates: true },
    )
  if (insertError) return { ok: false }
  if (event === 'shown') return { ok: true }

  const column = EVENT_COLUMN[event]
  const { error } = await supabase
    .from('promo_campaign_views')
    .update({ [column]: now })
    .eq('campaign_id', campaignId)
    .eq('user_id', user.id)
    .is(column, null)
  return { ok: !error }
}
