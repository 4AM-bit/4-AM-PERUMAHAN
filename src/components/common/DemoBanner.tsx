import { Info } from 'lucide-react'
import { IS_DEMO_MODE } from '@/lib/config'

export function DemoBanner() {
  if (!IS_DEMO_MODE) return null

  return (
    <div className="bg-[#173F35] text-white/90 border-b border-white/10">
      <div className="container-app py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Info className="h-3.5 w-3.5 text-[#D8B978] shrink-0" />
          <span>
            <strong className="font-semibold text-[#D8B978]">Mode Demo:</strong>{' '}
            Menampilkan katalog &amp; proyek demo. Koneksi database Supabase production akan diaktifkan pada Phase 3–4.
          </span>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-white/80">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D8B978]" />
          Data Demo Terlabel
        </span>
      </div>
    </div>
  )
}
