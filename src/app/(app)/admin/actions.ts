'use server'

import { revalidatePath } from 'next/cache'
import { getAdminUser, createAdminClient } from '@/lib/admin'
import { logAdminEvent } from '@/lib/admin-events'

// Codes PostgREST/Postgres « table inexistante » : on les ignore pour que la
// suppression fonctionne même si une table optionnelle (ex. rappels) n'existe pas.
const MISSING_TABLE_CODES = new Set(['42P01', 'PGRST205'])

/**
 * Supprime un compte et toutes ses données (droit à l'effacement RGPD).
 * Ordre : quittances → locataires → biens → rappels → proprietaire → auth.users.
 */
export async function deleteUserAccount(userId: string): Promise<{ ok: true } | { error: string }> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Non autorisé.' }
  if (!userId) return { error: 'Identifiant manquant.' }
  if (userId === admin.id) return { error: 'Impossible de supprimer votre propre compte depuis cette page.' }

  let client
  try {
    client = createAdminClient()
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Configuration manquante.' }
  }

  const { data: target, error: lookupError } = await client.auth.admin.getUserById(userId)
  if (lookupError || !target?.user) return { error: 'Utilisateur introuvable.' }
  const email = target.user.email ?? ''

  for (const table of ['quittances', 'locataires', 'biens', 'rappels', 'proprietaire']) {
    const { error } = await client.from(table).delete().eq('user_id', userId)
    if (error && !MISSING_TABLE_CODES.has(error.code)) {
      return { error: `Suppression ${table} : ${error.message}` }
    }
  }
  if (email) {
    await client.from('trial_drafts').delete().eq('email', email.toLowerCase())
  }

  const { error: deleteError } = await client.auth.admin.deleteUser(userId)
  if (deleteError) return { error: `Suppression du compte : ${deleteError.message}` }

  await logAdminEvent({
    source: 'admin',
    level: 'info',
    message: `Compte supprimé : ${email || userId}`,
    userId: admin.id,
    meta: { deletedUserId: userId, deletedEmail: email },
  })

  revalidatePath('/admin')
  return { ok: true }
}
