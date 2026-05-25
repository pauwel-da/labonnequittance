'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getLocataires, getBiens, getProprietaire, getQuittances, saveProprietaire, addQuittance } from '@/lib/db'
import type { Locataire, Bien, Proprietaire, QuittanceRecord } from '@/lib/types'
import { ArrowLeft, FileCheck, Download, Loader2, PenLine, Trash2, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export default function AttestationCafPage() {
  const { id } = useParams<{ id: string }>()

  const [locataire, setLocataire] = useState<Locataire | null>(null)
  const [bien, setBien] = useState<Bien | null>(null)
  const [proprietaire, setProprietaire] = useState<Proprietaire | null>(null)
  const [quittances, setQuittances] = useState<QuittanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [savingSignature, setSavingSignature] = useState(false)

  // Champs formulaire
  const [telephone, setTelephone] = useState('')
  const [surface, setSurface] = useState('')
  const [colocation, setColocation] = useState(false)
  const [nombreColoc, setNombreColoc] = useState('')
  const [montantColoc, setMontantColoc] = useState('')
  const [pieceUnique, setPieceUnique] = useState(false)
  const [sousLocation, setSousLocation] = useState(false)
  const [hotelPension, setHotelPension] = useState(false)
  const [typeSousLoc, setTypeSousLoc] = useState<'association' | 'famille_accueil' | 'autre' | ''>('')
  const [sousLocPrecision, setSousLocPrecision] = useState('')
  const [logementDecent, setLogementDecent] = useState(true)
  const [locataireAJour, setLocataireAJour] = useState(true)
  const [dernierLoyerImpaye, setDernierLoyerImpaye] = useState('')
  const [recevoirAide, setRecevoirAide] = useState(false)

  const [pregenBlob, setPregenBlob] = useState<Blob | null>(null)
  const [pregenLoading, setPregenLoading] = useState(false)

  // Signature pad
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [signatureEmpty, setSignatureEmpty] = useState(true)

  useEffect(() => {
    async function load() {
      const [locs, bs, prop, qs] = await Promise.all([
        getLocataires(), getBiens(), getProprietaire(), getQuittances()
      ])
      const loc = locs.find(l => l.id === id) ?? null
      const b = loc ? bs.find(b => b.id === loc.bienId) ?? null : null
      setLocataire(loc)
      setBien(b)
      setProprietaire(prop)
      setQuittances(qs)

      // Vérifier si locataire à jour (quittance ce mois-ci)
      if (loc) {
        const now = new Date()
        const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
        const hasQuittance = qs.some(q => q.locataireId === loc.id && q.periode.startsWith(currentPeriod.slice(0, 7)))
        setLocataireAJour(hasQuittance)
      }

      // Email du bailleur
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) setUserEmail(user.email)
    }
    load().finally(() => setLoading(false))
  }, [id])

  // Pré-génération debounced
  useEffect(() => {
    if (!locataire || !bien || !proprietaire || !surface.trim()) {
      setPregenBlob(null)
      setPregenLoading(false)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      return
    }

    setPregenBlob(null)
    setPregenLoading(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      const signatureImage = proprietaire.signature ||
        (!signatureEmpty && canvasRef.current ? canvasRef.current.toDataURL('image/png') : '')
      try {
        const res = await fetch('/api/generer-attestation-caf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nom_prenom_bailleur: `${proprietaire.prenom} ${proprietaire.nom}`.trim(),
            adresse_bailleur: `${proprietaire.adresse}, ${proprietaire.codePostal} ${proprietaire.ville}`,
            email_bailleur: userEmail,
            signature_image: signatureImage,
            telephone,
            nom_prenom_locataire1: locataire.nomPrenom,
            adresse_locataire: `${bien.adresse}, ${bien.codePostal} ${bien.ville}`,
            date_debut: locataire.dateDebut,
            localisation: proprietaire.ville,
            loyer_hors_charges: locataire.loyer,
            charges: locataire.charges,
            type_location: bien.typeLocation,
            surface,
            colocation,
            nombre_colocataires: nombreColoc,
            montant_total_colocation: montantColoc,
            piece_unique: pieceUnique,
            sous_location: sousLocation,
            hotel_pension: hotelPension,
            type_sous_location: typeSousLoc,
            sous_location_precision: sousLocPrecision,
            logement_decent: logementDecent,
            locataire_a_jour: locataireAJour,
            mois_dernier_loyer_impaye: dernierLoyerImpaye,
            recevoir_aide: recevoirAide,
          }),
        })
        if (res.ok) setPregenBlob(await res.blob())
      } catch {
        // silently fail, fallback to génération au clic
      } finally {
        setPregenLoading(false)
      }
    }, 800)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [locataire, bien, proprietaire, userEmail, telephone, surface, colocation, nombreColoc, montantColoc, pieceUnique, sousLocation, hotelPension, typeSousLoc, sousLocPrecision, logementDecent, locataireAJour, dernierLoyerImpaye, recevoirAide, signatureEmpty])

  // Signature pad handlers
  function getXY(e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect()
    const src = 'touches' in e ? e.touches[0] : e
    return {
      x: (src.clientX - rect.left) * (canvas.width / rect.width),
      y: (src.clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    drawing.current = true
    lastPos.current = getXY(e.nativeEvent, canvasRef.current!)
  }

  function doDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    if (!drawing.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const pos = getXY(e.nativeEvent, canvas)
    if (lastPos.current) {
      ctx.beginPath()
      ctx.moveTo(lastPos.current.x, lastPos.current.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.strokeStyle = '#111827'
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.stroke()
      setSignatureEmpty(false)
    }
    lastPos.current = pos
  }

  const stopDraw = useCallback(() => {
    drawing.current = false
    lastPos.current = null
  }, [])

  function clearSignature() {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
    setSignatureEmpty(true)
  }

  async function saveSignatureToProfile() {
    if (!canvasRef.current || signatureEmpty || !proprietaire) return
    setSavingSignature(true)
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png')
      await saveProprietaire({ ...proprietaire, signature: dataUrl })
      setProprietaire(p => p ? { ...p, signature: dataUrl } : p)
    } finally {
      setSavingSignature(false)
    }
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!locataire || !bien || !proprietaire) {
      setError('Données manquantes. Vérifiez votre profil propriétaire.')
      return
    }
    if (!surface.trim()) {
      setError('Veuillez renseigner la surface habitable.')
      return
    }
    if (!locataireAJour && !dernierLoyerImpaye.trim()) {
      setError('Veuillez indiquer le mois et l\'année du dernier loyer payé.')
      return
    }
    if (colocation && (!nombreColoc || !montantColoc)) {
      setError('Veuillez renseigner le nombre de colocataires et le montant total.')
      return
    }

    setGenerating(true)
    setError(null)

    try {
      let blob = pregenBlob && !pregenLoading ? pregenBlob : null

      if (!blob) {
        const signatureImage = proprietaire.signature ||
          (!signatureEmpty && canvasRef.current ? canvasRef.current.toDataURL('image/png') : '')
        const res = await fetch('/api/generer-attestation-caf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nom_prenom_bailleur: `${proprietaire.prenom} ${proprietaire.nom}`.trim(),
            adresse_bailleur: `${proprietaire.adresse}, ${proprietaire.codePostal} ${proprietaire.ville}`,
            email_bailleur: userEmail,
            signature_image: signatureImage,
            telephone,
            nom_prenom_locataire1: locataire.nomPrenom,
            adresse_locataire: `${bien.adresse}, ${bien.codePostal} ${bien.ville}`,
            date_debut: locataire.dateDebut,
            localisation: proprietaire.ville,
            loyer_hors_charges: locataire.loyer,
            charges: locataire.charges,
            type_location: bien.typeLocation,
            surface,
            colocation,
            nombre_colocataires: nombreColoc,
            montant_total_colocation: montantColoc,
            piece_unique: pieceUnique,
            sous_location: sousLocation,
            hotel_pension: hotelPension,
            type_sous_location: typeSousLoc,
            sous_location_precision: sousLocPrecision,
            logement_decent: logementDecent,
            locataire_a_jour: locataireAJour,
            mois_dernier_loyer_impaye: dernierLoyerImpaye,
            recevoir_aide: recevoirAide,
          }),
        })
        if (!res.ok) throw new Error('Erreur génération')
        blob = await res.blob()
      }

      const filename = `attestation-caf-${locataire.nomPrenom.replace(/\s+/g, '_')}.pdf`

      if (/iPad|iPhone|iPod/.test(navigator.userAgent) && 'share' in navigator) {
        const file = new File([blob], filename, { type: 'application/pdf' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Attestation CAF' }).catch(() => {})
          return
        }
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)

      const now = new Date()
      const periode = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
      addQuittance({ locataireId: locataire.id, bienId: bien!.id, locataireNomPrenom: locataire.nomPrenom, bienNom: bien!.nom, periode, datePaiement: now.toISOString().slice(0, 10), montantLoyer: locataire.loyer, montantCharges: locataire.charges, action: 'caf' }).catch(err => console.error('[CAF] addQuittance failed:', err))
    } catch {
      setError('Erreur lors de la génération. Vérifiez votre connexion et réessayez.')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
      <Loader2 size={20} className="animate-spin mr-2" /> Chargement...
    </div>
  )

  if (!locataire || !bien) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Locataire introuvable.</p>
    </div>
  )

  const needsSignature = !proprietaire?.signature

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#008020] text-white px-4 lg:px-8 pt-8 pb-5">
        <Link href="/locataires" className="flex items-center gap-2 text-green-100 text-sm mb-4 hover:text-white w-fit">
          <ArrowLeft size={16} /> Retour
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-xl p-2"><FileCheck size={22} /></div>
          <div>
            <h1 className="text-xl font-bold">Attestation de loyer CAF</h1>
            <p className="text-green-100 text-sm">Cerfa n° 10842*07 — {locataire.nomPrenom}</p>
          </div>
        </div>
      </header>

      <div className="px-4 lg:px-8 mt-6 max-w-2xl mx-auto space-y-5 pb-10">

        {/* Données pré-remplies */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Données pré-remplies</p>
          {[
            { label: 'Bailleur', value: `${proprietaire?.prenom} ${proprietaire?.nom}` },
            { label: 'Locataire', value: locataire.nomPrenom },
            { label: 'Bien', value: `${bien.adresse}, ${bien.codePostal} ${bien.ville}` },
            { label: 'Loyer HC', value: `${locataire.loyer} €` },
            { label: 'Charges', value: `${locataire.charges} €` },
            { label: 'Type', value: bien.typeLocation === 'meuble' ? 'Meublé' : 'Non meublé' },
          ].map(r => (
            <div key={r.label} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
              <span className="text-gray-500">{r.label}</span>
              <span className="font-medium text-gray-800">{r.value}</span>
            </div>
          ))}
        </div>

        {/* Signature */}
        {needsSignature && (
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <p className="text-sm font-semibold text-gray-700">Signature du bailleur</p>
            <p className="text-xs text-gray-400">Vous n&apos;avez pas encore de signature enregistrée. Dessinez-la ci-dessous.</p>
            <div className="relative border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={600}
                height={120}
                className="w-full touch-none cursor-crosshair block"
                onMouseDown={startDraw}
                onMouseMove={doDraw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={doDraw}
                onTouchEnd={stopDraw}
              />
              {signatureEmpty && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-gray-300 text-sm flex items-center gap-2"><PenLine size={14} /> Signez ici</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={clearSignature} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors">
                <Trash2 size={12} /> Effacer
              </button>
              {!signatureEmpty && (
                <button type="button" onClick={saveSignatureToProfile} disabled={savingSignature}
                  className="flex items-center gap-1.5 text-xs text-[#008020] hover:underline disabled:opacity-50 ml-auto">
                  {savingSignature ? <Loader2 size={12} className="animate-spin" /> : null}
                  Enregistrer dans mon profil
                </button>
              )}
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Contact bailleur</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone <span className="text-gray-400 font-normal">(facultatif)</span></label>
            <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)}
              placeholder="0612345678"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]" />
          </div>
        </div>

        {/* Logement */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Logement</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Surface habitable (m²)</label>
            <input type="number" min="1" value={surface} onChange={e => setSurface(e.target.value)}
              placeholder="45"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ce logement est-il une pièce unique sans WC ?</label>
            <div className="flex gap-3">
              {[{ v: true, l: 'Oui' }, { v: false, l: 'Non' }].map(opt => (
                <button key={String(opt.v)} type="button" onClick={() => setPieceUnique(opt.v)}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                    pieceUnique === opt.v ? 'border-[#008020] bg-green-50 text-[#008020]' : 'border-gray-200 text-gray-600'
                  }`}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <label className="text-sm font-medium text-gray-700">Ce logement respecte-t-il les caractéristiques de décence ?</label>
              <div className="relative group">
                <Info size={14} className="text-gray-400 cursor-help shrink-0" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-gray-900 text-white text-xs rounded-lg px-3 py-2.5 hidden group-hover:block z-10 shadow-lg">
                  <p className="font-semibold mb-1">Décret n° 2002-120 du 30 jan. 2002</p>
                  <ul className="space-y-0.5 list-disc list-inside text-gray-300">
                    <li>Surface ≥ 9 m² et hauteur ≥ 2,20 m (ou volume ≥ 20 m³)</li>
                    <li>Structure solide, étanchéité, ventilation correcte</li>
                    <li>Eau potable, WC intérieur, évacuation des eaux usées</li>
                    <li>Chauffage et production d'eau chaude</li>
                    <li>Coin cuisine avec évier et branchements</li>
                    <li>Réseau électrique conforme, éclairage naturel</li>
                    <li>Absence d'animaux nuisibles et de parasites</li>
                  </ul>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {[{ v: true, l: 'Oui' }, { v: false, l: 'Non' }].map(opt => (
                <button key={String(opt.v)} type="button" onClick={() => setLogementDecent(opt.v)}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                    logementDecent === opt.v ? 'border-[#008020] bg-green-50 text-[#008020]' : 'border-gray-200 text-gray-600'
                  }`}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Colocation */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Colocation</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">S&apos;agit-il d&apos;une colocation ?</label>
            <div className="flex gap-3">
              {[{ v: true, l: 'Oui' }, { v: false, l: 'Non' }].map(opt => (
                <button key={String(opt.v)} type="button" onClick={() => setColocation(opt.v)}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                    colocation === opt.v ? 'border-[#008020] bg-green-50 text-[#008020]' : 'border-gray-200 text-gray-600'
                  }`}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
          {colocation && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de colocataires</label>
                <input type="number" min="2" value={nombreColoc} onChange={e => setNombreColoc(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant total charges incluses (€)</label>
                <input type="number" min="0" step="0.01" value={montantColoc} onChange={e => setMontantColoc(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]" />
              </div>
            </div>
          )}
        </div>

        {/* Sous-location */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Sous-location</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">S&apos;agit-il d&apos;une sous-location ?</label>
            <div className="flex gap-3">
              {[{ v: true, l: 'Oui' }, { v: false, l: 'Non' }].map(opt => (
                <button key={String(opt.v)} type="button" onClick={() => setSousLocation(opt.v)}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                    sousLocation === opt.v ? 'border-[#008020] bg-green-50 text-[#008020]' : 'border-gray-200 text-gray-600'
                  }`}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
          {sousLocation && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de sous-location</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: 'association', l: 'Association' },
                    { v: 'famille_accueil', l: 'Famille d\'accueil' },
                    { v: 'autre', l: 'Autre' },
                  ].map(opt => (
                    <button key={opt.v} type="button" onClick={() => setTypeSousLoc(opt.v as typeof typeSousLoc)}
                      className={`py-2 rounded-lg border-2 text-xs font-medium transition-colors ${
                        typeSousLoc === opt.v ? 'border-[#008020] bg-green-50 text-[#008020]' : 'border-gray-200 text-gray-600'
                      }`}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>
              {typeSousLoc === 'autre' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Précision</label>
                  <input value={sousLocPrecision} onChange={e => setSousLocPrecision(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">S&apos;agit-il d&apos;un hôtel ou pension de famille ?</label>
                <div className="flex gap-3">
                  {[{ v: true, l: 'Oui' }, { v: false, l: 'Non' }].map(opt => (
                    <button key={String(opt.v)} type="button" onClick={() => setHotelPension(opt.v)}
                      className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                        hotelPension === opt.v ? 'border-[#008020] bg-green-50 text-[#008020]' : 'border-gray-200 text-gray-600'
                      }`}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Paiement */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Paiement</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Le locataire est-il à jour de ses loyers ?</label>
            <p className="text-xs text-gray-400 mb-2">
              {quittances.some(q => q.locataireId === locataire.id)
                ? 'Détecté automatiquement via votre historique de quittances.'
                : 'Aucune quittance trouvée ce mois-ci.'}
            </p>
            <div className="flex gap-3">
              {[{ v: true, l: 'Oui' }, { v: false, l: 'Non' }].map(opt => (
                <button key={String(opt.v)} type="button" onClick={() => setLocataireAJour(opt.v)}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                    locataireAJour === opt.v ? 'border-[#008020] bg-green-50 text-[#008020]' : 'border-gray-200 text-gray-600'
                  }`}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
          {!locataireAJour && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mois et année du dernier loyer payé (MM/AAAA)</label>
              <input value={dernierLoyerImpaye} onChange={e => setDernierLoyerImpaye(e.target.value)}
                placeholder="03/2026"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Souhaitez-vous recevoir directement l&apos;aide au logement ?</label>
            <div className="flex gap-3">
              {[{ v: true, l: 'Oui' }, { v: false, l: 'Non' }].map(opt => (
                <button key={String(opt.v)} type="button" onClick={() => setRecevoirAide(opt.v)}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                    recevoirAide === opt.v ? 'border-[#008020] bg-green-50 text-[#008020]' : 'border-gray-200 text-gray-600'
                  }`}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
        )}

        <button type="button" onClick={handleSubmit} disabled={generating}
          className="w-full bg-[#008020] hover:bg-green-800 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
          {generating
            ? <><Loader2 size={16} className="animate-spin" /> Génération...</>
            : <><Download size={16} /> Télécharger l&apos;attestation CAF</>
          }
        </button>

        {pregenLoading && !generating && (
          <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1">
            <Loader2 size={10} className="animate-spin" /> Préparation du document...
          </p>
        )}

      </div>
    </div>
  )
}
