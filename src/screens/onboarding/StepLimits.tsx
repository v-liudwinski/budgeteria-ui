import type { Currency, PlanCategory } from '../../api/types'
import { formatAmount } from '../../utils/formatAmount'
import { defaultCategories } from '../../utils/categories'
import { Button } from '../../components/Button'

type Props = {
  categories: PlanCategory[]
  setCategories: (v: PlanCategory[]) => void
  monthlyIncome: number
  currency: Currency
  onNext: () => void
  onBack: () => void
}

export function StepLimits({ categories, setCategories, monthlyIncome, currency, onNext, onBack }: Props) {
  const total = categories.reduce((s, c) => s + c.monthlyLimit, 0)
  const remaining = monthlyIncome - total
  const pctUsed = monthlyIncome > 0 ? Math.round((total / monthlyIncome) * 100) : 0

  function updateLimit(id: string, limit: number) {
    setCategories(categories.map(c => c.id === id ? { ...c, monthlyLimit: limit } : c))
  }

  function autoFill() {
    setCategories(categories.map(c => {
      const preset = defaultCategories.find(p => p.id === c.id)
      const pct = preset?.suggestedPct ?? 5
      return { ...c, monthlyLimit: Math.round(monthlyIncome * pct / 100) }
    }))
  }

  const canProceed = categories.every(c => c.monthlyLimit > 0)

  return (
    <div>
      <div className="text-4xl mb-3">🎯</div>
      <h2 className="text-xl font-bold text-brand-navy mb-1">Set budget limits</h2>
      <p className="text-brand-muted text-sm mb-2">
        How much for each category? Income: <strong>{formatAmount(monthlyIncome, currency)}</strong>/mo
      </p>

      <button
        onClick={autoFill}
        className="text-brand-blue text-xs font-semibold hover:underline mb-4 inline-block"
      >
        ✨ Auto-fill with suggested amounts
      </button>

      {/* Allocation bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-brand-muted">{pctUsed}% allocated</span>
          <span className={remaining < 0 ? 'text-brand-danger font-semibold' : 'text-brand-success'}>
            {formatAmount(remaining, currency)} remaining
          </span>
        </div>
        <div className="h-2 bg-brand-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              pctUsed > 100 ? 'bg-brand-danger' : pctUsed > 85 ? 'bg-brand-warning' : 'bg-gradient-to-r from-brand-blue to-brand-pink'
            }`}
            style={{ width: `${Math.min(100, pctUsed)}%` }}
          />
        </div>
      </div>

      {/* Category limits */}
      <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar">
        {categories.map(cat => {
          const pct = monthlyIncome > 0 ? Math.round((cat.monthlyLimit / monthlyIncome) * 100) : 0
          return (
            <div key={cat.id} className="flex items-center gap-3">
              <span className="text-xl flex-shrink-0">{cat.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-brand-navy text-sm font-medium truncate">{cat.name}</span>
                  <span className="text-brand-muted text-xs">{pct}%</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={cat.monthlyLimit || ''}
                  onChange={e => updateLimit(cat.id, parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-1.5 text-brand-navy text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue placeholder:text-brand-muted/40"
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="secondary" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed} className="flex-[2]">
          Continue
        </Button>
      </div>
    </div>
  )
}
