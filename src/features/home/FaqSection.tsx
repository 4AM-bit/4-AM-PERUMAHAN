import { useState } from 'react'
import { ChevronDown, MessageCircle, ArrowUpRight } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { DEMO_FAQS } from '@/lib/demo-data'
import { APP_CONFIG } from '@/lib/config'
import { cn } from '@/utils/cn'

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(DEMO_FAQS[0]?.id ?? null)

  return (
    <section className="py-20 lg:py-24 bg-white border-t border-[#E3E0D6]/80">
      <div className="container-app">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            <SectionHeading
              overline="Pertanyaan Umum"
              title="Informasi Penting Sebelum Reservasi Unit"
              description="Temukan jawaban cepat terkait mekanisme pemesanan unit, transfer bank manual, legalitas sertifikat, hingga skema KPR."
            />

            <div className="rounded-2xl border border-[#E3E0D6] bg-[#F5F4EF] p-6 space-y-4">
              <p className="font-display text-base font-bold text-[#173F35]">
                Masih memiliki pertanyaan khusus?
              </p>
              <p className="text-sm leading-relaxed text-[#5F6B66]">
                Tim Property Advisor kami siap membantu simulasi cicilan, cek unit
                tersedia, maupun penjadwalan kunjungan ke marketing gallery.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <a
                  href={`https://wa.me/${APP_CONFIG.whatsapp}?text=Halo%20PERUMAHAN,%20saya%20ingin%20bertanya%20mengenai%20reservasi%20unit.`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#173F35] px-4 text-sm font-medium text-white transition-colors hover:bg-[#102D26]"
                >
                  <MessageCircle className="h-4 w-4 text-[#D8B978]" />
                  Chat WhatsApp
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <Button variant="outline" size="sm" to="/kontak" className="h-10">
                  Halaman Kontak
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-3.5">
            {DEMO_FAQS.map((faq) => {
              const isOpen = openId === faq.id
              return (
                <div
                  key={faq.id}
                  className={cn(
                    'rounded-2xl border transition-all duration-200',
                    isOpen
                      ? 'border-[#173F35]/25 bg-[#F5F4EF]/75 shadow-xs'
                      : 'border-[#E3E0D6] bg-white hover:border-[#285C49]/30',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer"
                  >
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#285C49]">
                        {faq.category}
                      </span>
                      <h3 className="mt-1 font-display text-base font-bold text-[#173F35]">
                        {faq.question}
                      </h3>
                    </div>
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E3E0D6] bg-white text-[#173F35] transition-transform duration-200',
                        isOpen && 'rotate-180 bg-[#173F35] text-white border-[#173F35]',
                      )}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-0">
                      <p className="text-sm leading-relaxed text-[#5F6B66] border-t border-[#E3E0D6]/80 pt-4">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
