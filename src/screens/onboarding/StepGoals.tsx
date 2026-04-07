import { useState } from 'react'
import type { Currency, FinancialGoal } from '../../api/types'
import { formatAmount } from '../../utils/formatAmount'
import { Button } from '../../components/Button'
import { Pencil, X, Plus, Target } from 'lucide-react'

type Props = {
  goals: FinancialGoal[]
  setGoals: (v: FinancialGoal[]) => void
  currency: Currency
  onNext: () => void
  onBack: () => void
  isLoading: boolean
}

const GOAL_SUGGESTIONS = [
  { emoji: '🆘', name: 'Emergency Fund', priority: 'short' as const, amount: 5000 },
  { emoji: '✈️', name: 'Vacation',       priority: 'medium' as const, amount: 3000 },
  { emoji: '🚗', name: 'New Car',        priority: 'long' as const, amount: 20000 },
  { emoji: '🏠', name: 'Home Down Payment', priority: 'long' as const, amount: 50000 },
  { emoji: '📚', name: 'Education Fund', priority: 'long' as const, amount: 15000 },
  { emoji: '💰', name: 'Retirement',     priority: 'long' as const, amount: 100000 },
]

const PRIORITY_LABELS: Record<string, string> = {
  short: 'Short-term',
  medium: 'Medium-term',
  long: 'Long-term',
}

function computeContribution(target: number, current: number, deadline: string): number {
  const monthsLeft = Math.max(1, Math.ceil((new Date(deadline).getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)))
  return Math.max(0, Math.ceil((target - current) / monthsLeft))
}

