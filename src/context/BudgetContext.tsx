import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { BudgetState, BudgetAction } from './types'
import { budgetReducer } from './budgetReducer'
import { mockUser } from '../data/mockUser'
import { mockCategories } from '../data/mockBudget'
import { mockExpenses } from '../data/mockExpenses'
import { toMonthKey } from '../utils/dateHelpers'

const initialState: BudgetState = {
  user: mockUser,
  categories: mockCategories,
  expenses: mockExpenses,
  selectedMonth: toMonthKey(new Date()),
}

type BudgetContextValue = {
  state: BudgetState
  dispatch: React.Dispatch<BudgetAction>
}

const BudgetContext = createContext<BudgetContextValue | null>(null)

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(budgetReducer, initialState)
  return (
    <BudgetContext.Provider value={{ state, dispatch }}>
      {children}
    </BudgetContext.Provider>
  )
}

export function useBudget(): BudgetContextValue {
  const ctx = useContext(BudgetContext)
  if (!ctx) throw new Error('useBudget must be used inside BudgetProvider')
  return ctx
}
