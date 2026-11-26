import { Shield, Trees, Waves, Wifi, Building2, Zap } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { DEMO_FACILITIES } from '@/lib/demo-data'
import type { Facility } from '@/types/property'

const iconMap: Record<Facility['iconName'], typeof Shield> = {
  shield: Shield,
  trees: Trees,
  waves: Waves,
  wifi: Wifi,
  building: Building2,
  zap: Zap,
}

export function FacilitiesSection() {
  return (
    <section id="fasilitas" className="py-20 lg:py-24 bg-[#F5F4EF]">
      <div className="container-app">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-center mb-14">
          <div className="lg:col-span-6">
            <SectionHeading
              overline="Fasilitas Kawasan"
              title="Ekosistem Hunian Lengkap untuk Kualitas Hidup Lebih Baik"
              description="Nikmati keseimbangan antara privasi, kebugaran, dan kehangatan komunitas dalam kawasan terintegrasi yang dikelola secara profesional."
            />
          </div>
          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-2xl border border-[#E3E0D6] bg-white shadow-[var(--shadow-card)] aspect-[16/9]">
              <img
                src="/images/facility-clubhouse.jpg"
                alt="Clubhouse privat dan kolam renang bernuansa resor di kawasan PERUMAHAN"
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#102D26]/85 via-[#102D26]/35 to-transparent p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D8B978]">
                  Resident Exclusive
                </p>
                <p className="mt-1 font-display text-lg font-bold text-white">
                  Private Clubhouse &amp; Resort Lap Pool
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DEMO_FACILITIES.map((facility) => {
            const Icon = iconMap[facility.iconName]
            return (
              <div
                key={facility.id}
                className="group rounded-2xl border border-[#E3E0D6] bg-white p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#285C49]/35 hover:shadow-[var(--shadow-card-hover)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#173F35]/8 text-[#173F35] transition-colors group-hover:bg-[#173F35] group-hover:text-[#D8B978]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-[#F5F4EF] px-3 py-1 text-[11px] font-medium text-[#285C49]">
                    {facility.highlight}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-[#173F35]">
                  {facility.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5F6B66]">
                  {facility.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
