import { Suspense } from 'react'
import { getActivePromo } from '@/lib/promo'
import PromoLmnpModal from './PromoLmnpModal'

// La vérification d'éligibilité est isolée dans un Suspense : elle ne retarde
// jamais l'affichage du dashboard.
async function PromoSlot() {
  const promo = await getActivePromo()
  return promo ? <PromoLmnpModal campaignId={promo.id} /> : null
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Suspense fallback={null}>
        <PromoSlot />
      </Suspense>
    </>
  )
}
