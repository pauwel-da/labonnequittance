import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { LogIn, TriangleAlert } from 'lucide-react'
import { confirmerLien } from './actions'
import BoutonConnexion from './BoutonConnexion'
import { jetonLien } from './jeton'

// Cible du bouton des emails de code (modèles dans supabase/emails/) :
// https://labonnequittance.fr/auth/confirm?token_hash={{ .TokenHash }}&type=email
// Ouvrir la page ne consomme rien, seul le bouton valide le lien. Certaines messageries ouvrent
// les liens pour les analyser : le lien et le code étant le même jeton, ça grillerait aussi le code.

export const metadata: Metadata = {
  title: 'Connexion — La Bonne Quittance',
  robots: { index: false, follow: false },
}

function Carte({ icone, alerte = false, titre, children }: {
  icone: React.ReactNode
  alerte?: boolean
  titre: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image src="/logo.svg" alt="La Bonne Quittance" width={200} height={72} priority />
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className={`rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 ${alerte ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-[#008020]'}`}>
            {icone}
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{titre}</h1>
          {children}
        </div>
      </div>
    </div>
  )
}

export default async function ConfirmPage({ searchParams }: {
  searchParams: Promise<{ token_hash?: string; type?: string; erreur?: string }>
}) {
  const { token_hash, type, erreur } = await searchParams
  const jeton = erreur ? null : jetonLien(token_hash, type)

  if (!jeton) {
    return (
      <Carte icone={<TriangleAlert size={26} />} alerte titre="Ce lien n'est plus valide">
        <p className="text-sm text-gray-500 mb-6">
          Il a déjà servi ou a expiré. Demandez un nouveau code de connexion : il arrive en quelques secondes.
        </p>
        <Link
          href="/login"
          className="block w-full bg-[#008020] hover:bg-green-800 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
        >
          Recevoir un nouveau code
        </Link>
      </Carte>
    )
  }

  return (
    <Carte icone={<LogIn size={26} />} titre="Accédez à votre espace">
      <p className="text-sm text-gray-500 mb-6">Dernière étape : confirmez que c&apos;est bien vous.</p>
      <form action={confirmerLien}>
        <input type="hidden" name="token_hash" value={jeton} />
        <input type="hidden" name="type" value="email" />
        <BoutonConnexion />
      </form>
      <p className="text-xs text-gray-400 mt-5">Vous n&apos;avez rien demandé ? Fermez simplement cette page.</p>
    </Carte>
  )
}
