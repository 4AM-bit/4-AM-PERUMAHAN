import { ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <section className="py-24 lg:py-32 bg-[#F5F4EF]">
      <div className="container-app">
        <div className="mx-auto max-w-lg rounded-2xl border border-[#E3E0D6] bg-white p-10 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#173F35] text-[#D8B978]">
            <Home className="h-6 w-6" />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#285C49]">
            404 • Halaman Tidak Ditemukan
          </p>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#173F35]">
            Tautan yang Anda tuju tidak tersedia
          </h1>
          <p className="mt-3 text-sm text-[#5F6B66]">
            Silakan kembali ke beranda untuk menjelajahi proyek unggulan dan pilihan tipe rumah PERUMAHAN.
          </p>
          <Button variant="primary" to="/" className="mt-7">
            <ArrowLeft className="h-4 w-4 text-[#D8B978]" />
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </section>
  )
}
