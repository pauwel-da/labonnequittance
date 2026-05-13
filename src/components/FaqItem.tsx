'use client'

import { useState } from 'react'

interface Props {
  question: string
  answer: string
  link?: { url: string; label: string } | null
}

export default function FaqItem({ question, answer, link }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-sm">{question}</span>
        <span className={`text-[#008020] text-lg font-light shrink-0 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}>
          +
        </span>
      </button>
      {open && (
        <div className="px-5 pb-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed pt-3">{answer}</p>
          {link && (
            <a href={link.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-[#008020] hover:underline">
              ↓ {link.label}
            </a>
          )}
        </div>
      )}
    </div>
  )
}
