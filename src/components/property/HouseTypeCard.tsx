import { ArrowRight, Bath, BedDouble, Layers, MapPin, Maximize2 } from 'lucide-react'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatArea, formatCurrency } from '@/utils/format'
import type { AvailabilityStatus, HouseType } from '@/types/property'

const availabilityMap: Record<AvailabilityStatus, { label: string; variant: BadgeVariant }> = {
  available: { label: 'Unit Tersedia', variant: 'emerald' },
  limited: { label: 'Terbatas', variant: 'warning' },
  reserved: { label: 'Reserved', variant: 'gold' },
  sold: { label: 'Terjual', variant: 'muted' },
}

interface HouseTypeCardProps {
  house: HouseType
}

export function HouseTypeCard({ house }: HouseTypeCardProps) {
  const availability = availabilityMap[house.status]

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#E3E0D6] bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#ECEAE1]">
        <img
          src={house.coverImage}
          alt={house.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <Badge variant={availability.variant} className="bg-white/95 backdrop-blur-sm">
            {availability.label} ({house.availableUnits} Unit)
          </Badge>
        </div>
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#173F35]/85 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <MapPin className="h-3 w-3 text-[#D8B978]" />
            {house.projectName} • {house.projectLocation}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[#285C49]">{house.category}</p>
            <h3 className="mt-1 font-display text-xl font-bold text-[#173F35]">
              {house.name}
            </h3>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[11px] uppercase tracking-wider text-[#5F6B66]">
              Harga Cash / KPR
            </p>
            <p className="font-display text-lg font-bold text-[#173F35]">
              {formatCurrency(house.price)}
            </p>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-[#5F6B66]">
          {house.shortDescription}
        </p>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-xl bg-[#F5F4EF] p-3.5 text-xs">
          <div className="flex items-center gap-2 text-[#242B28]">
            <Maximize2 className="h-4 w-4 text-[#285C49] shrink-0" />
            <div>
              <span className="block text-[10px] text-[#5F6B66]">Luas Tanah</span>
              <strong className="font-semibold">{formatArea(house.landArea)}</strong>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#242B28]">
            <Layers className="h-4 w-4 text-[#285C49] shrink-0" />
            <div>
              <span className="block text-[10px] text-[#5F6B66]">Bangunan</span>
              <strong className="font-semibold">{formatArea(house.buildingArea)}</strong>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#242B28]">
            <BedDouble className="h-4 w-4 text-[#285C49] shrink-0" />
            <div>
              <span className="block text-[10px] text-[#5F6B66]">Kamar Tidur</span>
              <strong className="font-semibold">{house.bedrooms} KT</strong>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#242B28]">
            <Bath className="h-4 w-4 text-[#285C49] shrink-0" />
            <div>
              <span className="block text-[10px] text-[#5F6B66]">Kamar Mandi</span>
              <strong className="font-semibold">{house.bathrooms} KM</strong>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-5">
          <div className="pt-4 border-t border-[#E3E0D6]/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {house.specs.map((spec) => (
                <span
                  key={spec}
                  className="text-xs text-[#5F6B66] bg-[#F5F4EF] px-2.5 py-1 rounded-md"
                >
                  {spec}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm" to={`/rumah/${house.slug}`}>
                Detail
              </Button>
              <Button variant="primary" size="sm" to={`/rumah/${house.slug}#reservasi`}>
                Reservasi
                <ArrowRight className="h-3.5 w-3.5 text-[#D8B978]" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
