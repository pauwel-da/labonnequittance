'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react'
import { signup } from './actions'
import { createClient } from '@/lib/supabase/client'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [googlePending, setGooglePending] = useState(false)
  const [googleConsent, setGoogleConsent] = useState(false)
  const [consentError, setConsentError] = useState(false)

  async function handleGoogle() {
    if (!googleConsent) { setConsentError(true); return }
    setConsentError(false)
    setGooglePending(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!googleConsent) { setConsentError(true); return }
    setConsentError(false)
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

              <label className="flex items-start gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={googleConsent}
                  onChange={e => setGoogleConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 shrink-0 accent-[#008020] cursor-pointer"
                />
                <span className="text-xs text-gray-500 leading-relaxed">
                  En continuant, j&apos;accepte les{' '}
                  <Link href="/cgu" target="_blank" className="text-[#008020] hover:underline">CGU</Link>
                  , la{' '}
                  <Link href="/confidentialite" target="_blank" className="text-[#008020] hover:underline">Politique de confidentialité</Link>
                  {' '}et d&apos;être inscrit à la newsletter.
                </span>
              </label>

              {consentError && (
                <p className="text-xs text-red-500 -mt-2 mb-3">Veuillez accepter les conditions pour continuer.</p>
              )}

              <button
                type="button"
                onClick={handleGoogle}
                disabled={googlePending || isPending}
                className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-75 transition-colors mb-4"
              >
                {googlePending ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
                Continuer avec Google
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 border-t border-gray-200" />
                <span className="text-xs text-gray-400">ou</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>

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

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                {consentError && (
                  <p className="text-xs text-red-500">Veuillez accepter les conditions pour continuer.</p>
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
