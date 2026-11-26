import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

interface BrandLogoProps {
  light?: boolean
  showSubtitle?: boolean
  className?: string
}

export function BrandLogo({
  light = false,
  showSubtitle = false,
  className,
}: BrandLogoProps) {
  return (
    <Link
      to="/"
      className={cn('inline-flex items-center gap-3 group', className)}
      aria-label="4 AM PERUMAHAN - Beranda"
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-[1.03]',
          light
            ? 'bg-white/10 border border-white/15'
            : 'bg-[#173F35] shadow-xs',
        )}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M3.5 11.2L12 4L20.5 11.2"
            stroke="#D8B978"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.5 9.8V19.5H17.5V9.8"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.25 19.5V14.25H13.75V19.5"
            stroke="#D8B978"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
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
    </Link>
  )
}
