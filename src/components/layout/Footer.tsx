import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Clock, MessageCircle, ArrowUpRight } from 'lucide-react'
import { BrandLogo } from '@/components/common/BrandLogo'
import { APP_CONFIG } from '@/lib/config'
import { usePublicCatalog } from '@/hooks/usePublicCatalog'

const navLinks = [
  { label: 'Beranda', to: '/' },
  { label: 'Proyek Perumahan', to: '/proyek' },
  { label: 'Katalog Rumah', to: '/katalog' },
  { label: 'Hubungi Kami', to: '/kontak' },
  { label: 'Portal Pelanggan', to: '/login' },
  { label: 'Portal Administrator', to: '/admin/login' },
]

export function Footer() {
  const { projects } = usePublicCatalog()
  const currentYear = new Date().getFullYear()
  const projectLinks = projects.slice(0, 3).map((p) => ({
    label: `${p.name} — ${p.city}`,
    to: `/proyek/${p.slug}`,
  }))

  return (
    <footer className="bg-[#173F35] text-white">
      <div className="container-app py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-5">
            <BrandLogo light showSubtitle />
            <p className="text-sm leading-relaxed text-white/75 max-w-sm">
              Platform digital developer properti modern yang menghadirkan hunian
              berkualitas tinggi, tata kawasan hijau berkelanjutan, dan sistem
              reservasi unit yang transparan.
            </p>
            <a
              href={`https://wa.me/${APP_CONFIG.whatsapp}?text=Halo%20PERUMAHAN,%20saya%20ingin%20berkonsultasi%20mengenai%20unit%20hunian.`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#D8B978] px-4 py-2.5 text-sm font-semibold text-[#173F35] transition-colors hover:bg-[#C8A660]"
            >
              <MessageCircle className="h-4 w-4" />
              Konsultasi via WhatsApp
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-[#D8B978]">
              Navigasi
            </h3>
            <ul className="space-y-2.5 text-sm text-white/75">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="transition-colors hover:text-[#D8B978]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-[#D8B978]">
              Proyek Unggulan
            </h3>
            <ul className="space-y-3 text-sm text-white/75">
              {projectLinks.map((project) => (
                <li key={project.to}>
                  <Link
                    to={project.to}
                    className="transition-colors hover:text-[#D8B978]"
                  >
                    {project.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-[#D8B978]">
              Kantor &amp; Galeri
            </h3>
            <ul className="space-y-3.5 text-sm text-white/75">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-[#D8B978] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-semibold text-white">Kantor Pusat:</p>
                  <p className="text-white/80">{APP_CONFIG.headOfficeAddress}</p>
                  <p className="font-semibold text-white mt-1.5">Kantor Wilayah Aceh:</p>
                  <p className="text-white/80">{APP_CONFIG.branchOfficeAddress}</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-[#D8B978] shrink-0" />
                <span>{APP_CONFIG.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-[#D8B978] shrink-0" />
                <span>{APP_CONFIG.email}</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-[#D8B978] shrink-0" />
                <span>{APP_CONFIG.officeHours}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-app py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <p>
            © {currentYear} {APP_CONFIG.legalName}. Seluruh hak cipta dilindungi.
          </p>
          <p>
            Sistem Reservasi &amp; Pembayaran Manual Terverifikasi • PERUMAHAN Digital Platform
          </p>
        </div>
      </div>
    </footer>
  )
}
