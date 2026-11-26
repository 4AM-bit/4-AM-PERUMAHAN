import { Quote, Star } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { DEMO_TESTIMONIALS } from '@/lib/demo-data'

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-24 bg-[#F5F4EF]">
      <div className="container-app">
        <SectionHeading
          align="center"
          overline="Cerita Penghuni"
          title="Dipercaya Ratusan Keluarga untuk Memulai Babak Baru"
          description="Pengalaman nyata para pemilik rumah mulai dari tahap pencarian unit, reservasi digital, hingga tinggal di kawasan PERUMAHAN."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {DEMO_TESTIMONIALS.map((item) => (
            <article
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-[#E3E0D6] bg-white p-7 shadow-[var(--shadow-card)]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1" aria-label={`Rating ${item.rating} dari 5`}>
                    {Array.from({ length: item.rating }).map((_, idx) => (
                      <Star
                        key={idx}
                        className="h-4 w-4 fill-[#D8B978] text-[#D8B978]"
                      />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 text-[#D8B978]/60" />
                </div>

                <p className="mt-5 text-sm leading-relaxed text-[#242B28]/85">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="mt-7 pt-5 border-t border-[#E3E0D6]/80 flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#173F35] font-display text-sm font-bold text-[#D8B978]">
                  {item.initials}
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-[#173F35]">
                    {item.customerName}
                  </p>
                  <p className="text-xs text-[#5F6B66]">
                    {item.houseType} • {item.projectName}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
