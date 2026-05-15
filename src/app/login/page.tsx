'use client'

import { useState, useTransition, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, Mail, Lock, MailCheck } from 'lucide-react'
import { login } from './actions'
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

function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [googlePending, setGooglePending] = useState(false)
  const [consent, setConsent] = useState(false)
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) setError(result.error)
    })
  }

  async function handleGoogle() {
    setGooglePending(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      {message ? (
        <>
          <div className="flex flex-col items-center text-center mb-6">
            <div className="bg-green-50 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <MailCheck size={26} className="text-[#008020]" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Vérifiez vos emails</h1>
            <p className="text-sm text-gray-500">{message}</p>
            <p className="text-xs text-gray-400 mt-2">Pensez à vérifier vos spams.</p>
          </div>
          <div className="border-t border-gray-100 pt-5">
            <p className="text-xs text-gray-400 text-center mb-4">Déjà confirmé votre compte ?</p>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Bon retour !</h1>
          <p className="text-sm text-gray-500 mb-6">Connectez-vous à votre espace bailleur.</p>
        </>
      )}

      {/* Consentement */}
      <label className="flex items-start gap-3 cursor-pointer mb-4">
        <input
          type="checkbox"
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
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

      {/* Bouton Google */}
      <button
        onClick={handleGoogle}
        disabled={googlePending || isPending || !consent}
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
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Mot de passe</label>
            <Link href="/auth/reset-password" className="text-xs text-[#008020] hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020] focus:border-transparent"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending || googlePending}
          className="w-full bg-[#008020] hover:bg-green-800 disabled:opacity-75 active:scale-95 text-white font-semibold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
        >
          {isPending ? <><Loader2 size={16} className="animate-spin" /> Connexion...</> : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image src="/logo.png" alt="La Bonne Quittance" width={260} height={112} priority />
          </Link>
        </div>
        <Suspense fallback={
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-xl font-bold text-gray-900 mb-1">Bon retour !</h1>
            <p className="text-sm text-gray-500 mb-6">Connectez-vous à votre espace bailleur.</p>
          </div>
        }>
          <LoginForm />
        </Suspense>
        <p className="mt-5 text-sm text-gray-500 text-center">
          Pas encore de compte ?{' '}
          <Link href="/signup" className="text-[#008020] font-medium hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
