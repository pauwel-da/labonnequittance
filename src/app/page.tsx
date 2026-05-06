import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <Image
          src="/logo.png"
          alt="La Bonne Quittance"
          width={280}
          height={120}
          priority
          className="mb-8"
        />

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Vos quittances de loyer<br />en quelques secondes
        </h1>
        <p className="text-gray-500 text-base max-w-xs mb-10">
          Générez des quittances PDF professionnelles, gérez vos biens et vos locataires — simplement.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href="/signup"
            className="bg-[#008020] hover:bg-green-800 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
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
      </main>

      <footer className="py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} La Bonne Quittance
      </footer>
    </div>
  )
}
