import { type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Modal } from '@/components/common/Modal'
import {
  DataTable,
  type TableColumn,
  type TableFilterOption,
} from '@/components/tables/DataTable'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { crudService, type CrudEntityKey } from '@/services/crudStore'
import { cn } from '@/utils/cn'

export type FieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'date'
  | 'textarea'
  | 'select'
  | 'checkbox'

export interface CrudFieldDef {
  name: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  options?: Array<{ label: string; value: string }>
  min?: number
  max?: number
  pattern?: RegExp
  patternMessage?: string
  defaultValue?: string | number | boolean
  colSpan?: 1 | 2
  readOnlyOnEdit?: boolean
  helperText?: string
}

export interface CrudFilterDef<T> {
  key: string
  label: string
  options: Array<{ label: string; value: string }>
  predicate: (row: T, selectedValue: string) => boolean
}

export interface CrudDetailField<T> {
  label: string
  render: (row: T) => ReactNode
}

interface CrudPageShellProps<T extends { id: string; deleted_at?: string | null }> {
  entityKey: CrudEntityKey
  title: string
  subtitle: string
  singularName: string
  columns: TableColumn<T>[]
  fields: CrudFieldDef[]
  detailFields: CrudDetailField<T>[]
  searchPlaceholder: string
  searchFields: (row: T) => string[]
  filters?: CrudFilterDef<T>[]
  rowScope?: (rows: T[]) => T[]
  getSummaryLabel: (row: Partial<T>) => string
  toFormValues?: (row: T) => Record<string, string | number | boolean>
  fromFormValues?: (
    values: Record<string, string | number | boolean>,
    editingRow: T | null,
  ) => Record<string, unknown>
  allowCreate?: boolean
  allowEdit?: boolean
  allowDelete?: boolean
  canEdit?: (row: T) => boolean
  canDelete?: (row: T) => boolean
  extraActions?: (row: T, refresh: () => void) => ReactNode
  headerExtra?: ReactNode
  pageSize?: number
}

