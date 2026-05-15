'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { saveOptin } from './actions'

export default function OnboardingPage() {
  const [optin, setOptin] = useState(false)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setIsPending(true)
    await saveOptin(optin)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image src="/logo.png" alt="La Bonne Quittance" width={200} height={86} priority />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Bienvenue ! 👋</h1>
          <p className="text-sm text-gray-500 mb-6">
            Votre compte a bien été créé. Avant de commencer, une dernière étape.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={optin}
                  onChange={e => setOptin(e.target.checked)}
                  className="mt-0.5 w-4 h-4 shrink-0 accent-[#008020] cursor-pointer"
                />
                <span className="text-sm text-gray-600 leading-relaxed">
                  J&apos;accepte de recevoir des conseils, nouveautés et offres de <strong>La Bonne Quittance</strong> par email. Vous pouvez vous désinscrire à tout moment.
                </span>
              </label>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              En continuant, vous acceptez nos{' '}
              <Link href="/cgu" target="_blank" className="text-[#008020] hover:underline">CGU</Link>
              {' '}et notre{' '}
              <Link href="/confidentialite" target="_blank" className="text-[#008020] hover:underline">Politique de confidentialité</Link>.
            </p>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#008020] hover:bg-green-800 disabled:opacity-75 text-white font-semibold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              {isPending ? <><Loader2 size={16} className="animate-spin" /> Chargement...</> : 'Accéder à mon espace'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
