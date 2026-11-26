import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Compass,
  ExternalLink,
  Home,
  MapPin,
  MessageCircle,
} from 'lucide-react'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { HouseTypeCard } from '@/components/property/HouseTypeCard'
import { HouseGallery } from '@/components/property/HouseGallery'
import { getHouseTypesByProjectId, getProjectBySlug } from '@/lib/demo-data'
import { APP_CONFIG } from '@/lib/config'
import { formatCompactPrice } from '@/utils/format'
import type { ProjectStatus } from '@/types/property'

const statusMap: Record<ProjectStatus, { label: string; variant: BadgeVariant }> = {
  launching: { label: 'New Launch', variant: 'gold' },
  available: { label: 'Tersedia', variant: 'emerald' },
  limited: { label: 'Unit Terbatas', variant: 'warning' },
  sold_out: { label: 'Terjual Habis', variant: 'muted' },
}

export function ProjectDetailPage() {
  const { slug = '' } = useParams()
  const project = getProjectBySlug(slug)

  if (!project) {
    return (
      <section className="py-24 bg-[#F5F4EF]">
        <div className="container-app">
          <div className="mx-auto max-w-lg rounded-2xl border border-[#E3E0D6] bg-white p-10 text-center shadow-[var(--shadow-card)]">
            <h1 className="font-display text-2xl font-bold text-[#173F35]">
              Proyek tidak ditemukan
            </h1>
            <p className="mt-2 text-sm text-[#5F6B66]">
              Proyek yang Anda cari mungkin telah dipindahkan atau tidak tersedia.
            </p>
            <Button variant="primary" to="/proyek" className="mt-6">
              <ArrowLeft className="h-4 w-4 text-[#D8B978]" />
              Kembali ke Daftar Proyek
            </Button>
          </div>
        </div>
      </section>
    )
  }

  const houseTypes = getHouseTypesByProjectId(project.id)
  const status = statusMap[project.status]

  return (
    <div className="bg-[#F5F4EF] pb-20">
      {/* Breadcrumb Bar */}
      <div className="border-b border-[#E3E0D6] bg-white">
        <div className="container-app py-3.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5F6B66]">
          <nav className="flex items-center gap-2" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-[#173F35]">
              Beranda
            </Link>
            <span>/</span>
            <Link to="/proyek" className="hover:text-[#173F35]">
              Proyek
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#173F35]">{project.name}</span>
          </nav>
          <Link
            to="/proyek"
            className="inline-flex items-center gap-1.5 font-medium text-[#173F35] hover:text-[#285C49]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Semua Proyek
          </Link>
        </div>
      </div>

      {/* Overview Header */}
      <section className="py-10 lg:py-14">
        <div className="container-app grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <HouseGallery images={project.galleryImages} title={project.name} />
          </div>

          <div className="lg:col-span-5 rounded-2xl border border-[#E3E0D6] bg-white p-6 sm:p-7 shadow-[var(--shadow-card)] space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={status.variant}>{status.label}</Badge>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#285C49]">
                  <MapPin className="h-3.5 w-3.5" />
                  {project.location}
                </span>
              </div>
              <h1 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold text-[#173F35]">
                {project.name}
              </h1>
              <p className="mt-1.5 text-sm font-medium text-[#285C49]">
                {project.tagline}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-[#5F6B66]">
                {project.fullDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#F5F4EF] p-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#5F6B66]">
                  Harga Mulai
                </p>
                <p className="mt-0.5 font-display text-xl font-bold text-[#173F35]">
                  {formatCompactPrice(project.startingPrice)}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#5F6B66]">
                  Luas Kawasan
                </p>
                <p className="mt-0.5 font-display text-xl font-bold text-[#173F35]">
                  {project.totalAreaHectares}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#5F6B66]">
                  Ketersediaan Unit
                </p>
                <p className="mt-0.5 text-sm font-bold text-[#285C49]">
                  {project.availableUnits} Tersedia • {project.reservedUnits} Reserved
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#5F6B66]">
                  Kisaran Luas Tanah
                </p>
                <p className="mt-0.5 text-sm font-bold text-[#173F35]">
                  {project.landAreaRange}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-[#5F6B66] bg-[#FAF9F5] border border-[#E3E0D6] rounded-xl px-4 py-3">
              <Calendar className="h-4 w-4 text-[#285C49] shrink-0" />
              <span>{project.completionTarget}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="primary" size="md" to={`/katalog?proyek=${project.slug}`} className="flex-1">
                <Home className="h-4 w-4 text-[#D8B978]" />
                Pilih Tipe Rumah
              </Button>
              <a
                href={`https://wa.me/${APP_CONFIG.whatsapp}?text=${encodeURIComponent(`Halo PERUMAHAN, saya tertarik dengan proyek ${project.name}. Mohon informasi ketersediaan unit.`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#173F35]/20 bg-white px-4 text-sm font-medium text-[#173F35] transition-colors hover:border-[#173F35] hover:bg-[#F5F4EF]"
              >
                <MessageCircle className="h-4 w-4 text-[#285C49]" />
                WhatsApp Sales
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* House Types in Project */}
      <section className="py-12 bg-white border-y border-[#E3E0D6]">
        <div className="container-app">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#285C49]">
                Pilihan Tipe di {project.name}
              </p>
              <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-[#173F35]">
                Tipe Rumah Tersedia ({houseTypes.length})
              </h2>
            </div>
            <Button variant="outline" size="sm" to="/katalog">
              Lihat Seluruh Katalog
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {houseTypes.map((house) => (
              <HouseTypeCard key={house.id} house={house} />
            ))}
          </div>
        </div>
      </section>

      {/* Facilities & Google Maps */}
      <section className="pt-14">
        <div className="container-app grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 rounded-2xl border border-[#E3E0D6] bg-white p-6 sm:p-7 shadow-[var(--shadow-card)] space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#285C49]">
                Fasilitas Internal Kawasan
              </p>
              <h2 className="mt-1.5 font-display text-2xl font-bold text-[#173F35]">
                Keunggulan Lingkungan
              </h2>
            </div>

            <ul className="space-y-3">
              {project.facilities.map((facility) => (
                <li key={facility} className="flex items-start gap-3 text-sm text-[#242B28]">
                  <CheckCircle2 className="h-4 w-4 text-[#285C49] shrink-0 mt-0.5" />
                  <span>{facility}</span>
                </li>
              ))}
            </ul>

            <div className="pt-5 border-t border-[#E3E0D6]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#285C49] mb-3 flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5" />
                Aksesibilitas Terdekat
              </p>
              <ul className="space-y-2 text-sm text-[#5F6B66]">
                {project.map.nearbyAccess.map((access) => (
                  <li key={access} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D8B978]" />
                    <span>{access}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-2xl border border-[#E3E0D6] bg-white p-6 sm:p-7 shadow-[var(--shadow-card)] flex flex-col">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#285C49]">
                  Peta Lokasi Kawasan
                </p>
                <h2 className="mt-1 font-display text-xl font-bold text-[#173F35]">
                  {project.name}
                </h2>
                <p className="mt-1 text-xs text-[#5F6B66]">{project.map.address}</p>
              </div>
              <a
                href={project.map.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E3E0D6] bg-[#F5F4EF] px-3.5 py-2 text-xs font-semibold text-[#173F35] hover:border-[#173F35] transition-colors"
              >
                Buka Google Maps
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#E3E0D6] bg-[#ECEAE1] flex-1 min-h-[320px]">
              <iframe
                title={`Peta Lokasi ${project.name}`}
                src={project.map.embedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full min-h-[320px] w-full border-0"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
