/**
 * Jeton du bouton des emails de code (modèles Supabase « Confirm signup » et « Magic Link »),
 * ou null s'il est mal formé. Seul le type « email » est accepté : inscription ou connexion,
 * jamais un changement de mot de passe.
 */
export function jetonLien(tokenHash: unknown, type: unknown): string | null {
  if (type !== 'email' || typeof tokenHash !== 'string') return null
  return /^[\w-]{10,200}$/.test(tokenHash) ? tokenHash : null
}
