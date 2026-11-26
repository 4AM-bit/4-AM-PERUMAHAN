import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Home,
  Landmark,
  Layers,
  Loader2,
  Lock,
  MapPin,
  RefreshCw,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ReservationCountdown } from '@/components/common/ReservationCountdown'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import {
  reservationIdentitySchema,
  type ReservationIdentityFormValues,
} from '@/schemas/reservationSchema'
import {
  reservationService,
  type CreatedReservationResult,
  type ReservationCatalogData,
} from '@/services/reservationService'
import { formatArea, formatCompactPrice, formatCurrency } from '@/utils/format'
import { UNIT_STATUS_META } from '@/utils/statusBadges'
import { cn } from '@/utils/cn'

const STEPS = [
  { num: 1, label: 'Pilih Proyek', icon: Building2 },
  { num: 2, label: 'Pilih Tipe Rumah', icon: Layers },
  { num: 3, label: 'Pilih Unit Tersedia', icon: Home },
  { num: 4, label: 'Identitas & Kunci Unit', icon: UserCheck },
] as const

export function NewReservationPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [searchParams] = useSearchParams()

  const [catalog, setCatalog] = useState<ReservationCatalogData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [selectedHouseTypeId, setSelectedHouseTypeId] = useState<string>('')
  const [selectedUnitId, setSelectedUnitId] = useState<string>('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [createdResult, setCreatedResult] = useState<CreatedReservationResult | null>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const form = useForm<ReservationIdentityFormValues>({
    resolver: zodResolver(reservationIdentitySchema),
    defaultValues: {
      customerFullName: user?.fullName ?? '',
      customerEmail: user?.email ?? '',
      customerPhone: user?.phone ?? '',
      customerIdentityNumber: user?.nik ?? '',
      customerAddress: user?.address ?? '',
      notes: '',
      agreeTerms: false,
    },
  })

  const fetchCatalog = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const data = await reservationService.getReservationCatalog()
      setCatalog(data)

      // Pre-select from query params if present (e.g., from HouseDetailPage CTA)
      const qProject = searchParams.get('proyek')
      const qType = searchParams.get('tipe')

      if (qProject) {
        const matchedProj = data.projects.find(
          (p) => p.slug === qProject || p.id === qProject,
        )
        if (matchedProj) {
          setSelectedProjectId(matchedProj.id)
          if (qType) {
            const matchedType = data.houseTypes.find(
              (h) =>
                h.project_id === matchedProj.id &&
                (h.slug === qType || h.id === qType),
            )
            if (matchedType) {
              setSelectedHouseTypeId(matchedType.id)
              setStep(3)
            } else {
              setStep(2)
            }
          }
        }
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Gagal memuat katalog reservasi.')
    } finally {
      setIsLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    void fetchCatalog()
  }, [fetchCatalog])

  const selectedProject = useMemo(
    () => catalog?.projects.find((p) => p.id === selectedProjectId) ?? null,
    [catalog, selectedProjectId],
  )

  const projectHouseTypes = useMemo(
    () =>
      catalog?.houseTypes.filter((h) => h.project_id === selectedProjectId) ?? [],
    [catalog, selectedProjectId],
  )

  const selectedHouseType = useMemo(
    () => projectHouseTypes.find((h) => h.id === selectedHouseTypeId) ?? null,
    [projectHouseTypes, selectedHouseTypeId],
  )

  const typeUnits = useMemo(
    () =>
      catalog?.units.filter((u) => u.house_type_id === selectedHouseTypeId) ?? [],
    [catalog, selectedHouseTypeId],
  )

  const selectedUnit = useMemo(
    () => typeUnits.find((u) => u.id === selectedUnitId) ?? null,
    [typeUnits, selectedUnitId],
  )

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      showToast({
        variant: 'info',
        title: 'Disalin ke Clipboard',
        description: text,
      })
      window.setTimeout(() => setCopiedText(null), 2000)
    } catch {
      // Clipboard fallback ignored silently
    }
  }

  const onSubmitReservation = async (values: ReservationIdentityFormValues) => {
    if (!selectedUnit || !user) return
    setSubmitError(null)
    try {
      const result = await reservationService.createReservation(
        {
          unitId: selectedUnit.id,
          customerFullName: values.customerFullName,
          customerEmail: values.customerEmail,
          customerPhone: values.customerPhone,
          customerIdentityNumber: values.customerIdentityNumber,
          customerAddress: values.customerAddress,
          notes: values.notes,
        },
        user.id,
      )

      setCreatedResult(result)
      showToast({
        variant: 'success',
        title: `Reservasi ${result.reservationNumber} Berhasil!`,
        description: `Unit ${result.unitCode} telah dikunci sementara untuk akun Anda.`,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat reservasi unit.'
      setSubmitError(msg)
      showToast({
        variant: 'error',
        title: 'Reservasi Gagal',
        description: msg,
      })
      // Refresh live unit availability in case another customer just locked this unit
      void fetchCatalog()
    }
  }

  if (isLoading && !catalog) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#173F35]" />
        <p className="text-sm text-[#5F6B66]">Memuat ketersediaan proyek &amp; unit terbaru...</p>
      </div>
    )
  }

  if (loadError || !catalog) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
        <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
        <p className="font-display font-bold text-red-800">Gagal memuat data reservasi</p>
        <p className="text-xs text-red-700">{loadError}</p>
        <Button variant="outline" size="sm" onClick={() => void fetchCatalog()}>
          <RefreshCw className="h-3.5 w-3.5" />
          Coba Lagi
        </Button>
      </div>
    )
  }

  // SUCCESS RECEIPT + PAYMENT INSTRUCTIONS SCREEN
  if (createdResult) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-[#285C49]/30 bg-[#173F35] p-7 sm:p-9 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#D8B978]/20 border border-[#D8B978]/40 px-3.5 py-1 text-xs font-semibold text-[#EFE3C6]">
                <CheckCircle2 className="h-4 w-4 text-[#D8B978]" />
                Unit Terkunci Secara Atomik (Anti Double-Booking)
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
                Reservasi Berhasil Dibuat!
              </h1>
              <p className="text-sm text-white/80 max-w-2xl">
                Unit <strong>{createdResult.unitCode}</strong> ({createdResult.houseTypeName} —{' '}
                {createdResult.projectName}) telah dikunci sementara untuk akun Anda. Silakan
                selesaikan transfer booking fee sebelum batas waktu berakhir.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 border border-white/15 px-5 py-4 min-w-[230px]">
              <p className="text-[11px] uppercase tracking-wider text-white/70">
                Nomor Reservasi
              </p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <code className="font-mono text-lg font-bold text-[#D8B978]">
                  {createdResult.reservationNumber}
                </code>
                <button
                  type="button"
                  onClick={() => void handleCopy(createdResult.reservationNumber)}
                  aria-label="Salin nomor reservasi"
                  className="rounded-lg bg-white/15 p-1.5 hover:bg-white/25 cursor-pointer"
                >
                  {copiedText === createdResult.reservationNumber ? (
                    <Check className="h-4 w-4 text-[#D8B978]" />
                  ) : (
                    <Copy className="h-4 w-4 text-white" />
                  )}
                </button>
              </div>
              <div className="mt-3">
                <ReservationCountdown
                  expiresAt={createdResult.expiresAt}
                  className="bg-white text-[#173F35] border-white/20"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Payment Instructions */}
          <div className="lg:col-span-7 rounded-2xl border border-[#E3E0D6] bg-white p-6 sm:p-7 shadow-[var(--shadow-card)] space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-[#E3E0D6]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173F35]/10 text-[#173F35]">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-[#173F35]">
                  Instruksi Pembayaran Transfer Bank Manual
                </h2>
                <p className="text-xs text-[#5F6B66]">
                  Transfer tepat sesuai nominal Booking Fee ke salah satu rekening resmi di bawah ini.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-[#FAF7EF] border border-[#D8B978]/50 p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-[#5F6B66]">Nominal Booking Fee yang Harus Ditransfer</p>
                <p className="font-display text-2xl font-extrabold text-[#173F35]">
                  {formatCurrency(createdResult.bookingFee)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleCopy(String(createdResult.bookingFee))}
              >
                <Copy className="h-3.5 w-3.5" />
                Salin Nominal
              </Button>
            </div>

            <div className="space-y-3">
              {catalog.paymentAccounts.length === 0 ? (
                <p className="text-sm text-[#5F6B66]">
                  Rekening pembayaran resmi dapat dilihat pada menu Pembayaran atau hubungi tim sales kami.
                </p>
              ) : (
                catalog.paymentAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="rounded-xl border border-[#E3E0D6] bg-[#FAF9F5] p-4 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-display text-sm font-bold text-[#173F35]">
                        {acc.bank_name}
                      </p>
                      <p className="mt-0.5 font-mono text-base font-bold text-[#285C49]">
                        {acc.account_number}
                      </p>
                      <p className="text-xs text-[#5F6B66]">
                        a.n. <strong>{acc.account_holder}</strong>
                        {acc.branch ? ` • ${acc.branch}` : ''}
                      </p>
                      {acc.instructions && (
                        <p className="mt-1.5 text-[11px] text-[#5F6B66]">{acc.instructions}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void handleCopy(acc.account_number)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Salin No. Rek
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Summary & Next Steps */}
          <div className="lg:col-span-5 rounded-2xl border border-[#E3E0D6] bg-white p-6 shadow-[var(--shadow-card)] flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <h3 className="font-display text-base font-bold text-[#173F35]">
                Ringkasan Unit Terkunci
              </h3>
              <dl className="divide-y divide-[#E3E0D6]/70 text-sm">
                <div className="py-2.5 flex justify-between gap-2">
                  <dt className="text-[#5F6B66]">Proyek</dt>
                  <dd className="font-semibold text-[#173F35] text-right">
                    {createdResult.projectName}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between gap-2">
                  <dt className="text-[#5F6B66]">Tipe Rumah</dt>
                  <dd className="font-semibold text-[#173F35] text-right">
                    {createdResult.houseTypeName}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between gap-2">
                  <dt className="text-[#5F6B66]">Nomor Unit</dt>
                  <dd className="font-bold text-[#285C49]">{createdResult.unitCode}</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-2">
                  <dt className="text-[#5F6B66]">Harga Unit</dt>
                  <dd className="font-semibold text-[#173F35]">
                    {formatCurrency(createdResult.unitPrice)}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between gap-2">
                  <dt className="text-[#5F6B66]">Status</dt>
                  <dd>
                    <Badge variant="warning">Menunggu Transfer</Badge>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="space-y-2.5">
              <Button
                variant="primary"
                size="lg"
                to={`/dashboard/pembayaran?reservasi=${createdResult.reservationId}`}
                className="w-full"
              >
                <CreditCard className="h-4 w-4 text-[#D8B978]" />
                Unggah Bukti Transfer Sekarang
              </Button>
              <Button
                variant="outline"
                size="md"
                to="/dashboard/reservasi"
                className="w-full"
              >
                Lihat Daftar Reservasi Saya
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#285C49]">
            Reservasi Unit Online
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-[#173F35]">
            Buat Reservasi Unit Baru
          </h1>
          <p className="mt-1 text-sm text-[#5F6B66]">
            Ikuti 4 langkah mudah untuk memilih unit tersedia dan mengunci kavling pilihan Anda
            selama {catalog.expiryHours} jam.
          </p>
        </div>

        <Button variant="outline" size="sm" to="/dashboard/reservasi">
          <ArrowLeft className="h-4 w-4" />
          Reservasi Saya
        </Button>
      </div>

      {/* Stepper */}
      <div className="rounded-2xl border border-[#E3E0D6] bg-white p-4 sm:p-5 shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STEPS.map(({ num, label, icon: Icon }) => {
            const active = step === num
            const completed = step > num
            const clickable =
              num === 1 ||
              (num === 2 && Boolean(selectedProjectId)) ||
              (num === 3 && Boolean(selectedHouseTypeId)) ||
              (num === 4 && Boolean(selectedUnitId))

            return (
              <button
                key={num}
                type="button"
                disabled={!clickable}
                onClick={() => clickable && setStep(num)}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-3 text-left transition-all',
                  active && 'border-[#173F35] bg-[#173F35] text-white',
                  completed && 'border-[#285C49]/30 bg-[#F5F4EF] text-[#173F35] cursor-pointer',
                  !active && !completed && 'border-[#E3E0D6] bg-white text-[#5F6B66]',
                  !clickable && 'opacity-55 cursor-not-allowed',
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                    active && 'bg-[#D8B978] text-[#173F35]',
                    completed && 'bg-[#285C49] text-white',
                    !active && !completed && 'bg-[#F5F4EF] text-[#5F6B66]',
                  )}
                >
                  {completed ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <div className="min-w-0">
                  <p className={cn('text-[10px] uppercase tracking-wider', active ? 'text-[#EFE3C6]' : 'text-[#5F6B66]')}>
                    Langkah {num}
                  </p>
                  <p className="font-display text-xs font-bold truncate">{label}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* STEP 1: CHOOSE PROJECT */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-display text-lg font-bold text-[#173F35]">
            1. Pilih Kawasan Proyek Perumahan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {catalog.projects.map((proj) => {
              const availCount = catalog.units.filter(
                (u) => u.project_id === proj.id && u.status === 'available',
              ).length
              const isSelected = selectedProjectId === proj.id

              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => {
                    setSelectedProjectId(proj.id)
                    setSelectedHouseTypeId('')
                    setSelectedUnitId('')
                    setStep(2)
                  }}
                  className={cn(
                    'group text-left overflow-hidden rounded-2xl border bg-white shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col',
                    isSelected ? 'border-[#173F35] ring-2 ring-[#173F35]/20' : 'border-[#E3E0D6]',
                  )}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#ECEAE1]">
                    <img
                      src={proj.cover_image_url || '/images/project-cluster-1.jpg'}
                      alt={proj.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute right-3 top-3 rounded-full bg-[#173F35]/90 px-3 py-1 text-xs font-semibold text-white">
                      {availCount} Unit Tersedia
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <p className="inline-flex items-center gap-1 text-xs text-[#285C49] font-medium">
                      <MapPin className="h-3.5 w-3.5" />
                      {proj.location}
                    </p>
                    <h3 className="mt-1.5 font-display text-lg font-bold text-[#173F35]">
                      {proj.name}
                    </h3>
                    <p className="mt-2 text-xs text-[#5F6B66] line-clamp-2">{proj.description}</p>
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#E3E0D6]/80">
                      <span className="font-display text-sm font-bold text-[#173F35]">
                        Mulai {formatCompactPrice(proj.starting_price)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#285C49]">
                        Pilih <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* STEP 2: CHOOSE HOUSE TYPE */}
      {step === 2 && selectedProject && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-[#173F35]">
                2. Pilih Tipe Rumah di {selectedProject.name}
              </h2>
              <p className="text-xs text-[#5F6B66]">{selectedProject.location}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setStep(1)}>
              <ArrowLeft className="h-3.5 w-3.5" />
              Ganti Proyek
            </Button>
          </div>

          {projectHouseTypes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E3E0D6] bg-white p-10 text-center text-sm text-[#5F6B66]">
              Belum ada tipe rumah terdaftar untuk proyek ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projectHouseTypes.map((ht) => {
                const availCount = catalog.units.filter(
                  (u) => u.house_type_id === ht.id && u.status === 'available',
                ).length
                return (
                  <button
                    key={ht.id}
                    type="button"
                    onClick={() => {
                      setSelectedHouseTypeId(ht.id)
                      setSelectedUnitId('')
                      setStep(3)
                    }}
                    className="group text-left overflow-hidden rounded-2xl border border-[#E3E0D6] bg-white shadow-[var(--shadow-card)] transition-all hover:border-[#173F35] hover:-translate-y-0.5 cursor-pointer flex flex-col sm:flex-row"
                  >
                    <div className="sm:w-44 shrink-0 bg-[#ECEAE1] overflow-hidden">
                      <img
                        src={ht.cover_image_url || '/images/house-type-compact.jpg'}
                        alt={ht.name}
                        className="h-44 sm:h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-[#285C49]">
                            {ht.category}
                          </span>
                          <Badge variant={availCount > 0 ? 'emerald' : 'muted'}>
                            {availCount} Tersedia
                          </Badge>
                        </div>
                        <h3 className="mt-1 font-display text-lg font-bold text-[#173F35]">
                          {ht.name}
                        </h3>
                        <p className="mt-1 text-xs text-[#5F6B66]">
                          LT {formatArea(ht.land_area)} • LB {formatArea(ht.building_area)} •{' '}
                          {ht.bedrooms} KT • {ht.bathrooms} KM
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#E3E0D6]/80 flex items-end justify-between gap-2">
                        <div>
                          <p className="font-display text-base font-bold text-[#173F35]">
                            {formatCurrency(ht.price)}
                          </p>
                          <p className="text-[11px] text-[#285C49]">
                            Booking Fee: {formatCurrency(ht.booking_fee)}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#173F35]">
                          Pilih Unit <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* STEP 3: CHOOSE AVAILABLE UNIT */}
      {step === 3 && selectedProject && selectedHouseType && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-[#173F35]">
                3. Pilih Nomor Unit Tersedia — {selectedHouseType.name}
              </h2>
              <p className="text-xs text-[#5F6B66]">
                {selectedProject.name} • Klik unit berstatus Tersedia untuk melanjutkan ke formulir
                identitas.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => void fetchCatalog()}>
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh Status
              </Button>
              <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                <ArrowLeft className="h-3.5 w-3.5" />
                Ganti Tipe
              </Button>
            </div>
          </div>

          {typeUnits.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E3E0D6] bg-white p-10 text-center text-sm text-[#5F6B66]">
              Belum ada kavling unit untuk tipe ini. Silakan pilih tipe rumah lainnya.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {typeUnits.map((unit) => {
                const isAvailable = unit.status === 'available'
                const meta = UNIT_STATUS_META[unit.status]
                const isSelected = selectedUnitId === unit.id

                return (
                  <button
                    key={unit.id}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      setSelectedUnitId(unit.id)
                      setStep(4)
                    }}
                    className={cn(
                      'rounded-2xl border p-5 text-left transition-all',
                      isAvailable
                        ? 'bg-white hover:border-[#173F35] hover:shadow-md cursor-pointer'
                        : 'bg-[#F5F4EF] opacity-60 cursor-not-allowed',
                      isSelected && isAvailable
                        ? 'border-[#173F35] ring-2 ring-[#173F35]/20'
                        : 'border-[#E3E0D6]',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-xl font-extrabold text-[#173F35]">
                        {unit.unit_code}
                      </span>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-[#5F6B66]">
                      {unit.block} • Hadap {unit.facing || 'Utara'}
                    </p>
                    <p className="mt-2 text-xs text-[#242B28]">
                      LT {formatArea(unit.land_area)} / LB {formatArea(unit.building_area)}
                    </p>
                    <div className="mt-4 pt-3 border-t border-[#E3E0D6]/80 flex items-center justify-between">
                      <span className="font-display text-sm font-bold text-[#173F35]">
                        {formatCurrency(unit.price)}
                      </span>
                      {isAvailable && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#285C49]">
                          Pilih <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* STEP 4: IDENTITY FORM & ATOMIC UNIT LOCK */}
      {step === 4 && selectedProject && selectedHouseType && selectedUnit && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 rounded-2xl border border-[#E3E0D6] bg-white p-6 sm:p-7 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#E3E0D6]">
              <div>
                <h2 className="font-display text-lg font-bold text-[#173F35]">
                  4. Formulir Identitas Pemesan
                </h2>
                <p className="text-xs text-[#5F6B66]">
                  Pastikan data sesuai KTP untuk penerbitan Surat Pemesanan Rumah (SPR).
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setStep(3)}>
                <ArrowLeft className="h-3.5 w-3.5" />
                Ganti Unit
              </Button>
            </div>

            {submitError && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            <form
              onSubmit={form.handleSubmit(onSubmitReservation)}
              noValidate
              className="mt-5 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rsv-name" className="block text-xs font-semibold text-[#173F35] mb-1.5">
                    Nama Lengkap (Sesuai KTP) <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="rsv-name"
                    type="text"
                    {...form.register('customerFullName')}
                    className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/50 px-3.5 text-sm focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15"
                  />
                  {form.formState.errors.customerFullName && (
                    <p className="mt-1 text-xs text-red-600">
                      {form.formState.errors.customerFullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="rsv-nik" className="block text-xs font-semibold text-[#173F35] mb-1.5">
                    NIK (16 Digit KTP) <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="rsv-nik"
                    type="text"
                    maxLength={16}
                    placeholder="367401XXXXXXXXXX"
                    {...form.register('customerIdentityNumber')}
                    className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/50 px-3.5 text-sm font-mono focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15"
                  />
                  {form.formState.errors.customerIdentityNumber && (
                    <p className="mt-1 text-xs text-red-600">
                      {form.formState.errors.customerIdentityNumber.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rsv-email" className="block text-xs font-semibold text-[#173F35] mb-1.5">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="rsv-email"
                    type="email"
                    {...form.register('customerEmail')}
                    className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/50 px-3.5 text-sm focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15"
                  />
                  {form.formState.errors.customerEmail && (
                    <p className="mt-1 text-xs text-red-600">
                      {form.formState.errors.customerEmail.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="rsv-phone" className="block text-xs font-semibold text-[#173F35] mb-1.5">
                    Nomor WhatsApp <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="rsv-phone"
                    type="tel"
                    placeholder="081234567890"
                    {...form.register('customerPhone')}
                    className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/50 px-3.5 text-sm focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15"
                  />
                  {form.formState.errors.customerPhone && (
                    <p className="mt-1 text-xs text-red-600">
                      {form.formState.errors.customerPhone.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="rsv-address" className="block text-xs font-semibold text-[#173F35] mb-1.5">
                  Alamat Lengkap Domisili <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="rsv-address"
                  rows={2}
                  {...form.register('customerAddress')}
                  className="w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/50 p-3 text-sm focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15"
                />
                {form.formState.errors.customerAddress && (
                  <p className="mt-1 text-xs text-red-600">
                    {form.formState.errors.customerAddress.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="rsv-notes" className="block text-xs font-semibold text-[#173F35] mb-1.5">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  id="rsv-notes"
                  rows={2}
                  placeholder="Contoh: Rencana skema pembayaran KPR 15 tahun / Tunai Bertahap"
                  {...form.register('notes')}
                  className="w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/50 p-3 text-sm focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15"
                />
              </div>

              <div>
                <label className="flex items-start gap-2.5 text-xs text-[#5F6B66] cursor-pointer">
                  <input
                    type="checkbox"
                    {...form.register('agreeTerms')}
                    className="mt-0.5 h-4 w-4 rounded border-[#E3E0D6] accent-[#173F35]"
                  />
                  <span>
                    Saya memahami unit akan terkunci sementara selama{' '}
                    <strong className="text-[#173F35]">{catalog.expiryHours} jam</strong>. Apabila
                    bukti transfer booking fee belum diunggah sebelum batas waktu, reservasi akan
                    kedaluwarsa secara otomatis.
                  </span>
                </label>
                {form.formState.errors.agreeTerms && (
                  <p className="mt-1 text-xs text-red-600">
                    {form.formState.errors.agreeTerms.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={form.formState.isSubmitting}
                className="w-full"
              >
                <Lock className="h-4 w-4 text-[#D8B978]" />
                {form.formState.isSubmitting
                  ? 'Mengunci Unit & Membuat Reservasi...'
                  : `Konfirmasi & Kunci Unit ${selectedUnit.unit_code}`}
              </Button>
            </form>
          </div>

          {/* Sticky Summary Card */}
          <aside className="lg:col-span-5 rounded-2xl border border-[#E3E0D6] bg-white p-6 shadow-[var(--shadow-card)] space-y-5">
            <div>
              <Badge variant="emerald">Ringkasan Unit Pilihan</Badge>
              <h3 className="mt-2 font-display text-xl font-bold text-[#173F35]">
                Unit {selectedUnit.unit_code}
              </h3>
              <p className="text-xs text-[#5F6B66]">
                {selectedHouseType.name} • {selectedProject.name}
              </p>
            </div>

            <dl className="divide-y divide-[#E3E0D6]/80 text-sm">
              <div className="py-2.5 flex justify-between">
                <dt className="text-[#5F6B66]">Blok &amp; Arah Hadap</dt>
                <dd className="font-semibold text-[#173F35]">
                  {selectedUnit.block} • {selectedUnit.facing}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-[#5F6B66]">Dimensi</dt>
                <dd className="font-semibold text-[#173F35]">
                  LT {selectedUnit.land_area} m² / LB {selectedUnit.building_area} m²
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-[#5F6B66]">Harga Unit</dt>
                <dd className="font-bold text-[#173F35]">
                  {formatCurrency(selectedUnit.price)}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-[#5F6B66]">Booking Fee (Tanda Jadi)</dt>
                <dd className="font-extrabold text-[#285C49]">
                  {formatCurrency(selectedHouseType.booking_fee)}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-[#5F6B66]">Masa Penguncian Unit</dt>
                <dd className="inline-flex items-center gap-1 font-semibold text-[#173F35]">
                  <Clock className="h-3.5 w-3.5 text-[#285C49]" />
                  {catalog.expiryHours} Jam
                </dd>
              </div>
            </dl>

            <div className="rounded-xl bg-[#173F35] p-4 text-xs text-white/85 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-[#D8B978] shrink-0 mt-0.5" />
              <span>
                Reservasi diproses melalui transaksi PostgreSQL terkunci (row-level locking)
                sehingga aman dari pemesanan ganda secara bersamaan.
              </span>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
