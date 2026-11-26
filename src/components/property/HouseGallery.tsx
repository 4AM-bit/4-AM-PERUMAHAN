import { useState } from 'react'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface HouseGalleryProps {
  images: string[]
  title: string
}

export function HouseGallery({ images, title }: HouseGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const currentImage = images[selectedIndex] ?? images[0]

  const goPrev = () =>
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length)
  const goNext = () => setSelectedIndex((prev) => (prev + 1) % images.length)

  return (
    <div className="space-y-3.5">
      <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-[#E3E0D6] bg-[#ECEAE1] shadow-[var(--shadow-card)]">
        <img
          src={currentImage}
          alt={`${title} - Foto ${selectedIndex + 1}`}
          className="h-full w-full object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Foto sebelumnya"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#173F35] shadow-md transition-all hover:bg-white cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Foto berikutnya"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#173F35] shadow-md transition-all hover:bg-white cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Perbesar foto"
          className="absolute right-4 bottom-4 inline-flex items-center gap-1.5 rounded-full bg-[#173F35]/85 px-3.5 py-2 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-[#173F35] cursor-pointer"
        >
          <Expand className="h-3.5 w-3.5 text-[#D8B978]" />
          Perbesar ({selectedIndex + 1}/{images.length})
        </button>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                'relative aspect-[4/3] overflow-hidden rounded-xl border-2 transition-all cursor-pointer',
                idx === selectedIndex
                  ? 'border-[#173F35] ring-2 ring-[#173F35]/20'
                  : 'border-transparent opacity-75 hover:opacity-100',
              )}
            >
              <img
                src={img}
                alt={`${title} thumbnail ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galeri ${title}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#102D26]/92 p-4 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-[#102D26] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Tutup pratinjau"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#173F35] hover:bg-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={currentImage}
              alt={`${title} - Foto ${selectedIndex + 1}`}
              className="max-h-[82vh] w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
