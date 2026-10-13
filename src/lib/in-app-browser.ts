import { useSyncExternalStore } from 'react'

/**
 * Navigateur intégré à une application (Facebook, Instagram, Messenger, Gmail…) :
 * le téléchargement d'un fichier généré dans la page y échoue souvent, sans message.
 * Cas fréquent pour les visiteurs venus des publicités Meta.
 */
export function isInAppBrowser(ua: string = navigator.userAgent): boolean {
  // Applications Meta (Android et iOS)
  if (/FBAN|FBAV|FB_IAB|Instagram/i.test(ua)) return true
  // WebView Android : jeton « wv » ajouté par Chrome
  if (/Android/.test(ua) && /; ?wv\)/.test(ua)) return true
  // WKWebView iOS : pas de jeton « Safari/ », contrairement à Safari et à Chrome/Firefox iOS.
  // Exception : site ajouté à l'écran d'accueil (standalone), qui n'est pas un navigateur intégré.
  if (/iPhone|iPad|iPod/.test(ua) && !/Safari\//.test(ua)) {
    return !(navigator as Navigator & { standalone?: boolean }).standalone
  }
  return false
}

const subscribeNothing = () => () => {}

/** Vrai seulement côté navigateur, après hydratation (false au rendu serveur). */
export function useInAppBrowser(): boolean {
  return useSyncExternalStore(subscribeNothing, () => isInAppBrowser(), () => false)
}
