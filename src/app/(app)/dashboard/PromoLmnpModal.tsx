'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowRight, Bell, Check, CheckCircle, ExternalLink, Send, X } from 'lucide-react'
import { PROMO_LMNP } from '@/lib/promo-config'
import { recordPromoEvent } from './promo-actions'

const TITLE = 'Nous avons aussi créé LMNP Simple'
const BULLETS = [
  'Guidé étape par étape, même depuis votre téléphone',
  'Questions simples : chaque montant va à la bonne case',
]

function trackEvent(name: string) {
  if (typeof window !== 'undefined' && 'sa_event' in window) {
    (window as Window & { sa_event: (n: string) => void }).sa_event(name)
  }
}

/**
 * Popup unique de présentation de LMNP Simple, affichée sur le dashboard aux
 * utilisateurs éligibles (voir getActivePromo). Plein écran sur mobile,
 * fenêtre centrée à deux colonnes à partir de lg.
 */
export default function PromoLmnpModal({ campaignId }: { campaignId: string }) {
  const [open, setOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [notifying, setNotifying] = useState(false)
  const [notifyError, setNotifyError] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Ouverture légèrement différée, une seule fois par session d'onglet
  // (le cache du routeur peut ré-afficher le layout au retour arrière).
  useEffect(() => {
    const key = `promo_seen_${campaignId}`
    try {
      if (sessionStorage.getItem(key)) return
    } catch {}
    const timer = setTimeout(() => {
      setOpen(true)
      try { sessionStorage.setItem(key, '1') } catch {}
      recordPromoEvent(campaignId, 'shown').catch(() => {})
      trackEvent('promo_lmnp_vue')
    }, 700)
    return () => clearTimeout(timer)
  }, [campaignId])

  const close = useCallback(() => {
    setOpen(false)
    recordPromoEvent(campaignId, 'closed').catch(() => {})
    trackEvent('promo_lmnp_fermee')
  }, [campaignId])

  // Pendant l'ouverture : scroll de la page bloqué, focus dans la popup,
  // Échap pour fermer, Tab qui reste dans la popup.
  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      ).filter(el => el.offsetParent !== null)
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus?.()
    }
  }, [open, close])

  function handleDiscover() {
    recordPromoEvent(campaignId, 'discover').catch(() => {})
    trackEvent('promo_lmnp_decouvrir')
  }

  async function handleNotify() {
    setNotifying(true)
    setNotifyError(false)
    const res = await recordPromoEvent(campaignId, 'notify').catch(() => ({ ok: false }))
    setNotifying(false)
    if (res.ok) {
      setConfirmed(true)
      trackEvent('promo_lmnp_prevenir')
    } else {
      setNotifyError(true)
    }
  }

  if (!open) return null

  const discoverLink = (className: string) => (
    <a
      href={PROMO_LMNP.url}
      target="_blank"
      rel="noopener"
      onClick={handleDiscover}
      className={`flex items-center justify-center gap-2 bg-[#008020] hover:bg-green-800 text-white font-semibold whitespace-nowrap transition-colors ${className}`}
    >
      Découvrir LMNP Simple
      <ExternalLink size={16} />
    </a>
  )

  const notifyButton = (className: string) => (
    <button
      type="button"
      onClick={handleNotify}
      disabled={notifying}
      className={`flex items-center justify-center gap-2 bg-white hover:bg-gray-50 disabled:opacity-60 border border-gray-300 whitespace-nowrap transition-colors ${className}`}
    >
      <Bell size={16} className="text-[#008020]" />
      Me prévenir en janvier
    </button>
  )

  const notifyErrorText = notifyError && (
    <p role="alert" className="mt-2 text-sm text-red-600 text-center lg:text-left">
      Une erreur est survenue, réessayez.
    </p>
  )

  return (
    <div
      className="fixed inset-0 z-[60] flex lg:items-center lg:justify-center lg:bg-gray-900/55 lg:p-6"
      onClick={e => { if (e.target === e.currentTarget) close() }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={TITLE}
        className="anim-fade-scale relative w-full h-full bg-white lg:w-[1000px] lg:max-w-full lg:h-[700px] lg:max-h-full lg:rounded-[20px] lg:overflow-hidden lg:shadow-2xl"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label="Fermer"
          className="absolute z-10 top-3 right-3 lg:top-4 lg:right-4 w-11 h-11 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 lg:bg-white lg:hover:bg-gray-50 lg:border lg:border-gray-200 lg:shadow-sm transition-colors"
        >
          <X size={20} />
        </button>

        {/* ── Mobile / tablette : plein écran centré ─────────────────────── */}
        <div className="lg:hidden h-full overflow-y-auto">
          <div className="min-h-full flex flex-col pt-14">
            <div className="flex flex-col items-center text-center px-6 pt-9 pb-7">
              <Image
                src="/promo/lmnp-simple-logo.png"
                alt="LMNP Simple"
                width={640}
                height={285}
                className="w-[208px] h-auto"
              />
              <h2 className="mt-7 text-[28px] leading-[34px] font-bold tracking-[-0.02em] text-gray-900">
                Nous avons aussi créé<br />LMNP Simple
              </h2>
              <p className="mt-3 max-w-[326px] text-base text-gray-600 text-balance">
                Vous louez en meublé&nbsp;? Votre déclaration au régime réel, préparée en quelques minutes, sans expert-comptable.
              </p>

              <div className="mt-9 flex flex-col items-center">
                <p className="flex items-baseline justify-center gap-1.5 text-[#008020] whitespace-nowrap">
                  <span className="text-[56px] leading-[56px] font-bold tracking-[-0.04em]">99&nbsp;€</span>
                  <span className="text-lg font-semibold tracking-[0.02em]">TTC</span>
                </p>
                <p className="mt-1 text-[15px] leading-[22px] font-medium text-gray-600">
                  par déclaration, plusieurs biens inclus
                </p>
                <p className="mt-5 inline-flex h-9 items-center gap-2 pl-1.5 pr-3.5 rounded-full bg-green-50 border border-green-200 text-sm font-semibold text-green-800 whitespace-nowrap">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-[#008020] text-white flex items-center justify-center">
                    <Send size={13} strokeWidth={2.25} />
                  </span>
                  Télétransmission aux impôts incluse
                </p>
                <p className="mt-3 text-sm text-gray-500">Tout compris, sans abonnement, payé à la fin</p>
              </div>
            </div>

            <div className="mt-auto px-6 pb-[max(20px,env(safe-area-inset-bottom))] flex flex-col">
              {discoverLink('h-[52px] rounded-[14px] text-base')}
              {confirmed ? (
                <div role="status" className="mt-2.5 flex flex-col items-center gap-0.5 px-4 py-3 bg-green-50 rounded-[14px] text-center">
                  <span className="flex items-center gap-2 text-[15px] leading-[22px] font-semibold text-green-800">
                    <CheckCircle size={18} className="text-[#008020]" />
                    C&apos;est noté.
                  </span>
                  <span className="text-sm text-gray-700 text-balance">
                    Nous vous écrirons en janvier, avant la prochaine saison de déclaration.
                  </span>
                </div>
              ) : (
                notifyButton('mt-2.5 h-12 rounded-[14px] text-base font-medium text-gray-700')
              )}
              {notifyErrorText}
              <button
                type="button"
                onClick={close}
                className="mt-2.5 h-11 text-[15px] font-medium text-gray-600 underline underline-offset-4 decoration-gray-300"
              >
                Continuer vers mon tableau de bord
              </button>
            </div>
          </div>
        </div>

        {/* ── Desktop : texte à gauche, aperçu à droite ──────────────────── */}
        <div className="hidden lg:flex h-full">
          <div className="w-[560px] shrink-0 flex flex-col px-12 pt-10 pb-7 overflow-y-auto">
            <Image
              src="/promo/lmnp-simple-logo.png"
              alt="LMNP Simple"
              width={640}
              height={285}
              className="w-[135px] h-auto"
            />
            <h2 className="mt-[18px] text-[30px] leading-9 font-bold tracking-[-0.02em] text-gray-900">
              Nous avons aussi créé<br />LMNP Simple
            </h2>
            <p className="mt-3 text-base text-gray-600 text-pretty">
              Vous louez en meublé&nbsp;? LMNP Simple prépare votre déclaration au régime réel en quelques minutes, sans expert-comptable.
            </p>

            <div className="mt-5 rounded-[14px] overflow-hidden border border-green-200 bg-green-50">
              <div className="flex items-center justify-between gap-4 bg-[#008020] text-white px-[18px] py-2.5">
                <span className="text-[34px] leading-10 font-bold tracking-[-0.02em] whitespace-nowrap">
                  99&nbsp;€<span className="text-[15px] font-semibold tracking-normal"> TTC</span>
                </span>
                <span className="text-sm font-medium text-green-100 text-right">par déclaration, plusieurs biens inclus</span>
              </div>
              <div className="flex flex-col gap-1.5 px-[18px] pt-3 pb-3.5">
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Send size={16} className="shrink-0 text-[#008020]" />
                  Télétransmission aux impôts incluse
                </span>
                <span className="flex items-center gap-2 text-[13px] leading-[18px] text-gray-600">
                  <Check size={16} strokeWidth={2.5} className="shrink-0 text-[#008020]" />
                  Tout compris, sans abonnement, payé à la fin
                </span>
              </div>
            </div>

            <ul className="mt-[18px] flex flex-col gap-2.5">
              {BULLETS.map(text => (
                <li key={text} className="flex items-center gap-2.5 text-[15px] leading-[22px] text-gray-700">
                  <span className="w-[22px] h-[22px] shrink-0 rounded-full bg-green-100 text-[#008020] flex items-center justify-center">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex gap-2.5">
              {discoverLink('flex-1 h-12 px-3 rounded-xl text-sm')}
              {!confirmed && notifyButton('flex-1 h-12 px-3 rounded-xl text-sm font-semibold text-gray-900')}
            </div>
            {confirmed && (
              <div role="status" className="mt-3 flex items-start gap-2.5 bg-green-50 border border-green-200 rounded-xl px-3.5 py-3">
                <CheckCircle size={20} className="shrink-0 text-[#008020]" />
                <span className="text-sm text-green-800">
                  C&apos;est noté. Nous vous écrirons en janvier, avant la prochaine saison de déclaration.
                </span>
              </div>
            )}
            {notifyErrorText}

            <div className="mt-auto pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={close}
                className="flex items-center gap-1.5 py-1 text-sm font-medium text-gray-700 underline underline-offset-[3px] decoration-gray-300"
              >
                Continuer vers mon tableau de bord
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 min-w-0 bg-[#f3fbf5] flex items-center justify-center">
            <Image
              src="/promo/lmnp-simple-apercu.jpg"
              alt="Aperçu de LMNP Simple : récapitulatif de la déclaration sur ordinateur et sur téléphone"
              width={904}
              height={791}
              sizes="440px"
              className="w-[440px] max-w-full h-auto"
              style={{
                maskImage: 'linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
