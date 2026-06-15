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

function anon() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
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

  const client = anon()

  // 3. Enregistrer le brouillon (un visiteur anonyme peut INSERT, RLS l'empêche de lire/modifier).
  // Il sera "réclamé" par /auth/callback une fois l'utilisateur authentifié via le lien magique.
  const { error: draftErr } = await client.from('trial_drafts').insert({
    email,
    payload: {
      bien: payload.bien,
      locataire: payload.locataire,
      bailleur: { ...payload.bailleur, email },
      signature: payload.signature,
    },
  })
  if (draftErr) return { error: 'Erreur enregistrement.' as const }

  // 4. Envoi du lien magique avec ?next=/dashboard pour atterrir direct sur la quittance
  const periode = payload.locataire.date_debut_periode // YYYY-MM-DD
  const [year, month] = periode.split('-')
  const monthNum = parseInt(month, 10) // 1-12
  const next = `/dashboard?fresh=1&year=${year}&month=${monthNum - 1}` // dashboard utilise month 0-11
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { error: otpErr } = await client.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })
  if (otpErr) {
    return { error: 'Erreur envoi email.' as const }
  }

  // 5. Marquer le rate limit (only after successful send)
  ATTEMPTS.set(ip, now)

  return { ok: true as const }
}
