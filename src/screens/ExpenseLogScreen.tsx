import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useBudget } from '../context/BudgetContext'
import { Card } from '../components/Card'
import { formatAmount } from '../utils/formatAmount'
import { friendlyDate } from '../utils/dateHelpers'
import type { Expense } from '../context/types'

function generateId(): string {
  return `exp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function ExpenseLogScreen() {
  const { state, dispatch } = useBudget()
  const { categories, expenses, user } = state
  const currency = user.currency
  const location = useLocation()
  const preselectId = (location.state as { preselect?: string } | null)?.preselect ?? categories[0]?.id

  // Form state
  const [categoryId, setCategoryId] = useState(preselectId)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Filter
  const [filterCat, setFilterCat] = useState<string>('all')
  const [search, setSearch] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) { setError('Enter a valid amount greater than 0'); return }
    if (!note.trim())           { setError('Add a short note'); return }
    setError('')

    const expense: Expense = {
      id: generateId(),
      categoryId,
      amount: amt,
      note: note.trim(),
      date,
    }
    dispatch({ type: 'ADD_EXPENSE', payload: expense })
    setAmount('')
    setNote('')
    setSuccessMsg('Expense logged!')
    setTimeout(() => setSuccessMsg(''), 2500)
  }

  const filtered = [...expenses]
    .filter(e => filterCat === 'all' || e.categoryId === filterCat)
    .filter(e => !search || e.note.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-slate-100 text-2xl font-bold">Expense Log 📋</h1>

      {/* Add expense form */}
      <Card className="p-5">
        <h2 className="text-slate-100 font-semibold mb-4">Log an expense</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Category */}
          <div>
            <label className="text-slate-500 text-xs uppercase tracking-wide block mb-1">Category</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.animal} {cat.name}</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="text-slate-500 text-xs uppercase tracking-wide block mb-1">
              Amount ({currency.symbol})
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
            />
          </div>

          {/* Note */}
          <div>
            <label className="text-slate-500 text-xs uppercase tracking-wide block mb-1">Note</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="What did you spend on?"
              maxLength={80}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-slate-500 text-xs uppercase tracking-wide block mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 [color-scheme:dark]"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}
          {successMsg && <p className="text-emerald-400 text-xs">{successMsg}</p>}

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
          >
            Add Expense
          </button>
        </form>
      </Card>

      {/* Expense list */}
      <div>
        <div className="flex gap-2 mb-3">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes…"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
          />
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.animal} {cat.name}</option>
            ))}
          </select>
        </div>

        <Card>
          {filtered.length === 0 && (
            <p className="text-slate-600 text-sm text-center py-8">No expenses found</p>
          )}
          {filtered.map((exp, i) => {
            const cat = categories.find(c => c.id === exp.categoryId)
            return (
              <div
                key={exp.id}
                className={`flex items-center gap-3 px-4 py-3 ${i < filtered.length - 1 ? 'border-b border-slate-800' : ''}`}
              >
                <span className="text-xl flex-shrink-0">{cat?.animal ?? '💸'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-100 text-sm font-medium truncate">{exp.note}</p>
                  <p className="text-slate-500 text-xs">{cat?.name} · {friendlyDate(exp.date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-200 font-semibold text-sm tabular-nums">
                    {formatAmount(exp.amount, currency)}
                  </span>
                  <button
                    onClick={() => dispatch({ type: 'DELETE_EXPENSE', payload: { id: exp.id } })}
                    className="text-slate-700 hover:text-red-400 transition-colors text-base"
                    aria-label="Delete expense"
                  >
                    🗑
                  </button>
                </div>
              </div>
            )
          })}
        </Card>
      </div>
    </div>
  )
}
