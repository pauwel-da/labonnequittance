'use client'

import { useState, useMemo } from 'react'
import { Calculator } from 'lucide-react'

const IRL_TABLE = [
  { trim: 'T1 2022', val: 131.12 },
  { trim: 'T2 2022', val: 133.93 },
  { trim: 'T3 2022', val: 136.27 },
  { trim: 'T4 2022', val: 138.29 },
  { trim: 'T1 2023', val: 138.61 },
  { trim: 'T2 2023', val: 140.59 },
  { trim: 'T3 2023', val: 141.46 },
  { trim: 'T4 2023', val: 141.03 },
  { trim: 'T1 2024', val: 142.06 },
  { trim: 'T2 2024', val: 143.47 },
  { trim: 'T3 2024', val: 144.51 },
  { trim: 'T4 2024', val: 145.45 },
]

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function CalculateurIRL() {
  const [loyer, setLoyer]   = useState('')
  const [irlRef, setIrlRef] = useState('')
  const [irlNew, setIrlNew] = useState('')

  const result = useMemo(() => {
    const l  = parseFloat(loyer.replace(',', '.'))
    const r  = parseFloat(irlRef.replace(',', '.'))
    const n  = parseFloat(irlNew.replace(',', '.'))
    if (!l || !r || !n || r === 0) return null
    const nouveauLoyer = l * (n / r)
    const augmentation = nouveauLoyer - l
    const pct          = ((n - r) / r) * 100
    return { nouveauLoyer, augmentation, pct }
  }, [loyer, irlRef, irlNew])

  return (
    <div className="space-y-6">
      {/* Formulaire */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Loyer actuel hors charges (€)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={loyer}
            onChange={e => setLoyer(e.target.value)}
            placeholder="Ex : 850"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              IRL de référence <span className="text-gray-400 font-normal">(indiqué dans le bail)</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={irlRef}
              onChange={e => setIrlRef(e.target.value)}
              placeholder="Ex : 144.51"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nouvel IRL applicable <span className="text-gray-400 font-normal">(source : INSEE)</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={irlNew}
              onChange={e => setIrlNew(e.target.value)}
              placeholder="Ex : 145.45"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
            />
          </div>
        </div>
      </div>

      {/* Résultat */}
      {result ? (
        <div className="bg-[#008020] text-white rounded-2xl p-6 space-y-4">
          <div>
            <p className="text-green-200 text-sm mb-1">Nouveau loyer HC</p>
            <p className="text-4xl font-bold">{fmt(result.nouveauLoyer)} €<span className="text-xl font-normal text-green-200">/mois</span></p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/20">
            <div>
              <p className="text-green-200 text-xs mb-0.5">Augmentation</p>
              <p className="text-xl font-bold">+{fmt(result.augmentation)} €</p>
            </div>
            <div>
              <p className="text-green-200 text-xs mb-0.5">Variation IRL</p>
              <p className="text-xl font-bold">+{result.pct.toFixed(2)} %</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center text-gray-400">
          <Calculator size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Renseignez les trois champs pour calculer la révision.</p>
        </div>
      )}

      {/* Tableau IRL */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Valeurs IRL (source : INSEE)
        </p>
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">Trimestre</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-right">Indice</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-right">Utiliser</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...IRL_TABLE].reverse().map(row => (
                <tr key={row.trim} className="bg-white hover:bg-green-50/40 transition-colors">
                  <td className="px-4 py-2.5 text-gray-700 font-medium">{row.trim}</td>
                  <td className="px-4 py-2.5 text-gray-900 font-mono text-right">{row.val.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex gap-1.5 justify-end">
                      <button
                        onClick={() => setIrlRef(String(row.val))}
                        className="text-[10px] font-semibold text-gray-500 hover:text-[#008020] border border-gray-200 hover:border-[#008020] rounded-md px-2 py-0.5 transition-colors"
                      >
                        Réf.
                      </button>
                      <button
                        onClick={() => setIrlNew(String(row.val))}
                        className="text-[10px] font-semibold text-[#008020] border border-[#008020] rounded-md px-2 py-0.5 hover:bg-green-50 transition-colors"
                      >
                        Nouveau
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-amber-50 border-t border-amber-100 px-4 py-2.5">
            <p className="text-xs text-amber-700">
              Valeurs 2025–2026 non incluses · Consultez{' '}
              <a href="https://www.insee.fr/fr/statistiques/serie/001515333" target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                insee.fr
              </a>{' '}
              pour les dernières publications.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
