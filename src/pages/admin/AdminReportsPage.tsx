import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  Building2,
  CreditCard,
  Download,
  FileCheck2,
  Home,
  Loader2,
  RefreshCw,
  RotateCcw,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/contexts/ToastContext'
import {
  isWithinDateRange,
  reportService,
  type ReportDataset,
  type ReportType,
} from '@/services/reportService'
import { downloadCsv } from '@/utils/csv'
import { formatArea, formatCurrency } from '@/utils/format'
import {
  formatDateTimeID,
  PAYMENT_STATUS_META,
  RESERVATION_STATUS_META,
  UNIT_STATUS_META,
} from '@/utils/statusBadges'
import { cn } from '@/utils/cn'

const REPORT_TABS: Array<{ id: ReportType; label: string; icon: typeof BarChart3 }> = [
  { id: 'reservations', label: 'Laporan Reservasi', icon: FileCheck2 },
  { id: 'payments', label: 'Laporan Pembayaran', icon: CreditCard },
  { id: 'sales', label: 'Laporan Penjualan', icon: BarChart3 },
  { id: 'available_units', label: 'Unit Tersedia', icon: Home },
  { id: 'customers', label: 'Laporan Pelanggan', icon: Users },
]

export function AdminReportsPage() {
  const { showToast } = useToast()

  const [dataset, setDataset] = useState<ReportDataset | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeReport, setActiveReport] = useState<ReportType>('reservations')
  const [projectId, setProjectId] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await reportService.loadDataset()
      setDataset(data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const projectMap = useMemo(
    () => Object.fromEntries((dataset?.projects ?? []).map((p) => [p.id, p.name])),
    [dataset],
  )
  const houseTypeMap = useMemo(
    () => Object.fromEntries((dataset?.houseTypes ?? []).map((h) => [h.id, h.name])),
    [dataset],
  )
  const unitMap = useMemo(
    () => Object.fromEntries((dataset?.units ?? []).map((u) => [u.id, u.unit_code])),
    [dataset],
  )

  const filteredReservations = useMemo(() => {
    if (!dataset) return []
    return dataset.reservations.filter(
      (r) =>
        (projectId === 'all' || r.project_id === projectId) &&
        isWithinDateRange(r.created_at, startDate, endDate),
    )
  }, [dataset, projectId, startDate, endDate])

  const filteredSales = useMemo(
    () =>
      filteredReservations.filter(
        (r) => r.status === 'confirmed' || r.status === 'completed',
      ),
    [filteredReservations],
  )

  const filteredPayments = useMemo(() => {
    if (!dataset) return []
    const rsvProjMap = Object.fromEntries(
      dataset.reservations.map((r) => [r.id, r.project_id]),
    )
    return dataset.payments.filter(
      (p) =>
        (projectId === 'all' || rsvProjMap[p.reservation_id] === projectId) &&
        isWithinDateRange(p.created_at, startDate, endDate),
    )
  }, [dataset, projectId, startDate, endDate])

  const filteredAvailableUnits = useMemo(() => {
    if (!dataset) return []
    return dataset.units.filter(
      (u) =>
        u.status === 'available' &&
        (projectId === 'all' || u.project_id === projectId),
    )
  }, [dataset, projectId])

  const filteredCustomers = useMemo(() => {
    if (!dataset) return []
    return dataset.customers.filter((c) =>
      isWithinDateRange(c.created_at, startDate, endDate),
    )
  }, [dataset, startDate, endDate])

  const customerRsvCount = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of dataset?.reservations ?? []) {
      counts[r.customer_id] = (counts[r.customer_id] ?? 0) + 1
    }
    return counts
  }, [dataset])

  const handleExportCsv = () => {
    const stamp = new Date().toISOString().slice(0, 10)

    if (activeReport === 'reservations') {
      downloadCsv(
        `laporan-reservasi-${stamp}.csv`,
        ['No Reservasi', 'Tanggal', 'Pelanggan', 'Email', 'HP', 'Proyek', 'Tipe', 'Unit', 'Harga Unit', 'Booking Fee', 'Status'],
        filteredReservations.map((r) => [
          r.reservation_number,
          r.created_at.slice(0, 10),
          r.customer_name,
          r.customer_email,
          r.customer_phone,
          projectMap[r.project_id] ?? '',
          houseTypeMap[r.house_type_id] ?? '',
          unitMap[r.unit_id] ?? '',
          r.unit_price,
          r.booking_fee,
          r.status,
        ]),
      )
    } else if (activeReport === 'payments') {
      downloadCsv(
        `laporan-pembayaran-${stamp}.csv`,
        ['No Reservasi', 'Pelanggan', 'Proyek', 'Unit', 'Bank Tujuan', 'Bank Pengirim', 'Nama Pengirim', 'Tanggal Transfer', 'Nominal', 'Status'],
        filteredPayments.map((p) => [
          p.reservationNumber,
          p.customerName,
          p.projectName,
          p.unitCode,
          p.targetBankName,
          p.sender_bank,
          p.sender_name,
          p.payment_date ?? '',
          p.amount,
          p.status,
        ]),
      )
    } else if (activeReport === 'sales') {
      downloadCsv(
        `laporan-penjualan-${stamp}.csv`,
        ['No Reservasi', 'Pelanggan', 'Proyek', 'Tipe', 'Unit', 'Harga Penjualan', 'Booking Fee', 'Status', 'Tanggal Konfirmasi'],
        filteredSales.map((s) => [
          s.reservation_number,
          s.customer_name,
          projectMap[s.project_id] ?? '',
          houseTypeMap[s.house_type_id] ?? '',
          unitMap[s.unit_id] ?? '',
          s.unit_price,
          s.booking_fee,
          s.status,
          s.confirmed_at?.slice(0, 10) ?? '',
        ]),
      )
    } else if (activeReport === 'available_units') {
      downloadCsv(
        `laporan-unit-tersedia-${stamp}.csv`,
        ['Proyek', 'Tipe Rumah', 'Nomor Unit', 'Blok', 'Hadap', 'Luas Tanah (m2)', 'Luas Bangunan (m2)', 'Harga Unit', 'Status'],
        filteredAvailableUnits.map((u) => [
          projectMap[u.project_id] ?? '',
          houseTypeMap[u.house_type_id] ?? '',
          u.unit_code,
          u.block,
          u.facing,
          u.land_area,
          u.building_area,
          u.price,
          u.status,
        ]),
      )
    } else {
      downloadCsv(
        `laporan-pelanggan-${stamp}.csv`,
        ['Nama Lengkap', 'Email', 'WhatsApp', 'NIK', 'Alamat', 'Total Reservasi', 'Status Akun', 'Terdaftar'],
        filteredCustomers.map((c) => [
          c.full_name,
          c.email,
          c.phone,
          c.nik ?? '',
          c.address,
          customerRsvCount[c.id] ?? 0,
          c.is_active ? 'Aktif' : 'Nonaktif',
          c.created_at.slice(0, 10),
        ]),
      )
    }

    showToast({
      variant: 'success',
      title: 'Ekspor CSV Berhasil',
      description: 'File laporan CSV telah diunduh ke perangkat Anda.',
    })
  }

  const summary = useMemo(() => {
    if (activeReport === 'reservations') {
      const totalFee = filteredReservations.reduce((s, r) => s + r.booking_fee, 0)
      return { count: filteredReservations.length, metricLabel: 'Total Booking Fee', metricValue: formatCurrency(totalFee) }
    }
    if (activeReport === 'payments') {
      const verifiedTotal = filteredPayments
        .filter((p) => p.status === 'verified')
        .reduce((s, p) => s + p.amount, 0)
      return { count: filteredPayments.length, metricLabel: 'Nominal Terverifikasi', metricValue: formatCurrency(verifiedTotal) }
    }
    if (activeReport === 'sales') {
      const totalSales = filteredSales.reduce((s, r) => s + r.unit_price, 0)
      return { count: filteredSales.length, metricLabel: 'Total Nilai Penjualan', metricValue: formatCurrency(totalSales) }
    }
    if (activeReport === 'available_units') {
      const totalInventory = filteredAvailableUnits.reduce((s, u) => s + u.price, 0)
      return { count: filteredAvailableUnits.length, metricLabel: 'Nilai Inventaris Tersedia', metricValue: formatCurrency(totalInventory) }
    }
    return {
      count: filteredCustomers.length,
      metricLabel: 'Akun Pelanggan Aktif',
      metricValue: `${filteredCustomers.filter((c) => c.is_active).length} Akun`,
    }
  }, [
    activeReport,
    filteredReservations,
    filteredPayments,
    filteredSales,
    filteredAvailableUnits,
    filteredCustomers,
  ])

  const resetFilters = () => {
    setProjectId('all')
    setStartDate('')
    setEndDate('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#285C49]">
            Pelaporan &amp; Analitik Bisnis
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-[#173F35]">
            Laporan Operasional &amp; Ekspor CSV
          </h1>
          <p className="mt-1 text-sm text-[#5F6B66]">
            Filter laporan berdasarkan periode tanggal dan proyek, lalu ekspor ke format CSV
            siap olah di Excel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => void loadData()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button variant="primary" size="md" onClick={handleExportCsv} disabled={isLoading}>
            <Download className="h-4 w-4 text-[#D8B978]" />
            Ekspor CSV
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex flex-wrap gap-2">
        {REPORT_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveReport(id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer',
              activeReport === id
                ? 'bg-[#173F35] text-white shadow-xs'
                : 'bg-white border border-[#E3E0D6] text-[#5F6B66] hover:text-[#173F35]',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Filters & Summary Strip */}
      <div className="rounded-2xl border border-[#E3E0D6] bg-white p-5 shadow-[var(--shadow-card)] grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
        <div className="lg:col-span-3">
          <label htmlFor="rep-proj" className="block text-xs font-semibold text-[#5F6B66] mb-1.5">
            Filter Proyek
          </label>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B66]" />
            <select
              id="rep-proj"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={activeReport === 'customers'}
              className="h-10 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/60 pl-9 pr-3 text-xs font-medium text-[#173F35] disabled:opacity-50"
            >
              <option value="all">Semua Proyek</option>
              {(dataset?.projects ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="rep-start" className="block text-xs font-semibold text-[#5F6B66] mb-1.5">
            Dari Tanggal
          </label>
          <input
            id="rep-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={activeReport === 'available_units'}
            className="h-10 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/60 px-3 text-xs text-[#173F35] disabled:opacity-50"
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="rep-end" className="block text-xs font-semibold text-[#5F6B66] mb-1.5">
            Sampai Tanggal
          </label>
          <input
            id="rep-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={activeReport === 'available_units'}
            className="h-10 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/60 px-3 text-xs text-[#173F35] disabled:opacity-50"
          />
        </div>

        <div className="lg:col-span-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            disabled={projectId === 'all' && !startDate && !endDate}
            className="h-10 w-full"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>

        <div className="lg:col-span-3 rounded-xl bg-[#173F35] px-4 py-2.5 text-white">
          <p className="text-[10px] uppercase tracking-wider text-white/70">
            {summary.metricLabel} ({summary.count} baris)
          </p>
          <p className="font-display text-base font-extrabold text-[#D8B978] truncate">
            {summary.metricValue}
          </p>
        </div>
      </div>

      {/* Report Data Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E3E0D6] bg-white shadow-[var(--shadow-card)]">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-[#173F35]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            {activeReport === 'reservations' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E3E0D6] bg-[#FAF9F5] uppercase text-[#5F6B66]">
                    <th className="px-4 py-3.5">No. Reservasi</th>
                    <th className="px-4 py-3.5">Pelanggan</th>
                    <th className="px-4 py-3.5">Proyek &amp; Unit</th>
                    <th className="px-4 py-3.5">Booking Fee</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E0D6]/70">
                  {filteredReservations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-[#5F6B66]">
                        Tidak ada data reservasi pada periode/proyek ini.
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 font-mono font-bold text-[#173F35]">{r.reservation_number}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#173F35]">{r.customer_name}</p>
                          <p className="text-[#5F6B66]">{r.customer_phone}</p>
                        </td>
                        <td className="px-4 py-3">
                          {unitMap[r.unit_id] ?? '—'} • {projectMap[r.project_id] ?? '—'}
                        </td>
                        <td className="px-4 py-3 font-bold text-[#173F35]">{formatCurrency(r.booking_fee)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={RESERVATION_STATUS_META[r.status].variant}>
                            {RESERVATION_STATUS_META[r.status].label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-[#5F6B66]">{formatDateTimeID(r.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeReport === 'payments' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E3E0D6] bg-[#FAF9F5] uppercase text-[#5F6B66]">
                    <th className="px-4 py-3.5">Reservasi</th>
                    <th className="px-4 py-3.5">Pelanggan &amp; Pengirim</th>
                    <th className="px-4 py-3.5">Rekening Tujuan</th>
                    <th className="px-4 py-3.5">Nominal</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Tgl Transfer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E0D6]/70">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-[#5F6B66]">
                        Tidak ada data pembayaran pada periode/proyek ini.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-3 font-mono font-bold text-[#173F35]">{p.reservationNumber}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#173F35]">{p.customerName}</p>
                          <p className="text-[#5F6B66]">{p.sender_bank || '—'} • {p.sender_name || '—'}</p>
                        </td>
                        <td className="px-4 py-3">{p.targetBankName}</td>
                        <td className="px-4 py-3 font-bold text-[#285C49]">{formatCurrency(p.amount)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={PAYMENT_STATUS_META[p.status].variant}>
                            {PAYMENT_STATUS_META[p.status].label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-[#5F6B66]">{p.payment_date || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeReport === 'sales' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E3E0D6] bg-[#FAF9F5] uppercase text-[#5F6B66]">
                    <th className="px-4 py-3.5">No. Reservasi</th>
                    <th className="px-4 py-3.5">Pembeli</th>
                    <th className="px-4 py-3.5">Proyek / Tipe / Unit</th>
                    <th className="px-4 py-3.5">Nilai Penjualan</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Tgl Konfirmasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E0D6]/70">
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-[#5F6B66]">
                        Belum ada penjualan terkonfirmasi pada periode/proyek ini.
                      </td>
                    </tr>
                  ) : (
                    filteredSales.map((s) => (
                      <tr key={s.id}>
                        <td className="px-4 py-3 font-mono font-bold text-[#173F35]">{s.reservation_number}</td>
                        <td className="px-4 py-3 font-semibold text-[#173F35]">{s.customer_name}</td>
                        <td className="px-4 py-3">
                          {projectMap[s.project_id] ?? '—'} • {houseTypeMap[s.house_type_id] ?? '—'} ({unitMap[s.unit_id] ?? '—'})
                        </td>
                        <td className="px-4 py-3 font-bold text-[#173F35]">{formatCurrency(s.unit_price)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={RESERVATION_STATUS_META[s.status].variant}>
                            {RESERVATION_STATUS_META[s.status].label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-[#5F6B66]">{formatDateTimeID(s.confirmed_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeReport === 'available_units' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E3E0D6] bg-[#FAF9F5] uppercase text-[#5F6B66]">
                    <th className="px-4 py-3.5">Unit &amp; Blok</th>
                    <th className="px-4 py-3.5">Proyek</th>
                    <th className="px-4 py-3.5">Tipe Rumah</th>
                    <th className="px-4 py-3.5">LT / LB</th>
                    <th className="px-4 py-3.5">Harga Unit</th>
                    <th className="px-4 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E0D6]/70">
                  {filteredAvailableUnits.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-[#5F6B66]">
                        Tidak ada unit tersedia untuk proyek ini.
                      </td>
                    </tr>
                  ) : (
                    filteredAvailableUnits.map((u) => (
                      <tr key={u.id}>
                        <td className="px-4 py-3 font-bold text-[#173F35]">
                          {u.unit_code} ({u.block})
                        </td>
                        <td className="px-4 py-3">{projectMap[u.project_id] ?? '—'}</td>
                        <td className="px-4 py-3">{houseTypeMap[u.house_type_id] ?? '—'}</td>
                        <td className="px-4 py-3">
                          {formatArea(u.land_area)} / {formatArea(u.building_area)}
                        </td>
                        <td className="px-4 py-3 font-bold text-[#173F35]">{formatCurrency(u.price)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={UNIT_STATUS_META[u.status].variant}>
                            {UNIT_STATUS_META[u.status].label}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeReport === 'customers' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E3E0D6] bg-[#FAF9F5] uppercase text-[#5F6B66]">
                    <th className="px-4 py-3.5">Pelanggan</th>
                    <th className="px-4 py-3.5">WhatsApp</th>
                    <th className="px-4 py-3.5">NIK</th>
                    <th className="px-4 py-3.5">Total Reservasi</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Terdaftar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E0D6]/70">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-[#5F6B66]">
                        Belum ada pelanggan terdaftar pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c) => (
                      <tr key={c.id}>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#173F35]">{c.full_name}</p>
                          <p className="text-[#5F6B66]">{c.email}</p>
                        </td>
                        <td className="px-4 py-3">{c.phone || '—'}</td>
                        <td className="px-4 py-3 font-mono">{c.nik || '—'}</td>
                        <td className="px-4 py-3 font-bold text-[#173F35]">
                          {customerRsvCount[c.id] ?? 0}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={c.is_active ? 'emerald' : 'muted'}>
                            {c.is_active ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-[#5F6B66]">{formatDateTimeID(c.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
