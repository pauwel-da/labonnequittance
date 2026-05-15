import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')

  if (type === 'recovery') {
    if (code) {
      const supabase = await createClient()
      await supabase.auth.exchangeCodeForSession(code)
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

      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // Confirmation email : sauvegarder l'optin explicitement
  if (code) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      await supabase.from('proprietaire').upsert(
        { user_id: data.user.id, optin_marketing: true },
        { onConflict: 'user_id' }
      )
    }
  }

  return NextResponse.redirect(`${origin}/auth/confirmed`)
}
