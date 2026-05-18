import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Blog — La Bonne Quittance',
  description: 'Conseils pratiques pour les bailleurs : quittances de loyer, obligations légales, gestion locative.',
}

const articles = [
  {
    slug: 'quittance-vs-recu-loyer',
    titre: 'Quittance de loyer vs reçu de loyer : quelle différence ?',
    description: "Ces deux documents sont souvent confondus. Pourtant ils n'ont pas la même valeur juridique. Voici ce que tout bailleur doit savoir.",
    date: '18 mai 2026',
    tempsLecture: '2 min',
    tag: 'Quittances',
  },
  {
    slug: 'attestation-loyer-caf-bailleur',
    titre: 'Bailleur : comment remplir l\'attestation de loyer CAF ?',
    description: "Votre locataire touche les APL, l'ALF ou l'ALS ? Découvrez comment remplir le Cerfa 10842 en tant que bailleur : champs obligatoires, délais et erreurs à éviter.",
    date: '14 mai 2026',
    tempsLecture: '4 min',
    tag: 'CAF & Aides',
  },
  {
    slug: 'comment-faire-quittance-de-loyer',
    titre: 'Comment faire une (bonne) quittance de loyer ?',
    description: "Tout ce qu'il faut savoir pour rédiger une quittance de loyer conforme : mentions obligatoires, aspect légal, et bonnes pratiques.",
    date: '14 mai 2026',
    tempsLecture: '5 min',
    tag: 'Quittances',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link href="/">
          <Image src="/logo.png" alt="La Bonne Quittance" width={140} height={60} priority />
        </Link>
        <Link href="/signup" className="text-sm font-medium text-[#008020] border border-[#008020] hover:bg-green-50 px-4 py-2 rounded-xl transition-colors">
          Espace bailleur →
        </Link>
      </header>

      {/* Hero */}
      <div className="bg-[#008020] text-white px-4 py-12 text-center">
        <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
          Blog
        </span>
        <h1 className="text-3xl font-bold mb-3">Conseils pour les bailleurs</h1>
        <p className="text-green-100 text-base max-w-md mx-auto">
          Obligations légales, quittances, aides au logement.<br />Tout ce qu&apos;un bailleur particulier doit savoir.
        </p>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="space-y-5">
          {articles.map((a, i) => (
            <Link key={a.slug} href={`/blog/${a.slug}`}
              className="group block bg-white rounded-2xl border border-gray-100 p-6 hover:border-[#008020] hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-block bg-green-50 text-[#008020] text-xs font-semibold px-2.5 py-1 rounded-full">
                  {a.tag}
                </span>
                {i === 0 && (
                  <span className="inline-block bg-[#008020] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    Nouveau
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#008020] transition-colors">
                {a.titre}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">{a.description}</p>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{a.date}</span>
                  <span>·</span>
                  <span>{a.tempsLecture} de lecture</span>
                </div>
                <span className="text-sm font-semibold text-[#008020] group-hover:underline">
                  Lire →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100">
        <Link href="/" className="hover:text-gray-600 hover:underline transition-colors">← Retour à l&apos;accueil</Link>
      </footer>
    </div>
  )
}
