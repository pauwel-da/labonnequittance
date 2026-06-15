import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quittance de loyer en ligne — gratuit et immédiat | La Bonne Quittance',
  description:
    'Générez votre quittance de loyer en ligne en moins de 2 minutes. PDF gratuit, conforme à la loi, envoyé par email. Sans inscription préalable.',
}

export default function TrialLayout({ children }: { children: React.ReactNode }) {
  return children
}
