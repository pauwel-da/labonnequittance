import { createClient } from '@supabase/supabase-js'

export type AdminEventLevel = 'error' | 'warning' | 'info'

export interface AdminEventInput {
  /** Origine : 'api/envoyer-quittance', 'lambda/generate-v2', 'brevo', 'admin'… */
  source: string
  level?: AdminEventLevel
  message: string
  userId?: string | null
  meta?: Record<string, unknown>
}

/**
 * Journalise un événement dans la table admin_events (lue par /admin).
 * Ne lève JAMAIS d'exception : un échec de journalisation ne doit pas
 * impacter la requête appelante. À appeler avec `await` sur les chemins
 * d'erreur pour garantir l'écriture avant la fin de la fonction serverless.
 */
export async function logAdminEvent(event: AdminEventInput): Promise<void> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) return
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    const { error } = await client.from('admin_events').insert({
      source: event.source,
      level: event.level ?? 'error',
      message: String(event.message).slice(0, 2000),
      user_id: event.userId ?? null,
      meta: event.meta ?? null,
    })
    if (error) console.error('[admin_events]', error.message)
  } catch (e) {
    console.error('[admin_events]', e)
  }
}
