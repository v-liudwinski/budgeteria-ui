import type { Expense } from '../types'
import { getMockExpenses, addMockExpense, deleteMockExpense, getMockPlan } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const mockExpenseApi = {
  async getExpenses(): Promise<Expense[]> {
    await delay(200)
    return getMockExpenses()
  },

  async addExpense(data: Omit<Expense, 'id'>): Promise<Expense> {
    await delay(300)
    const expense: Expense = {
      ...data,
      id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    }
    addMockExpense(expense)
    return expense
  },

  async deleteExpense(id: string): Promise<void> {
    await delay(200)
    deleteMockExpense(id)
  },

  async getExpensesByCategory(categoryId: string): Promise<Expense[]> {
    await delay(200)
    return getMockExpenses().filter(e => e.categoryId === categoryId)
  },

  async getCategories() {
    await delay(100)
    return getMockPlan()?.categories ?? []
  },
}
