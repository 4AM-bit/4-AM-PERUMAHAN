import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  Bath,
  BedDouble,
  Calculator,
  Car,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  Lock,
  MapPin,
  Maximize2,
  MessageCircle,
  ShieldCheck,
  X,
} from 'lucide-react'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { HouseGallery } from '@/components/property/HouseGallery'
import { FloorplanViewer } from '@/components/property/FloorplanViewer'
import { getHouseTypeBySlug, getProjectBySlug } from '@/lib/demo-data'
import { APP_CONFIG } from '@/lib/config'
import { formatArea, formatCurrency } from '@/utils/format'
import type { UnitStatus } from '@/types/property'
import { cn } from '@/utils/cn'

const unitStatusLabel: Record<UnitStatus, { label: string; variant: BadgeVariant }> = {
  available: { label: 'Tersedia', variant: 'emerald' },
  reserved: { label: 'Reserved', variant: 'gold' },
  sold: { label: 'Terjual', variant: 'muted' },
  inactive: { label: 'Nonaktif', variant: 'muted' },
}

export function HouseDetailPage() {
  const { slug = '' } = useParams()
  const house = getHouseTypeBySlug(slug)
  const project = house ? getProjectBySlug(house.projectSlug) : undefined

  const firstAvailableUnit = house?.sampleUnits.find((u) => u.status === 'available')
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    firstAvailableUnit?.id ?? house?.sampleUnits[0]?.id ?? '',
  )
  const [dpPercent, setDpPercent] = useState(20)
  const [tenorYears, setTenorYears] = useState(15)
  const [showReservationModal, setShowReservationModal] = useState(false)

  const selectedUnit = useMemo(
    () =>
      house?.sampleUnits.find((u) => u.id === selectedUnitId) ??
      firstAvailableUnit ??
      house?.sampleUnits[0],
    [house, selectedUnitId, firstAvailableUnit],
  )

  const activePrice = selectedUnit?.price ?? house?.price ?? 0

  const monthlyInstallment = useMemo(() => {
    const loanPrincipal = activePrice * (1 - dpPercent / 100)
    const monthlyRate = 0.0675 / 12 // 6.75% fixed estimasi KPR
    const months = tenorYears * 12
    const factor = Math.pow(1 + monthlyRate, months)
    return Math.round((loanPrincipal * monthlyRate * factor) / (factor - 1))
  }, [activePrice, dpPercent, tenorYears])

  if (!house || !project) {
    return (
      <section className="py-24 bg-[#F5F4EF]">
        <div className="container-app">
          <div className="mx-auto max-w-lg rounded-2xl border border-[#E3E0D6] bg-white p-10 text-center shadow-[var(--shadow-card)]">
            <h1 className="font-display text-2xl font-bold text-[#173F35]">
              Tipe rumah tidak ditemukan
            </h1>
            <p className="mt-2 text-sm text-[#5F6B66]">
              Silakan kembali ke katalog rumah untuk melihat pilihan unit yang tersedia.
            </p>
            <Button variant="primary" to="/katalog" className="mt-6">
              <ArrowLeft className="h-4 w-4 text-[#D8B978]" />
              Kembali ke Katalog Rumah
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="bg-[#F5F4EF] pb-20">
      {/* Breadcrumb */}
      <div className="border-b border-[#E3E0D6] bg-white">
        <div className="container-app py-3.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5F6B66]">
          <nav className="flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-[#173F35]">
              Beranda
            </Link>
            <span>/</span>
            <Link to="/katalog" className="hover:text-[#173F35]">
              Katalog Rumah
            </Link>
            <span>/</span>
            <Link to={`/proyek/${project.slug}`} className="hover:text-[#173F35]">
              {project.name}
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#173F35]">{house.name}</span>
          </nav>
          <Link
            to="/katalog"
            className="inline-flex items-center gap-1.5 font-medium text-[#173F35] hover:text-[#285C49]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Katalog
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="container-app pt-8 lg:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 8 Columns: Gallery, Specs, Floorplan, Facilities, Map */}
          <div className="lg:col-span-8 space-y-8">
            <HouseGallery images={house.galleryImages} title={house.name} />

            {/* Overview & Highlights */}
            <div className="rounded-2xl border border-[#E3E0D6] bg-white p-6 sm:p-7 shadow-[var(--shadow-card)]">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="emerald">
                  {house.availableUnits} Unit Tersedia dari {house.totalUnits}
                </Badge>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#285C49]">
                  <MapPin className="h-3.5 w-3.5" />
                  {project.name} • {project.location}
                </span>
              </div>

              <h1 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold text-[#173F35]">
                {house.name}
              </h1>
              <p className="mt-1 text-sm font-medium text-[#285C49]">{house.category}</p>

              <p className="mt-4 text-sm sm:text-[15px] leading-relaxed text-[#5F6B66]">
                {house.fullDescription}
              </p>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { icon: Maximize2, label: 'Luas Tanah', value: formatArea(house.landArea) },
                  { icon: Layers, label: 'Bangunan', value: formatArea(house.buildingArea) },
                  { icon: BedDouble, label: 'Kamar Tidur', value: `${house.bedrooms} KT` },
                  { icon: Bath, label: 'Kamar Mandi', value: `${house.bathrooms} KM` },
                  { icon: Layers, label: 'Jumlah Lantai', value: `${house.floors} Lantai` },
                  { icon: Car, label: 'Carport', value: `${house.carport} Mobil` },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-[#E3E0D6]/80 bg-[#FAF9F5] p-3 text-center"
                  >
                    <Icon className="mx-auto h-4 w-4 text-[#285C49]" />
                    <p className="mt-1.5 text-[10px] uppercase tracking-wider text-[#5F6B66]">
                      {label}
                    </p>
                    <p className="mt-0.5 font-display text-sm font-bold text-[#173F35]">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Architectural Floorplan */}
            <FloorplanViewer floorplans={house.floorplans} houseName={house.name} />

            {/* Building Specifications */}
            <div className="rounded-2xl border border-[#E3E0D6] bg-white p-6 sm:p-7 shadow-[var(--shadow-card)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#285C49]">
                Standar Kualitas Material
              </p>
              <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-[#173F35]">
                Spesifikasi Bangunan
              </h2>

              <div className="mt-5 divide-y divide-[#E3E0D6]/80 rounded-xl border border-[#E3E0D6]">
                {house.buildingSpecs.map((spec) => (
                  <div
                    key={spec.label}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 px-4 py-3.5 text-sm odd:bg-[#FAF9F5]/60"
                  >
                    <span className="sm:col-span-4 font-semibold text-[#173F35]">
                      {spec.label}
                    </span>
                    <span className="sm:col-span-8 text-[#5F6B66]">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Facilities */}
            <div className="rounded-2xl border border-[#E3E0D6] bg-white p-6 sm:p-7 shadow-[var(--shadow-card)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#285C49]">
                Fasilitas Kawasan
              </p>
              <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-[#173F35]">
                Fasilitas Eksklusif di {project.name}
              </h2>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {project.facilities.map((fac) => (
                  <div
                    key={fac}
                    className="flex items-start gap-2.5 rounded-xl border border-[#E3E0D6]/80 bg-[#FAF9F5] px-4 py-3 text-sm text-[#242B28]"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#285C49] shrink-0 mt-0.5" />
                    <span>{fac}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Google Maps Location */}
            <div className="rounded-2xl border border-[#E3E0D6] bg-white p-6 sm:p-7 shadow-[var(--shadow-card)]">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#285C49]">
                    Lokasi Proyek (Google Maps)
                  </p>
                  <h2 className="mt-1 font-display text-xl font-bold text-[#173F35]">
                    {project.name} — {project.location}
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

              <div className="overflow-hidden rounded-xl border border-[#E3E0D6] bg-[#ECEAE1]">
                <iframe
                  title={`Peta Lokasi ${house.name}`}
                  src={project.map.embedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[320px] w-full border-0"
                />
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#5F6B66]">
                {project.map.nearbyAccess.map((access) => (
                  <div key={access} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D8B978]" />
                    <span>{access}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 4 Columns: Sticky Reservation & KPR Panel */}
          <aside id="reservasi" className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="rounded-2xl border border-[#E3E0D6] bg-white p-6 shadow-[var(--shadow-card)] space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#285C49]">
                  Harga Unit {selectedUnit ? `(${selectedUnit.unitCode})` : ''}
                </p>
                <p className="mt-1 font-display text-3xl font-extrabold text-[#173F35]">
                  {formatCurrency(activePrice)}
                </p>
                <p className="mt-1 text-xs text-[#5F6B66]">
                  Termasuk SHM, PBG, instalasi PLN &amp; air bersih kawasan
                </p>
              </div>

              {/* Selectable Sample Units */}
              <div className="pt-4 border-t border-[#E3E0D6]">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#173F35]">
                    Pilih Nomor Unit (Demo)
                  </p>
                  <span className="text-[11px] text-[#5F6B66]">
                    {house.sampleUnits.filter((u) => u.status === 'available').length} tersedia
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {house.sampleUnits.map((unit) => {
                    const isAvailable = unit.status === 'available'
                    const isSelected = selectedUnit?.id === unit.id
                    const st = unitStatusLabel[unit.status]

                    return (
                      <button
                        key={unit.id}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedUnitId(unit.id)}
                        className={cn(
                          'rounded-xl border p-2.5 text-left transition-all',
                          isAvailable
                            ? 'cursor-pointer hover:border-[#173F35]'
                            : 'cursor-not-allowed opacity-55 bg-[#F5F4EF]',
                          isSelected && isAvailable
                            ? 'border-[#173F35] bg-[#173F35]/5 ring-1 ring-[#173F35]'
                            : 'border-[#E3E0D6] bg-white',
                        )}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-display text-xs font-bold text-[#173F35]">
                            {unit.unitCode}
                          </span>
                          <Badge variant={st.variant} className="px-2 py-0.5 text-[10px]">
                            {st.label}
                          </Badge>
                        </div>
                        <p className="mt-1 text-[11px] text-[#5F6B66]">
                          LT {unit.landArea} m² • {unit.facing}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Reservation Info */}
              <div className="rounded-xl bg-[#F5F4EF] p-4 space-y-2.5 text-xs">
                <p className="font-display text-xs font-bold uppercase tracking-wider text-[#173F35]">
                  Informasi Reservasi Unit
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[#5F6B66]">Booking Fee (Tanda Jadi)</span>
                  <strong className="text-[#173F35]">{formatCurrency(house.bookingFee)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5F6B66]">Penguncian Unit Sementara</span>
                  <strong className="inline-flex items-center gap-1 text-[#173F35]">
                    <Clock className="h-3.5 w-3.5 text-[#285C49]" />
                    {house.reservationHoldHours} Jam
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5F6B66]">Metode Pembayaran</span>
                  <strong className="text-[#173F35]">Transfer Bank Manual</strong>
                </div>
                <p className="pt-2 border-t border-[#E3E0D6] text-[11px] leading-relaxed text-[#5F6B66] flex items-start gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#285C49] shrink-0 mt-0.5" />
                  Unit terkunci otomatis di database saat reservasi dibuat dan diverifikasi
                  oleh administrator setelah bukti transfer diunggah.
                </p>
              </div>

              <div className="space-y-2.5">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => setShowReservationModal(true)}
                >
                  <Lock className="h-4 w-4 text-[#D8B978]" />
                  Reservasi Unit {selectedUnit?.unitCode ?? ''}
                </Button>

                <a
                  href={`https://wa.me/${APP_CONFIG.whatsapp}?text=${encodeURIComponent(`Halo PERUMAHAN, saya ingin konsultasi & reservasi ${house.name} (${selectedUnit?.unitCode ?? ''}) di ${project.name}.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#173F35]/20 bg-white px-4 text-sm font-medium text-[#173F35] transition-colors hover:border-[#173F35] hover:bg-[#F5F4EF]"
                >
                  <MessageCircle className="h-4 w-4 text-[#285C49]" />
                  Tanya Sales via WhatsApp
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Quick KPR Estimator */}
            <div className="rounded-2xl border border-[#E3E0D6] bg-white p-6 shadow-[var(--shadow-card)] space-y-4">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-[#285C49]" />
                <h3 className="font-display text-sm font-bold text-[#173F35]">
                  Estimasi Cicilan KPR Ringkas
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="kpr-dp" className="block text-[11px] text-[#5F6B66] mb-1">
                    Uang Muka (DP)
                  </label>
                  <select
                    id="kpr-dp"
                    value={dpPercent}
                    onChange={(e) => setDpPercent(Number(e.target.value))}
                    className="h-9 w-full rounded-lg border border-[#E3E0D6] bg-[#F5F4EF]/60 px-2.5 text-xs font-semibold text-[#173F35]"
                  >
                    <option value={10}>10% ({formatCurrency(activePrice * 0.1)})</option>
                    <option value={20}>20% ({formatCurrency(activePrice * 0.2)})</option>
                    <option value={30}>30% ({formatCurrency(activePrice * 0.3)})</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="kpr-tenor" className="block text-[11px] text-[#5F6B66] mb-1">
                    Tenor Pinjaman
                  </label>
                  <select
                    id="kpr-tenor"
                    value={tenorYears}
                    onChange={(e) => setTenorYears(Number(e.target.value))}
                    className="h-9 w-full rounded-lg border border-[#E3E0D6] bg-[#F5F4EF]/60 px-2.5 text-xs font-semibold text-[#173F35]"
                  >
                    <option value={10}>10 Tahun</option>
                    <option value={15}>15 Tahun</option>
                    <option value={20}>20 Tahun</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl bg-[#173F35] p-4 text-white">
                <p className="text-[11px] text-white/75">
                  Estimasi Angsuran / Bulan (Asumsi bunga 6,75% p.a.)
                </p>
                <p className="mt-1 font-display text-xl font-bold text-[#D8B978]">
                  {formatCurrency(monthlyInstallment)} / bln
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Interactive Reservation Preview Modal */}
      {showReservationModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau Alur Reservasi Unit"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#102D26]/80 p-4 backdrop-blur-sm"
          onClick={() => setShowReservationModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[#E3E0D6] bg-white p-6 sm:p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge variant="gold">Alur Reservasi • Phase 3 &amp; Phase 6</Badge>
                <h3 className="mt-2 font-display text-xl font-bold text-[#173F35]">
                  Siap Mereservasi Unit {selectedUnit?.unitCode}?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReservationModal(false)}
                aria-label="Tutup modal reservasi"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E3E0D6] text-[#5F6B66] hover:bg-[#F5F4EF] hover:text-[#173F35] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 rounded-xl bg-[#F5F4EF] p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-[#5F6B66]">Proyek</span>
                <strong className="text-[#173F35]">{project.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5F6B66]">Tipe &amp; Unit</span>
                <strong className="text-[#173F35]">
                  {house.name} ({selectedUnit?.unitCode})
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5F6B66]">Harga Unit</span>
                <strong className="text-[#173F35]">{formatCurrency(activePrice)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5F6B66]">Booking Fee</span>
                <strong className="text-[#285C49]">{formatCurrency(house.bookingFee)}</strong>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-[#5F6B66]">
              Untuk menjamin keamanan dan mencegah double booking, pembuatan nomor reservasi
              serta penguncian unit memerlukan akun pelanggan terautentikasi (Supabase Auth
              &amp; PostgreSQL RPC Locking yang akan diaktifkan pada Phase 3–6).
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <Button variant="primary" size="md" to="/login" className="flex-1">
                Masuk / Daftar Pelanggan
              </Button>
              <a
                href={`https://wa.me/${APP_CONFIG.whatsapp}?text=${encodeURIComponent(`Halo PERUMAHAN, saya ingin booking unit ${selectedUnit?.unitCode ?? ''} (${house.name} - ${project.name}).`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#173F35]/20 bg-white px-4 text-sm font-medium text-[#173F35] hover:bg-[#F5F4EF]"
              >
                <MessageCircle className="h-4 w-4 text-[#285C49]" />
                Booking via Sales
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
