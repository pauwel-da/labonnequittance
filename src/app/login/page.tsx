'use client'

import { useState, useTransition, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, Mail, Lock, MailCheck } from 'lucide-react'
import { login } from './actions'

function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
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
          </label>
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
          disabled={isPending}
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
          <Image src="/logo.png" alt="La Bonne Quittance" width={200} height={86} priority />
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
