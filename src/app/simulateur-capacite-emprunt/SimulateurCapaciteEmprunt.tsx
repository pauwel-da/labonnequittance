'use client'

import { useState, useMemo } from 'react'
import { PlusCircle, Trash2, Home, Calculator } from 'lucide-react'

const TAUX_ENDETTEMENT_MAX = 0.35
const TAUX_ASSURANCE_MENSUEL = 0.0025 / 12 // 0.25% annuel
const PONDERATION_LOCATIF = 0.70

const DUREES = [
  { ans: 10, label: '10 ans', taux: 0.0295 },
  { ans: 15, label: '15 ans', taux: 0.0330 },
  { ans: 20, label: '20 ans', taux: 0.0350 },
  { ans: 25, label: '25 ans', taux: 0.0375 },
]

const LIBELLES_CHARGE = [
  'Crédit immobilier (rés. secondaire)',
  'Crédit immobilier locatif',
  'Crédit auto',
  'Crédit à la consommation',
  'Pension alimentaire',
  'Autres charges',
]

type Charge = { id: string; libelle: string; montant: string }

// C = M / (r/(1-(1+r)^-n) + a)  avec M = mensualité totale, r = taux mensuel, a = taux assurance mensuel
function capaciteEmprunt(mensualiteMax: number, tauxAnnuel: number, dureeAns: number): number {
  if (mensualiteMax <= 0 || tauxAnnuel <= 0) return 0
  const r = tauxAnnuel / 12
  const n = dureeAns * 12
  const facteurCredit = r / (1 - Math.pow(1 + r, -n))
  return mensualiteMax / (facteurCredit + TAUX_ASSURANCE_MENSUEL)
}

function eur(n: number) {
  return Math.round(n).toLocaleString('fr-FR') + ' €'
}

