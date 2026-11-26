import { CrudPageShell } from '@/components/tables/CrudPageShell'
import { Badge } from '@/components/ui/Badge'
import type { PaymentAccountRecord } from '@/types/database'
import { formatDateTimeID } from '@/utils/statusBadges'

export function AdminPaymentAccountsPage() {
  return (
    <CrudPageShell<PaymentAccountRecord>
      entityKey="payment_accounts"
      title="Manajemen Rekening Developer"
      subtitle="Kelola rekening bank resmi yang ditampilkan pada instruksi transfer manual pelanggan."
      singularName="Rekening"
      searchPlaceholder="Cari nama bank, nomor rekening, atau atas nama..."
      searchFields={(row) => [row.bank_name, row.account_number, row.account_holder, row.branch]}
      getSummaryLabel={(row) => `${row.bank_name ?? 'Rekening'} (${row.account_number ?? ''})`}
      filters={[
        {
          key: 'active',
          label: 'Status',
          options: [
            { label: 'Semua Status', value: 'all' },
            { label: 'Aktif', value: 'active' },
            { label: 'Nonaktif', value: 'inactive' },
          ],
          predicate: (row, val) => (val === 'active' ? row.is_active : !row.is_active),
        },
      ]}
      columns={[
        {
          key: 'bank',
          header: 'Bank & Cabang',
          render: (row) => (
            <div>
              <p className="font-display font-bold text-[#173F35]">{row.bank_name}</p>
              <p className="text-xs text-[#5F6B66]">{row.branch || 'Kantor Pusat'}</p>
            </div>
          ),
        },
        {
          key: 'number',
          header: 'No. Rekening',
          render: (row) => (
            <span className="font-mono font-bold text-[#173F35]">{row.account_number}</span>
          ),
        },
        {
          key: 'holder',
          header: 'Atas Nama',
          render: (row) => <span className="text-sm text-[#242B28]">{row.account_holder}</span>,
        },
        {
          key: 'status',
          header: 'Status',
          render: (row) => (
            <Badge variant={row.is_active ? 'emerald' : 'muted'}>
              {row.is_active ? 'Aktif' : 'Nonaktif'}
            </Badge>
          ),
        },
      ]}
      fields={[
        { name: 'bank_name', label: 'Nama Bank', type: 'text', required: true, placeholder: 'Bank Central Asia (BCA)' },
        { name: 'account_number', label: 'Nomor Rekening', type: 'text', required: true, pattern: /^[0-9-]{6,25}$/, patternMessage: 'Nomor rekening harus berupa angka (6–25 digit).' },
        { name: 'account_holder', label: 'Nama Pemilik Rekening', type: 'text', required: true, defaultValue: 'PT Perumahan Nusantara Properti' },
        { name: 'branch', label: 'Cabang', type: 'text', placeholder: 'KCU BSD City' },
        { name: 'display_order', label: 'Urutan Tampil', type: 'number', min: 0, defaultValue: 1 },
        { name: 'is_active', label: 'Tampilkan di Instruksi Pembayaran', type: 'checkbox', defaultValue: true },
        { name: 'instructions', label: 'Instruksi Transfer', type: 'textarea', colSpan: 2, placeholder: 'Cantumkan nomor reservasi pada berita transfer.' },
      ]}
      detailFields={[
        { label: 'Nama Bank', render: (r) => <strong>{r.bank_name}</strong> },
        { label: 'Nomor Rekening', render: (r) => <code className="font-bold">{r.account_number}</code> },
        { label: 'Atas Nama', render: (r) => r.account_holder },
        { label: 'Cabang', render: (r) => r.branch || '—' },
        { label: 'Instruksi Transfer', render: (r) => r.instructions || '—' },
        { label: 'Status', render: (r) => <Badge variant={r.is_active ? 'emerald' : 'muted'}>{r.is_active ? 'Aktif' : 'Nonaktif'}</Badge> },
        { label: 'Diperbarui', render: (r) => formatDateTimeID(r.updated_at) },
      ]}
    />
  )
}