function defaultDeadline(priority: 'short' | 'medium' | 'long'): string {
  const months = priority === 'short' ? 6 : priority === 'medium' ? 18 : 36
  return new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export function StepGoals({ goals, setGoals, currency, onNext, onBack, isLoading }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [current, setCurrent] = useState('')
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState<'short' | 'medium' | 'long'>('medium')

  function resetForm() {
    setName('')
    setTarget('')
    setCurrent('')
    setDeadline('')
    setPriority('medium')
    setEditingId(null)
  }

  function openCreate() {
    resetForm()
    setEditingId('new')
  }

  function openEdit(goal: FinancialGoal) {
    setName(goal.name)
    setTarget(String(goal.targetAmount))
    setCurrent(String(goal.currentAmount))
    setDeadline(goal.deadline)
    setPriority(goal.priority)
    setEditingId(goal.id)
  }

  function openFromSuggestion(s: typeof GOAL_SUGGESTIONS[0]) {
    const dl = defaultDeadline(s.priority)
    setName(`${s.emoji} ${s.name}`)
    setTarget(String(s.amount))
    setCurrent('0')
    setDeadline(dl)
    setPriority(s.priority)
    setEditingId('new')
  }

  function saveGoal() {
    const targetAmt = parseFloat(target)
    if (!name.trim() || isNaN(targetAmt) || targetAmt <= 0) return

    const currentAmt = parseFloat(current) || 0
    const deadlineDate = deadline || defaultDeadline(priority)
    const contribution = computeContribution(targetAmt, currentAmt, deadlineDate)

    const goal: FinancialGoal = {
      id: editingId === 'new' ? `goal-${Date.now()}` : editingId!,
      name: name.trim(),
      targetAmount: targetAmt,
      currentAmount: currentAmt,
      deadline: deadlineDate,
      priority,
      monthlyContribution: contribution,
    }

    if (editingId === 'new') {
      setGoals([...goals, goal])
    } else {
      setGoals(goals.map(g => g.id === editingId ? goal : g))
    }
    resetForm()
  }

  function removeGoal(id: string) {
    setGoals(goals.filter(g => g.id !== id))
    if (editingId === id) resetForm()
  }

  const isFormOpen = editingId !== null

  return (
    <div>
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-50 mb-3">
        <Target size={24} className="text-violet-500" />
      </div>
      <h2 className="text-xl font-bold text-brand-navy mb-1">Financial goals</h2>
      <p className="text-brand-muted text-sm mb-6">
        Optional but recommended. What are you saving for?
      </p>

      {/* Quick add suggestions */}
      {!isFormOpen && goals.length < 6 && (
        <div className="mb-4">
          <p className="text-brand-navy text-xs font-semibold uppercase tracking-wide mb-2">Quick add</p>
          <div className="flex flex-wrap gap-2">
            {GOAL_SUGGESTIONS
              .filter(s => !goals.some(g => g.name.includes(s.name)))
              .map(s => (
                <button
                  key={s.name}
                  onClick={() => openFromSuggestion(s)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-border bg-white text-brand-muted text-xs font-medium hover:border-brand-blue/40 hover:text-brand-navy transition-all"
                >
                  <span>{s.emoji}</span> {s.name}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Added goals */}
      {goals.length > 0 && (
        <div className="space-y-2 mb-4">
          {goals.map(g => (
            <div key={g.id} className="flex items-center gap-3 bg-brand-bg border border-brand-border rounded-xl px-3 py-2.5">
              <button
                onClick={() => openEdit(g)}
                className="flex-1 min-w-0 text-left"
              >
                <p className="text-brand-navy text-sm font-medium truncate">{g.name}</p>
                <p className="text-brand-muted text-xs">
                  {formatAmount(g.targetAmount, currency)} · {formatAmount(g.monthlyContribution, currency)}/mo · {PRIORITY_LABELS[g.priority]}
                </p>
              </button>
              <button
                onClick={() => openEdit(g)}
                className="text-brand-muted hover:text-brand-blue transition-colors p-1"
                aria-label={`Edit ${g.name}`}
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => removeGoal(g.id)}
                className="text-brand-muted hover:text-brand-danger transition-colors p-1"
                aria-label={`Remove ${g.name}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Goal form (create or edit) */}
      {isFormOpen ? (
        <div className="bg-brand-bg border border-brand-border rounded-xl p-3 space-y-2.5 mb-4 animate-fade-in-up">
          <p className="text-brand-navy text-xs font-semibold">
            {editingId === 'new' ? 'New goal' : 'Edit goal'}
          </p>

          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Goal name"
            autoFocus
            className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/40 placeholder:text-brand-muted/60"
          />

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-brand-muted text-[10px] uppercase tracking-wide block mb-0.5">Target ({currency.symbol})</label>
              <input
                type="number"
                value={target}
                onChange={e => setTarget(e.target.value)}
                placeholder="10,000"
                min="1"
                className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/40 placeholder:text-brand-muted/60"
              />
            </div>
            <div className="flex-1">
              <label className="text-brand-muted text-[10px] uppercase tracking-wide block mb-0.5">Saved so far</label>
              <input
                type="number"
                value={current}
                onChange={e => setCurrent(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/40 placeholder:text-brand-muted/60"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-brand-muted text-[10px] uppercase tracking-wide block mb-0.5">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/40 [color-scheme:light]"
              />
            </div>
            <div className="flex-1">
              <label className="text-brand-muted text-[10px] uppercase tracking-wide block mb-0.5">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as typeof priority)}
                className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              >
                <option value="short">Short-term</option>
                <option value="medium">Medium-term</option>
                <option value="long">Long-term</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={resetForm} className="flex-1">
              Cancel
            </Button>
            <Button size="sm" onClick={saveGoal} disabled={!name.trim() || !target || parseFloat(target) <= 0} className="flex-1">
              {editingId === 'new' ? 'Add Goal' : 'Save Changes'}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={openCreate}
          variant="dashed"
          size="md"
          className="w-full mb-4"
        >
          <Plus size={16} strokeWidth={2} />
          Add custom goal
        </Button>
      )}

      <div className="flex gap-3 mt-4">
        <Button variant="secondary" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} disabled={isLoading || isFormOpen} className="flex-[2]">
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Creating plan...
            </span>
          ) : goals.length === 0 ? 'Skip & Create Plan' : 'Create Plan'}
        </Button>
      </div>
    </div>
  )
}
