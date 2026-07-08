import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import SimulateurCapaciteEmprunt from './SimulateurCapaciteEmprunt'

export const metadata: Metadata = {
  title: 'Simulateur capacité d\'emprunt immobilier — La Bonne Quittance',
  description:
    'Calculez gratuitement votre capacité d\'emprunt immobilier en quelques secondes. Simulation basée sur vos revenus, charges et apport. Taux à jour 2026.',
}

export default function SimulateurPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/40 to-white flex flex-col">

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="La Bonne Quittance"
              width={180}
              height={77}
              className="h-auto"
              style={{ width: 'clamp(140px, 20vw, 180px)' }}
              priority
            />
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium text-[#008020] hover:underline"
          >
            Créer un compte
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 sm:px-6 pt-10 lg:pt-14 pb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#008020] mb-3">
          Outil gratuit
        </p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-3">
          Capacité d&apos;emprunt{' '}
          <span className="bg-gradient-to-r from-[#008020] to-emerald-500 bg-clip-text text-transparent">
            immobilier
          </span>
        </h1>
        <p className="text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
          Découvrez combien vous pouvez emprunter selon vos revenus et vos charges.
          Calcul instantané, gratuit, sans inscription.
        </p>
      </section>

      {/* Simulateur */}
      <section className="px-4 sm:px-6 pb-16 lg:pb-24 flex-1">
        <SimulateurCapaciteEmprunt />
      </section>

      {/* Bloc SEO */}
      <section className="bg-white border-t border-gray-100 px-4 sm:px-6 py-12">
        <div className="max-w-3xl mx-auto prose prose-sm prose-gray">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Comment calculer sa capacité d&apos;emprunt ?</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            La capacité d&apos;emprunt immobilier représente le montant maximum que vous pouvez emprunter auprès d&apos;une banque, compte tenu de vos revenus et de vos charges. En France, le <strong>taux d&apos;endettement maximum est fixé à 35 % assurance comprise</strong> depuis les recommandations du Haut Conseil de Stabilité Financière (HCSF).
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            La formule de base est la suivante : <strong>mensualité maximale = revenus nets × 35 % − charges existantes</strong>. À partir de cette mensualité, le capital empruntable dépend du taux d&apos;intérêt et de la durée choisie.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Les <strong>revenus locatifs</strong> sont pondérés à 70 % par la plupart des banques françaises, pour tenir compte du risque de vacance locative. L&apos;assurance emprunteur est estimée à 0,25 % du capital par an, ce qui est une valeur standard pour un profil non-fumeur entre 30 et 45 ans.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-6 text-center text-xs text-gray-400 border-t border-gray-100">
        <p>
          © {new Date().getFullYear()} La Bonne Quittance ·{' '}
          <Link href="/cgu" className="hover:text-gray-600 hover:underline">CGU</Link>
          {' · '}
          <Link href="/confidentialite" className="hover:text-gray-600 hover:underline">Confidentialité</Link>
        </p>
      </footer>
    </div>
  )
}
