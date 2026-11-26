import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Eye,
  FileText,
  Landmark,
  Loader2,
  RefreshCw,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/common/Modal'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import {
  submitPaymentSchema,
  type SubmitPaymentFormValues,
} from '@/schemas/paymentSchema'
import {
  paymentService,
  type EnrichedPayment,
} from '@/services/paymentService'
import {
  reservationService,
  type EnrichedReservation,
} from '@/services/reservationService'
import { validateUploadFile } from '@/supabase/storage'
import type { PaymentAccountRecord } from '@/types/database'
import { formatCurrency } from '@/utils/format'
import { formatDateTimeID, PAYMENT_STATUS_META } from '@/utils/statusBadges'

export function CustomerPaymentsPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [searchParams] = useSearchParams()

  const [payments, setPayments] = useState<EnrichedPayment[]>([])
  const [reservations, setReservations] = useState<EnrichedReservation[]>([])
  const [accounts, setAccounts] = useState<PaymentAccountRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [proofFile, setProofFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [previewModalPayment, setPreviewModalPayment] = useState<EnrichedPayment | null>(null)
  const [signedProofUrl, setSignedProofUrl] = useState<string>('')
  const [isLoadingProof, setIsLoadingProof] = useState(false)

  const preselectedReservationId = searchParams.get('reservasi') ?? ''

  const payableReservations = useMemo(
    () =>
      reservations.filter(
        (r) => r.status === 'pending' || r.status === 'rejected',
      ),
    [reservations],
  )

  const form = useForm<SubmitPaymentFormValues>({
    resolver: zodResolver(submitPaymentSchema),
    defaultValues: {
      reservationId: preselectedReservationId,
      paymentAccountId: '',
      paymentDate: new Date().toISOString().slice(0, 10),
      senderBank: '',
      senderName: user?.fullName ?? '',
      senderAccountNumber: '',
      notes: '',
    },
  })

  const loadData = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)
    try {
      const [payList, rsvList, accList] = await Promise.all([
        paymentService.listPayments(user.id),
        reservationService.listCustomerReservations(user.id),
        paymentService.listActiveAccounts(),
      ])
      setPayments(payList)
      setReservations(rsvList)
      setAccounts(accList)

      const eligible = rsvList.filter(
        (r) => r.status === 'pending' || r.status === 'rejected',
      )
      const defaultRsv =
        eligible.find((r) => r.id === preselectedReservationId)?.id ??
        eligible[0]?.id ??
        ''
      if (defaultRsv) {
        form.setValue('reservationId', defaultRsv)
      }
      if (accList[0]?.id && !form.getValues('paymentAccountId')) {
        form.setValue('paymentAccountId', accList[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data pembayaran.')
    } finally {
      setIsLoading(false)
    }
  }, [user, preselectedReservationId, form])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const selectedReservationId = form.watch('reservationId')
  const activeReservation = useMemo(
    () => payableReservations.find((r) => r.id === selectedReservationId) ?? null,
    [payableReservations, selectedReservationId],
  )

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setFileError(null)
    if (!file) {
      setProofFile(null)
      return
    }
    const validationErr = validateUploadFile(file, 'payment-proofs')
    if (validationErr) {
      setFileError(validationErr)
      setProofFile(null)
      return
    }
    setProofFile(file)
  }

  const onSubmitProof = async (values: SubmitPaymentFormValues) => {
    if (!user) return
    if (!proofFile) {
      setFileError('Unggah foto/PDF bukti transfer bank Anda terlebih dahulu.')
      return
    }
    try {
      await paymentService.submitPaymentProof(
        {
          reservationId: values.reservationId,
          paymentAccountId: values.paymentAccountId,
          paymentDate: values.paymentDate,
          senderBank: values.senderBank,
          senderName: values.senderName,
          senderAccountNumber: values.senderAccountNumber,
          proofFile,
          notes: values.notes,
        },
        user.id,
      )

      setProofFile(null)
      form.reset({
        reservationId: '',
        paymentAccountId: accounts[0]?.id ?? '',
        paymentDate: new Date().toISOString().slice(0, 10),
        senderBank: '',
        senderName: user.fullName,
        senderAccountNumber: '',
        notes: '',
      })

      showToast({
        variant: 'success',
        title: 'Bukti Pembayaran Berhasil Diunggah',
        description:
          'Bukti transfer Anda tersimpan aman di private storage dan sedang menunggu verifikasi admin.',
      })
      await loadData()
    } catch (err) {
      showToast({
        variant: 'error',
        title: 'Gagal Mengirim Bukti Transfer',
        description: err instanceof Error ? err.message : 'Terjadi kesalahan.',
      })
    }
  }

  const openProofViewer = async (payment: EnrichedPayment) => {
    setPreviewModalPayment(payment)
    setSignedProofUrl('')
    if (!payment.proof_storage_path) return
    setIsLoadingProof(true)
    try {
      const url = await paymentService.resolveProofUrl(payment.proof_storage_path)
      setSignedProofUrl(url)
    } catch (err) {
      showToast({
        variant: 'error',
        title: 'Gagal Membuka Bukti Transfer',
        description: err instanceof Error ? err.message : 'Signed URL tidak tersedia.',
      })
    } finally {
      setIsLoadingProof(false)
    }
  }

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      showToast({ variant: 'info', title: 'Disalin ke Clipboard', description: value })
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#285C49]">
            Pembayaran Transfer Bank Manual
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-[#173F35]">
            Upload Bukti Transfer &amp; Riwayat Pembayaran
          </h1>
          <p className="mt-1 text-sm text-[#5F6B66]">
            Transfer booking fee ke rekening resmi developer lalu unggah bukti transfer Anda
            untuk diverifikasi administrator.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void loadData()}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2.5">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Proof + Official Bank Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 rounded-2xl border border-[#E3E0D6] bg-white p-6 sm:p-7 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#E3E0D6]">
            <div>
              <h2 className="font-display text-lg font-bold text-[#173F35]">
                Konfirmasi &amp; Upload Bukti Transfer
              </h2>
              <p className="text-xs text-[#5F6B66]">
                File diunggah ke private storage terenkripsi (JPG, PNG, WEBP, atau PDF maks. 5 MB).
              </p>
            </div>
            <Badge variant="emerald">Private Storage</Badge>
          </div>

          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#173F35]" />
            </div>
          ) : payableReservations.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-[#E3E0D6] bg-[#FAF9F5] p-8 text-center space-y-3">
              <CheckCircle2 className="mx-auto h-9 w-9 text-[#285C49]" />
              <p className="font-display text-base font-bold text-[#173F35]">
                Tidak ada tagihan reservasi yang menunggu transfer
              </p>
              <p className="text-xs text-[#5F6B66] max-w-md mx-auto">
                Buat reservasi unit terlebih dahulu untuk mendapatkan nomor reservasi dan
                instruksi nominal booking fee.
              </p>
              <Button variant="primary" size="sm" to="/dashboard/reservasi/baru">
                Buat Reservasi Unit Baru
              </Button>
            </div>
          ) : (
            <form
              onSubmit={form.handleSubmit(onSubmitProof)}
              noValidate
              className="mt-5 space-y-4"
            >
              <div>
                <label htmlFor="pay-rsv" className="block text-xs font-semibold text-[#173F35] mb-1.5">
                  Pilih Reservasi <span className="text-red-600">*</span>
                </label>
                <select
                  id="pay-rsv"
                  {...form.register('reservationId')}
                  className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/50 px-3.5 text-sm focus:border-[#173F35] focus:bg-white focus:outline-none"
                >
                  {payableReservations.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.reservation_number} — Unit {r.unitCode} ({formatCurrency(r.booking_fee)})
                    </option>
                  ))}
                </select>
                {form.formState.errors.reservationId && (
                  <p className="mt-1 text-xs text-red-600">
                    {form.formState.errors.reservationId.message}
                  </p>
                )}
              </div>

              {activeReservation && (
                <div className="rounded-xl bg-[#FAF7EF] border border-[#D8B978]/50 p-4 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <p className="text-[#5F6B66]">Nominal Booking Fee Wajib Transfer</p>
                    <p className="font-display text-lg font-extrabold text-[#173F35]">
                      {formatCurrency(activeReservation.booking_fee)}
                    </p>
                  </div>
                  <Badge variant="gold">
                    Unit {activeReservation.unitCode} • {activeReservation.projectName}
                  </Badge>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pay-account" className="block text-xs font-semibold text-[#173F35] mb-1.5">
                    Rekening Tujuan Developer <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="pay-account"
                    {...form.register('paymentAccountId')}
                    className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/50 px-3 text-sm focus:border-[#173F35] focus:bg-white focus:outline-none"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.bank_name} — {a.account_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="pay-date" className="block text-xs font-semibold text-[#173F35] mb-1.5">
                    Tanggal Transfer <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="pay-date"
                    type="date"
                    {...form.register('paymentDate')}
                    className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/50 px-3.5 text-sm focus:border-[#173F35] focus:bg-white focus:outline-none"
                  />
                  {form.formState.errors.paymentDate && (
                    <p className="mt-1 text-xs text-red-600">
                      {form.formState.errors.paymentDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="pay-sbank" className="block text-xs font-semibold text-[#173F35] mb-1.5">
                    Bank Pengirim <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="pay-sbank"
                    type="text"
                    placeholder="BCA / Mandiri / BRI"
                    {...form.register('senderBank')}
                    className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/50 px-3 text-sm focus:border-[#173F35] focus:bg-white focus:outline-none"
                  />
                  {form.formState.errors.senderBank && (
                    <p className="mt-1 text-xs text-red-600">
                      {form.formState.errors.senderBank.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="pay-sname" className="block text-xs font-semibold text-[#173F35] mb-1.5">
                    Nama Pengirim <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="pay-sname"
                    type="text"
                    placeholder="Sesuai rekening"
                    {...form.register('senderName')}
                    className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/50 px-3 text-sm focus:border-[#173F35] focus:bg-white focus:outline-none"
                  />
                  {form.formState.errors.senderName && (
                    <p className="mt-1 text-xs text-red-600">
                      {form.formState.errors.senderName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="pay-sacc" className="block text-xs font-semibold text-[#173F35] mb-1.5">
                    No. Rek Pengirim <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="pay-sacc"
                    type="text"
                    placeholder="1234567890"
                    {...form.register('senderAccountNumber')}
                    className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/50 px-3 text-sm font-mono focus:border-[#173F35] focus:bg-white focus:outline-none"
                  />
                  {form.formState.errors.senderAccountNumber && (
                    <p className="mt-1 text-xs text-red-600">
                      {form.formState.errors.senderAccountNumber.message}
                    </p>
                  )}
                </div>
              </div>

              {/* File Upload Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-[#173F35] mb-1.5">
                  Bukti Transfer (JPG / PNG / WEBP / PDF, maks. 5 MB) <span className="text-red-600">*</span>
                </label>
                <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#285C49]/35 bg-[#F5F4EF]/60 px-5 py-6 text-center cursor-pointer hover:border-[#173F35] hover:bg-[#F5F4EF] transition-colors">
                  <UploadCloud className="h-7 w-7 text-[#285C49]" />
                  {proofFile ? (
                    <div className="text-xs">
                      <p className="font-bold text-[#173F35]">{proofFile.name}</p>
                      <p className="text-[#5F6B66]">
                        {(proofFile.size / 1024).toFixed(0)} KB • Klik untuk mengganti berkas
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-[#5F6B66]">
                      <span className="font-semibold text-[#173F35]">Pilih file bukti transfer</span>{' '}
                      dari perangkat Anda
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
                {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
              </div>

              <div>
                <label htmlFor="pay-notes" className="block text-xs font-semibold text-[#173F35] mb-1.5">
                  Catatan Pembayaran (Opsional)
                </label>
                <textarea
                  id="pay-notes"
                  rows={2}
                  placeholder="Contoh: Transfer via m-BCA dengan berita nomor reservasi"
                  {...form.register('notes')}
                  className="w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/50 p-3 text-sm focus:border-[#173F35] focus:bg-white focus:outline-none"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={form.formState.isSubmitting}
                className="w-full"
              >
                <CreditCard className="h-4 w-4 text-[#D8B978]" />
                {form.formState.isSubmitting
                  ? 'Mengunggah Bukti & Menyimpan...'
                  : 'Kirim Bukti Pembayaran untuk Verifikasi'}
              </Button>
            </form>
          )}
        </div>

        {/* Official Developer Accounts */}
        <aside className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-[#E3E0D6] bg-white p-6 shadow-[var(--shadow-card)] space-y-4">
            <div className="flex items-center gap-2.5">
              <Landmark className="h-5 w-5 text-[#285C49]" />
              <h2 className="font-display text-base font-bold text-[#173F35]">
                Rekening Resmi Developer
              </h2>
            </div>

            <div className="space-y-3">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="rounded-xl border border-[#E3E0D6] bg-[#FAF9F5] p-4 flex items-start justify-between gap-3"
                >
                  <div className="text-xs space-y-0.5">
                    <p className="font-display font-bold text-[#173F35]">{acc.bank_name}</p>
                    <p className="font-mono text-base font-bold text-[#285C49]">
                      {acc.account_number}
                    </p>
                    <p className="text-[#5F6B66]">
                      a.n. <strong>{acc.account_holder}</strong>
                    </p>
                    {acc.instructions && (
                      <p className="pt-1 text-[11px] text-[#5F6B66]">{acc.instructions}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleCopy(acc.account_number)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Salin
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-[#173F35] p-5 text-white text-xs leading-relaxed space-y-2">
            <div className="flex items-center gap-2 font-display font-bold text-[#D8B978]">
              <ShieldCheck className="h-4 w-4" />
              Keamanan Berkas Bukti Transfer
            </div>
            <p className="text-white/80">
              Seluruh bukti transfer disimpan pada bucket privat <code>payment-proofs</code>.
              Hanya Anda dan administrator terotorisasi yang dapat membuka pratinjau melalui
              tautan sementara (Signed URL).
            </p>
          </div>
        </aside>
      </div>

      {/* Payment History */}
      <div className="rounded-2xl border border-[#E3E0D6] bg-white shadow-[var(--shadow-card)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E3E0D6] bg-[#FAF9F5]">
          <h2 className="font-display text-base font-bold text-[#173F35]">
            Riwayat Pembayaran Anda ({payments.length})
          </h2>
        </div>

        {payments.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#5F6B66]">
            Belum ada riwayat pembayaran tercatat.
          </div>
        ) : (
          <div className="divide-y divide-[#E3E0D6]/80">
            {payments.map((pay) => {
              const meta = PAYMENT_STATUS_META[pay.status]
              return (
                <div
                  key={pay.id}
                  className="p-5 sm:px-6 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="font-mono text-xs font-bold text-[#173F35]">
                        {pay.reservationNumber}
                      </code>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </div>
                    <p className="font-display text-sm font-bold text-[#173F35]">
                      Unit {pay.unitCode} — {pay.houseTypeName} ({pay.projectName})
                    </p>
                    <p className="text-xs text-[#5F6B66]">
                      {pay.sender_bank
                        ? `Dari ${pay.sender_bank} a.n. ${pay.sender_name} • Tanggal ${pay.payment_date ?? '—'}`
                        : 'Menunggu unggahan bukti transfer'}
                    </p>
                    {pay.rejection_reason && (
                      <p className="text-xs font-medium text-red-600">
                        Alasan penolakan: {pay.rejection_reason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-display text-base font-extrabold text-[#173F35]">
                        {formatCurrency(pay.amount)}
                      </p>
                      <p className="text-[11px] text-[#5F6B66]">
                        {formatDateTimeID(pay.updated_at)}
                      </p>
                    </div>
                    {pay.proof_storage_path && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void openProofViewer(pay)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Lihat Bukti
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Private Signed URL Proof Viewer Modal */}
      <Modal
        open={Boolean(previewModalPayment)}
        onClose={() => setPreviewModalPayment(null)}
        title="Pratinjau Bukti Transfer (Signed URL)"
        subtitle={previewModalPayment?.reservationNumber}
        size="lg"
      >
        {isLoadingProof ? (
          <div className="py-12 flex flex-col items-center gap-2 text-xs text-[#5F6B66]">
            <Loader2 className="h-6 w-6 animate-spin text-[#173F35]" />
            Membuat tautan Signed URL aman...
          </div>
        ) : signedProofUrl ? (
          <div className="space-y-4">
            {signedProofUrl.toLowerCase().includes('.pdf') ||
            signedProofUrl.startsWith('data:application/pdf') ? (
              <div className="rounded-xl border border-[#E3E0D6] bg-[#FAF9F5] p-6 text-center space-y-3">
                <FileText className="mx-auto h-10 w-10 text-[#173F35]" />
                <p className="text-sm font-semibold text-[#173F35]">Dokumen PDF Bukti Transfer</p>
                <a
                  href={signedProofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#173F35] px-4 py-2 text-xs font-semibold text-white"
                >
                  Buka Dokumen PDF <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            ) : (
              <img
                src={signedProofUrl}
                alt="Bukti transfer pelanggan"
                className="max-h-[60vh] w-full rounded-xl border border-[#E3E0D6] object-contain bg-[#FAF9F5]"
              />
            )}
          </div>
        ) : (
          <p className="text-sm text-[#5F6B66]">Bukti pembayaran belum tersedia.</p>
        )}
      </Modal>
    </div>
  )
}
