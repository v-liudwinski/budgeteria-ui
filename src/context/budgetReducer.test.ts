import { describe, it, expect } from 'vitest'
import { budgetReducer } from './budgetReducer'
import type { BudgetState, Expense } from './types'
import { mockUser } from '../data/mockUser'
import { mockCategories } from '../data/mockBudget'
import { mockExpenses } from '../data/mockExpenses'

const initialState: BudgetState = {
  user: mockUser,
  categories: mockCategories,
  expenses: mockExpenses,
  selectedMonth: '2026-03',
}

describe('budgetReducer', () => {
  it('ADD_EXPENSE appends expense and updates category spent', () => {
    const newExpense: Expense = {
      id: 'test-1',
      categoryId: 'food',
      amount: 50,
      note: 'test',
      date: '2026-03-29',
    }
    const state = budgetReducer(initialState, { type: 'ADD_EXPENSE', payload: newExpense })
    expect(state.expenses).toContainEqual(newExpense)
    const food = state.categories.find(c => c.id === 'food')!
    expect(food.spent).toBe(320 + 50)
  })

  it('DELETE_EXPENSE removes expense and updates category spent', () => {
    const state = budgetReducer(initialState, { type: 'DELETE_EXPENSE', payload: { id: 'e1' } })
    expect(state.expenses.find(e => e.id === 'e1')).toBeUndefined()
    const food = state.categories.find(c => c.id === 'food')!
    expect(food.spent).toBe(320 - 48.50)
  })

  it('SET_CURRENCY updates user currency', () => {
    const eur = { code: 'EUR', symbol: '€', locale: 'de-DE' }
    const state = budgetReducer(initialState, { type: 'SET_CURRENCY', payload: eur })
    expect(state.user.currency).toEqual(eur)
  })

  it('SET_MONTH updates selectedMonth', () => {
    const state = budgetReducer(initialState, { type: 'SET_MONTH', payload: '2026-02' })
    expect(state.selectedMonth).toBe('2026-02')
  })

  it('UPDATE_CATEGORY_LIMIT updates limit for given category', () => {
    const state = budgetReducer(initialState, {
      type: 'UPDATE_CATEGORY_LIMIT',
      payload: { id: 'food', limit: 800 },
    })
    expect(state.categories.find(c => c.id === 'food')!.limit).toBe(800)
  })
})
