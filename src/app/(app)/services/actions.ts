'use server'

import { createClient } from '@/lib/supabase/server'
import { SERVICE_CATEGORIES } from '@/lib/services-config'

const SERVICE_IDS = new Set(SERVICE_CATEGORIES.flatMap(c => c.offers.map(o => o.id)))

/**
 * Enregistre un clic vers un service (table service_clicks, supabase/services.sql)
 * pour l'utilisateur connecté. Sert à rapprocher les clics Cautioneo des contrats
 * signés. Ne bloque jamais le lien : toute erreur est simplement ignorée.
 */
export async function recordServiceClick(serviceId: string): Promise<{ ok: boolean }> {
  if (!SERVICE_IDS.has(serviceId)) return { ok: false }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false }
  const { error } = await supabase.from('service_clicks').insert({ user_id: user.id, service_id: serviceId })
  if (error) console.warn('[services] clic non enregistré :', error.message, '(supabase/services.sql exécuté ?)')
  return { ok: !error }
}
