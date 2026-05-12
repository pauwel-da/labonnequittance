import type { Metadata } from 'next'
import BottomNav from '@/components/BottomNav'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <BottomNav />
      <div className="lg:ml-60 pb-20 lg:pb-0">
        {children}
      </div>
    </div>
  )
}
