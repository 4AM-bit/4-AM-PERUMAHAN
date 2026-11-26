import { ArrowRight, Home, MapPin, Sparkles } from 'lucide-react'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCompactPrice } from '@/utils/format'
import type { Project, ProjectStatus } from '@/types/property'

const statusMap: Record<ProjectStatus, { label: string; variant: BadgeVariant }> = {
  launching: { label: 'New Launch', variant: 'gold' },
  available: { label: 'Tersedia', variant: 'emerald' },
  limited: { label: 'Unit Terbatas', variant: 'warning' },
  sold_out: { label: 'Terjual Habis', variant: 'muted' },
}

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const status = statusMap[project.status]

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#E3E0D6] bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#ECEAE1]">
        <img
          src={project.coverImage}
          alt={project.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-4">
          <Badge variant={status.variant} className="backdrop-blur-md bg-white/92">
            <Sparkles className="h-3 w-3" />
            {status.label}
          </Badge>
          <span className="rounded-full bg-[#173F35]/85 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {project.availableUnits} / {project.totalUnits} Unit Tersedia
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#285C49]">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>{project.location}</span>
        </div>

        <h3 className="mt-2 font-display text-xl font-bold text-[#173F35] group-hover:text-[#285C49] transition-colors">
          {project.name}
        </h3>

        <p className="mt-2.5 text-sm leading-relaxed text-[#5F6B66] line-clamp-3">
          {project.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.highlights.map((item) => (
            <span
              key={item}
              className="rounded-lg bg-[#F5F4EF] px-2.5 py-1 text-[11px] font-medium text-[#242B28]/80"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-6">
          <div className="pt-5 border-t border-[#E3E0D6]/80 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#5F6B66]">
                Harga Mulai
              </p>
              <p className="font-display text-lg font-bold text-[#173F35]">
                {formatCompactPrice(project.startingPrice)}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-[#5F6B66]">
                <Home className="h-3 w-3" />
                LT {project.landAreaRange}
              </p>
            </div>
            <Button variant="primary" size="sm" to={`/proyek/${project.slug}`}>
              Lihat Detail
              <ArrowRight className="h-3.5 w-3.5 text-[#D8B978]" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
