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

// Rate limit en mémoire : 1 soumission par IP / 10 min
const ATTEMPTS = new Map<string, number>()
const WINDOW_MS = 10 * 60 * 1000

function anon() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}

function computeNext(dateDebut: string): string {
  const [year, month] = dateDebut.split('-')
  const monthNum = parseInt(month, 10)
  return `/dashboard?fresh=1&year=${year}&month=${monthNum - 1}`
}

// Sauvegarde le brouillon d'essai. Retourne next= pour la redirection post-auth.
export async function saveTrialDraft(
  payload: TrialPayload
): Promise<{ ok: true; next: string } | { error: string }> {
  // 1. Rate limit par IP
  const hdrs = await headers()
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0].trim() || hdrs.get('x-real-ip') || 'unknown'
  const now = Date.now()
  const lastAttempt = ATTEMPTS.get(ip)
  if (lastAttempt && now - lastAttempt < WINDOW_MS) {
    return { error: 'Trop de tentatives, réessayez dans quelques minutes.' }
  }

  // 2. Validation basique
  const email = payload.bailleur.email.trim().toLowerCase()
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return { error: 'Email invalide.' }
  if (!payload.bien.adresse || !payload.locataire.nom_prenom || !payload.bailleur.nom) {
    return { error: 'Champs manquants.' }
  }

  // 3. Enregistrer le brouillon
  const client = anon()
  const { error: draftErr } = await client.from('trial_drafts').insert({
    email,
    payload: {
      bien: payload.bien,
      locataire: payload.locataire,
      bailleur: { ...payload.bailleur, email },
      signature: payload.signature,
    },
  })
  if (draftErr) return { error: 'Erreur enregistrement.' }

  ATTEMPTS.set(ip, now)
  return { ok: true, next: computeNext(payload.locataire.date_debut_periode) }
}

// Envoie le code OTP par email (flux non-Gmail).
export async function sendTrialOtp(email: string): Promise<{ ok: true } | { error: string }> {
  const client = anon()
  const { error } = await client.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  })
  if (error) return { error: 'Erreur envoi email.' }
  return { ok: true }
}
