import { ArrowRight, RotateCcw } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { HouseTypeCard } from '@/components/property/HouseTypeCard'
import { usePublicCatalog } from '@/hooks/usePublicCatalog'
import type { PropertySearchQuery } from '@/types/property'

interface HouseTypesSectionProps {
  searchQuery: PropertySearchQuery
  onResetSearch: () => void
}

function matchesPriceRange(price: number, range: string): boolean {
  if (range === 'under-1b') return price < 1_000_000_000
  if (range === '1b-2b') return price >= 1_000_000_000 && price <= 2_000_000_000
  if (range === 'above-2b') return price > 2_000_000_000
  return true
}

export function HouseTypesSection({
  searchQuery,
  onResetSearch,
}: HouseTypesSectionProps) {
  const { houseTypes } = usePublicCatalog()

  const hasActiveFilter =
    searchQuery.keyword.trim() !== '' ||
    searchQuery.location !== 'Semua Lokasi' ||
    searchQuery.priceRange !== 'all' ||
    searchQuery.bedrooms !== 'all'

  const featuredList = houseTypes.filter((house) => house.featured)
  const baseList = hasActiveFilter
    ? houseTypes
    : featuredList.length > 0
      ? featuredList.slice(0, 4)
      : houseTypes.slice(0, 4)

  const filteredHouses = baseList.filter((house) => {
    const kw = searchQuery.keyword.trim().toLowerCase()
    const matchKeyword =
      !kw ||
      house.name.toLowerCase().includes(kw) ||
      house.projectName.toLowerCase().includes(kw) ||
      house.category.toLowerCase().includes(kw) ||
      house.shortDescription.toLowerCase().includes(kw)

    const matchLocation =
      searchQuery.location === 'Semua Lokasi' ||
      house.projectLocation === searchQuery.location

    const matchPrice = matchesPriceRange(house.price, searchQuery.priceRange)

    const matchBedrooms =
      searchQuery.bedrooms === 'all' ||
      house.bedrooms >= Number(searchQuery.bedrooms)

    return matchKeyword && matchLocation && matchPrice && matchBedrooms
  })

  const catalogParams = new URLSearchParams()
  if (searchQuery.keyword.trim()) catalogParams.set('q', searchQuery.keyword.trim())
  if (searchQuery.location !== 'Semua Lokasi') catalogParams.set('lokasi', searchQuery.location)
  if (searchQuery.priceRange !== 'all') catalogParams.set('harga', searchQuery.priceRange)
  if (searchQuery.bedrooms !== 'all') catalogParams.set('kt', searchQuery.bedrooms)
  const catalogUrl = catalogParams.toString()
    ? `/katalog?${catalogParams.toString()}`
    : '/katalog'

  return (
    <section id="pilihan-rumah" className="py-20 lg:py-24 bg-white border-y border-[#E3E0D6]/80">
      <div className="container-app">
        <SectionHeading
          overline="Pilihan Tipe Rumah"
          title="Desain Fungsional untuk Setiap Fase Kehidupan"
          description="Pilih tipe rumah ideal dari hunian 1 lantai modern hingga vila keluarga 2 lantai dengan spesifikasi material pilihan."
          action={
            <div className="flex items-center gap-2.5">
              {hasActiveFilter && (
                <Button variant="ghost" size="sm" onClick={onResetSearch}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Filter
                </Button>
              )}
              <Button variant="outline" to={catalogUrl}>
                Buka Katalog Lengkap ({houseTypes.length} Tipe)
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          }
        />

        {hasActiveFilter && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#285C49]/20 bg-[#F5F4EF] px-4 py-3 text-sm">
            <p className="text-[#242B28]">
              Menampilkan <strong className="text-[#173F35]">{filteredHouses.length}</strong> dari{' '}
              {houseTypes.length} tipe rumah sesuai kriteria pencarian Anda.
            </p>
            <button
              type="button"
              onClick={onResetSearch}
              className="text-xs font-semibold text-[#173F35] underline underline-offset-4 hover:text-[#285C49] cursor-pointer"
            >
              Tampilkan Pilihan Unggulan
            </button>
          </div>
        )}

        {filteredHouses.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-[#E3E0D6] bg-[#F5F4EF]/60 px-6 py-14 text-center">
            <p className="font-display text-lg font-bold text-[#173F35]">
              Belum ada tipe rumah yang sesuai dengan filter Anda
            </p>
            <p className="mt-2 text-sm text-[#5F6B66] max-w-md mx-auto">
              Coba perluas rentang harga, ubah lokasi kawasan, atau reset pencarian untuk melihat seluruh tipe hunian yang tersedia.
            </p>
            <Button variant="primary" size="sm" onClick={onResetSearch} className="mt-6">
              <RotateCcw className="h-4 w-4" />
              Reset Kriteria Pencarian
            </Button>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-2">
            {filteredHouses.map((house) => (
              <HouseTypeCard key={house.id} house={house} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
