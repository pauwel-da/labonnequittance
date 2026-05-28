import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function UnsubscribeRappelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  await supabase
    .from('proprietaire')
    .update({ optin_rappel_mensuel: false })
    .eq('user_id', user.id)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="text-[#008020] text-xl">✓</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Désinscription confirmée</h1>
        <p className="text-sm text-gray-500 mb-8">
          Vous ne recevrez plus les rappels mensuels. Vous pouvez vous réinscrire à tout moment depuis votre profil.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-[#008020] hover:bg-green-800 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  )
}
