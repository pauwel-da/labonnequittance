'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react'
import { signup } from './actions'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setEmail(formData.get('email') as string)
    setError(null)
    startTransition(async () => {
      const result = await signup(formData)
      if (result?.error) setError(result.error)
      else setSuccess(true)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="flex justify-center mb-8">
          <Image src="/logo.png" alt="La Bonne Quittance" width={200} height={86} priority />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {success ? (
            <div className="text-center">
              {/* Icône */}
              <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-5">
                <Mail size={28} className="text-[#008020]" />
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">Confirmez votre email</h2>
              <p className="text-sm text-gray-500 mb-1">Un lien de confirmation a été envoyé à</p>
              <p className="text-sm font-semibold text-gray-800 mb-6">{email}</p>

              {/* Étapes */}
              <div className="text-left space-y-3 mb-6">
                {[
                  'Ouvrez votre boîte mail',
                  'Cliquez sur le lien de confirmation',
                  'Connectez-vous à votre compte',
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#008020] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-sm text-gray-600">{step}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400 mb-6">
                Pensez à vérifier vos spams si vous ne trouvez pas l'email.
              </p>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full bg-[#008020] hover:bg-green-800 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                Aller à la connexion <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Créer un compte</h1>
              <p className="text-sm text-gray-500 mb-6">Gérez vos quittances en toute simplicité.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="vous@exemple.fr"
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      placeholder="6 caractères minimum"
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Consentement */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="consent"
                    required
                    className="mt-0.5 w-4 h-4 shrink-0 accent-[#008020] cursor-pointer"
                  />
                  <span className="text-xs text-gray-500 leading-relaxed">
                    En continuant, j'accepte les{' '}
                    <a href="/cgu" target="_blank" className="text-[#008020] hover:underline">Conditions générales d'utilisation</a>
                    , la{' '}
                    <a href="/confidentialite" target="_blank" className="text-[#008020] hover:underline">Politique de confidentialité</a>
                    {' '}et d'être inscrit à la newsletter.
                  </span>
                </label>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-[#008020] hover:bg-green-800 disabled:opacity-75 active:scale-95 text-white font-semibold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  {isPending ? <><Loader2 size={16} className="animate-spin" /> Création...</> : 'Créer mon compte'}
                </button>
              </form>
            </>
          )}
        </div>

        {!success && (
          <p className="mt-5 text-sm text-gray-500 text-center">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-[#008020] font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
