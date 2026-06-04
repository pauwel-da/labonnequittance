'use client'

import { useState, useEffect, useTransition } from 'react'
import { getProprietaire, saveProprietaire } from '@/lib/db'
import { createClient } from '@/lib/supabase/client'
import type { Proprietaire } from '@/lib/types'
import SignaturePad from '@/components/SignaturePad'
import { signOut, reinscrireRappel, changePassword } from '@/app/(app)/actions'


export default function ProfilPage() {
  const [form, setForm] = useState<Proprietaire>({
    nom: '', prenom: '', adresse: '', codePostal: '', ville: '', signature: '', optinRappelMensuel: true,
  })
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSigningOut, startSignOut] = useTransition()
  const [isResubscribing, startResubscribe] = useTransition()
  const [resubscribed, setResubscribed] = useState(false)

  const [provider, setProvider] = useState<string | null>(null)
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdError, setPwdError] = useState<string | null>(null)
  const [pwdSaved, setPwdSaved] = useState(false)
  const [isChangingPwd, startChangePwd] = useTransition()

  useEffect(() => { getProprietaire().then(setForm) }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setProvider(data.user?.app_metadata?.provider ?? 'email')
    })
  }, [])

  function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPwdError(null)

    if (newPwd !== confirmPwd) {
      setPwdError('Les mots de passe ne correspondent pas.')
      return
    }
    if (newPwd.length < 6) {
      setPwdError('Le nouveau mot de passe doit faire au moins 6 caractères.')
      return
    }

    startChangePwd(async () => {
      const result = await changePassword(currentPwd, newPwd)
      if (result?.error) {
        setPwdError(result.error)
        return
      }
      setPwdSaved(true)
      setCurrentPwd('')
      setNewPwd('')
      setConfirmPwd('')
      setTimeout(() => setPwdSaved(false), 3000)
    })
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setSaveError(null)
    try {
      await saveProprietaire(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#008020] text-white px-4 lg:px-8 pt-8 pb-5">
        <h1 className="text-2xl font-bold">Mon profil</h1>
        <p className="text-green-100 text-sm mt-1">Informations du bailleur</p>
      </header>

      <div className="px-4 lg:px-8 mt-6 max-w-4xl mx-auto">
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
              <p className="text-xs text-gray-400 mt-1">Dessinez votre signature. Elle sera apposée sur chaque quittance.</p>
            </div>
            <SignaturePad
              value={form.signature}
              onChange={sig => setForm(f => ({ ...f, signature: sig }))}
            />
          </div>

          {saveError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {saveError}
            </p>
          )}

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

        {resubscribed && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-[#008020] font-medium text-center">
            ✓ Vous êtes de nouveau inscrit aux rappels mensuels.
          </div>
        )}

        {form.optinRappelMensuel === false && !resubscribed && (
          <div className="mt-4 bg-white rounded-xl shadow-sm p-4 flex items-center justify-between gap-4 border border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">Rappels mensuels</p>
              <p className="text-xs text-gray-400 mt-0.5">Vous êtes désinscrit des rappels automatiques.</p>
            </div>
            <button
              onClick={() => startResubscribe(async () => {
                await reinscrireRappel()
                setForm(f => ({ ...f, optinRappelMensuel: true }))
                setResubscribed(true)
              })}
              disabled={isResubscribing}
              className="shrink-0 text-xs font-semibold text-[#008020] border border-[#008020] rounded-lg px-3 py-2 hover:bg-green-50 transition-colors disabled:opacity-50"
            >
              {isResubscribing ? '...' : 'Se réinscrire'}
            </button>
          </div>
        )}

        {/* Section Mot de passe */}
        <div className="mt-5 bg-white rounded-xl shadow-sm p-4 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Mot de passe</h2>

          {provider === null ? (
            <p className="text-sm text-gray-400">Chargement…</p>
          ) : provider !== 'email' ? (
            <p className="text-sm text-gray-500">
              Vous êtes connecté avec {provider === 'google' ? 'Google' : provider}. Pour modifier votre mot de passe, gérez-le directement sur votre compte {provider === 'google' ? 'Google' : provider}.
            </p>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                <input
                  type="password"
                  value={currentPwd}
                  onChange={e => setCurrentPwd(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPwd}
                  onChange={e => setNewPwd(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="6 caractères minimum"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={confirmPwd}
                  onChange={e => setConfirmPwd(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#008020]"
                />
              </div>

              {pwdError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {pwdError}
                </p>
              )}

              <button
                type="submit"
                disabled={isChangingPwd}
                className={`w-full font-semibold py-2.5 rounded-xl text-sm transition-all ${
                  pwdSaved
                    ? 'bg-green-100 text-[#008020] border-2 border-[#008020]'
                    : 'bg-[#008020] hover:bg-green-800 text-white disabled:opacity-75'
                }`}
              >
                {pwdSaved
                  ? '✓ Mot de passe modifié'
                  : isChangingPwd ? 'Modification…' : 'Modifier le mot de passe'}
              </button>
            </form>
          )}
        </div>

        {/* Bouton déconnexion — visible uniquement sur mobile (le sidebar desktop a le sien) */}
        <button
          onClick={() => startSignOut(async () => { await signOut() })}
          disabled={isSigningOut}
          className="mt-4 lg:hidden w-full py-3 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isSigningOut ? 'Déconnexion...' : 'Se déconnecter'}
        </button>
      </div>
    </div>
  )
}
