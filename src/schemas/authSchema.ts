import { z } from 'zod'

const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{7,11}$/

export const loginSchema = z.object({
  email: z.string().trim().email('Masukkan alamat email yang valid.'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter.'),
})

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, 'Nama lengkap minimal 3 karakter.')
      .max(80, 'Nama lengkap maksimal 80 karakter.'),
    email: z.string().trim().email('Masukkan alamat email yang valid.'),
    phone: z
      .string()
      .trim()
      .regex(phoneRegex, 'Gunakan nomor WhatsApp Indonesia yang valid (contoh: 081234567890).'),
    password: z
      .string()
      .min(8, 'Kata sandi minimal 8 karakter.')
      .regex(/[A-Z]/, 'Kata sandi harus mengandung minimal 1 huruf kapital.')
      .regex(/[0-9]/, 'Kata sandi harus mengandung minimal 1 angka.'),
    confirmPassword: z.string(),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: 'Anda harus menyetujui syarat dan kebijakan privasi.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Konfirmasi kata sandi tidak cocok.',
  })

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Masukkan alamat email yang terdaftar.'),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Kata sandi baru minimal 8 karakter.')
      .regex(/[A-Z]/, 'Kata sandi harus mengandung minimal 1 huruf kapital.')
      .regex(/[0-9]/, 'Kata sandi harus mengandung minimal 1 angka.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Konfirmasi kata sandi tidak cocok.',
  })

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'Nama lengkap minimal 3 karakter.')
    .max(80, 'Nama lengkap maksimal 80 karakter.'),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, 'Gunakan nomor WhatsApp Indonesia yang valid.'),
  nik: z
    .string()
    .trim()
    .refine((val) => val === '' || /^[0-9]{16}$/.test(val), {
      message: 'NIK harus terdiri dari 16 digit angka (atau kosongkan sementara).',
    }),
  address: z
    .string()
    .trim()
    .max(250, 'Alamat maksimal 250 karakter.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
export type ProfileFormValues = z.infer<typeof profileSchema>
