import { CheckCircle2, ArrowUpRight } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { DEVELOPER_ADVANTAGES } from '@/lib/demo-data'

export function DeveloperAdvantagesSection() {
  return (
    <section className="py-20 lg:py-24 bg-[#173F35] text-white relative overflow-hidden">
      <div
        className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-[#285C49]/35 blur-3xl"
        aria-hidden="true"
      />

      <div className="container-app relative z-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
          <div className="lg:col-span-5 space-y-6">
            <SectionHeading
              light
              overline="Keunggulan Developer"
              title="Komitmen Kualitas dari Pondasi hingga Serah Terima"
              description="PERUMAHAN menggabungkan standar rekayasa konstruksi terbaik dengan tata kelola reservasi digital yang transparan bagi setiap calon pemilik rumah."
            />

            <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-xs space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D8B978]">
                Standar Transparansi Transaksi
              </p>
              <ul className="space-y-2.5 text-sm text-white/85">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#D8B978] shrink-0 mt-0.5" />
                  <span>Harga transparan tanpa biaya tersembunyi</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#D8B978] shrink-0 mt-0.5" />
                  <span>Verifikasi bukti transfer manual langsung oleh tim finance resmi</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#D8B978] shrink-0 mt-0.5" />
                  <span>Riwayat status reservasi &amp; pembayaran tercatat rapi di portal</span>
                </li>
              </ul>
            </div>

            <div>
              <Button variant="gold" size="md" to="/kontak">
                Jadwalkan Kunjungan Show Unit
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {DEVELOPER_ADVANTAGES.map((item) => (
              <div
                key={item.number}
                className="rounded-2xl border border-white/12 bg-white/[0.06] p-6 transition-all duration-300 hover:bg-white/[0.1] hover:border-[#D8B978]/40"
              >
                <span className="font-display text-sm font-bold tracking-widest text-[#D8B978]">
                  {item.number}
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-white/75">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
