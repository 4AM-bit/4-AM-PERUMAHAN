import { type FormEvent, useState } from 'react'
import { ArrowRight, MapPin, Search, SlidersHorizontal, ShieldCheck, Building2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PRICE_RANGES } from '@/lib/demo-data'
import { usePublicCatalog } from '@/hooks/usePublicCatalog'
import type { PropertySearchQuery } from '@/types/property'

interface HeroSectionProps {
  onSearch: (query: PropertySearchQuery) => void
}

const trustStats = [
  { icon: Building2, value: '3 Kawasan', label: 'Proyek Strategis Jabodetabek' },
  { icon: CheckCircle2, value: '420+ Unit', label: 'Hunian Terbangun & Terhuni' },
  { icon: ShieldCheck, value: '100% SHM', label: 'Legalitas & Reservasi Terkunci' },
]

export function HeroSection({ onSearch }: HeroSectionProps) {
  const { locations } = usePublicCatalog()
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('Semua Lokasi')
  const [priceRange, setPriceRange] = useState('all')
  const [bedrooms, setBedrooms] = useState('all')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSearch({ keyword, location, priceRange, bedrooms })
    const section = document.getElementById('pilihan-rumah')
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section className="relative overflow-hidden bg-[#173F35]">
      {/* Architectural Hero Background */}
      <div className="relative min-h-[620px] lg:min-h-[680px] flex items-center">
        <img
          src="/images/hero-residence.jpg"
          alt="Hunian modern tropis PERUMAHAN saat golden hour"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#102D26]/92 via-[#173F35]/78 to-[#173F35]/35"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#102D26]/80 via-transparent to-[#102D26]/25"
          aria-hidden="true"
        />

        <div className="container-app relative z-10 py-14 lg:py-24 pb-28 lg:pb-36">
          <div className="max-w-2xl">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#D8B978]/35 bg-[#102D26]/65 px-3.5 sm:px-4 py-1.5 text-[11px] sm:text-xs font-medium tracking-wider text-[#EFE3C6] backdrop-blur-sm leading-snug">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#D8B978]" />
              <span>DEVELOPER PROPERTI MODERN &amp; RESERVASI TERVERIFIKASI</span>
            </div>

            <h1 className="mt-6 font-display text-3xl sm:text-5xl lg:text-[56px] font-extrabold leading-[1.12] text-white">
              Temukan Hunian Impian Anda
            </h1>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-white/85 max-w-xl">
              Jelajahi koleksi hunian tropis kontemporer dengan tata kawasan hijau
              berkelanjutan, legalitas SHM terjamin, serta sistem reservasi unit
              yang aman dan transparan.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Button variant="gold" size="lg" to="/katalog">
                Jelajahi Rumah
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                to="/proyek"
                className="border-white/30 bg-white/10 text-white hover:bg-white hover:text-[#173F35] hover:border-white backdrop-blur-sm"
              >
                Lihat Proyek Unggulan
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/15 pt-7">
              {trustStats.map(({ icon: Icon, value, label }) => (
                <div key={value} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#D8B978]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-display text-base font-bold text-white leading-tight">
                      {value}
                    </p>
                    <p className="mt-0.5 text-xs text-white/70">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Elevated Property Search Form */}
      <div className="relative z-20 bg-[#F5F4EF] pb-4">
        <div className="container-app -mt-16 lg:-mt-20">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-[#E3E0D6] bg-white p-5 sm:p-6 shadow-[0_14px_40px_-14px_rgba(23,63,53,0.16)]"
            aria-label="Form pencarian properti"
          >
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#285C49]">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Pencarian Properti Cepat
              </div>
              <span className="text-xs text-[#5F6B66] hidden sm:inline">
                Filter langsung tipe hunian sesuai kebutuhan keluarga Anda
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <label
                  htmlFor="search-keyword"
                  className="block text-xs font-medium text-[#5F6B66] mb-1.5"
                >
                  Kata Kunci / Nama Tipe
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B66]" />
                  <input
                    id="search-keyword"
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Contoh: Cendana, Akasia..."
                    className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/60 pl-10 pr-3.5 text-sm text-[#242B28] placeholder:text-[#5F6B66]/70 focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15 transition-all"
                  />
                </div>
              </div>

              <div className="lg:col-span-3">
                <label
                  htmlFor="search-location"
                  className="block text-xs font-medium text-[#5F6B66] mb-1.5"
                >
                  Lokasi Kawasan
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B66]" />
                  <select
                    id="search-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/60 pl-10 pr-3.5 text-sm text-[#242B28] focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15 transition-all"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="lg:col-span-2">
                <label
                  htmlFor="search-price"
                  className="block text-xs font-medium text-[#5F6B66] mb-1.5"
                >
                  Rentang Harga
                </label>
                <select
                  id="search-price"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/60 px-3 text-sm text-[#242B28] focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15 transition-all"
                >
                  {PRICE_RANGES.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label
                  htmlFor="search-bedrooms"
                  className="block text-xs font-medium text-[#5F6B66] mb-1.5"
                >
                  Jumlah Kamar
                </label>
                <select
                  id="search-bedrooms"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/60 px-3 text-sm text-[#242B28] focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15 transition-all"
                >
                  <option value="all">Semua Kamar</option>
                  <option value="2">2+ Kamar Tidur</option>
                  <option value="3">3+ Kamar Tidur</option>
                  <option value="4">4+ Kamar Tidur</option>
                </select>
              </div>

              <div className="lg:col-span-2 flex items-end">
                <Button type="submit" variant="primary" size="md" className="w-full">
                  <Search className="h-4 w-4 text-[#D8B978]" />
                  Cari Hunian
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
