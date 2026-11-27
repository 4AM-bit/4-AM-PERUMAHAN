import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

export interface BrandLogoProps {
  light?: boolean
  variant?: 'auto' | 'dark' | 'light'
  showSubtitle?: boolean
  className?: string
  iconSize?: 'sm' | 'md' | 'lg' | 'xl'
  to?: string
}

export function BrandLogo({
  light = false,
  variant = 'auto',
  showSubtitle = false,
  className,
  iconSize = 'md',
  to = '/',
}: BrandLogoProps) {
  // If variant is explicit, use it.
  // Otherwise: light theme (placed on dark bg) uses 4am-logo-dark.png; default (placed on light bg) uses 4am-logo-light.png
  const isDarkBg = variant === 'dark' || (variant === 'auto' && light)
  const logoSrc = isDarkBg ? '/4am-logo-dark.png' : '/4am-logo-light.png'

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10 sm:h-11 sm:w-11',
    lg: 'h-12 w-12 sm:h-14 sm:w-14',
    xl: 'h-16 w-16 sm:h-20 sm:w-20',
  }

  const content = (
    <>
      <img
        src={logoSrc}
        alt="4 AM PERUMAHAN"
        width={44}
        height={44}
        className={cn(
          'shrink-0 object-contain aspect-square transition-transform duration-300 group-hover:scale-[1.04]',
          sizeClasses[iconSize],
          !isDarkBg && 'drop-shadow-xs',
        )}
        loading="eager"
        decoding="async"
      />
      <div className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display text-base sm:text-lg font-extrabold tracking-[0.08em]',
            light ? 'text-white' : 'text-[#173F35]',
          )}
        >
          4 AM PERUMAHAN
        </span>
        {showSubtitle && (
          <span
            className={cn(
              'mt-1 text-[10px] font-medium uppercase tracking-[0.2em]',
              light ? 'text-[#D8B978]/90' : 'text-[#5F6B66]',
            )}
          >
            Residential Developer
          </span>
        )}
      </div>
    </>
  )

  if (to) {
    return (
      <Link
        to={to}
        className={cn('inline-flex items-center gap-3 group select-none', className)}
        aria-label="4 AM PERUMAHAN - Beranda"
      >
        {content}
      </Link>
    )
  }

  return (
    <div className={cn('inline-flex items-center gap-3 select-none', className)}>
      {content}
    </div>
  )
}
