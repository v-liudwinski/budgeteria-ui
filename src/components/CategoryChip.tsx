type Variant = 'blue' | 'pink' | 'neutral'
type Size = 'sm' | 'md'

type Props = {
  label: string
  emoji?: string
  swatchClass?: string
  selected?: boolean
  onClick?: () => void
  variant?: Variant
  size?: Size
  hideLabelOnSm?: boolean
  className?: string
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-xs px-2.5 py-1.5',
  md: 'text-sm px-3 py-2',
}

const variantClasses: Record<Variant, { selected: string; idle: string }> = {
  blue: {
    selected: 'border-brand-blue bg-sky-50 text-brand-blue shadow-sm',
    idle: 'border-brand-border bg-white text-brand-muted hover:border-brand-blue/40',
  },
  pink: {
    selected: 'border-brand-pink bg-pink-50 text-pink-500 shadow-sm',
    idle: 'border-brand-border bg-white text-brand-muted hover:border-brand-pink/40',
  },
  neutral: {
    selected: 'border-brand-blue bg-brand-bg text-brand-navy shadow-sm',
    idle: 'border-brand-border bg-white text-brand-muted hover:border-brand-blue/30',
  },
}

export function CategoryChip({
  label,
  emoji,
  swatchClass,
  selected = false,
  onClick,
  variant = 'blue',
  size = 'md',
  hideLabelOnSm = false,
  className = '',
}: Props) {
  const styles = variantClasses[variant]
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex items-center gap-1.5 rounded-xl border font-medium transition-all ${sizeClasses[size]} ${
        selected ? styles.selected : styles.idle
      } ${className}`}
    >
      {swatchClass ? (
        <span className={`w-2.5 h-2.5 rounded-full ${swatchClass}`} aria-hidden />
      ) : (
        emoji && <span>{emoji}</span>
      )}
      <span className={hideLabelOnSm ? 'hidden sm:inline' : ''}>{label}</span>
    </button>
  )
}
