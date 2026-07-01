'use client'

import { useState, useRef, useEffect } from 'react'

type Suggestion = {
  label: string
  adresse: string
  codePostal: string
  ville: string
}

type Props = {
  value: string
  onChange: (adresse: string, codePostal?: string, ville?: string) => void
  placeholder?: string
  autoFocus?: boolean
  className?: string
}

export default function AddressAutocomplete({ value, onChange, placeholder, autoFocus, className }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    onChange(q)
    setActiveIndex(-1)
    clearTimeout(debounceRef.current)
    if (q.length < 3) { setSuggestions([]); setOpen(false); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=5`
        )
        const json = await res.json()
        const list: Suggestion[] = (json.features ?? []).map((f: { properties: { label: string; name: string; postcode: string; city: string } }) => ({
          label: f.properties.label,
          adresse: f.properties.name,
          codePostal: f.properties.postcode,
          ville: f.properties.city,
        }))
        setSuggestions(list)
        setOpen(list.length > 0)
      } catch {}
    }, 300)
  }

  function select(s: Suggestion) {
    onChange(s.adresse, s.codePostal, s.ville)
    setSuggestions([])
    setOpen(false)
    setActiveIndex(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      select(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        className={className}
      />
      {open && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onMouseDown={(e) => { e.preventDefault(); select(s) }}
              className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                i === activeIndex ? 'bg-green-50 text-[#008020]' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
