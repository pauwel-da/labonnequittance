'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, LogIn, UserPlus } from 'lucide-react'
import ReadingProgress from '@/components/ReadingProgress'

export default function BlogHeader() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-4 shadow-sm">
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/">
          <Image src="/logo.png" alt="La Bonne Quittance" width={140} height={60} priority />
        </Link>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-1.5 text-sm font-medium text-[#008020] border border-[#008020] hover:bg-green-50 px-4 py-2 rounded-xl transition-colors"
          >
            Espace bailleur
            <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LogIn size={15} className="text-gray-400" />
                Se connecter
              </Link>
              <div className="border-t border-gray-100" />
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-[#008020] hover:bg-green-50 transition-colors"
              >
                <UserPlus size={15} className="text-[#008020]" />
                Créer un compte
              </Link>
            </div>
          )}
        </div>
      </div>
      <ReadingProgress />
    </header>
  )
}
