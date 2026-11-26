import { useEffect, useState } from 'react'
import { Expand, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { DEMO_GALLERY } from '@/lib/demo-data'
import type { GalleryItem } from '@/types/property'
import { cn } from '@/utils/cn'

const categories: Array<'Semua' | GalleryItem['category']> = [
  'Semua',
  'Eksterior',
  'Kawasan',
  'Fasilitas',
  'Interior',
]

export function GallerySection() {
  const [activeCategory, setActiveCategory] = useState<'Semua' | GalleryItem['category']>('Semua')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filteredItems =
    activeCategory === 'Semua'
      ? DEMO_GALLERY
      : DEMO_GALLERY.filter((item) => item.category === activeCategory)

  useEffect(() => {
    if (lightboxIndex === null) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxIndex(null)
      if (event.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % filteredItems.length,
        )
      }
      if (event.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + filteredItems.length) % filteredItems.length,
        )
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex, filteredItems.length])

  const activeItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null

  return (
    <section className="py-20 lg:py-24 bg-white border-y border-[#E3E0D6]/80">
      <div className="container-app">
        <SectionHeading
          overline="Galeri Arsitektur"
          title="Detail Visual Kawasan, Fasad, & Ruang Hidup"
          description="Lihat langsung nuansa estetika modern tropis dan kerapian lingkungan di berbagai proyek PERUMAHAN."
          action={
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter kategori galeri">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === cat}
                  onClick={() => {
                    setActiveCategory(cat)
                    setLightboxIndex(null)
                  }}
                  className={cn(
                    'rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer',
                    activeCategory === cat
                      ? 'bg-[#173F35] text-white shadow-xs'
                      : 'bg-[#F5F4EF] text-[#5F6B66] hover:bg-[#ECEAE1] hover:text-[#173F35]',
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          }
        />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLightboxIndex(idx)}
              className="group relative overflow-hidden rounded-2xl border border-[#E3E0D6] bg-[#ECEAE1] text-left aspect-[4/3] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173F35]"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#102D26]/85 via-[#102D26]/15 to-transparent opacity-85 transition-opacity group-hover:opacity-95" />
              <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#173F35] opacity-0 transition-all duration-200 group-hover:opacity-100">
                <Expand className="h-4 w-4" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="inline-block rounded-full bg-[#D8B978]/25 border border-[#D8B978]/40 px-2.5 py-0.5 text-[11px] font-medium text-[#EFE3C6]">
                  {item.category}
                </span>
                <h3 className="mt-2 font-display text-base font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-0.5 text-xs text-white/75">{item.projectName}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Lightbox Modal */}
      {activeItem && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#102D26]/90 p-4 backdrop-blur-sm"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Tutup pratinjau galeri"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#102D26]/75 text-white transition-colors hover:bg-[#102D26] cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative aspect-[16/10] bg-[#102D26]">
              <img
                src={activeItem.imageUrl}
                alt={activeItem.title}
                className="h-full w-full object-cover"
              />
              {filteredItems.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Foto sebelumnya"
                    onClick={() =>
                      setLightboxIndex(
                        (lightboxIndex - 1 + filteredItems.length) % filteredItems.length,
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#173F35] shadow-md hover:bg-white cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Foto berikutnya"
                    onClick={() =>
                      setLightboxIndex((lightboxIndex + 1) % filteredItems.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#173F35] shadow-md hover:bg-white cursor-pointer"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#285C49]">
                  {activeItem.category} • {activeItem.projectName}
                </p>
                <h3 className="mt-1 font-display text-lg font-bold text-[#173F35]">
                  {activeItem.title}
                </h3>
                <p className="mt-1 text-sm text-[#5F6B66]">{activeItem.caption}</p>
              </div>
              <span className="text-xs font-medium text-[#5F6B66] shrink-0">
                {lightboxIndex + 1} / {filteredItems.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
