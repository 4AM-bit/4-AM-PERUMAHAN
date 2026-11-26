import { Outlet } from 'react-router-dom'
import { DemoBanner } from '@/components/common/DemoBanner'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F4EF] text-[#242B28]">
      <DemoBanner />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
