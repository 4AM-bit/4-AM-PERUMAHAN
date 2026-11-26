import { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye, RefreshCw } from 'lucide-react'
import { DataTable } from '@/components/tables/DataTable'
import { Modal } from '@/components/common/Modal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { dashboardService } from '@/services/dashboardService'
import type { ActivityLogRecord } from '@/types/database'
import { formatDateTimeID } from '@/utils/statusBadges'

export function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLogRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [entityFilter, setEntityFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedLog, setSelectedLog] = useState<ActivityLogRecord | null>(null)

  const loadLogs = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const list = await dashboardService.listActivityLogs()
      setLogs(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat activity logs.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadLogs()
  }, [loadLogs])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return logs.filter((item) => {
      const matchSearch =
        !q ||
        item.action.toLowerCase().includes(q) ||
        item.entity_type.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q)
      const matchRole = roleFilter === 'all' || item.actor_role === roleFilter
      const matchEntity = entityFilter === 'all' || item.entity_type === entityFilter
      return matchSearch && matchRole && matchEntity
    })
  }, [logs, search, roleFilter, entityFilter])

  const pageSize = 10
  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page],
  )

  return (
    <>
      <DataTable<ActivityLogRecord>
        title="Activity Logs (Audit Trail)"
        subtitle="Jejak audit kronologis seluruh aksi administrator, verifikasi pembayaran, dan transaksi reservasi (read-only)."
        rows={paginated}
        totalCount={filtered.length}
        isLoading={isLoading}
        error={error}
        search={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        searchPlaceholder="Cari aksi, entitas, atau ringkasan aktivitas..."
        filters={[
          {
            key: 'role',
            label: 'Peran Aktor',
            value: roleFilter,
            options: [
              { label: 'Semua Peran', value: 'all' },
              { label: 'Super Admin', value: 'super_admin' },
              { label: 'Admin', value: 'admin' },
              { label: 'Sales', value: 'sales' },
              { label: 'Customer', value: 'customer' },
            ],
            onChange: (val) => {
              setRoleFilter(val)
              setPage(1)
            },
          },
          {
            key: 'entity',
            label: 'Entitas',
            value: entityFilter,
            options: [
              { label: 'Semua Entitas', value: 'all' },
              { label: 'Reservation', value: 'reservation' },
              { label: 'Payment', value: 'payment' },
              { label: 'Projects', value: 'projects' },
              { label: 'Units', value: 'units' },
              { label: 'Profiles', value: 'profiles' },
              { label: 'App Settings', value: 'app_settings' },
            ],
            onChange: (val) => {
              setEntityFilter(val)
              setPage(1)
            },
          },
        ]}
        hasActiveFilters={search.trim() !== '' || roleFilter !== 'all' || entityFilter !== 'all'}
        onResetFilters={() => {
          setSearch('')
          setRoleFilter('all')
          setEntityFilter('all')
        }}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onRetry={() => void loadLogs()}
        headerExtra={
          <Button variant="outline" size="sm" onClick={() => void loadLogs()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        }
        columns={[
          {
            key: 'time',
            header: 'Waktu',
            render: (row) => (
              <span className="text-xs text-[#5F6B66] whitespace-nowrap">
                {formatDateTimeID(row.created_at)}
              </span>
            ),
          },
          {
            key: 'action',
            header: 'Aksi & Entitas',
            render: (row) => (
              <div>
                <code className="font-mono text-xs font-bold text-[#173F35]">
                  {row.action}
                </code>
                <p className="text-[11px] text-[#5F6B66]">{row.entity_type}</p>
              </div>
            ),
          },
          {
            key: 'role',
            header: 'Peran',
            render: (row) => (
              <Badge variant={row.actor_role === 'super_admin' ? 'forest' : 'default'}>
                {row.actor_role ?? 'system'}
              </Badge>
            ),
          },
          {
            key: 'summary',
            header: 'Ringkasan',
            render: (row) => (
              <p className="text-xs text-[#242B28] max-w-md line-clamp-2">{row.summary}</p>
            ),
          },
        ]}
        extraActions={(row) => (
          <Button variant="outline" size="sm" onClick={() => setSelectedLog(row)}>
            <Eye className="h-3.5 w-3.5" />
            Metadata
          </Button>
        )}
      />

      <Modal
        open={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Detail Audit Log"
        subtitle={selectedLog?.action}
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <dl className="divide-y divide-[#E3E0D6] rounded-xl border border-[#E3E0D6]">
              <div className="flex justify-between px-4 py-2.5">
                <dt className="font-semibold text-[#173F35]">Log ID</dt>
                <dd className="font-mono">{selectedLog.id}</dd>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <dt className="font-semibold text-[#173F35]">Waktu</dt>
                <dd>{formatDateTimeID(selectedLog.created_at)}</dd>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <dt className="font-semibold text-[#173F35]">Aktor &amp; Role</dt>
                <dd>
                  {selectedLog.actor_role ?? 'system'} ({selectedLog.actor_id ?? '—'})
                </dd>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <dt className="font-semibold text-[#173F35]">Entitas</dt>
                <dd>
                  {selectedLog.entity_type} ({selectedLog.entity_id ?? '—'})
                </dd>
              </div>
            </dl>
            <div>
              <p className="font-semibold text-[#173F35] mb-1.5">Metadata JSON</p>
              <pre className="rounded-xl bg-[#102D26] p-4 text-[11px] text-[#EFE3C6] overflow-x-auto">
                {JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
