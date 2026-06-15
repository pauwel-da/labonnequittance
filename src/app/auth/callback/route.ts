import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    // Magic link / Email confirmation : sauvegarder l'optin + suivre next
    const { data: userData } = await supabase.auth.getUser()
    if (userData.user) {
      await supabase.from('proprietaire').upsert(
        { user_id: userData.user.id, optin_marketing: true },
        { onConflict: 'user_id' }
      )
    }

    // Si on a un next param, on y va direct (cas magic link landing trial)
    if (nextParam) {
      return NextResponse.redirect(`${origin}${safeNext(nextParam, '/auth/confirmed')}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/confirmed`)
}
