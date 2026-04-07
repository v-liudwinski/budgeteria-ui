import type { Currency, FinancialGoal } from '../api/types'
import { formatAmount } from '../utils/formatAmount'
import { Card } from './Card'
import { ProgressRing } from './ProgressRing'
import { formatDisplayDate } from '../utils/dateHelpers'

type Props = {
  goal: FinancialGoal
  currency: Currency
  className?: string
}

export function GoalCard({ goal, currency, className = '' }: Props) {
  const pct = goal.targetAmount > 0
    ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
    : 0

  const ringColor =
    pct >= 80 ? 'text-brand-success' :
    pct >= 50 ? 'text-brand-warning' : 'text-brand-blue'

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center gap-4">
        <ProgressRing value={pct} size={64} color={ringColor} label="%" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-brand-navy text-sm font-semibold truncate">{goal.name}</p>
            <span className="text-brand-muted text-xs">{pct}%</span>
          </div>
          <p className="text-brand-muted text-xs mt-0.5">
            {formatAmount(goal.currentAmount, currency)} of {formatAmount(goal.targetAmount, currency)}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-brand-muted mt-2">
            <span>{formatAmount(goal.monthlyContribution, currency)}/mo</span>
            <span>·</span>
            <span>by {formatDisplayDate(goal.deadline)}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
