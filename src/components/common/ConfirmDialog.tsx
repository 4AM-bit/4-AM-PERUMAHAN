import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/ui/Button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Ya, Hapus Data',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="md">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-200">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="space-y-2 text-sm text-[#5F6B66]">
          <p className="leading-relaxed">{description}</p>
          <p className="text-xs text-[#5F6B66]/80">
            Data penting yang terhubung dengan transaksi menggunakan mekanisme soft delete
            untuk menjaga integritas riwayat audit.
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-[#E3E0D6]">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onConfirm}
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-600"
        >
          {isLoading ? 'Memproses...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
