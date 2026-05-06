'use client'

import { useState, useEffect } from 'react'
import { locatairesStore, biensStore, proprietaireStore } from '@/lib/store'
import { genererQuittance } from '@/lib/quittance'
import type { Locataire, Bien, Proprietaire } from '@/lib/types'
import Link from 'next/link'

export default function DashboardPage() {
  const [locataires, setLocataires] = useState<Locataire[]>([])
  const [biens, setBiens] = useState<Bien[]>([])
  const [proprietaire, setProprietaire] = useState<Proprietaire | null>(null)
  const [generating, setGenerating] = useState<string | null>(null)
  const [selectedLocataire, setSelectedLocataire] = useState<Locataire | null>(null)
  const [datePaiement, setDatePaiement] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLocataires(locatairesStore.getAll())
    setBiens(biensStore.getAll())
    setProprietaire(proprietaireStore.get())
    const today = new Date()
    setDatePaiement(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`)
  }, [])

  function getBien(id: string) {
    return biens.find(b => b.id === id)
  }

  function openModal(l: Locataire) {
    setSelectedLocataire(l)
    setError(null)
  }

  async function handleGenerate() {
    if (!selectedLocataire || !proprietaire || !datePaiement) return
    const bien = getBien(selectedLocataire.bienId)
    if (!bien) { setError('Bien introuvable.'); return }
    if (!proprietaire.nom && !proprietaire.prenom) {
      setError('Veuillez renseigner votre profil (nom, adresse).')
      return
    }

    setGenerating(selectedLocataire.id)
    setError(null)
    try {
      await genererQuittance(selectedLocataire, bien, proprietaire, datePaiement)
      setSelectedLocataire(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la génération.')
    } finally {
      setGenerating(null)
    }
  }

  const isLoading = generating !== null

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-[#008020] text-white px-4 pt-10 pb-8">
        <h1 className="text-2xl font-bold">La Bonne Quittance</h1>
        <p className="text-green-100 text-sm mt-1">
          {locataires.length} locataire{locataires.length !== 1 ? 's' : ''}
        </p>
      </header>

      <div className="px-4 mt-4 space-y-3">
        {locataires.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-6xl mb-4">🏡</div>
            <p className="font-medium text-gray-600 mb-1">Aucun locataire</p>
            <p className="text-sm mb-6">Commencez par ajouter un bien puis un locataire.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/biens" className="bg-[#008020] text-white text-sm font-medium px-4 py-2 rounded-lg">
                Ajouter un bien
              </Link>
              <Link href="/locataires" className="border border-[#008020] text-[#008020] text-sm font-medium px-4 py-2 rounded-lg">
                Ajouter un locataire
              </Link>
            </div>
          </div>
        )}

        {locataires.map(l => {
          const bien = getBien(l.bienId)
          const total = l.loyer + l.charges
          const isGen = generating === l.id
          return (
            <div key={l.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-base">{l.prenom} {l.nom}</p>
                    {bien && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {bien.adresse} · {bien.ville}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#008020]">
                      {total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </p>
                    <p className="text-xs text-gray-400">/mois</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 text-xs text-gray-400">
                  <span>HC: {l.loyer.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                  <span>·</span>
                  <span>Charges: {l.charges.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                </div>
              </div>
              <button
                onClick={() => openModal(l)}
                disabled={isLoading}
                className="w-full bg-[#008020] hover:bg-green-800 disabled:opacity-50 text-white text-sm font-semibold py-3 transition-colors flex items-center justify-center gap-2"
              >
                {isGen ? (
                  <>
                    <span className="animate-spin">⏳</span> Génération en cours...
                  </>
                ) : (
                  <>📄 Générer la quittance</>
                )}
              </button>
            </div>
          )
        })}
      </div>

      {selectedLocataire && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedLocataire(null)} />
          <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Générer la quittance</h2>
              <button onClick={() => setSelectedLocataire(null)} className="text-gray-400 text-2xl leading-none">&times;</button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Pour <span className="font-medium">{selectedLocataire.prenom} {selectedLocataire.nom}</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de paiement</label>
              <input
                type="date"
                value={datePaiement}
                onChange={e => setDatePaiement(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
              />
              <p className="text-xs text-gray-400 mt-1">La quittance couvrira le mois correspondant à cette date.</p>
            </div>
            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
            <button
              onClick={handleGenerate}
              disabled={isLoading || !datePaiement}
              className="mt-5 w-full bg-[#008020] hover:bg-green-800 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><span className="animate-spin">⏳</span> Génération...</>
              ) : (
                <>📥 Télécharger la quittance PDF</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
