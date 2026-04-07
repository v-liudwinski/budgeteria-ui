import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { planApi } from '../api/planApi'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { ProgressRing } from '../components/ProgressRing'
import { useToast } from '../components/Toast'
import { formatAmount } from '../utils/formatAmount'
import { formatDisplayDate } from '../utils/dateHelpers'
import { Plus, Target, Pencil, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react'
import type { FinancialGoal } from '../api/types'
import { useTranslation } from 'react-i18next'

const GOAL_SUGGESTIONS = [
  { emoji: '🆘', name: 'Emergency Fund', priority: 'short' as const, amount: 5000 },
  { emoji: '✈️', name: 'Vacation',       priority: 'medium' as const, amount: 3000 },
  { emoji: '🚗', name: 'New Car',        priority: 'long' as const, amount: 20000 },
  { emoji: '🏠', name: 'Home Down Payment', priority: 'long' as const, amount: 50000 },
  { emoji: '📚', name: 'Education Fund', priority: 'long' as const, amount: 15000 },
  { emoji: '💰', name: 'Retirement',     priority: 'long' as const, amount: 100000 },
  { emoji: '💍', name: 'Wedding',        priority: 'medium' as const, amount: 15000 },
  { emoji: '🏥', name: 'Health Fund',    priority: 'short' as const, amount: 2000 },
  { emoji: '🎁', name: 'Gift Fund',      priority: 'short' as const, amount: 500 },
  { emoji: '🛠️', name: 'Home Repairs',   priority: 'medium' as const, amount: 8000 },
]

const PRIORITY_COLORS: Record<string, string> = {
  short: 'bg-emerald-50 text-emerald-700',
  medium: 'bg-sky-50 text-sky-700',
  long: 'bg-violet-50 text-violet-700',
}

function computeContribution(target: number, current: number, deadline: string): number {
  const monthsLeft = Math.max(1, Math.ceil((new Date(deadline).getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)))
  return Math.max(0, Math.ceil((target - current) / monthsLeft))
}

export function GoalsScreen() {
  const { plan, upsertPlan } = useApp()
  const { toast } = useToast()
  const { t } = useTranslation()

  const PRIORITY_LABELS: Record<string, string> = {
    short: t('goals.short'),
    medium: t('goals.medium'),
    long: t('goals.long'),
  }

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formTarget, setFormTarget] = useState('')
  const [formCurrent, setFormCurrent] = useState('')
  const [formDeadline, setFormDeadline] = useState('')
  const [formPriority, setFormPriority] = useState<'short' | 'medium' | 'long'>('medium')
  const [formContribution, setFormContribution] = useState('')

  if (!plan) return null
  const { goals, currency } = plan

  function resetForm() {
    setFormName('')
    setFormTarget('')
    setFormCurrent('')
    setFormDeadline('')
    setFormPriority('medium')
    setFormContribution('')
    setShowForm(false)
    setEditingId(null)
  }

  function openCreate() {
    resetForm()
    setShowForm(true)
  }

  function openEdit(goal: FinancialGoal) {
    setFormName(goal.name)
    setFormTarget(String(goal.targetAmount))
    setFormCurrent(String(goal.currentAmount))
    setFormDeadline(goal.deadline)
    setFormPriority(goal.priority)
    setFormContribution(String(goal.monthlyContribution))
    setEditingId(goal.id)
    setShowForm(true)
  }

  function addFromSuggestion(s: typeof GOAL_SUGGESTIONS[0]) {
    const months = s.priority === 'short' ? 6 : s.priority === 'medium' ? 18 : 36
    const deadlineDate = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    setFormName(`${s.emoji} ${s.name}`)
    setFormTarget(String(s.amount))
    setFormCurrent('0')
    setFormDeadline(deadlineDate)
    setFormPriority(s.priority)
    setFormContribution(String(Math.ceil(s.amount / months)))
    setEditingId(null)
    setShowForm(true)
  }

  async function handleSave() {
    const targetAmt = parseFloat(formTarget)
    const currentAmt = parseFloat(formCurrent) || 0
    if (!formName.trim() || isNaN(targetAmt) || targetAmt <= 0) return

    const deadlineDate = formDeadline || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const contribution = parseFloat(formContribution) || computeContribution(targetAmt, currentAmt, deadlineDate)

    const goal: FinancialGoal = {
      id: editingId || `goal-${Date.now()}`,
      name: formName.trim(),
      targetAmount: targetAmt,
      currentAmount: Math.min(currentAmt, targetAmt),
      deadline: deadlineDate,
      priority: formPriority,
      monthlyContribution: contribution,
    }

    const newGoals = editingId
      ? goals.map(g => g.id === editingId ? goal : g)
      : [...goals, goal]

    const updated = { ...plan!, goals: newGoals }
    upsertPlan(updated)
    resetForm()

    try {
      await planApi.updatePlan(plan!.id, { goals: newGoals })
      toast(editingId ? t('goals.saveChanges') : t('goals.addGoalBtn'))
    } catch {
      toast(t('categories.saveFailed'), 'error')
    }
  }

  async function handleDelete(id: string) {
    const newGoals = goals.filter(g => g.id !== id)
    const updated = { ...plan!, goals: newGoals }
    upsertPlan(updated)
    if (expandedId === id) setExpandedId(null)

    try {
      await planApi.updatePlan(plan!.id, { goals: newGoals })
      toast(t('goals.remove'))
    } catch {
      toast(t('categories.saveFailed'), 'error')
    }
  }

  async function handleUpdateProgress(goal: FinancialGoal, newAmount: number) {
    const clamped = Math.max(0, Math.min(newAmount, goal.targetAmount))
    const newGoals = goals.map(g => g.id === goal.id ? { ...g, currentAmount: clamped } : g)
    const updated = { ...plan!, goals: newGoals }
    upsertPlan(updated)

    try {
      await planApi.updatePlan(plan!.id, { goals: newGoals })
      if (clamped >= goal.targetAmount) {
        toast(t('goals.goalCompleted'), 'success')
      }
    } catch {
      toast(t('categories.saveFailed'), 'error')
    }
  }

  // Stats
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0)
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0)
  const totalContributions = goals.reduce((s, g) => s + g.monthlyContribution, 0)
  const overallPct = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0

  const availableSuggestions = GOAL_SUGGESTIONS.filter(s => !goals.some(g => g.name.includes(s.name)))

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">{t('goals.title')}</h1>
          <p className="text-brand-muted text-sm mt-0.5">
            {goals.length !== 1 ? t('goals.subtitle_other', { count: goals.length }) : t('goals.subtitle', { count: goals.length })}
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus size={16} strokeWidth={2.2} />
          {t('goals.addGoal')}
        </Button>
      </div>

      {/* Overview card */}
      {goals.length > 0 && (
        <div className="bg-gradient-to-br from-violet-50 via-white to-sky-50 border border-brand-border rounded-3xl p-6 shadow-soft relative overflow-hidden animate-fade-in-up delay-75">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-violet-200/20 rounded-full blur-2xl" />
          <div className="relative flex items-center gap-5">
            <ProgressRing
              value={overallPct}
              size={80}
              color={overallPct >= 80 ? 'text-brand-success' : overallPct >= 40 ? 'text-brand-blue' : 'text-brand-warning'}
              label={t('dashboard.used')}
            />
            <div className="flex-1">
              <p className="text-brand-muted text-xs uppercase tracking-wide">{t('goals.totalSaved')}</p>
              <p className="text-2xl font-extrabold text-brand-navy">
                {formatAmount(totalSaved, currency)}
              </p>
              <p className="text-brand-muted text-xs mt-1">
                of {formatAmount(totalTarget, currency)} · {formatAmount(totalContributions, currency)}/mo
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {goals.length === 0 && !showForm && (
        <Card className="p-8 text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-50 mb-3">
            <Target size={28} className="text-violet-500" />
          </div>
          <p className="text-brand-navy font-semibold mb-1">{t('goals.noGoals')}</p>
          <p className="text-brand-muted text-sm mb-4">{t('goals.noGoalsDesc')}</p>
          <Button size="sm" onClick={openCreate}>
            <Plus size={16} strokeWidth={2.2} />
            {t('goals.createFirst')}
          </Button>
        </Card>
      )}

      {/* Goal cards */}
      {goals.map(goal => {
        const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0
        const isExpanded = expandedId === goal.id
        const ringColor = pct >= 100 ? 'text-brand-success' : pct >= 50 ? 'text-brand-blue' : 'text-brand-warning'

        return (
          <Card key={goal.id} className="overflow-hidden animate-fade-in-up">
            {/* Main row */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : goal.id)}
              className="flex items-center gap-4 w-full p-4 text-left hover:bg-brand-bg/30 transition-colors"
            >
              <ProgressRing value={pct} size={56} color={ringColor} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-brand-navy text-sm font-semibold truncate">{goal.name}</p>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${PRIORITY_COLORS[goal.priority]}`}>
                    {PRIORITY_LABELS[goal.priority]}
                  </span>
                </div>
                <p className="text-brand-muted text-xs mt-0.5">
                  {formatAmount(goal.currentAmount, currency)} of {formatAmount(goal.targetAmount, currency)}
                </p>
                {/* Mini progress bar */}
                <div className="h-1.5 bg-brand-border rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? 'bg-brand-success' : pct >= 50 ? 'bg-brand-blue' : 'bg-brand-warning'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              {isExpanded ? <ChevronUp size={16} className="text-brand-muted" /> : <ChevronDown size={16} className="text-brand-muted" />}
            </button>

            {/* Expanded details */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-1 border-t border-brand-border space-y-3 animate-fade-in-up">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-brand-bg rounded-xl p-2.5 text-center">
                    <p className="text-brand-muted text-[10px] uppercase tracking-wide">{t('goals.monthlyLabel')}</p>
                    <p className="text-brand-navy font-bold text-xs">{formatAmount(goal.monthlyContribution, currency)}</p>
                  </div>
                  <div className="bg-brand-bg rounded-xl p-2.5 text-center">
                    <p className="text-brand-muted text-[10px] uppercase tracking-wide">{t('goals.deadlineLabel')}</p>
                    <p className="text-brand-navy font-bold text-xs">{formatDisplayDate(goal.deadline)}</p>
                  </div>
                  <div className="bg-brand-bg rounded-xl p-2.5 text-center">
                    <p className="text-brand-muted text-[10px] uppercase tracking-wide">{t('goals.remaining')}</p>
                    <p className="text-brand-navy font-bold text-xs">{formatAmount(Math.max(0, goal.targetAmount - goal.currentAmount), currency)}</p>
                  </div>
                </div>

                {/* Log contribution */}
                <div>
                  <label className="text-brand-navy text-xs font-semibold block mb-1.5">{t('goals.logContribution')} ({currency.symbol})</label>
                  <div className="flex gap-2">
                    <input
                      id={`contrib-${goal.id}`}
                      type="number"
                      placeholder={t('goals.contributionPlaceholder')}
                      min={0}
                      step="1"
                      className="flex-1 bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-brand-navy text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 placeholder:text-brand-muted/50"
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(`contrib-${goal.id}`) as HTMLInputElement
                        const val = parseFloat(input.value)
                        if (!isNaN(val) && val > 0) {
                          handleUpdateProgress(goal, goal.currentAmount + val)
                          input.value = ''
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600 transition-colors"
                    >
                      {t('common.add')}
                    </button>
                  </div>
                  <p className="text-brand-muted text-[10px] mt-1">
                    {t('goals.needPerMonth', { amount: formatAmount(computeContribution(goal.targetAmount, goal.currentAmount, goal.deadline), currency) })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(goal)} className="flex-1">
                    <Pencil size={14} />
                    {t('common.edit')}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(goal.id)} className="flex-1">
                    <Trash2 size={14} />
                    {t('goals.remove')}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )
      })}

      {/* Suggestions */}
      {availableSuggestions.length > 0 && !showForm && (
        <div className="animate-fade-in-up">
          <h2 className="text-brand-navy font-semibold text-sm uppercase tracking-wide mb-2">{t('goals.suggestions')}</h2>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.map(s => (
              <button
                key={s.name}
                onClick={() => addFromSuggestion(s)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-brand-border bg-white text-brand-muted text-xs font-medium hover:border-brand-blue/40 hover:text-brand-navy hover:shadow-sm transition-all"
              >
                <span>{s.emoji}</span> {s.name}
                <span className="text-brand-muted/60">{formatAmount(s.amount, currency)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create / Edit form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" onClick={resetForm} />
          <div className="relative bg-white border border-brand-border rounded-t-3xl md:rounded-2xl w-full md:max-w-md p-6 z-10 shadow-soft animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-brand-navy font-bold text-lg">
                {editingId ? t('goals.editGoal') : t('goals.newGoal')}
              </h3>
              <button onClick={resetForm} className="text-brand-muted hover:text-brand-navy transition-colors p-1">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-brand-navy text-xs font-semibold block mb-1">{t('goals.goalName')}</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder={t('goals.goalNamePlaceholder')}
                  autoFocus
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-navy text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 placeholder:text-brand-muted/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-brand-navy text-xs font-semibold block mb-1">{t('goals.target')} ({currency.symbol})</label>
                  <input
                    type="number"
                    value={formTarget}
                    onChange={e => setFormTarget(e.target.value)}
                    placeholder="10,000"
                    min="1"
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-navy text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 placeholder:text-brand-muted/50"
                  />
                </div>
                <div>
                  <label className="text-brand-navy text-xs font-semibold block mb-1">{t('goals.savedSoFar')} ({currency.symbol})</label>
                  <input
                    type="number"
                    value={formCurrent}
                    onChange={e => setFormCurrent(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-navy text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 placeholder:text-brand-muted/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-brand-navy text-xs font-semibold block mb-1">{t('goals.deadline')}</label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={e => setFormDeadline(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-navy text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 [color-scheme:light]"
                  />
                </div>
                <div>
                  <label className="text-brand-navy text-xs font-semibold block mb-1">{t('goals.monthly')} ({currency.symbol})</label>
                  <input
                    type="number"
                    value={formContribution}
                    onChange={e => setFormContribution(e.target.value)}
                    placeholder={t('goals.autoCalc')}
                    min="0"
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-3.5 py-2.5 text-brand-navy text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 placeholder:text-brand-muted/50"
                  />
                </div>
              </div>

              {/* Priority selector */}
              <div>
                <label className="text-brand-navy text-xs font-semibold block mb-1.5">{t('goals.priority')}</label>
                <div className="flex gap-2">
                  {(['short', 'medium', 'long'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormPriority(p)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                        formPriority === p
                          ? `${PRIORITY_COLORS[p]} border-current shadow-sm`
                          : 'border-brand-border text-brand-muted hover:border-brand-blue/40'
                      }`}
                    >
                      {PRIORITY_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="secondary" onClick={resetForm} className="flex-1">
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!formName.trim() || !formTarget || parseFloat(formTarget) <= 0}
                  className="flex-1"
                >
                  {editingId ? t('goals.saveChanges') : t('goals.addGoalBtn')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
