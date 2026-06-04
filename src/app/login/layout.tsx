import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connexion — La Bonne Quittance',
  description: 'Connectez-vous à votre espace bailleur pour gérer vos quittances de loyer en ligne. Gratuit, sans engagement.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
