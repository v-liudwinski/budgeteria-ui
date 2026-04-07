import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dashed'
type Size = 'sm' | 'md' | 'lg'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed'

const sizeClasses: Record<Size, string> = {
  sm: 'text-xs px-3 py-2',
  md: 'text-sm px-4 py-3',
  lg: 'text-sm px-4 py-3.5',
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-gradient-to-r from-brand-blue to-brand-pink text-white hover:shadow-soft hover:-translate-y-0.5 active:translate-y-0',
  secondary: 'border border-brand-border text-brand-muted hover:bg-brand-bg',
  ghost: 'text-brand-blue hover:underline',
  danger: 'border border-brand-danger/30 text-brand-danger hover:bg-rose-50',
  dashed: 'border-2 border-dashed border-brand-border text-brand-muted hover:border-brand-blue/40 hover:text-brand-blue',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
