import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ReservationCountdownProps {
  expiresAt: string
  className?: string
}

function getRemaining(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (Number.isNaN(diff) || diff <= 0) {
    return { expired: true, text: 'Kedaluwarsa' }
  }
  const totalSeconds = Math.floor(diff / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    expired: false,
    urgent: hours < 3,
    text: `${pad(hours)}j ${pad(minutes)}m ${pad(seconds)}d`,
  }
}

export function ReservationCountdown({
  expiresAt,
  className,
}: ReservationCountdownProps) {
  const [state, setState] = useState(() => getRemaining(expiresAt))

  useEffect(() => {
    const timer = window.setInterval(() => {
      setState(getRemaining(expiresAt))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [expiresAt])

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tabular-nums border',
        state.expired
          ? 'bg-red-50 text-red-700 border-red-200'
          : state.urgent
            ? 'bg-amber-50 text-amber-800 border-amber-300'
            : 'bg-[#F5F4EF] text-[#173F35] border-[#E3E0D6]',
        className,
      )}
    >
      <Clock className="h-3.5 w-3.5 shrink-0" />
      {state.expired ? 'Batas Waktu Berakhir' : `Sisa Waktu: ${state.text}`}
    </span>
  )
}
