import { useCallback } from 'react'
import { CrudPageShell } from '@/components/tables/CrudPageShell'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { getRoleLabel, type UserRole } from '@/types/auth'
import type { ProfileRecord } from '@/types/database'
import { formatDateTimeID } from '@/utils/statusBadges'

export function AdminAdministratorsPage() {
  const { user } = useAuth()

  const scopeStaff = useCallback(
    (rows: ProfileRecord[]) => rows.filter((r) => r.role !== 'customer'),
    [],
  )

  return (
    <CrudPageShell<ProfileRecord>
      entityKey="profiles"
      title="Manajemen Administrator & Staff"
      subtitle="Khusus Super Administrator: kelola akun Sales, Administrator, Super Admin, dan hak akses."
      singularName="Staff / Admin"
      searchPlaceholder="Cari nama, email, atau role staff..."
      searchFields={(row) => [row.full_name, row.email, row.role]}
      rowScope={scopeStaff}
      getSummaryLabel={(row) => `${row.full_name ?? 'Staff'} (${row.role ?? ''})`}
      canDelete={(row) => row.id !== user?.id}
      filters={[
        {
          key: 'role',
          label: 'Peran Staff',
          options: [
            { label: 'Semua Peran', value: 'all' },
            { label: 'Super Administrator', value: 'super_admin' },
            { label: 'Administrator', value: 'admin' },
            { label: 'Sales Advisor', value: 'sales' },
          ],
          predicate: (row, val) => row.role === val,
        },
      ]}
      columns={[
        {
          key: 'name',
          header: 'Nama Staff',
          render: (row) => (
            <div>
              <p className="font-display font-bold text-[#173F35]">
                {row.full_name}
                {row.id === user?.id && (
                  <span className="ml-2 text-[11px] font-medium text-[#285C49]">(Anda)</span>
                )}
              </p>
              <p className="text-xs text-[#5F6B66]">{row.email}</p>
            </div>
          ),
        },
        {
          key: 'role',
          header: 'Hak Akses (RBAC)',
          render: (row) => (
            <Badge
              variant={
                row.role === 'super_admin'
                  ? 'forest'
                  : row.role === 'admin'
                    ? 'gold'
                    : 'emerald'
              }
            >
              {getRoleLabel(row.role)}
            </Badge>
          ),
        },
        {
          key: 'phone',
          header: 'WhatsApp',
          render: (row) => <span className="text-sm text-[#242B28]">{row.phone || '—'}</span>,
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
        { name: 'email', label: 'Email Korporat', type: 'email', required: true, readOnlyOnEdit: true },
        { name: 'phone', label: 'Nomor WhatsApp', type: 'text', required: true },
        {
          name: 'role',
          label: 'Hak Akses (Role)',
          type: 'select',
          required: true,
          defaultValue: 'sales',
          options: [
            { label: 'Sales Advisor', value: 'sales' },
            { label: 'Administrator', value: 'admin' },
            { label: 'Super Administrator', value: 'super_admin' },
          ],
        },
        { name: 'address', label: 'Kantor / Penempatan', type: 'text', colSpan: 2, defaultValue: 'Head Office PERUMAHAN, BSD City' },
        { name: 'is_active', label: 'Akun Aktif', type: 'checkbox', defaultValue: true, colSpan: 2 },
      ]}
      fromFormValues={(values) => ({
        full_name: String(values.full_name).trim(),
        email: String(values.email).trim().toLowerCase(),
        phone: String(values.phone).trim(),
        nik: null,
        address: String(values.address || '').trim(),
        role: String(values.role) as UserRole,
        is_active: Boolean(values.is_active),
      })}
      detailFields={[
        { label: 'Nama Lengkap', render: (r) => <strong>{r.full_name}</strong> },
        { label: 'Email', render: (r) => r.email },
        { label: 'Peran RBAC', render: (r) => <Badge variant="forest">{getRoleLabel(r.role)}</Badge> },
        { label: 'WhatsApp', render: (r) => r.phone || '—' },
        { label: 'Penempatan', render: (r) => r.address || '—' },
        { label: 'Status', render: (r) => <Badge variant={r.is_active ? 'emerald' : 'muted'}>{r.is_active ? 'Aktif' : 'Nonaktif'}</Badge> },
        { label: 'Dibuat Pada', render: (r) => formatDateTimeID(r.created_at) },
      ]}
    />
  )
}
