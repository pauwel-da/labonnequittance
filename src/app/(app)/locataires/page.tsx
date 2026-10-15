'use client'

import { useState, useEffect } from 'react'
import { getBiens, getLocataires, addLocataire, updateLocataire, deleteLocataire, getProprietaire, getQuittances } from '@/lib/db'
import type { Colocataire, Foyer, Locataire, Bien, Proprietaire, QuittanceRecord } from '@/lib/types'
import { Plus, Users, Pencil, Trash2, X, Loader2, Mail, FileCheck, ArrowRight, AlertCircle, Info } from 'lucide-react'
import Link from 'next/link'
import OnboardingChecklist from '@/components/OnboardingChecklist'
import { isOnboardingComplete, isProfileComplete } from '@/lib/onboarding'
import { MAX_PERSONNES, badgeFoyer, isValidEmail, nomsLocataires, personnes } from '@/lib/colocation'

// Une personne du bail dans le formulaire ; `key` stable pour React quand on en retire une.
type PersonneForm = Colocataire & { key: number }
let derniereCle = 0
const personneForm = (p: Colocataire = { nomPrenom: '', email: '' }): PersonneForm => ({ ...p, key: ++derniereCle })

const emptyForm = {
  personnes: [] as PersonneForm[],
  copieEmail: false,
  bienId: '',
  loyer: '',
  charges: '',
  dateDebut: '',
  foyer: null as Foyer | null,
}

const nbEmailsValides = (ps: Colocataire[]) => ps.filter(p => isValidEmail(p.email)).length

