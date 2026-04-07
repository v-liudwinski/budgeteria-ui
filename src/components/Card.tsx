import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-brand-border rounded-2xl shadow-card ${onClick ? 'cursor-pointer hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
