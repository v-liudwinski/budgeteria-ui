import { useState } from 'react'
import { useBudget } from '../context/BudgetContext'
import { formatAmount } from '../utils/formatAmount'
import type { Category } from '../context/types'

type SortMode = 'spent' | 'remaining' | 'alpha'

function getBubbleSize(pct: number): number {
  // min 72px, max 160px
  return 72 + Math.round(pct * 0.88)
}

function getBubbleGradient(pct: number, color: string): string {
  if (pct >= 95) return 'from-red-600 to-red-800'
  if (pct >= 75) return 'from-amber-500 to-amber-700'
  const map: Record<string, string> = {
    emerald: 'from-emerald-500 to-emerald-700',
    amber:   'from-amber-500 to-amber-700',
    sky:     'from-sky-500 to-sky-700',
    violet:  'from-violet-500 to-violet-700',
    slate:   'from-slate-500 to-slate-700',
    green:   'from-green-500 to-green-700',
    pink:    'from-pink-500 to-pink-700',
    orange:  'from-orange-500 to-orange-700',
    indigo:  'from-indigo-500 to-indigo-700',
    zinc:    'from-zinc-500 to-zinc-700',
  }
  return map[color] ?? 'from-slate-500 to-slate-700'
}

function Bubble({ cat, currency, onSelect }: {
  cat: Category
  currency: { code: string; symbol: string; locale: string }
  onSelect: (cat: Category) => void
}) {
  const pct = Math.min(100, Math.round((cat.spent / cat.limit) * 100))
  const size = getBubbleSize(pct)
  const gradient = getBubbleGradient(pct, cat.color)

  return (
    <button
      onClick={() => onSelect(cat)}
      title={cat.name}
      style={{ width: size, height: size }}
      className={`bg-gradient-to-br ${gradient} rounded-full flex flex-col items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform duration-150 flex-shrink-0`}
    >
      <span style={{ fontSize: size > 100 ? '1.75rem' : '1.1rem' }}>{cat.animal}</span>
      {size > 90 && (
        <span className="text-white/80 text-xs font-semibold mt-0.5">{pct}%</span>
      )}
    </button>
  )
}

function CategoryDetail({ cat, currency, onClose, onUpdateLimit }: {
  cat: Category
  currency: { code: string; symbol: string; locale: string }
  onClose: () => void
  onUpdateLimit: (id: string, limit: number) => void
}) {
  const pct = Math.min(100, Math.round((cat.spent / cat.limit) * 100))
  const [editing, setEditing] = useState(false)
  const [limitInput, setLimitInput] = useState(String(cat.limit))

  function handleSave() {
    const val = parseFloat(limitInput)
    if (!isNaN(val) && val > 0) {
      onUpdateLimit(cat.id, val)
    }
    setEditing(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-t-3xl md:rounded-2xl w-full md:w-96 p-6 z-10">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-4xl">{cat.animal}</span>
          <div>
            <h3 className="text-slate-100 font-bold text-lg">{cat.name}</h3>
            <p className={`text-sm font-semibold ${pct >= 95 ? 'text-red-400' : pct >= 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {pct}% used
            </p>
          </div>
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-slate-300 text-xl">✕</button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Spent</span>
            <span className="text-slate-100 font-semibold">{formatAmount(cat.spent, currency)}</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-slate-400">Budget limit</span>
            {editing ? (
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={limitInput}
                  onChange={e => setLimitInput(e.target.value)}
                  className="w-24 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-slate-100 text-sm text-right focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
                <button onClick={handleSave} className="text-emerald-400 text-xs font-semibold">Save</button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="text-slate-100 font-semibold hover:text-emerald-400 transition-colors"
              >
                {formatAmount(cat.limit, currency)} ✏️
              </button>
            )}
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Remaining</span>
            <span className={`font-semibold ${cat.limit - cat.spent < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {formatAmount(cat.limit - cat.spent, currency)}
            </span>
          </div>

          <div className="h-2 bg-slate-700 rounded-full overflow-hidden mt-2">
            <div
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              className={`h-full rounded-full ${pct >= 95 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-400' : 'bg-emerald-400'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export function BubbleBudgetScreen() {
  const { state, dispatch } = useBudget()
  const { categories, user } = state
  const currency = user.currency
  const [sort, setSort] = useState<SortMode>('spent')
  const [selected, setSelected] = useState<Category | null>(null)

  const totalBudget = categories.reduce((s, c) => s + c.limit, 0)
  const totalSpent  = categories.reduce((s, c) => s + c.spent, 0)

  const sorted = [...categories].sort((a, b) => {
    if (sort === 'spent')     return (b.spent / b.limit) - (a.spent / a.limit)
    if (sort === 'remaining') return (a.limit - a.spent) - (b.limit - b.spent)
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-slate-100 text-2xl font-bold">Bubble Budget 🫧</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {formatAmount(totalSpent, currency)} of {formatAmount(totalBudget, currency)} used
        </p>
      </div>

      {/* Sort controls */}
      <div className="flex gap-2">
        {(['spent', 'remaining', 'alpha'] as SortMode[]).map(s => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
              sort === s ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {s === 'spent' ? '% spent' : s === 'remaining' ? 'remaining' : 'A–Z'}
          </button>
        ))}
      </div>

      {/* Bubble canvas */}
      <div className="flex flex-wrap gap-4 items-end min-h-48">
        {sorted.map(cat => (
          <Bubble key={cat.id} cat={cat} currency={currency} onSelect={setSelected} />
        ))}
      </div>

      {/* Detail modal */}
      {selected && (
        <CategoryDetail
          cat={selected}
          currency={currency}
          onClose={() => setSelected(null)}
          onUpdateLimit={(id, limit) => {
            dispatch({ type: 'UPDATE_CATEGORY_LIMIT', payload: { id, limit } })
            setSelected(prev => prev ? { ...prev, limit } : null)
          }}
        />
      )}
    </div>
  )
}
