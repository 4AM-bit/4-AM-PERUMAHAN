import { useEffect, useState } from 'react'
import { CrudPageShell } from '@/components/tables/CrudPageShell'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { crudService } from '@/services/crudStore'
import type { HouseTypeRecord, ProjectRecord, UnitRecord } from '@/types/database'
import { formatArea, formatCurrency } from '@/utils/format'
import { formatDateTimeID, UNIT_STATUS_META } from '@/utils/statusBadges'

export function AdminUnitsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [houseTypes, setHouseTypes] = useState<HouseTypeRecord[]>([])

  useEffect(() => {
    void Promise.all([
      crudService.list<ProjectRecord>('projects'),
      crudService.list<HouseTypeRecord>('house_types'),
    ])
      .then(([p, h]) => {
        setProjects(p)
        setHouseTypes(h)
      })
      .catch(() => {})
  }, [])

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.name]))
  const houseTypeMap = Object.fromEntries(houseTypes.map((h) => [h.id, h.name]))
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

  return (
    <CrudPageShell<UnitRecord>
      entityKey="units"
      title="Manajemen Unit"
      subtitle="Kelola inventaris unit fisik, nomor kavling, harga unit, dan status ketersediaan."
      singularName="Unit"
      searchPlaceholder="Cari nomor unit, blok, hadap, atau proyek..."
      searchFields={(row) => [
        row.unit_code,
        row.block,
        row.facing,
        projectMap[row.project_id] ?? '',
        houseTypeMap[row.house_type_id] ?? '',
      ]}
      getSummaryLabel={(row) => `Unit ${row.unit_code ?? ''}`}
      allowCreate={isAdmin}
      allowEdit={isAdmin}
      allowDelete={isAdmin}
      canDelete={(row) => row.status === 'available' || row.status === 'inactive'}
      filters={[
        {
          key: 'project',
          label: 'Proyek',
          options: [
            { label: 'Semua Proyek', value: 'all' },
            ...projects.map((p) => ({ label: p.name, value: p.id })),
          ],
          predicate: (row, val) => row.project_id === val,
        },
        {
          key: 'status',
          label: 'Status Unit',
          options: [
            { label: 'Semua Status', value: 'all' },
            { label: 'Tersedia', value: 'available' },
            { label: 'Reserved', value: 'reserved' },
            { label: 'Terjual', value: 'sold' },
            { label: 'Nonaktif', value: 'inactive' },
          ],
          predicate: (row, val) => row.status === val,
        },
      ]}
      columns={[
        {
          key: 'unit_code',
          header: 'Nomor Unit',
          render: (row) => (
            <div>
              <p className="font-display font-bold text-[#173F35]">{row.unit_code}</p>
              <p className="text-xs text-[#5F6B66]">
                {row.block} • Hadap {row.facing || '—'}
              </p>
            </div>
          ),
        },
        {
          key: 'type',
          header: 'Proyek & Tipe',
          render: (row) => (
            <div>
              <p className="font-medium text-[#173F35]">{houseTypeMap[row.house_type_id] ?? '—'}</p>
              <p className="text-xs text-[#5F6B66]">{projectMap[row.project_id] ?? '—'}</p>
            </div>
          ),
        },
        {
          key: 'area',
          header: 'LT / LB',
          render: (row) => (
            <span className="text-xs text-[#242B28]">
              {formatArea(row.land_area)} / {formatArea(row.building_area)}
            </span>
          ),
        },
        {
          key: 'price',
          header: 'Harga Unit',
          render: (row) => (
            <span className="font-semibold text-[#173F35]">{formatCurrency(row.price)}</span>
          ),
        },
        {
          key: 'status',
          header: 'Status',
          render: (row) => {
            const meta = UNIT_STATUS_META[row.status]
            return <Badge variant={meta.variant}>{meta.label}</Badge>
          },
        },
      ]}
      fields={[
        {
          name: 'project_id',
          label: 'Proyek',
          type: 'select',
          required: true,
          options: projects.map((p) => ({ label: p.name, value: p.id })),
        },
        {
          name: 'house_type_id',
          label: 'Tipe Rumah',
          type: 'select',
          required: true,
          options: houseTypes.map((h) => ({ label: `${h.name} (${projectMap[h.project_id] ?? ''})`, value: h.id })),
        },
        { name: 'unit_code', label: 'Nomor Unit', type: 'text', required: true, placeholder: 'SF-B15' },
        { name: 'block', label: 'Blok / Klaster', type: 'text', required: true, placeholder: 'Blok B' },
        { name: 'price', label: 'Harga Unit (Rp)', type: 'number', required: true, min: 0 },
        {
          name: 'status',
          label: 'Status Unit',
          type: 'select',
          required: true,
          defaultValue: 'available',
          options: [
            { label: 'Tersedia (Available)', value: 'available' },
            { label: 'Reserved', value: 'reserved' },
            { label: 'Terjual (Sold)', value: 'sold' },
            { label: 'Nonaktif (Inactive)', value: 'inactive' },
          ],
        },
        { name: 'land_area', label: 'Luas Tanah (m²)', type: 'number', required: true, min: 1 },
        { name: 'building_area', label: 'Luas Bangunan (m²)', type: 'number', required: true, min: 1 },
        { name: 'facing', label: 'Arah Hadap', type: 'text', placeholder: 'Timur / Utara (Hook)' },
        { name: 'notes', label: 'Catatan Internal', type: 'textarea', colSpan: 2 },
      ]}
      fromFormValues={(values, editing) => ({
        project_id: String(values.project_id),
        house_type_id: String(values.house_type_id),
        unit_code: String(values.unit_code).trim().toUpperCase(),
        block: String(values.block).trim(),
        price: Number(values.price || 0),
        land_area: Number(values.land_area || 72),
        building_area: Number(values.building_area || 45),
        facing: String(values.facing || '').trim(),
        status: String(values.status) as UnitRecord['status'],
        assigned_sales_id: editing?.assigned_sales_id ?? 'demo-sales-001',
        notes: String(values.notes || '').trim(),
      })}
      detailFields={[
        { label: 'Nomor Unit', render: (r) => <strong>{r.unit_code}</strong> },
        { label: 'Proyek', render: (r) => projectMap[r.project_id] ?? r.project_id },
        { label: 'Tipe Rumah', render: (r) => houseTypeMap[r.house_type_id] ?? r.house_type_id },
        { label: 'Blok & Hadap', render: (r) => `${r.block} • Hadap ${r.facing || '—'}` },
        { label: 'Dimensi', render: (r) => `LT ${r.land_area} m² / LB ${r.building_area} m²` },
        { label: 'Harga Unit', render: (r) => formatCurrency(r.price) },
        { label: 'Status', render: (r) => <Badge variant={UNIT_STATUS_META[r.status].variant}>{UNIT_STATUS_META[r.status].label}</Badge> },
        { label: 'Catatan', render: (r) => r.notes || '—' },
        { label: 'Diperbarui', render: (r) => formatDateTimeID(r.updated_at) },
      ]}
    />
  )
}
