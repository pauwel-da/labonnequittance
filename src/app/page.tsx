import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import AppScreenshots from '@/components/AppScreenshots'
import { createClient } from '@/lib/supabase/server'

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

const faqs = [
  {
    q: 'Est-ce vraiment gratuit ?',
    a: 'Oui, 100% gratuit. Aucun abonnement, aucune carte bancaire requise. Générez et envoyez autant de quittances que vous voulez, sans aucune limite.',
  },
  {
    q: 'La quittance est-elle conforme légalement ?',
    a: 'Oui. Elle respecte toutes les mentions obligatoires imposées par le décret du 26 août 1987, avec signature numérique incluse.',
  },
  {
    q: 'Puis-je gérer plusieurs locataires et plusieurs biens ?',
    a: 'Oui, sans limite. Ajoutez autant de biens et de locataires que vous le souhaitez.',
  },
  {
    q: "Qu'est-ce que l'attestation CAF ?",
    a: "C'est le formulaire Cerfa n° 10842 que la CAF demande au bailleur pour vérifier le logement et le montant du loyer de votre locataire. La Bonne Quittance vous permet de le générer en 1 clic, pré-rempli avec vos données.",
  },
  {
    q: 'Mes données sont-elles sécurisées ?',
    a: 'Vos données sont hébergées en Europe et ne sont jamais revendues à des tiers. Aucun cookie de tracking, votre navigation reste anonyme.',
  },
]

async function getUserCount(): Promise<number | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.rpc('count_users')
    return data ? Number(data) : null
  } catch {
    return null
  }
}

export default async function Home() {
  const userCount = await getUserCount()

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

        {/* Badge gratuit */}
        <span className="inline-block bg-green-50 text-[#008020] text-xs font-semibold px-4 py-1.5 rounded-full border border-green-200 mb-5">
          100% gratuit · Sans abonnement · Sans carte bancaire
        </span>

        {/* Headline */}
        <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight max-w-xl">
          Fini les quittances Word<br className="hidden lg:block" /> chaque mois
        </h1>
        <p className="text-gray-500 text-base lg:text-lg max-w-sm lg:max-w-lg mb-6">
          Générez et envoyez vos quittances de loyer en PDF en 1 clic.
          Attestation CAF incluse. Signature numérique. Conforme légalement.
        </p>

        {/* Preuve sociale */}
        {userCount && userCount > 0 && (
          <p className="text-sm text-gray-400 mb-6">
            Déjà <span className="font-semibold text-gray-700">{userCount}+ bailleurs</span> inscrits
          </p>
        )}

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
          <span className="flex items-center gap-1.5"><span className="text-[#008020] font-bold">✓</span> Conforme légalement</span>
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

        {/* Feature CAF */}
        <div className="w-full max-w-3xl mt-16 mb-12 bg-green-50 border border-green-100 rounded-2xl px-8 py-8 text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#008020] mb-3">Fonctionnalité incluse</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Attestation CAF en 1 clic</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Générez le formulaire Cerfa n° 10842 pré-rempli avec les données de votre locataire.
            Un document souvent demandé par la CAF, créé en quelques secondes sans rien ressaisir.
          </p>
        </div>

        {/* FAQ */}
        <div className="w-full max-w-3xl mb-12 text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8 text-center">Questions fréquentes</p>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="group bg-white border border-gray-100 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold text-gray-900 list-none">
                  {faq.q}
                  <ChevronRight size={16} className="text-gray-400 shrink-0 ml-3 transition-transform group-open:rotate-90" />
                </summary>
                <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Second CTA */}
        <div className="w-full max-w-3xl bg-[#008020] rounded-2xl px-8 py-10 mb-12 text-center">
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
