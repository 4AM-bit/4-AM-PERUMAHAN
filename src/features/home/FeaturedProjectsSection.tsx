import { ArrowRight } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { ProjectCard } from '@/components/property/ProjectCard'
import { usePublicCatalog } from '@/hooks/usePublicCatalog'

export function FeaturedProjectsSection() {
  const { projects } = usePublicCatalog()

  return (
    <section className="py-20 lg:py-24 bg-[#F5F4EF]">
      <div className="container-app">
        <SectionHeading
          overline="Proyek Unggulan"
          title="Kawasan Hunian Terkurasi di Lokasi Berkembang"
          description="Setiap proyek PERUMAHAN dirancang dengan perencanaan masterplan matang, konektivitas strategis, dan rasio ruang hijau yang lega."
          action={
            <Button variant="outline" to="/proyek">
              Lihat Semua Proyek
              <ArrowRight className="h-4 w-4" />
            </Button>
          }
        />

        <div className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0, 3).map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}
