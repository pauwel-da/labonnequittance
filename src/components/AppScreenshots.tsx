'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'

export default function AppScreenshots() {
  const [lightbox, setLightbox] = useState<'desktop' | 'mobile' | null>(null)

  return (
    <>
      <div className="w-full max-w-4xl relative mb-16 mt-4">

        {/* ── Cadre navigateur (desktop) ── */}
        <div
          onClick={() => setLightbox('desktop')}
          className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 transition-transform duration-300 hover:scale-[1.02] cursor-zoom-in bg-white"
        >
          {/* Barre navigateur */}
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 border border-gray-200 max-w-xs mx-auto text-center">
              labonnequittance.fr
            </div>
          </div>
          <Image
            src="/capture_ordinateur.png"
            alt="Dashboard La Bonne Quittance sur ordinateur"
            width={1200}
            height={750}
            className="w-full"
          />
        </div>

        {/* ── Contour téléphone (mobile) ── */}
        <div
          onClick={() => setLightbox('mobile')}
          className="absolute -bottom-6 -right-2 sm:-right-6 w-28 sm:w-40 cursor-zoom-in transition-transform duration-300 hover:scale-110 z-10"
        >
          {/* Corps du téléphone */}
          <div className="relative bg-gray-900 rounded-2xl p-1 shadow-2xl">
            {/* Boutons latéraux */}
            <div className="absolute -left-[3px] top-16 w-[3px] h-6 bg-gray-700 rounded-l-sm" />
            <div className="absolute -left-[3px] top-24 w-[3px] h-6 bg-gray-700 rounded-l-sm" />
            <div className="absolute -right-[3px] top-20 w-[3px] h-8 bg-gray-700 rounded-r-sm" />
            {/* Écran */}
            <div className="bg-black rounded-xl overflow-hidden">
              {/* Notch / Dynamic island */}
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-16 h-4 bg-black rounded-full border border-gray-800" />
              </div>
              <Image
                src="/capture_mobile.png"
                alt="Dashboard La Bonne Quittance sur mobile"
                width={390}
                height={844}
                className="w-full"
              />
            </div>
          </div>
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
