import Image from 'next/image'
import Link from 'next/link'
import { FileText, Send, PenLine, ChevronRight } from 'lucide-react'
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

const features = [
  {
    icon: FileText,
    title: 'Quittances PDF conformes',
    desc: 'Générées en 1 clic, conformes à la loi du 6 juillet 1989.',
  },
  {
    icon: PenLine,
    title: 'Signature numérique',
    desc: 'Apposez votre signature sur chaque quittance directement depuis l\'app.',
  },
  {
    icon: Send,
    title: 'Envoi direct au locataire',
    desc: 'Envoyez par email en 1 clic, avec vous en copie si vous le souhaitez.',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center px-6 pt-10 lg:pt-16 pb-0 text-center">

        <Image
          src="/logo.png"
          alt="La Bonne Quittance"
          width={300}
          height={129}
          priority
          className="mt-6 mb-6 lg:mt-0 lg:mb-8 lg:w-[340px]"
        />

        <span className="inline-flex items-center gap-2 bg-green-50 text-[#008020] text-xs font-semibold px-4 py-1.5 rounded-full border border-green-200 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#008020] inline-block" />
          100 % gratuit · Sans abonnement
        </span>

        <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight max-w-xl">
          Fini les quittances Word<br className="hidden lg:block" /> chaque mois
        </h1>
        <p className="text-gray-500 text-base lg:text-lg max-w-sm lg:max-w-lg mb-10">
          Générez et envoyez vos quittances de loyer en PDF en 1 clic.
          Signature numérique incluse. Aucune installation.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:justify-center mb-8 lg:mb-10">
          <Link
            href="/signup"
            className="bg-[#008020] hover:bg-green-800 text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-colors"
          >
            Créer un compte gratuit
          </Link>
          <Link
            href="/login"
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-8 py-3.5 rounded-xl text-sm transition-colors"
          >
            Se connecter
          </Link>
        </div>

        {/* ── Signaux de réassurance ───────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-10 text-sm text-gray-400">
          <span className="flex items-center gap-1.5"><span className="text-[#008020] font-bold">✓</span> Gratuit pour toujours</span>
          <span className="flex items-center gap-1.5"><span className="text-[#008020] font-bold">✓</span> Aucune carte requise</span>
          <span className="flex items-center gap-1.5"><span className="text-[#008020] font-bold">✓</span> Prêt en 30 secondes</span>
        </div>

        {/* ── Captures d'écran ────────────────────────────────────────── */}
        <AppScreenshots />

        {/* ── Comment ça marche ────────────────────────────────────────── */}
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

        {/* ── Features ────────────────────────────────────────────────── */}
        <div className="w-full max-w-3xl border-t border-gray-100 pt-12 mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">Tout ce qu&apos;il vous faut</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {features.map((f) => (
              <div key={f.title} className="flex flex-col gap-4 border border-gray-100 rounded-2xl px-5 py-5">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                  <f.icon size={18} className="text-[#008020]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">{f.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Second CTA ──────────────────────────────────────────────── */}
        <div className="w-full max-w-3xl bg-[#008020] rounded-2xl px-8 py-10 mb-12 text-center">
          <p className="text-2xl font-bold text-white mb-2">Prêt à gagner du temps ?</p>
          <p className="text-green-100 text-sm mb-6">Créez votre compte en 30 secondes. C&apos;est gratuit, sans engagement.</p>
          <Link
            href="/signup"
            className="inline-block bg-white text-[#008020] font-semibold px-8 py-3.5 rounded-xl text-sm hover:bg-green-50 transition-colors"
          >
            Créer mon compte gratuit →
          </Link>
        </div>

      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
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
