import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  FileText,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { DataTable } from '@/components/tables/DataTable'
import { Modal } from '@/components/common/Modal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import {
  verifyPaymentDecisionSchema,
  type VerifyPaymentDecisionValues,
} from '@/schemas/paymentSchema'
import {
  paymentService,
  type EnrichedPayment,
} from '@/services/paymentService'
import { formatCurrency } from '@/utils/format'
import { formatDateTimeID, PAYMENT_STATUS_META } from '@/utils/statusBadges'

export function AdminPaymentVerificationPage() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [rows, setRows] = useState<EnrichedPayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  const [reviewPayment, setReviewPayment] = useState<EnrichedPayment | null>(null)
  const [signedUrl, setSignedUrl] = useState('')
  const [isLoadingProof, setIsLoadingProof] = useState(false)

  const form = useForm<VerifyPaymentDecisionValues>({
    resolver: zodResolver(verifyPaymentDecisionSchema),
    defaultValues: {
      decision: 'verified',
      rejectionReason: '',
      notes: '',
    },
  })

  const loadPayments = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const list = await paymentService.listPayments()
      setRows(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat daftar pembayaran.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPayments()
  }, [loadPayments])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((row) => {
      const matchSearch =
        !q ||
        row.reservationNumber.toLowerCase().includes(q) ||
        row.customerName.toLowerCase().includes(q) ||
        row.unitCode.toLowerCase().includes(q) ||
        row.sender_name.toLowerCase().includes(q) ||
        row.sender_bank.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' || row.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [rows, search, statusFilter])

  const pageSize = 8
  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page],
  )

  const pendingCount = useMemo(
    () => rows.filter((r) => r.status === 'pending_verification').length,
    [rows],
  )

  const openVerificationModal = async (payment: EnrichedPayment) => {
    setReviewPayment(payment)
    setSignedUrl('')
    form.reset({
      decision: 'verified',
      rejectionReason: payment.rejection_reason ?? '',
      notes: payment.notes ?? '',
    })

    if (payment.proof_storage_path) {
      setIsLoadingProof(true)
      try {
        const url = await paymentService.resolveProofUrl(payment.proof_storage_path)
        setSignedUrl(url)
      } catch {
        setSignedUrl('')
      } finally {
        setIsLoadingProof(false)
      }
    }
  }

  const onSubmitDecision = async (values: VerifyPaymentDecisionValues) => {
    if (!reviewPayment || !user) return
    try {
      await paymentService.verifyPayment(
        reviewPayment.id,
        values.decision,
        values.rejectionReason ?? '',
        values.notes ?? '',
        { id: user.id, role: user.role },
      )

      showToast({
        variant: values.decision === 'verified' ? 'success' : 'info',
        title:
          values.decision === 'verified'
            ? 'Pembayaran Disetujui & Terverifikasi'
            : 'Pembayaran Ditolak',
        description:
          values.decision === 'verified'
            ? `Reservasi ${reviewPayment.reservationNumber} kini berstatus Terkonfirmasi.`
            : `Reservasi ${reviewPayment.reservationNumber} ditolak dan unit dibuka kembali.`,
      })

      setReviewPayment(null)
      await loadPayments()
    } catch (err) {
      showToast({
        variant: 'error',
        title: 'Gagal Memproses Verifikasi',
        description: err instanceof Error ? err.message : 'Terjadi kesalahan.',
      })
    }
  }

  const decisionValue = form.watch('decision')

  return (
    <div className="space-y-5">
      <DataTable<EnrichedPayment>
        title="Verifikasi Pembayaran Manual"
        subtitle="Periksa bukti transfer bank pelanggan melalui Signed URL terotorisasi lalu setujui atau tolak dengan alasan."
        rows={paginated}
        totalCount={filtered.length}
        isLoading={isLoading}
        error={error}
        search={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        searchPlaceholder="Cari nomor reservasi, pelanggan, unit, bank, atau pengirim..."
        filters={[
          {
            key: 'status',
            label: 'Status Pembayaran',
            value: statusFilter,
            options: [
              { label: 'Semua Status', value: 'all' },
              { label: 'Menunggu Verifikasi', value: 'pending_verification' },
              { label: 'Terverifikasi', value: 'verified' },
              { label: 'Belum Dibayar', value: 'unpaid' },
              { label: 'Ditolak', value: 'rejected' },
            ],
            onChange: (val) => {
              setStatusFilter(val)
              setPage(1)
            },
          },
        ]}
        hasActiveFilters={search.trim() !== '' || statusFilter !== 'all'}
        onResetFilters={() => {
          setSearch('')
          setStatusFilter('all')
        }}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onRetry={() => void loadPayments()}
        headerExtra={
          <div className="flex items-center gap-2.5">
            {pendingCount > 0 && (
              <Badge variant="gold">
                {pendingCount} Menunggu Verifikasi
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={() => void loadPayments()}>
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        }
        columns={[
          {
            key: 'reservation',
            header: 'Reservasi & Unit',
            render: (row) => (
              <div>
                <p className="font-mono text-xs font-bold text-[#173F35]">
                  {row.reservationNumber}
                </p>
                <p className="text-xs text-[#5F6B66]">
                  Unit {row.unitCode} • {row.projectName}
                </p>
              </div>
            ),
          },
          {
            key: 'customer',
            header: 'Pelanggan & Pengirim',
            render: (row) => (
              <div>
                <p className="font-semibold text-[#173F35]">{row.customerName}</p>
                <p className="text-xs text-[#5F6B66]">
                  {row.sender_bank
                    ? `${row.sender_bank} a.n. ${row.sender_name}`
                    : 'Belum unggah bukti'}
                </p>
              </div>
            ),
          },
          {
            key: 'amount',
            header: 'Nominal & Rekening Tujuan',
            render: (row) => (
              <div>
                <p className="font-bold text-[#173F35]">{formatCurrency(row.amount)}</p>
                <p className="text-[11px] text-[#5F6B66]">{row.targetBankName}</p>
              </div>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (row) => {
              const meta = PAYMENT_STATUS_META[row.status]
              return <Badge variant={meta.variant}>{meta.label}</Badge>
            },
          },
        ]}
        extraActions={(row) => (
          <Button
            variant={row.status === 'pending_verification' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => void openVerificationModal(row)}
          >
            <FileCheck2 className="h-3.5 w-3.5" />
            {row.status === 'pending_verification' ? 'Periksa & Verifikasi' : 'Detail'}
          </Button>
        )}
      />

      {/* Admin Verification Modal */}
      <Modal
        open={Boolean(reviewPayment)}
        onClose={() => setReviewPayment(null)}
        title="Pemeriksaan & Verifikasi Bukti Pembayaran"
        subtitle={
          reviewPayment
            ? `${reviewPayment.reservationNumber} • ${reviewPayment.customerName}`
            : undefined
        }
        size="xl"
      >
        {reviewPayment && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Proof Preview via Signed URL */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-[#285C49]">
                  Bukti Transfer (Private Signed URL)
                </p>
                <Badge variant={PAYMENT_STATUS_META[reviewPayment.status].variant}>
                  {PAYMENT_STATUS_META[reviewPayment.status].label}
                </Badge>
              </div>

              <div className="rounded-2xl border border-[#E3E0D6] bg-[#FAF9F5] p-4 min-h-[280px] flex items-center justify-center">
                {isLoadingProof ? (
                  <div className="flex flex-col items-center gap-2 text-xs text-[#5F6B66]">
                    <Loader2 className="h-6 w-6 animate-spin text-[#173F35]" />
                    Memuat bukti transfer...
                  </div>
                ) : !reviewPayment.proof_storage_path ? (
                  <p className="text-xs text-[#5F6B66]">
                    Pelanggan belum mengunggah bukti pembayaran.
                  </p>
                ) : signedUrl ? (
                  signedUrl.toLowerCase().includes('.pdf') ||
                  signedUrl.startsWith('data:application/pdf') ? (
                    <div className="text-center space-y-3">
                      <FileText className="mx-auto h-10 w-10 text-[#173F35]" />
                      <a
                        href={signedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#173F35] px-4 py-2 text-xs font-semibold text-white"
                      >
                        Buka PDF Bukti Transfer <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ) : (
                    <img
                      src={signedUrl}
                      alt="Bukti transfer pelanggan"
                      className="max-h-[380px] w-full rounded-xl object-contain"
                    />
                  )
                ) : (
                  <p className="text-xs text-red-600">
                    Gagal membuat Signed URL untuk bukti transfer.
                  </p>
                )}
              </div>

              <dl className="divide-y divide-[#E3E0D6]/80 rounded-xl border border-[#E3E0D6] text-xs">
                <div className="flex justify-between px-3.5 py-2.5">
                  <dt className="text-[#5F6B66]">Unit &amp; Proyek</dt>
                  <dd className="font-semibold text-[#173F35]">
                    {reviewPayment.unitCode} ({reviewPayment.projectName})
                  </dd>
                </div>
                <div className="flex justify-between px-3.5 py-2.5">
                  <dt className="text-[#5F6B66]">Nominal Transfer</dt>
                  <dd className="font-extrabold text-[#285C49]">
                    {formatCurrency(reviewPayment.amount)}
                  </dd>
                </div>
                <div className="flex justify-between px-3.5 py-2.5">
                  <dt className="text-[#5F6B66]">Pengirim</dt>
                  <dd className="font-semibold text-[#173F35]">
                    {reviewPayment.sender_name || '—'} ({reviewPayment.sender_bank || '—'})
                  </dd>
                </div>
                <div className="flex justify-between px-3.5 py-2.5">
                  <dt className="text-[#5F6B66]">Rekening Tujuan</dt>
                  <dd className="font-semibold text-[#173F35]">
                    {reviewPayment.targetBankName} ({reviewPayment.targetAccountNumber})
                  </dd>
                </div>
                <div className="flex justify-between px-3.5 py-2.5">
                  <dt className="text-[#5F6B66]">Tanggal Transfer</dt>
                  <dd className="text-[#242B28]">{reviewPayment.payment_date || '—'}</dd>
                </div>
                <div className="flex justify-between px-3.5 py-2.5">
                  <dt className="text-[#5F6B66]">Diverifikasi Pada</dt>
                  <dd className="text-[#242B28]">{formatDateTimeID(reviewPayment.verified_at)}</dd>
                </div>
              </dl>
            </div>

            {/* Right: Admin Decision Form */}
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-xl bg-[#173F35] p-4 text-white text-xs leading-relaxed flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-[#D8B978] shrink-0 mt-0.5" />
                <span>
                  Keputusan verifikasi dieksekusi melalui RPC PostgreSQL atomik: menyetujui
                  akan mengonfirmasi reservasi, sedangkan menolak akan melepaskan unit kembali
                  menjadi tersedia dan mengirim notifikasi ke pelanggan.
                </span>
              </div>

              {reviewPayment.status === 'verified' ? (
                <div className="rounded-2xl border border-[#285C49]/25 bg-[#F5F4EF] p-5 space-y-2 text-sm">
                  <p className="font-display font-bold text-[#173F35] flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#285C49]" />
                    Pembayaran Sudah Terverifikasi
                  </p>
                  <p className="text-xs text-[#5F6B66]">
                    Transaksi yang sudah terverifikasi dikunci oleh kebijakan integritas database
                    dan tidak dapat dihapus atau dibatalkan sembarangan.
                  </p>
                  {reviewPayment.notes && (
                    <p className="pt-2 text-xs text-[#242B28]">
                      <strong>Catatan:</strong> {reviewPayment.notes}
                    </p>
                  )}
                </div>
              ) : (
                <form
                  onSubmit={form.handleSubmit(onSubmitDecision)}
                  noValidate
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-[#173F35] mb-2">
                      Keputusan Verifikasi
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center gap-2.5 rounded-xl border border-[#E3E0D6] p-3.5 cursor-pointer has-[:checked]:border-[#285C49] has-[:checked]:bg-[#285C49]/8">
                        <input
                          type="radio"
                          value="verified"
                          {...form.register('decision')}
                          className="accent-[#173F35]"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-[#173F35] flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#285C49]" />
                            Setujui
                          </p>
                          <p className="text-[11px] text-[#5F6B66]">Konfirmasi reservasi</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 rounded-xl border border-[#E3E0D6] p-3.5 cursor-pointer has-[:checked]:border-red-500 has-[:checked]:bg-red-50">
                        <input
                          type="radio"
                          value="rejected"
                          {...form.register('decision')}
                          className="accent-red-600"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-red-700 flex items-center gap-1">
                            <XCircle className="h-3.5 w-3.5" />
                            Tolak
                          </p>
                          <p className="text-[11px] text-[#5F6B66]">Wajib sertakan alasan</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {decisionValue === 'rejected' && (
                    <div>
                      <label
                        htmlFor="ver-reason"
                        className="block text-xs font-semibold text-red-700 mb-1.5"
                      >
                        Alasan Penolakan <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        id="ver-reason"
                        rows={3}
                        placeholder="Contoh: Nominal transfer tidak sesuai booking fee atau mutasi tidak ditemukan di rekening tujuan."
                        {...form.register('rejectionReason')}
                        className="w-full rounded-xl border border-red-300 bg-red-50/30 p-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none"
                      />
                      {form.formState.errors.rejectionReason && (
                        <p className="mt-1 text-xs text-red-600">
                          {form.formState.errors.rejectionReason.message}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="ver-notes"
                      className="block text-xs font-semibold text-[#173F35] mb-1.5"
                    >
                      Catatan Verifikasi Finance (Opsional)
                    </label>
                    <textarea
                      id="ver-notes"
                      rows={2}
                      placeholder="Contoh: Mutasi BCA tanggal 27/11/2026 cocok."
                      {...form.register('notes')}
                      className="w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/50 p-3 text-sm focus:border-[#173F35] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReviewPayment(null)}
                      disabled={form.formState.isSubmitting}
                    >
                      Tutup
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={form.formState.isSubmitting}
                      className={
                        decisionValue === 'rejected'
                          ? 'bg-red-600 hover:bg-red-700'
                          : undefined
                      }
                    >
                      {form.formState.isSubmitting
                        ? 'Menyimpan Keputusan...'
                        : decisionValue === 'verified'
                          ? 'Setujui & Konfirmasi Reservasi'
                          : 'Tolak Pembayaran'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
