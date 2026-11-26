import { useEffect, useState } from 'react'
import { CrudPageShell } from '@/components/tables/CrudPageShell'
import { Badge } from '@/components/ui/Badge'
import { crudService } from '@/services/crudStore'
import type {
  PaymentAccountRecord,
  PaymentRecord,
  ReservationRecord,
} from '@/types/database'
import { formatCurrency } from '@/utils/format'
import { formatDateTimeID, PAYMENT_STATUS_META } from '@/utils/statusBadges'

export function AdminPaymentsPage() {
  const [reservations, setReservations] = useState<ReservationRecord[]>([])
  const [accounts, setAccounts] = useState<PaymentAccountRecord[]>([])

  useEffect(() => {
    void Promise.all([
      crudService.list<ReservationRecord>('reservations'),
      crudService.list<PaymentAccountRecord>('payment_accounts'),
    ])
      .then(([r, a]) => {
        setReservations(r)
        setAccounts(a)
      })
      .catch(() => {})
  }, [])

  const rsvMap = Object.fromEntries(reservations.map((r) => [r.id, r]))
  const accMap = Object.fromEntries(accounts.map((a) => [a.id, `${a.bank_name} (${a.account_number})`]))

  return (
    <CrudPageShell<PaymentRecord>
      entityKey="payments"
      title="Manajemen & Verifikasi Pembayaran"
      subtitle="Kelola pembayaran manual transfer bank, tinjau bukti transfer, dan perbarui status verifikasi."
      singularName="Pembayaran"
      searchPlaceholder="Cari nomor reservasi, nama pengirim, atau bank..."
      searchFields={(row) => [
        rsvMap[row.reservation_id]?.reservation_number ?? '',
        rsvMap[row.reservation_id]?.customer_name ?? '',
        row.sender_name,
        row.sender_bank,
      ]}
      getSummaryLabel={(row) =>
        `Pembayaran ${rsvMap[row.reservation_id ?? '']?.reservation_number ?? row.sender_name ?? ''}`
      }
      canDelete={(row) => row.status !== 'verified'}
      filters={[
        {
          key: 'status',
          label: 'Status Pembayaran',
          options: [
            { label: 'Semua Status', value: 'all' },
            { label: 'Menunggu Verifikasi', value: 'pending_verification' },
            { label: 'Terverifikasi', value: 'verified' },
            { label: 'Belum Dibayar', value: 'unpaid' },
            { label: 'Ditolak', value: 'rejected' },
          ],
          predicate: (row, val) => row.status === val,
        },
      ]}
      columns={[
        {
          key: 'reservation',
          header: 'Reservasi',
          render: (row) => {
            const rsv = rsvMap[row.reservation_id]
            return (
              <div>
                <p className="font-mono text-xs font-bold text-[#173F35]">
                  {rsv?.reservation_number ?? row.reservation_id}
                </p>
                <p className="text-xs text-[#5F6B66]">{rsv?.customer_name ?? '—'}</p>
              </div>
            )
          },
        },
        {
          key: 'sender',
          header: 'Pengirim & Bank',
          render: (row) => (
            <div>
              <p className="font-medium text-[#173F35]">{row.sender_name || 'Belum diunggah'}</p>
              <p className="text-xs text-[#5F6B66]">
                {row.sender_bank ? `${row.sender_bank} • ${row.payment_date ?? '—'}` : 'Menunggu transfer'}
              </p>
            </div>
          ),
        },
        {
          key: 'amount',
          header: 'Nominal',
          render: (row) => (
            <span className="font-semibold text-[#173F35]">{formatCurrency(row.amount)}</span>
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
      fields={[
        {
          name: 'reservation_id',
          label: 'Reservasi Terkait',
          type: 'select',
          required: true,
          readOnlyOnEdit: true,
          options: reservations.map((r) => ({
            label: `${r.reservation_number} — ${r.customer_name}`,
            value: r.id,
          })),
        },
        {
          name: 'payment_account_id',
          label: 'Rekening Tujuan Developer',
          type: 'select',
          options: [
            { label: '— Belum dipilih —', value: '' },
            ...accounts.map((a) => ({
              label: `${a.bank_name} (${a.account_number})`,
              value: a.id,
            })),
          ],
        },
        { name: 'amount', label: 'Nominal Pembayaran (Rp)', type: 'number', required: true, min: 0 },
        { name: 'payment_date', label: 'Tanggal Transfer', type: 'date' },
        { name: 'sender_bank', label: 'Bank Pengirim', type: 'text', placeholder: 'BCA / Mandiri' },
        { name: 'sender_name', label: 'Nama Rekening Pengirim', type: 'text' },
        {
          name: 'status',
          label: 'Status Verifikasi',
          type: 'select',
          required: true,
          defaultValue: 'pending_verification',
          options: [
            { label: 'Unpaid (Belum Dibayar)', value: 'unpaid' },
            { label: 'Pending Verification', value: 'pending_verification' },
            { label: 'Verified (Disetujui)', value: 'verified' },
            { label: 'Rejected (Ditolak)', value: 'rejected' },
          ],
        },
        { name: 'proof_storage_path', label: 'Path / URL Bukti Transfer', type: 'text' },
        { name: 'rejection_reason', label: 'Alasan Penolakan (jika ditolak)', type: 'textarea', colSpan: 2 },
        { name: 'notes', label: 'Catatan Verifikasi', type: 'textarea', colSpan: 2 },
      ]}
      fromFormValues={(values, editing) => {
        const rsv = rsvMap[String(values.reservation_id)]
        return {
          reservation_id: String(values.reservation_id),
          customer_id: editing?.customer_id ?? rsv?.customer_id ?? 'demo-customer-001',
          payment_account_id: String(values.payment_account_id || '') || null,
          amount: Number(values.amount || 0),
          payment_date: String(values.payment_date || '') || null,
          sender_bank: String(values.sender_bank || '').trim(),
          sender_name: String(values.sender_name || '').trim(),
          proof_storage_path: String(values.proof_storage_path || '').trim(),
          status: String(values.status) as PaymentRecord['status'],
          verified_by:
            String(values.status) === 'verified' || String(values.status) === 'rejected'
              ? editing?.verified_by ?? 'demo-admin-001'
              : null,
          verified_at:
            String(values.status) === 'verified' || String(values.status) === 'rejected'
              ? new Date().toISOString()
              : null,
          rejection_reason: String(values.rejection_reason || '').trim(),
          notes: String(values.notes || '').trim(),
        }
      }}
      detailFields={[
        { label: 'No. Reservasi', render: (r) => <code>{rsvMap[r.reservation_id]?.reservation_number ?? r.reservation_id}</code> },
        { label: 'Status Pembayaran', render: (r) => <Badge variant={PAYMENT_STATUS_META[r.status].variant}>{PAYMENT_STATUS_META[r.status].label}</Badge> },
        { label: 'Nominal', render: (r) => <strong>{formatCurrency(r.amount)}</strong> },
        { label: 'Rekening Tujuan', render: (r) => (r.payment_account_id ? accMap[r.payment_account_id] ?? r.payment_account_id : '—') },
        { label: 'Pengirim', render: (r) => `${r.sender_name || '—'} (${r.sender_bank || '—'})` },
        { label: 'Tanggal Transfer', render: (r) => r.payment_date || '—' },
        {
          label: 'Pratinjau Bukti Transfer',
          render: (r) =>
            r.proof_storage_path ? (
              <img
                src={r.proof_storage_path}
                alt="Bukti transfer"
                className="max-h-56 rounded-xl border border-[#E3E0D6] object-contain"
              />
            ) : (
              <span className="text-xs text-[#5F6B66]">Belum ada bukti diunggah</span>
            ),
        },
        { label: 'Alasan Penolakan', render: (r) => r.rejection_reason || '—' },
        { label: 'Catatan', render: (r) => r.notes || '—' },
        { label: 'Diverifikasi Pada', render: (r) => formatDateTimeID(r.verified_at) },
      ]}
    />
  )
}
