import type { Currency } from '../../api/types'
import { Button } from '../../components/Button'

type Props = {
  monthlyIncome: number
  setMonthlyIncome: (v: number) => void
  currency: Currency
  onNext: () => void
  onBack: () => void
}

export function StepIncome({ monthlyIncome, setMonthlyIncome, currency, onNext, onBack }: Props) {
  const canProceed = monthlyIncome > 0

  return (
    <div>
      <div className="text-4xl mb-3">💰</div>
      <h2 className="text-xl font-bold text-brand-navy mb-1">Monthly household income</h2>
      <p className="text-brand-muted text-sm mb-6">
        Total take-home pay for your family. This helps us suggest smart budget limits.
      </p>

      <div>
        <label className="text-brand-navy text-xs font-semibold uppercase tracking-wide block mb-1.5">
          Income per month ({currency.symbol})
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted font-semibold text-lg">
            {currency.symbol}
          </span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="100"
            value={monthlyIncome || ''}
            onChange={e => setMonthlyIncome(parseFloat(e.target.value) || 0)}
            placeholder="0"
            className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-4 pl-10 text-brand-navy font-bold text-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue placeholder:text-brand-muted/40 transition-all"
            autoFocus
          />
        </div>
      </div>

      {monthlyIncome > 0 && (
        <div className="mt-4 bg-sky-50 border border-sky-100 rounded-xl p-3 text-sm text-brand-navy">
          💡 A common guideline: <strong>50%</strong> needs, <strong>30%</strong> wants, <strong>20%</strong> savings
        </div>
      )}

      <div className="flex gap-3 mt-8">
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
