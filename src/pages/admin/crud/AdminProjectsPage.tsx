import { CrudPageShell } from '@/components/tables/CrudPageShell'
import { Badge } from '@/components/ui/Badge'
import type { ProjectRecord } from '@/types/database'
import { formatCompactPrice, formatCurrency } from '@/utils/format'
import { formatDateTimeID, PROJECT_STATUS_META } from '@/utils/statusBadges'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function AdminProjectsPage() {
  return (
    <CrudPageShell<ProjectRecord>
      entityKey="projects"
      title="Manajemen Proyek"
      subtitle="Kelola kawasan perumahan, lokasi, status pemasaran, dan informasi proyek."
      singularName="Proyek"
      searchPlaceholder="Cari nama proyek, lokasi, atau kota..."
      searchFields={(row) => [row.name, row.location, row.city, row.slug]}
      getSummaryLabel={(row) => row.name ?? 'Proyek'}
      filters={[
        {
          key: 'status',
          label: 'Status Proyek',
          options: [
            { label: 'Semua Status', value: 'all' },
            { label: 'New Launch', value: 'launching' },
            { label: 'Tersedia', value: 'available' },
            { label: 'Unit Terbatas', value: 'limited' },
            { label: 'Terjual Habis', value: 'sold_out' },
          ],
          predicate: (row, val) => row.status === val,
        },
      ]}
      columns={[
        {
          key: 'name',
          header: 'Proyek',
          render: (row) => (
            <div className="flex items-center gap-3">
              <img
                src={row.cover_image_url || '/images/project-cluster-1.jpg'}
                alt={row.name}
                className="h-11 w-14 rounded-lg object-cover border border-[#E3E0D6] shrink-0"
              />
              <div>
                <p className="font-display font-bold text-[#173F35]">{row.name}</p>
                <p className="text-xs text-[#5F6B66]">{row.location}</p>
              </div>
            </div>
          ),
        },
        {
          key: 'total_units',
          header: 'Total Unit',
          render: (row) => <span className="font-semibold text-[#173F35]">{row.total_units} Unit</span>,
        },
        {
          key: 'starting_price',
          header: 'Harga Mulai',
          render: (row) => (
            <span className="font-semibold text-[#173F35]">
              {formatCompactPrice(row.starting_price)}
            </span>
          ),
        },
        {
          key: 'status',
          header: 'Status',
          render: (row) => {
            const meta = PROJECT_STATUS_META[row.status]
            return <Badge variant={meta.variant}>{meta.label}</Badge>
          },
        },
      ]}
      fields={[
        { name: 'name', label: 'Nama Proyek', type: 'text', required: true, placeholder: 'Serenity Forest Residence' },
        { name: 'city', label: 'Kota / Wilayah', type: 'text', required: true, placeholder: 'BSD City' },
        { name: 'location', label: 'Lokasi Lengkap', type: 'text', required: true, placeholder: 'BSD City, Tangerang Selatan' },
        {
          name: 'status',
          label: 'Status Proyek',
          type: 'select',
          required: true,
          defaultValue: 'available',
          options: [
            { label: 'New Launch', value: 'launching' },
            { label: 'Tersedia', value: 'available' },
            { label: 'Unit Terbatas', value: 'limited' },
            { label: 'Terjual Habis', value: 'sold_out' },
          ],
        },
        { name: 'starting_price', label: 'Harga Mulai (Rp)', type: 'number', required: true, min: 0, placeholder: '1250000000' },
        { name: 'total_units', label: 'Total Unit', type: 'number', required: true, min: 1, placeholder: '120' },
        { name: 'land_area_range', label: 'Kisaran Luas Tanah', type: 'text', placeholder: '72 – 150 m²' },
        { name: 'cover_image_url', label: 'URL Foto Sampul', type: 'text', defaultValue: '/images/project-cluster-1.jpg' },
        { name: 'tagline', label: 'Tagline Singkat', type: 'text', colSpan: 2, placeholder: 'Hunian Tropis Modern di Koridor Hijau' },
        { name: 'description', label: 'Deskripsi Proyek', type: 'textarea', required: true, colSpan: 2 },
        { name: 'featured', label: 'Tampilkan di Proyek Unggulan Homepage', type: 'checkbox', defaultValue: true, colSpan: 2 },
      ]}
      fromFormValues={(values, editing) => ({
        slug: editing?.slug ?? slugify(String(values.name)),
        name: String(values.name).trim(),
        city: String(values.city).trim(),
        location: String(values.location).trim(),
        status: String(values.status) as ProjectRecord['status'],
        starting_price: Number(values.starting_price || 0),
        total_units: Number(values.total_units || 0),
        land_area_range: String(values.land_area_range || '').trim(),
        cover_image_url: String(values.cover_image_url || '/images/project-cluster-1.jpg').trim(),
        tagline: String(values.tagline || '').trim(),
        description: String(values.description || '').trim(),
        full_description: editing?.full_description ?? String(values.description || '').trim(),
        gallery_urls: editing?.gallery_urls ?? [String(values.cover_image_url || '/images/project-cluster-1.jpg')],
        total_area_hectares: editing?.total_area_hectares ?? '10 Hektare',
        completion_target: editing?.completion_target ?? 'Siap Serah Terima Bertahap',
        highlights: editing?.highlights ?? ['SHM & PBG Lengkap', 'One-Gate Security'],
        map_address: editing?.map_address ?? String(values.location).trim(),
        map_lat: editing?.map_lat ?? -6.3018,
        map_lng: editing?.map_lng ?? 106.6414,
        nearby_access: editing?.nearby_access ?? [],
        featured: Boolean(values.featured),
      })}
      detailFields={[
        { label: 'Nama Proyek', render: (r) => <strong>{r.name}</strong> },
        { label: 'Slug URL', render: (r) => <code>{r.slug}</code> },
        { label: 'Lokasi', render: (r) => `${r.location} (${r.city})` },
        { label: 'Status', render: (r) => <Badge variant={PROJECT_STATUS_META[r.status].variant}>{PROJECT_STATUS_META[r.status].label}</Badge> },
        { label: 'Harga Mulai', render: (r) => formatCurrency(r.starting_price) },
        { label: 'Total Unit', render: (r) => `${r.total_units} Unit (LT ${r.land_area_range || '—'})` },
        { label: 'Deskripsi', render: (r) => r.description },
        { label: 'Diperbarui', render: (r) => formatDateTimeID(r.updated_at) },
      ]}
    />
  )
}
