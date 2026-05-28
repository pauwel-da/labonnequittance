import type { Metadata } from 'next'
import Link from 'next/link'

import FaqItem from '@/components/FaqItem'
import BlogHeader from '@/components/BlogHeader'

export const metadata: Metadata = {
  title: 'Quittance de loyer vs. reçu de loyer : quelle différence ? — La Bonne Quittance',
  description: 'Quittance et reçu de loyer sont souvent confondus. Voici la différence essentielle que tout bailleur doit connaître.',
}

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
            <span className="text-green-100">Quittance vs reçu</span>
          </p>
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Quittances</span>
          <h1 className="text-3xl font-bold mb-3 leading-tight">Quittance de loyer vs. reçu de loyer : quelle différence ?</h1>
          <p className="text-green-100 text-base leading-relaxed mb-5">
            Ces deux documents sont souvent confondus. Pourtant ils n&apos;ont pas la même valeur juridique. Voici ce que tout bailleur doit savoir.
          </p>
          <div className="flex items-center gap-3 text-sm text-green-200">
            <span>18 mai 2026</span>
            <span>·</span>
            <span>2 min de lecture</span>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-10">

        {/* Chiffres clés */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          {[
            { stat: '100%', label: 'Du loyer payé pour obtenir une quittance' },
            { stat: '3 ans', label: 'Durée de conservation obligatoire d\'une quittance' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-[#008020]">{s.stat}</p>
              <p className="text-xs text-gray-500 mt-1 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        <article className="space-y-8 text-gray-700">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">La quittance : paiement complet</h2>
            <p className="leading-relaxed">
              La <strong>quittance de loyer</strong>{' '}est remise par le bailleur au locataire lorsque ce dernier a payé <strong>l&apos;intégralité</strong>{' '}du loyer et des charges pour la période concernée. Elle atteste que le bailleur a bien reçu la totalité de la somme due.
            </p>
            <p className="leading-relaxed mt-3">
              C&apos;est le document de référence en cas de litige. Le bailleur est légalement tenu de la remettre gratuitement sur demande du locataire (article 21 de la loi du 6 juillet 1989).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Le reçu : paiement partiel</h2>
            <p className="leading-relaxed">
              Le <strong>reçu de loyer</strong> (ou reçu de paiement partiel) est délivré lorsque le locataire n&apos;a payé <strong>qu&apos;une partie</strong>{' '}de la somme due. Il reconnaît l&apos;encaissement d&apos;un acompte, mais ne libère pas le locataire de sa dette pour le solde restant.
            </p>
            <p className="leading-relaxed mt-3">
              Le bailleur <strong>ne peut pas délivrer une quittance</strong>{' '}si le loyer n&apos;est pas entièrement réglé — cela reviendrait à reconnaître un paiement complet alors que ce n&apos;est pas le cas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Ce que dit la loi</h2>
            <div className="bg-green-50 border-l-4 border-[#008020] rounded-r-xl px-5 py-4 text-sm leading-relaxed">
              <p>La quittance <strong>annule tous les reçus partiels</strong>{' '}qui auraient pu être établis précédemment pour la même période. Une fois la quittance délivrée, le locataire est considéré comme à jour pour ce terme.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Tableau récapitulatif</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="font-bold text-[#008020] mb-2">Quittance de loyer</p>
                <ul className="space-y-1.5 text-gray-600">
                  <li>— Paiement complet</li>
                  <li>— Libère totalement le locataire</li>
                  <li>— Obligatoire sur demande</li>
                  <li>— Annule les reçus partiels</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="font-bold text-gray-700 mb-2">Reçu de loyer</p>
                <ul className="space-y-1.5 text-gray-600">
                  <li>— Paiement partiel</li>
                  <li>— Ne libère pas totalement</li>
                  <li>— Bonne pratique</li>
                  <li>— N&apos;annule pas la dette</li>
                </ul>
              </div>
            </div>
          </section>

        </article>

        {/* À retenir */}
        <div className="mt-10 bg-green-50 border border-green-100 rounded-2xl p-6">
          <p className="text-[#008020] font-bold text-sm uppercase tracking-wide mb-4">À retenir</p>
          <ul className="space-y-2.5">
            {[
              'La quittance = paiement complet. Le reçu = paiement partiel.',
              'Vous ne pouvez pas signer une quittance si le loyer n\'est pas entièrement payé.',
              'La quittance annule automatiquement tous les reçus partiels de la même période.',
              'La quittance est obligatoire sur demande du locataire, le reçu est une bonne pratique.',
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
              question="Le bailleur est-il obligé de délivrer une quittance ?"
              answer="Oui, dès que le locataire en fait la demande et que le loyer est entièrement payé. C'est une obligation légale prévue par l'article 21 de la loi du 6 juillet 1989. La quittance doit être remise gratuitement."
            />
            <FaqItem
              question="Que faire si le locataire n'a payé qu'une partie du loyer ?"
              answer="Vous devez délivrer un reçu de paiement partiel, et non une quittance. Vous pouvez ensuite relancer le locataire pour le solde restant. Délivrer une quittance alors que le paiement est incomplet pourrait être interprété comme une reconnaissance de paiement total."
            />
            <FaqItem
              question="Un reçu de loyer est-il obligatoire ?"
              answer="Non, le reçu n'est pas obligatoire légalement. Mais c'est une bonne pratique qui protège les deux parties en cas de litige sur le montant payé."
            />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <p className="font-semibold text-gray-900 mb-1">Générez vos quittances en 1 clic</p>
          <p className="text-sm text-gray-500 mb-4">Outil gratuit pour les bailleurs. PDF conforme, envoi par email inclus.</p>
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
