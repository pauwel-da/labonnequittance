'use client'

import { AlertTriangle } from 'lucide-react'
import { useInAppBrowser } from '@/lib/in-app-browser'

/**
 * Avertit que le téléchargement de PDF peut échouer dans le navigateur intégré
 * d'une application (Facebook, Instagram…). Ne s'affiche que dans ce cas.
 */
export default function InAppBrowserNotice({ conseil, className = '' }: { conseil?: string; className?: string }) {
  const inApp = useInAppBrowser()
  if (!inApp) return null
  return (
    <div role="status" className={`bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3 ${className}`}>
      <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
      <p className="text-sm text-amber-900 leading-relaxed">
        Vous êtes dans le navigateur d&apos;une application (Facebook, Instagram…) : le téléchargement de PDF
        n&apos;y fonctionne pas toujours.{conseil ? ` ${conseil}` : ''}{' '}
        Pour télécharger, ouvrez cette page dans Chrome ou Safari : menu <strong>⋯</strong> en haut à droite →{' '}
        <strong>Ouvrir dans le navigateur</strong>.
      </p>
    </div>
  )
}
