import { ArrowLeft, Layers } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface PhasePlaceholderPageProps {
  title: string
  phase: string
  description: string
}

export function PhasePlaceholderPage({
  title,
  phase,
  description,
}: PhasePlaceholderPageProps) {
  return (
    <section className="py-24 lg:py-32 bg-[#F5F4EF]">
      <div className="container-app">
        <div className="mx-auto max-w-2xl rounded-2xl border border-[#E3E0D6] bg-white p-8 sm:p-12 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#173F35]/8 text-[#173F35]">
            <Layers className="h-6 w-6" />
          </div>

          <div className="mt-5 flex justify-center">
            <Badge variant="gold">{phase}</Badge>
          </div>

          <h1 className="mt-4 font-display text-2xl sm:text-3xl font-bold text-[#173F35]">
            {title}
          </h1>

          <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#5F6B66]">
            {description}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button variant="primary" to="/">
              <ArrowLeft className="h-4 w-4 text-[#D8B978]" />
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
