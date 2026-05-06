import BottomNav from '@/components/BottomNav'

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
