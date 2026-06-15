'use server'

import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

export type TrialPayload = {
  bien: {
    adresse: string
    code_postal: string
    ville: string
    type_location: 'meuble' | 'non_meuble'
  }
  locataire: {
    nom_prenom: string
    montant_loyer: number
    montant_charges: number
    date_debut_periode: string // YYYY-MM-DD
    date_fin_periode: string
    date_paiement: string
    ville_emission: string
  }
  bailleur: {
    prenom: string
    nom: string
    adresse: string
    code_postal: string
    ville: string
    email: string
  }
  signature: string // dataUrl PNG ou ""
}

// Rate limit en mémoire : 1 email par IP / 10 min
const ATTEMPTS = new Map<string, number>()
const WINDOW_MS = 10 * 60 * 1000

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

async function findUserIdByEmail(adminClient: ReturnType<typeof admin>, email: string): Promise<string | null> {
  // Pagination prudente (1000 par page, jusqu'à 10 pages = 10k users)
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error
    const user = data.users.find((u) => u.email === email)
    if (user) return user.id
    if (data.users.length < 1000) break
  }
  return null
}

export async function submitTrialQuittance(payload: TrialPayload) {
  // 1. Rate limit par IP
  const hdrs = await headers()
  const ip = (hdrs.get('x-forwarded-for')?.split(',')[0].trim()) || hdrs.get('x-real-ip') || 'unknown'
  const now = Date.now()
  const lastAttempt = ATTEMPTS.get(ip)
  if (lastAttempt && now - lastAttempt < WINDOW_MS) {
    return { error: 'Trop de tentatives, réessayez dans quelques minutes.' as const }
  }

  // 2. Validation basique
  const email = payload.bailleur.email.trim().toLowerCase()
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return { error: 'Email invalide.' as const }
  }
  if (!payload.bien.adresse || !payload.locataire.nom_prenom || !payload.bailleur.nom) {
    return { error: 'Champs manquants.' as const }
  }

  const adminClient = admin()

  // 3. Trouver ou créer l'utilisateur
  let userId: string | null = null
  let isExistingUser = false

  try {
    const existingId = await findUserIdByEmail(adminClient, email)
    if (existingId) {
      userId = existingId
      isExistingUser = true
    } else {
      const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
        email,
        email_confirm: false,
      })
      if (createErr || !created.user) {
        return { error: 'Impossible de créer le compte.' as const }
      }
      userId = created.user.id
    }
  } catch {
    return { error: 'Erreur côté serveur.' as const }
  }

  if (!userId) return { error: 'Compte introuvable.' as const }

  // 4. Upsert proprietaire (préserve la signature existante si non fournie cette fois)
  let existingSignature = ''
  if (isExistingUser) {
    const { data: existing } = await adminClient
      .from('proprietaire')
      .select('signature')
      .eq('user_id', userId)
      .maybeSingle()
    if (existing?.signature) existingSignature = existing.signature
  }
  const signatureToStore = payload.signature?.startsWith('data:image') ? payload.signature : existingSignature

  const { error: propErr } = await adminClient.from('proprietaire').upsert(
    {
      user_id: userId,
      nom: payload.bailleur.nom,
      prenom: payload.bailleur.prenom,
      adresse: payload.bailleur.adresse,
      code_postal: payload.bailleur.code_postal,
      ville: payload.bailleur.ville,
      signature: signatureToStore,
      optin_marketing: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )
  if (propErr) return { error: 'Erreur enregistrement profil.' as const }

  // 5. Insert bien (auto-nommé d'après l'adresse)
  const bienNom = payload.bien.adresse.slice(0, 40) || 'Mon bien'
  const { data: bienRow, error: bienErr } = await adminClient
    .from('biens')
    .insert({
      user_id: userId,
      nom: bienNom,
      adresse: payload.bien.adresse,
      code_postal: payload.bien.code_postal,
      ville: payload.bien.ville,
      type_location: payload.bien.type_location,
    })
    .select('id')
    .single()
  if (bienErr || !bienRow) return { error: 'Erreur enregistrement bien.' as const }

  // 6. Insert locataire
  const { error: locErr } = await adminClient.from('locataires').insert({
    user_id: userId,
    bien_id: bienRow.id,
    nom_prenom: payload.locataire.nom_prenom,
    email: '',
    copie_email: false,
    loyer: payload.locataire.montant_loyer,
    charges: payload.locataire.montant_charges,
    date_debut: payload.locataire.date_debut_periode,
  })
  if (locErr) return { error: 'Erreur enregistrement locataire.' as const }

  // 7. Send magic link avec ?next=/dashboard pour atterrir direct sur la quittance
  const periode = payload.locataire.date_debut_periode // YYYY-MM-DD
  const [year, month] = periode.split('-')
  const monthNum = parseInt(month, 10) // 1-12
  const next = `/dashboard?fresh=1&year=${year}&month=${monthNum - 1}` // dashboard utilise month 0-11
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
  const { error: otpErr } = await userClient.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })
  if (otpErr) {
    return { error: 'Erreur envoi email.' as const }
  }

  // 8. Marquer le rate limit (only after successful send)
  ATTEMPTS.set(ip, now)

  return { ok: true as const, isExistingUser }
}
