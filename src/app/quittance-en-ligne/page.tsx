import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import TrialForm from './TrialForm'

export default function QuittanceEnLignePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/40 to-white flex flex-col">

      {/* HEADER simplifié — pas de nav lourde pour focus conversion */}
      <header className="bg-white/70 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="La Bonne Quittance"
              width={180}
              height={77}
              sizes="(min-width: 640px) 180px, 140px"
              className="w-35 sm:w-45 h-auto"
              priority
            />
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
            <span className="flex gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
              ))}
            </span>
            <span className="font-medium text-gray-700">Noté 5,0 sur Google</span>
          </div>
        </div>
      </header>

      {/* HERO COMPACT */}
      <section className="px-4 sm:px-6 pt-10 lg:pt-14 pb-6 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-3">
          Votre quittance de loyer,<br className="hidden sm:block" />{' '}
          <span className="bg-gradient-to-r from-[#008020] to-emerald-500 bg-clip-text text-transparent">
            en 2 minutes chrono.
          </span>
        </h1>
        <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Remplissez le formulaire, récupérez votre PDF. <strong>100% gratuit</strong>.
        </p>
      </section>

      {/* FORM + PREVIEW */}
      <section className="px-4 sm:px-6 pb-16 lg:pb-24 flex-1">
        <TrialForm />
      </section>

      {/* FOOTER MINIMAL */}
      <footer className="bg-white py-6 text-center text-xs text-gray-400 border-t border-gray-100">
        <p>© {new Date().getFullYear()} La Bonne Quittance ·{' '}
          <Link href="/cgu" className="hover:text-gray-600 hover:underline">CGU</Link>
          {' · '}
          <Link href="/confidentialite" className="hover:text-gray-600 hover:underline">Confidentialité</Link>
        </p>
      </footer>

    </div>
  )
}
