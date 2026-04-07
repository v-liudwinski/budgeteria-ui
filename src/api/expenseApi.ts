import type { Expense, PlanCategory } from './types'
import { api } from './apiClient'
import { mockExpenseApi } from './mock/mockExpenseApi'

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'

const realExpenseApi = {
  async getExpenses(planId: string): Promise<Expense[]> {
    return api.get<Expense[]>(`/expenses?planId=${planId}`)
  },

  async addExpense(planId: string, data: Omit<Expense, 'id'>): Promise<Expense> {
    return api.post<Expense>(`/expenses?planId=${planId}`, data)
  },

  async deleteExpense(planId: string, id: string): Promise<void> {
    return api.del(`/expenses/${id}?planId=${planId}`)
  },

  async getExpensesByCategory(planId: string, categoryId: string): Promise<Expense[]> {
    return api.get<Expense[]>(`/expenses/by-category/${categoryId}?planId=${planId}`)
  },

  async getCategories(planId: string): Promise<PlanCategory[]> {
    return api.get<PlanCategory[]>(`/expenses/categories?planId=${planId}`)
  },
}

// Adapt mock API to new signatures (ignore planId)
const adaptedMockApi = {
  getExpenses: (_planId: string) => mockExpenseApi.getExpenses(),
  addExpense: (_planId: string, data: Omit<Expense, 'id'>) => mockExpenseApi.addExpense(data),
  deleteExpense: (_planId: string, id: string) => mockExpenseApi.deleteExpense(id),
  getExpensesByCategory: (_planId: string, categoryId: string) => mockExpenseApi.getExpensesByCategory(categoryId),
  getCategories: (_planId: string) => mockExpenseApi.getCategories(),
}

export const expenseApi = useMocks ? adaptedMockApi : realExpenseApi
