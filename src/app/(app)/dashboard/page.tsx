'use client'

import { useState, useEffect } from 'react'
import { getBiens, getLocataires, getProprietaire } from '@/lib/db'
import { fetchQuittanceBlob, genererQuittance, buildQuittancePayload } from '@/lib/quittance'
import type { Locataire, Bien, Proprietaire } from '@/lib/types'
import Link from 'next/link'
import { FileText, Download, ChevronLeft, ChevronRight, Home, Users, AlertCircle, Loader2, CalendarDays, Eye, Send, X, CheckCircle } from 'lucide-react'

function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function DashboardPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [locataires, setLocataires] = useState<Locataire[]>([])
  const [biens, setBiens] = useState<Bien[]>([])
  const [proprietaire, setProprietaire] = useState<Proprietaire | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [previewing, setPreviewing] = useState<string | null>(null)
  const [sending, setSending] = useState<string | null>(null)
  const [sendSuccess, setSendSuccess] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [datesReglement, setDatesReglement] = useState<Record<string, string>>({})
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewName, setPreviewName] = useState('')

  useEffect(() => {
    Promise.all([getLocataires(), getBiens(), getProprietaire()])
      .then(([locs, bs, prop]) => {
        setLocataires(locs)
        setBiens(bs)
        setProprietaire(prop)
        const init: Record<string, string> = {}
        locs.forEach(l => { init[l.id] = todayStr() })
        setDatesReglement(init)
      })
      .finally(() => setLoading(false))
  }, [])

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  function getBien(id: string): Bien | undefined {
    return biens.find(b => b.id === id)
  }

  function clearError(id: string) {
    setErrors(e => { const n = { ...e }; delete n[id]; return n })
  }

  function validate(l: Locataire): { bien: Bien; dateReglement: string } | null {
    const bien = getBien(l.bienId)
    if (!bien) { setErrors(e => ({ ...e, [l.id]: 'Bien introuvable.' })); return null }
    if (!proprietaire?.nom && !proprietaire?.prenom) {
      setErrors(e => ({ ...e, [l.id]: 'Renseignez votre profil.' }))
      return null
    }
    const dateReglement = datesReglement[l.id] || todayStr()
    return { bien, dateReglement }
  }

  async function handleGenerate(l: Locataire) {
    const v = validate(l)
    if (!v) return
    const datePeriode = `${year}-${String(month + 1).padStart(2, '0')}-01`
    setGenerating(l.id)
    clearError(l.id)
    try {
      await genererQuittance(l, v.bien, proprietaire!, datePeriode, v.dateReglement)
    } catch {
      setErrors(e => ({ ...e, [l.id]: 'Erreur lors de la génération.' }))
    } finally {
      setGenerating(null)
    }
  }

  async function handlePreview(l: Locataire) {
    const v = validate(l)
    if (!v) return
    const datePeriode = `${year}-${String(month + 1).padStart(2, '0')}-01`
    setPreviewing(l.id)
    clearError(l.id)
    try {
      const { blob, filename } = await fetchQuittanceBlob(l, v.bien, proprietaire!, datePeriode, v.dateReglement)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(URL.createObjectURL(blob))
      setPreviewName(filename)
    } catch {
      setErrors(e => ({ ...e, [l.id]: 'Erreur lors de la prévisualisation.' }))
    } finally {
      setPreviewing(null)
    }
  }

  async function handleSend(l: Locataire) {
    const v = validate(l)
    if (!v) return
    if (!l.email) {
      setErrors(e => ({ ...e, [l.id]: 'Aucun email renseigné pour ce locataire.' }))
      return
    }
    const datePeriode = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const payload = buildQuittancePayload(l, v.bien, proprietaire!, datePeriode, v.dateReglement)
    setSending(l.id)
    clearError(l.id)
    setSendSuccess(null)
    try {
      const res = await fetch('/api/envoyer-quittance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          locataire_email: l.email,
          copie_email: l.copieEmail,
          periode_label: monthLabel(year, month),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur envoi.')
      setSendSuccess(l.id)
      setTimeout(() => setSendSuccess(s => s === l.id ? null : s), 3000)
    } catch (err: unknown) {
      setErrors(e => ({ ...e, [l.id]: err instanceof Error ? err.message : 'Erreur envoi.' }))
    } finally {
      setSending(null)
    }
  }

  function closePreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
  }

  const totalMensuel = locataires.reduce((s, l) => s + l.loyer + l.charges, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#008020] text-white px-4 lg:px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold mb-4">Générer des quittances</h1>
        <p className="text-green-100 text-xs mb-1.5 uppercase tracking-wide font-medium">Période</p>
        <div className="flex items-center justify-between bg-white/20 rounded-xl px-4 py-3">
          <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="font-semibold text-base capitalize">{monthLabel(year, month)}</span>
          <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 size={24} className="animate-spin mr-2" /> Chargement...
        </div>
      ) : (
        <>
          {locataires.length > 0 && (
            <div className="px-4 lg:px-8 py-4 max-w-4xl mx-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
                  <div className="bg-green-50 p-2 rounded-lg">
                    <Users size={18} className="text-[#008020]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Locataires</p>
                    <p className="text-xl font-bold text-gray-900">{locataires.length}</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
                  <div className="bg-green-50 p-2 rounded-lg">
                    <FileText size={18} className="text-[#008020]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total / mois</p>
                    <p className="text-xl font-bold text-gray-900">
                      {totalMensuel.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="px-4 lg:px-8 pb-6 space-y-3 max-w-4xl mx-auto">
            {locataires.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Home size={28} className="text-gray-400" />
                </div>
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
            ) : (
              locataires.map(l => {
                const bien = getBien(l.bienId)
                const total = l.loyer + l.charges
                const isGen = generating === l.id
                const isPrev = previewing === l.id
                const isSend = sending === l.id
                const isBusy = !!generating || !!previewing || !!sending
                const didSend = sendSuccess === l.id
                return (
                  <div key={l.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">{l.nomPrenom}</p>
                          {bien && <p className="text-sm text-gray-500 mt-0.5">{bien.nom} — {bien.adresse}, {bien.ville}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#008020] text-lg">
                            {total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </p>
                          <p className="text-xs text-gray-400">/ mois</p>
                        </div>
                      </div>

                      <div className="flex gap-4 text-xs text-gray-400 mb-4">
                        <span>Loyer HC : {l.loyer.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                        <span>·</span>
                        <span>Charges : {l.charges.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                      </div>

                      <div className="mb-3">
                        <label className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-1.5">
                          <CalendarDays size={13} />
                          Date de paiement
                        </label>
                        <input
                          type="date"
                          value={datesReglement[l.id] ?? todayStr()}
                          onChange={e => setDatesReglement(d => ({ ...d, [l.id]: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
                        />
                      </div>

                      {errors[l.id] && (
                        <div className="flex items-center gap-2 text-red-600 text-sm mb-3">
                          <AlertCircle size={14} /> {errors[l.id]}
                        </div>
                      )}

                      {didSend && (
                        <div className="flex items-center gap-2 text-green-700 text-sm mb-3 bg-green-50 rounded-lg px-3 py-2">
                          <CheckCircle size={14} /> Quittance envoyée à {l.email}
                        </div>
                      )}

                      {/* Actions secondaires */}
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                          onClick={() => handlePreview(l)}
                          disabled={isBusy}
                          className="flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-sm font-medium py-2.5 rounded-lg transition-colors"
                        >
                          {isPrev ? <Loader2 size={15} className="animate-spin" /> : <Eye size={15} />}
                          Prévisualiser
                        </button>
                        <button
                          onClick={() => handleSend(l)}
                          disabled={isBusy || !l.email}
                          title={!l.email ? 'Aucun email renseigné' : undefined}
                          className="flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-sm font-medium py-2.5 rounded-lg transition-colors"
                        >
                          {isSend ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                          Envoyer
                        </button>
                      </div>

                      {/* Action principale */}
                      <button
                        onClick={() => handleGenerate(l)}
                        disabled={isBusy}
                        className="w-full flex items-center justify-center gap-2 bg-[#008020] hover:bg-green-800 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                      >
                        {isGen ? (
                          <><Loader2 size={16} className="animate-spin" /> Génération...</>
                        ) : (
                          <><Download size={16} /> Quittance {monthLabel(year, month)}</>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}

      {/* Modal prévisualisation PDF */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
          <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
            <span className="text-sm font-medium text-gray-700 truncate">{previewName}</span>
            <div className="flex items-center gap-2 ml-4 shrink-0">
              <a
                href={previewUrl}
                download={previewName}
                className="text-sm text-[#008020] font-medium flex items-center gap-1.5 hover:underline"
              >
                <Download size={14} /> Télécharger
              </a>
              <button onClick={closePreview} className="ml-2 text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
          </div>
          <iframe
            src={previewUrl}
            className="flex-1 w-full bg-gray-100"
            title="Prévisualisation quittance"
          />
        </div>
      )}
    </div>
  )
}
