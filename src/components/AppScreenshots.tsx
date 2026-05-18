'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'

export default function AppScreenshots() {
  const [lightbox, setLightbox] = useState<'desktop' | 'mobile' | null>(null)

  return (
    <>
      <div className="w-full max-w-4xl relative mb-16 mt-4">
        {/* Desktop */}
        <div
          onClick={() => setLightbox('desktop')}
          className="rounded-2xl overflow-hidden shadow-xl border border-gray-100 transition-transform duration-300 hover:scale-[1.02] cursor-zoom-in"
        >
          <Image
            src="/capture_ordinateur.png"
            alt="Dashboard La Bonne Quittance sur ordinateur"
            width={1200}
            height={750}
            className="w-full"
          />
        </div>
        {/* Mobile — superposé en bas à droite */}
        <div
          onClick={() => setLightbox('mobile')}
          className="absolute -bottom-6 -right-2 sm:-right-6 w-28 sm:w-40 rounded-2xl overflow-hidden shadow-2xl border-2 border-white transition-transform duration-300 hover:scale-110 cursor-zoom-in z-10"
        >
          <Image
            src="/capture_mobile.png"
            alt="Dashboard La Bonne Quittance sur mobile"
            width={390}
            height={844}
            className="w-full"
          />
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X size={28} />
          </button>
          <div
            className={`relative ${lightbox === 'mobile' ? 'max-h-[90vh] max-w-xs' : 'max-w-5xl w-full'}`}
            onClick={e => e.stopPropagation()}
          >
            <Image
              src={lightbox === 'desktop' ? '/capture_ordinateur.png' : '/capture_mobile.png'}
              alt={lightbox === 'desktop' ? 'Dashboard ordinateur' : 'Dashboard mobile'}
              width={lightbox === 'desktop' ? 1200 : 390}
              height={lightbox === 'desktop' ? 750 : 844}
              className="w-full rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  )
}
