import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApp } from '../context/AppContext'
import { useAuth } from '../auth/AuthProvider'
import { expenseApi } from '../api/expenseApi'
import { queryKeys } from '../api/queryKeys'
import { Card } from '../components/Card'
import { CategoryChip } from '../components/CategoryChip'
import { Button } from '../components/Button'
import { useToast } from '../components/Toast'
import { formatAmount } from '../utils/formatAmount'
import { friendlyDate } from '../utils/dateHelpers'
import { Search, Receipt, Trash2 } from 'lucide-react'
import type { Expense, FamilyPlan } from '../api/types'
import { useTranslation } from 'react-i18next'

export function ExpenseLogScreen() {
  const { plan } = useApp()
  const { user } = useAuth()
  const { t } = useTranslation()
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [error, setError] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const queryClient = useQueryClient()
  const { toast } = useToast()
  const planId = plan?.id ?? ''

  const { data: expenses = [], isLoading: isLoadingExpenses } = useQuery({
    queryKey: queryKeys.expenses(planId),
    queryFn: () => expenseApi.getExpenses(planId),
    enabled: !!plan,
  })

  /** Patch the spent amount on a category inside the plans cache. */
  function patchPlanSpent(categoryId: string, delta: number) {
    queryClient.setQueryData<FamilyPlan[]>(queryKeys.plans, (old = []) =>
      old.map(p =>
        p.id !== planId ? p : {
          ...p,
          categories: p.categories.map(c =>
            c.id === categoryId ? { ...c, spent: Math.max(0, c.spent + delta) } : c
          ),
        }
      )
    )
  }

  const addExpenseMutation = useMutation({
    mutationFn: (data: Omit<Expense, 'id'>) => expenseApi.addExpense(planId, data),
    onSuccess: (expense) => {
      queryClient.setQueryData<Expense[]>(queryKeys.expenses(planId), (old = []) => [expense, ...old])
      patchPlanSpent(expense.categoryId, expense.amount)
    },
  })

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => expenseApi.deleteExpense(planId, id),
    onMutate: (id) => {
      const current = queryClient.getQueryData<Expense[]>(queryKeys.expenses(planId)) ?? []
      return { target: current.find(e => e.id === id) ?? null }
    },
    onSuccess: (_, id, context) => {
      queryClient.setQueryData<Expense[]>(queryKeys.expenses(planId), (old = []) => old.filter(e => e.id !== id))
      if (context?.target) patchPlanSpent(context.target.categoryId, -context.target.amount)
    },
  })

  useEffect(() => {
    if (!plan) return
    if (!categoryId && plan.categories.length > 0) setCategoryId(plan.categories[0].id)
  }, [categoryId, plan])

  if (!plan) return null
  const { categories, currency } = plan

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) { setError(t('log.invalidAmount')); return }
    setError('')

    try {
      const cat = categories.find(c => c.id === categoryId)
      const member = plan?.members.find(m => m.userId === user?.id)
      if (!member) { toast('Could not find your member profile. Try refreshing.', 'error'); return }
      await addExpenseMutation.mutateAsync({
        categoryId,
        amount: amt,
        note: note.trim() || cat?.name || 'Expense',
        date,
        memberId: member.id,
        memberName: user?.name || member.name || member.email,
      })
      setAmount('')
      setNote('')
      toast(t('log.expenseLogged'))
    } catch (err) {
      console.error(err)
      toast(t('log.logFailed'), 'error')
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await deleteExpenseMutation.mutateAsync(id)
      toast(t('log.deleteConfirm'))
    } catch (err) {
      console.error(err)
      toast(t('log.deleteFailed'), 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = expenses
    .filter(e => filterCat === 'all' || e.categoryId === filterCat)
    .filter(e => !search || e.note.toLowerCase().includes(search.toLowerCase()))
  const filteredTotal = filtered.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-brand-navy animate-fade-in-up">{t('log.title')}</h1>

      <Card className="p-5 animate-fade-in-up delay-75">
        <h2 className="text-brand-navy font-semibold mb-4">{t('log.logExpense')}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-brand-navy text-xs font-semibold uppercase tracking-wide block mb-1">{t('log.category')}</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <CategoryChip key={cat.id} label={cat.name} emoji={cat.emoji}
                  selected={cat.id === categoryId} onClick={() => setCategoryId(cat.id)} hideLabelOnSm />
              ))}
            </div>
          </div>
          <div>
            <label className="text-brand-navy text-xs font-semibold uppercase tracking-wide block mb-1">{t('log.amount')} ({currency.symbol})</label>
            <input type="number" inputMode="decimal" step="0.01" min="0.01" value={amount}
              onChange={e => setAmount(e.target.value)} placeholder={t('log.amountPlaceholder')}
              className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-brand-navy font-bold text-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/40 placeholder:text-brand-muted/40" />
          </div>
          <div>
            <label className="text-brand-navy text-xs font-semibold uppercase tracking-wide block mb-1">{t('log.note')}</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)}
              placeholder={t('log.notePlaceholder')} maxLength={80}
              className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2.5 text-brand-navy text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 placeholder:text-brand-muted/60" />
          </div>
          <div>
            <label className="text-brand-navy text-xs font-semibold uppercase tracking-wide block mb-1">{t('log.date')}</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2.5 text-brand-navy text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 [color-scheme:light]" />
          </div>
          {error && <p className="text-brand-danger text-xs bg-rose-50 rounded-lg px-3 py-2">{error}</p>}
          <Button type="submit" disabled={addExpenseMutation.isPending} className="w-full">
            {addExpenseMutation.isPending ? t('log.logging') : t('log.logExpense')}
          </Button>
        </form>
      </Card>

      {isLoadingExpenses && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoadingExpenses && expenses.length === 0 && (
        <Card className="p-8 text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-bg mb-3">
            <Receipt size={28} className="text-brand-blue" />
          </div>
          <p className="text-brand-navy font-semibold mb-1">{t('log.noExpenses')}</p>
        </Card>
      )}

      {!isLoadingExpenses && expenses.length > 0 && (
        <div className="animate-fade-in-up delay-150">
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <input type="search" value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t('log.searchPlaceholder')}
                className="w-full bg-white border border-brand-border rounded-xl pl-9 pr-3 py-2 text-brand-navy text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 placeholder:text-brand-muted/60" />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            </div>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="bg-white border border-brand-border rounded-xl px-3 py-2 text-brand-navy text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40">
              <option value="all">{t('log.allCategories')}</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between bg-brand-bg rounded-xl px-3 py-2 mb-3">
            <span className="text-brand-muted text-xs">{filtered.length} expense{filtered.length !== 1 ? 's' : ''}</span>
            <span className="text-brand-navy text-xs font-semibold">Total: {formatAmount(filteredTotal, currency)}</span>
          </div>
          {filtered.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-brand-muted text-sm">No expenses match your filter</p>
            </Card>
          ) : (
            <Card>
              {filtered.map((exp, i) => {
                const cat = categories.find(c => c.id === exp.categoryId)
                return (
                  <div key={exp.id}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-brand-bg/50 ${i < filtered.length - 1 ? 'border-b border-brand-border' : ''} ${deletingId === exp.id ? 'opacity-50' : ''}`}>
                    <span className="text-xl flex-shrink-0">{cat?.emoji ?? '$'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-brand-navy text-sm font-medium truncate">{exp.note}</p>
                      <p className="text-brand-muted text-xs">{cat?.name} · {friendlyDate(exp.date)} · {exp.memberName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-brand-navy font-semibold text-sm tabular-nums">{formatAmount(exp.amount, currency)}</span>
                      <button onClick={() => handleDelete(exp.id)} disabled={deletingId === exp.id}
                        className="text-brand-muted hover:text-brand-danger transition-colors p-1" aria-label="Delete expense">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
