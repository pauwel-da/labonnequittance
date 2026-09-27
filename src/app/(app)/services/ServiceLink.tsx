'use client'

// Lien sortant vers un service, avec comptage du clic dans Simple Analytics.
export default function ServiceLink({ href, event, className, children }: {
  href: string
  event: string
  className?: string
  children: React.ReactNode
}) {
  function track() {
    if ('sa_event' in window) {
      (window as Window & { sa_event: (n: string) => void }).sa_event(event)
    }
  }

  return (
    <a href={href} target="_blank" rel="noopener" onClick={track} className={className}>
      {children}
    </a>
  )
}
