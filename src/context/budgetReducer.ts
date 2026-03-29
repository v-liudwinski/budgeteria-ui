import type { BudgetState, BudgetAction } from './types'

export function budgetReducer(state: BudgetState, action: BudgetAction): BudgetState {
  switch (action.type) {
    case 'ADD_EXPENSE': {
      const expense = action.payload
      const categories = state.categories.map(cat =>
        cat.id === expense.categoryId
          ? { ...cat, spent: cat.spent + expense.amount }
          : cat
      )
      return { ...state, expenses: [...state.expenses, expense], categories }
    }

    case 'DELETE_EXPENSE': {
      const toDelete = state.expenses.find(e => e.id === action.payload.id)
      if (!toDelete) return state
      const categories = state.categories.map(cat =>
        cat.id === toDelete.categoryId
          ? { ...cat, spent: Math.max(0, cat.spent - toDelete.amount) }
          : cat
      )
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload.id), categories }
    }

    case 'SET_CURRENCY':
      return { ...state, user: { ...state.user, currency: action.payload } }

    case 'SET_MONTH':
      return { ...state, selectedMonth: action.payload }

    case 'UPDATE_CATEGORY_LIMIT':
      return {
        ...state,
        categories: state.categories.map(cat =>
          cat.id === action.payload.id ? { ...cat, limit: action.payload.limit } : cat
        ),
      }

    default:
      return state
  }
}
