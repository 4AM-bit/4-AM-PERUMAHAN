import { type ReactNode } from 'react'
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Inbox,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

export interface TableColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
}

export interface TableFilterOption {
  key: string
  label: string
  value: string
  options: Array<{ label: string; value: string }>
  onChange: (value: string) => void
}

interface DataTableProps<T extends { id: string }> {
  title: string
  subtitle?: string
  rows: T[]
  totalCount: number
  columns: TableColumn<T>[]
  isLoading: boolean
  error: string | null
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: TableFilterOption[]
  onResetFilters?: () => void
  hasActiveFilters?: boolean
  page: number
  pageSize: number
  onPageChange: (nextPage: number) => void
  onRetry?: () => void
  onCreate?: () => void
  createLabel?: string
  onView?: (row: T) => void
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
  canDelete?: (row: T) => boolean
  canEdit?: (row: T) => boolean
  extraActions?: (row: T) => ReactNode
  headerExtra?: ReactNode
}

export function DataTable<T extends { id: string }>({
  title,
  subtitle,
  rows,
  totalCount,
  columns,
  isLoading,
  error,
  search,
  onSearchChange,
  searchPlaceholder = 'Cari data...',
  filters = [],
  onResetFilters,
  hasActiveFilters = false,
  page,
  pageSize,
  onPageChange,
  onRetry,
  onCreate,
  createLabel = 'Tambah Data',
  onView,
  onEdit,
  onDelete,
  canDelete,
  canEdit,
  extraActions,
  headerExtra,
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const startItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, totalCount)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#173F35]">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-[#5F6B66]">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {headerExtra}
          {onCreate && (
            <Button variant="primary" size="md" onClick={onCreate}>
              <Plus className="h-4 w-4 text-[#D8B978]" />
              {createLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="rounded-2xl border border-[#E3E0D6] bg-white p-4 shadow-[var(--shadow-card)] flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B66]" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/60 pl-10 pr-3.5 text-sm text-[#242B28] focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {filters.map((filter) => (
            <select
              key={filter.key}
              aria-label={filter.label}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="h-10 rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/60 px-3 text-xs font-medium text-[#173F35] focus:border-[#173F35] focus:bg-white focus:outline-none"
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}

          {hasActiveFilters && onResetFilters && (
            <Button variant="ghost" size="sm" onClick={onResetFilters}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Gagal memuat data</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
          </div>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-3.5 w-3.5" />
              Coba Lagi
            </Button>
          )}
        </div>
      )}

      {/* Table Surface */}
      <div className="overflow-hidden rounded-2xl border border-[#E3E0D6] bg-white shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E3E0D6] bg-[#FAF9F5] text-[11px] font-bold uppercase tracking-wider text-[#5F6B66]">
                {columns.map((col) => (
                  <th key={col.key} className={cn('px-5 py-3.5 whitespace-nowrap', col.className)}>
                    {col.header}
                  </th>
                ))}
                {(onView || onEdit || onDelete || extraActions) && (
                  <th className="px-5 py-3.5 text-right whitespace-nowrap">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E0D6]/70 text-sm">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    {columns.map((col) => (
                      <td key={col.key} className="px-5 py-4">
                        <div className="h-4 w-28 rounded bg-[#ECEAE1]" />
                      </td>
                    ))}
                    <td className="px-5 py-4 text-right">
                      <div className="ml-auto h-4 w-20 rounded bg-[#ECEAE1]" />
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-6 py-16 text-center"
                  >
                    <Inbox className="mx-auto h-10 w-10 text-[#5F6B66]/45" />
                    <p className="mt-3 font-display text-base font-bold text-[#173F35]">
                      Belum ada data yang ditampilkan
                    </p>
                    <p className="mt-1 text-xs text-[#5F6B66]">
                      {hasActiveFilters
                        ? 'Ubah kata kunci pencarian atau reset filter untuk melihat seluruh data.'
                        : 'Klik tombol tambah untuk membuat entri data pertama.'}
                    </p>
                    {hasActiveFilters && onResetFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onResetFilters}
                        className="mt-4"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reset Filter
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const editable = canEdit ? canEdit(row) : true
                  const deletable = canDelete ? canDelete(row) : true
                  return (
                    <tr
                      key={row.id}
                      className="transition-colors hover:bg-[#FAF9F5]/90"
                    >
                      {columns.map((col) => (
                        <td key={col.key} className={cn('px-5 py-4 align-middle', col.className)}>
                          {col.render(row)}
                        </td>
                      ))}
                      {(onView || onEdit || onDelete || extraActions) && (
                        <td className="px-5 py-4 align-middle text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            {extraActions && extraActions(row)}
                            {onView && (
                              <button
                                type="button"
                                onClick={() => onView(row)}
                                title="Lihat Detail"
                                aria-label="Lihat Detail"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E3E0D6] bg-white text-[#173F35] hover:bg-[#F5F4EF] cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {onEdit && editable && (
                              <button
                                type="button"
                                onClick={() => onEdit(row)}
                                title="Edit Data"
                                aria-label="Edit Data"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E3E0D6] bg-white text-[#285C49] hover:bg-[#F5F4EF] cursor-pointer"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                type="button"
                                onClick={() => onDelete(row)}
                                disabled={!deletable}
                                title={
                                  deletable
                                    ? 'Hapus Data (Soft Delete)'
                                    : 'Data terkonfirmasi tidak dapat dihapus'
                                }
                                aria-label="Hapus Data"
                                className={cn(
                                  'flex h-8 w-8 items-center justify-center rounded-lg border bg-white transition-colors',
                                  deletable
                                    ? 'border-red-200 text-red-600 hover:bg-red-50 cursor-pointer'
                                    : 'border-[#E3E0D6] text-[#5F6B66]/40 cursor-not-allowed',
                                )}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E3E0D6] bg-[#FAF9F5] px-5 py-3.5 text-xs text-[#5F6B66]">
          <p>
            Menampilkan <strong className="text-[#173F35]">{startItem}–{endItem}</strong> dari{' '}
            <strong className="text-[#173F35]">{totalCount}</strong> data
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#E3E0D6] bg-white px-2.5 font-medium text-[#173F35] disabled:opacity-45 hover:bg-[#F5F4EF] cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </button>
            <span className="px-2.5 font-semibold text-[#173F35]">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#E3E0D6] bg-white px-2.5 font-medium text-[#173F35] disabled:opacity-45 hover:bg-[#F5F4EF] cursor-pointer disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
