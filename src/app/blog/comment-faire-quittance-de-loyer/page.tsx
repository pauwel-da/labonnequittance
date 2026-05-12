import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Comment faire une quittance de loyer conforme ? — La Bonne Quittance',
  description: 'Mentions obligatoires, aspect légal, conservation : tout ce qu\'il faut savoir pour rédiger une quittance de loyer valide en France.',
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
          <span className="text-gray-600">Quittance de loyer</span>
        </p>

        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <span>Mai 2026</span>
            <span>·</span>
            <span>5 min de lecture</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
            Comment faire une (bonne) quittance de loyer ?
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            La quittance de loyer est un document simple mais encadré par la loi. Voici tout ce qu'un bailleur doit savoir pour en rédiger une correctement et éviter les litiges.
          </p>
        </div>

        {/* Contenu */}
        <article className="prose prose-gray max-w-none space-y-8 text-gray-700">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Qu'est-ce qu'une quittance de loyer ?</h2>
            <p className="leading-relaxed">
              Une quittance de loyer est un reçu écrit remis par le bailleur au locataire, attestant que ce dernier a bien payé l'intégralité du loyer et des charges pour une période donnée. Elle se distingue du <strong>reçu de paiement partiel</strong>, qui n'est délivré que lorsque le locataire n'a payé qu'une partie de la somme due.
            </p>
            <p className="leading-relaxed mt-3">
              Contrairement à une idée reçue, le bailleur n'est pas obligé d'envoyer spontanément une quittance chaque mois. En revanche, il est tenu de la remettre <strong>gratuitement</strong> dès que le locataire en fait la demande. C'est une obligation légale.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Ce que dit la loi</h2>
            <div className="bg-green-50 border-l-4 border-[#008020] rounded-r-xl px-5 py-4 text-sm leading-relaxed">
              <p>
                <strong>Article 21 de la loi n° 89-462 du 6 juillet 1989</strong> (dite loi Mézard, modifiée par la loi ALUR) :
              </p>
              <p className="mt-2 italic">
                « Le bailleur est tenu de remettre gratuitement une quittance au locataire qui en fait la demande. »
              </p>
            </div>
            <p className="leading-relaxed mt-4">
              La quittance engage la responsabilité du bailleur : en la signant, il reconnaît avoir reçu le paiement complet. Elle <strong>annule tout reçu partiel</strong> antérieur pour la même période.
            </p>
            <p className="leading-relaxed mt-3">
              Par ailleurs, la loi impose au locataire de <strong>conserver sa quittance pendant 3 ans</strong> à compter de la date d'échéance du terme (article 7-1 de la loi du 6 juillet 1989). Le bailleur a quant à lui intérêt à en garder une copie pour la même durée.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Les mentions obligatoires</h2>
            <p className="leading-relaxed mb-4">
              Pour être valide, une quittance de loyer doit obligatoirement mentionner :
            </p>
            <ul className="space-y-2">
              {[
                { label: 'Identité du bailleur', detail: 'Nom, prénom et adresse' },
                { label: 'Identité du locataire', detail: 'Nom et prénom' },
                { label: 'Adresse du logement', detail: 'Adresse complète du bien loué' },
                { label: 'Période concernée', detail: 'Mois et année du paiement (ex. : du 1er au 31 mai 2026)' },
                { label: 'Montant du loyer hors charges', detail: 'Exprimé en euros' },
                { label: 'Montant des charges', detail: 'Provisions sur charges ou charges réelles' },
                { label: 'Montant total payé', detail: 'Loyer + charges' },
                { label: 'Date du paiement', detail: 'Date à laquelle le paiement a été effectué' },
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
            <h2 className="text-xl font-bold text-gray-900 mb-3">Location meublée ou non meublée : y a-t-il une différence ?</h2>
            <p className="leading-relaxed">
              La quittance est obligatoire dans les deux cas. La structure du document est identique. La seule différence notable concerne le régime fiscal du bailleur (LMNP vs revenus fonciers), mais cela n'impacte pas le contenu de la quittance elle-même.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Quittance papier ou numérique ?</h2>
            <p className="leading-relaxed">
              La loi n'impose pas de format particulier. Une quittance peut être remise en main propre, par courrier ou par email. Le format <strong>PDF</strong> est aujourd'hui le standard : il est infalsifiable, facile à archiver et à transmettre.
            </p>
            <p className="leading-relaxed mt-3">
              La <strong>signature numérique</strong> est légalement valide depuis la directive européenne eIDAS et sa transposition en droit français. Un bailleur peut donc tout à fait signer ses quittances électroniquement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Les erreurs fréquentes à éviter</h2>
            <ul className="space-y-2 text-sm">
              {[
                'Oublier de distinguer loyer et charges : le locataire doit pouvoir les vérifier séparément',
                'Remettre une quittance avant réception effective du paiement',
                'Ne pas conserver une copie côté bailleur',
                'Utiliser un modèle Word sans signature : peu sécurisé et facilement modifiable',
                'Remettre une quittance partielle alors que le paiement est complet',
              ].map((err, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5 shrink-0">✕</span>
                  <span>{err}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Comment simplifier la gestion des quittances ?</h2>
            <p className="leading-relaxed">
              Rédiger une quittance à la main ou sous Word chaque mois est fastidieux et source d'erreurs. Des outils comme <strong>La Bonne Quittance</strong> permettent de générer en 1 clic des quittances PDF conformes, pré-remplies avec les informations du bailleur et du locataire, et de les envoyer directement par email.
            </p>
          </section>

        </article>

        {/* CTA */}
        <div className="mt-10 bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <p className="font-semibold text-gray-900 mb-1">Générez vos quittances en 1 clic</p>
          <p className="text-sm text-gray-500 mb-4">Outil gratuit, PDF conforme, envoi par email inclus.</p>
          <Link href="/signup"
            className="inline-block bg-[#008020] hover:bg-green-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
            Créer un compte gratuit
          </Link>
        </div>

        {/* Navigation */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <Link href="/blog" className="text-sm text-[#008020] hover:underline">← Retour au blog</Link>
        </div>

      </main>
    </div>
  )
}
