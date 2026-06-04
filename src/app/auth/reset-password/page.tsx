'use client'

import { useState, useTransition, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Mail, Loader2, ArrowLeft, MailCheck, AlertCircle } from 'lucide-react'
import { resetPassword } from './actions'

const INCOMING_ERRORS: Record<string, string> = {
  link_expired: 'Ce lien de réinitialisation est expiré ou a déjà été utilisé. Demandez-en un nouveau ci-dessous.',
  session_expired: 'Votre session a expiré. Demandez un nouveau lien pour réinitialiser votre mot de passe.',
}

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState(searchParams.get('prefill') ?? '')
  const [isPending, startTransition] = useTransition()
  const incomingError = INCOMING_ERRORS[searchParams.get('error') ?? '']

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const result = await resetPassword(formData)
      if (result?.error) setError(result.error)
      else setSuccess(true)
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      {success ? (
        <div className="text-center">
          <div className="bg-green-50 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
            <MailCheck size={26} className="text-[#008020]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Email envoyé</h2>
          <p className="text-sm text-gray-500 mb-1">Un lien de réinitialisation a été envoyé à</p>
          <p className="text-sm font-semibold text-gray-800 mb-4">{email}</p>
          <p className="text-xs text-gray-400">Pensez à vérifier vos spams.</p>
        </div>
      ) : (
        <>
          {incomingError && !error && (
            <div className="flex gap-2 text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2.5 mb-5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{incomingError}</span>
            </div>
          )}

          <h1 className="text-xl font-bold text-gray-900 mb-1">Mot de passe oublié ?</h1>
          <p className="text-sm text-gray-500 mb-6">
            Saisissez votre email. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>

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
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
              {isPending ? <><Loader2 size={16} className="animate-spin" /> Envoi...</> : 'Envoyer le lien'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="flex justify-center mb-8">
          <Image src="/logo.png" alt="La Bonne Quittance" width={200} height={86} priority />
        </div>

        <Suspense fallback={
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-xl font-bold text-gray-900 mb-1">Mot de passe oublié ?</h1>
            <p className="text-sm text-gray-500">Chargement...</p>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>

        <p className="mt-5 text-sm text-gray-500 text-center">
          <Link href="/login" className="flex items-center justify-center gap-1.5 text-[#008020] font-medium hover:underline">
            <ArrowLeft size={14} /> Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  )
}
