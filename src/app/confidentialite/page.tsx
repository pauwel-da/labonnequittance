import Link from 'next/link'
import Image from 'next/image'

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex justify-center">
        <Link href="/">
          <Image src="/logo.png" alt="La Bonne Quittance" width={160} height={69} priority />
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8 text-gray-700">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Politique de confidentialité</h1>
          <p className="text-sm text-gray-400">Dernière mise à jour : mai 2026</p>
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">1. Responsable du traitement</h2>
          <ul className="list-none space-y-0.5 text-sm">
            <li><strong>Raison sociale :</strong> D ALMEIDA AYIVI PAUWEL</li>
            <li><strong>SIREN :</strong> 881 458 475</li>
            <li><strong>Adresse :</strong> 64 rue Waldeck Rousseau, 69006 Lyon, France</li>
            <li><strong>Email :</strong> <a href="mailto:contact@labonnequittance.fr" className="text-[#008020] hover:underline">contact@labonnequittance.fr</a></li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">2. Données collectées</h2>
          <p className="text-sm leading-relaxed">Dans le cadre de l'utilisation du service, nous collectons les données suivantes :</p>
          <ul className="list-disc list-inside text-sm space-y-1 pl-2">
            <li><strong>Données de compte :</strong> adresse email, nom, prénom</li>
            <li><strong>Données de profil bailleur :</strong> adresse postale, signature numérique</li>
            <li><strong>Données relatives aux biens :</strong> adresse, type de location</li>
            <li><strong>Données relatives aux locataires :</strong> nom, prénom, email, montant du loyer et des charges, date d'entrée</li>
          </ul>
          <p className="text-sm leading-relaxed">Aucune donnée bancaire n'est collectée.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">3. Finalités du traitement</h2>
          <p className="text-sm leading-relaxed">Les données sont utilisées exclusivement pour :</p>
          <ul className="list-disc list-inside text-sm space-y-1 pl-2">
            <li>La création et la gestion de votre compte utilisateur</li>
            <li>La génération des quittances de loyer au format PDF</li>
            <li>L'envoi des quittances par email à vos locataires</li>
            <li>L'amélioration du service via des statistiques d'usage anonymes</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">4. Base légale</h2>
          <p className="text-sm leading-relaxed">
            Le traitement des données repose sur l'exécution du contrat (fourniture du service) et le consentement de l'utilisateur lors de la création de son compte.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">5. Durée de conservation</h2>
          <p className="text-sm leading-relaxed">
            Les données sont conservées pendant toute la durée d'activité du compte. En cas de suppression du compte, les données sont effacées dans un délai de 30 jours.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">6. Sous-traitants et transferts</h2>
          <p className="text-sm leading-relaxed">Nous faisons appel aux prestataires suivants :</p>
          <ul className="list-disc list-inside text-sm space-y-1 pl-2">
            <li><strong>Supabase</strong> — hébergement de la base de données et authentification</li>
            <li><strong>Vercel</strong> — hébergement de l'application web</li>
            <li><strong>Amazon Web Services (AWS)</strong> — génération des PDF via Lambda</li>
            <li><strong>Brevo</strong> — envoi des emails transactionnels</li>
            <li><strong>Simple Analytics</strong> — mesure d'audience sans cookies ni données personnelles</li>
          </ul>
          <p className="text-sm leading-relaxed mt-1">
            Ces prestataires agissent en tant que sous-traitants et sont soumis à des obligations de confidentialité. Certains sont établis hors de l'Union Européenne mais offrent des garanties adéquates (clauses contractuelles types, Privacy Shield ou équivalent).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">7. Vos droits</h2>
          <p className="text-sm leading-relaxed">Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul className="list-disc list-inside text-sm space-y-1 pl-2">
            <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
            <li><strong>Droit de rectification :</strong> corriger des données inexactes</li>
            <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
            <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
            <li><strong>Droit d'opposition :</strong> vous opposer à certains traitements</li>
          </ul>
          <p className="text-sm leading-relaxed mt-1">
            Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@labonnequittance.fr" className="text-[#008020] hover:underline">contact@labonnequittance.fr</a>. Nous nous engageons à répondre dans un délai d'un mois.
          </p>
          <p className="text-sm leading-relaxed">
            Vous disposez également du droit d'introduire une réclamation auprès de la <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-[#008020] hover:underline">CNIL</a>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">8. Cookies</h2>
          <p className="text-sm leading-relaxed">
            Le site n'utilise pas de cookies publicitaires ou de tracking. Simple Analytics, notre outil de mesure d'audience, ne dépose aucun cookie et ne collecte aucune donnée personnelle identifiable.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">9. Sécurité</h2>
          <p className="text-sm leading-relaxed">
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou destruction : chiffrement des communications (HTTPS), authentification sécurisée, accès aux données restreint par des règles de sécurité au niveau de la base de données (Row Level Security).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">10. Modifications</h2>
          <p className="text-sm leading-relaxed">
            Cette politique peut être mise à jour à tout moment. La date de dernière modification est indiquée en haut de page. Nous vous informerons de tout changement significatif par email.
          </p>
        </section>

        <div className="pt-4 border-t border-gray-100">
          <Link href="/" className="text-sm text-[#008020] hover:underline">← Retour à l'accueil</Link>
        </div>
      </main>
    </div>
  )
}
