import { createClient } from '@/lib/supabase/server'
import { claimTrialDrafts } from '@/lib/supabase/claim-trial-draft'
import { NextResponse } from 'next/server'

function safeNext(raw: string | null, fallback: string): string {
  if (!raw) return fallback
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

  // Google OAuth uniquement — les connexions email utilisent désormais verifyOtp (côté client)
  if (code) {
    const supabase = await createClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)
    const user = data.session?.user
    const provider = user?.app_metadata?.provider

    if (provider === 'google' && user) {
      const fullName: string = user.user_metadata?.full_name || user.user_metadata?.name || ''
      const parts = fullName.trim().split(' ')
      const prenom = parts[0] || ''
      const nom = parts.slice(1).join(' ')

      // Profil Google : upsert uniquement si pas encore de ligne (ignoreDuplicates)
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

      // Réclamer un éventuel brouillon d'essai (formulaire /quittance-en-ligne)
      if (user.email) {
        await claimTrialDrafts(supabase, user.id, user.email)
      }

      return NextResponse.redirect(`${origin}${safeNext(nextParam, '/dashboard')}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/confirmed`)
}
