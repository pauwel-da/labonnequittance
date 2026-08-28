'use client'

import { useState, useTransition } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { deleteUserAccount } from './actions'

export default function DeleteUserButton({ userId, email }: { userId: string; email: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    const ok = window.confirm(
      `Supprimer définitivement le compte ${email} et toutes ses données (biens, locataires, quittances) ?\n\nCette action est irréversible.`
    )
    if (!ok) return
    setError(null)
    startTransition(async () => {
      const res = await deleteUserAccount(userId)
      if ('error' in res) setError(res.error)
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        title="Supprimer le compte et ses données"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:bg-red-50 px-2 py-1 rounded-md disabled:opacity-50 transition-colors"
      >
        {isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        Supprimer
      </button>
      {error && <span className="text-[11px] text-red-600 max-w-[220px] text-right">{error}</span>}
    </div>
  )
}