export default function LocatairesPage() {
  const [locataires, setLocataires] = useState<Locataire[]>([])
  const [biens, setBiens] = useState<Bien[]>([])
  const [proprietaire, setProprietaire] = useState<Proprietaire | null>(null)
  const [quittances, setQuittances] = useState<QuittanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Locataire | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)

  async function reload() {
    const [locs, bs, prop, qs] = await Promise.all([getLocataires(), getBiens(), getProprietaire(), getQuittances()])
    setLocataires(locs)
    setBiens(bs)
    setProprietaire(prop)
    setQuittances(qs)
  }

  useEffect(() => {
    reload().finally(() => setLoading(false))
  }, [])

  function openNew() {
    setEditing(null)
    setForm({ ...emptyForm, personnes: [personneForm()], bienId: biens[0]?.id ?? '' })
    setFormError(null)
    setShowForm(true)
  }

  function openEdit(l: Locataire) {
    setEditing(l)
    setForm({
      personnes: personnes(l).map(p => personneForm(p)),
      copieEmail: l.copieEmail,
      bienId: l.bienId,
      loyer: String(l.loyer),
      charges: String(l.charges),
      dateDebut: l.dateDebut,
      foyer: l.foyer,
    })
    setFormError(null)
    setShowForm(true)
  }

  function updatePersonne(index: number, patch: Partial<Colocataire>) {
    setForm(f => {
      const ps = f.personnes.map((p, i) => (i === index ? { ...p, ...patch } : p))
      const avant = nbEmailsValides(f.personnes)
      const apres = nbEmailsValides(ps)
      // Copie cochée d'office au premier email valide, décochée quand il n'y en a plus
      return { ...f, personnes: ps, copieEmail: apres === 0 ? false : avant === 0 ? true : f.copieEmail }
    })
  }

  function addPersonne() {
    setForm(f => (f.personnes.length >= MAX_PERSONNES ? f : { ...f, personnes: [...f.personnes, personneForm()] }))
  }

  function removePersonne(index: number) {
    setForm(f => {
      const ps = f.personnes.filter((_, i) => i !== index)
      return { ...f, personnes: ps, copieEmail: nbEmailsValides(ps) === 0 ? false : f.copieEmail }
    })
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    const ps = form.personnes.map(p => ({ nomPrenom: p.nomPrenom.trim(), email: p.email.trim() }))
    if (ps.some(p => p.email && !isValidEmail(p.email))) {
      setFormError('Un email n\'est pas au bon format.')
      return
    }
    const [principal, ...colocataires] = ps
    const data: Omit<Locataire, 'id'> = {
      nomPrenom: principal.nomPrenom,
      email: principal.email,
      copieEmail: form.copieEmail && nbEmailsValides(ps) > 0,
      bienId: form.bienId,
      loyer: parseFloat(form.loyer) || 0,
      charges: parseFloat(form.charges) || 0,
      dateDebut: form.dateDebut,
      colocataires,
      // À deux : couple ou colocataires (attestation CAF) ; à partir de trois : colocation
      foyer: colocataires.length === 0 ? null : colocataires.length === 1 ? form.foyer : 'colocation',
    }
    setSaving(true)
    setFormError(null)
    try {
      if (editing) {
        await updateLocataire(editing.id, data, editing)
      } else {
        await addLocataire(data)
      }
      await reload()
      setShowForm(false)
    } catch (err) {
      console.error('[locataires] enregistrement impossible', err)
      setFormError('Enregistrement impossible. Vérifiez votre connexion et réessayez.')
    } finally {
      setSaving(false)
    }
  }

  // Arrivée ou départ d'un colocataire sur un bail existant : à signaler à la CAF
  const changementColoc = !!editing && 1 + editing.colocataires.length !== form.personnes.length

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce locataire ?')) return
    await deleteLocataire(id)
    await reload()
  }

  function getBien(bienId: string) {
    return biens.find(b => b.id === bienId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#008020] text-white px-4 lg:px-8 pt-8 pb-5">
        <h1 className="text-2xl font-bold">Locataires</h1>
        <p className="text-green-100 text-sm mt-1">{locataires.length} locataire{locataires.length !== 1 ? 's' : ''}</p>
      </header>

      {!loading && (
        <OnboardingChecklist
          proprietaire={proprietaire}
          biens={biens}
          locataires={locataires}
          quittances={quittances}
        />
      )}

      {!loading && isProfileComplete(proprietaire) && (
        biens.length === 0 ? (
          <div className="px-4 lg:px-8 -mt-3 max-w-4xl mx-auto">
            <Link
              href="/biens"
              className="w-full bg-[#008020] hover:bg-green-800 text-white font-semibold py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              Créer un bien d&apos;abord <ArrowRight size={16} />
            </Link>
          </div>
        ) : isOnboardingComplete(proprietaire, biens, locataires, quittances) ? (
          <div className="px-4 lg:px-8 -mt-3 max-w-4xl mx-auto">
            <button
              onClick={openNew}
              className="w-full bg-[#008020] hover:bg-green-800 text-white font-semibold py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Ajouter un locataire
            </button>
          </div>
        ) : null
      )}

      <div className="px-4 lg:px-8 mt-4 space-y-3 max-w-4xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <Loader2 size={20} className="animate-spin mr-2" /> Chargement...
          </div>
        ) : locataires.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-400 mb-4">Aucun locataire enregistré</p>
            {biens.length > 0 && isProfileComplete(proprietaire) && (
              <button
                onClick={openNew}
                className="inline-flex items-center gap-1.5 bg-[#008020] hover:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Ajouter mon premier locataire <ArrowRight size={14} />
              </button>
            )}
          </div>
        ) : (
          locataires.map(l => {
            const bien = getBien(l.bienId)
            const total = l.loyer + l.charges
            const ps = personnes(l)
            const badge = badgeFoyer(l)
            return (
              <div key={l.id} className="bg-white rounded-xl shadow-sm p-4 flex items-start justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-x-2 gap-y-1 flex-wrap">
                    <p className="font-semibold text-gray-900">{nomsLocataires(l)}</p>
                    {badge && (
                      <span className="text-[11px] font-semibold text-gray-700 bg-gray-100 rounded-full px-2 py-0.5 whitespace-nowrap">{badge}</span>
                    )}
                  </div>
                  {bien && <p className="text-sm text-gray-500">{bien.nom} — {bien.adresse}, {bien.ville}</p>}
                  {ps.map((p, i) => p.email ? (
                    <p key={i} className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 break-all">
                      <Mail size={11} className="shrink-0" /> {p.email}
                    </p>
                  ) : ps.length > 1 ? (
                    // En colocation, signale qui ne recevra pas la quittance par email
                    <p key={i} className="text-xs text-amber-700 flex items-center gap-1 mt-0.5">
                      <AlertCircle size={11} className="shrink-0" /> {p.nomPrenom} : sans email
                    </p>
                  ) : null)}
                  <p className="text-sm text-[#008020] font-medium mt-1">
                    {total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € / mois
                  </p>
                  <p className="text-xs text-gray-400">
                    HC : {l.loyer.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € + Charges : {l.charges.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </p>
                </div>
                <div className="flex flex-col gap-2 ml-2 items-end">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(l)} className="text-[#008020] hover:bg-green-50 p-2 rounded-lg"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(l.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                  <Link href={`/locataires/${l.id}/attestation-caf`}
                    className="flex items-center gap-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                    <FileCheck size={13} /> Attestation CAF
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{editing ? 'Modifier' : 'Nouveau locataire'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personnes du bail : locataire principal + colocataires */}
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-700">Locataires du bail</p>
                  <p className="text-xs text-gray-500 mt-0.5">Tous les noms figurent sur la quittance. Chaque email la reçoit.</p>
                </div>
                {form.personnes.map((p, i) => {
                  const emailInvalide = !!p.email.trim() && !isValidEmail(p.email)
                  const titre = i === 0 ? 'Locataire principal' : `Colocataire ${i + 1}`
                  return (
                    <div key={p.key} className="border border-gray-200 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between min-h-5">
                        <span className={`text-xs font-semibold ${i === 0 ? 'text-[#008020]' : 'text-gray-500'}`}>{titre}</span>
                        {i > 0 && (
                          <button
                            type="button"
                            onClick={() => removePersonne(i)}
                            aria-label={`Retirer ${p.nomPrenom.trim() || `le colocataire ${i + 1}`}`}
                            className="-my-2 -mr-2 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <input
                        value={p.nomPrenom}
                        onChange={e => updatePersonne(i, { nomPrenom: e.target.value })}
                        required
                        placeholder="Nom(s) et prénom(s)"
                        aria-label={`${titre} : nom et prénom`}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
                      />
                      <input
                        type="email"
                        value={p.email}
                        onChange={e => updatePersonne(i, { email: e.target.value })}
                        placeholder="Email (optionnel)"
                        aria-label={`${titre} : email (optionnel)`}
                        aria-invalid={emailInvalide}
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020] ${emailInvalide ? 'border-red-400' : 'border-gray-300'}`}
                      />
                      {emailInvalide && <p className="text-xs text-red-500">Format d&apos;email invalide.</p>}
                    </div>
                  )
                })}
                <div className="flex items-center justify-between gap-3">
                  {form.personnes.length < MAX_PERSONNES ? (
                    <button
                      type="button"
                      onClick={addPersonne}
                      className="-ml-2 flex items-center gap-1.5 px-2 py-2 rounded-lg text-sm font-semibold text-[#008020] hover:bg-green-50 transition-colors"
                    >
                      <Plus size={16} /> Ajouter un colocataire
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500">{MAX_PERSONNES} personnes au maximum par bail</span>
                  )}
                  <span className="text-xs text-gray-500">
                    {form.personnes.length > 1 ? `${form.personnes.length} sur ${MAX_PERSONNES}` : 'Colocation, couple…'}
                  </span>
                </div>
              </div>

              {/* À deux : couple ou colocataires (sert à l'attestation CAF) */}
              {form.personnes.length === 2 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1.5">Ces deux personnes sont</p>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      ['couple', 'En couple', 'un seul foyer'],
                      ['colocation', 'Colocataires', 'foyers séparés'],
                    ] as const).map(([valeur, label, detail]) => (
                      <button
                        key={valeur}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, foyer: valeur }))}
                        aria-pressed={form.foyer === valeur}
                        className={`rounded-lg border-2 px-3 py-2 text-left transition-colors ${
                          form.foyer === valeur ? 'border-[#008020] bg-green-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className={`block text-sm font-medium ${form.foyer === valeur ? 'text-[#008020]' : 'text-gray-700'}`}>{label}</span>
                        <span className="block text-xs text-gray-500">{detail}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Sert à remplir l&apos;attestation CAF. Vous pouvez le préciser plus tard.</p>
                </div>
              )}

              {changementColoc && (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex gap-2">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <span>
                    Arrivée ou départ d&apos;un colocataire : si vos locataires touchent une aide au logement,
                    signalez-le à la CAF (Espace bailleur sur caf.fr).
                  </span>
                </p>
              )}

              {nbEmailsValides(form.personnes) > 0 && (
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.copieEmail}
                    onChange={e => setForm(f => ({ ...f, copieEmail: e.target.checked }))}
                    className="mt-0.5 accent-[#008020] w-4 h-4 shrink-0"
                  />
                  <span className="text-sm text-gray-700">
                    Je veux être en copie des e-mails envoyés {form.personnes.length > 1 ? 'aux locataires' : 'à ce locataire'}
                  </span>
                </label>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bien loué</label>
                <select
                  value={form.bienId}
                  onChange={e => setForm(f => ({ ...f, bienId: e.target.value }))}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
                >
                  <option value="">Sélectionner un bien</option>
                  {biens.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loyer HC (€)</label>
                  <input type="number" min="0" step="0.01" value={form.loyer}
                    onChange={e => setForm(f => ({ ...f, loyer: e.target.value }))}
                    required placeholder="800"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Charges (€)</label>
                  <input type="number" min="0" step="0.01" value={form.charges}
                    onChange={e => setForm(f => ({ ...f, charges: e.target.value }))}
                    required placeholder="50"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date début de location</label>
                <input type="date" value={form.dateDebut}
                  onChange={e => setForm(f => ({ ...f, dateDebut: e.target.value }))}
                  required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]" />
              </div>
              {formError && (
                <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
              )}
              <button type="submit" disabled={saving}
                className="w-full bg-[#008020] hover:bg-green-800 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                {saving ? <><Loader2 size={16} className="animate-spin" /> Enregistrement...</> : editing ? 'Enregistrer' : 'Ajouter'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
