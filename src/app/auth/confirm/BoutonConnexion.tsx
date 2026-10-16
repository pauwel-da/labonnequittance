'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

/** Désactivé pendant l'envoi : le lien ne sert qu'une fois, un second clic échouerait. */
export default function BoutonConnexion() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-[#008020] hover:bg-green-800 disabled:opacity-75 active:scale-95 text-white font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
    >
      {pending ? <><Loader2 size={16} className="animate-spin" /> Connexion…</> : 'Me connecter'}
    </button>
  )
}
