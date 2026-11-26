import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  size?: 'md' | 'lg' | 'xl'
  children: ReactNode
}

const sizeClasses = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = 'lg',
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#102D26]/75 p-4 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={cn(
          'my-8 w-full rounded-2xl border border-[#E3E0D6] bg-white shadow-2xl overflow-hidden',
          sizeClasses[size],
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E3E0D6] bg-[#FAF9F5] px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-bold text-[#173F35]">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-[#5F6B66]">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E3E0D6] bg-white text-[#5F6B66] hover:text-[#173F35] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[78vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}
