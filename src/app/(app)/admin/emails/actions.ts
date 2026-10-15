'use server'

import { createHash } from 'node:crypto'
import { createAdminClient, getAdminUser } from '@/lib/admin'
import { logAdminEvent } from '@/lib/admin-events'
import {
  CLE_PIED_DE_PAGE,
  EMAIL_EXPEDITEUR,
  MAX_DESTINATAIRES,
  TAILLE_LOT,
  construireEmailHtml,
  contenuVide,
  emailValide,
  estContenu,
  lienSur,
  type Contenu,
  type EmailPayload,
  type ResultatEnvoi,
} from '@/lib/admin-email'
import { lienDesinscription } from '@/lib/email-desinscription'

const SOURCE = 'admin/emails'

function erreurPayload(p: EmailPayload): string | null {
  if (!p || typeof p.objet !== 'string' || !p.objet.trim()) return 'Objet manquant.'
  if (p.objet.length > 200) return 'Objet trop long (200 caractères maximum).'
  if (!estContenu(p.corps) || contenuVide(p.corps)) return 'Le message est vide.'
  if (p.corps.contenu.length > 100_000) return 'Message trop long.'
  if (!estContenu(p.piedDePage) || p.piedDePage.contenu.length > 10_000) return 'Pied de page invalide.'
  if (p.bouton != null && (typeof p.bouton.texte !== 'string' || !lienSur(String(p.bouton.url ?? '')))) {
    return 'Le lien du bouton doit commencer par https://'
  }
  return null
}

/** Adresses à ne jamais écrire : désinscrites, ou opt-in marketing retiré (supabase/emails.sql). */
async function adressesExclues(): Promise<Set<string>> {
  const client = createAdminClient()
  const exclues = new Set<string>()
  for (let from = 0; ; from += 1000) {
    const { data, error } = await client.rpc('admin_emails_exclus').range(from, from + 999)
    if (error) throw new Error(`Désinscriptions illisibles : ${error.message} (supabase/emails.sql exécuté ?)`)
    const rows = (data ?? []) as { email: string | null }[]
    for (const r of rows) if (r.email) exclues.add(r.email.toLowerCase())
    if (rows.length < 1000) return exclues
  }
}

/** Envoie un email à une seule adresse via Brevo. Renvoie le message d'erreur, ou null. */
async function envoyerViaBrevo(email: string, p: EmailPayload, options: { test?: boolean; envoiId?: string } = {}) {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) return 'BREVO_API_KEY absente des variables d’environnement.'
  const lien = lienDesinscription(email, { test: options.test })
  if (!lien) return 'SUPABASE_SERVICE_ROLE_KEY absente : lien de désinscription impossible.'

  const body: Record<string, unknown> = {
    sender: EMAIL_EXPEDITEUR,
    replyTo: EMAIL_EXPEDITEUR,
    to: [{ email }],
    subject: options.test ? `[Test] ${p.objet.trim()}` : p.objet.trim(),
    htmlContent: construireEmailHtml({ ...p, lienDesinscription: lien }),
    tags: ['admin'],
  }
  if (options.envoiId) {
    // Un lot renvoyé après une coupure réseau ne repart pas en double.
    const empreinte = createHash('sha256').update(email.toLowerCase()).digest('hex').slice(0, 16)
    body.headers = { IdempotencyKey: `${options.envoiId}-${empreinte}` }
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20_000),
    })
    if (res.ok) return null
    const err = (await res.json().catch(() => ({}))) as { message?: string }
    return `Brevo ${res.status}${err.message ? ` : ${err.message}` : ''}`
  } catch (e) {
    return `Brevo injoignable : ${e instanceof Error ? e.message : String(e)}`
  }
}

/** Parmi ces adresses, celles qui seront ignorées à l'envoi (affiché avant de confirmer). */
export async function verifierDestinataires(emails: string[]): Promise<{ exclus: string[] } | { error: string }> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Non autorisé.' }
  if (!Array.isArray(emails) || emails.length > MAX_DESTINATAIRES) return { error: 'Liste de destinataires invalide.' }
  try {
    const exclues = await adressesExclues()
    return { exclus: emails.filter(e => typeof e === 'string' && exclues.has(e.trim().toLowerCase())) }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
}

