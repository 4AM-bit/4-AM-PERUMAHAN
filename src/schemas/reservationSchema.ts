import { z } from 'zod'

const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{7,11}$/

export const reservationIdentitySchema = z.object({
  customerFullName: z
    .string()
    .trim()
    .min(3, 'Nama lengkap sesuai KTP minimal 3 karakter.')
    .max(100, 'Nama lengkap maksimal 100 karakter.'),
  customerEmail: z
    .string()
    .trim()
    .email('Masukkan alamat email yang valid.'),
  customerPhone: z
    .string()
    .trim()
    .regex(phoneRegex, 'Gunakan nomor WhatsApp Indonesia yang valid (contoh: 081234567890).'),
  customerIdentityNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{16}$/, 'NIK harus terdiri dari tepat 16 digit angka sesuai KTP.'),
  customerAddress: z
    .string()
    .trim()
    .min(10, 'Alamat domisili minimal 10 karakter.')
    .max(300, 'Alamat maksimal 300 karakter.'),
  notes: z
    .string()
    .trim()
    .max(500, 'Catatan maksimal 500 karakter.')
    .optional()
    .or(z.literal('')),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: 'Anda harus menyetujui ketentuan penguncian unit dan batas waktu pembayaran.',
  }),
})

export type ReservationIdentityFormValues = z.infer<typeof reservationIdentitySchema>
