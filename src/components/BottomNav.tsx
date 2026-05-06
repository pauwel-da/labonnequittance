'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard', label: 'Locataires', icon: '👥' },
  { href: '/biens', label: 'Biens', icon: '🏠' },
  { href: '/profil', label: 'Profil', icon: '👤' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50">
      {links.map(({ href, label, icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors ${
              active ? 'text-[#008020]' : 'text-gray-500 hover:text-[#008020]'
            }`}
          >
            <span className="text-xl mb-0.5">{icon}</span>
            <span>{label}</span>
            {active && <span className="absolute bottom-0 h-0.5 w-12 bg-[#008020] rounded-t" />}
          </Link>
        )
      })}
    </nav>
  )
}
