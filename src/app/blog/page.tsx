import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Blog — La Bonne Quittance',
  description: 'Conseils pratiques pour les bailleurs : quittances de loyer, obligations légales, gestion locative.',
}

const articles = [
  {
    slug: 'comment-faire-quittance-de-loyer',
    titre: 'Comment faire une (bonne) quittance de loyer ?',
    description: 'Tout ce qu'il faut savoir pour rédiger une quittance de loyer conforme : mentions obligatoires, aspect légal, et bonnes pratiques.',
    date: 'Mai 2026',
    tempsLecture: '5 min',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex justify-center">
        <Link href="/">
          <Image src="/logo.png" alt="La Bonne Quittance" width={160} height={69} priority />
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog</h1>
        <p className="text-gray-500 mb-10">Conseils pratiques pour les bailleurs particuliers.</p>

        <div className="space-y-4">
          {articles.map(a => (
            <Link key={a.slug} href={`/blog/${a.slug}`}
              className="block bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                <span>{a.date}</span>
                <span>·</span>
                <span>{a.tempsLecture} de lecture</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">{a.titre}</h2>
              <p className="text-sm text-gray-500">{a.description}</p>
              <span className="inline-block mt-4 text-sm font-medium text-[#008020] hover:underline">
                Lire l'article →
              </span>
            </Link>
          ))}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100 mt-10">
        <Link href="/" className="hover:underline">← Retour à l'accueil</Link>
      </footer>
    </div>
  )
}
