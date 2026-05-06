'use client'

import { useState, useEffect } from 'react'
import { locatairesStore, biensStore, generateId } from '@/lib/store'
import type { Locataire, Bien } from '@/lib/types'
import { Plus, Users, Pencil, Trash2, X, AlertTriangle } from 'lucide-react'

const emptyForm = {
  nom: '', prenom: '', bienId: '', loyer: '', charges: '', dateDebut: '',
}

export default function LocatairesPage() {
  const [locataires, setLocataires] = useState<Locataire[]>([])
  const [biens, setBiens] = useState<Bien[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Locataire | null>(null)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    setLocataires(locatairesStore.getAll())
    setBiens(biensStore.getAll())
  }, [])

  function openNew() {
    setEditing(null)
    setForm({ ...emptyForm, bienId: biens[0]?.id ?? '' })
    setShowForm(true)
  }

  function openEdit(l: Locataire) {
    setEditing(l)
    setForm({
      nom: l.nom, prenom: l.prenom, bienId: l.bienId,
      loyer: String(l.loyer), charges: String(l.charges), dateDebut: l.dateDebut,
    })
    setShowForm(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data: Omit<Locataire, 'id'> = {
      nom: form.nom,
      prenom: form.prenom,
      bienId: form.bienId,
      loyer: parseFloat(form.loyer) || 0,
      charges: parseFloat(form.charges) || 0,
      dateDebut: form.dateDebut,
    }
    if (editing) {
      locatairesStore.update(editing.id, data)
    } else {
      locatairesStore.add({ id: generateId(), ...data })
    }
    setLocataires(locatairesStore.getAll())
    setShowForm(false)
  }

  function handleDelete(id: string) {
    if (!confirm('Supprimer ce locataire ?')) return
    locatairesStore.delete(id)
    setLocataires(locatairesStore.getAll())
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

      {biens.length === 0 && (
        <div className="mx-4 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <AlertTriangle size={14} className="inline mr-1" /> Vous devez d&apos;abord créer un bien immobilier.
        </div>
      )}

      <div className="px-4 lg:px-8 mt-4 space-y-3 max-w-4xl mx-auto">
        {locataires.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users size={28} className="text-gray-400" />
            </div>
            <p>Aucun locataire enregistré</p>
          </div>
        )}
        {locataires.map(l => {
          const bien = getBien(l.bienId)
          const total = l.loyer + l.charges
          return (
            <div key={l.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{l.prenom} {l.nom}</p>
                  {bien && <p className="text-sm text-gray-500">{bien.adresse}, {bien.ville}</p>}
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
            </div>
          )
        })}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input
                    value={form.prenom}
                    onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                    required placeholder="Marie"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    value={form.nom}
                    onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                    required placeholder="Dupont"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bien loué</label>
                <select
                  value={form.bienId}
                  onChange={e => setForm(f => ({ ...f, bienId: e.target.value }))}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
                >
                  <option value="">Sélectionner un bien</option>
                  {biens.map(b => (
                    <option key={b.id} value={b.id}>{b.adresse} – {b.ville}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loyer HC (€)</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={form.loyer}
                    onChange={e => setForm(f => ({ ...f, loyer: e.target.value }))}
                    required placeholder="800"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Charges (€)</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={form.charges}
                    onChange={e => setForm(f => ({ ...f, charges: e.target.value }))}
                    required placeholder="50"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date début de location</label>
                <input
                  type="date"
                  value={form.dateDebut}
                  onChange={e => setForm(f => ({ ...f, dateDebut: e.target.value }))}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#008020] hover:bg-green-800 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {editing ? 'Enregistrer' : 'Ajouter'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
