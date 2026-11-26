import { CrudPageShell } from '@/components/tables/CrudPageShell'
import { Badge } from '@/components/ui/Badge'
import type { FacilityRecord } from '@/types/database'
import { formatDateTimeID } from '@/utils/statusBadges'

export function AdminFacilitiesPage() {
  return (
    <CrudPageShell<FacilityRecord>
      entityKey="facilities"
      title="Manajemen Fasilitas"
      subtitle="Kelola daftar fasilitas unggulan kawasan perumahan yang ditampilkan kepada calon pembeli."
      singularName="Fasilitas"
      searchPlaceholder="Cari nama fasilitas, kategori, atau deskripsi..."
      searchFields={(row) => [row.title, row.category, row.description, row.highlight]}
      getSummaryLabel={(row) => row.title ?? 'Fasilitas'}
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
          key: 'title',
          header: 'Fasilitas',
          render: (row) => (
            <div>
              <p className="font-display font-bold text-[#173F35]">{row.title}</p>
              <p className="text-xs text-[#5F6B66] line-clamp-1">{row.description}</p>
            </div>
          ),
        },
        {
          key: 'category',
          header: 'Kategori',
          render: (row) => <Badge variant="default">{row.category}</Badge>,
        },
        {
          key: 'highlight',
          header: 'Highlight',
          render: (row) => <span className="text-xs font-medium text-[#285C49]">{row.highlight || '—'}</span>,
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
        { name: 'title', label: 'Nama Fasilitas', type: 'text', required: true, placeholder: 'Private Clubhouse & Lap Pool' },
        { name: 'category', label: 'Kategori', type: 'text', required: true, placeholder: 'Rekreasi / Keamanan / Ruang Hijau' },
        { name: 'highlight', label: 'Label Sorotan', type: 'text', placeholder: 'Khusus Penghuni' },
        {
          name: 'icon_name',
          label: 'Ikon Fasilitas',
          type: 'select',
          required: true,
          defaultValue: 'shield',
          options: [
            { label: 'Shield (Keamanan)', value: 'shield' },
            { label: 'Waves (Kolam / Clubhouse)', value: 'waves' },
            { label: 'Trees (Taman / Hijau)', value: 'trees' },
            { label: 'Wifi (Smart Home)', value: 'wifi' },
            { label: 'Building (Komunitas / Masjid)', value: 'building' },
            { label: 'Zap (Infrastruktur)', value: 'zap' },
          ],
        },
        { name: 'display_order', label: 'Urutan Tampil', type: 'number', min: 1, defaultValue: 1 },
        { name: 'is_active', label: 'Aktif Ditampilkan', type: 'checkbox', defaultValue: true },
        { name: 'description', label: 'Deskripsi Fasilitas', type: 'textarea', required: true, colSpan: 2 },
      ]}
      fromFormValues={(values) => ({
        project_id: null,
        title: String(values.title).trim(),
        category: String(values.category).trim(),
        highlight: String(values.highlight || '').trim(),
        icon_name: String(values.icon_name) as FacilityRecord['icon_name'],
        display_order: Number(values.display_order || 1),
        is_active: Boolean(values.is_active),
        description: String(values.description).trim(),
      })}
      detailFields={[
        { label: 'Nama Fasilitas', render: (r) => <strong>{r.title}</strong> },
        { label: 'Kategori', render: (r) => r.category },
        { label: 'Highlight', render: (r) => r.highlight || '—' },
        { label: 'Deskripsi', render: (r) => r.description },
        { label: 'Status', render: (r) => <Badge variant={r.is_active ? 'emerald' : 'muted'}>{r.is_active ? 'Aktif' : 'Nonaktif'}</Badge> },
        { label: 'Diperbarui', render: (r) => formatDateTimeID(r.updated_at) },
      ]}
    />
  )
}
