import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import ReadingProgress from '@/components/ReadingProgress'
import FaqItem from '@/components/FaqItem'
import BlogHeader from '@/components/BlogHeader'

export const metadata: Metadata = {
  title: 'Bailleur : comment remplir l\'attestation de loyer CAF ? — La Bonne Quittance',
  description: 'Votre locataire touche les APL, l\'ALF ou l\'ALS ? Découvrez comment remplir le Cerfa 10842 en tant que bailleur : champs obligatoires, délais et conseils.',
}

const toc = [
  { id: 'pourquoi', label: 'Pourquoi la CAF demande cette attestation ?' },
  { id: 'obligatoire', label: 'Le bailleur est-il obligé de la remplir ?' },
  { id: 'informations', label: 'Les informations à renseigner' },
  { id: 'parente', label: 'Point d\'attention : le lien de parenté' },
  { id: 'tiers-payant', label: 'Tiers payant : quand la CAF verse au bailleur' },
  { id: 'delais', label: 'Délais de traitement' },
  { id: 'erreurs', label: 'Les erreurs fréquentes' },
  { id: 'difference', label: 'Attestation CAF vs quittance de loyer' },
]

export default function ArticlePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <BlogHeader />

      {/* Hero */}
      <div className="bg-[#008020] text-white px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm mb-4">
            <Link href="/" className="text-green-200 hover:underline">Accueil</Link>
            {' '} › {' '}
            <Link href="/blog" className="text-green-200 hover:underline">Blog</Link>
            {' '} › {' '}
            <span className="text-green-100">Attestation CAF bailleur</span>
          </p>
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">CAF & Aides</span>
          <h1 className="text-3xl font-bold mb-3 leading-tight">Bailleur : comment remplir l&apos;attestation de loyer CAF ?</h1>
          <p className="text-green-100 text-base leading-relaxed mb-5">
            Votre locataire perçoit les APL, l&apos;ALF ou l&apos;ALS ? La CAF vous demande de remplir une attestation de loyer. Voici exactement ce que vous devez faire en tant que bailleur.
          </p>
          <div className="flex items-center gap-3 text-sm text-green-200">
            <span>14 mai 2026</span>
            <span>·</span>
            <span>4 min de lecture</span>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-10">

        {/* Chiffres clés */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { stat: '8', label: 'Champs à renseigner dans le Cerfa 10842' },
            { stat: '1-2 mois', label: 'Délai de traitement par la CAF' },
            { stat: '100%', label: 'Des bailleurs peuvent percevoir directement les APL de leur locataire' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-[#008020]">{s.stat}</p>
              <p className="text-xs text-gray-500 mt-1 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table des matières */}
        <div className="bg-green-50 border border-green-100 rounded-2xl p-5 mb-10">
          <p className="text-sm font-semibold text-[#008020] mb-3">Sommaire</p>
          <ol className="space-y-1.5">
            {toc.map((item, i) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="text-sm text-gray-700 hover:text-[#008020] hover:underline transition-colors">
                  {i + 1}. {item.label}
                </a>
              </li>
            ))}
          </ol>
        </div>

        <article className="space-y-10 text-gray-700">

          <section id="pourquoi">
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Pourquoi la CAF demande cette attestation ?</h2>
            <p className="leading-relaxed">
              Lorsqu&apos;un locataire fait une demande d&apos;aide au logement (APL, ALF ou ALS), la CAF doit vérifier la réalité de la location : existence du bail, montant du loyer, identité du bailleur. C&apos;est le rôle de l&apos;<strong>attestation de loyer</strong>, aussi appelée <strong>Cerfa n° 10842*07</strong>.
            </p>
            <p className="leading-relaxed mt-3">
              Ce document est rempli et signé par le bailleur, puis transmis à la CAF par le locataire.
            </p>
          </section>

          <section id="obligatoire">
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Le bailleur est-il obligé de remplir ce document ?</h2>
            <p className="leading-relaxed">
              Oui. Refuser de remplir l&apos;attestation de loyer CAF peut avoir des conséquences : le locataire ne perçoit pas ses aides, ce qui peut compromettre sa capacité à payer le loyer. Il est donc dans l&apos;intérêt du bailleur de coopérer rapidement.
            </p>
            <p className="leading-relaxed mt-3">
              Par ailleurs, certaines conventions CAF imposent au bailleur de déclarer directement la situation locative. Dans ce cas, le refus peut entraîner des sanctions.
            </p>
          </section>

          <section id="informations">
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Les informations à renseigner</h2>
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

          <section id="parente">
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Point d&apos;attention : le lien de parenté</h2>
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl px-5 py-4 text-sm leading-relaxed">
              <p>
                Si le bailleur est un <strong>ascendant ou descendant</strong>{' '}du locataire (parent, enfant, grand-parent), le locataire ne peut pas percevoir les APL. Ce lien de parenté ne figure pas dans le Cerfa 10842 lui-même, mais la CAF le vérifie par d&apos;autres moyens. En cas de fausse déclaration, le locataire s&apos;expose à un remboursement des aides perçues.
              </p>
            </div>
          </section>

          {/* CTA intermédiaire */}
          <div className="bg-[#008020] text-white rounded-2xl p-6 text-center">
            <p className="font-bold text-lg mb-1">Gérez vos documents locatifs en 1 clic</p>
            <p className="text-green-100 text-sm mb-4">Quittances PDF, envoi par email, signature numérique. 100 % gratuit.</p>
            <Link href="/signup" className="inline-block bg-white text-[#008020] font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-green-50 transition-colors">
              Créer un compte gratuit
            </Link>
          </div>

          <section id="tiers-payant">
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Tiers payant : quand la CAF verse directement au bailleur</h2>
            <p className="leading-relaxed">
              La CAF peut verser l&apos;aide directement au bailleur — c&apos;est le <strong>tiers payant</strong>. Ce dispositif est accessible pour tous les profils de locataires. Pour en bénéficier, le bailleur doit en faire la demande via un document complémentaire : le <strong>Cerfa n° 11362*04</strong>. Il s&apos;engage alors à déduire le montant de l&apos;aide du loyer réclamé au locataire.
            </p>
          </section>

          <section id="delais">
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Combien de temps pour traiter la demande ?</h2>
            <p className="leading-relaxed">
              Une fois l&apos;attestation transmise, la CAF dispose généralement de <strong>1 à 2 mois</strong>{' '}pour instruire le dossier. Les aides sont versées avec un mois de décalage. Il est donc conseillé de remplir et renvoyer le document le plus rapidement possible après la demande du locataire.
            </p>
          </section>

          <section id="erreurs">
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Les erreurs fréquentes</h2>
            <ul className="space-y-2 text-sm">
              {[
                'Indiquer le mauvais montant de loyer : la CAF peut recalculer les aides à la baisse',
                'Oublier de mentionner les charges séparément du loyer',
                'Ne pas mettre à jour l\'attestation en cas d\'augmentation de loyer',
                'Signer sans vérifier la date d\'entrée dans les lieux',
                'Confondre attestation de loyer et quittance de loyer : ce sont deux documents distincts',
              ].map((err, i) => (
                <li key={i} className="flex items-start gap-2 bg-white border border-red-100 rounded-xl px-4 py-3">
                  <span className="text-red-400 mt-0.5 shrink-0 font-bold">✕</span>
                  <span>{err}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="difference">
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Attestation CAF et quittance de loyer : ne pas confondre</h2>
            <p className="leading-relaxed mb-4">Ces deux documents sont souvent confondus, mais ils n&apos;ont pas le même rôle :</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-2">Quittance de loyer</p>
                <p className="text-gray-500">Reçu mensuel attestant du paiement du loyer. Remis au locataire après chaque paiement.</p>
                <Link href="/blog/comment-faire-quittance-de-loyer" className="inline-block mt-3 text-[#008020] text-xs hover:underline">
                  Lire notre article →
                </Link>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-2">Attestation CAF (Cerfa 10842)</p>
                <p className="text-gray-500">Document rempli par le bailleur pour permettre au locataire de percevoir les APL, ALF ou ALS.</p>
              </div>
            </div>
          </section>

        </article>

        {/* À retenir */}
        <div className="mt-10 bg-green-50 border border-green-100 rounded-2xl p-6">
          <p className="text-[#008020] font-bold text-sm uppercase tracking-wide mb-4">À retenir</p>
          <ul className="space-y-2.5">
            {[
              'Le bailleur est obligé de remplir l\'attestation CAF sur demande du locataire',
              'Le lien de parenté entre bailleur et locataire est un point crucial à ne pas négliger',
              'Si bailleur = ascendant ou descendant du locataire, les APL sont exclues',
              'Le tiers payant est possible pour tous les locataires via le Cerfa 11362*04',
              'Délai de traitement CAF : 1 à 2 mois après réception du document',
              'Attestation CAF ≠ quittance de loyer : deux documents distincts',
            ].map((point, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="text-[#008020] font-bold shrink-0 mt-0.5">✓</span>
                <span className="text-gray-700">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Questions fréquentes</h2>
          <div className="space-y-3">
            <FaqItem question="Qu'est-ce que le Cerfa 10842 ?" answer="Le Cerfa 10842*07 est le formulaire officiel d'attestation de loyer délivré par la CAF. Il est rempli par le bailleur et transmis à la CAF par le locataire pour l'ouverture ou le maintien des droits aux aides au logement (APL, ALF, ALS)." />
            <FaqItem question="Où trouver le formulaire Cerfa 10842 ?" answer="Il est téléchargeable gratuitement sur le site service-public.fr ou directement sur le site de la CAF. Le locataire peut aussi vous le transmettre directement." link={{ url: 'https://www.msa.fr/lfp/documents/11566/48471/Attestation+de+loyer+et+de+r%c3%a9sidence+en+foyer.pdf', label: 'Télécharger le Cerfa 10842 (PDF officiel)' }} />
            <FaqItem question="Faut-il renouveler l'attestation chaque année ?" answer="La CAF peut demander une mise à jour de l'attestation notamment en cas de changement de loyer, de renouvellement de bail ou de contrôle périodique. Il est conseillé de la mettre à jour dès que la situation locative évolue." />
            <FaqItem question="Le bailleur peut-il refuser de remplir l'attestation CAF ?" answer="En pratique, le refus est fortement déconseillé. Il peut priver le locataire de ses aides et donc compromettre le paiement du loyer. Dans certains cas, notamment pour les logements conventionnés, le refus peut exposer le bailleur à des sanctions." />
          </div>
        </div>

        {/* CTA final */}
        <div className="mt-10 bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <p className="font-semibold text-gray-900 mb-1">Gérez vos documents locatifs en 1 clic</p>
          <p className="text-sm text-gray-500 mb-4">Outil gratuit pour les bailleurs particuliers. PDF conforme, envoi par email inclus.</p>
          <Link href="/signup" className="inline-block bg-[#008020] hover:bg-green-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
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
