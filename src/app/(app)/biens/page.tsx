'use client'

import { useState, useEffect } from 'react'
import { getBiens, addBien, updateBien, deleteBien } from '@/lib/db'
import type { Bien, BienType } from '@/lib/types'
import { Plus, Home, Pencil, Trash2, X, Loader2 } from 'lucide-react'

const TYPES: { value: BienType; label: string }[] = [
  { value: 'meuble', label: 'Meublé' },
  { value: 'non_meuble', label: 'Non meublé' },
]

const emptyForm = { nom: '', adresse: '', codePostal: '', ville: '', typeLocation: 'meuble' as BienType }

export default function BiensPage() {
  const [biens, setBiens] = useState<Bien[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Bien | null>(null)
  const [form, setForm] = useState(emptyForm)

  async function reload() {
    setBiens(await getBiens())
  }

  useEffect(() => {
    getBiens().then(setBiens).finally(() => setLoading(false))
  }, [])

  function openNew() {
    setEditing(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(b: Bien) {
    setEditing(b)
    setForm({ nom: b.nom, adresse: b.adresse, codePostal: b.codePostal, ville: b.ville, typeLocation: b.typeLocation })
    setShowForm(true)
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await updateBien(editing.id, form)
      } else {
        await addBien(form)
      }
      await reload()
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce bien ?')) return
    await deleteBien(id)
    await reload()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#008020] text-white px-4 lg:px-8 pt-8 pb-5">
        <h1 className="text-2xl font-bold">Mes biens</h1>
        <p className="text-green-100 text-sm mt-1">{biens.length} bien{biens.length !== 1 ? 's' : ''}</p>
      </header>

      <div className="px-4 lg:px-8 -mt-3 max-w-4xl mx-auto">
        <button
          onClick={openNew}
          className="w-full bg-[#008020] hover:bg-green-800 text-white font-semibold py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Ajouter un bien
        </button>
      </div>

      <div className="px-4 lg:px-8 mt-4 space-y-3 max-w-4xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <Loader2 size={20} className="animate-spin mr-2" /> Chargement...
          </div>
        ) : biens.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Home size={28} className="text-gray-400" />
            </div>
            <p>Aucun bien enregistré</p>
          </div>
        ) : (
          biens.map(b => (
            <div key={b.id} className="bg-white rounded-xl shadow-sm p-4 flex items-start justify-between">
              <div>
                <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-1 ${
                  b.typeLocation === 'meuble' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {TYPES.find(t => t.value === b.typeLocation)?.label}
                </span>
                <p className="font-semibold text-gray-900">{b.nom}</p>
                <p className="text-sm text-gray-500">{b.adresse}, {b.codePostal} {b.ville}</p>
              </div>
              <div className="flex gap-2 ml-2">
                <button onClick={() => openEdit(b)} className="text-[#008020] hover:bg-green-50 p-2 rounded-lg"><Pencil size={16} /></button>
                <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{editing ? 'Modifier le bien' : 'Nouveau bien'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de location</label>
                <div className="grid grid-cols-2 gap-2">
                  {TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, typeLocation: t.value }))}
                      className={`py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                        form.typeLocation === t.value
                          ? 'border-[#008020] bg-green-50 text-[#008020]'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du bien</label>
                <input
                  value={form.nom}
                  onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                  required placeholder="Appartement Paris 11e"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input
                  value={form.adresse}
                  onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))}
                  required placeholder="10 rue de la Paix"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                  <input
                    value={form.codePostal}
                    onChange={e => setForm(f => ({ ...f, codePostal: e.target.value }))}
                    required placeholder="75001"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input
                    value={form.ville}
                    onChange={e => setForm(f => ({ ...f, ville: e.target.value }))}
                    required placeholder="Paris"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#008020] hover:bg-green-800 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {saving ? <><Loader2 size={16} className="animate-spin" /> Enregistrement...</> : editing ? 'Enregistrer' : 'Ajouter'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
