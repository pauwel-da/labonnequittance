import Image from 'next/image'
import Link from 'next/link'
import { Star, ArrowRight, Sparkles } from 'lucide-react'

export default function LandingHero({ userCount }: { userCount: number | null }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-green-50/40 to-green-50/15 pt-12 pb-16 lg:pt-20 lg:pb-24 px-6">
      {/* Subtle decorative blobs (fully inside section to avoid hard clips at the edges) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">

        {/* ── LEFT : Copy ── */}
        <div className="text-center lg:text-left anim-fade-up">
          <div
            className="inline-flex items-center gap-2 bg-white border border-green-200 text-[#008020] px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 shadow-sm anim-fade-scale"
            style={{ animationDelay: '0.1s' }}
          >
            <Sparkles size={13} className="fill-[#008020]" />
            100% gratuit · Sans carte bancaire
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.05] tracking-tight mb-5">
            La quittance de loyer,<br />
            <span className="bg-gradient-to-r from-[#008020] to-emerald-500 bg-clip-text text-transparent">
              en 30 secondes.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Plus jamais de Word ni d&apos;oublis. Générez, signez et envoyez vos quittances PDF en 1 clic. Attestation CAF incluse.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-center mb-8">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 bg-[#008020] hover:bg-green-800 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all hover:scale-[1.02] shadow-lg shadow-green-900/20 w-full sm:w-auto"
            >
              Créer mon compte gratuit
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-[#008020] font-medium px-3 py-2 transition-colors"
            >
              J&apos;ai déjà un compte
            </Link>
          </div>

          {/* Social proof inline */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 text-sm text-gray-500 justify-center lg:justify-start">
            <a
              href="https://www.google.com/maps/search/?api=1&query=La+Bonne+Quittance+Lyon"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-gray-700 transition-colors"
            >
              <span className="flex gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
              </span>
              <span className="font-medium text-gray-700">5,0</span>
              <span className="hidden sm:inline">sur Google</span>
            </a>
            {userCount && userCount > 0 && (
              <>
                <span className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full" />
                <span>
                  <span className="font-semibold text-gray-900">{userCount}+ bailleurs</span> nous font confiance
                </span>
              </>
            )}
          </div>
        </div>

        {/* ── RIGHT : Product mockup ── */}
        <div className="relative anim-fade-mockup" style={{ animationDelay: '0.15s' }}>
          {/* Browser frame */}
          <div className="rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,128,32,0.25)] border border-gray-200 bg-white">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white rounded-md px-3 py-0.5 text-[10px] text-gray-400 border border-gray-200 max-w-[200px] truncate">
                  labonnequittance.fr/dashboard
                </div>
              </div>
            </div>
            <Image
              src="/capture_ordinateur.png"
              alt="Dashboard La Bonne Quittance"
              width={1200}
              height={750}
              sizes="(min-width: 1024px) 600px, 100vw"
              priority
              className="w-full"
            />
          </div>

          {/* Floating mobile mockup */}
          <div
            className="absolute -bottom-6 -left-4 sm:-left-12 w-24 sm:w-36 anim-fade-mobile"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="bg-gray-900 rounded-2xl p-1 shadow-2xl">
              <div className="bg-black rounded-xl overflow-hidden">
                <div className="flex justify-center pt-2 pb-1">
                  <div className="w-14 h-3.5 bg-black rounded-full border border-gray-800" />
                </div>
                <Image
                  src="/capture_mobile.png"
                  alt="Mobile"
                  width={390}
                  height={844}
                  sizes="160px"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
