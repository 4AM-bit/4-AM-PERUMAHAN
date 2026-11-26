import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { APP_CONFIG } from '@/lib/config'
import { usePublicCatalog } from '@/hooks/usePublicCatalog'
import { contactFormSchema, type ContactFormValues } from '@/schemas/contactSchema'
import { cn } from '@/utils/cn'

export function ContactPage() {
  const { projects } = usePublicCatalog()
  const [submittedData, setSubmittedData] = useState<ContactFormValues | null>(null)
  const [selectedMapId, setSelectedMapId] = useState<string>('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      projectInterest: projects[0]?.name ?? 'Konsultasi Umum / KPR',
      subject: '',
      message: '',
    },
  })

  const onSubmit = async (values: ContactFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 450))
    setSubmittedData(values)
  }

  const activeMapProject =
    projects.find((proj) => proj.id === selectedMapId) ?? projects[0]

  return (
    <>
      <section className="bg-[#173F35] text-white py-14 lg:py-18">
        <div className="container-app">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D8B978]">
            Hubungi Tim Kami
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-[42px] font-extrabold leading-tight">
            Marketing Gallery &amp; Layanan Konsultasi
          </h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-white/80">
            Jadwalkan kunjungan show unit, konsultasi pembiayaan KPR, atau tanyakan
            ketersediaan unit terbaru langsung kepada tim resmi PERUMAHAN.
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-[#F5F4EF]">
        <div className="container-app grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Form */}
          <div className="lg:col-span-7 rounded-2xl border border-[#E3E0D6] bg-white p-6 sm:p-8 shadow-[var(--shadow-card)]">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-5 border-b border-[#E3E0D6]">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#173F35]">
                  Kirim Pesan atau Jadwalkan Kunjungan
                </h2>
                <p className="mt-1 text-sm text-[#5F6B66]">
                  Tim Property Advisor akan merespons dalam maksimal 1×24 jam kerja.
                </p>
              </div>
              <Badge variant="emerald">Layanan Resmi Developer</Badge>
            </div>

            {submittedData ? (
              <div className="mt-8 rounded-2xl border border-[#285C49]/25 bg-[#F5F4EF] p-6 sm:p-8 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#173F35] text-[#D8B978]">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#173F35]">
                  Pesan Anda Berhasil Diterima (Mode Demo)
                </h3>
                <p className="text-sm text-[#5F6B66] max-w-md mx-auto leading-relaxed">
                  Terima kasih, <strong className="text-[#173F35]">{submittedData.fullName}</strong>.
                  Pertanyaan Anda mengenai <strong>{submittedData.projectInterest}</strong> telah
                  tervalidasi. Pada Phase 3–4, pesan ini akan tersimpan langsung ke Supabase
                  dan menerbitkan notifikasi ke tim sales.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSubmittedData(null)
                      reset()
                    }}
                  >
                    Kirim Pesan Lainnya
                  </Button>
                  <a
                    href={`https://wa.me/${APP_CONFIG.whatsapp}?text=${encodeURIComponent(`Halo PERUMAHAN, saya ${submittedData.fullName}. ${submittedData.subject} (${submittedData.projectInterest})`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#173F35]/20 bg-white px-3.5 text-sm font-medium text-[#173F35] hover:bg-[#ECEAE1]"
                  >
                    <MessageCircle className="h-4 w-4 text-[#285C49]" />
                    Lanjut via WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="mt-6 space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-semibold text-[#173F35] mb-1.5"
                    >
                      Nama Lengkap <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="Contoh: Budi Santoso"
                      {...register('fullName')}
                      className={cn(
                        'h-11 w-full rounded-xl border bg-[#F5F4EF]/50 px-3.5 text-sm text-[#242B28] focus:bg-white focus:outline-none focus:ring-2 transition-all',
                        errors.fullName
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                          : 'border-[#E3E0D6] focus:border-[#173F35] focus:ring-[#173F35]/15',
                      )}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-semibold text-[#173F35] mb-1.5"
                    >
                      Alamat Email <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="nama@email.com"
                      {...register('email')}
                      className={cn(
                        'h-11 w-full rounded-xl border bg-[#F5F4EF]/50 px-3.5 text-sm text-[#242B28] focus:bg-white focus:outline-none focus:ring-2 transition-all',
                        errors.email
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                          : 'border-[#E3E0D6] focus:border-[#173F35] focus:ring-[#173F35]/15',
                      )}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="block text-xs font-semibold text-[#173F35] mb-1.5"
                    >
                      Nomor WhatsApp <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      placeholder="081234567890"
                      {...register('phone')}
                      className={cn(
                        'h-11 w-full rounded-xl border bg-[#F5F4EF]/50 px-3.5 text-sm text-[#242B28] focus:bg-white focus:outline-none focus:ring-2 transition-all',
                        errors.phone
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                          : 'border-[#E3E0D6] focus:border-[#173F35] focus:ring-[#173F35]/15',
                      )}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-project"
                      className="block text-xs font-semibold text-[#173F35] mb-1.5"
                    >
                      Proyek Diminati <span className="text-red-600">*</span>
                    </label>
                    <select
                      id="contact-project"
                      {...register('projectInterest')}
                      className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/50 px-3.5 text-sm text-[#242B28] focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15"
                    >
                      {projects.map((proj) => (
                        <option key={proj.id} value={proj.name}>
                          {proj.name} — {proj.city}
                        </option>
                      ))}
                      <option value="Konsultasi Umum / KPR">
                        Konsultasi Umum &amp; Simulasi KPR
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-xs font-semibold text-[#173F35] mb-1.5"
                  >
                    Subjek <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    placeholder="Contoh: Jadwal kunjungan show unit akhir pekan ini"
                    {...register('subject')}
                    className={cn(
                      'h-11 w-full rounded-xl border bg-[#F5F4EF]/50 px-3.5 text-sm text-[#242B28] focus:bg-white focus:outline-none focus:ring-2 transition-all',
                      errors.subject
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                        : 'border-[#E3E0D6] focus:border-[#173F35] focus:ring-[#173F35]/15',
                    )}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-semibold text-[#173F35] mb-1.5"
                  >
                    Pesan <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    placeholder="Tuliskan tipe rumah yang diminati, rencana waktu kunjungan, atau pertanyaan Anda..."
                    {...register('message')}
                    className={cn(
                      'w-full rounded-xl border bg-[#F5F4EF]/50 p-3.5 text-sm text-[#242B28] focus:bg-white focus:outline-none focus:ring-2 transition-all',
                      errors.message
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                        : 'border-[#E3E0D6] focus:border-[#173F35] focus:ring-[#173F35]/15',
                    )}
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  <Send className="h-4 w-4 text-[#D8B978]" />
                  {isSubmitting ? 'Mengirim Pesan...' : 'Kirim Pesan Sekarang'}
                </Button>
              </form>
            )}
          </div>

          {/* Direct Contact Info Cards */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-2xl border border-[#173F35] bg-[#173F35] p-6 text-white space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D8B978]">
                Respon Cepat via WhatsApp
              </p>
              <h3 className="font-display text-xl font-bold">
                Konsultasi Langsung dengan Property Advisor
              </h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Dapatkan e-brosur resmi, pricelist terbaru, dan ketersediaan unit real-time
                langsung melalui layanan WhatsApp kami.
              </p>
              <a
                href={`https://wa.me/${APP_CONFIG.whatsapp}?text=Halo%20PERUMAHAN,%20saya%20ingin%20meminta%20brosur%20dan%20informasi%20unit%20tersedia.`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#D8B978] px-5 text-sm font-semibold text-[#173F35] hover:bg-[#C8A660] transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                {APP_CONFIG.whatsappDisplay}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            <div className="rounded-2xl border border-[#E3E0D6] bg-white p-6 shadow-[var(--shadow-card)] space-y-4">
              <h3 className="font-display text-lg font-bold text-[#173F35]">
                Informasi Kantor Pusat
              </h3>
              <ul className="space-y-4 text-sm text-[#5F6B66]">
                <li className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-[#285C49] shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-[#173F35]">Alamat Marketing Gallery</p>
                    <p className="mt-0.5 leading-relaxed">{APP_CONFIG.officeAddress}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-[#285C49] shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-[#173F35]">Telepon Resmi</p>
                    <a href={`tel:${APP_CONFIG.phone}`} className="hover:text-[#173F35]">
                      {APP_CONFIG.phone}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-[#285C49] shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-[#173F35]">Email Developer</p>
                    <a href={`mailto:${APP_CONFIG.email}`} className="hover:text-[#173F35]">
                      {APP_CONFIG.email}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-[#285C49] shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-[#173F35]">Jam Operasional</p>
                    <p>{APP_CONFIG.officeHours}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Interactive Project Locations Map */}
        <div className="container-app mt-12">
          <div className="rounded-2xl border border-[#E3E0D6] bg-white p-6 sm:p-8 shadow-[var(--shadow-card)]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#285C49]">
                  Lokasi Proyek Kami
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-[#173F35]">
                  Kunjungi Kawasan &amp; Show Unit PERUMAHAN
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => setSelectedMapId(proj.id)}
                    className={cn(
                      'rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer',
                      activeMapProject?.id === proj.id
                        ? 'bg-[#173F35] text-white'
                        : 'bg-[#F5F4EF] text-[#5F6B66] hover:bg-[#ECEAE1] hover:text-[#173F35]',
                    )}
                  >
                    {proj.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-4 rounded-xl border border-[#E3E0D6] bg-[#FAF9F5] p-5 flex flex-col justify-between gap-4">
                <div>
                  <Badge variant="emerald">{activeMapProject.city}</Badge>
                  <h3 className="mt-3 font-display text-lg font-bold text-[#173F35]">
                    {activeMapProject.name}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#5F6B66]">
                    {activeMapProject.map.address}
                  </p>

                  <ul className="mt-4 space-y-2 text-xs text-[#242B28]">
                    {activeMapProject.map.nearbyAccess.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#D8B978]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-2">
                  <a
                    href={activeMapProject.map.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#173F35] px-4 text-xs font-semibold text-white hover:bg-[#102D26]"
                  >
                    Petunjuk Arah Google Maps
                    <ExternalLink className="h-3.5 w-3.5 text-[#D8B978]" />
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    to={`/proyek/${activeMapProject.slug}`}
                    className="w-full"
                  >
                    Lihat Detail Proyek
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-8 overflow-hidden rounded-xl border border-[#E3E0D6] bg-[#ECEAE1] min-h-[340px]">
                <iframe
                  title={`Peta ${activeMapProject.name}`}
                  src={activeMapProject.map.embedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full min-h-[340px] w-full border-0"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
