import type { Metadata } from 'next'
import Link from 'next/link'
import FaqItem from '@/components/FaqItem'
import BlogHeader from '@/components/BlogHeader'

export const metadata: Metadata = {
  title: 'Modèle quittance de loyer PDF gratuit 2026 — La Bonne Quittance',
  description: 'Téléchargez ou générez gratuitement votre modèle de quittance de loyer PDF 2026 conforme à la loi. Signature numérique incluse, envoi par email en 1 clic.',
}

const toc = [
  { id: 'pourquoi', label: 'Pourquoi utiliser un modèle ?' },
  { id: 'mentions', label: 'Ce que doit contenir le modèle' },
  { id: 'word-vs-pdf', label: 'Word, PDF ou générateur ?' },
  { id: 'risques', label: 'Les risques d\'un mauvais modèle' },
  { id: 'gratuit', label: 'Notre modèle gratuit 2026' },
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
            <span className="text-green-100">Modèle quittance PDF</span>
          </p>
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Quittances</span>
          <h1 className="text-3xl font-bold mb-3 leading-tight">Modèle quittance de loyer PDF gratuit 2026</h1>
          <p className="text-green-100 text-base leading-relaxed mb-5">
            Fini le modèle Word qu&apos;on retape chaque mois. Voici comment générer une quittance PDF conforme, avec signature numérique, gratuitement et en 30 secondes.
          </p>
          <div className="flex items-center gap-3 text-sm text-green-200">
            <span>28 mai 2026</span>
            <span>·</span>
            <span>4 min de lecture</span>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-10">

        {/* Chiffres clés */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { stat: '0 €', label: 'Prix du modèle et de la génération' },
            { stat: '30 s', label: 'Temps pour générer votre première quittance' },
            { stat: '100 %', label: 'Conforme aux mentions obligatoires 2026' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-[#008020]">{s.stat}</p>
              <p className="text-xs text-gray-500 mt-1 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Sommaire */}
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
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Pourquoi utiliser un modèle de quittance ?</h2>
            <p className="leading-relaxed">
              La quittance de loyer est un document juridique. Si elle est mal rédigée — mentions manquantes, montants incorrects, absence de signature — elle peut être contestée par le locataire ou refusée par la CAF.
            </p>
            <p className="leading-relaxed mt-3">
              Un bon modèle garantit que vous n&apos;oubliez aucune mention obligatoire, que les montants sont correctement ventilés entre loyer et charges, et que votre signature est opposable. C&apos;est aussi un gain de temps considérable : un bailleur avec 3 locataires passe en moyenne <strong>45 minutes par mois</strong>{' '}sur ses quittances sans outil dédié.
            </p>
          </section>

          <section id="mentions">
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Ce que doit contenir le modèle</h2>
            <p className="leading-relaxed mb-4">
              Conformément à l&apos;article 21 de la loi du 6 juillet 1989, toute quittance de loyer valide doit mentionner :
            </p>
            <ul className="space-y-2">
              {[
                { label: 'Nom et adresse du bailleur' },
                { label: 'Nom du locataire' },
                { label: 'Adresse du logement loué' },
                { label: 'Période de location couverte (du … au …)' },
                { label: 'Montant du loyer hors charges' },
                { label: 'Montant des charges' },
                { label: 'Montant total payé (loyer + charges)' },
                { label: 'Date du paiement' },
                { label: 'Signature du bailleur' },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-[#008020] text-white text-xs flex items-center justify-center shrink-0 font-bold">{i + 1}</span>
                  <span className="text-gray-800">{item.label}</span>
                </li>
              ))}
            </ul>
            <p className="leading-relaxed mt-4 text-sm text-gray-500">
              Un modèle incomplet expose le bailleur à des réclamations du locataire — notamment si ce dernier cherche à obtenir une aide de la CAF ou à prouver sa situation de logement.
            </p>
          </section>

          <section id="word-vs-pdf">
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Modèle Word, PDF téléchargeable ou générateur en ligne ?</h2>

            <div className="space-y-3">
              {[
                {
                  title: 'Modèle Word',
                  pros: 'Gratuit, modifiable',
                  cons: 'Facile à falsifier, pas de signature intégrée, à ressaisir chaque mois',
                  color: 'border-orange-200 bg-orange-50',
                  badge: 'Déconseillé',
                  badgeColor: 'bg-orange-100 text-orange-700',
                },
                {
                  title: 'PDF téléchargeable',
                  pros: 'Gratuit, plus sécurisé',
                  cons: 'À remplir manuellement, signature à scanner ou ajouter, erreurs fréquentes',
                  color: 'border-gray-200 bg-gray-50',
                  badge: 'Passable',
                  badgeColor: 'bg-gray-100 text-gray-600',
                },
                {
                  title: 'Générateur en ligne',
                  pros: 'Pré-rempli, PDF conforme, signature numérique, envoi email',
                  cons: 'Nécessite un compte',
                  color: 'border-green-200 bg-green-50',
                  badge: 'Recommandé',
                  badgeColor: 'bg-green-100 text-[#008020]',
                },
              ].map((item, i) => (
                <div key={i} className={`border rounded-xl p-4 ${item.color}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.badgeColor}`}>{item.badge}</span>
                  </div>
                  <p className="text-xs text-gray-600"><span className="text-[#008020] font-semibold">✓</span> {item.pros}</p>
                  <p className="text-xs text-gray-600 mt-0.5"><span className="text-red-400 font-semibold">✕</span> {item.cons}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA intermédiaire */}
          <div className="bg-[#008020] text-white rounded-2xl p-6 text-center">
            <p className="font-bold text-lg mb-1">Générez votre quittance PDF en 30 secondes</p>
            <p className="text-green-100 text-sm mb-4">Pré-remplie, signée, conforme. Gratuit, sans abonnement.</p>
            <Link href="/signup" className="inline-block bg-white text-[#008020] font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-green-50 transition-colors">
              Créer un compte gratuit
            </Link>
          </div>

          <section id="risques">
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Les risques d&apos;un mauvais modèle</h2>
            <ul className="space-y-2 text-sm">
              {[
                'Une quittance sans signature du bailleur peut être refusée par la CAF ou un organisme de logement',
                'Un modèle Word peut être modifié par le locataire après envoi — aucune protection',
                'Oublier de distinguer loyer et charges peut poser problème lors d\'une révision de loyer',
                'Une quittance avec une date incorrecte peut créer un litige en cas de retard de paiement',
              ].map((risk, i) => (
                <li key={i} className="flex items-start gap-2 bg-white border border-red-100 rounded-xl px-4 py-3">
                  <span className="text-red-400 mt-0.5 shrink-0 font-bold">✕</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="gratuit">
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Notre modèle de quittance gratuit 2026</h2>
            <p className="leading-relaxed">
              La Bonne Quittance génère votre quittance PDF en 1 clic, pré-remplie avec les informations de votre locataire et de votre bien. Le document est conforme aux 9 mentions obligatoires, inclut votre signature numérique et peut être envoyé directement par email.
            </p>
            <p className="leading-relaxed mt-3">
              C&apos;est <strong>100 % gratuit</strong>, sans abonnement, sans carte bancaire. Vous renseignez vos biens et locataires une seule fois, et générez vos quittances en 1 clic chaque mois.
            </p>
            <div className="mt-5 bg-green-50 border border-green-100 rounded-2xl p-5">
              <p className="text-sm font-semibold text-[#008020] mb-3">Ce que vous obtenez</p>
              <ul className="space-y-2">
                {[
                  'Quittance PDF avec toutes les mentions légales',
                  'Signature numérique intégrée',
                  'Envoi par email au locataire en 1 clic',
                  'Attestation CAF (Cerfa n° 10842) incluse',
                  'Historique de toutes vos quittances',
                ].map((point, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-[#008020] font-bold">✓</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </section>

        </article>

        {/* À retenir */}
        <div className="mt-10 bg-green-50 border border-green-100 rounded-2xl p-6">
          <p className="text-[#008020] font-bold text-sm uppercase tracking-wide mb-4">À retenir</p>
          <ul className="space-y-2.5">
            {[
              'Un modèle Word est gratuit mais risqué : falsifiable et sans signature valide',
              'Le PDF est le format recommandé : infalsifiable et archivable',
              'Un générateur en ligne pré-remplit tout et intègre la signature numérique',
              'La quittance doit comporter 9 mentions obligatoires pour être valide',
              'La Bonne Quittance génère vos quittances PDF gratuitement en 1 clic',
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
            <FaqItem
              question="Où trouver un modèle de quittance de loyer gratuit ?"
              answer="La Bonne Quittance vous permet de générer gratuitement une quittance PDF conforme, sans téléchargement ni abonnement. Il suffit de créer un compte, renseigner vos informations une fois, et générer en 1 clic."
            />
            <FaqItem
              question="Un modèle Word de quittance est-il valable légalement ?"
              answer="Oui, la loi n'impose pas de format particulier. Mais un document Word est facilement modifiable et ne permet pas d'intégrer une signature numérique valide. Le PDF est fortement recommandé pour sa sécurité."
            />
            <FaqItem
              question="Le modèle de quittance est-il différent pour un meublé ?"
              answer="Non, les mentions obligatoires sont identiques. La différence se situe uniquement dans le régime fiscal du bailleur, pas dans le contenu de la quittance."
            />
            <FaqItem
              question="Peut-on envoyer une quittance de loyer par email ?"
              answer="Oui, c'est légalement valide. La Bonne Quittance vous permet d'envoyer votre quittance PDF directement par email à votre locataire en 1 clic, avec votre signature numérique."
            />
          </div>
        </div>

        {/* CTA final */}
        <div className="mt-10 bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <p className="font-semibold text-gray-900 mb-1">Générez votre première quittance maintenant</p>
          <p className="text-sm text-gray-500 mb-4">Gratuit, sans abonnement, prêt en 30 secondes.</p>
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
