import { useBudget } from '../context/BudgetContext'
import { Card } from '../components/Card'
import { AnimalGuide } from '../components/AnimalGuide'
import { formatAmount } from '../utils/formatAmount'
import { getGreeting, friendlyDate } from '../utils/dateHelpers'
import { useNavigate } from 'react-router-dom'

export function DashboardScreen() {
  const { state } = useBudget()
  const { user, categories, expenses } = state
  const currency = user.currency
  const navigate = useNavigate()

  const totalBudget = categories.reduce((s, c) => s + c.limit, 0)
  const totalSpent  = categories.reduce((s, c) => s + c.spent, 0)
  const totalLeft   = totalBudget - totalSpent
  const overallPct  = Math.min(100, Math.round((totalSpent / totalBudget) * 100))

  const recent = [...expenses]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  const [year, month] = state.selectedMonth.split('-').map(Number)
  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const overBudget = categories.filter(c => c.spent >= c.limit)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm">Good {getGreeting()}</p>
          <h1 className="text-slate-100 text-2xl font-bold">{user.name} 👋</h1>
          <p className="text-slate-600 text-xs mt-0.5">{monthLabel}</p>
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-full bg-emerald-900/40 border border-emerald-700/40 text-xl flex items-center justify-center hover:bg-emerald-900/60 transition-colors"
        >
          👤
        </button>
      </div>

      {/* Monthly summary card */}
      <Card className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-wide">Total Spent</p>
            <p className="text-slate-100 text-3xl font-extrabold mt-0.5">{formatAmount(totalSpent, currency)}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Remaining</p>
            <p className={`text-2xl font-bold mt-0.5 ${totalLeft < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {formatAmount(totalLeft, currency)}
            </p>
          </div>
        </div>

        {/* Master progress bar */}
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            role="progressbar"
            aria-valuenow={overallPct}
            aria-valuemin={0}
            aria-valuemax={100}
            className={`h-full rounded-full transition-all ${overallPct >= 95 ? 'bg-red-500' : overallPct >= 75 ? 'bg-amber-400' : 'bg-emerald-400'}`}
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-slate-500">
          <span>{overallPct}% used</span>
          <span>Budget: {formatAmount(totalBudget, currency)}</span>
        </div>
      </Card>

      {/* Over-budget alerts */}
      {overBudget.length > 0 && (
        <div className="bg-red-950/40 border border-red-800/40 rounded-2xl px-4 py-3 flex items-start gap-3">
          <span className="text-red-400 text-xl mt-0.5">⚠️</span>
          <div>
            <p className="text-red-300 font-semibold text-sm">Over budget</p>
            <p className="text-red-400/80 text-xs mt-0.5">
              {overBudget.map(c => c.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Category quick-scroll */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-slate-100 font-semibold text-sm uppercase tracking-wide">Categories</h2>
          <button onClick={() => navigate('/budget')} className="text-emerald-400 text-xs hover:text-emerald-300 transition-colors">View all →</button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {categories.map(cat => (
            <AnimalGuide
              key={cat.id}
              category={cat}
              currency={currency}
              onClick={() => navigate('/log', { state: { preselect: cat.id } })}
            />
          ))}
        </div>
      </div>

      {/* Recent expenses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-slate-100 font-semibold text-sm uppercase tracking-wide">Recent</h2>
          <button onClick={() => navigate('/log')} className="text-emerald-400 text-xs hover:text-emerald-300 transition-colors">See all →</button>
        </div>
        <Card>
          {recent.length === 0 && (
            <p className="text-slate-600 text-sm text-center py-6">No expenses yet</p>
          )}
          {recent.map((exp, i) => {
            const cat = categories.find(c => c.id === exp.categoryId)
            return (
              <div
                key={exp.id}
                className={`flex items-center gap-3 px-4 py-3 ${i < recent.length - 1 ? 'border-b border-slate-800' : ''}`}
              >
                <span className="text-xl">{cat?.animal ?? '💸'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-100 text-sm font-medium truncate">{exp.note}</p>
                  <p className="text-slate-500 text-xs">{friendlyDate(exp.date)}</p>
                </div>
                <span className="text-slate-200 font-semibold text-sm tabular-nums">
                  {formatAmount(exp.amount, currency)}
                </span>
              </div>
            )
          })}
        </Card>
      </div>
    </div>
  )
}
