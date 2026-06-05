import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Star } from 'lucide-react'
import LandingHero from '@/components/LandingHero'
import LandingFeatures from '@/components/LandingFeatures'
import LandingCTA from '@/components/LandingCTA'
import { createClient } from '@/lib/supabase/server'

const reviews = [
  { name: 'Dibrilou', text: "J'ai testé, j'ai adopté. Excellent service pour les propriétaires qui visent l'efficacité, je ne peux que recommander." },
  { name: 'Ferroudja', text: 'Simple à utiliser et très efficace.' },
  { name: 'Abdelwahad', text: 'Application vraiment intuitive, je recommande.' },
  { name: 'Tim', text: 'Très utile. On peut envoyer les quittances directement à ses locataires.' },
  { name: 'Tim', text: "L'application est plutôt simple d'utilisation et très intuitive." },
]

const GOOGLE_REVIEWS_URL = 'https://www.google.com/maps/search/?api=1&query=La+Bonne+Quittance+Lyon'

const faqs = [
  {
    q: 'Est-ce vraiment 100% gratuit ?',
    a: 'Oui. Aucun abonnement, aucune carte bancaire requise. Générez et envoyez autant de quittances que vous voulez, sans limite.',
  },
  {
    q: 'La quittance est-elle conforme légalement ?',
    a: 'Oui. Elle respecte toutes les mentions obligatoires imposées par le décret du 26 août 1987, avec signature numérique incluse. Document infalsifiable, accepté par toutes les administrations.',
  },
  {
    q: 'Puis-je gérer plusieurs biens et locataires ?',
    a: 'Sans limite. Ajoutez autant de biens et de locataires que vous le souhaitez.',
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
    return data ? Number(data) + 400 : null
  } catch {
    return null
  }
}

export default async function Home() {
  const userCount = await getUserCount()

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── HEADER ── */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Image
            src="/logo.png"
            alt="La Bonne Quittance"
            width={180}
            height={77}
            sizes="180px"
            priority
          />
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-2 transition-colors hidden sm:block"
            >
              Se connecter
            </Link>
            <Link
              href="/signup"
              className="bg-[#008020] hover:bg-green-800 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <LandingHero userCount={userCount} />

      {/* ── REVIEWS (marquee) ── */}
      <section className="bg-white px-0 py-14 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 mb-10">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                ))}
              </span>
              <span className="text-sm font-semibold text-gray-900">Noté 5,0 sur Google</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 text-center">
              Ils utilisent déjà La Bonne Quittance
            </h2>
          </div>
        </div>

        <div className="overflow-hidden marquee-mask">
          <div className="flex gap-4 animate-marquee">
            {[...reviews, ...reviews].map((r, i) => (
              <div
                key={i}
                className="shrink-0 w-[78vw] sm:w-[320px] bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col"
              >
                <span className="flex gap-0.5 mb-3">
                  {[0, 1, 2, 3, 4].map((j) => (
                    <Star key={j} size={13} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed mb-4 flex-1">&ldquo;{r.text}&rdquo;</p>
                <p className="text-xs font-semibold text-gray-900">{r.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-8 px-6">
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#008020] transition-colors"
          >
            Voir tous les avis sur Google
            <ChevronRight size={14} />
          </a>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <LandingFeatures />

      {/* ── FAQ ── */}
      <section className="bg-gray-50 px-6 py-20 lg:py-24 border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#008020] mb-2">Questions</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">À propos du service</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold text-gray-900 list-none">
                  {faq.q}
                  <ChevronRight size={16} className="text-gray-400 shrink-0 ml-3 transition-transform group-open:rotate-90" />
                </summary>
                <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <LandingCTA />

      {/* ── FOOTER ── */}
      <footer className="bg-white py-10 text-center text-xs text-gray-400 border-t border-gray-100 space-y-3">
        <p>© {new Date().getFullYear()} La Bonne Quittance · Gratuit pour tous les bailleurs</p>
        <p className="text-gray-300">Ce site n&apos;utilise aucun cookie de suivi ni publicitaire.</p>
        <p className="flex items-center justify-center gap-4 flex-wrap">
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
