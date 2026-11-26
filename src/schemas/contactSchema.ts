import { z } from 'zod'

export const contactFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'Nama lengkap minimal 3 karakter.')
    .max(80, 'Nama lengkap maksimal 80 karakter.'),
  email: z
    .string()
    .trim()
    .email('Masukkan alamat email yang valid.'),
  phone: z
    .string()
    .trim()
    .regex(/^(\+62|62|0)8[1-9][0-9]{7,11}$/, 'Gunakan nomor WhatsApp Indonesia yang valid (contoh: 081234567890).'),
  projectInterest: z
    .string()
    .min(1, 'Pilih proyek atau topik yang ingin Anda tanyakan.'),
  subject: z
    .string()
    .trim()
    .min(5, 'Subjek pertanyaan minimal 5 karakter.')
    .max(120, 'Subjek maksimal 120 karakter.'),
  message: z
    .string()
    .trim()
    .min(15, 'Pesan minimal 15 karakter agar tim kami dapat membantu dengan tepat.')
    .max(1000, 'Pesan maksimal 1000 karakter.'),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>
