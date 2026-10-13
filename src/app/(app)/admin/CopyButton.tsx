'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

/** Copie un texte dans le presse-papiers (ex. liste d'emails à coller dans Brevo). */
export default function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle')

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(text)
      setState('copied')
    } catch {
      setState('error')
    }
    setTimeout(() => setState('idle'), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors"
    >
      {state === 'copied' ? <Check size={14} className="text-[#008020]" /> : <Copy size={14} />}
      {state === 'copied' ? 'Copié' : state === 'error' ? 'Copie impossible' : label}
    </button>
  )
}
