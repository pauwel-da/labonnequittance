import Link from 'next/link'
import Image from 'next/image'

export default function CguPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex justify-center">
        <Link href="/">
          <Image src="/logo.png" alt="La Bonne Quittance" width={160} height={69} priority />
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8 text-gray-700">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Conditions Générales d'Utilisation</h1>
          <p className="text-sm text-gray-400">Dernière mise à jour : mai 2026</p>
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">1. Mentions légales</h2>
          <p>Le site <strong>labonnequittance.fr</strong> est édité par :</p>
          <ul className="list-none space-y-0.5 text-sm">
            <li><strong>Raison sociale :</strong> D ALMEIDA AYIVI PAUWEL</li>
            <li><strong>SIREN :</strong> 881 458 475</li>
            <li><strong>Adresse :</strong> 64 rue Waldeck Rousseau, 69006 Lyon, France</li>
            <li><strong>Email :</strong> <a href="mailto:contact@labonnequittance.fr" className="text-[#008020] hover:underline">contact@labonnequittance.fr</a></li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">2. Objet</h2>
          <p className="text-sm leading-relaxed">
            La Bonne Quittance est un service en ligne permettant aux bailleurs particuliers de générer, gérer et envoyer des quittances de loyer au format PDF. L'accès au service est gratuit.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">3. Accès au service</h2>
          <p className="text-sm leading-relaxed">
            L'utilisation du service nécessite la création d'un compte. L'utilisateur s'engage à fournir des informations exactes lors de son inscription et à maintenir la confidentialité de ses identifiants de connexion.
          </p>
          <p className="text-sm leading-relaxed">
            L'éditeur se réserve le droit de suspendre ou supprimer tout compte en cas d'utilisation frauduleuse ou contraire aux présentes CGU.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">4. Responsabilités de l'utilisateur</h2>
          <p className="text-sm leading-relaxed">
            L'utilisateur est seul responsable des informations qu'il saisit dans l'application (coordonnées du bailleur, du locataire, montants des loyers, etc.). La Bonne Quittance ne vérifie pas l'exactitude des données renseignées et ne saurait être tenue responsable d'éventuelles erreurs dans les quittances générées.
          </p>
          <p className="text-sm leading-relaxed">
            Il appartient à l'utilisateur de s'assurer que les quittances générées sont conformes à la réglementation en vigueur, notamment la loi n° 89-462 du 6 juillet 1989.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">5. Données personnelles</h2>
          <p className="text-sm leading-relaxed">
            Les données collectées (email, nom, adresse, informations sur les biens et locataires) sont utilisées exclusivement pour le fonctionnement du service. Elles sont hébergées sur des serveurs sécurisés (Supabase) et ne sont jamais vendues ni transmises à des tiers.
          </p>
          <p className="text-sm leading-relaxed">
            Conformément au RGPD, l'utilisateur dispose d'un droit d'accès, de rectification et de suppression de ses données. Pour exercer ce droit, contacter : <a href="mailto:contact@labonnequittance.fr" className="text-[#008020] hover:underline">contact@labonnequittance.fr</a>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">6. Propriété intellectuelle</h2>
          <p className="text-sm leading-relaxed">
            L'ensemble des éléments constituant le site (design, code, logo, textes) est la propriété exclusive de D ALMEIDA AYIVI PAUWEL. Toute reproduction, même partielle, est interdite sans autorisation préalable.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">7. Disponibilité du service</h2>
          <p className="text-sm leading-relaxed">
            L'éditeur s'efforce d'assurer la disponibilité du service mais ne garantit pas une accessibilité ininterrompue. Des interruptions peuvent survenir pour maintenance ou pour des raisons techniques indépendantes de sa volonté.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">8. Modification des CGU</h2>
          <p className="text-sm leading-relaxed">
            L'éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification significative. La poursuite de l'utilisation du service vaut acceptation des nouvelles conditions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">9. Droit applicable</h2>
          <p className="text-sm leading-relaxed">
            Les présentes CGU sont soumises au droit français. En cas de litige, les tribunaux compétents sont ceux du ressort de Lyon.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">10. Contact</h2>
          <p className="text-sm leading-relaxed">
            Pour toute question relative aux présentes CGU : <a href="mailto:contact@labonnequittance.fr" className="text-[#008020] hover:underline">contact@labonnequittance.fr</a>
          </p>
        </section>

        <div className="pt-4 border-t border-gray-100">
          <Link href="/" className="text-sm text-[#008020] hover:underline">← Retour à l'accueil</Link>
        </div>
      </main>
    </div>
  )
}
