import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

// Emails autorisés à accéder à /admin. Surchargeables via ADMIN_EMAILS
// (liste séparée par des virgules) sans toucher au code.
const DEFAULT_ADMIN_EMAILS = ['pauwel@outlook.fr']

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS
  if (!raw) return DEFAULT_ADMIN_EMAILS
  const list = raw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  return list.length > 0 ? list : DEFAULT_ADMIN_EMAILS
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return getAdminEmails().includes(email.toLowerCase())
}

/** Utilisateur courant s'il est admin, sinon null. Serveur uniquement. */
export async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user && isAdminEmail(user.email) ? user : null
}

/**
 * Client Supabase « service role » (bypass RLS).
 * À n'utiliser que côté serveur, après vérification getAdminUser().
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY manquante dans les variables d\'environnement.')
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
