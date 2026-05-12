import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Bailleur : comment remplir l\'attestation de loyer CAF ? — La Bonne Quittance',
  description: 'Votre locataire touche les APL, l\'ALF ou l\'ALS ? Découvrez comment remplir le Cerfa 10842 en tant que bailleur : champs obligatoires, délais et conseils.',
}

export default function ArticlePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex justify-center">
        <Link href="/">
          <Image src="/logo.png" alt="La Bonne Quittance" width={160} height={69} priority />
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <p className="text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:underline">Accueil</Link>
          {' '} › {' '}
          <Link href="/blog" className="hover:underline">Blog</Link>
          {' '} › {' '}
          <span className="text-gray-600">Attestation CAF bailleur</span>
        </p>

        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <span>Mai 2026</span>
            <span>·</span>
            <span>4 min de lecture</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
            Bailleur : comment remplir l&apos;attestation de loyer CAF ?
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            Votre locataire perçoit les APL, l&apos;ALF ou l&apos;ALS ? La CAF vous demande de remplir une attestation de loyer. Voici exactement ce que vous devez faire en tant que bailleur.
          </p>
        </div>

        <article className="space-y-8 text-gray-700">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Pourquoi la CAF demande cette attestation ?</h2>
            <p className="leading-relaxed">
              Lorsqu&apos;un locataire fait une demande d&apos;aide au logement (APL, ALF ou ALS), la CAF doit vérifier la réalité de la location : existence du bail, montant du loyer, identité du bailleur. C&apos;est le rôle de l&apos;<strong>attestation de loyer</strong>, aussi appelée <strong>Cerfa n° 10842*07</strong>.
            </p>
            <p className="leading-relaxed mt-3">
              Ce document est rempli et signé par le bailleur, puis transmis à la CAF — soit par le locataire, soit directement par le propriétaire selon les cas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Le bailleur est-il obligé de remplir ce document ?</h2>
            <p className="leading-relaxed">
              Oui. Refuser de remplir l&apos;attestation de loyer CAF peut avoir des conséquences : le locataire ne perçoit pas ses aides, ce qui peut compromettre sa capacité à payer le loyer. Il est donc dans l&apos;intérêt du bailleur de coopérer rapidement.
            </p>
            <p className="leading-relaxed mt-3">
              Par ailleurs, certaines conventions CAF imposent au bailleur de déclarer directement la situation locative. Dans ce cas, le refus peut entraîner des sanctions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Les informations à renseigner</h2>
            <p className="leading-relaxed mb-4">Le Cerfa 10842 demande au bailleur de renseigner :</p>
            <ul className="space-y-2">
              {[
                { label: 'Identité du bailleur', detail: 'Nom, prénom, adresse complète' },
                { label: 'Identité du locataire', detail: 'Nom, prénom' },
                { label: 'Adresse du logement loué', detail: 'Adresse complète du bien' },
                { label: 'Type de logement', detail: 'Meublé ou non meublé, surface habitable' },
                { label: 'Date d\'entrée dans les lieux', detail: 'Date de début du bail' },
                { label: 'Montant du loyer', detail: 'Loyer mensuel hors charges' },
                { label: 'Montant des charges', detail: 'Charges mensuelles' },
                { label: 'Lien de parenté', detail: 'Indiquer si le bailleur est un proche du locataire (cela peut exclure les aides)' },
                { label: 'Signature du bailleur', detail: 'Manuscrite ou numérique' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-[#008020] text-white text-xs flex items-center justify-center shrink-0 font-bold">{i + 1}</span>
                  <div>
                    <span className="font-semibold text-gray-900">{item.label}</span>
                    <span className="text-gray-500"> — {item.detail}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Point d&apos;attention : le lien de parenté</h2>
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl px-5 py-4 text-sm leading-relaxed">
              <p>
                Si le bailleur est un <strong>ascendant ou descendant</strong> du locataire (parent, enfant, grand-parent), le locataire ne peut pas percevoir les APL. La CAF vérifie systématiquement ce point. Indiquez honnêtement votre lien de parenté dans le formulaire.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Tiers payant : quand la CAF verse directement au bailleur</h2>
            <p className="leading-relaxed">
              La CAF peut verser l&apos;aide directement au bailleur — c&apos;est le <strong>tiers payant</strong>. Ce dispositif est accessible pour tous les profils de locataires. Pour en bénéficier, le bailleur doit en faire la demande via un document complémentaire : le <strong>Cerfa n° 11362*04</strong>. Il s&apos;engage alors à déduire le montant de l&apos;aide du loyer réclamé au locataire.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Combien de temps pour traiter la demande ?</h2>
            <p className="leading-relaxed">
              Une fois l&apos;attestation transmise, la CAF dispose généralement de <strong>1 à 2 mois</strong> pour instruire le dossier. Les aides sont versées avec un mois de décalage. Il est donc conseillé de remplir et renvoyer le document le plus rapidement possible après la demande du locataire.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Les erreurs fréquentes</h2>
            <ul className="space-y-2 text-sm">
              {[
                'Indiquer le mauvais montant de loyer : la CAF peut recalculer les aides à la baisse',
                'Oublier de mentionner les charges séparément du loyer',
                'Ne pas mettre à jour l\'attestation en cas d\'augmentation de loyer',
                'Signer sans vérifier la date d\'entrée dans les lieux',
                'Confondre attestation de loyer et quittance de loyer : ce sont deux documents distincts',
              ].map((err, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5 shrink-0">✕</span>
                  <span>{err}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Attestation CAF et quittance de loyer : ne pas confondre</h2>
            <p className="leading-relaxed">
              Ces deux documents sont souvent confondus, mais ils n&apos;ont pas le même rôle :
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-2">Quittance de loyer</p>
                <p className="text-gray-500">Reçu mensuel attestant du paiement du loyer. Remis au locataire après chaque paiement.</p>
                <Link href="/blog/comment-faire-quittance-de-loyer" className="inline-block mt-3 text-[#008020] text-xs hover:underline">
                  Lire notre article →
                </Link>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-2">Attestation CAF (Cerfa 10842)</p>
                <p className="text-gray-500">Document annuel ou ponctuel rempli par le bailleur pour permettre au locataire de percevoir les APL.</p>
              </div>
            </div>
          </section>

        </article>

        {/* CTA */}
        <div className="mt-10 bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <p className="font-semibold text-gray-900 mb-1">Gérez quittances et documents locatifs en 1 clic</p>
          <p className="text-sm text-gray-500 mb-4">Outil gratuit pour les bailleurs particuliers. PDF conforme, envoi par email inclus.</p>
          <Link href="/signup"
            className="inline-block bg-[#008020] hover:bg-green-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
            Créer un compte gratuit
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <Link href="/blog" className="text-sm text-[#008020] hover:underline">← Retour au blog</Link>
        </div>

      </main>
    </div>
  )
}
