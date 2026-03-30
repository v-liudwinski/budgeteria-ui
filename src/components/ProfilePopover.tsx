import { useState } from 'react'
import { useBudget } from '../context/BudgetContext'
import { CurrencyPicker } from './CurrencyPicker'
import { toMonthKey } from '../utils/dateHelpers'

export function ProfilePopover() {
  const { state, dispatch } = useBudget()
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)

  function shiftMonth(delta: number) {
    const [y, m] = state.selectedMonth.split('-').map(Number)
    const d = new Date(y, m - 1 + delta, 1)
    dispatch({ type: 'SET_MONTH', payload: toMonthKey(d) })
  }

  const [year, month] = state.selectedMonth.split('-').map(Number)
  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="p-5 space-y-5">
      {/* User name */}
      <div>
        <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">Name</div>
        <div className="text-slate-100 font-semibold">{state.user.name}</div>
      </div>

      {/* Currency */}
      <div>
        <div className="text-slate-500 text-xs uppercase tracking-wide mb-2">Currency</div>
        <button
          onClick={() => setShowCurrencyPicker(true)}
          className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-100 hover:border-slate-500 transition-colors"
        >
          <span className="text-slate-400">{state.user.currency.symbol}</span>
          <span>{state.user.currency.code}</span>
          <span className="ml-2 text-slate-500">▾</span>
        </button>
      </div>

      {/* Month navigator */}
      <div>
        <div className="text-slate-500 text-xs uppercase tracking-wide mb-2">Viewing month</div>
        <div className="flex items-center gap-3">
          <button onClick={() => shiftMonth(-1)} className="text-slate-400 hover:text-slate-200 transition-colors text-lg px-1">‹</button>
          <span className="text-slate-100 text-sm font-semibold">{monthLabel}</span>
          <button onClick={() => shiftMonth(1)} className="text-slate-400 hover:text-slate-200 transition-colors text-lg px-1">›</button>
        </div>
      </div>

      {showCurrencyPicker && (
        <CurrencyPicker
          current={state.user.currency}
          onSelect={currency => dispatch({ type: 'SET_CURRENCY', payload: currency })}
          onClose={() => setShowCurrencyPicker(false)}
        />
      )}
    </div>
  )
}
