import { useCallback, useEffect, useState } from 'react'
import {
  Activity,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  FileCheck2,
  Home,
  KeyRound,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Users,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import {
  dashboardService,
  type AdminDashboardMetrics,
} from '@/services/dashboardService'
import { getRoleLabel } from '@/types/auth'
import { formatCompactPrice, formatCurrency } from '@/utils/format'
import { formatDateTimeID } from '@/utils/statusBadges'

export function AdminOverviewPage() {
  const { user, isSupabaseAuth } = useAuth()
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadMetrics = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await dashboardService.getAdminMetrics()
      setMetrics(data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadMetrics()
  }, [loadMetrics])

  if (isLoading && !metrics) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#173F35]" />
        <p className="text-sm text-[#5F6B66]">Memuat metrik bisnis &amp; grafik dashboard...</p>
      </div>
    )
  }

  const m = metrics ?? {
    totalProjects: 0,
    totalUnits: 0,
    availableUnits: 0,
    reservedUnits: 0,
    soldUnits: 0,
    totalCustomers: 0,
    totalReservations: 0,
    pendingVerificationPayments: 0,
    totalVerifiedBookingRevenue: 0,
    totalConfirmedSalesValue: 0,
    monthlySeries: [],
    unitDistribution: [],
    recentLogs: [],
  }

  const kpiCards = [
    { label: 'Total Proyek', value: m.totalProjects, sub: 'Kawasan aktif', icon: Building2, tone: 'text-[#173F35]' },
    { label: 'Total Unit', value: m.totalUnits, sub: 'Seluruh inventaris', icon: Home, tone: 'text-[#173F35]' },
    { label: 'Unit Tersedia', value: m.availableUnits, sub: 'Siap direservasi', icon: CheckCircle2, tone: 'text-[#285C49]' },
    { label: 'Unit Reserved', value: m.reservedUnits, sub: 'Sedang terkunci', icon: Clock, tone: 'text-[#B5924C]' },
    { label: 'Unit Terjual', value: m.soldUnits, sub: 'Akad / PPJB selesai', icon: KeyRound, tone: 'text-[#173F35]' },
    { label: 'Total Pelanggan', value: m.totalCustomers, sub: 'Akun terdaftar', icon: Users, tone: 'text-[#173F35]' },
    { label: 'Total Reservasi', value: m.totalReservations, sub: 'Seluruh transaksi', icon: FileCheck2, tone: 'text-[#285C49]' },
    {
      label: 'Menunggu Verifikasi',
      value: m.pendingVerificationPayments,
      sub: 'Bukti transfer masuk',
      icon: CreditCard,
      tone: m.pendingVerificationPayments > 0 ? 'text-amber-700' : 'text-[#173F35]',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="rounded-2xl bg-[#173F35] p-6 sm:p-7 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="gold"
              className="bg-[#D8B978]/20 text-[#EFE3C6] border-[#D8B978]/40"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#D8B978]" />
              {user ? getRoleLabel(user.role) : 'Staff'}
            </Badge>
            <Badge
              variant="emerald"
              className="bg-white/10 text-white border-white/15"
            >
              {isSupabaseAuth ? 'Live Supabase PostgreSQL' : 'Mode Demo Lokal'}
            </Badge>
          </div>
          <h1 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold">
            Dashboard Overview PERUMAHAN
          </h1>
          <p className="mt-1 text-sm text-white/75">
            Ringkasan operasional proyek, ketersediaan inventaris unit, reservasi, dan antrean
            verifikasi pembayaran manual.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadMetrics()}
            className="border-white/25 bg-white/10 text-white hover:bg-white hover:text-[#173F35]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <Button variant="gold" size="sm" to="/admin/pembayaran">
              Verifikasi Pembayaran ({m.pendingVerificationPayments})
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* 8 Core KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, sub, icon: Icon, tone }) => (
          <div
            key={label}
            className="rounded-2xl border border-[#E3E0D6] bg-white p-5 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#5F6B66]">{label}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5F4EF] text-[#173F35]">
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className={`mt-2.5 font-display text-2xl sm:text-3xl font-extrabold ${tone}`}>
              {value}
            </p>
            <p className="mt-1 text-[11px] text-[#5F6B66]">{sub}</p>
          </div>
        ))}
      </div>

      {/* Financial Highlight Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#E3E0D6] bg-white p-5 shadow-[var(--shadow-card)] flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#5F6B66]">
              Total Booking Fee Terverifikasi
            </p>
            <p className="mt-1 font-display text-2xl font-extrabold text-[#285C49]">
              {formatCurrency(m.totalVerifiedBookingRevenue)}
            </p>
          </div>
          <Badge variant="emerald">Transfer Bank Manual</Badge>
        </div>

        <div className="rounded-2xl border border-[#E3E0D6] bg-white p-5 shadow-[var(--shadow-card)] flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#5F6B66]">
              Nilai Penjualan Terkonfirmasi / Akad
            </p>
            <p className="mt-1 font-display text-2xl font-extrabold text-[#173F35]">
              {m.totalConfirmedSalesValue > 0
                ? formatCompactPrice(m.totalConfirmedSalesValue)
                : 'Rp 0'}
            </p>
          </div>
          <Badge variant="gold">Pipeline Penjualan</Badge>
        </div>
      </div>

      {/* Charts Grid (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Grafik Reservasi */}
        <div className="lg:col-span-7 rounded-2xl border border-[#E3E0D6] bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="font-display text-base font-bold text-[#173F35]">
                Grafik Reservasi (6 Bulan Terakhir)
              </h2>
              <p className="text-xs text-[#5F6B66]">
                Perbandingan total reservasi masuk vs reservasi terkonfirmasi.
              </p>
            </div>
            <Badge variant="default">Recharts</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={m.monthlySeries} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="rsvFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#173F35" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#173F35" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="confFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D8B978" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#D8B978" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E0D6" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#5F6B66' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#5F6B66' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E3E0D6',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="reservasi"
                  name="Total Reservasi"
                  stroke="#173F35"
                  strokeWidth={2.5}
                  fill="url(#rsvFill)"
                />
                <Area
                  type="monotone"
                  dataKey="terkonfirmasi"
                  name="Terkonfirmasi"
                  stroke="#B5924C"
                  strokeWidth={2.5}
                  fill="url(#confFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribusi Status Unit */}
        <div className="lg:col-span-5 rounded-2xl border border-[#E3E0D6] bg-white p-6 shadow-[var(--shadow-card)] flex flex-col justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-[#173F35]">
              Komposisi Inventaris Unit
            </h2>
            <p className="text-xs text-[#5F6B66]">
              Proporsi unit tersedia, reserved, dan terjual saat ini.
            </p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={m.unitDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {m.unitDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#E3E0D6]">
            {m.unitDistribution.map((entry) => (
              <div key={entry.name} className="text-center">
                <div className="inline-flex items-center gap-1.5 text-[11px] text-[#5F6B66]">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name}
                </div>
                <p className="font-display text-base font-bold text-[#173F35]">
                  {entry.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grafik Penjualan + Aktivitas Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Grafik Penjualan (Miliar Rp) */}
        <div className="lg:col-span-6 rounded-2xl border border-[#E3E0D6] bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="mb-5">
            <h2 className="font-display text-base font-bold text-[#173F35]">
              Grafik Penjualan Terkonfirmasi (Miliar Rp)
            </h2>
            <p className="text-xs text-[#5F6B66]">
              Akumulasi nilai unit dari reservasi yang telah terkonfirmasi/akad.
            </p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={m.monthlySeries} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E0D6" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#5F6B66' }} />
                <YAxis tick={{ fontSize: 12, fill: '#5F6B66' }} />
                <Tooltip
                  formatter={(value) => [`Rp ${value} M`, 'Nilai Penjualan']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E3E0D6',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="penjualanMiliar"
                  name="Penjualan (Miliar)"
                  fill="#285C49"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Aktivitas Terbaru */}
        <div className="lg:col-span-6 rounded-2xl border border-[#E3E0D6] bg-white p-6 shadow-[var(--shadow-card)] flex flex-col">
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#E3E0D6]">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#285C49]" />
              <h2 className="font-display text-base font-bold text-[#173F35]">
                Aktivitas Terbaru
              </h2>
            </div>
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <Button variant="ghost" size="sm" to="/admin/logs">
                Semua Log →
              </Button>
            )}
          </div>

          <div className="mt-4 flex-1 space-y-3">
            {m.recentLogs.length === 0 ? (
              <p className="py-10 text-center text-xs text-[#5F6B66]">
                Belum ada catatan aktivitas tercatat.
              </p>
            ) : (
              m.recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between gap-3 rounded-xl bg-[#FAF9F5] border border-[#E3E0D6]/70 px-3.5 py-2.5 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <code className="font-mono font-bold text-[#173F35]">{log.action}</code>
                      {log.actor_role && (
                        <Badge variant="default" className="px-2 py-0 text-[10px]">
                          {log.actor_role}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-[#5F6B66] line-clamp-2">{log.summary}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-[#5F6B66]">
                    {formatDateTimeID(log.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
