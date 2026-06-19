import { clsx } from 'clsx'
import { CSSProperties, ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  style?: CSSProperties
}

export default function Card({ children, className, hover = false, onClick, style }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={clsx(
        'glass-card p-6',
        hover && 'cursor-pointer hover-lift',
        className
      )}
    >
      {children}
    </div>
  )
}
