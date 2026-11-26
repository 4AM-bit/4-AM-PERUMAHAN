import { useCallback } from 'react'
import { CrudPageShell } from '@/components/tables/CrudPageShell'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import type { ProfileRecord } from '@/types/database'
import { formatDateTimeID } from '@/utils/statusBadges'

export function AdminCustomersPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

  const scopeCustomers = useCallback(
    (rows: ProfileRecord[]) => rows.filter((r) => r.role === 'customer'),
    [],
  )

  return (
    <CrudPageShell<ProfileRecord>
      entityKey="profiles"
      title="Manajemen Pelanggan"
      subtitle="Kelola profil pelanggan terdaftar, nomor WhatsApp, NIK, dan status keaktifan."
      singularName="Pelanggan"
      searchPlaceholder="Cari nama, email, nomor HP, atau NIK..."
      searchFields={(row) => [row.full_name, row.email, row.phone, row.nik ?? '']}
      rowScope={scopeCustomers}
      getSummaryLabel={(row) => row.full_name ?? row.email ?? 'Pelanggan'}
      allowCreate={isAdmin}
      allowEdit={isAdmin}
      allowDelete={isAdmin}
      filters={[
        {
          key: 'active',
          label: 'Status Akun',
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
          key: 'name',
          header: 'Nama Pelanggan',
          render: (row) => (
            <div>
              <p className="font-display font-bold text-[#173F35]">{row.full_name}</p>
              <p className="text-xs text-[#5F6B66]">{row.email}</p>
            </div>
          ),
        },
        {
          key: 'phone',
          header: 'WhatsApp',
          render: (row) => <span className="text-sm text-[#242B28]">{row.phone || '—'}</span>,
        },
        {
          key: 'nik',
          header: 'NIK',
          render: (row) => (
            <span className="font-mono text-xs text-[#5F6B66]">{row.nik || 'Belum diisi'}</span>
          ),
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
        { name: 'full_name', label: 'Nama Lengkap', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true, readOnlyOnEdit: true },
        {
          name: 'phone',
          label: 'Nomor WhatsApp',
          type: 'text',
          required: true,
          pattern: /^(\+62|62|0)8[1-9][0-9]{7,11}$/,
          patternMessage: 'Gunakan format nomor HP Indonesia yang valid.',
        },
        {
          name: 'nik',
          label: 'NIK (16 Digit)',
          type: 'text',
          pattern: /^[0-9]{16}$/,
          patternMessage: 'NIK harus terdiri dari 16 digit angka.',
        },
        { name: 'address', label: 'Alamat Domisili', type: 'textarea', colSpan: 2 },
        { name: 'is_active', label: 'Akun Aktif', type: 'checkbox', defaultValue: true, colSpan: 2 },
      ]}
      fromFormValues={(values) => ({
        full_name: String(values.full_name).trim(),
        email: String(values.email).trim().toLowerCase(),
        phone: String(values.phone).trim(),
        nik: String(values.nik || '').trim() || null,
        address: String(values.address || '').trim(),
        role: 'customer',
        is_active: Boolean(values.is_active),
      })}
      detailFields={[
        { label: 'Nama Lengkap', render: (r) => <strong>{r.full_name}</strong> },
        { label: 'Email', render: (r) => r.email },
        { label: 'WhatsApp', render: (r) => r.phone || '—' },
        { label: 'NIK', render: (r) => r.nik || 'Belum dilengkapi' },
        { label: 'Alamat', render: (r) => r.address || '—' },
        { label: 'Status Akun', render: (r) => <Badge variant={r.is_active ? 'emerald' : 'muted'}>{r.is_active ? 'Aktif' : 'Nonaktif'}</Badge> },
        { label: 'Terdaftar Pada', render: (r) => formatDateTimeID(r.created_at) },
      ]}
    />
  )
}
