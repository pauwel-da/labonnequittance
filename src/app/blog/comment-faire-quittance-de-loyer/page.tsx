import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import ReadingProgress from '@/components/ReadingProgress'
import FaqItem from '@/components/FaqItem'

export const metadata: Metadata = {
  title: 'Comment faire une quittance de loyer conforme ? — La Bonne Quittance',
  description: 'Mentions obligatoires, aspect légal, conservation : tout ce qu\'il faut savoir pour rédiger une quittance de loyer valide en France.',
}

const toc = [
  { id: 'definition', label: 'Qu\'est-ce qu\'une quittance de loyer ?' },
  { id: 'loi', label: 'Ce que dit la loi' },
  { id: 'mentions', label: 'Les mentions obligatoires' },
  { id: 'meuble', label: 'Meublé ou non meublé ?' },
  { id: 'numerique', label: 'Quittance papier ou numérique ?' },
  { id: 'erreurs', label: 'Les erreurs fréquentes' },
]

export default function ArticlePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-4 shadow-sm relative">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <Link href="/">
            <Image src="/logo.png" alt="La Bonne Quittance" width={140} height={60} priority />
          </Link>
          <Link href="/signup" className="text-sm font-medium text-[#008020] border border-[#008020] hover:bg-green-50 px-4 py-2 rounded-xl transition-colors">
            Espace bailleur →
          </Link>
        </div>
        <ReadingProgress />
      </header>

      {/* Hero */}
      <div className="bg-[#008020] text-white px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-gray-400 mb-4">
            <Link href="/" className="text-green-200 hover:underline">Accueil</Link>
            {' '} › {' '}
            <Link href="/blog" className="text-green-200 hover:underline">Blog</Link>
            {' '} › {' '}
            <span className="text-green-100">Quittance de loyer</span>
          </p>
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Quittances</span>
          <h1 className="text-3xl font-bold mb-3 leading-tight">Comment faire une (bonne) quittance de loyer ?</h1>
          <p className="text-green-100 text-base leading-relaxed mb-5">
            La quittance de loyer est un document simple mais encadré par la loi. Voici tout ce qu&apos;un bailleur doit savoir pour en rédiger une correctement et éviter les litiges.
          </p>
          <div className="flex items-center gap-3 text-sm text-green-200">
            <span>14 mai 2026</span>
            <span>·</span>
            <span>5 min de lecture</span>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-10">

        {/* Chiffres clés */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { stat: '0 €', label: <span>Le prix de la quittance avec <Link href="/signup" className="text-[#008020] hover:underline font-semibold">La Bonne Quittance</Link></span> },
            { stat: '3 ans', label: 'Durée de conservation obligatoire' },
            { stat: '9', label: 'Mentions obligatoires' },
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

          <section id="definition">
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Qu&apos;est-ce qu&apos;une quittance de loyer ?</h2>
            <p className="leading-relaxed">
              Une quittance de loyer est un reçu écrit remis par le bailleur au locataire, attestant que ce dernier a bien payé l&apos;intégralité du loyer et des charges pour une période donnée. Elle se distingue du <strong>reçu de paiement partiel</strong>, qui n&apos;est délivré que lorsque le locataire n&apos;a payé qu&apos;une partie de la somme due.
            </p>
            <p className="leading-relaxed mt-3">
              Contrairement à une idée reçue, le bailleur n&apos;est pas obligé d&apos;envoyer spontanément une quittance chaque mois. En revanche, il est tenu de la remettre <strong>gratuitement</strong> dès que le locataire en fait la demande. C&apos;est une obligation légale.
            </p>
          </section>

          <section id="loi">
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Ce que dit la loi</h2>
            <div className="bg-green-50 border-l-4 border-[#008020] rounded-r-xl px-5 py-4 text-sm leading-relaxed">
              <p><strong>Article 21 de la loi n° 89-462 du 6 juillet 1989</strong> (loi Mézard, modifiée par la loi ALUR) :</p>
              <p className="mt-2 italic">« Le bailleur est tenu de remettre gratuitement une quittance au locataire qui en fait la demande. »</p>
            </div>
            <p className="leading-relaxed mt-4">
              La quittance engage la responsabilité du bailleur : en la signant, il reconnaît avoir reçu le paiement complet. Elle <strong>annule tout reçu partiel</strong> antérieur pour la même période.
            </p>
            <p className="leading-relaxed mt-3">
              Par ailleurs, la loi impose au locataire de <strong>conserver sa quittance pendant 3 ans</strong> à compter de la date d&apos;échéance du terme (article 7-1 de la loi du 6 juillet 1989). Le bailleur a quant à lui intérêt à en garder une copie pour la même durée.
            </p>
          </section>

          <section id="mentions">
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Les mentions obligatoires</h2>
            <p className="leading-relaxed mb-4">Pour être valide, une quittance de loyer doit obligatoirement mentionner :</p>
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

          {/* CTA intermédiaire */}
          <div className="bg-[#008020] text-white rounded-2xl p-6 text-center">
            <p className="font-bold text-lg mb-1">Générez votre quittance en 1 clic</p>
            <p className="text-green-100 text-sm mb-4">Toutes les mentions obligatoires incluses. PDF conforme, envoi par email.</p>
            <Link href="/signup" className="inline-block bg-white text-[#008020] font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-green-50 transition-colors">
              Créer un compte gratuit
            </Link>
          </div>

          <section id="meuble">
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Location meublée ou non meublée : y a-t-il une différence ?</h2>
            <p className="leading-relaxed">
              La quittance est obligatoire dans les deux cas. La structure du document est identique. La seule différence notable concerne le régime fiscal du bailleur (LMNP vs revenus fonciers), mais cela n&apos;impacte pas le contenu de la quittance elle-même.
            </p>
          </section>

          <section id="numerique">
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Quittance papier ou numérique ?</h2>
            <p className="leading-relaxed">
              La loi n&apos;impose pas de format particulier. Une quittance peut être remise en main propre, par courrier ou par email. Le format <strong>PDF</strong> est aujourd&apos;hui le standard : il est infalsifiable, facile à archiver et à transmettre.
            </p>
            <p className="leading-relaxed mt-3">
              La <strong>signature numérique</strong> est légalement valide depuis la directive européenne eIDAS et sa transposition en droit français. Un bailleur peut donc tout à fait signer ses quittances électroniquement.
            </p>
          </section>

          <section id="erreurs">
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Les erreurs fréquentes à éviter</h2>
            <ul className="space-y-2 text-sm">
              {[
                'Oublier de distinguer loyer et charges : le locataire doit pouvoir les vérifier séparément',
                'Remettre une quittance avant réception effective du paiement',
                'Ne pas conserver une copie côté bailleur',
                'Utiliser un modèle Word sans signature : peu sécurisé et facilement modifiable',
                'Remettre une quittance partielle alors que le paiement est complet',
              ].map((err, i) => (
                <li key={i} className="flex items-start gap-2 bg-white border border-red-100 rounded-xl px-4 py-3">
                  <span className="text-red-400 mt-0.5 shrink-0 font-bold">✕</span>
                  <span>{err}</span>
                </li>
              ))}
            </ul>
          </section>

        </article>

        {/* À retenir */}
        <div className="mt-10 bg-green-50 border border-green-100 rounded-2xl p-6">
          <p className="text-[#008020] font-bold text-sm uppercase tracking-wide mb-4">À retenir</p>
          <ul className="space-y-2.5">
            {[
              'Le bailleur doit remettre la quittance gratuitement sur demande du locataire',
              'Elle doit comporter 9 mentions obligatoires dont loyer, charges et signature',
              'Le locataire doit la conserver 3 ans, le bailleur aussi',
              'Le format PDF avec signature numérique est légalement valide',
              'Elle annule tout reçu partiel antérieur pour la même période',
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
            <FaqItem question="La quittance de loyer est-elle obligatoire ?" answer="Non, elle n'est pas obligatoire d'office. Mais le bailleur est légalement tenu de la remettre gratuitement si le locataire en fait la demande (article 21 de la loi du 6 juillet 1989)." />
            <FaqItem question="Peut-on refuser de donner une quittance de loyer ?" answer="Non. Refuser de délivrer une quittance alors que le loyer a bien été payé expose le bailleur à des poursuites. C'est une obligation légale dès que le locataire en fait la demande." />
            <FaqItem question="Combien de temps faut-il conserver une quittance de loyer ?" answer="3 ans à compter de la date d'échéance du terme, conformément à l'article 7-1 de la loi du 6 juillet 1989. Cette durée s'applique aussi bien au locataire qu'au bailleur." />
            <FaqItem question="Une quittance de loyer en PDF est-elle valable légalement ?" answer="Oui. La loi n'impose aucun format particulier. Un PDF avec signature numérique a la même valeur légale qu'un document papier signé à la main." />
          </div>
        </div>

        {/* CTA final */}
        <div className="mt-10 bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <p className="font-semibold text-gray-900 mb-1">Générez vos quittances en 1 clic</p>
          <p className="text-sm text-gray-500 mb-4">Outil gratuit, PDF conforme, envoi par email inclus.</p>
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
