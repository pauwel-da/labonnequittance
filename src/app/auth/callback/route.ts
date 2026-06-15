import { createClient } from '@/lib/supabase/server'
import type { TrialPayload } from '@/app/quittance-en-ligne/actions'
import { NextResponse } from 'next/server'

// Réclame le brouillon d'essai créé par /quittance-en-ligne pour cet email :
// écrit proprietaire/biens/locataires sous l'utilisateur authentifié (RLS user_id = auth.uid()).
async function claimTrialDraft(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  payload: TrialPayload
) {
  // Préserve la signature déjà enregistrée si le brouillon n'en contient pas
  const { data: existing } = await supabase
    .from('proprietaire')
    .select('signature')
    .eq('user_id', userId)
    .maybeSingle()
  const signature = payload.signature?.startsWith('data:image')
    ? payload.signature
    : existing?.signature || ''

  await supabase.from('proprietaire').upsert(
    {
      user_id: userId,
      nom: payload.bailleur.nom,
      prenom: payload.bailleur.prenom,
      adresse: payload.bailleur.adresse,
      code_postal: payload.bailleur.code_postal,
      ville: payload.bailleur.ville,
      signature,
      optin_marketing: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  const bienNom = payload.bien.adresse.slice(0, 40) || 'Mon bien'
  const { data: bienRow } = await supabase
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

  if (bienRow) {
    await supabase.from('locataires').insert({
      user_id: userId,
      bien_id: bienRow.id,
      nom_prenom: payload.locataire.nom_prenom,
      email: '',
      copie_email: false,
      loyer: payload.locataire.montant_loyer,
      charges: payload.locataire.montant_charges,
      date_debut: payload.locataire.date_debut_periode,
    })
  }
}

function safeNext(raw: string | null, fallback: string): string {
  if (!raw) return fallback
  // Sécurité : on n'accepte qu'un chemin relatif (anti open-redirect)
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallback
  return raw
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const nextParam = searchParams.get('next')

  if (type === 'recovery') {
    if (!code) {
      return NextResponse.redirect(`${origin}/auth/reset-password?error=link_expired`)
    }
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(`${origin}/auth/reset-password?error=link_expired`)
    }
    return NextResponse.redirect(`${origin}/auth/update-password`)
  }

  if (code) {
    const supabase = await createClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)
    const user = data.session?.user
    const provider = user?.app_metadata?.provider

    // Connexion Google : pré-remplir le profil si inexistant
    if (provider === 'google' && user) {
      const fullName: string = user.user_metadata?.full_name || user.user_metadata?.name || ''
      const parts = fullName.trim().split(' ')
      const prenom = parts[0] || ''
      const nom = parts.slice(1).join(' ')

      await supabase.from('proprietaire').upsert(
        {
          user_id: user.id,
          nom,
          prenom,
          adresse: '',
          code_postal: '',
          ville: '',
          signature: '',
          optin_marketing: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id', ignoreDuplicates: true }
      )

      return NextResponse.redirect(`${origin}${safeNext(nextParam, '/dashboard')}`)
    }

    // Magic link / Email confirmation : réclamer un éventuel brouillon d'essai, sinon juste l'optin
    const { data: userData } = await supabase.auth.getUser()
    if (userData.user) {
      const userEmail = userData.user.email
      const { data: drafts } = userEmail
        ? await supabase.from('trial_drafts').select('id, payload').eq('email', userEmail)
        : { data: null }

      if (drafts && drafts.length > 0) {
        for (const draft of drafts) {
          await claimTrialDraft(supabase, userData.user.id, draft.payload as TrialPayload)
          await supabase.from('trial_drafts').delete().eq('id', draft.id)
        }
      } else {
        await supabase.from('proprietaire').upsert(
          { user_id: userData.user.id, optin_marketing: true },
          { onConflict: 'user_id' }
        )
      }
    }

    // Si on a un next param, on y va direct (cas magic link landing trial)
    if (nextParam) {
      return NextResponse.redirect(`${origin}${safeNext(nextParam, '/auth/confirmed')}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/confirmed`)
}
