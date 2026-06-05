'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useInView } from '@/lib/useInView'

export default function LandingCTA() {
  const { ref, inView } = useInView<HTMLDivElement>()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#008020] via-[#006619] to-[#004d12] px-6 py-20 lg:py-24">
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4) 1px, transparent 1px), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 1px, transparent 1px)',
        backgroundSize: '40px 40px, 30px 30px',
      }} />

      <div
        ref={ref}
        className={`relative max-w-2xl mx-auto text-center reveal ${inView ? 'in-view' : ''}`}
      >
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight tracking-tight">
          Prêt à gagner du temps&nbsp;?
        </h2>
        <p className="text-green-100 text-base lg:text-lg mb-9 max-w-md mx-auto">
          Créez votre compte en 30 secondes. Sans engagement, sans carte bancaire.
        </p>
        <Link
          href="/signup"
          className="group inline-flex items-center gap-2 bg-white text-[#008020] font-semibold px-8 py-4 rounded-2xl text-base hover:bg-green-50 transition-all hover:scale-[1.02] shadow-xl"
        >
          Créer mon compte gratuit
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  )
}
