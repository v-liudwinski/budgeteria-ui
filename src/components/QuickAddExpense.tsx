import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApp } from '../context/AppContext'
import { useAuth } from '../auth/AuthProvider'
import { expenseApi } from '../api/expenseApi'
import { queryKeys } from '../api/queryKeys'
import { Button } from './Button'
import { useToast } from './Toast'
import { X } from 'lucide-react'
import type { Expense, FamilyPlan } from '../api/types'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export function QuickAddExpense({ isOpen, onClose }: Props) {
  const { plan } = useApp()
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  const planId = plan?.id ?? ''

  const addExpenseMutation = useMutation({
    mutationFn: (data: Omit<Expense, 'id'>) => expenseApi.addExpense(planId, data),
    onSuccess: (expense) => {
      queryClient.setQueryData<Expense[]>(queryKeys.expenses(planId), (old = []) => [expense, ...old])
      queryClient.setQueryData<FamilyPlan[]>(queryKeys.plans, (old = []) =>
        old.map(p =>
          p.id !== planId ? p : {
            ...p,
            categories: p.categories.map(c =>
              c.id === expense.categoryId ? { ...c, spent: c.spent + expense.amount } : c
            ),
          }
        )
      )
    },
  })

  if (!isOpen || !plan) return null

  const categories = plan.categories
  const selectedCat = categoryId || (categories[0]?.id ?? '')

  async function handleSubmit() {
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) return
    const cat = categories.find(c => c.id === selectedCat)

    try {
      const member = plan?.members.find(m => m.userId === user?.id)
      if (!member) {
        toast('Could not find your member profile. Try refreshing.', 'error')
        return
      }
      await addExpenseMutation.mutateAsync({
        categoryId: selectedCat,
        amount: amt,
        note: note.trim() || cat?.name || 'Expense',
        date: new Date().toISOString().slice(0, 10),
        memberId: member.id,
        memberName: user?.name || member.name || member.email,
      })
      toast('Expense logged!')
      setAmount('')
      setNote('')
      setCategoryId('')
      onClose()
    } catch {
      toast('Failed to add expense', 'error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white border border-brand-border rounded-t-3xl md:rounded-2xl w-full md:max-w-md p-6 z-10 shadow-soft animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-brand-navy font-bold text-lg">Quick Add</h3>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-navy transition-colors p-1"><X size={18} /></button>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setCategoryId(cat.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                selectedCat === cat.id
                  ? 'border-brand-blue bg-sky-50 text-brand-blue shadow-sm'
                  : 'border-brand-border text-brand-muted hover:border-brand-blue/40'
              }`}>
              <span>{cat.emoji}</span>
              <span className="hidden sm:inline">{cat.name}</span>
            </button>
          ))}
        </div>

        <input type="number" inputMode="decimal" step="0.01" value={amount}
          onChange={e => setAmount(e.target.value)} placeholder={`0.00 ${plan.currency.symbol}`} autoFocus
          className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-brand-navy font-bold text-2xl text-center focus:outline-none focus:ring-2 focus:ring-brand-blue/40 placeholder:text-brand-muted/30 mb-3" />

        <input type="text" value={note} onChange={e => setNote(e.target.value)}
          placeholder="What was it for? (optional)" maxLength={80}
          className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2.5 text-brand-navy text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 placeholder:text-brand-muted/50 mb-4"
          onKeyDown={e => e.key === 'Enter' && handleSubmit()} />

        <Button onClick={handleSubmit} disabled={!amount || addExpenseMutation.isPending} className="w-full">
          {addExpenseMutation.isPending ? 'Saving...' : 'Add Expense'}
        </Button>
      </div>
    </div>
  )
}
