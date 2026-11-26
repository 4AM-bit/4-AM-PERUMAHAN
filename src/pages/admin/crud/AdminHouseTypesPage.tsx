import { useEffect, useState } from 'react'
import { CrudPageShell } from '@/components/tables/CrudPageShell'
import { Badge } from '@/components/ui/Badge'
import { crudService } from '@/services/crudStore'
import type { HouseTypeRecord, ProjectRecord } from '@/types/database'
import { formatArea, formatCurrency } from '@/utils/format'
import { formatDateTimeID } from '@/utils/statusBadges'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function AdminHouseTypesPage() {
  const [projects, setProjects] = useState<ProjectRecord[]>([])

  useEffect(() => {
    void crudService.list<ProjectRecord>('projects').then(setProjects).catch(() => {})
  }, [])

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.name]))
  const projectOptions = projects.map((p) => ({ label: p.name, value: p.id }))

  return (
    <CrudPageShell<HouseTypeRecord>
      entityKey="house_types"
      title="Manajemen Tipe Rumah"
      subtitle="Kelola tipe rumah, harga dasar, booking fee, luas tanah/bangunan, dan jumlah kamar."
      singularName="Tipe Rumah"
      searchPlaceholder="Cari nama tipe, kategori, atau proyek..."
      searchFields={(row) => [row.name, row.category, projectMap[row.project_id] ?? '']}
      getSummaryLabel={(row) => row.name ?? 'Tipe Rumah'}
      filters={[
        {
          key: 'project',
          label: 'Proyek',
          options: [{ label: 'Semua Proyek', value: 'all' }, ...projectOptions],
          predicate: (row, val) => row.project_id === val,
        },
        {
          key: 'floors',
          label: 'Lantai',
          options: [
            { label: 'Semua Lantai', value: 'all' },
            { label: '1 Lantai', value: '1' },
            { label: '2 Lantai', value: '2' },
          ],
          predicate: (row, val) => String(row.floors) === val,
        },
      ]}
      columns={[
        {
          key: 'name',
          header: 'Tipe Rumah',
          render: (row) => (
            <div className="flex items-center gap-3">
              <img
                src={row.cover_image_url || '/images/house-type-compact.jpg'}
                alt={row.name}
                className="h-11 w-14 rounded-lg object-cover border border-[#E3E0D6] shrink-0"
              />
              <div>
                <p className="font-display font-bold text-[#173F35]">{row.name}</p>
                <p className="text-xs text-[#5F6B66]">{projectMap[row.project_id] ?? '—'}</p>
              </div>
            </div>
          ),
        },
        {
          key: 'dims',
          header: 'LT / LB',
          render: (row) => (
            <span className="text-xs font-medium text-[#242B28]">
              {formatArea(row.land_area)} / {formatArea(row.building_area)}
            </span>
          ),
        },
        {
          key: 'rooms',
          header: 'KT / KM',
          render: (row) => (
            <Badge variant="default">
              {row.bedrooms} KT • {row.bathrooms} KM • {row.floors} Lt
            </Badge>
          ),
        },
        {
          key: 'price',
          header: 'Harga & Booking Fee',
          render: (row) => (
            <div>
              <p className="font-semibold text-[#173F35]">{formatCurrency(row.price)}</p>
              <p className="text-[11px] text-[#285C49]">BF: {formatCurrency(row.booking_fee)}</p>
            </div>
          ),
        },
      ]}
      fields={[
        { name: 'project_id', label: 'Proyek', type: 'select', required: true, options: projectOptions },
        { name: 'name', label: 'Nama Tipe Rumah', type: 'text', required: true, placeholder: 'Tipe Cendana 68/90' },
        { name: 'category', label: 'Kategori', type: 'text', required: true, placeholder: '2 Lantai • Modern Family' },
        { name: 'price', label: 'Harga Unit (Rp)', type: 'number', required: true, min: 0 },
        { name: 'booking_fee', label: 'Booking Fee (Rp)', type: 'number', required: true, min: 0, defaultValue: 5000000 },
        { name: 'reservation_hold_hours', label: 'Masa Penguncian (Jam)', type: 'number', required: true, min: 1, max: 168, defaultValue: 24 },
        { name: 'land_area', label: 'Luas Tanah (m²)', type: 'number', required: true, min: 1 },
        { name: 'building_area', label: 'Luas Bangunan (m²)', type: 'number', required: true, min: 1 },
        { name: 'bedrooms', label: 'Kamar Tidur', type: 'number', required: true, min: 1, defaultValue: 3 },
        { name: 'bathrooms', label: 'Kamar Mandi', type: 'number', required: true, min: 1, defaultValue: 2 },
        { name: 'floors', label: 'Jumlah Lantai', type: 'number', required: true, min: 1, defaultValue: 2 },
        { name: 'carport', label: 'Carport (Mobil)', type: 'number', required: true, min: 0, defaultValue: 1 },
        { name: 'cover_image_url', label: 'URL Foto Sampul', type: 'text', colSpan: 2, defaultValue: '/images/house-type-compact.jpg' },
        { name: 'short_description', label: 'Deskripsi Singkat', type: 'textarea', required: true, colSpan: 2 },
        { name: 'featured', label: 'Tampilkan pada Tipe Unggulan', type: 'checkbox', defaultValue: true, colSpan: 2 },
      ]}
      fromFormValues={(values, editing) => ({
        project_id: String(values.project_id),
        slug: editing?.slug ?? slugify(String(values.name)),
        name: String(values.name).trim(),
        category: String(values.category).trim(),
        price: Number(values.price || 0),
        booking_fee: Number(values.booking_fee || 5000000),
        reservation_hold_hours: Number(values.reservation_hold_hours || 24),
        land_area: Number(values.land_area || 72),
        building_area: Number(values.building_area || 45),
        bedrooms: Number(values.bedrooms || 2),
        bathrooms: Number(values.bathrooms || 1),
        floors: Number(values.floors || 1),
        carport: Number(values.carport || 1),
        cover_image_url: String(values.cover_image_url || '/images/house-type-compact.jpg').trim(),
        short_description: String(values.short_description || '').trim(),
        full_description: editing?.full_description ?? String(values.short_description || '').trim(),
        gallery_urls: editing?.gallery_urls ?? [String(values.cover_image_url || '/images/house-type-compact.jpg')],
        floorplan_urls: editing?.floorplan_urls ?? [],
        specs: editing?.specs ?? ['SHM & PBG Lengkap', 'Smart Door Lock'],
        building_specs: editing?.building_specs ?? [],
        featured: Boolean(values.featured),
      })}
      detailFields={[
        { label: 'Nama Tipe', render: (r) => <strong>{r.name}</strong> },
        { label: 'Proyek', render: (r) => projectMap[r.project_id] ?? r.project_id },
        { label: 'Kategori', render: (r) => r.category },
        { label: 'Harga', render: (r) => formatCurrency(r.price) },
        { label: 'Booking Fee', render: (r) => `${formatCurrency(r.booking_fee)} (Hold ${r.reservation_hold_hours} Jam)` },
        { label: 'Dimensi', render: (r) => `LT ${r.land_area} m² / LB ${r.building_area} m²` },
        { label: 'Ruangan', render: (r) => `${r.bedrooms} KT • ${r.bathrooms} KM • ${r.floors} Lantai • ${r.carport} Carport` },
        { label: 'Deskripsi', render: (r) => r.short_description },
        { label: 'Diperbarui', render: (r) => formatDateTimeID(r.updated_at) },
      ]}
    />
  )
}
