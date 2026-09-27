import type { Metadata } from 'next'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { SERVICE_CATEGORIES } from '@/lib/services-config'
import ServiceLink from './ServiceLink'

export const metadata: Metadata = { title: 'Services — La Bonne Quittance' }

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#008020] text-white px-4 lg:px-8 pt-8 pb-5">
        <h1 className="text-2xl font-bold">Services</h1>
        <p className="text-green-100 text-sm mt-1">Des solutions choisies pour les propriétaires</p>
      </header>

      <div className="px-4 lg:px-8 py-5 max-w-4xl mx-auto space-y-6">
        {SERVICE_CATEGORIES.map(category => (
          <section key={category.id} aria-labelledby={`services-${category.id}`} className="space-y-2">
            <h2
              id={`services-${category.id}`}
              className="px-1 text-xs font-semibold uppercase tracking-wider text-gray-500"
            >
              {category.label}
            </h2>
            <div className={`grid gap-3 ${category.offers.length > 1 ? 'lg:grid-cols-2' : ''}`}>
              {category.offers.map(offer => (
                <article key={offer.id} className="bg-white rounded-xl shadow-sm p-4 flex flex-col">
                  <div className="flex items-center justify-between gap-3 min-h-8.5">
                    <Image
                      src={offer.logo.src}
                      alt={offer.name}
                      width={offer.logo.width}
                      height={offer.logo.height}
                      className={offer.logo.className}
                    />
                    {offer.kind === 'partenaire' ? (
                      <span className="shrink-0 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full px-2.5 py-0.5">
                        Partenaire
                      </span>
                    ) : (
                      <span className="shrink-0 text-xs font-semibold text-green-800 bg-green-50 rounded-full px-2.5 py-0.5">
                        Notre service
                      </span>
                    )}
                  </div>
                  <p className="mt-3 flex-1 text-[15px] leading-5.5 text-gray-700">{offer.description}</p>
                  <ServiceLink
                    href={offer.url}
                    event={`service_${offer.id.replace(/-/g, '_')}_clic`}
                    className="mt-3.5 h-11 flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 rounded-[10px] text-sm font-semibold text-gray-900 transition-colors"
                  >
                    Découvrir {offer.name}
                    <ExternalLink size={15} />
                    <span className="sr-only">(s&apos;ouvre dans un nouvel onglet)</span>
                  </ServiceLink>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
