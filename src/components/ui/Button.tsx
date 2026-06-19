import { clsx } from 'clsx'
import { ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'glow-button text-white': variant === 'primary',
          'bg-secondary/20 text-secondary hover:bg-secondary/30': variant === 'secondary',
          'bg-transparent hover:bg-white/5 text-dark-400 hover:text-dark-700': variant === 'ghost',
          'border border-white/20 hover:border-primary/50 hover:bg-white/5': variant === 'outline',
        },
        {
          'px-3 py-1.5 text-sm rounded-lg': size === 'sm',
          'px-5 py-2.5 text-base rounded-xl': size === 'md',
          'px-8 py-3.5 text-lg rounded-xl': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
