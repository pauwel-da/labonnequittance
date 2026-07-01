'use client'

import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowLeft, Loader2, MailCheck, Shield, Lock, MapPin, AlertCircle } from 'lucide-react'
import SignaturePad from '@/components/SignaturePad'
import AddressAutocomplete from '@/components/AddressAutocomplete'
import QuittancePreview from './QuittancePreview'
import { submitTrialQuittance } from './actions'
import { verifySignupOtp } from '@/app/signup/actions'

export type TrialFormData = {
  bien: {
    adresse: string
    code_postal: string
    ville: string
    type_location: 'meuble' | 'non_meuble'
  }
  locataire: {
    nom_prenom: string
    montant_loyer: string
    montant_charges: string
    date_debut_periode: string
    date_fin_periode: string
    date_paiement: string
  }
  bailleur: {
    prenom: string
    nom: string
    adresse: string
    code_postal: string
    ville: string
    email: string
  }
  signature: string // dataUrl PNG (vide si non remplie)
}

const STORAGE_KEY = 'trial_form_v1'

// Bornes (premier/dernier jour) du mois "YYYY-MM" donné, au format YYYY-MM-DD
function monthBounds(yearMonth: string): { first: string; last: string } {
  const [y, m] = yearMonth.split('-').map(Number)
  const lastDay = new Date(y, m, 0).getDate()
  return { first: `${yearMonth}-01`, last: `${yearMonth}-${String(lastDay).padStart(2, '0')}` }
}

const today = new Date()
const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
const { first: firstOfMonth, last: lastOfMonth } = monthBounds(currentYearMonth)
const todayIso = today.toISOString().slice(0, 10)