/**
 * Envoie un lot (TAILLE_LOT adresses au plus), un email séparé par adresse.
 * Le navigateur enchaîne les lots : pas de fonction serveur trop longue, et une
 * progression réelle. `envoiId` identifie l'envoi complet (déduplication Brevo).
 */
export async function envoyerLot(
  payload: EmailPayload,
  destinataires: string[],
  envoiId: string,
): Promise<{ resultats: ResultatEnvoi[] } | { error: string }> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Non autorisé.' }
  const invalide = erreurPayload(payload)
  if (invalide) return { error: invalide }
  if (!Array.isArray(destinataires) || destinataires.length === 0 || destinataires.length > TAILLE_LOT) {
    return { error: 'Lot de destinataires invalide.' }
  }
  if (typeof envoiId !== 'string' || !/^[a-z0-9-]{8,64}$/i.test(envoiId)) return { error: 'Identifiant d’envoi invalide.' }

  let exclues: Set<string>
  try {
    exclues = await adressesExclues()
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }

  const resultats = await Promise.all(destinataires.map(async (brut): Promise<ResultatEnvoi> => {
    const email = String(brut).trim()
    if (!emailValide(email)) return { email, statut: 'echec', erreur: 'Adresse invalide.' }
    if (exclues.has(email.toLowerCase())) return { email, statut: 'exclu' }
    const erreur = await envoyerViaBrevo(email, payload, { envoiId })
    return erreur ? { email, statut: 'echec', erreur } : { email, statut: 'envoye' }
  }))
  return { resultats }
}

/** Envoie l'email à l'adresse de l'admin connecté, objet préfixé de « [Test] ». */
export async function envoyerTest(payload: EmailPayload): Promise<{ ok: true; email: string } | { error: string }> {
  const admin = await getAdminUser()
  if (!admin?.email) return { error: 'Non autorisé.' }
  const invalide = erreurPayload(payload)
  if (invalide) return { error: invalide }
  const erreur = await envoyerViaBrevo(admin.email, payload, { test: true })
  return erreur ? { error: erreur } : { ok: true, email: admin.email }
}

/** Enregistre le pied de page, réutilisé par les envois suivants. */
export async function enregistrerPiedDePage(pied: Contenu): Promise<{ ok: true; enregistreLe: string } | { error: string }> {
  const admin = await getAdminUser()
  if (!admin) return { error: 'Non autorisé.' }
  if (!estContenu(pied) || pied.contenu.length > 10_000) return { error: 'Pied de page invalide.' }
  const enregistreLe = new Date().toISOString()
  try {
    const { error } = await createAdminClient().from('admin_settings').upsert({
      key: CLE_PIED_DE_PAGE,
      value: { format: pied.format, contenu: pied.contenu },
      updated_at: enregistreLe,
      updated_by: admin.id,
    })
    if (error) return { error: `Enregistrement impossible : ${error.message} (supabase/emails.sql exécuté ?)` }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
  return { ok: true, enregistreLe }
}

/** Note l'envoi dans le journal de /admin (objet, compteurs, échecs). */
export async function journaliserEnvoi(resume: { objet: string; envoiId: string; resultats: ResultatEnvoi[] }): Promise<void> {
  const admin = await getAdminUser()
  if (!admin || !resume || !Array.isArray(resume.resultats)) return
  const envoyes = resume.resultats.filter(r => r.statut === 'envoye').length
  const exclus = resume.resultats.filter(r => r.statut === 'exclu').length
  const echecs = resume.resultats.filter(r => r.statut === 'echec')
  const s = (n: number) => (n > 1 ? 's' : '')
  const details = [
    `${envoyes} envoyé${s(envoyes)}`,
    exclus ? `${exclus} désinscrit${s(exclus)} ignoré${s(exclus)}` : '',
    echecs.length ? `${echecs.length} échec${s(echecs.length)}` : '',
  ].filter(Boolean).join(', ')
  await logAdminEvent({
    source: SOURCE,
    level: echecs.length ? 'warning' : 'info',
    message: `Email « ${String(resume.objet).slice(0, 120)} » : ${details}`,
    userId: admin.id,
    meta: {
      envoiId: resume.envoiId,
      envoyes,
      exclus,
      echecs: echecs.slice(0, 50).map(e => ({ email: e.email, erreur: e.erreur ?? null })),
    },
  })
}
