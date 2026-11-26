import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowUpDown, MapPin, RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import { HouseTypeCard } from '@/components/property/HouseTypeCard'
import { Button } from '@/components/ui/Button'
import {
  DEMO_HOUSE_TYPES,
  DEMO_PROJECTS,
  PRICE_RANGES,
  PROJECT_LOCATIONS,
} from '@/lib/demo-data'

type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'land-desc'

function matchesPriceRange(price: number, range: string): boolean {
  if (range === 'under-1b') return price < 1_000_000_000
  if (range === '1b-2b') return price >= 1_000_000_000 && price <= 2_000_000_000
  if (range === 'above-2b') return price > 2_000_000_000
  return true
}

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const keyword = searchParams.get('q') ?? ''
  const location = searchParams.get('lokasi') ?? 'Semua Lokasi'
  const projectSlug = searchParams.get('proyek') ?? 'all'
  const priceRange = searchParams.get('harga') ?? 'all'
  const bedrooms = searchParams.get('kt') ?? 'all'
  const sortBy = (searchParams.get('sort') as SortOption) ?? 'recommended'

  const updateParam = (key: string, value: string, defaultValue: string) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === defaultValue) {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    setSearchParams(next, { replace: true })
  }

  const resetAll = () => {
    setSearchParams({}, { replace: true })
  }

  const hasActiveFilter =
    keyword.trim() !== '' ||
    location !== 'Semua Lokasi' ||
    projectSlug !== 'all' ||
    priceRange !== 'all' ||
    bedrooms !== 'all'

  const filteredHouses = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    const list = DEMO_HOUSE_TYPES.filter((house) => {
      const matchKeyword =
        !q ||
        house.name.toLowerCase().includes(q) ||
        house.projectName.toLowerCase().includes(q) ||
        house.category.toLowerCase().includes(q) ||
        house.shortDescription.toLowerCase().includes(q)
      const matchLocation =
        location === 'Semua Lokasi' || house.projectLocation === location
      const matchProject =
        projectSlug === 'all' || house.projectSlug === projectSlug
      const matchPrice = matchesPriceRange(house.price, priceRange)
      const matchBedrooms =
        bedrooms === 'all' || house.bedrooms >= Number(bedrooms)

      return (
        matchKeyword &&
        matchLocation &&
        matchProject &&
        matchPrice &&
        matchBedrooms
      )
    })

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price)
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price)
    }
    if (sortBy === 'land-desc') {
      return [...list].sort((a, b) => b.landArea - a.landArea)
    }
    return list
  }, [keyword, location, projectSlug, priceRange, bedrooms, sortBy])

  return (
    <>
      <section className="bg-[#173F35] text-white py-14 lg:py-18">
        <div className="container-app">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D8B978]">
            Katalog Hunian PERUMAHAN
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-[42px] font-extrabold leading-tight">
            Jelajahi Tipe Rumah &amp; Ketersediaan Unit
          </h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-white/80">
            Bandingkan luas tanah, luas bangunan, jumlah kamar, harga transparan, dan
            ketersediaan unit secara cepat di seluruh proyek kami.
          </p>
        </div>
      </section>

      <section className="py-10 lg:py-14 bg-[#F5F4EF]">
        <div className="container-app">
          {/* Filter Panel */}
          <div className="rounded-2xl border border-[#E3E0D6] bg-white p-5 sm:p-6 shadow-[var(--shadow-card)]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#285C49]">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filter &amp; Pencarian Katalog
              </div>
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#173F35] hover:text-[#285C49] cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Semua Filter
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <label
                  htmlFor="catalog-search"
                  className="block text-xs font-medium text-[#5F6B66] mb-1.5"
                >
                  Cari Tipe Rumah / Kata Kunci
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B66]" />
                  <input
                    id="catalog-search"
                    type="text"
                    value={keyword}
                    onChange={(e) => updateParam('q', e.target.value, '')}
                    placeholder="Akasia, Cendana, 2 lantai, villa..."
                    className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/60 pl-10 pr-3.5 text-sm text-[#242B28] focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15"
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <label
                  htmlFor="catalog-location"
                  className="block text-xs font-medium text-[#5F6B66] mb-1.5"
                >
                  Lokasi
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B66]" />
                  <select
                    id="catalog-location"
                    value={location}
                    onChange={(e) => updateParam('lokasi', e.target.value, 'Semua Lokasi')}
                    className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/60 pl-9 pr-2.5 text-sm text-[#242B28] focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15"
                  >
                    {PROJECT_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="lg:col-span-2">
                <label
                  htmlFor="catalog-project"
                  className="block text-xs font-medium text-[#5F6B66] mb-1.5"
                >
                  Proyek
                </label>
                <select
                  id="catalog-project"
                  value={projectSlug}
                  onChange={(e) => updateParam('proyek', e.target.value, 'all')}
                  className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/60 px-3 text-sm text-[#242B28] focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15"
                >
                  <option value="all">Semua Proyek</option>
                  {DEMO_PROJECTS.map((proj) => (
                    <option key={proj.slug} value={proj.slug}>
                      {proj.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label
                  htmlFor="catalog-price"
                  className="block text-xs font-medium text-[#5F6B66] mb-1.5"
                >
                  Rentang Harga
                </label>
                <select
                  id="catalog-price"
                  value={priceRange}
                  onChange={(e) => updateParam('harga', e.target.value, 'all')}
                  className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/60 px-3 text-sm text-[#242B28] focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15"
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
                  htmlFor="catalog-bedrooms"
                  className="block text-xs font-medium text-[#5F6B66] mb-1.5"
                >
                  Kamar Tidur
                </label>
                <select
                  id="catalog-bedrooms"
                  value={bedrooms}
                  onChange={(e) => updateParam('kt', e.target.value, 'all')}
                  className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/60 px-3 text-sm text-[#242B28] focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15"
                >
                  <option value="all">Semua Kamar</option>
                  <option value="2">2+ Kamar Tidur</option>
                  <option value="3">3+ Kamar Tidur</option>
                  <option value="4">4+ Kamar Tidur</option>
                </select>
              </div>
            </div>
          </div>

          {/* Result Toolbar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-[#5F6B66]">
              Menampilkan <strong className="text-[#173F35]">{filteredHouses.length}</strong>{' '}
              dari {DEMO_HOUSE_TYPES.length} tipe rumah
            </p>

            <div className="flex items-center gap-2.5">
              <label
                htmlFor="catalog-sort"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5F6B66]"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                Urutkan:
              </label>
              <select
                id="catalog-sort"
                value={sortBy}
                onChange={(e) => updateParam('sort', e.target.value, 'recommended')}
                className="h-9 rounded-lg border border-[#E3E0D6] bg-white px-3 text-xs font-medium text-[#173F35] focus:border-[#173F35] focus:outline-none"
              >
                <option value="recommended">Rekomendasi</option>
                <option value="price-asc">Harga Terendah</option>
                <option value="price-desc">Harga Tertinggi</option>
                <option value="land-desc">Luas Tanah Terbesar</option>
              </select>
            </div>
          </div>

          {filteredHouses.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-[#E3E0D6] bg-white px-6 py-16 text-center">
              <p className="font-display text-lg font-bold text-[#173F35]">
                Belum ada tipe rumah yang sesuai kriteria filter
              </p>
              <p className="mt-2 text-sm text-[#5F6B66] max-w-md mx-auto">
                Coba ubah rentang harga, lokasi, atau klik tombol reset untuk melihat seluruh
                pilihan hunian yang tersedia.
              </p>
              <Button variant="primary" size="sm" onClick={resetAll} className="mt-6">
                <RotateCcw className="h-4 w-4" />
                Reset Semua Filter
              </Button>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-7 md:grid-cols-2">
              {filteredHouses.map((house) => (
                <HouseTypeCard key={house.id} house={house} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
