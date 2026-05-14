'use client'

import { useState, useEffect } from 'react'
import { getQuittances } from '@/lib/db'
import type { QuittanceRecord } from '@/lib/types'
import { History, Download, Send, Eye, Loader2 } from 'lucide-react'

function formatPeriode(periode: string) {
  return new Date(periode).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR')
}

export default function HistoriquePage() {
  const [quittances, setQuittances] = useState<QuittanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getQuittances().then(setQuittances).finally(() => setLoading(false))
  }, [])

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
            return (
              <div key={q.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      q.action === 'envoye' ? 'bg-blue-50 text-blue-600'
                      : q.action === 'visionne' ? 'bg-purple-50 text-purple-600'
                      : 'bg-green-50 text-[#008020]'
                    }`}>
                      {q.action === 'envoye' ? <><Send size={10} /> Envoyée</>
                      : q.action === 'visionne' ? <><Eye size={10} /> Visionnée</>
                      : <><Download size={10} /> Téléchargée</>}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">{formatPeriode(q.periode)}</span>
                  </div>
                  <p className="font-semibold text-gray-900 truncate">{q.locataireNomPrenom}</p>
                  <p className="text-sm text-gray-500 truncate">{q.bienNom}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900">
                    {total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(q.createdAt)}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
