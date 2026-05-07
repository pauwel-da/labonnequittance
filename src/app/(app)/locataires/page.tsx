'use client'

import { useState, useEffect } from 'react'
import { getBiens, getLocataires, addLocataire, updateLocataire, deleteLocataire } from '@/lib/db'
import type { Locataire, Bien } from '@/lib/types'
import { Plus, Users, Pencil, Trash2, X, AlertTriangle, Loader2, Mail } from 'lucide-react'

const emptyForm = {
  nomPrenom: '',
  email: '',
  copieEmail: false,
  bienId: '',
  loyer: '',
  charges: '',
  dateDebut: '',
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export default function LocatairesPage() {
  const [locataires, setLocataires] = useState<Locataire[]>([])
  const [biens, setBiens] = useState<Bien[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Locataire | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [emailError, setEmailError] = useState('')

  async function reload() {
    const [locs, bs] = await Promise.all([getLocataires(), getBiens()])
    setLocataires(locs)
    setBiens(bs)
  }

  useEffect(() => {
    reload().finally(() => setLoading(false))
  }, [])

  function openNew() {
    setEditing(null)
    setForm({ ...emptyForm, bienId: biens[0]?.id ?? '' })
    setEmailError('')
    setShowForm(true)
  }

  function openEdit(l: Locataire) {
    setEditing(l)
    setForm({
      nomPrenom: l.nomPrenom,
      email: l.email,
      copieEmail: l.copieEmail,
      bienId: l.bienId,
      loyer: String(l.loyer),
      charges: String(l.charges),
      dateDebut: l.dateDebut,
    })
    setEmailError('')
    setShowForm(true)
  }

  function handleEmailChange(value: string) {
    setForm(f => ({ ...f, email: value, copieEmail: value ? f.copieEmail : false }))
    if (value && !isValidEmail(value)) {
      setEmailError('Format d\'email invalide.')
    } else {
      setEmailError('')
    }
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (form.email && !isValidEmail(form.email)) {
      setEmailError('Format d\'email invalide.')
      return
    }
    const data = {
      nomPrenom: form.nomPrenom,
      email: form.email,
      copieEmail: form.copieEmail,
      bienId: form.bienId,
      loyer: parseFloat(form.loyer) || 0,
      charges: parseFloat(form.charges) || 0,
      dateDebut: form.dateDebut,
    }
    setSaving(true)
    try {
      if (editing) {
        await updateLocataire(editing.id, data)
      } else {
        await addLocataire(data)
      }
      await reload()
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

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

      <div className="px-4 lg:px-8 -mt-3 max-w-4xl mx-auto">
        <button
          onClick={openNew}
          className="w-full bg-[#008020] hover:bg-green-800 text-white font-semibold py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Ajouter un locataire
        </button>
      </div>

      {biens.length === 0 && !loading && (
        <div className="mx-4 lg:mx-8 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 max-w-4xl mx-auto flex items-center gap-2">
          <AlertTriangle size={14} className="shrink-0" /> Vous devez d&apos;abord créer un bien immobilier.
        </div>
      )}

      <div className="px-4 lg:px-8 mt-4 space-y-3 max-w-4xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <Loader2 size={20} className="animate-spin mr-2" /> Chargement...
          </div>
        ) : locataires.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users size={28} className="text-gray-400" />
            </div>
            <p>Aucun locataire enregistré</p>
          </div>
        ) : (
          locataires.map(l => {
            const bien = getBien(l.bienId)
            const total = l.loyer + l.charges
            return (
              <div key={l.id} className="bg-white rounded-xl shadow-sm p-4 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{l.nomPrenom}</p>
                  {bien && <p className="text-sm text-gray-500">{bien.nom} — {bien.adresse}, {bien.ville}</p>}
                  {l.email && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Mail size={11} /> {l.email}
                    </p>
                  )}
                  <p className="text-sm text-[#008020] font-medium mt-1">
                    {total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € / mois
                  </p>
                  <p className="text-xs text-gray-400">
                    HC : {l.loyer.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € + Charges : {l.charges.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </p>
                </div>
                <div className="flex gap-2 ml-2">
                  <button onClick={() => openEdit(l)} className="text-[#008020] hover:bg-green-50 p-2 rounded-lg"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(l.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={16} /></button>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom(s) et Prénom(s)</label>
                <input
                  value={form.nomPrenom}
                  onChange={e => setForm(f => ({ ...f, nomPrenom: e.target.value }))}
                  required placeholder="Dupont Marie"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (optionnel)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => handleEmailChange(e.target.value)}
                  placeholder="locataire@exemple.fr"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020] ${emailError ? 'border-red-400' : 'border-gray-300'}`}
                />
                {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
              </div>
              {form.email && isValidEmail(form.email) && (
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.copieEmail}
                    onChange={e => setForm(f => ({ ...f, copieEmail: e.target.checked }))}
                    className="mt-0.5 accent-[#008020] w-4 h-4 shrink-0"
                  />
                  <span className="text-sm text-gray-700">Je veux être en copie des e-mails envoyés à ce(s) locataire(s)</span>
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
