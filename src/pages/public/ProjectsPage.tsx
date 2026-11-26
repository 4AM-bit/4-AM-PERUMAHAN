import { useMemo, useState } from 'react'
import { Building2, MapPin, RotateCcw, Search } from 'lucide-react'
import { ProjectCard } from '@/components/property/ProjectCard'
import { Button } from '@/components/ui/Button'
import { usePublicCatalog } from '@/hooks/usePublicCatalog'
import type { ProjectStatus } from '@/types/property'

const STATUS_OPTIONS: Array<{ label: string; value: 'all' | ProjectStatus }> = [
  { label: 'Semua Status', value: 'all' },
  { label: 'New Launch', value: 'launching' },
  { label: 'Tersedia', value: 'available' },
  { label: 'Unit Terbatas', value: 'limited' },
]

export function ProjectsPage() {
  const { projects, locations } = usePublicCatalog()
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState<string>('Semua Lokasi')
  const [status, setStatus] = useState<'all' | ProjectStatus>('all')

  const totalUnits = useMemo(
    () => projects.reduce((acc, item) => acc + item.totalUnits, 0),
    [projects],
  )
  const availableUnits = useMemo(
    () => projects.reduce((acc, item) => acc + item.availableUnits, 0),
    [projects],
  )

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase()
    return projects.filter((project) => {
      const matchSearch =
        !q ||
        project.name.toLowerCase().includes(q) ||
        project.location.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q)
      const matchLocation =
        location === 'Semua Lokasi' || project.city === location
      const matchStatus = status === 'all' || project.status === status
      return matchSearch && matchLocation && matchStatus
    })
  }, [projects, search, location, status])

  const hasFilter =
    search.trim() !== '' || location !== 'Semua Lokasi' || status !== 'all'

  const resetFilters = () => {
    setSearch('')
    setLocation('Semua Lokasi')
    setStatus('all')
  }

  return (
    <>
      <section className="bg-[#173F35] text-white py-16 lg:py-20">
        <div className="container-app">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D8B978]">
              Portofolio Pengembangan Kawasan
            </p>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-[42px] font-extrabold leading-tight">
              Proyek Perumahan Unggulan
            </h1>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/80">
              Setiap kawasan dikembangkan dengan masterplan berwawasan hijau, legalitas
              SHM terpecah, dan infrastruktur modern untuk kenyamanan jangka panjang.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
            <div className="rounded-2xl border border-white/15 bg-white/8 px-5 py-4">
              <p className="text-xs text-white/70">Total Proyek Aktif</p>
              <p className="mt-1 font-display text-2xl font-bold text-white">
                {projects.length} Kawasan
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/8 px-5 py-4">
              <p className="text-xs text-white/70">Total Unit Dikembangkan</p>
              <p className="mt-1 font-display text-2xl font-bold text-white">
                {totalUnits} Unit
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/8 px-5 py-4">
              <p className="text-xs text-white/70">Unit Siap Direservasi</p>
              <p className="mt-1 font-display text-2xl font-bold text-[#D8B978]">
                {availableUnits} Unit
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-[#F5F4EF]">
        <div className="container-app">
          <div className="rounded-2xl border border-[#E3E0D6] bg-white p-5 shadow-[var(--shadow-card)]">
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-12">
              <div className="md:col-span-5">
                <label
                  htmlFor="project-search"
                  className="block text-xs font-medium text-[#5F6B66] mb-1.5"
                >
                  Cari Proyek atau Lokasi
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B66]" />
                  <input
                    id="project-search"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Contoh: Serenity, Sentul, LRT..."
                    className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/60 pl-10 pr-3.5 text-sm text-[#242B28] focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15"
                  />
                </div>
              </div>

              <div className="md:col-span-3">
                <label
                  htmlFor="project-location"
                  className="block text-xs font-medium text-[#5F6B66] mb-1.5"
                >
                  Wilayah
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B66]" />
                  <select
                    id="project-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/60 pl-10 pr-3.5 text-sm text-[#242B28] focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="project-status"
                  className="block text-xs font-medium text-[#5F6B66] mb-1.5"
                >
                  Status Proyek
                </label>
                <select
                  id="project-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'all' | ProjectStatus)}
                  className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/60 px-3 text-sm text-[#242B28] focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex items-end">
                <Button
                  variant="outline"
                  size="md"
                  onClick={resetFilters}
                  disabled={!hasFilter}
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-sm text-[#5F6B66]">
            <p>
              Menampilkan <strong className="text-[#173F35]">{filteredProjects.length}</strong>{' '}
              dari {projects.length} proyek perumahan
            </p>
            <Button variant="ghost" size="sm" to="/katalog">
              <Building2 className="h-4 w-4" />
              Lihat Semua Tipe Rumah
            </Button>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-[#E3E0D6] bg-white px-6 py-16 text-center">
              <p className="font-display text-lg font-bold text-[#173F35]">
                Proyek yang Anda cari tidak ditemukan
              </p>
              <p className="mt-2 text-sm text-[#5F6B66]">
                Coba ubah kata kunci atau reset filter wilayah dan status proyek.
              </p>
              <Button variant="primary" size="sm" onClick={resetFilters} className="mt-5">
                <RotateCcw className="h-4 w-4" />
                Reset Filter Proyek
              </Button>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
