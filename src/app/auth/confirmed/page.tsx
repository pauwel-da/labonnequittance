'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle, ArrowRight } from 'lucide-react'

const REDIRECT_DELAY = 5

export default function ConfirmedPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(REDIRECT_DELAY)

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(n => {
        if (n <= 1) {
          clearInterval(interval)
          router.push('/dashboard')
        }
        return n - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/logo.png" alt="La Bonne Quittance" width={200} height={86} priority />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* Icône succès */}
          <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-[#008020]" />
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">Compte confirmé !</h1>
          <p className="text-sm text-gray-500 mb-6">
            Votre adresse email a bien été vérifiée. Bienvenue sur La Bonne Quittance.
          </p>

          {/* Barre de progression */}
          <div className="w-full bg-gray-100 rounded-full h-1 mb-4 overflow-hidden">
            <div
              className="bg-[#008020] h-1 rounded-full transition-all duration-1000"
              style={{ width: `${((REDIRECT_DELAY - countdown) / REDIRECT_DELAY) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mb-6">
            Redirection automatique dans {countdown} seconde{countdown > 1 ? 's' : ''}…
          </p>

          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full bg-[#008020] hover:bg-green-800 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            Accéder à mon espace <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  )
}
