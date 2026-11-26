import { useEffect, useState } from 'react'
import { CrudPageShell } from '@/components/tables/CrudPageShell'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { crudService } from '@/services/crudStore'
import type {
  HouseTypeRecord,
  ProjectRecord,
  ReservationRecord,
  UnitRecord,
} from '@/types/database'
import { formatCurrency } from '@/utils/format'
import { formatDateTimeID, RESERVATION_STATUS_META } from '@/utils/statusBadges'

export function AdminReservationsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [houseTypes, setHouseTypes] = useState<HouseTypeRecord[]>([])
  const [units, setUnits] = useState<UnitRecord[]>([])

  useEffect(() => {
    void Promise.all([
      crudService.list<ProjectRecord>('projects'),
      crudService.list<HouseTypeRecord>('house_types'),
      crudService.list<UnitRecord>('units'),
    ])
      .then(([p, h, u]) => {
        setProjects(p)
        setHouseTypes(h)
        setUnits(u)
      })
      .catch(() => {})
  }, [])

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.name]))
  const houseTypeMap = Object.fromEntries(houseTypes.map((h) => [h.id, h.name]))
  const unitMap = Object.fromEntries(units.map((u) => [u.id, u.unit_code]))
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

  return (
    <CrudPageShell<ReservationRecord>
      entityKey="reservations"
      title="Manajemen Reservasi"
      subtitle="Pantau dan kelola seluruh pemesanan unit pelanggan beserta status penguncian."
      singularName="Reservasi"
      searchPlaceholder="Cari nomor reservasi, nama pelanggan, email, atau nomor unit..."
      searchFields={(row) => [
        row.reservation_number,
        row.customer_name,
        row.customer_email,
        row.customer_phone,
        unitMap[row.unit_id] ?? '',
      ]}
      getSummaryLabel={(row) => row.reservation_number ?? 'Reservasi'}
      allowCreate={isAdmin}
      allowEdit={isAdmin}
      allowDelete={isAdmin}
      canDelete={(row) => row.status !== 'confirmed' && row.status !== 'completed'}
      filters={[
        {
          key: 'status',
          label: 'Status Reservasi',
          options: [
            { label: 'Semua Status', value: 'all' },
            { label: 'Menunggu Transfer', value: 'pending' },
            { label: 'Menunggu Verifikasi', value: 'awaiting_verification' },
            { label: 'Terkonfirmasi', value: 'confirmed' },
            { label: 'Selesai / Akad', value: 'completed' },
            { label: 'Ditolak', value: 'rejected' },
            { label: 'Kedaluwarsa', value: 'expired' },
            { label: 'Dibatalkan', value: 'cancelled' },
          ],
          predicate: (row, val) => row.status === val,
        },
      ]}
      columns={[
        {
          key: 'number',
          header: 'No. Reservasi',
          render: (row) => (
            <div>
              <p className="font-mono text-xs font-bold text-[#173F35]">
                {row.reservation_number}
              </p>
              <p className="text-[11px] text-[#5F6B66]">
                {formatDateTimeID(row.created_at)}
              </p>
            </div>
          ),
        },
        {
          key: 'customer',
          header: 'Pelanggan',
          render: (row) => (
            <div>
              <p className="font-semibold text-[#173F35]">{row.customer_name}</p>
              <p className="text-xs text-[#5F6B66]">{row.customer_phone}</p>
            </div>
          ),
        },
        {
          key: 'unit',
          header: 'Proyek & Unit',
          render: (row) => (
            <div>
              <p className="font-semibold text-[#173F35]">
                {unitMap[row.unit_id] ?? '—'} • {houseTypeMap[row.house_type_id] ?? '—'}
              </p>
              <p className="text-xs text-[#5F6B66]">{projectMap[row.project_id] ?? '—'}</p>
            </div>
          ),
        },
        {
          key: 'fee',
          header: 'Booking Fee',
          render: (row) => (
            <div>
              <p className="font-semibold text-[#173F35]">{formatCurrency(row.booking_fee)}</p>
              <p className="text-[11px] text-[#5F6B66]">Unit: {formatCurrency(row.unit_price)}</p>
            </div>
          ),
        },
        {
          key: 'status',
          header: 'Status',
          render: (row) => {
            const meta = RESERVATION_STATUS_META[row.status]
            return <Badge variant={meta.variant}>{meta.label}</Badge>
          },
        },
      ]}
      fields={[
        {
          name: 'unit_id',
          label: 'Unit',
          type: 'select',
          required: true,
          readOnlyOnEdit: true,
          options: units.map((u) => ({
            label: `${u.unit_code} — ${houseTypeMap[u.house_type_id] ?? ''} (${u.status})`,
            value: u.id,
          })),
        },
        {
          name: 'status',
          label: 'Status Reservasi',
          type: 'select',
          required: true,
          defaultValue: 'pending',
          options: [
            { label: 'Pending (Menunggu Transfer)', value: 'pending' },
            { label: 'Awaiting Verification', value: 'awaiting_verification' },
            { label: 'Confirmed', value: 'confirmed' },
            { label: 'Completed (Akad / Terjual)', value: 'completed' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'Expired', value: 'expired' },
            { label: 'Cancelled', value: 'cancelled' },
          ],
        },
        { name: 'customer_name', label: 'Nama Pelanggan', type: 'text', required: true },
        {
          name: 'customer_nik',
          label: 'NIK (16 Digit)',
          type: 'text',
          required: true,
          pattern: /^[0-9]{16}$/,
          patternMessage: 'NIK harus terdiri dari 16 digit angka.',
        },
        { name: 'customer_email', label: 'Email Pelanggan', type: 'email', required: true },
        { name: 'customer_phone', label: 'WhatsApp Pelanggan', type: 'text', required: true },
        { name: 'booking_fee', label: 'Booking Fee (Rp)', type: 'number', required: true, min: 0, defaultValue: 5000000 },
        { name: 'unit_price', label: 'Harga Unit (Rp)', type: 'number', required: true, min: 0 },
        { name: 'notes', label: 'Catatan Reservasi', type: 'textarea', colSpan: 2 },
        { name: 'cancellation_reason', label: 'Alasan Penolakan / Pembatalan', type: 'textarea', colSpan: 2 },
      ]}
      fromFormValues={(values, editing) => {
        const chosenUnit = units.find((u) => u.id === String(values.unit_id))
        return {
          reservation_number:
            editing?.reservation_number ??
            `RSV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
          customer_id: editing?.customer_id ?? 'demo-customer-001',
          project_id: editing?.project_id ?? chosenUnit?.project_id ?? projects[0]?.id ?? '',
          house_type_id: editing?.house_type_id ?? chosenUnit?.house_type_id ?? houseTypes[0]?.id ?? '',
          unit_id: String(values.unit_id),
          assigned_sales_id: editing?.assigned_sales_id ?? 'demo-sales-001',
          customer_name: String(values.customer_name).trim(),
          customer_nik: String(values.customer_nik).trim(),
          customer_email: String(values.customer_email).trim(),
          customer_phone: String(values.customer_phone).trim(),
          customer_address: editing?.customer_address ?? '',
          unit_price: Number(values.unit_price || chosenUnit?.price || 0),
          booking_fee: Number(values.booking_fee || 5000000),
          status: String(values.status) as ReservationRecord['status'],
          expires_at:
            editing?.expires_at ?? new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          confirmed_at:
            String(values.status) === 'confirmed'
              ? editing?.confirmed_at ?? new Date().toISOString()
              : editing?.confirmed_at ?? null,
          cancelled_at:
            String(values.status) === 'cancelled' ? new Date().toISOString() : null,
          cancellation_reason: String(values.cancellation_reason || '').trim(),
          notes: String(values.notes || '').trim(),
        }
      }}
      detailFields={[
        { label: 'No. Reservasi', render: (r) => <code className="font-bold">{r.reservation_number}</code> },
        { label: 'Status', render: (r) => <Badge variant={RESERVATION_STATUS_META[r.status].variant}>{RESERVATION_STATUS_META[r.status].label}</Badge> },
        { label: 'Pelanggan', render: (r) => `${r.customer_name} (${r.customer_email})` },
        { label: 'NIK & WhatsApp', render: (r) => `${r.customer_nik} • ${r.customer_phone}` },
        { label: 'Proyek & Tipe', render: (r) => `${projectMap[r.project_id] ?? '—'} — ${houseTypeMap[r.house_type_id] ?? '—'}` },
        { label: 'Nomor Unit', render: (r) => <strong>{unitMap[r.unit_id] ?? r.unit_id}</strong> },
        { label: 'Harga Unit & Booking Fee', render: (r) => `${formatCurrency(r.unit_price)} (BF: ${formatCurrency(r.booking_fee)})` },
        { label: 'Batas Waktu Bayar', render: (r) => formatDateTimeID(r.expires_at) },
        { label: 'Catatan', render: (r) => r.notes || '—' },
        { label: 'Alasan Tolak/Batal', render: (r) => r.cancellation_reason || '—' },
      ]}
    />
  )
}
