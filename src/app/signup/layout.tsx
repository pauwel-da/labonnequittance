import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Créer un compte gratuit — La Bonne Quittance',
  description: 'Créez votre compte bailleur gratuit. Générez et envoyez vos quittances de loyer en PDF en 1 clic. Sans abonnement.',
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children
}
