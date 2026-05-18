import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import AppScreenshots from '@/components/AppScreenshots'

const steps = [
  {
    number: '1',
    title: 'Ajoutez vos locataires',
    desc: 'Renseignez vos biens et locataires en quelques secondes. Une seule fois.',
  },
  {
    number: '2',
    title: 'Générez en 1 clic',
    desc: 'La quittance PDF est créée automatiquement avec toutes les mentions légales.',
  },
  {
    number: '3',
    title: 'Envoyez par email',
    desc: 'Transmettez directement à votre locataire depuis l\'application, avec votre signature.',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      <main className="flex-1 flex flex-col items-center px-6 pt-10 lg:pt-16 pb-0 text-center">

        {/* Logo */}
        <Image
          src="/logo.png"
          alt="La Bonne Quittance"
          width={300}
          height={129}
          priority
          className="mt-6 mb-6 lg:mt-0 lg:mb-8 lg:w-[340px]"
        />

        {/* Headline */}
        <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight max-w-xl">
          Fini les quittances Word<br className="hidden lg:block" /> chaque mois
        </h1>
        <p className="text-gray-500 text-base lg:text-lg max-w-sm lg:max-w-lg mb-10">
          Générez et envoyez vos quittances de loyer en PDF en 1 clic.
          Signature numérique incluse. Aucune installation.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:justify-center mb-6">
          <Link href="/signup" className="bg-[#008020] hover:bg-green-800 text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-colors">
            Créer un compte gratuit
          </Link>
          <Link href="/login" className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-8 py-3.5 rounded-xl text-sm transition-colors">
            Se connecter
          </Link>
        </div>

        {/* Signaux de réassurance */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-12 text-sm text-gray-400">
          <span className="flex items-center gap-1.5"><span className="text-[#008020] font-bold">✓</span> 100 % gratuit</span>
          <span className="flex items-center gap-1.5"><span className="text-[#008020] font-bold">✓</span> Aucune carte requise</span>
          <span className="flex items-center gap-1.5"><span className="text-[#008020] font-bold">✓</span> Prêt en 30 secondes</span>
        </div>

        {/* Comment ça marche */}
        <div className="w-full max-w-3xl border-t border-gray-100 pt-12 mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">Comment ça marche</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {steps.map((s, i) => (
              <div key={s.number} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#008020] text-white text-sm font-bold flex items-center justify-center shrink-0">
                    {s.number}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="hidden sm:block mt-2">
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">{s.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Captures d'écran */}
        <AppScreenshots />

        {/* Second CTA */}
        <div className="w-full max-w-3xl bg-[#008020] rounded-2xl px-8 py-10 mb-12 text-center mt-16">
          <p className="text-2xl font-bold text-white mb-2">Prêt à gagner du temps ?</p>
          <p className="text-green-100 text-sm mb-6">Créez votre compte en 30 secondes. C&apos;est gratuit, sans engagement.</p>
          <Link href="/signup" className="inline-block bg-white text-[#008020] font-semibold px-8 py-3.5 rounded-xl text-sm hover:bg-green-50 transition-colors">
            Créer mon compte gratuit →
          </Link>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100 space-y-2">
        <p>© {new Date().getFullYear()} La Bonne Quittance · Gratuit pour tous les bailleurs</p>
        <p className="text-gray-300">Ce site n&apos;utilise aucun cookie de suivi ni publicitaire.</p>
        <p className="flex items-center justify-center gap-4">
          <Link href="/blog" className="hover:text-gray-600 hover:underline transition-colors">Blog</Link>
          <span>·</span>
          <Link href="/cgu" className="hover:text-gray-600 hover:underline transition-colors">CGU</Link>
          <span>·</span>
          <Link href="/mentions-legales" className="hover:text-gray-600 hover:underline transition-colors">Mentions légales</Link>
          <span>·</span>
          <Link href="/confidentialite" className="hover:text-gray-600 hover:underline transition-colors">Confidentialité</Link>
        </p>
      </footer>

    </div>
  )
}
