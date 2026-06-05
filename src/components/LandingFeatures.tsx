'use client'

import { Clock, Send, Shield } from 'lucide-react'
import { useInView } from '@/lib/useInView'

const features = [
  {
    icon: Clock,
    title: 'En 30 secondes',
    desc: "De l'inscription à la quittance envoyée. Renseignez vos infos une fois, oubliez-les ensuite.",
  },
  {
    icon: Send,
    title: 'Envoi automatique',
    desc: 'Votre locataire reçoit sa quittance directement par email, avec votre signature numérique.',
  },
  {
    icon: Shield,
    title: 'Attestation CAF incluse',
    desc: "Cerfa n° 10842 pré-rempli automatiquement. Plus besoin de chercher le bon formulaire.",
  },
]

export default function LandingFeatures() {
  const { ref, inView } = useInView<HTMLDivElement>()

  return (
    <section className="bg-white px-6 py-20 lg:py-28 border-t border-gray-100">
      <div ref={ref} className="max-w-5xl mx-auto">

        <div className={`text-center mb-14 reveal ${inView ? 'in-view' : ''}`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#008020] mb-2">Fonctionnalités</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            Tout ce qu&apos;il faut.<br className="sm:hidden" />{' '}
            <span className="text-gray-400">Rien de plus.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className={`bg-gradient-to-b from-gray-50 to-white rounded-2xl p-7 border border-gray-100 hover:border-green-200 hover:shadow-lg hover:shadow-green-900/5 transition-all reveal ${inView ? 'in-view' : ''}`}
                style={{ transitionDelay: inView ? `${i * 100}ms` : '0ms' }}
              >
                <div className="bg-[#008020] text-white rounded-xl w-12 h-12 flex items-center justify-center mb-5 shadow-md shadow-green-900/20">
                  <Icon size={22} strokeWidth={2.2} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
