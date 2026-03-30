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
      className={`bg-slate-800 border border-slate-700 rounded-2xl ${onClick ? 'cursor-pointer hover:border-slate-600 transition-colors' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
