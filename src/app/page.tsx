import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">La Bonne Quittance</h1>
        <p className="text-gray-600 mb-8">Gérez vos quittances de loyer simplement.</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors"
          >
            Se connecter
          </Link>
          <Link
            href="/signup"
            className="border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium px-6 py-2 rounded-lg text-sm transition-colors"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  )
}
