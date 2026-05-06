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
    title: 'Gérez vos biens et locataires',
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
      <main className="flex-1 flex flex-col items-center px-6 py-14 text-center">

        {/* Logo */}
        <Image
          src="/logo.png"
          alt="La Bonne Quittance"
          width={260}
          height={112}
          priority
          className="mb-8"
        />

        {/* Badge gratuit */}
        <span className="inline-flex items-center gap-1.5 bg-green-50 text-[#008020] text-xs font-semibold px-3 py-1 rounded-full border border-green-200 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#008020] inline-block" />
          100 % gratuit — sans abonnement
        </span>

        {/* Titre */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-snug">
          Vos quittances de loyer<br />en quelques secondes
        </h1>
        <p className="text-gray-500 text-base max-w-xs mb-10">
          L'outil simple et gratuit pour les bailleurs qui veulent gagner du temps.
        </p>

        {/* CTA */}
        <div className="flex flex-col gap-3 w-full max-w-xs mb-14">
          <Link
            href="/signup"
            className="bg-[#008020] hover:bg-green-800 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
          >
            Créer un compte gratuit
          </Link>
          <Link
            href="/login"
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl text-sm transition-colors"
          >
            Se connecter
          </Link>
        </div>

        {/* Fonctionnalités */}
        <div className="w-full max-w-sm space-y-3 text-left">
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-4 bg-gray-50 rounded-2xl px-4 py-4">
              <span className="text-2xl mt-0.5">{f.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </main>

      <footer className="py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} La Bonne Quittance · Gratuit pour tous les bailleurs
      </footer>
    </div>
  )
}
