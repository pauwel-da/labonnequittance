'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getLocataires, getBiens, getProprietaire } from '@/lib/db'
import type { Locataire, Bien, Proprietaire } from '@/lib/types'
import { ArrowLeft, FileCheck, Lock, Sparkles } from 'lucide-react'

const PRIX = '1,99 €'

export default function AttestationCafPage() {
  const { id } = useParams<{ id: string }>()
  const [locataire, setLocataire] = useState<Locataire | null>(null)
  const [bien, setBien] = useState<Bien | null>(null)
  const [proprietaire, setProprietaire] = useState<Proprietaire | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getLocataires(), getBiens(), getProprietaire()]).then(([locs, bs, prop]) => {
      const loc = locs.find(l => l.id === id) ?? null
      setLocataire(loc)
      setBien(loc ? bs.find(b => b.id === loc.bienId) ?? null : null)
      setProprietaire(prop)
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
        Chargement...
      </div>
    )
  }

  if (!locataire || !bien) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Locataire introuvable.</p>
      </div>
    )
  }

  const totalLoyer = locataire.loyer + locataire.charges

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#008020] text-white px-4 lg:px-8 pt-8 pb-5">
        <Link href="/locataires" className="flex items-center gap-2 text-green-100 text-sm mb-4 hover:text-white transition-colors w-fit">
          <ArrowLeft size={16} /> Retour aux locataires
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-xl p-2">
            <FileCheck size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Attestation de loyer CAF</h1>
            <p className="text-green-100 text-sm">Cerfa n° 10842*07 — {locataire.nomPrenom}</p>
          </div>
        </div>
      </header>

      <div className="px-4 lg:px-8 mt-6 max-w-2xl mx-auto space-y-4 pb-10">

        {/* Badge */}
        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
          <Sparkles size={16} className="text-purple-500 shrink-0" />
          <p className="text-sm text-purple-700">
            Document officiel pré-rempli avec les données de votre locataire, prêt à télécharger.
          </p>
        </div>

        {/* Aperçu des données pré-remplies */}
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Aperçu du document</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Bailleur</p>
              <p className="text-sm font-medium text-gray-800">
                {proprietaire?.prenom} {proprietaire?.nom}
              </p>
              <p className="text-xs text-gray-500">{proprietaire?.adresse}</p>
              <p className="text-xs text-gray-500">{proprietaire?.codePostal} {proprietaire?.ville}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Locataire</p>
              <p className="text-sm font-medium text-gray-800">{locataire.nomPrenom}</p>
              <p className="text-xs text-gray-500">{bien.adresse}</p>
              <p className="text-xs text-gray-500">{bien.codePostal} {bien.ville}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Loyer HC</p>
              <p className="text-sm font-semibold text-gray-800">
                {locataire.loyer.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Charges</p>
              <p className="text-sm font-semibold text-gray-800">
                {locataire.charges.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Total mensuel</p>
              <p className="text-sm font-semibold text-[#008020]">
                {totalLoyer.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Type de location</p>
              <p className="text-sm font-semibold text-gray-800">
                {bien.typeLocation === 'meuble' ? 'Meublé' : 'Non meublé'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Date d'entrée</p>
              <p className="text-sm font-semibold text-gray-800">
                {new Date(locataire.dateDebut).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </div>

        {/* CTA paiement */}
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Télécharger l'attestation</p>
              <p className="text-xs text-gray-400 mt-0.5">PDF officiel Cerfa 10842*07, signé et prêt à envoyer à la CAF</p>
            </div>
            <span className="text-2xl font-bold text-gray-900">{PRIX}</span>
          </div>

          <button
            disabled
            className="w-full flex items-center justify-center gap-2 bg-purple-600 opacity-50 cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm"
          >
            <Lock size={15} /> Payer et télécharger — {PRIX}
          </button>
          <p className="text-xs text-center text-gray-400">Paiement sécurisé · Téléchargement immédiat · Sans abonnement</p>
        </div>

      </div>
    </div>
  )
}
