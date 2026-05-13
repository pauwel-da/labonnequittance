'use client'

import { useState, useEffect, useRef } from 'react'
import { getBiens, getLocataires, getProprietaire } from '@/lib/db'
import { fetchQuittanceBlob, genererQuittance, buildQuittancePayload } from '@/lib/quittance'
import { renderPdfFirstPage } from '@/lib/pdfPreview'
import type { Locataire, Bien, Proprietaire } from '@/lib/types'
import Link from 'next/link'
import { FileText, Download, ChevronLeft, ChevronRight, Home, Users, AlertCircle, AlertTriangle, Loader2, CalendarDays, Eye, Send, X, CheckCircle, ArrowRight } from 'lucide-react'

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
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewName, setPreviewName] = useState('')
  const [adminUserCount, setAdminUserCount] = useState<number | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [pickerYear, setPickerYear] = useState(today.getFullYear())
  const pickerRef = useRef<HTMLDivElement>(null)

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

    // Stats admin
    fetch('/api/admin/stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.count != null && setAdminUserCount(d.count))
      .catch(() => {})
  }, [])

  function shiftDates(newYear: number, newMonth: number) {
    setDatesReglement(prev => {
      const updated: Record<string, string> = {}
      const lastDayOfMonth = new Date(newYear, newMonth + 1, 0).getDate()
      for (const [id, dateStr] of Object.entries(prev)) {
        const day = dateStr ? parseInt(dateStr.split('-')[2]) : new Date().getDate()
        const clamped = Math.min(day, lastDayOfMonth)
        updated[id] = `${newYear}-${String(newMonth + 1).padStart(2, '0')}-${String(clamped).padStart(2, '0')}`
      }
      return updated
    })
  }

  function prevMonth() {
    const newYear = month === 0 ? year - 1 : year
    const newMonth = month === 0 ? 11 : month - 1
    setYear(newYear)
    setMonth(newMonth)
    shiftDates(newYear, newMonth)
  }

  function nextMonth() {
    const newYear = month === 11 ? year + 1 : year
    const newMonth = month === 11 ? 0 : month + 1
    setYear(newYear)
    setMonth(newMonth)
    shiftDates(newYear, newMonth)
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

  function trackEvent(name: string) {
    if (typeof window !== 'undefined' && 'sa_event' in window) {
      (window as Window & { sa_event: (n: string) => void }).sa_event(name)
    }
  }

  async function handleGenerate(l: Locataire) {
    const v = validate(l)
    if (!v) return
    const datePeriode = `${year}-${String(month + 1).padStart(2, '0')}-01`
    setGenerating(l.id)
    clearError(l.id)
    trackEvent('quittance_telecharger')
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
    trackEvent('quittance_voir')
    try {
      const { blob, filename } = await fetchQuittanceBlob(l, v.bien, proprietaire!, datePeriode, v.dateReglement)
      setPreviewName(filename)
      if (window.innerWidth < 1024) {
        // Mobile : rendu en image via pdf.js
        const imageDataUrl = await renderPdfFirstPage(blob)
        setPreviewImage(imageDataUrl)
      } else {
        // Desktop : iframe
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(URL.createObjectURL(blob))
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setErrors(e => ({ ...e, [l.id]: `Erreur prévisualisation : ${msg}` }))
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
    trackEvent('quittance_envoyer')
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

  useEffect(() => {
    if (!showPicker) return
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showPicker])

  function selectMonth(y: number, m: number) {
    setYear(y)
    setMonth(m)
    shiftDates(y, m)
    setShowPicker(false)
  }

  function closePreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setPreviewImage(null)
  }

  const totalMensuel = locataires.reduce((s, l) => s + l.loyer + l.charges, 0)
  const profileIncomplete = !loading && (!proprietaire?.adresse || !proprietaire?.codePostal || !proprietaire?.ville)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#008020] text-white px-4 lg:px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold mb-4">Générer des quittances</h1>
        <p className="text-green-100 text-xs mb-1.5 uppercase tracking-wide font-medium">Période</p>
        <div className="relative" ref={pickerRef}>
          <div className="flex items-center justify-between bg-white/20 rounded-xl px-4 py-3">
            <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => { setPickerYear(year); setShowPicker(p => !p) }}
              className="font-semibold text-base capitalize hover:bg-white/20 px-3 py-1 rounded-lg transition-colors"
            >
              {monthLabel(year, month)}
            </button>
            <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          {showPicker && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl z-40 p-4">
              {/* Sélection année */}
              <div className="flex items-center justify-between mb-3">
                <button onClick={() => setPickerYear(y => y - 1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600">
                  <ChevronLeft size={16} />
                </button>
                <span className="font-semibold text-gray-800">{pickerYear}</span>
                <button onClick={() => setPickerYear(y => y + 1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600">
                  <ChevronRight size={16} />
                </button>
              </div>
              {/* Grille des mois */}
              <div className="grid grid-cols-3 gap-1.5">
                {Array.from({ length: 12 }, (_, i) => {
                  const isSelected = pickerYear === year && i === month
                  const label = new Date(pickerYear, i, 1).toLocaleDateString('fr-FR', { month: 'short' })
                  return (
                    <button
                      key={i}
                      onClick={() => selectMonth(pickerYear, i)}
                      className={`py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                        isSelected
                          ? 'bg-[#008020] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      {adminUserCount !== null && (
        <div className="px-4 lg:px-8 pt-4 max-w-4xl mx-auto">
          <div className="bg-gray-900 text-white rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Admin</span>
            <span className="text-sm font-bold">
              <span className="text-[#008020] text-2xl font-bold mr-2">{adminUserCount}</span>
              utilisateur{adminUserCount > 1 ? 's' : ''} inscrit{adminUserCount > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {profileIncomplete && (
        <div className="px-4 lg:px-8 pt-4 max-w-4xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Profil incomplet</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Ajoutez votre adresse et signature pour pouvoir générer et envoyer des quittances.
              </p>
              <Link href="/profil" className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-amber-800 hover:underline">
                Compléter mon profil <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}

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
                const isBusy = !!generating || !!previewing || !!sending || profileIncomplete
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

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handlePreview(l)}
                          disabled={isBusy}
                          className="flex items-center justify-center gap-1.5 bg-[#008020] hover:bg-green-800 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                        >
                          {isPrev ? <Loader2 size={15} className="animate-spin" /> : <Eye size={15} />}
                          Voir
                        </button>
                        <button
                          onClick={() => handleSend(l)}
                          disabled={isBusy || !l.email}
                          title={!l.email ? 'Aucun email renseigné' : undefined}
                          className="flex items-center justify-center gap-1.5 bg-[#008020] hover:bg-green-800 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                        >
                          {isSend ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                          Envoyer
                        </button>
                        <button
                          onClick={() => handleGenerate(l)}
                          disabled={isBusy}
                          className="flex items-center justify-center gap-1.5 bg-[#008020] hover:bg-green-800 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
                        >
                          {isGen ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                          Télécharger
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}

      {/* Modal prévisualisation PDF — desktop (iframe) */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
          <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
            <span className="text-sm font-medium text-gray-700 truncate">{previewName}</span>
            <div className="flex items-center gap-2 ml-4 shrink-0">
              <a href={previewUrl} download={previewName}
                className="text-sm text-[#008020] font-medium flex items-center gap-1.5 hover:underline">
                <Download size={14} /> Télécharger
              </a>
              <button onClick={closePreview} className="ml-2 text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
          </div>
          <iframe src={previewUrl} className="flex-1 w-full bg-gray-100" title="Prévisualisation quittance" />
        </div>
      )}

      {/* Modal prévisualisation PDF — mobile (image) */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
          <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
            <span className="text-sm font-medium text-gray-700 truncate">{previewName}</span>
            <button onClick={closePreview} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg ml-4">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-100 flex justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewImage} alt="Prévisualisation quittance" className="w-full max-w-lg rounded shadow-lg" />
          </div>
        </div>
      )}
    </div>
  )
}
