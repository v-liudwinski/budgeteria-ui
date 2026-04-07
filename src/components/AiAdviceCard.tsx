import { Lightbulb, AlertTriangle, CheckCircle2, type LucideIcon } from 'lucide-react'

type Variant = 'tip' | 'risk' | 'success'

type Props = {
  text: string
  title?: string
  icon?: string
  variant?: Variant
  className?: string
}

const styles: Record<Variant, { container: string; text: string; iconColor: string; Icon: LucideIcon }> = {
  tip: {
    container: 'bg-sky-50 border border-sky-100',
    text: 'text-brand-navy',
    iconColor: 'text-brand-blue',
    Icon: Lightbulb,
  },
  risk: {
    container: 'bg-rose-50 border border-rose-100',
    text: 'text-rose-700',
    iconColor: 'text-rose-500',
    Icon: AlertTriangle,
  },
  success: {
    container: 'bg-emerald-50 border border-emerald-100',
    text: 'text-emerald-700',
    iconColor: 'text-emerald-500',
    Icon: CheckCircle2,
  },
}

export function AiAdviceCard({ text, title, icon, variant = 'tip', className = '' }: Props) {
  const s = styles[variant]
  return (
    <div className={`flex items-start gap-3 rounded-xl px-3 py-2.5 ${s.container} ${className}`}>
      {icon ? (
        <span className={`text-lg ${s.iconColor}`}>{icon}</span>
      ) : (
        <s.Icon size={18} className={`${s.iconColor} mt-0.5 flex-shrink-0`} />
      )}
      <div className="flex-1 min-w-0">
        {title && <p className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${s.text}`}>{title}</p>}
        <p className={`text-sm ${s.text}`}>{text}</p>
      </div>
    </div>
  )
}
