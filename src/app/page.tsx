import Image from 'next/image'
import Link from 'next/link'

const features = [
  {
    icon: '📄',
    title: 'Quittances PDF en 1 clic',
    desc: 'Générez des quittances conformes et prêtes à envoyer en quelques secondes.',
  },
  {
    icon: '🏠',
    title: 'Gérez biens & locataires',
    desc: 'Centralisez tous vos logements et locataires dans un espace dédié.',
  },
  {
    icon: '✍️',
    title: 'Signature numérique',
    desc: 'Apposez votre signature sur chaque quittance directement depuis l\'application.',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 lg:py-24 text-center">

        {/* Logo */}
        <Image
          src="/logo.png"
          alt="La Bonne Quittance"
          width={240}
          height={103}
          priority
          className="mb-8 lg:w-[320px]"
        />

        {/* Badge */}
        <span className="inline-flex items-center gap-2 bg-green-50 text-[#008020] text-xs font-semibold px-4 py-1.5 rounded-full border border-green-200 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#008020] inline-block" />
          100 % gratuit. Sans abonnement.
        </span>

        {/* Headline */}
        <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight max-w-xl">
          Vos quittances de loyer<br className="hidden lg:block" /> en quelques secondes
        </h1>
        <p className="text-gray-500 text-base lg:text-lg max-w-sm lg:max-w-md mb-10">
          L'outil simple et gratuit pour les bailleurs qui veulent gagner du temps.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:justify-center mb-20 lg:mb-24">
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

        {/* Divider */}
        <div className="w-full max-w-3xl border-t border-gray-100 mb-12" />

        {/* Features */}
        <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {features.map((f) => (
            <div key={f.title} className="flex flex-col gap-3 bg-gray-50 rounded-2xl px-5 py-5">
              <span className="text-2xl">{f.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{f.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100 space-y-2">
        <p>© {new Date().getFullYear()} La Bonne Quittance · Gratuit pour tous les bailleurs</p>
        <p className="flex items-center justify-center gap-4">
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
