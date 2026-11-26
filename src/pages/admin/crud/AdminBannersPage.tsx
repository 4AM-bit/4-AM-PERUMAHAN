import { CrudPageShell } from '@/components/tables/CrudPageShell'
import { Badge } from '@/components/ui/Badge'
import type { BannerRecord } from '@/types/database'
import { formatDateTimeID } from '@/utils/statusBadges'

export function AdminBannersPage() {
  return (
    <CrudPageShell<BannerRecord>
      entityKey="banners"
      title="Manajemen Banner"
      subtitle="Kelola banner promosi dan hero utama pada website publik PERUMAHAN."
      singularName="Banner"
      searchPlaceholder="Cari judul banner atau CTA..."
      searchFields={(row) => [row.title, row.subtitle, row.cta_label]}
      getSummaryLabel={(row) => row.title ?? 'Banner'}
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
          key: 'banner',
          header: 'Banner',
          render: (row) => (
            <div className="flex items-center gap-3">
              <img
                src={row.image_url || '/images/hero-residence.jpg'}
                alt={row.title}
                className="h-11 w-18 rounded-lg object-cover border border-[#E3E0D6] shrink-0"
              />
              <div>
                <p className="font-display font-bold text-[#173F35]">{row.title}</p>
                <p className="text-xs text-[#5F6B66] line-clamp-1">{row.subtitle}</p>
              </div>
            </div>
          ),
        },
        {
          key: 'cta',
          header: 'Tombol CTA',
          render: (row) => (
            <span className="text-xs font-medium text-[#285C49]">
              {row.cta_label} ({row.cta_url})
            </span>
          ),
        },
        {
          key: 'order',
          header: 'Urutan',
          render: (row) => <span className="font-semibold text-[#173F35]">#{row.display_order}</span>,
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
        { name: 'title', label: 'Judul Banner', type: 'text', required: true, colSpan: 2 },
        { name: 'subtitle', label: 'Subjudul', type: 'textarea', required: true, colSpan: 2 },
        { name: 'image_url', label: 'URL Gambar Banner', type: 'text', required: true, defaultValue: '/images/hero-residence.jpg', colSpan: 2 },
        { name: 'cta_label', label: 'Label Tombol CTA', type: 'text', required: true, defaultValue: 'Jelajahi Rumah' },
        { name: 'cta_url', label: 'URL Tujuan CTA', type: 'text', required: true, defaultValue: '/katalog' },
        { name: 'display_order', label: 'Urutan Tampil', type: 'number', min: 1, defaultValue: 1 },
        { name: 'is_active', label: 'Banner Aktif Ditampilkan', type: 'checkbox', defaultValue: true },
      ]}
      detailFields={[
        {
          label: 'Pratinjau Gambar',
          render: (r) => (
            <img
              src={r.image_url}
              alt={r.title}
              className="max-h-48 w-full rounded-xl object-cover border border-[#E3E0D6]"
            />
          ),
        },
        { label: 'Judul', render: (r) => <strong>{r.title}</strong> },
        { label: 'Subjudul', render: (r) => r.subtitle },
        { label: 'CTA', render: (r) => `${r.cta_label} → ${r.cta_url}` },
        { label: 'Urutan & Status', render: (r) => `#${r.display_order} • ${r.is_active ? 'Aktif' : 'Nonaktif'}` },
        { label: 'Diperbarui', render: (r) => formatDateTimeID(r.updated_at) },
      ]}
    />
  )
}
