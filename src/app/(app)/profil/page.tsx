'use client'

import { useState, useEffect } from 'react'
import { proprietaireStore } from '@/lib/store'
import type { Proprietaire } from '@/lib/types'
import SignaturePad from '@/components/SignaturePad'

export default function ProfilPage() {
  const [form, setForm] = useState<Proprietaire>({
    nom: '', prenom: '', adresse: '', codePostal: '', ville: '', signature: '',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => { setForm(proprietaireStore.get()) }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    proprietaireStore.save(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-[#008020] text-white px-4 pt-10 pb-5">
        <h1 className="text-2xl font-bold">Mon profil</h1>
        <p className="text-green-100 text-sm mt-1">Informations du bailleur</p>
      </header>

      <div className="px-4 mt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
            <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Identité</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  value={form.prenom}
                  onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                  placeholder="Jean"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  value={form.nom}
                  onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                  placeholder="Martin"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
            <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Adresse</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rue</label>
              <input
                value={form.adresse}
                onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))}
                placeholder="10 rue de la Paix"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                <input
                  value={form.codePostal}
                  onChange={e => setForm(f => ({ ...f, codePostal: e.target.value }))}
                  placeholder="75001"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <input
                  value={form.ville}
                  onChange={e => setForm(f => ({ ...f, ville: e.target.value }))}
                  placeholder="Paris"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            <div>
              <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Signature</h2>
              <p className="text-xs text-gray-400 mt-1">Dessinez votre signature — elle sera apposée sur chaque quittance.</p>
            </div>
            <SignaturePad
              value={form.signature}
              onChange={sig => setForm(f => ({ ...f, signature: sig }))}
            />
          </div>

          <button
            type="submit"
            className={`w-full font-semibold py-3 rounded-xl transition-all ${
              saved
                ? 'bg-green-100 text-[#008020] border-2 border-[#008020]'
                : 'bg-[#008020] hover:bg-green-800 text-white'
            }`}
          >
            {saved ? '✓ Enregistré !' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  )
}
