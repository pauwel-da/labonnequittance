import Link from 'next/link'
import Image from 'next/image'

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex justify-center">
        <Link href="/">
          <Image src="/logo.svg" alt="La Bonne Quittance" width={160} height={57} priority />
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8 text-gray-700">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Politique de confidentialité</h1>
          <p className="text-sm text-gray-400">Dernière mise à jour : octobre 2026</p>
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">1. Responsable du traitement</h2>
          <ul className="list-none space-y-0.5 text-sm">
            <li><strong>Raison sociale :</strong> AYIVI</li>
            <li><strong>Forme juridique :</strong> Société par actions simplifiée (SAS)</li>
            <li><strong>SIREN :</strong> 108 084 625</li>
            <li><strong>Adresse :</strong> 138 Avenue Victor Hugo, 75116 Paris, France</li>
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
            <li>Uniquement avec votre accord : la mesure de l&apos;efficacité de nos publicités sur Facebook et Instagram (voir section 7)</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">4. Base légale</h2>
          <p className="text-sm leading-relaxed">
            Le traitement des données repose sur l'exécution du contrat (fourniture du service) et le consentement de l'utilisateur lors de la création de son compte. La transmission de votre inscription à Meta (section 7) repose uniquement sur votre consentement, donné en cochant la case prévue à cet effet.
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

        <section id="meta" className="space-y-2 scroll-mt-6">
          <h2 className="text-lg font-semibold text-gray-900">7. Mesure de nos publicités (Meta)</h2>
          <p className="text-sm leading-relaxed">
            Si vous cochez la case prévue lors de la création de votre compte, et uniquement dans ce cas, nous informons Meta Platforms Ireland Ltd (Facebook, Instagram) de votre inscription. Cela nous permet de savoir si nos publicités amènent de nouveaux utilisateurs.
          </p>
          <p className="text-sm leading-relaxed">Les données transmises, une seule fois, au moment de l&apos;inscription :</p>
          <ul className="list-disc list-inside text-sm space-y-1 pl-2">
            <li>l&apos;événement « inscription » et sa date</li>
            <li>votre adresse email et un identifiant de compte, chiffrés (hachage SHA-256) avant l&apos;envoi</li>
            <li>votre adresse IP et le type de navigateur utilisé</li>
          </ul>
          <p className="text-sm leading-relaxed">
            Aucune donnée sur vos biens, vos locataires ou vos quittances n&apos;est transmise. L&apos;envoi se fait directement depuis nos serveurs : aucun script ni cookie Meta n&apos;est déposé sur le site. Meta traite ces données selon sa propre politique de confidentialité et peut les transférer hors de l&apos;Union européenne dans le cadre du Data Privacy Framework UE–États-Unis.
          </p>
          <p className="text-sm leading-relaxed">
            Cocher la case est facultatif et n&apos;a aucune incidence sur le service. Vous pouvez retirer votre consentement à tout moment en écrivant à <a href="mailto:contact@labonnequittance.fr" className="text-[#008020] hover:underline">contact@labonnequittance.fr</a>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">8. Vos droits</h2>
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
          <h2 className="text-lg font-semibold text-gray-900">9. Cookies</h2>
          <p className="text-sm leading-relaxed">
            Le site n'utilise pas de cookies publicitaires ou de tracking. Simple Analytics, notre outil de mesure d'audience, ne dépose aucun cookie et ne collecte aucune donnée personnelle identifiable. La mesure de nos publicités décrite à la section 7 se fait de serveur à serveur, sans cookie.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">10. Sécurité</h2>
          <p className="text-sm leading-relaxed">
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou destruction : chiffrement des communications (HTTPS), authentification sécurisée, accès aux données restreint par des règles de sécurité au niveau de la base de données (Row Level Security).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">11. Modifications</h2>
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
