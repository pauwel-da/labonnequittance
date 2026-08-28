import type { Metadata } from 'next'
import BottomNav from '@/components/BottomNav'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const showAdmin = isAdminEmail(user?.email)

  return (
    <div className="min-h-screen bg-gray-50">
      <BottomNav showAdmin={showAdmin} />
      <div className="lg:ml-60 pb-20 lg:pb-0">
        {children}
      </div>
    </div>
  )
}
