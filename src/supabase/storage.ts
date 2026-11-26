import { IS_SUPABASE_CONFIGURED } from '@/lib/config'
import { supabase } from '@/supabase/client'
import type { StorageBucket } from '@/types/database'

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024 // 5 MB

const ALLOWED_MIMES_BY_BUCKET: Record<StorageBucket, string[]> = {
  'project-images': ['image/jpeg', 'image/png', 'image/webp'],
  'house-images': ['image/jpeg', 'image/png', 'image/webp'],
  'house-floorplans': ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf'],
  'gallery-images': ['image/jpeg', 'image/png', 'image/webp'],
  banners: ['image/jpeg', 'image/png', 'image/webp'],
  'payment-proofs': ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
}

export function validateUploadFile(file: File, bucket: StorageBucket): string | null {
  if (file.size > MAX_UPLOAD_BYTES) {
    return 'Ukuran berkas melebihi batas maksimal 5 MB.'
  }

  const allowed = ALLOWED_MIMES_BY_BUCKET[bucket]
  if (!allowed.includes(file.type)) {
    return `Format berkas tidak didukung untuk bucket ${bucket}. Format diizinkan: ${allowed
      .map((m) => m.split('/')[1]?.toUpperCase())
      .join(', ')}.`
  }

  return null
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Gagal membaca berkas unggahan.'))
    reader.readAsDataURL(file)
  })
}

export const storageService = {
  /**
   * Mengunggah bukti transfer ke bucket PRIVATE `payment-proofs`
   * dengan struktur path `<userId>/<reservationId>/<timestamp>-<filename>`.
   */
  async uploadPaymentProof(
    file: File,
    userId: string,
    reservationId: string,
  ): Promise<{ path: string; previewUrl: string }> {
    const validationError = validateUploadFile(file, 'payment-proofs')
    if (validationError) {
      throw new Error(validationError)
    }

    const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `${userId}/${reservationId}/${Date.now()}-${sanitized}`

    if (IS_SUPABASE_CONFIGURED && supabase) {
      const { error } = await supabase.storage
        .from('payment-proofs')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        throw new Error(`Gagal mengunggah bukti pembayaran: ${error.message}`)
      }

      const signed = await this.getSignedPaymentProofUrl(storagePath)
      return { path: storagePath, previewUrl: signed }
    }

    // Fallback Mode Demo: simpan Data URL untuk pratinjau lokal
    const dataUrl = await fileToDataUrl(file)
    return { path: dataUrl, previewUrl: dataUrl }
  },

  /**
   * Membuat Signed URL sementara (10 menit) untuk mengakses file private `payment-proofs`.
   */
  async getSignedPaymentProofUrl(path: string, expiresInSeconds = 600): Promise<string> {
    if (!path) return ''
    if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
      return path
    }

    if (IS_SUPABASE_CONFIGURED && supabase) {
      const { data, error } = await supabase.storage
        .from('payment-proofs')
        .createSignedUrl(path, expiresInSeconds)

      if (error || !data?.signedUrl) {
        throw new Error('Tidak dapat membuat tautan aman untuk bukti pembayaran.')
      }
      return data.signedUrl
    }

    return path
  },

  /**
   * Mengunggah media publik (gambar proyek, tipe rumah, galeri, banner).
   */
  async uploadPublicAsset(
    file: File,
    bucket: Exclude<StorageBucket, 'payment-proofs'>,
    folder = 'uploads',
  ): Promise<string> {
    const validationError = validateUploadFile(file, bucket)
    if (validationError) {
      throw new Error(validationError)
    }

    const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `${folder}/${Date.now()}-${sanitized}`

    if (IS_SUPABASE_CONFIGURED && supabase) {
      const { error } = await supabase.storage.from(bucket).upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

      if (error) {
        throw new Error(`Gagal mengunggah aset ke ${bucket}: ${error.message}`)
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath)
      return data.publicUrl
    }

    return fileToDataUrl(file)
  },
}
