'use client'

import Image from 'next/image'
import { Check, ShieldCheck, FileSignature, Sparkles } from 'lucide-react'
import { useInView } from '@/lib/useInView'

const benefits = [
  'PDF généré en 1 clic, prêt à envoyer',
  'Signature numérique infalsifiable',
  'Conforme à la loi',
]

const badges = [
  { icon: FileSignature, label: 'Signature', sub: 'numérique', pos: 'top-[12%] -left-3 sm:-left-8 -rotate-3' },
  { icon: ShieldCheck,   label: 'Conforme',  sub: 'légalement', pos: 'top-[42%] -right-3 sm:-right-10 rotate-3' },
  { icon: Sparkles,      label: 'Généré en', sub: '30 secondes', pos: 'bottom-[14%] -left-4 sm:-left-12 -rotate-2' },
]

export default function LandingShowcase() {
  const { ref, inView } = useInView<HTMLDivElement>()

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-green-50/15 to-white pt-16 pb-20 lg:pt-24 lg:pb-28 px-6">
      {/* Decorative blobs */}
      <div className="absolute top-10 -right-20 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-green-100/40 rounded-full blur-3xl pointer-events-none" />

      <div ref={ref} className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

        {/* ── LEFT : Copy ── */}
        <div className={`text-center lg:text-left reveal ${inView ? 'in-view' : ''}`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#008020] mb-3">Le document final</p>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-5">
            Une quittance<br />
            <span className="bg-gradient-to-r from-[#008020] to-emerald-500 bg-clip-text text-transparent">
              digne de ce nom.
            </span>
          </h2>

          <p className="text-base lg:text-lg text-gray-600 mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed">
            Un document propre, conforme et professionnel. Généré en quelques secondes.
          </p>

          <ul className="space-y-3 max-w-md mx-auto lg:mx-0">
            {benefits.map((b, i) => (
              <li
                key={b}
                className={`flex items-start gap-3 text-sm sm:text-base text-gray-700 reveal ${inView ? 'in-view' : ''}`}
                style={{ transitionDelay: inView ? `${150 + i * 80}ms` : '0ms' }}
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#008020] shrink-0 mt-0.5">
                  <Check size={12} className="text-white" strokeWidth={3} />
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── RIGHT : PDF showcase ── */}
        <div
          className={`relative mx-auto w-full max-w-[400px] lg:max-w-[440px] reveal ${inView ? 'in-view' : ''}`}
          style={{ transitionDelay: inView ? '100ms' : '0ms' }}
        >
          {/* Soft ground shadow */}
          <div className="absolute inset-x-6 bottom-0 h-8 bg-gray-400/20 blur-2xl rounded-full" />

          {/* PDF with subtle tilt + hover correction */}
          <div className="relative rounded-lg overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,128,32,0.25),0_15px_30px_-10px_rgba(0,0,0,0.15)] border border-gray-200 bg-white transform lg:-rotate-[2deg] hover:rotate-0 transition-transform duration-500">
            <Image
              src="/quittance-showcase.png"
              alt="Exemple de quittance de loyer générée"
              width={1654}
              height={2339}
              sizes="(min-width: 1024px) 440px, 400px"
              className="w-full h-auto"
            />
          </div>

          {/* Floating badges */}
          {badges.map((b, i) => {
            const Icon = b.icon
            return (
              <div
                key={b.label}
                className={`absolute ${b.pos} bg-white shadow-xl shadow-green-900/10 rounded-full pl-2 pr-4 py-2 flex items-center gap-2.5 border border-gray-100 reveal ${inView ? 'in-view' : ''}`}
                style={{ transitionDelay: inView ? `${400 + i * 150}ms` : '0ms' }}
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#008020] text-white shrink-0">
                  <Icon size={14} strokeWidth={2.2} />
                </span>
                <div className="text-left leading-tight">
                  <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{b.label}</div>
                  <div className="text-xs font-bold text-gray-900">{b.sub}</div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
