'use client'

import { useState, useEffect } from 'react'
import { getQuittances, getLocataires, getBiens, getProprietaire } from '@/lib/db'
import { genererQuittance } from '@/lib/quittance'
import type { QuittanceRecord, Locataire, Bien, Proprietaire } from '@/lib/types'
import { History, Download, Send, Loader2 } from 'lucide-react'

function formatPeriode(periode: string) {
  return new Date(periode).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR')
}

export default function HistoriquePage() {
  const [quittances, setQuittances] = useState<QuittanceRecord[]>([])
  const [locataires, setLocataires] = useState<Locataire[]>([])
  const [biens, setBiens] = useState<Bien[]>([])
  const [proprietaire, setProprietaire] = useState<Proprietaire | null>(null)
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    Promise.all([getQuittances(), getLocataires(), getBiens(), getProprietaire()])
      .then(([qs, locs, bs, prop]) => {
        setQuittances(qs.filter(q => q.action !== 'visionne'))
        setLocataires(locs)
        setBiens(bs)
        setProprietaire(prop)
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleRegenerate(q: QuittanceRecord) {
    const locataire = locataires.find(l => l.id === q.locataireId)
    const bien = biens.find(b => b.id === q.bienId)
    if (!locataire || !bien || !proprietaire) {
      setErrors(e => ({ ...e, [q.id]: 'Données introuvables.' }))
      return
    }
    setRegenerating(q.id)
    setErrors(e => { const n = { ...e }; delete n[q.id]; return n })
    try {
      await genererQuittance(locataire, bien, proprietaire, q.periode, q.datePaiement)
    } catch {
      setErrors(e => ({ ...e, [q.id]: 'Erreur lors du téléchargement.' }))
    } finally {
      setRegenerating(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#008020] text-white px-4 lg:px-8 pt-8 pb-5">
        <h1 className="text-2xl font-bold">Historique</h1>
        <p className="text-green-100 text-sm mt-1">
          {quittances.length} quittance{quittances.length !== 1 ? 's' : ''} générée{quittances.length !== 1 ? 's' : ''}
        </p>
      </header>

      <div className="px-4 lg:px-8 mt-6 space-y-3 max-w-4xl mx-auto pb-6">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <Loader2 size={20} className="animate-spin mr-2" /> Chargement...
          </div>
        ) : quittances.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <History size={28} className="text-gray-400" />
            </div>
            <p>Aucune quittance générée pour l&apos;instant</p>
          </div>
        ) : (
          quittances.map(q => {
            const total = q.montantLoyer + q.montantCharges
            const isRegen = regenerating === q.id
            return (
              <div key={q.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#008020] capitalize mb-1">Période {formatPeriode(q.periode)}</p>
                    <p className="font-semibold text-gray-900 truncate">{q.locataireNomPrenom}</p>
                    <p className="text-sm text-gray-500 truncate mb-2">{q.bienNom}</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      q.action === 'envoye' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-[#008020]'
                    }`}>
                      {q.action === 'envoye'
                        ? <><Send size={10} /> Envoyée le {formatDate(q.createdAt)}</>
                        : <><Download size={10} /> Téléchargée le {formatDate(q.createdAt)}</>}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900 mb-2">
                      {total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </p>
                    <button
                      onClick={() => handleRegenerate(q)}
                      disabled={!!regenerating}
                      className="flex items-center gap-1.5 text-xs font-medium text-[#008020] hover:bg-green-50 disabled:opacity-50 px-2.5 py-1.5 rounded-lg border border-green-200 transition-colors"
                    >
                      {isRegen ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                      {isRegen ? 'Génération...' : 'Re-télécharger'}
                    </button>
                  </div>
                </div>
                {errors[q.id] && (
                  <p className="text-xs text-red-500 mt-2">{errors[q.id]}</p>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
