import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface SectionHeadingProps {
  overline?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  action?: ReactNode
  light?: boolean
  className?: string
}

export function SectionHeading({
  overline,
  title,
  description,
  align = 'left',
  action,
  light = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center'
          ? 'items-center text-center max-w-2xl mx-auto'
          : 'md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className={cn(align === 'center' ? 'max-w-2xl' : 'max-w-2xl')}>
        {overline && (
          <p
            className={cn(
              'text-xs font-semibold uppercase tracking-[0.18em] mb-2.5',
              light ? 'text-[#D8B978]' : 'text-[#285C49]',
            )}
          >
            {overline}
          </p>
        )}
        <h2
          className={cn(
            'text-2xl sm:text-3xl lg:text-[34px] font-bold leading-tight',
            light ? 'text-white' : 'text-[#173F35]',
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              'mt-3 text-sm sm:text-[15px] leading-relaxed',
              light ? 'text-white/75' : 'text-[#5F6B66]',
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
