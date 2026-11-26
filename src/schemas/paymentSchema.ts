import { z } from 'zod'

export const submitPaymentSchema = z.object({
  reservationId: z.string().min(1, 'Pilih reservasi yang akan dibayarkan.'),
  paymentAccountId: z.string().min(1, 'Pilih rekening tujuan resmi developer.'),
  paymentDate: z.string().min(1, 'Tanggal transfer wajib diisi.'),
  senderBank: z
    .string()
    .trim()
    .min(2, 'Nama bank pengirim minimal 2 karakter.')
    .max(60, 'Nama bank maksimal 60 karakter.'),
  senderName: z
    .string()
    .trim()
    .min(3, 'Nama pemilik rekening pengirim minimal 3 karakter.')
    .max(100, 'Nama pengirim maksimal 100 karakter.'),
  senderAccountNumber: z
    .string()
    .trim()
    .regex(/^[0-9-]{6,25}$/, 'Nomor rekening pengirim harus berupa 6–25 digit angka.'),
  notes: z.string().trim().max(400, 'Catatan maksimal 400 karakter.').optional().or(z.literal('')),
})

export const verifyPaymentDecisionSchema = z
  .object({
    decision: z.enum(['verified', 'rejected']),
    rejectionReason: z.string().trim().max(400).optional().or(z.literal('')),
    notes: z.string().trim().max(400).optional().or(z.literal('')),
  })
  .refine(
    (data) =>
      data.decision !== 'rejected' ||
      (data.rejectionReason && data.rejectionReason.trim().length >= 8),
    {
      path: ['rejectionReason'],
      message: 'Alasan penolakan wajib diisi minimal 8 karakter.',
    },
  )

export type SubmitPaymentFormValues = z.infer<typeof submitPaymentSchema>
export type VerifyPaymentDecisionValues = z.infer<typeof verifyPaymentDecisionSchema>