export function CrudPageShell<T extends { id: string; deleted_at?: string | null }>({
  entityKey,
  title,
  subtitle,
  singularName,
  columns,
  fields,
  detailFields,
  searchPlaceholder,
  searchFields,
  filters = [],
  rowScope,
  getSummaryLabel,
  toFormValues,
  fromFormValues,
  allowCreate = true,
  allowEdit = true,
  allowDelete = true,
  canEdit,
  canDelete,
  extraActions,
  headerExtra,
  pageSize = 6,
}: CrudPageShellProps<T>) {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [rows, setRows] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(filters.map((f) => [f.key, 'all'])),
  )
  const [page, setPage] = useState(1)

  const [viewingRow, setViewingRow] = useState<T | null>(null)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<T | null>(null)
  const [formState, setFormState] = useState<Record<string, string | number | boolean>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  const [deletingRow, setDeletingRow] = useState<T | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadRows = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const list = await crudService.list<T>(entityKey)
      setRows(rowScope ? rowScope(list) : list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data.')
    } finally {
      setIsLoading(false)
    }
  }, [entityKey, rowScope])

  useEffect(() => {
    void loadRows()
  }, [loadRows])

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((row) => {
      const matchesSearch =
        !q || searchFields(row).some((val) => val.toLowerCase().includes(q))
      const matchesFilters = filters.every((f) => {
        const val = filterValues[f.key] ?? 'all'
        return val === 'all' || f.predicate(row, val)
      })
      return matchesSearch && matchesFilters
    })
  }, [rows, search, searchFields, filters, filterValues])

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredRows.slice(start, start + pageSize)
  }, [filteredRows, page, pageSize])

  useEffect(() => {
    setPage(1)
  }, [search, filterValues])

  const hasActiveFilters =
    search.trim() !== '' || Object.values(filterValues).some((v) => v !== 'all')

  const openCreateModal = () => {
    const defaults: Record<string, string | number | boolean> = {}
    for (const f of fields) {
      if (f.defaultValue !== undefined) {
        defaults[f.name] = f.defaultValue
      } else if (f.type === 'checkbox') {
        defaults[f.name] = true
      } else if (f.type === 'select') {
        defaults[f.name] = f.options?.[0]?.value ?? ''
      } else {
        defaults[f.name] = ''
      }
    }
    setEditingRow(null)
    setFormState(defaults)
    setFormErrors({})
    setFormModalOpen(true)
  }

  const openEditModal = (row: T) => {
    const values = toFormValues
      ? toFormValues(row)
      : Object.fromEntries(
          fields.map((f) => {
            const raw = (row as unknown as Record<string, unknown>)[f.name]
            if (f.type === 'checkbox') return [f.name, Boolean(raw)]
            return [f.name, raw === null || raw === undefined ? '' : String(raw)]
          }),
        )
    setEditingRow(row)
    setFormState(values)
    setFormErrors({})
    setFormModalOpen(true)
  }

  const validateForm = (): boolean => {
    const nextErrors: Record<string, string> = {}
    for (const f of fields) {
      const val = formState[f.name]
      const strVal = String(val ?? '').trim()

      if (f.required && f.type !== 'checkbox' && strVal === '') {
        nextErrors[f.name] = `${f.label} wajib diisi.`
        continue
      }

      if (f.type === 'email' && strVal !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strVal)) {
        nextErrors[f.name] = 'Format email tidak valid.'
        continue
      }

      if (f.type === 'number' && strVal !== '') {
        const num = Number(strVal)
        if (Number.isNaN(num)) {
          nextErrors[f.name] = `${f.label} harus berupa angka.`
          continue
        }
        if (f.min !== undefined && num < f.min) {
          nextErrors[f.name] = `${f.label} minimal ${f.min}.`
          continue
        }
        if (f.max !== undefined && num > f.max) {
          nextErrors[f.name] = `${f.label} maksimal ${f.max}.`
          continue
        }
      }

      if (f.pattern && strVal !== '' && !f.pattern.test(strVal)) {
        nextErrors[f.name] = f.patternMessage ?? `Format ${f.label} tidak sesuai.`
      }
    }

    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSave = async (event: FormEvent) => {
    event.preventDefault()
    if (!validateForm() || !user) return

    setIsSaving(true)
    try {
      const payload = fromFormValues
        ? fromFormValues(formState, editingRow)
        : Object.fromEntries(
            fields.map((f) => {
              const raw = formState[f.name]
              if (f.type === 'number') return [f.name, Number(raw || 0)]
              if (f.type === 'checkbox') return [f.name, Boolean(raw)]
              return [f.name, String(raw ?? '').trim()]
            }),
          )

      const summary = getSummaryLabel(payload as Partial<T>)
      const actor = { id: user.id, role: user.role, fullName: user.fullName }

      if (editingRow) {
        await crudService.update<T>(entityKey, editingRow.id, payload as Partial<T>, actor, summary)
        showToast({
          variant: 'success',
          title: `${singularName} Diperbarui`,
          description: `Perubahan pada ${summary} berhasil disimpan.`,
        })
      } else {
        await crudService.create<T>(
          entityKey,
          payload as Omit<T, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>,
          actor,
          summary,
        )
        showToast({
          variant: 'success',
          title: `${singularName} Ditambahkan`,
          description: `${summary} berhasil ditambahkan ke sistem.`,
        })
      }

      setFormModalOpen(false)
      await loadRows()
    } catch (err) {
      showToast({
        variant: 'error',
        title: `Gagal Menyimpan ${singularName}`,
        description: err instanceof Error ? err.message : 'Terjadi kesalahan.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingRow || !user) return
    setIsDeleting(true)
    try {
      const summary = getSummaryLabel(deletingRow)
      await crudService.softDelete(
        entityKey,
        deletingRow.id,
        { id: user.id, role: user.role, fullName: user.fullName },
        summary,
      )
      showToast({
        variant: 'success',
        title: `${singularName} Dihapus`,
        description: `${summary} berhasil diarsipkan (soft delete).`,
      })
      setDeletingRow(null)
      await loadRows()
    } catch (err) {
      showToast({
        variant: 'error',
        title: `Tidak Dapat Menghapus ${singularName}`,
        description: err instanceof Error ? err.message : 'Terjadi kesalahan.',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const tableFilters: TableFilterOption[] = filters.map((f) => ({
    key: f.key,
    label: f.label,
    value: filterValues[f.key] ?? 'all',
    options: f.options,
    onChange: (val) => setFilterValues((prev) => ({ ...prev, [f.key]: val })),
  }))

  return (
    <>
      <DataTable
        title={title}
        subtitle={subtitle}
        rows={paginatedRows}
        totalCount={filteredRows.length}
        columns={columns}
        isLoading={isLoading}
        error={error}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={searchPlaceholder}
        filters={tableFilters}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={() => {
          setSearch('')
          setFilterValues(Object.fromEntries(filters.map((f) => [f.key, 'all'])))
        }}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onRetry={() => void loadRows()}
        onCreate={allowCreate ? openCreateModal : undefined}
        createLabel={`Tambah ${singularName}`}
        onView={(row) => setViewingRow(row)}
        onEdit={allowEdit ? openEditModal : undefined}
        onDelete={allowDelete ? (row) => setDeletingRow(row) : undefined}
        canEdit={canEdit}
        canDelete={canDelete}
        extraActions={
          extraActions ? (row) => extraActions(row, () => void loadRows()) : undefined
        }
        headerExtra={headerExtra}
      />

      {/* Detail Modal */}
      <Modal
        open={Boolean(viewingRow)}
        onClose={() => setViewingRow(null)}
        title={`Detail ${singularName}`}
        subtitle={viewingRow ? getSummaryLabel(viewingRow) : undefined}
        size="lg"
      >
        {viewingRow && (
          <div className="divide-y divide-[#E3E0D6]/80 rounded-xl border border-[#E3E0D6]">
            {detailFields.map((field) => (
              <div
                key={field.label}
                className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 px-4 py-3 text-sm odd:bg-[#FAF9F5]/70"
              >
                <span className="sm:col-span-4 font-semibold text-[#173F35]">
                  {field.label}
                </span>
                <div className="sm:col-span-8 text-[#242B28] break-words">
                  {field.render(viewingRow)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Create / Edit Modal */}
      <Modal
        open={formModalOpen}
        onClose={() => !isSaving && setFormModalOpen(false)}
        title={editingRow ? `Edit ${singularName}` : `Tambah ${singularName} Baru`}
        subtitle="Lengkapi kolom di bawah sesuai standar validasi sistem."
        size="lg"
      >
        <form onSubmit={handleSave} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((field) => {
              const disabled = Boolean(editingRow && field.readOnlyOnEdit)
              const err = formErrors[field.name]
              const colClass = field.colSpan === 2 ? 'sm:col-span-2' : ''

              if (field.type === 'checkbox') {
                return (
                  <div key={field.name} className={cn('pt-1', colClass)}>
                    <label className="flex items-center gap-2.5 text-sm font-medium text-[#173F35] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(formState[field.name])}
                        disabled={disabled}
                        onChange={(e) =>
                          setFormState((prev) => ({
                            ...prev,
                            [field.name]: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-[#E3E0D6] accent-[#173F35]"
                      />
                      <span>{field.label}</span>
                    </label>
                    {field.helperText && (
                      <p className="mt-1 text-xs text-[#5F6B66]">{field.helperText}</p>
                    )}
                  </div>
                )
              }

              return (
                <div key={field.name} className={colClass}>
                  <label
                    htmlFor={`crud-${field.name}`}
                    className="block text-xs font-semibold text-[#173F35] mb-1.5"
                  >
                    {field.label} {field.required && <span className="text-red-600">*</span>}
                  </label>

                  {field.type === 'textarea' ? (
                    <textarea
                      id={`crud-${field.name}`}
                      rows={3}
                      disabled={disabled}
                      placeholder={field.placeholder}
                      value={String(formState[field.name] ?? '')}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, [field.name]: e.target.value }))
                      }
                      className={cn(
                        'w-full rounded-xl border bg-[#F5F4EF]/40 p-3 text-sm focus:bg-white focus:outline-none focus:ring-2',
                        err
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-[#E3E0D6] focus:border-[#173F35] focus:ring-[#173F35]/15',
                      )}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={`crud-${field.name}`}
                      disabled={disabled}
                      value={String(formState[field.name] ?? '')}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, [field.name]: e.target.value }))
                      }
                      className={cn(
                        'h-11 w-full rounded-xl border bg-[#F5F4EF]/40 px-3 text-sm focus:bg-white focus:outline-none focus:ring-2',
                        err
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-[#E3E0D6] focus:border-[#173F35] focus:ring-[#173F35]/15',
                      )}
                    >
                      {(field.options ?? []).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`crud-${field.name}`}
                      type={field.type}
                      disabled={disabled}
                      placeholder={field.placeholder}
                      value={String(formState[field.name] ?? '')}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, [field.name]: e.target.value }))
                      }
                      className={cn(
                        'h-11 w-full rounded-xl border bg-[#F5F4EF]/40 px-3.5 text-sm focus:bg-white focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed',
                        err
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-[#E3E0D6] focus:border-[#173F35] focus:ring-[#173F35]/15',
                      )}
                    />
                  )}

                  {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
                  {!err && field.helperText && (
                    <p className="mt-1 text-[11px] text-[#5F6B66]">{field.helperText}</p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E3E0D6]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFormModalOpen(false)}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
              {isSaving
                ? 'Menyimpan...'
                : editingRow
                  ? 'Simpan Perubahan'
                  : `Tambah ${singularName}`}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Soft-Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingRow)}
        title={`Hapus ${singularName}?`}
        description={`Anda akan menghapus ${deletingRow ? getSummaryLabel(deletingRow) : 'data ini'} dari daftar aktif.`}
        isLoading={isDeleting}
        onCancel={() => !isDeleting && setDeletingRow(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </>
  )
}
