import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface BaseButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
}

type ButtonAsButton = BaseButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: undefined
  }

type ButtonAsLink = BaseButtonProps &
  Omit<LinkProps, 'className' | 'children'> & {
    to: string
  }

export type ButtonProps = ButtonAsButton | ButtonAsLink

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#173F35] text-white hover:bg-[#102D26] shadow-xs hover:shadow-md focus-visible:ring-[#173F35]',
  secondary:
    'bg-[#285C49] text-white hover:bg-[#1F493A] shadow-xs hover:shadow-md focus-visible:ring-[#285C49]',
  gold:
    'bg-[#D8B978] text-[#173F35] hover:bg-[#C8A660] font-semibold shadow-xs hover:shadow-md focus-visible:ring-[#D8B978]',
  outline:
    'border border-[#173F35]/20 bg-white text-[#173F35] hover:border-[#173F35] hover:bg-[#F5F4EF] focus-visible:ring-[#173F35]',
  ghost:
    'bg-transparent text-[#242B28] hover:bg-[#173F35]/5 hover:text-[#173F35] focus-visible:ring-[#173F35]',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-lg gap-1.5',
  md: 'h-11 px-5 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-[15px] rounded-xl gap-2.5',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
    variantStyles[variant],
    sizeStyles[size],
    className,
  )

  if ('to' in props && props.to !== undefined) {
    const { to, ...linkProps } = props
    return (
      <Link to={to} className={classes} {...linkProps}>
        {children}
      </Link>
    )
  }

  return (
    <button
      type={(props as ButtonAsButton).type ?? 'button'}
      className={classes}
      {...(props as ButtonAsButton)}
    >
      {children}
    </button>
  )
}
