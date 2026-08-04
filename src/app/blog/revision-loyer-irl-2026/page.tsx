import type { Metadata } from 'next'
import Link from 'next/link'
import FaqItem from '@/components/FaqItem'
import BlogHeader from '@/components/BlogHeader'
import CalculateurIRL from './CalculateurIRL'

export const metadata: Metadata = {
  title: 'IRL 2026 : calculer la révision de son loyer — La Bonne Quittance',
  description: 'Tout savoir sur l\'Indice de Référence des Loyers (IRL) : formule de calcul, tableau des valeurs, calculateur gratuit et erreurs à éviter pour réviser son loyer en 2026.',
}

const toc = [
  { id: 'definition',   label: 'Qu\'est-ce que l\'IRL ?' },
  { id: 'quand',        label: 'Quand peut-on réviser le loyer ?' },
  { id: 'formule',      label: 'La formule de calcul' },
  { id: 'calculateur',  label: 'Calculateur IRL gratuit' },
  { id: 'erreurs',      label: 'Les erreurs fréquentes' },
]

export default function ArticleIRL() {
  return (
    <div className="min-h-screen bg-gray-50">
      <BlogHeader />

      {/* Hero */}
      <div className="bg-[#008020] text-white px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-gray-400 mb-4">
            <Link href="/" className="text-green-200 hover:underline">Accueil</Link>
            {' '} › {' '}
            <Link href="/blog" className="text-green-200 hover:underline">Blog</Link>
            {' '} › {' '}
            <span className="text-green-100">Révision de loyer IRL</span>
          </p>
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Gestion locative</span>
          <h1 className="text-3xl font-bold mb-3 leading-tight">
            IRL 2026 : comment calculer la révision de son loyer ?
          </h1>
          <p className="text-green-100 text-base leading-relaxed mb-5">
            L&apos;Indice de Référence des Loyers (IRL) encadre la hausse annuelle des loyers en France. Formule, tableau des valeurs, calculateur interactif : tout ce qu&apos;il faut savoir.
          </p>
          <div className="flex items-center gap-3 text-sm text-green-200">
            <span>4 août 2026</span>
            <span>·</span>
            <span>6 min de lecture</span>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-10">

        {/* Chiffres clés */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { stat: '1×/an',  label: 'Fréquence maximale de révision du loyer' },
            { stat: '4×/an',  label: 'Fréquence de publication de l\'IRL par l\'INSEE' },
            { stat: '35 %',   label: 'Plafonnement exceptionnel appliqué en 2022–2023' },
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

          <section id="definition">
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Qu&apos;est-ce que l&apos;IRL ?</h2>
            <p className="leading-relaxed">
              L&apos;Indice de Référence des Loyers (IRL) est un indice publié <strong>chaque trimestre par l&apos;INSEE</strong>. Il sert de plafond légal à la révision annuelle des loyers en France, aussi bien pour les locations vides que meublées à titre de résidence principale.
            </p>
            <p className="leading-relaxed mt-3">
              L&apos;IRL est calculé à partir de l&apos;évolution des prix à la consommation (hors tabac et hors loyers). Il remplace depuis 2008 l&apos;ancien Indice du Coût de la Construction (ICC), jugé trop volatil.
            </p>
            <div className="bg-green-50 border-l-4 border-[#008020] rounded-r-xl px-5 py-4 text-sm leading-relaxed mt-4">
              <strong>Article 17-1 de la loi du 6 juillet 1989 :</strong>
              <p className="mt-2 italic">« La révision du loyer ne peut excéder la variation de l&apos;IRL du trimestre de référence défini dans le contrat de location. »</p>
            </div>
          </section>

          <section id="quand">
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Quand peut-on réviser le loyer ?</h2>
            <p className="leading-relaxed mb-4">
              La révision n&apos;est possible que si le <strong>bail le prévoit expressément</strong> via une clause de révision. Sans cette clause, le loyer ne peut pas être augmenté en cours de bail.
            </p>
            <ul className="space-y-3">
              {[
                {
                  titre: 'Date de révision',
                  detail: 'La date anniversaire du bail, ou la date indiquée dans la clause de révision. Elle ne peut intervenir qu\'une seule fois par an.',
                },
                {
                  titre: 'IRL de référence',
                  detail: 'Le trimestre mentionné dans le bail (souvent le trimestre précédant la signature). C\'est la valeur à comparer d\'une année sur l\'autre.',
                },
                {
                  titre: 'Délai de prescription',
                  detail: 'Si le bailleur oublie de réviser, il peut rétroactivement demander la révision, mais uniquement pour les 12 derniers mois (article 2224 du Code civil).',
                },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-[#008020] text-white text-xs flex items-center justify-center shrink-0 font-bold">{i + 1}</span>
                  <div>
                    <span className="font-semibold text-gray-900">{item.titre}</span>
                    <span className="text-gray-500"> — {item.detail}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section id="formule">
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. La formule de calcul</h2>
            <p className="leading-relaxed mb-4">Le calcul de la révision est simple :</p>
            <div className="bg-gray-900 text-green-400 font-mono text-sm rounded-2xl px-6 py-5 mb-4">
              Nouveau loyer = Loyer actuel × (IRL nouveau ÷ IRL de référence)
            </div>
            <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-sm space-y-2">
              <p className="font-semibold text-gray-900">Exemple concret</p>
              <p className="text-gray-600">Loyer actuel : <strong>850 €</strong> · IRL de référence (T3 2023) : <strong>141,46</strong> · IRL nouveau (T3 2024) : <strong>144,51</strong></p>
              <p className="text-[#008020] font-bold text-base">Nouveau loyer = 850 × (144,51 ÷ 141,46) = <span className="text-xl">868,32 €</span></p>
              <p className="text-gray-500">Soit +18,32 € (+2,16 %)</p>
            </div>
          </section>

        </article>

        {/* Calculateur */}
        <section id="calculateur" className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-5">4. Calculateur IRL gratuit</h2>
          <CalculateurIRL />
        </section>

        {/* CTA intermédiaire */}
        <div className="bg-[#008020] text-white rounded-2xl p-6 text-center mt-10">
          <p className="font-bold text-lg mb-1">Générez vos quittances avec le bon loyer révisé</p>
          <p className="text-green-100 text-sm mb-4">PDF conforme, envoi par email, 100% gratuit.</p>
          <Link href="/signup" className="inline-block bg-white text-[#008020] font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-green-50 transition-colors">
            Créer un compte gratuit
          </Link>
        </div>

        <article className="space-y-10 text-gray-700 mt-10">

          <section id="erreurs">
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Les erreurs fréquentes à éviter</h2>
            <ul className="space-y-2 text-sm">
              {[
                'Réviser le loyer sans clause de révision dans le bail : la hausse serait nulle et non avenue',
                'Utiliser le mauvais trimestre IRL : le trimestre de référence est celui indiqué dans le bail, pas le dernier publié',
                'Appliquer la révision plusieurs fois dans l\'année : une seule révision par an est autorisée',
                'Ne pas informer le locataire par écrit avant d\'appliquer la nouvelle grille',
                'Oublier de réviser pendant plusieurs années puis tenter de rattraper : la prescription est d\'un an',
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
              'L\'IRL est publié chaque trimestre par l\'INSEE et plafonne la révision annuelle des loyers',
              'La clause de révision doit figurer dans le bail — sans elle, pas de hausse possible',
              'Le trimestre de référence est celui mentionné dans le bail, pas le dernier publié',
              'La révision ne peut intervenir qu\'une fois par an, à la date anniversaire du bail',
              'Le bailleur ne peut récupérer qu\'un an de révisions oubliées (prescription d\'un an)',
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
              question="Où trouver l'IRL du trimestre en cours ?"
              answer="Sur le site de l'INSEE (insee.fr), rubrique Statistiques > Prix > Indices des prix > IRL. Les valeurs sont publiées environ 6 semaines après la fin du trimestre concerné."
            />
            <FaqItem
              question="Que se passe-t-il si le bailleur oublie de réviser le loyer ?"
              answer="Il peut tout de même demander une révision rétroactive, mais uniquement sur les 12 derniers mois (article 2224 du Code civil). Au-delà, le droit à révision est prescrit. Les loyers passés ne peuvent pas être réclamés."
            />
            <FaqItem
              question="La révision est-elle obligatoire ?"
              answer="Non, c'est une faculté pour le bailleur, pas une obligation. S'il choisit de ne pas réviser une année, il ne peut pas rattraper cette hausse les années suivantes — sauf dans la limite d'un an de prescription."
            />
            <FaqItem
              question="L'IRL s'applique-t-il aux locations meublées ?"
              answer="Oui. Depuis la loi ALUR de 2014, l'IRL s'applique aussi bien aux locations vides qu'aux locations meublées à usage de résidence principale."
            />
            <FaqItem
              question="Le bailleur peut-il dépasser le plafond IRL ?"
              answer="Non, jamais en cours de bail. Le plafond IRL est une limite légale impérative. Seule une revalorisation du loyer lors d'un renouvellement de bail (en zone non tendue) ou d'un changement de locataire peut aller au-delà."
            />
          </div>
        </div>

        {/* CTA final */}
        <div className="mt-10 bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <p className="font-semibold text-gray-900 mb-1">Générez vos quittances avec le bon loyer</p>
          <p className="text-sm text-gray-500 mb-4">Outil gratuit · PDF conforme · Envoi par email inclus</p>
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
