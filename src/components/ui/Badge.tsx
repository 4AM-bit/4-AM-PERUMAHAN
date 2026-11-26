import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type BadgeVariant =
  | 'default'
  | 'forest'
  | 'emerald'
  | 'gold'
  | 'warning'
  | 'muted'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[#F5F4EF] text-[#242B28] border border-[#E3E0D6]',
  forest: 'bg-[#173F35] text-white border border-[#173F35]',
  emerald: 'bg-[#285C49]/10 text-[#173F35] border border-[#285C49]/20',
  gold: 'bg-[#D8B978]/20 text-[#7A5D20] border border-[#D8B978]/40',
  warning: 'bg-amber-50 text-amber-800 border border-amber-200',
  muted: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
}

export function Badge({
  variant = 'default',
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
