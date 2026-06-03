import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, FileText, Send, Shield, Clock, Star } from 'lucide-react'
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
    desc: "Transmettez directement à votre locataire depuis l'application, avec votre signature.",
  },
]

const features = [
  {
    icon: FileText,
    title: 'Quittance PDF conforme',
    desc: '9 mentions légales obligatoires, signature numérique intégrée, document infalsifiable.',
  },
  {
    icon: Send,
    title: 'Envoi email en 1 clic',
    desc: 'Votre locataire reçoit sa quittance directement dans sa boîte mail, sans manipulation.',
  },
  {
    icon: Shield,
    title: 'Attestation CAF incluse',
    desc: 'Cerfa n° 10842 pré-rempli automatiquement avec vos données, sans rien ressaisir.',
  },
  {
    icon: Clock,
    title: '30 secondes chrono',
    desc: "De l'inscription à la première quittance envoyée, en moins d'une minute.",
  },
]

const reviews = [
  { name: 'Dibrilou', text: "J'ai testé, j'ai adopté. Excellent service pour les propriétaires qui visent l'efficacité, je ne peux que recommander." },
  { name: 'Ferroudja', text: 'Simple à utiliser et très efficace.' },
  { name: 'Abdelwahad', text: 'Application vraiment intuitive, je recommande.' },
  { name: 'Tim', text: 'Très utile. On peut envoyer les quittances directement à ses locataires.' },
  { name: 'Tim', text: "L'application est plutôt simple d'utilisation et très intuitive." },
]

const GOOGLE_REVIEWS_URL = 'https://share.google/xKaaXjgXP5ZjBHYF6'

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
    return data ? Number(data) + 400 : null
  } catch {
    return null
  }
}

export default async function Home() {
  const userCount = await getUserCount()

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── HEADER ── */}
      <header className="bg-white border-b border-gray-100 px-6 py-6 flex justify-center">
        <Image
          src="/logo.png"
          alt="La Bonne Quittance"
          width={200}
          height={86}
          sizes="200px"
          priority
        />
      </header>

      {/* ── HERO ── */}
      <section className="bg-[#008020] text-white px-6 pt-14 pb-20 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full border border-white/30 mb-6">
            100% gratuit · Sans abonnement · Sans carte bancaire
          </span>

          <h1 className="text-3xl lg:text-5xl font-bold mb-5 leading-tight">
            Fini les quittances Word<br className="hidden sm:block" /> chaque mois
          </h1>
          <p className="text-green-100 text-base lg:text-lg max-w-lg mx-auto mb-8 leading-relaxed">
            Générez et envoyez vos quittances PDF en 1 clic.
            Attestation CAF incluse. Signature numérique. Conforme légalement.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link
              href="/signup"
              className="bg-white text-[#008020] font-semibold px-8 py-3.5 rounded-xl text-sm hover:bg-green-50 transition-colors"
            >
              Créer un compte gratuit
            </Link>
            <Link
              href="/login"
              className="border border-white/40 text-white font-medium px-8 py-3.5 rounded-xl text-sm hover:bg-white/10 transition-colors"
            >
              Se connecter
            </Link>
          </div>

          {userCount && userCount > 0 && (
            <p className="text-green-200 text-sm mb-4">
              Déjà <span className="font-semibold text-white">{userCount}+ bailleurs</span> inscrits
            </p>
          )}

          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-green-100 text-xs hover:text-white transition-colors"
          >
            <span className="flex gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={12} className="fill-yellow-300 text-yellow-300" />
              ))}
            </span>
            <span className="font-medium">Noté 5,0 sur Google</span>
          </a>
        </div>
      </section>

      {/* ── SCREENSHOTS ── */}
      <section className="bg-white px-6 pt-16 pb-8 flex flex-col items-center">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tout depuis une seule interface</h2>
          <p className="text-sm text-gray-500">Vos biens, vos locataires, vos quittances. En un coup d&apos;œil.</p>
        </div>
        <AppScreenshots />
      </section>

      {/* ── REVIEWS ── */}
      <section className="bg-white px-6 pb-16 pt-4 border-t border-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                ))}
              </span>
              <span className="text-sm font-semibold text-gray-900">Noté 5,0 sur Google</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center">Ils utilisent déjà La Bonne Quittance</h2>
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

          <div className="text-center mt-8">
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
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="bg-gray-50 px-6 py-16 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 text-center mb-2">Fonctionnement</p>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Simple comme bonjour</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {steps.map((s) => (
              <div key={s.number} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#008020] text-white text-sm font-bold flex items-center justify-center mb-4">
                  {s.number}
                </div>
                <p className="font-semibold text-gray-900 mb-2">{s.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="bg-white px-6 py-16 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 text-center mb-2">Fonctionnalités</p>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Tout ce qu&apos;il faut, rien de plus</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="flex gap-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <div className="bg-green-100 rounded-xl p-2.5 shrink-0 h-fit">
                    <Icon size={18} className="text-[#008020]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1 text-sm">{f.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-gray-50 px-6 py-16 border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 text-center mb-2">FAQ</p>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Questions fréquentes</h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="group bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold text-gray-900 list-none">
                  {faq.q}
                  <ChevronRight size={16} className="text-gray-400 shrink-0 ml-3 transition-transform group-open:rotate-90" />
                </summary>
                <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="bg-[#008020] px-6 py-16 text-center">
        <div className="max-w-xl mx-auto">
          <p className="text-2xl font-bold text-white mb-3">Prêt à gagner du temps ?</p>
          <p className="text-green-100 text-sm mb-8">Créez votre compte en 30 secondes. C&apos;est gratuit, sans engagement.</p>
          <Link
            href="/signup"
            className="inline-block bg-white text-[#008020] font-semibold px-8 py-3.5 rounded-xl text-sm hover:bg-green-50 transition-colors"
          >
            Créer mon compte gratuit →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white py-8 text-center text-xs text-gray-400 border-t border-gray-100 space-y-2">
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
