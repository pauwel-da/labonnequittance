'use client'

import { recordServiceClick } from './actions'

// Lien sortant vers un service : comptage du clic dans Simple Analytics (anonyme)
// et enregistrement en base de qui a cliqué (page /admin).
export default function ServiceLink({ href, serviceId, event, className, children }: {
  href: string
  serviceId: string
  event: string
  className?: string
  children: React.ReactNode
}) {
  function track() {
    if ('sa_event' in window) {
      (window as Window & { sa_event: (n: string) => void }).sa_event(event)
    }
    // Le lien s'ouvre dans un nouvel onglet : la page reste, l'enregistrement se termine en arrière-plan.
    void recordServiceClick(serviceId).catch(() => {})
  }

  return (
    <a href={href} target="_blank" rel="noopener" onClick={track} className={className}>
      {children}
    </a>
  )
}
