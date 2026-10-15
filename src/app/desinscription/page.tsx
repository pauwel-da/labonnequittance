import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, MailX, TriangleAlert } from 'lucide-react'
import { lireAdresse, signatureValide } from '@/lib/email-desinscription'
import { confirmerDesinscription } from './actions'

export const metadata: Metadata = {
  title: 'Se désinscrire — La Bonne Quittance',
  robots: { index: false, follow: false },
}

function Carte({ icone, titre, children }: { icone: React.ReactNode; titre: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10 max-w-md w-full text-center">
        <div className="w-12 h-12 bg-green-50 text-[#008020] rounded-full flex items-center justify-center mx-auto mb-5">{icone}</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">{titre}</h1>
        {children}
      </div>
    </div>
  )
}

const ACCUEIL = 'inline-block text-sm font-medium text-gray-500 hover:text-gray-900 underline'

export default async function DesinscriptionPage({ searchParams }: {
  searchParams: Promise<{ e?: string; s?: string; ok?: string; erreur?: string; test?: string }>
}) {
  const { e = '', s = '', ok, erreur, test } = await searchParams
  const email = lireAdresse(e)

  if (!email || !signatureValide(email, s)) {
    return (
      <Carte icone={<TriangleAlert size={22} />} titre="Lien incomplet">
        <p className="text-sm text-gray-600 mb-8">
          Ce lien de désinscription est invalide. Pour ne plus recevoir nos emails, écrivez-nous à{' '}
          <a href="mailto:contact@labonnequittance.fr" className="text-[#00701c] underline">contact@labonnequittance.fr</a>.
        </p>
        <Link href="/" className={ACCUEIL}>Accueil de La Bonne Quittance</Link>
      </Carte>
    )
  }

  if (test) {
    return (
      <Carte icone={<MailX size={22} />} titre="Email de test">
        <p className="text-sm text-gray-600 mb-8">
          Ce lien vient d&apos;un email de test : rien n&apos;a été modifié. Dans les vrais envois, il désinscrit l&apos;adresse du destinataire.
        </p>
        <Link href="/" className={ACCUEIL}>Accueil de La Bonne Quittance</Link>
      </Carte>
    )
  }

  if (ok) {
    return (
      <Carte icone={<Check size={22} />} titre="Désinscription confirmée">
        <p className="text-sm text-gray-600 mb-8">
          <strong className="text-gray-900">{email}</strong> ne recevra plus nos emails d&apos;information.
          Les emails liés à votre compte (code de connexion, quittances) continuent normalement.
        </p>
        <Link href="/" className={ACCUEIL}>Accueil de La Bonne Quittance</Link>
      </Carte>
    )
  }

  return (
    <Carte icone={<MailX size={22} />} titre="Se désinscrire">
      <p className="text-sm text-gray-600 mb-6">
        Ne plus recevoir les emails d&apos;information de La Bonne Quittance à l&apos;adresse{' '}
        <strong className="text-gray-900 break-all">{email}</strong> ?
      </p>
      {erreur && (
        <p className="text-sm text-red-600 mb-4">
          La désinscription n&apos;a pas abouti. Réessayez, ou écrivez-nous à contact@labonnequittance.fr.
        </p>
      )}
      <form action={confirmerDesinscription} className="mb-6">
        <input type="hidden" name="e" value={e} />
        <input type="hidden" name="s" value={s} />
        <button
          type="submit"
          className="w-full bg-[#008020] hover:bg-green-800 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Me désinscrire
        </button>
      </form>
      <Link href="/" className={ACCUEIL}>Non, revenir à l&apos;accueil</Link>
    </Carte>
  )
}
