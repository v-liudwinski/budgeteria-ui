import type { Category, Currency } from '../context/types'
import { formatAmount } from '../utils/formatAmount'

type Props = {
  category: Category
  currency: Currency
  onClick?: () => void
}

function getBarColor(pct: number): string {
  if (pct >= 95) return 'bg-red-500'
  if (pct >= 75) return 'bg-amber-400'
  return 'bg-emerald-400'
}

export function AnimalGuide({ category, currency, onClick }: Props) {
  const pct = Math.min(100, Math.round((category.spent / category.limit) * 100))
  const barColor = getBarColor(pct)

  return (
    <div
      onClick={onClick}
      className={`bg-slate-800 border border-slate-700 rounded-2xl p-3 flex items-center gap-3 flex-shrink-0 ${onClick ? 'cursor-pointer hover:border-slate-500 transition-colors' : ''}`}
    >
      <span className="text-2xl">{category.animal}</span>
      <div className="min-w-0">
        <div className="text-slate-100 text-xs font-semibold truncate">{category.name}</div>
        <div className={`text-xs mt-0.5 ${pct >= 95 ? 'text-red-400' : pct >= 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
          {formatAmount(category.spent, currency)} / {formatAmount(category.limit, currency)}
        </div>
        <div className="w-10 h-1 bg-slate-700 rounded-full mt-1.5">
          <div
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
