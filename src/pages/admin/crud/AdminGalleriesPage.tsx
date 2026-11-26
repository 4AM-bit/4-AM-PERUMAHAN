import { useEffect, useState } from 'react'
import { CrudPageShell } from '@/components/tables/CrudPageShell'
import { Badge } from '@/components/ui/Badge'
import { crudService } from '@/services/crudStore'
import type { GalleryRecord, ProjectRecord } from '@/types/database'
import { formatDateTimeID } from '@/utils/statusBadges'

export function AdminGalleriesPage() {
  const [projects, setProjects] = useState<ProjectRecord[]>([])

  useEffect(() => {
    void crudService.list<ProjectRecord>('projects').then(setProjects).catch(() => {})
  }, [])

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.name]))

  return (
    <CrudPageShell<GalleryRecord>
      entityKey="galleries"
      title="Manajemen Galeri"
      subtitle="Kelola koleksi foto arsitektur eksterior, kawasan, fasilitas, dan interior."
      singularName="Foto Galeri"
      searchPlaceholder="Cari judul foto, kategori, atau keterangan..."
      searchFields={(row) => [row.title, row.category, row.caption]}
      getSummaryLabel={(row) => row.title ?? 'Foto Galeri'}
      filters={[
        {
          key: 'category',
          label: 'Kategori',
          options: [
            { label: 'Semua Kategori', value: 'all' },
            { label: 'Eksterior', value: 'Eksterior' },
            { label: 'Kawasan', value: 'Kawasan' },
            { label: 'Fasilitas', value: 'Fasilitas' },
            { label: 'Interior', value: 'Interior' },
          ],
          predicate: (row, val) => row.category === val,
        },
      ]}
      columns={[
        {
          key: 'photo',
          header: 'Foto',
          render: (row) => (
            <div className="flex items-center gap-3">
              <img
                src={row.image_url || '/images/hero-residence.jpg'}
                alt={row.title}
                className="h-11 w-14 rounded-lg object-cover border border-[#E3E0D6] shrink-0"
              />
              <div>
                <p className="font-display font-bold text-[#173F35]">{row.title}</p>
                <p className="text-xs text-[#5F6B66]">
                  {row.project_id ? projectMap[row.project_id] ?? 'Proyek' : 'Umum'}
                </p>
              </div>
            </div>
          ),
        },
        {
          key: 'category',
          header: 'Kategori',
          render: (row) => <Badge variant="default">{row.category}</Badge>,
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
        { name: 'title', label: 'Judul Foto', type: 'text', required: true },
        {
          name: 'category',
          label: 'Kategori',
          type: 'select',
          required: true,
          defaultValue: 'Eksterior',
          options: [
            { label: 'Eksterior', value: 'Eksterior' },
            { label: 'Kawasan', value: 'Kawasan' },
            { label: 'Fasilitas', value: 'Fasilitas' },
            { label: 'Interior', value: 'Interior' },
          ],
        },
        {
          name: 'project_id',
          label: 'Proyek Terkait (Opsional)',
          type: 'select',
          options: [
            { label: '— Umum / Semua Proyek —', value: '' },
            ...projects.map((p) => ({ label: p.name, value: p.id })),
          ],
        },
        { name: 'display_order', label: 'Urutan Tampil', type: 'number', min: 1, defaultValue: 1 },
        { name: 'image_url', label: 'URL Gambar', type: 'text', required: true, defaultValue: '/images/project-cluster-1.jpg', colSpan: 2 },
        { name: 'caption', label: 'Keterangan Foto', type: 'textarea', colSpan: 2 },
        { name: 'is_active', label: 'Tampilkan di Galeri Publik', type: 'checkbox', defaultValue: true, colSpan: 2 },
      ]}
      fromFormValues={(values) => ({
        title: String(values.title).trim(),
        category: String(values.category) as GalleryRecord['category'],
        project_id: String(values.project_id || '') || null,
        image_url: String(values.image_url).trim(),
        caption: String(values.caption || '').trim(),
        display_order: Number(values.display_order || 1),
        is_active: Boolean(values.is_active),
      })}
      detailFields={[
        {
          label: 'Pratinjau',
          render: (r) => (
            <img
              src={r.image_url}
              alt={r.title}
              className="max-h-56 w-full rounded-xl object-cover border border-[#E3E0D6]"
            />
          ),
        },
        { label: 'Judul', render: (r) => <strong>{r.title}</strong> },
        { label: 'Kategori', render: (r) => <Badge variant="default">{r.category}</Badge> },
        { label: 'Proyek', render: (r) => (r.project_id ? projectMap[r.project_id] ?? r.project_id : 'Umum') },
        { label: 'Keterangan', render: (r) => r.caption || '—' },
        { label: 'Diperbarui', render: (r) => formatDateTimeID(r.updated_at) },
      ]}
    />
  )
}
