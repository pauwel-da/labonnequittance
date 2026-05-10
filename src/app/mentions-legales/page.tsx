import Link from 'next/link'
import Image from 'next/image'

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex justify-center">
        <Link href="/">
          <Image src="/logo.png" alt="La Bonne Quittance" width={160} height={69} priority />
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8 text-gray-700">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentions légales</h1>
          <p className="text-sm text-gray-400">Dernière mise à jour : mai 2026</p>
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">Éditeur du site</h2>
          <ul className="list-none space-y-0.5 text-sm">
            <li><strong>Raison sociale :</strong> D ALMEIDA AYIVI PAUWEL</li>
            <li><strong>SIREN :</strong> 881 458 475</li>
            <li><strong>Adresse :</strong> 64 rue Waldeck Rousseau, 69006 Lyon, France</li>
            <li><strong>Email :</strong> <a href="mailto:contact@labonnequittance.fr" className="text-[#008020] hover:underline">contact@labonnequittance.fr</a></li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">Directeur de la publication</h2>
          <p className="text-sm">D ALMEIDA AYIVI PAUWEL</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">Hébergement</h2>
          <ul className="list-none space-y-0.5 text-sm">
            <li><strong>Hébergeur :</strong> Vercel Inc.</li>
            <li><strong>Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</li>
            <li><strong>Site :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#008020] hover:underline">vercel.com</a></li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">Données personnelles et base de données</h2>
          <ul className="list-none space-y-0.5 text-sm">
            <li><strong>Prestataire :</strong> Supabase Inc.</li>
            <li><strong>Adresse :</strong> 970 Toa Payoh North, #07-04, Singapour 318992</li>
            <li><strong>Site :</strong> <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[#008020] hover:underline">supabase.com</a></li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">Propriété intellectuelle</h2>
          <p className="text-sm leading-relaxed">
            L'ensemble des contenus présents sur le site labonnequittance.fr (textes, images, logo, code source) est la propriété exclusive de D ALMEIDA AYIVI PAUWEL et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle. Toute reproduction, même partielle, est interdite sans autorisation préalable écrite.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">Cookies et mesure d'audience</h2>
          <p className="text-sm leading-relaxed">
            Le site utilise Simple Analytics, un outil de mesure d'audience respectueux de la vie privée, qui ne dépose aucun cookie et ne collecte aucune donnée personnelle identifiable.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">Contact</h2>
          <p className="text-sm leading-relaxed">
            Pour toute question : <a href="mailto:contact@labonnequittance.fr" className="text-[#008020] hover:underline">contact@labonnequittance.fr</a>
          </p>
        </section>

        <div className="pt-4 border-t border-gray-100">
          <Link href="/" className="text-sm text-[#008020] hover:underline">← Retour à l'accueil</Link>
        </div>
      </main>
    </div>
  )
}