const defaultData: TrialFormData = {
  bien: { adresse: '', code_postal: '', ville: '', type_location: 'non_meuble' },
  locataire: {
    nom_prenom: '',
    montant_loyer: '',
    montant_charges: '',
    date_debut_periode: firstOfMonth,
    date_fin_periode: lastOfMonth,
    date_paiement: todayIso,
  },
  bailleur: { prenom: '', nom: '', adresse: '', code_postal: '', ville: '', email: '' },
  signature: '',
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

export default function TrialForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [data, setData] = useState<TrialFormData>(defaultData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitTried, setSubmitTried] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<{ email: string } | null>(null)
  const [codeError, setCodeError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // localStorage hydration
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setData((prev) => ({ ...prev, ...parsed }))
      }
    } catch {}
  }, [])

  // localStorage persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {}
  }, [data])

  function updateBien<K extends keyof TrialFormData['bien']>(key: K, value: TrialFormData['bien'][K]) {
    setData((d) => ({ ...d, bien: { ...d.bien, [key]: value } }))
  }
  function updateLocataire<K extends keyof TrialFormData['locataire']>(key: K, value: TrialFormData['locataire'][K]) {
    setData((d) => ({ ...d, locataire: { ...d.locataire, [key]: value } }))
  }
  function updatePeriode(yearMonth: string) {
    const { first, last } = monthBounds(yearMonth)
    setData((d) => ({ ...d, locataire: { ...d.locataire, date_debut_periode: first, date_fin_periode: last } }))
  }
  function updateBailleur<K extends keyof TrialFormData['bailleur']>(key: K, value: TrialFormData['bailleur'][K]) {
    setData((d) => ({ ...d, bailleur: { ...d.bailleur, [key]: value } }))
  }

  function validateStep1(): boolean {
    const e: Record<string, string> = {}
    if (!data.bien.adresse.trim()) e.adresse = 'Adresse requise'
    if (!data.bien.code_postal.trim() || !/^\d{5}$/.test(data.bien.code_postal.trim())) e.code_postal = 'Code postal invalide'
    if (!data.bien.ville.trim()) e.ville = 'Ville requise'
    setErrors(e)
    return Object.keys(e).length === 0
  }
  function validateStep2(): boolean {
    const e: Record<string, string> = {}
    if (!data.locataire.nom_prenom.trim()) e.nom_prenom = 'Nom du locataire requis'
    const loyer = Number(data.locataire.montant_loyer)
    if (!loyer || loyer <= 0) e.montant_loyer = 'Montant du loyer requis'
    const charges = Number(data.locataire.montant_charges)
    if (data.locataire.montant_charges !== '' && (isNaN(charges) || charges < 0)) e.montant_charges = 'Montant invalide'
    if (!data.locataire.date_debut_periode || !data.locataire.date_fin_periode) e.periode = 'Période requise'
    if (!data.locataire.date_paiement) e.date_paiement = 'Date de paiement requise'
    setErrors(e)
    return Object.keys(e).length === 0
  }
  function validateStep3(): boolean {
    const e: Record<string, string> = {}
    if (!data.bailleur.prenom.trim()) e.prenom = 'Prénom requis'
    if (!data.bailleur.nom.trim()) e.nom = 'Nom requis'
    if (!data.bailleur.adresse.trim()) e.b_adresse = 'Adresse requise'
    if (!data.bailleur.code_postal.trim() || !/^\d{5}$/.test(data.bailleur.code_postal.trim())) e.b_code_postal = 'Code postal invalide'
    if (!data.bailleur.ville.trim()) e.b_ville = 'Ville requise'
    if (!isValidEmail(data.bailleur.email)) e.email = 'Email invalide'
    if (!data.signature?.startsWith('data:image')) e.signature = 'Signature requise pour une quittance conforme'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function goNext() {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2)
        setErrors({})
        setSubmitTried(false)
      } else {
        setSubmitTried(true)
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3)
        setErrors({})
        setSubmitTried(false)
      } else {
        setSubmitTried(true)
      }
    }
  }
  function goBack() {
    setErrors({})
    setSubmitTried(false)
    if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (step !== 3) return
    setSubmitTried(true)
    if (!validateStep3()) return
    setServerError(null)
    startTransition(async () => {
      const res = await submitTrialQuittance({
        bien: data.bien,
        locataire: {
          nom_prenom: data.locataire.nom_prenom.trim(),
          montant_loyer: Number(data.locataire.montant_loyer) || 0,
          montant_charges: Number(data.locataire.montant_charges) || 0,
          date_debut_periode: data.locataire.date_debut_periode,
          date_fin_periode: data.locataire.date_fin_periode,
          date_paiement: data.locataire.date_paiement,
        },
        bailleur: {
          prenom: data.bailleur.prenom.trim(),
          nom: data.bailleur.nom.trim(),
          adresse: data.bailleur.adresse.trim(),
          code_postal: data.bailleur.code_postal.trim(),
          ville: data.bailleur.ville.trim(),
          email: data.bailleur.email.trim(),
        },
        signature: data.signature,
      })
      const errVal = 'error' in res ? res.error : null
      if (errVal) {
        setServerError(errVal)
        return
      }
      if (!('ok' in res)) return
      try { localStorage.removeItem(STORAGE_KEY) } catch {}
      setSubmitted({ email: data.bailleur.email.trim() })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  function handleVerifyCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const token = (new FormData(e.currentTarget).get('token') as string).trim()
    setCodeError(null)
    startTransition(async () => {
      const res = await verifySignupOtp(submitted!.email, token)
      if (res?.error) setCodeError(res.error)
      // succès : verifySignupOtp redirige vers /dashboard
    })
  }

  // === SUCCESS SCREEN ===
  if (submitted) {
    return (
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-5">
            <MailCheck size={28} className="text-[#008020]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Vérifiez vos emails</h2>
          <p className="text-sm text-gray-500 mb-1">Un code à 6 chiffres a été envoyé à</p>
          <p className="text-sm font-semibold text-gray-800 mb-6">{submitted.email}</p>

          <form onSubmit={handleVerifyCode} className="space-y-4">
            <input
              name="token"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              autoComplete="one-time-code"
              autoFocus
              placeholder="000000"
              className="w-full text-center text-3xl font-mono tracking-[0.4em] border-2 border-gray-200 rounded-xl py-4 focus:outline-none focus:border-[#008020] focus:ring-2 focus:ring-[#008020]/20 transition-colors"
            />

            {codeError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {codeError}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#008020] hover:bg-green-800 disabled:opacity-75 active:scale-95 text-white font-semibold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : 'Accéder à ma quittance'}
            </button>
          </form>

          <p className="text-xs text-gray-400 mt-4">Pensez à vérifier vos spams si vous ne le recevez pas.</p>
        </div>

        {/* Preview en parallèle (rappel visuel de ce qu'il aura) */}
        <div className="hidden lg:block">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#008020] mb-3 text-center">
            Voici votre quittance
          </p>
          <QuittancePreview data={data} />
        </div>
      </div>
    )
  }

  // === FORM ===
  return (
    <div className="grid lg:grid-cols-[1fr_1fr] gap-6 lg:gap-10 items-start max-w-7xl mx-auto">
      {/* FORM (gauche) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 order-1">

        {/* Progress */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  n < step
                    ? 'bg-[#008020] text-white'
                    : n === step
                    ? 'bg-[#008020] text-white ring-4 ring-green-100'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {n < step ? '✓' : n}
              </div>
              {n < 3 && (
                <div className={`flex-1 h-0.5 mx-2 ${n < step ? 'bg-[#008020]' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest text-[#008020] mb-1">
          Étape {step}/3
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {step === 1 && 'Votre bien'}
          {step === 2 && 'Le locataire et le loyer'}
          {step === 3 && 'Vos coordonnées'}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {step === 1 && 'Où se situe le logement loué ?'}
          {step === 2 && 'Qui occupe le bien, pour quelle période et quel montant ?'}
          {step === 3 && 'Pour générer et recevoir votre quittance.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <Field label="Adresse du bien" error={submitTried ? errors.adresse : undefined}>
                <AddressAutocomplete
                  value={data.bien.adresse}
                  onChange={(adresse, cp, ville) => {
                    updateBien('adresse', adresse)
                    if (cp) updateBien('code_postal', cp)
                    if (ville) updateBien('ville', ville)
                  }}
                  placeholder="12 rue de la Paix"
                  autoFocus
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020] focus:border-transparent"
                />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Code postal" error={submitTried ? errors.code_postal : undefined} className="col-span-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    value={data.bien.code_postal}
                    onChange={(e) => updateBien('code_postal', e.target.value.replace(/\D/g, ''))}
                    placeholder="75001"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020] focus:border-transparent"
                  />
                </Field>
                <Field label="Ville" error={submitTried ? errors.ville : undefined} className="col-span-2">
                  <input
                    type="text"
                    value={data.bien.ville}
                    onChange={(e) => updateBien('ville', e.target.value)}
                    placeholder="Paris"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020] focus:border-transparent"
                  />
                </Field>
              </div>
              <Field label="Type de bail">
                <div className="grid grid-cols-2 gap-3">
                  {(['non_meuble','meuble'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => updateBien('type_location', t)}
                      className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                        data.bien.type_location === t
                          ? 'bg-green-50 text-[#008020] border-[#008020]'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {t === 'meuble' ? 'Meublé' : 'Non meublé'}
                    </button>
                  ))}
                </div>
              </Field>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <Field label="Nom et prénom du locataire" error={submitTried ? errors.nom_prenom : undefined}>
                <input
                  type="text"
                  value={data.locataire.nom_prenom}
                  onChange={(e) => updateLocataire('nom_prenom', e.target.value)}
                  placeholder="Marie Martin"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020] focus:border-transparent"
                  autoFocus
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Loyer hors charges (€)" error={submitTried ? errors.montant_loyer : undefined}>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={data.locataire.montant_loyer}
                    onChange={(e) => updateLocataire('montant_loyer', e.target.value)}
                    placeholder="850"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020] focus:border-transparent"
                  />
                </Field>
                <Field label="Charges (€)" error={submitTried ? errors.montant_charges : undefined}>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={data.locataire.montant_charges}
                    onChange={(e) => updateLocataire('montant_charges', e.target.value)}
                    placeholder="50"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020] focus:border-transparent"
                  />
                </Field>
              </div>
              <Field label="Période concernée" error={submitTried ? errors.periode : undefined}>
                <input
                  type="month"
                  value={data.locataire.date_debut_periode.slice(0, 7)}
                  onChange={(e) => e.target.value && updatePeriode(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020] focus:border-transparent"
                />
              </Field>
              <Field label="Date de paiement" error={submitTried ? errors.date_paiement : undefined}>
                <input
                  type="date"
                  value={data.locataire.date_paiement}
                  onChange={(e) => updateLocataire('date_paiement', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020] focus:border-transparent"
                />
              </Field>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Prénom" error={submitTried ? errors.prenom : undefined}>
                  <input
                    type="text"
                    value={data.bailleur.prenom}
                    onChange={(e) => updateBailleur('prenom', e.target.value)}
                    placeholder="Jean"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020] focus:border-transparent"
                    autoFocus
                  />
                </Field>
                <Field label="Nom" error={submitTried ? errors.nom : undefined}>
                  <input
                    type="text"
                    value={data.bailleur.nom}
                    onChange={(e) => updateBailleur('nom', e.target.value)}
                    placeholder="Dupont"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020] focus:border-transparent"
                  />
                </Field>
              </div>
              <Field label="Votre adresse personnelle" error={submitTried ? errors.b_adresse : undefined}>
                <AddressAutocomplete
                  value={data.bailleur.adresse}
                  onChange={(adresse, cp, ville) => {
                    updateBailleur('adresse', adresse)
                    if (cp) updateBailleur('code_postal', cp)
                    if (ville) updateBailleur('ville', ville)
                  }}
                  placeholder="5 rue de Rivoli"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020] focus:border-transparent"
                />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Code postal" error={submitTried ? errors.b_code_postal : undefined}>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    value={data.bailleur.code_postal}
                    onChange={(e) => updateBailleur('code_postal', e.target.value.replace(/\D/g, ''))}
                    placeholder="75004"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020] focus:border-transparent"
                  />
                </Field>
                <Field label="Ville" error={submitTried ? errors.b_ville : undefined} className="col-span-2">
                  <input
                    type="text"
                    value={data.bailleur.ville}
                    onChange={(e) => updateBailleur('ville', e.target.value)}
                    placeholder="Paris"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020] focus:border-transparent"
                  />
                </Field>
              </div>
              <Field label="Votre email" error={submitTried ? errors.email : undefined}>
                <input
                  type="email"
                  value={data.bailleur.email}
                  onChange={(e) => updateBailleur('email', e.target.value)}
                  placeholder="vous@exemple.fr"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020] focus:border-transparent"
                />
              </Field>
              <p className="text-[11px] text-gray-500 -mt-1 flex items-start gap-1.5">
                <Lock size={11} className="text-gray-400 shrink-0 mt-0.5" />
                Votre email sert uniquement à recevoir le code d&apos;accès à votre quittance.
              </p>

              <Field label="Votre signature" error={submitTried ? errors.signature : undefined}>
                <SignaturePad
                  value={data.signature}
                  onChange={(sig) => setData((d) => ({ ...d, signature: sig }))}
                />
              </Field>

              {serverError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  {serverError}
                </p>
              )}
            </>
          )}

          {/* NAV BUTTONS */}
          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <button
                type="button"
                onClick={goBack}
                disabled={isPending}
                className="flex items-center justify-center gap-1.5 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 font-medium px-4 py-2.5 rounded-xl text-sm transition-colors"
              >
                <ArrowLeft size={14} /> Retour
              </button>
            )}
            {step < 3 ? (
              <button
                key="continue"
                type="button"
                onClick={goNext}
                className="flex-1 flex items-center justify-center gap-2 bg-[#008020] hover:bg-green-800 text-white font-semibold px-4 py-3 rounded-xl text-sm transition-colors"
              >
                Continuer <ArrowRight size={16} />
              </button>
            ) : (
              <button
                key="submit"
                type="submit"
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 bg-[#008020] hover:bg-green-800 disabled:opacity-75 text-white font-semibold px-4 py-3 rounded-xl text-sm transition-colors"
              >
                {isPending ? (
                  <><Loader2 size={16} className="animate-spin" /> Envoi…</>
                ) : (
                  <>📩 Recevoir ma quittance par email</>
                )}
              </button>
            )}
          </div>

          {/* CGU + trust badges */}
          {step === 3 && (
            <>
              <p className="text-[11px] text-gray-400 text-center">
                En poursuivant, vous acceptez les{' '}
                <Link href="/cgu" target="_blank" className="underline hover:text-[#008020]">CGU</Link>
                {' '}et la{' '}
                <Link href="/confidentialite" target="_blank" className="underline hover:text-[#008020]">Politique de confidentialité</Link>.
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center pt-1 text-[11px] text-gray-500">
                <span className="flex items-center gap-1"><Lock size={11} /> Aucun cookie de tracking</span>
                <span className="flex items-center gap-1"><MapPin size={11} /> Hébergé en Europe</span>
                <span className="flex items-center gap-1"><Shield size={11} /> Conforme RGPD</span>
              </div>
            </>
          )}
        </form>
      </div>

      {/* PREVIEW (droite) */}
      <div className="order-2 lg:sticky lg:top-24">
        <QuittancePreview data={data} />
      </div>
    </div>
  )
}

function Field({
  label,
  error,
  children,
  className = '',
}: {
  label: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
    </div>
  )
}
