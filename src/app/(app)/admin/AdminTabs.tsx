import Link from 'next/link'
import { LayoutDashboard, Mail } from 'lucide-react'

const TABS = [
  { id: 'tableau', href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'emails', href: '/admin/emails', label: 'Emails', icon: Mail },
] as const

/** Onglets de l'admin : tableau de bord et envoi d'emails. */
export default function AdminTabs({ active }: { active: (typeof TABS)[number]['id'] }) {
  return (
    <nav aria-label="Sections de l'admin" className="flex gap-6 border-b border-gray-200">
      {TABS.map(({ id, href, label, icon: Icon }) => (
        <Link
          key={id}
          href={href}
          aria-current={active === id ? 'page' : undefined}
          className={`-mb-px inline-flex items-center gap-1.5 border-b-2 pb-2.5 pt-1 text-sm font-medium transition-colors ${
            active === id ? 'border-[#008020] text-[#008020]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Icon size={16} />
          {label}
        </Link>
      ))}
    </nav>
  )
}
