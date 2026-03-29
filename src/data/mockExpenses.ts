import type { Expense } from '../context/types'

export const mockExpenses: Expense[] = [
  { id: 'e1',  categoryId: 'food',          amount: 48.50, note: 'Grocery run',           date: '2026-03-29' },
  { id: 'e2',  categoryId: 'transport',     amount: 32.00, note: 'Monthly transit pass',   date: '2026-03-28' },
  { id: 'e3',  categoryId: 'health',        amount: 22.00, note: 'Pharmacy',               date: '2026-03-27' },
  { id: 'e4',  categoryId: 'clothes',       amount: 80.00, note: 'Winter jacket',          date: '2026-03-25' },
  { id: 'e5',  categoryId: 'entertainment', amount: 15.99, note: 'Streaming subscription', date: '2026-03-24' },
  { id: 'e6',  categoryId: 'food',          amount: 62.30, note: 'Supermarket weekly',     date: '2026-03-22' },
  { id: 'e7',  categoryId: 'bills',         amount: 180.00,note: 'Electricity bill',       date: '2026-03-20' },
  { id: 'e8',  categoryId: 'insurance',     amount: 90.00, note: 'Car insurance',          date: '2026-03-18' },
  { id: 'e9',  categoryId: 'food',          amount: 24.50, note: 'Lunch out',              date: '2026-03-17' },
  { id: 'e10', categoryId: 'transport',     amount: 48.00, note: 'Fuel',                   date: '2026-03-15' },
  { id: 'e11', categoryId: 'bills',         amount: 120.00,note: 'Internet + phone',       date: '2026-03-14' },
  { id: 'e12', categoryId: 'entertainment', amount: 49.00, note: 'Concert tickets',        date: '2026-03-12' },
  { id: 'e13', categoryId: 'misc',          amount: 35.00, note: 'Household items',        date: '2026-03-10' },
  { id: 'e14', categoryId: 'food',          amount: 55.20, note: 'Farmers market',         date: '2026-03-08' },
  { id: 'e15', categoryId: 'insurance',     amount: 90.00, note: 'Health insurance',       date: '2026-03-05' },
]
