export type Currency = {
  code: string
  symbol: string
  locale: string
}

export type Category = {
  id: string
  name: string
  animal: string       // emoji e.g. "🐿️"
  color: string        // tailwind base color name e.g. "emerald"
  limit: number        // monthly budget cap in base currency units
  spent: number        // current month total spent
}

export type Expense = {
  id: string
  categoryId: string
  amount: number
  note: string
  date: string         // ISO 8601 e.g. "2026-03-29"
}

export type User = {
  name: string
  familyMembers: string[]
  currency: Currency
}

export type BudgetState = {
  user: User
  categories: Category[]
  expenses: Expense[]
  selectedMonth: string  // "YYYY-MM" e.g. "2026-03"
}

export type BudgetAction =
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: { id: string } }
  | { type: 'SET_CURRENCY'; payload: Currency }
  | { type: 'SET_MONTH'; payload: string }
  | { type: 'UPDATE_CATEGORY_LIMIT'; payload: { id: string; limit: number } }