export default function SimulateurCapaciteEmprunt() {
  const [salaire, setSalaire]               = useState('')
  const [revenusLocatifs, setRevenusLocatifs] = useState('')
  const [autresRevenus, setAutresRevenus]   = useState('')
  const [apport, setApport]                 = useState('')
  const [charges, setCharges]               = useState<Charge[]>([])

  function addCharge() {
    setCharges(c => [...c, { id: crypto.randomUUID(), libelle: LIBELLES_CHARGE[0], montant: '' }])
  }
  function removeCharge(id: string) {
    setCharges(c => c.filter(ch => ch.id !== id))
  }
  function updateCharge(id: string, field: keyof Charge, value: string) {
    setCharges(c => c.map(ch => ch.id === id ? { ...ch, [field]: value } : ch))
  }

  const calc = useMemo(() => {
    const s  = parseFloat(salaire) || 0
    const rl = parseFloat(revenusLocatifs) || 0
    const ar = parseFloat(autresRevenus) || 0
    const ap = parseFloat(apport) || 0
    const totalCharges = charges.reduce((sum, ch) => sum + (parseFloat(ch.montant) || 0), 0)

    const revenusTotal  = s + rl * PONDERATION_LOCATIF + ar
    const mensualiteMax = Math.max(0, revenusTotal * TAUX_ENDETTEMENT_MAX - totalCharges)
    const tauxEndettement = revenusTotal > 0
      ? Math.min(100, ((mensualiteMax + totalCharges) / revenusTotal) * 100)
      : 0

    const parDuree = DUREES.map(d => {
      const capital   = capaciteEmprunt(mensualiteMax, d.taux, d.ans)
      const mensAssur = capital * TAUX_ASSURANCE_MENSUEL
      const n         = d.ans * 12
      const coutTotal = mensualiteMax * n - capital
      const coutAssur = mensAssur * n
      return {
        ...d,
        capital,
        prixBien: capital + ap,
        mensualiteMax,
        coutTotal,
        coutAssur,
      }
    })

    return { revenusTotal, mensualiteMax, tauxEndettement, parDuree, apport: ap }
  }, [salaire, revenusLocatifs, autresRevenus, apport, charges])

  const hasInput = (parseFloat(salaire) || 0) > 0

  return (
    <div className="grid lg:grid-cols-[1fr_1fr] gap-6 lg:gap-10 items-start max-w-7xl mx-auto">

      {/* ─── FORMULAIRE ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-7">

        {/* Section revenus */}
        <section>
          <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="bg-[#008020] text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">1</span>
            Vos revenus
          </h2>
          <div className="space-y-3">
            <Field label="Salaire ou revenu net mensuel *">
              <EurInput value={salaire} onChange={setSalaire} placeholder="3 500" autoFocus />
            </Field>
            <Field label={<>Revenus locatifs <span className="text-gray-400 font-normal text-[11px]">pondérés à 70%</span></>}>
              <EurInput value={revenusLocatifs} onChange={setRevenusLocatifs} placeholder="0" />
            </Field>
            <Field label="Autres revenus">
              <EurInput value={autresRevenus} onChange={setAutresRevenus} placeholder="0" />
            </Field>
            <Field label="Apport personnel">
              <EurInput value={apport} onChange={setApport} placeholder="20 000" />
            </Field>
          </div>
        </section>

        {/* Section charges */}
        <section>
          <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="bg-[#008020] text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">2</span>
            Vos charges actuelles
          </h2>
          <p className="text-xs text-gray-400 mb-4 ml-7">Uniquement les crédits que vous conserverez après l&apos;achat.</p>

          <div className="space-y-2 mb-3">
            {charges.map(ch => (
              <div key={ch.id} className="flex gap-2 items-center">
                <select
                  value={ch.libelle}
                  onChange={e => updateCharge(ch.id, 'libelle', e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020] bg-white text-gray-700"
                >
                  {LIBELLES_CHARGE.map(l => <option key={l}>{l}</option>)}
                </select>
                <div className="relative w-28 shrink-0">
                  <input
                    type="number"
                    min="0"
                    value={ch.montant}
                    onChange={e => updateCharge(ch.id, 'montant', e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded-lg pl-3 pr-7 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">€</span>
                </div>
                <button
                  onClick={() => removeCharge(ch.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors shrink-0 p-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addCharge}
            className="flex items-center gap-1.5 text-sm text-[#008020] hover:text-green-800 font-medium transition-colors"
          >
            <PlusCircle size={15} />
            Ajouter une charge
          </button>
        </section>

        {/* Jauge taux d'endettement */}
        {hasInput && (
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Taux d&apos;endettement</span>
              <span className={`text-sm font-bold ${calc.tauxEndettement > 35 ? 'text-red-500' : 'text-[#008020]'}`}>
                {calc.tauxEndettement.toFixed(1)}&nbsp;%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${calc.tauxEndettement > 35 ? 'bg-red-400' : 'bg-[#008020]'}`}
                style={{ width: `${calc.tauxEndettement}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">Plafond réglementaire : 35 % assurance comprise</p>
          </div>
        )}
      </div>

      {/* ─── RÉSULTATS ─── */}
      <div className="space-y-4 lg:sticky lg:top-24">
        {!hasInput ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-400">
            <Calculator size={38} className="mx-auto mb-3 opacity-25" />
            <p className="text-sm">Renseignez vos revenus<br />pour voir votre capacité d&apos;emprunt.</p>
          </div>
        ) : (
          <>
            {/* Mensualité max */}
            <div className="bg-[#008020] text-white rounded-2xl p-6">
              <p className="text-green-100 text-sm mb-1">Mensualité maximale</p>
              <p className="text-4xl font-bold tracking-tight">{eur(calc.mensualiteMax)}<span className="text-xl font-normal text-green-200">/mois</span></p>
              <p className="text-green-200 text-xs mt-1.5">assurance comprise · taux d&apos;endettement à 35 %</p>
            </div>

            {/* Tableau par durée */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                <Home size={14} className="text-[#008020]" />
                <h3 className="text-sm font-bold text-gray-900">Capacité d&apos;emprunt selon la durée</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {calc.parDuree.map((d, i) => (
                  <div key={d.ans} className={`px-5 py-4 ${i === 2 ? 'bg-green-50/60' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{d.label}</span>
                        {i === 2 && (
                          <span className="text-[10px] bg-[#008020] text-white px-1.5 py-0.5 rounded-full font-medium leading-none">
                            Populaire
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{(d.taux * 100).toFixed(2)} % / an</span>
                    </div>
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-2xl font-bold text-[#008020]">{eur(d.capital)}</p>
                        {calc.apport > 0 && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Budget total&nbsp;: <strong>{eur(d.prixBien)}</strong>
                          </p>
                        )}
                      </div>
                      <div className="text-right text-xs text-gray-400 shrink-0">
                        <p>Coût crédit&nbsp;: {eur(d.coutTotal - d.coutAssur)}</p>
                        <p>Assurance&nbsp;: {eur(d.coutAssur)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-gray-400 text-center px-2 leading-relaxed">
              Simulation indicative · taux d&apos;endettement 35 % assurance comprise · revenus locatifs pondérés à 70 % ·
              assurance emprunteur 0,25 %/an · taux indicatifs 2026, hors frais de dossier et de garantie.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}

function EurInput({ value, onChange, placeholder, autoFocus }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoFocus?: boolean
}) {
  return (
    <div className="relative">
      <input
        type="number"
        min="0"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full border border-gray-300 rounded-lg pl-3 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020] focus:border-transparent"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">€</span>
    </div>
  )
}
