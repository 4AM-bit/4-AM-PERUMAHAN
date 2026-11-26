import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '@/utils/cn'

type ToastVariant = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const showToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((prev) => [...prev, { ...toast, id }])
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id))
      }, 4500)
    },
    [],
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex w-full max-w-sm flex-col gap-2.5 px-4 sm:px-0 pointer-events-none"
      >
        {toasts.map((item) => {
          const Icon =
            item.variant === 'success'
              ? CheckCircle2
              : item.variant === 'error'
                ? AlertCircle
                : Info
          return (
            <div
              key={item.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-xl transition-all',
                item.variant === 'success' && 'border-[#285C49]/30',
                item.variant === 'error' && 'border-red-300',
                item.variant === 'info' && 'border-[#D8B978]/60',
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0 mt-0.5',
                  item.variant === 'success' && 'text-[#285C49]',
                  item.variant === 'error' && 'text-red-600',
                  item.variant === 'info' && 'text-[#B5924C]',
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm font-bold text-[#173F35]">
                  {item.title}
                </p>
                {item.description && (
                  <p className="mt-0.5 text-xs leading-relaxed text-[#5F6B66]">
                    {item.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Tutup notifikasi"
                className="text-[#5F6B66] hover:text-[#173F35] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast harus digunakan di dalam ToastProvider')
  }
  return ctx
}
