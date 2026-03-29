# Budgeteria UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first React SPA for family budget tracking with 3 screens (Dashboard, Bubble Budget, Expense Logging), mocked data, and currency selection.

**Architecture:** Feature-first folder structure with React Context + useReducer for shared state. All data reads go through a `useBudget()` hook — mock data files are the only swap point when the API arrives. Responsive nav: bottom tabs on mobile (`< 768px`), sidebar on desktop (`≥ 768px`).

**Tech Stack:** Vite 5 + React 18 + TypeScript 5 · Tailwind CSS 3 · React Router v6 · Vitest + React Testing Library · Inter font (Google Fonts)

---

## File Map

```
src/
  context/
    types.ts                  ← all shared TypeScript types (Task 2)
    budgetReducer.ts          ← pure reducer, all actions (Task 5)
    BudgetContext.tsx         ← createContext + Provider + useBudget hook (Task 6)
  data/
    mockUser.ts               ← User with USD currency default (Task 3)
    mockBudget.ts             ← 10 categories with limits + spent (Task 3)
    mockExpenses.ts           ← 15 sample expenses (Task 3)
  utils/
    formatAmount.ts           ← Intl.NumberFormat wrapper (Task 4)
    dateHelpers.ts            ← greeting string + date formatting (Task 4)
  components/
    Card.tsx                  ← dark card wrapper primitive (Task 7)
    AnimalGuide.tsx           ← emoji + name + progress bar chip (Task 7)
    BottomNav.tsx             ← mobile tab bar (Task 8)
    Sidebar.tsx               ← desktop side nav (Task 8)
    Layout.tsx                ← responsive wrapper, renders correct nav (Task 8)
    CurrencyPicker.tsx        ← bottom sheet with 15 currencies (Task 9)
    ProfilePopover.tsx        ← name + currency + month selector (Task 9)
  features/
    dashboard/
      GreetingHeader.tsx      ← date + "Morning, [name]!" (Task 10)
      BalanceSummary.tsx      ← green gradient card + currency badge (Task 10)
      AnimalGuideStrip.tsx    ← horizontal scroll of AnimalGuide chips (Task 10)
      RecentExpenses.tsx      ← last 10 expenses list (Task 10)
      Dashboard.tsx           ← composes all dashboard sub-components (Task 11)
    bubble-budget/
      CategoryBubble.tsx      ← single SVG bubble (size + color logic) (Task 12)
      BubbleChart.tsx         ← places all bubbles, no-overlap layout (Task 12)
      BubbleDetail.tsx        ← bottom sheet for tapped category (Task 12)
      BubbleBudget.tsx        ← screen: header + BubbleChart + legend (Task 13)
    expense-logging/
      CategoryPicker.tsx      ← chip grid of all 10 categories (Task 14)
      ExpenseForm.tsx         ← controlled form, dispatches ADD_EXPENSE (Task 14)
      ExpenseList.tsx         ← filtered/sorted expense rows (Task 14)
      ExpenseLogging.tsx      ← screen: ExpenseForm + ExpenseList (Task 15)
  App.tsx                     ← Router + BudgetProvider + routes (Task 15)
  main.tsx                    ← entry point (Task 15)
  index.css                   ← Tailwind directives + Inter font (Task 1)
```

---

## Task 1: Project Scaffold

**Files:**
- Modify: `package.json` (created by Vite)
- Modify: `vite.config.ts`
- Modify: `tailwind.config.ts` (created)
- Modify: `src/index.css`
- Create: `src/test/setup.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Scaffold Vite in the existing repo directory**

```bash
cd D:/src/budgeteria-ui
npm create vite@latest . -- --template react-ts
```

When prompted "Current directory is not empty. Remove existing files and continue?" — choose **No, keep existing files** (or the equivalent option that preserves files).

Expected output: Vite project files written alongside existing files.

- [ ] **Step 2: Install base dependencies**

```bash
npm install
npm install react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Expected: `tailwind.config.js` and `postcss.config.js` created.

- [ ] **Step 3: Install test dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 4: Configure Vite with test settings**

Replace contents of `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

- [ ] **Step 5: Create test setup file**

Create `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Configure Tailwind**

Replace `tailwind.config.js` with `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
} satisfies Config
```

- [ ] **Step 7: Set up global CSS**

Replace `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background-color: #020817;
  color: #f8fafc;
  font-family: 'Inter', sans-serif;
}

/* Hide scrollbar but keep scroll */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
```

- [ ] **Step 8: Update tsconfig.json for path aliases**

In `tsconfig.json`, ensure `strict: true` is present and add:

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 9: Add Node entries to .gitignore**

Append to `.gitignore`:

```
# Node
node_modules/
dist/
.env
.env.local

# Superpowers brainstorm session files
.superpowers/
```

- [ ] **Step 10: Add test script to package.json**

Ensure `package.json` scripts section includes:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 11: Delete Vite boilerplate**

```bash
rm src/App.css src/assets/react.svg public/vite.svg 2>/dev/null || true
```

- [ ] **Step 12: Verify setup**

```bash
npm run test
```

Expected: `No test files found` (not a failure — test runner works, no tests yet).

```bash
npm run dev
```

Expected: dev server starts on `http://localhost:5173`.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + Tailwind + Vitest"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `src/context/types.ts`

- [ ] **Step 1: Create types file**

Create `src/context/types.ts`:

```typescript
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/context/types.ts
git commit -m "feat: add shared TypeScript types"
```

---

## Task 3: Mock Data

**Files:**
- Create: `src/data/mockUser.ts`
- Create: `src/data/mockBudget.ts`
- Create: `src/data/mockExpenses.ts`

- [ ] **Step 1: Create mock user**

Create `src/data/mockUser.ts`:

```typescript
import type { User } from '../context/types'

export const mockUser: User = {
  name: 'Senior',
  familyMembers: ['Senior', 'Partner'],
  currency: { code: 'USD', symbol: '$', locale: 'en-US' },
}
```

- [ ] **Step 2: Create mock budget categories**

Create `src/data/mockBudget.ts`:

```typescript
import type { Category } from '../context/types'

export const mockCategories: Category[] = [
  { id: 'food',          name: 'Food & Groceries',   animal: '🐿️', color: 'emerald', limit: 600,  spent: 320  },
  { id: 'bills',         name: 'Bills & Utilities',  animal: '🦉', color: 'amber',   limit: 500,  spent: 480  },
  { id: 'transport',     name: 'Transport',           animal: '🐦', color: 'sky',     limit: 200,  spent: 128  },
  { id: 'savings',       name: 'Savings',             animal: '🦔', color: 'violet',  limit: 500,  spent: 200  },
  { id: 'insurance',     name: 'Insurance',           animal: '🐢', color: 'slate',   limit: 220,  spent: 180  },
  { id: 'health',        name: 'Health & Medical',    animal: '🐸', color: 'green',   limit: 120,  spent: 22   },
  { id: 'clothes',       name: 'Clothes & Shopping',  animal: '🦋', color: 'pink',    limit: 300,  spent: 80   },
  { id: 'entertainment', name: 'Entertainment',       animal: '🦊', color: 'orange',  limit: 150,  spent: 65   },
  { id: 'education',     name: 'Education',           animal: '🦅', color: 'indigo',  limit: 200,  spent: 0    },
  { id: 'misc',          name: 'Miscellaneous',       animal: '🐾', color: 'zinc',    limit: 100,  spent: 35   },
]
```

- [ ] **Step 3: Create mock expenses**

Create `src/data/mockExpenses.ts`:

```typescript
import type { Expense } from '../context/types'

export const mockExpenses: Expense[] = [
  { id: 'e1',  categoryId: 'food',          amount: 48.50, note: 'Grocery run',          date: '2026-03-29' },
  { id: 'e2',  categoryId: 'transport',     amount: 32.00, note: 'Monthly transit pass',  date: '2026-03-28' },
  { id: 'e3',  categoryId: 'health',        amount: 22.00, note: 'Pharmacy',              date: '2026-03-27' },
  { id: 'e4',  categoryId: 'clothes',       amount: 80.00, note: 'Winter jacket',         date: '2026-03-25' },
  { id: 'e5',  categoryId: 'entertainment', amount: 15.99, note: 'Streaming subscription',date: '2026-03-24' },
  { id: 'e6',  categoryId: 'food',          amount: 62.30, note: 'Supermarket weekly',    date: '2026-03-22' },
  { id: 'e7',  categoryId: 'bills',         amount: 180.00,note: 'Electricity bill',      date: '2026-03-20' },
  { id: 'e8',  categoryId: 'insurance',     amount: 90.00, note: 'Car insurance',         date: '2026-03-18' },
  { id: 'e9',  categoryId: 'food',          amount: 24.50, note: 'Lunch out',             date: '2026-03-17' },
  { id: 'e10', categoryId: 'transport',     amount: 48.00, note: 'Fuel',                  date: '2026-03-15' },
  { id: 'e11', categoryId: 'bills',         amount: 120.00,note: 'Internet + phone',      date: '2026-03-14' },
  { id: 'e12', categoryId: 'entertainment', amount: 49.00, note: 'Concert tickets',       date: '2026-03-12' },
  { id: 'e13', categoryId: 'misc',          amount: 35.00, note: 'Household items',       date: '2026-03-10' },
  { id: 'e14', categoryId: 'food',          amount: 55.20, note: 'Farmers market',        date: '2026-03-08' },
  { id: 'e15', categoryId: 'insurance',     amount: 90.00, note: 'Health insurance',      date: '2026-03-05' },
]
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/data/
git commit -m "feat: add mock data (user, categories, expenses)"
```

---

## Task 4: Utilities

**Files:**
- Create: `src/utils/formatAmount.ts`
- Create: `src/utils/formatAmount.test.ts`
- Create: `src/utils/dateHelpers.ts`
- Create: `src/utils/dateHelpers.test.ts`

- [ ] **Step 1: Write failing tests for formatAmount**

Create `src/utils/formatAmount.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { formatAmount } from './formatAmount'

const usd = { code: 'USD', symbol: '$', locale: 'en-US' }
const eur = { code: 'EUR', symbol: '€', locale: 'de-DE' }
const uah = { code: 'UAH', symbol: '₴', locale: 'uk-UA' }

describe('formatAmount', () => {
  it('formats USD correctly', () => {
    expect(formatAmount(1234.5, usd)).toBe('$1,234.50')
  })

  it('formats EUR with locale', () => {
    const result = formatAmount(1234.5, eur)
    expect(result).toContain('1.234,50')
    expect(result).toContain('€')
  })

  it('formats UAH correctly', () => {
    const result = formatAmount(4850, uah)
    expect(result).toContain('4')
    expect(result).toContain('850')
  })

  it('formats zero', () => {
    expect(formatAmount(0, usd)).toBe('$0.00')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test
```

Expected: FAIL — `Cannot find module './formatAmount'`

- [ ] **Step 3: Implement formatAmount**

Create `src/utils/formatAmount.ts`:

```typescript
import type { Currency } from '../context/types'

export function formatAmount(amount: number, currency: Currency): string {
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test
```

Expected: all 4 formatAmount tests PASS.

- [ ] **Step 5: Write failing tests for dateHelpers**

Create `src/utils/dateHelpers.test.ts`:

```typescript
import { describe, it, expect, vi, afterEach } from 'vitest'
import { getGreeting, formatDisplayDate, toMonthKey } from './dateHelpers'

describe('getGreeting', () => {
  afterEach(() => vi.useRealTimers())

  it('returns Morning for 9am', () => {
    vi.setSystemTime(new Date('2026-03-29T09:00:00'))
    expect(getGreeting()).toBe('Morning')
  })

  it('returns Afternoon for 2pm', () => {
    vi.setSystemTime(new Date('2026-03-29T14:00:00'))
    expect(getGreeting()).toBe('Afternoon')
  })

  it('returns Evening for 7pm', () => {
    vi.setSystemTime(new Date('2026-03-29T19:00:00'))
    expect(getGreeting()).toBe('Evening')
  })
})

describe('formatDisplayDate', () => {
  it('formats ISO date to readable string', () => {
    expect(formatDisplayDate('2026-03-29')).toBe('Mar 29')
  })
})

describe('toMonthKey', () => {
  it('converts date to YYYY-MM', () => {
    expect(toMonthKey(new Date('2026-03-29'))).toBe('2026-03')
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

```bash
npm run test
```

Expected: FAIL — `Cannot find module './dateHelpers'`

- [ ] **Step 7: Implement dateHelpers**

Create `src/utils/dateHelpers.ts`:

```typescript
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Morning'
  if (hour < 17) return 'Afternoon'
  return 'Evening'
}

export function formatDisplayDate(isoDate: string): string {
  const date = new Date(isoDate + 'T12:00:00') // noon avoids timezone shifts
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    year: 'numeric',
  })
}

export function toMonthKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function isToday(isoDate: string): boolean {
  return isoDate === toMonthKey(new Date()).slice(0, 7) + '-' + new Date().getDate().toString().padStart(2, '0')
}

export function friendlyDate(isoDate: string): string {
  const today = toMonthKey(new Date()) + '-' + new Date().getDate().toString().padStart(2, '0')
  const yesterday = (() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return d.toISOString().slice(0, 10)
  })()
  if (isoDate === today) return 'Today'
  if (isoDate === yesterday) return 'Yesterday'
  return formatDisplayDate(isoDate)
}
```

- [ ] **Step 8: Run tests to verify all pass**

```bash
npm run test
```

Expected: all 7 utility tests PASS.

- [ ] **Step 9: Commit**

```bash
git add src/utils/
git commit -m "feat: add formatAmount and dateHelpers utilities"
```

---

## Task 5: Budget Reducer

**Files:**
- Create: `src/context/budgetReducer.ts`
- Create: `src/context/budgetReducer.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/context/budgetReducer.test.ts`:

```typescript
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
    expect(food.spent).toBe(320 + 50) // original 320 + 50
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test
```

Expected: FAIL — `Cannot find module './budgetReducer'`

- [ ] **Step 3: Implement the reducer**

Create `src/context/budgetReducer.ts`:

```typescript
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
```

- [ ] **Step 4: Run tests to verify all pass**

```bash
npm run test
```

Expected: all 5 reducer tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/context/budgetReducer.ts src/context/budgetReducer.test.ts
git commit -m "feat: add budget reducer with all actions"
```

---

## Task 6: Budget Context

**Files:**
- Create: `src/context/BudgetContext.tsx`
- Create: `src/context/BudgetContext.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/context/BudgetContext.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BudgetProvider, useBudget } from './BudgetContext'

function TestConsumer() {
  const { state, dispatch } = useBudget()
  return (
    <div>
      <span data-testid="name">{state.user.name}</span>
      <span data-testid="currency">{state.user.currency.code}</span>
      <button
        onClick={() => dispatch({ type: 'SET_CURRENCY', payload: { code: 'EUR', symbol: '€', locale: 'de-DE' } })}
      >
        Switch to EUR
      </button>
    </div>
  )
}

describe('BudgetContext', () => {
  it('provides initial state', () => {
    render(<BudgetProvider><TestConsumer /></BudgetProvider>)
    expect(screen.getByTestId('name')).toHaveTextContent('Senior')
    expect(screen.getByTestId('currency')).toHaveTextContent('USD')
  })

  it('dispatches actions and updates state', async () => {
    const user = userEvent.setup()
    render(<BudgetProvider><TestConsumer /></BudgetProvider>)
    await user.click(screen.getByText('Switch to EUR'))
    expect(screen.getByTestId('currency')).toHaveTextContent('EUR')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test
```

Expected: FAIL — `Cannot find module './BudgetContext'`

- [ ] **Step 3: Implement BudgetContext**

Create `src/context/BudgetContext.tsx`:

```typescript
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
```

- [ ] **Step 4: Run tests to verify all pass**

```bash
npm run test
```

Expected: all context tests PASS, all previous tests still PASS.

- [ ] **Step 5: Commit**

```bash
git add src/context/BudgetContext.tsx src/context/BudgetContext.test.tsx
git commit -m "feat: add BudgetContext with Provider and useBudget hook"
```

---

## Task 7: Shared Primitives — Card + AnimalGuide

**Files:**
- Create: `src/components/Card.tsx`
- Create: `src/components/AnimalGuide.tsx`
- Create: `src/components/AnimalGuide.test.tsx`

- [ ] **Step 1: Write failing test for AnimalGuide**

Create `src/components/AnimalGuide.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AnimalGuide } from './AnimalGuide'
import type { Category } from '../context/types'

const foodCategory: Category = {
  id: 'food',
  name: 'Food & Groceries',
  animal: '🐿️',
  color: 'emerald',
  limit: 600,
  spent: 320,
}

const usd = { code: 'USD', symbol: '$', locale: 'en-US' }

describe('AnimalGuide', () => {
  it('renders animal, name, and spent/limit', () => {
    render(<AnimalGuide category={foodCategory} currency={usd} />)
    expect(screen.getByText('🐿️')).toBeInTheDocument()
    expect(screen.getByText('Food & Groceries')).toBeInTheDocument()
    expect(screen.getByText('$320.00 / $600.00')).toBeInTheDocument()
  })

  it('shows warning state when over 75% spent', () => {
    const nearLimit = { ...foodCategory, spent: 500 }
    render(<AnimalGuide category={nearLimit} currency={usd} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '83')
  })

  it('shows danger state when over 95% spent', () => {
    const overLimit = { ...foodCategory, spent: 580 }
    render(<AnimalGuide category={overLimit} currency={usd} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '96')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test
```

Expected: FAIL — `Cannot find module './AnimalGuide'`

- [ ] **Step 3: Create Card component**

Create `src/components/Card.tsx`:

```typescript
import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-800 border border-slate-700 rounded-2xl ${onClick ? 'cursor-pointer hover:border-slate-600 hover:bg-slate-750 transition-colors' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Create AnimalGuide component**

Create `src/components/AnimalGuide.tsx`:

```typescript
import type { Category, Currency } from '../context/types'
import { formatAmount } from '../utils/formatAmount'

type Props = {
  category: Category
  currency: Currency
  onClick?: () => void
}

function getBarColor(pct: number): string {
  if (pct >= 95) return 'bg-red-500'
  if (pct >= 75) return 'bg-amber-400'
  return 'bg-emerald-400'
}

export function AnimalGuide({ category, currency, onClick }: Props) {
  const pct = Math.min(100, Math.round((category.spent / category.limit) * 100))
  const barColor = getBarColor(pct)

  return (
    <div
      onClick={onClick}
      className={`bg-slate-800 border border-slate-700 rounded-2xl p-3 flex items-center gap-3 flex-shrink-0 ${onClick ? 'cursor-pointer hover:border-slate-500 transition-colors' : ''}`}
    >
      <span className="text-2xl">{category.animal}</span>
      <div className="min-w-0">
        <div className="text-slate-100 text-xs font-semibold truncate">{category.name}</div>
        <div className={`text-xs mt-0.5 ${pct >= 95 ? 'text-red-400' : pct >= 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
          {formatAmount(category.spent, currency)} / {formatAmount(category.limit, currency)}
        </div>
        <div className="w-10 h-1 bg-slate-700 rounded-full mt-1.5">
          <div
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Run tests to verify all pass**

```bash
npm run test
```

Expected: all 3 AnimalGuide tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/
git commit -m "feat: add Card and AnimalGuide shared components"
```

---

## Task 8: Navigation — BottomNav, Sidebar, Layout

**Files:**
- Create: `src/components/BottomNav.tsx`
- Create: `src/components/Sidebar.tsx`
- Create: `src/components/Layout.tsx`
- Create: `src/components/BottomNav.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/components/BottomNav.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { BottomNav } from './BottomNav'

function Wrapper({ initialPath = '/' }) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="*" element={<BottomNav />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('BottomNav', () => {
  it('renders 5 nav items', () => {
    render(<Wrapper />)
    expect(screen.getAllByRole('link').length).toBeGreaterThanOrEqual(4)
  })

  it('highlights Home when on /', () => {
    render(<Wrapper initialPath="/" />)
    const homeLink = screen.getByLabelText('Home')
    expect(homeLink).toHaveClass('text-emerald-400')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test
```

Expected: FAIL — `Cannot find module './BottomNav'`

- [ ] **Step 3: Create BottomNav**

Create `src/components/BottomNav.tsx`:

```typescript
import { NavLink } from 'react-router-dom'

type NavItem = { to: string; icon: string; label: string }

const items: NavItem[] = [
  { to: '/',       icon: '🏠', label: 'Home'     },
  { to: '/budget', icon: '💰', label: 'Budget'   },
  { to: '/log',    icon: '📋', label: 'Expenses' },
  { to: '/profile',icon: '👤', label: 'Profile'  },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 md:hidden z-50">
      <div className="flex items-center justify-around px-2 pb-safe">
        {items.map((item, i) => {
          // FAB in the middle
          const isMiddle = i === 2
          if (isMiddle) {
            return (
              <NavLink
                key="log-fab"
                to="/log"
                aria-label="Log Expense"
                className="-mt-5 bg-gradient-to-br from-emerald-400 to-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-900/40"
              >
                ➕
              </NavLink>
            )
          }
          const actualItem = i < 2 ? items[i] : items[i - 1 + 1] // shift after FAB
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              aria-label={item.label}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-3 px-4 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  isActive ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
```

- [ ] **Step 4: Create Sidebar**

Create `src/components/Sidebar.tsx`:

```typescript
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/',        icon: '🏠', label: 'Dashboard'    },
  { to: '/budget',  icon: '💰', label: 'Bubble Budget' },
  { to: '/log',     icon: '➕', label: 'Log Expense'   },
]

export function Sidebar() {
  return (
    <nav className="hidden md:flex flex-col w-14 hover:w-52 transition-all duration-200 bg-slate-900 border-r border-slate-800 min-h-screen overflow-hidden group z-50 fixed top-0 left-0">
      <div className="flex flex-col items-center group-hover:items-start gap-1 pt-6 pb-4 px-2 flex-1">
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-colors text-sm font-medium ${
                isActive
                  ? 'text-emerald-400 bg-emerald-950/60'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
              }`
            }
          >
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{item.label}</span>
          </NavLink>
        ))}
        <div className="flex-1" />
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-colors text-sm font-medium ${
              isActive ? 'text-emerald-400 bg-emerald-950/60' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
            }`
          }
        >
          <span className="text-xl flex-shrink-0">👤</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Profile</span>
        </NavLink>
      </div>
    </nav>
  )
}
```

- [ ] **Step 5: Create Layout**

Create `src/components/Layout.tsx`:

```typescript
import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <main className="md:pl-14 pb-24 md:pb-0 min-h-screen">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 6: Run tests to verify all pass**

```bash
npm run test
```

Expected: all nav tests PASS. All previous tests still PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/BottomNav.tsx src/components/BottomNav.test.tsx src/components/Sidebar.tsx src/components/Layout.tsx
git commit -m "feat: add BottomNav, Sidebar, and Layout components"
```

---

## Task 9: CurrencyPicker + ProfilePopover

**Files:**
- Create: `src/components/CurrencyPicker.tsx`
- Create: `src/components/CurrencyPicker.test.tsx`
- Create: `src/components/ProfilePopover.tsx`

- [ ] **Step 1: Write failing test for CurrencyPicker**

Create `src/components/CurrencyPicker.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CurrencyPicker } from './CurrencyPicker'

const usd = { code: 'USD', symbol: '$', locale: 'en-US' }

describe('CurrencyPicker', () => {
  it('renders list of currencies', () => {
    render(<CurrencyPicker current={usd} onSelect={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('EUR')).toBeInTheDocument()
    expect(screen.getByText('GBP')).toBeInTheDocument()
    expect(screen.getByText('UAH')).toBeInTheDocument()
  })

  it('calls onSelect with chosen currency', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<CurrencyPicker current={usd} onSelect={onSelect} onClose={vi.fn()} />)
    await user.click(screen.getByText('EUR'))
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'EUR' })
    )
  })

  it('calls onClose when backdrop clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<CurrencyPicker current={usd} onSelect={vi.fn()} onClose={onClose} />)
    await user.click(screen.getByTestId('backdrop'))
    expect(onClose).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test
```

Expected: FAIL — `Cannot find module './CurrencyPicker'`

- [ ] **Step 3: Create CurrencyPicker**

Create `src/components/CurrencyPicker.tsx`:

```typescript
import type { Currency } from '../context/types'

const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$',  locale: 'en-US'  },
  { code: 'EUR', symbol: '€',  locale: 'de-DE'  },
  { code: 'GBP', symbol: '£',  locale: 'en-GB'  },
  { code: 'UAH', symbol: '₴',  locale: 'uk-UA'  },
  { code: 'PLN', symbol: 'zł', locale: 'pl-PL'  },
  { code: 'CHF', symbol: 'Fr', locale: 'de-CH'  },
  { code: 'CAD', symbol: 'C$', locale: 'en-CA'  },
  { code: 'AUD', symbol: 'A$', locale: 'en-AU'  },
  { code: 'JPY', symbol: '¥',  locale: 'ja-JP'  },
  { code: 'SEK', symbol: 'kr', locale: 'sv-SE'  },
  { code: 'NOK', symbol: 'kr', locale: 'nb-NO'  },
  { code: 'DKK', symbol: 'kr', locale: 'da-DK'  },
  { code: 'CZK', symbol: 'Kč', locale: 'cs-CZ'  },
  { code: 'HUF', symbol: 'Ft', locale: 'hu-HU'  },
  { code: 'RON', symbol: 'lei',locale: 'ro-RO'  },
]

type Props = {
  current: Currency
  onSelect: (currency: Currency) => void
  onClose: () => void
}

export function CurrencyPicker({ current, onSelect, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div
        data-testid="backdrop"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-slate-900 border border-slate-700 rounded-t-3xl md:rounded-2xl w-full md:w-96 max-h-[70vh] flex flex-col z-10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-slate-100 font-semibold">Select Currency</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl">✕</button>
        </div>
        <div className="overflow-y-auto no-scrollbar">
          {CURRENCIES.map(c => (
            <button
              key={c.code}
              onClick={() => { onSelect(c); onClose() }}
              className={`w-full flex items-center gap-4 px-5 py-3.5 hover:bg-slate-800 transition-colors text-left ${c.code === current.code ? 'bg-emerald-950/40' : ''}`}
            >
              <span className="text-slate-400 font-mono w-8 text-sm">{c.symbol}</span>
              <span className={`font-semibold text-sm ${c.code === current.code ? 'text-emerald-400' : 'text-slate-100'}`}>{c.code}</span>
              {c.code === current.code && <span className="ml-auto text-emerald-400 text-xs">✓ active</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create ProfilePopover**

Create `src/components/ProfilePopover.tsx`:

```typescript
import { useState } from 'react'
import { useBudget } from '../context/BudgetContext'
import { CurrencyPicker } from './CurrencyPicker'
import { toMonthKey } from '../utils/dateHelpers'

export function ProfilePopover() {
  const { state, dispatch } = useBudget()
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)

  function shiftMonth(delta: number) {
    const [y, m] = state.selectedMonth.split('-').map(Number)
    const d = new Date(y, m - 1 + delta, 1)
    dispatch({ type: 'SET_MONTH', payload: toMonthKey(d) })
  }

  const [year, month] = state.selectedMonth.split('-').map(Number)
  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="p-5 space-y-5">
      {/* User name */}
      <div>
        <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">Name</div>
        <div className="text-slate-100 font-semibold">{state.user.name}</div>
      </div>

      {/* Currency */}
      <div>
        <div className="text-slate-500 text-xs uppercase tracking-wide mb-2">Currency</div>
        <button
          onClick={() => setShowCurrencyPicker(true)}
          className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-100 hover:border-slate-500 transition-colors"
        >
          <span className="text-slate-400">{state.user.currency.symbol}</span>
          <span>{state.user.currency.code}</span>
          <span className="ml-2 text-slate-500">▾</span>
        </button>
      </div>

      {/* Month navigator */}
      <div>
        <div className="text-slate-500 text-xs uppercase tracking-wide mb-2">Viewing month</div>
        <div className="flex items-center gap-3">
          <button onClick={() => shiftMonth(-1)} className="text-slate-400 hover:text-slate-200 transition-colors text-lg px-1">‹</button>
          <span className="text-slate-100 text-sm font-semibold">{monthLabel}</span>
          <button onClick={() => shiftMonth(1)} className="text-slate-400 hover:text-slate-200 transition-colors text-lg px-1">›</button>
        </div>
      </div>

      {showCurrencyPicker && (
        <CurrencyPicker
          current={state.user.currency}
          onSelect={currency => dispatch({ type: 'SET_CURRENCY', payload: currency })}
          onClose={() => setShowCurrencyPicker(false)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 5: Run tests to verify all pass**

```bash
npm run test
```

Expected: all 3 CurrencyPicker tests PASS. All previous tests still PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/CurrencyPicker.tsx src/components/CurrencyPicker.test.tsx src/components/ProfilePopover.tsx
git commit -m "feat: add CurrencyPicker and ProfilePopover"
```

---

## Task 10: Dashboard Sub-Components

**Files:**
- Create: `src/features/dashboard/GreetingHeader.tsx`
- Create: `src/features/dashboard/BalanceSummary.tsx`
- Create: `src/features/dashboard/BalanceSummary.test.tsx`
- Create: `src/features/dashboard/AnimalGuideStrip.tsx`
- Create: `src/features/dashboard/RecentExpenses.tsx`

- [ ] **Step 1: Write failing test for BalanceSummary**

Create `src/features/dashboard/BalanceSummary.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BalanceSummary } from './BalanceSummary'
import type { Category, Currency } from '../../context/types'
import { mockCategories } from '../../data/mockBudget'

const usd: Currency = { code: 'USD', symbol: '$', locale: 'en-US' }

describe('BalanceSummary', () => {
  it('calculates and displays total spent', () => {
    const totalSpent = mockCategories.reduce((s, c) => s + c.spent, 0)
    render(<BalanceSummary categories={mockCategories} currency={usd} onCurrencyClick={vi.fn()} />)
    expect(screen.getByText(/spent/i)).toBeInTheDocument()
  })

  it('renders currency badge', () => {
    render(<BalanceSummary categories={mockCategories} currency={usd} onCurrencyClick={vi.fn()} />)
    expect(screen.getByText(/USD/)).toBeInTheDocument()
  })

  it('calls onCurrencyClick when badge tapped', async () => {
    const user = userEvent.setup()
    const onCurrencyClick = vi.fn()
    render(<BalanceSummary categories={mockCategories} currency={usd} onCurrencyClick={onCurrencyClick} />)
    await user.click(screen.getByText(/USD/))
    expect(onCurrencyClick).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test
```

Expected: FAIL — `Cannot find module './BalanceSummary'`

- [ ] **Step 3: Create GreetingHeader**

Create `src/features/dashboard/GreetingHeader.tsx`:

```typescript
import { getGreeting, formatFullDate } from '../../utils/dateHelpers'

type Props = { name: string }

export function GreetingHeader({ name }: Props) {
  const greeting = getGreeting()
  const dateStr = formatFullDate(new Date())
  return (
    <div className="mb-5">
      <div className="text-slate-500 text-xs uppercase tracking-widest mb-1">{dateStr}</div>
      <h1 className="text-2xl font-extrabold bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
        {greeting}, {name}! 👋
      </h1>
    </div>
  )
}
```

- [ ] **Step 4: Create BalanceSummary**

Create `src/features/dashboard/BalanceSummary.tsx`:

```typescript
import type { Category, Currency } from '../../context/types'
import { formatAmount } from '../../utils/formatAmount'

type Props = {
  categories: Category[]
  currency: Currency
  onCurrencyClick: () => void
}

export function BalanceSummary({ categories, currency, onCurrencyClick }: Props) {
  const totalSpent = categories.reduce((s, c) => s + c.spent, 0)
  const totalLimit = categories.reduce((s, c) => s + c.limit, 0)
  const balance = totalLimit - totalSpent

  return (
    <div className="relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 border border-emerald-800/50 rounded-2xl p-5 mb-6 overflow-hidden">
      {/* decorative circles */}
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-emerald-500/10 pointer-events-none" />
      <div className="absolute -bottom-4 left-12 w-20 h-20 rounded-full bg-teal-500/10 pointer-events-none" />

      {/* currency badge */}
      <button
        onClick={onCurrencyClick}
        className="absolute top-4 right-4 bg-white/10 border border-white/20 rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-sm hover:bg-white/20 transition-colors flex items-center gap-1"
      >
        🌐 {currency.code} ▾
      </button>

      <div className="text-emerald-300 text-xs uppercase tracking-widest mb-1">Total balance</div>
      <div className="text-4xl font-extrabold text-white tracking-tight mb-4">
        {formatAmount(balance, currency)}
      </div>

      <div className="flex gap-6">
        <div>
          <div className="text-emerald-400 text-xs uppercase tracking-wide">Budget</div>
          <div className="text-white font-semibold text-sm">{formatAmount(totalLimit, currency)}</div>
        </div>
        <div>
          <div className="text-rose-400 text-xs uppercase tracking-wide">Spent</div>
          <div className="text-white font-semibold text-sm">{formatAmount(totalSpent, currency)}</div>
        </div>
        <div>
          <div className="text-emerald-400 text-xs uppercase tracking-wide">Remaining</div>
          <div className="text-white font-semibold text-sm">{formatAmount(balance, currency)}</div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create AnimalGuideStrip**

Create `src/features/dashboard/AnimalGuideStrip.tsx`:

```typescript
import type { Category, Currency } from '../../context/types'
import { AnimalGuide } from '../../components/AnimalGuide'

type Props = { categories: Category[]; currency: Currency }

export function AnimalGuideStrip({ categories, currency }: Props) {
  return (
    <div className="mb-6">
      <div className="text-slate-500 text-xs uppercase tracking-widest mb-3">Your guides this month</div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {categories.map(cat => (
          <AnimalGuide key={cat.id} category={cat} currency={currency} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create RecentExpenses**

Create `src/features/dashboard/RecentExpenses.tsx`:

```typescript
import type { Expense, Category, Currency } from '../../context/types'
import { formatAmount } from '../../utils/formatAmount'
import { friendlyDate } from '../../utils/dateHelpers'
import { Card } from '../../components/Card'

type Props = {
  expenses: Expense[]
  categories: Category[]
  currency: Currency
}

export function RecentExpenses({ expenses, categories, currency }: Props) {
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10)
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]))

  return (
    <div>
      <div className="text-slate-500 text-xs uppercase tracking-widest mb-3">Recent expenses</div>
      <div className="flex flex-col gap-2">
        {sorted.map(expense => {
          const cat = catMap[expense.categoryId]
          return (
            <Card key={expense.id} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-xl flex-shrink-0">
                  {cat?.animal ?? '💸'}
                </div>
                <div>
                  <div className="text-slate-100 text-sm font-semibold">{expense.note || cat?.name}</div>
                  <div className="text-slate-500 text-xs">{friendlyDate(expense.date)}</div>
                </div>
              </div>
              <div className="text-rose-400 text-sm font-bold">-{formatAmount(expense.amount, currency)}</div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Run tests to verify all pass**

```bash
npm run test
```

Expected: all 3 BalanceSummary tests PASS. All previous tests still PASS.

- [ ] **Step 8: Commit**

```bash
git add src/features/dashboard/
git commit -m "feat: add Dashboard sub-components (GreetingHeader, BalanceSummary, AnimalGuideStrip, RecentExpenses)"
```

---

## Task 11: Dashboard Screen

**Files:**
- Create: `src/features/dashboard/Dashboard.tsx`

- [ ] **Step 1: Create Dashboard screen**

Create `src/features/dashboard/Dashboard.tsx`:

```typescript
import { useState } from 'react'
import { useBudget } from '../../context/BudgetContext'
import { GreetingHeader } from './GreetingHeader'
import { BalanceSummary } from './BalanceSummary'
import { AnimalGuideStrip } from './AnimalGuideStrip'
import { RecentExpenses } from './RecentExpenses'
import { CurrencyPicker } from '../../components/CurrencyPicker'

export function Dashboard() {
  const { state, dispatch } = useBudget()
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)

  return (
    <div className="max-w-lg mx-auto px-4 pt-12 pb-6">
      <GreetingHeader name={state.user.name} />
      <BalanceSummary
        categories={state.categories}
        currency={state.user.currency}
        onCurrencyClick={() => setShowCurrencyPicker(true)}
      />
      <AnimalGuideStrip categories={state.categories} currency={state.user.currency} />
      <RecentExpenses
        expenses={state.expenses}
        categories={state.categories}
        currency={state.user.currency}
      />
      {showCurrencyPicker && (
        <CurrencyPicker
          current={state.user.currency}
          onSelect={currency => dispatch({ type: 'SET_CURRENCY', payload: currency })}
          onClose={() => setShowCurrencyPicker(false)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
npm run test
```

Expected: all previous tests still PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/dashboard/Dashboard.tsx
git commit -m "feat: add Dashboard screen"
```

---

## Task 12: Bubble Budget Components

**Files:**
- Create: `src/features/bubble-budget/CategoryBubble.tsx`
- Create: `src/features/bubble-budget/CategoryBubble.test.tsx`
- Create: `src/features/bubble-budget/BubbleChart.tsx`
- Create: `src/features/bubble-budget/BubbleDetail.tsx`

- [ ] **Step 1: Write failing test for CategoryBubble**

Create `src/features/bubble-budget/CategoryBubble.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CategoryBubble } from './CategoryBubble'
import type { Category } from '../../context/types'

const food: Category = { id: 'food', name: 'Food & Groceries', animal: '🐿️', color: 'emerald', limit: 600, spent: 320 }
const nearLimit: Category = { ...food, spent: 500 }
const overLimit: Category = { ...food, spent: 590 }

describe('CategoryBubble', () => {
  it('renders animal and percentage', () => {
    render(<CategoryBubble category={food} size={80} x={0} y={0} onClick={() => {}} />)
    expect(screen.getByText('🐿️')).toBeInTheDocument()
    expect(screen.getByText('53%')).toBeInTheDocument()
  })

  it('applies amber color class when over 75%', () => {
    const { container } = render(<CategoryBubble category={nearLimit} size={80} x={0} y={0} onClick={() => {}} />)
    expect(container.querySelector('[data-color="amber"]')).toBeInTheDocument()
  })

  it('applies red color class when over 95%', () => {
    const { container } = render(<CategoryBubble category={overLimit} size={80} x={0} y={0} onClick={() => {}} />)
    expect(container.querySelector('[data-color="red"]')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test
```

Expected: FAIL — `Cannot find module './CategoryBubble'`

- [ ] **Step 3: Create CategoryBubble**

Create `src/features/bubble-budget/CategoryBubble.tsx`:

```typescript
import type { Category } from '../../context/types'

type Props = {
  category: Category
  size: number    // diameter in px
  x: number
  y: number
  onClick: () => void
}

function getBubbleColor(pct: number): { bg: string; glow: string; text: string; dataColor: string } {
  if (pct >= 95) return { bg: 'from-red-500/60 to-red-900', glow: 'shadow-red-900/40', text: 'text-red-300', dataColor: 'red' }
  if (pct >= 75) return { bg: 'from-amber-400/60 to-amber-900', glow: 'shadow-amber-900/40', text: 'text-amber-300', dataColor: 'amber' }
  return { bg: 'from-emerald-400/60 to-emerald-900', glow: 'shadow-emerald-900/40', text: 'text-emerald-300', dataColor: 'emerald' }
}

export function CategoryBubble({ category, size, x, y, onClick }: Props) {
  const pct = Math.min(100, Math.round((category.spent / category.limit) * 100))
  const { bg, glow, text, dataColor } = getBubbleColor(pct)
  const fontSize = size > 70 ? '1.5rem' : size > 50 ? '1.2rem' : '0.9rem'
  const labelSize = size > 70 ? '0.65rem' : '0.55rem'

  return (
    <button
      data-color={dataColor}
      onClick={onClick}
      className={`absolute rounded-full bg-gradient-to-br ${bg} shadow-lg ${glow} flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform`}
      style={{ width: size, height: size, left: x, top: y }}
      aria-label={`${category.name}: ${pct}% of budget used`}
    >
      <span style={{ fontSize }}>{category.animal}</span>
      <span style={{ fontSize: labelSize }} className={`font-semibold ${text} leading-none`}>{pct}%</span>
    </button>
  )
}
```

- [ ] **Step 4: Create BubbleChart**

Create `src/features/bubble-budget/BubbleChart.tsx`:

```typescript
import { useState } from 'react'
import type { Category } from '../../context/types'
import { CategoryBubble } from './CategoryBubble'
import { BubbleDetail } from './BubbleDetail'
import type { Currency } from '../../context/types'

type Props = { categories: Category[]; currency: Currency }

// Simple packed layout: sort by limit desc, place in rows
function computePositions(categories: Category[], containerW: number): { cat: Category; size: number; x: number; y: number }[] {
  const maxLimit = Math.max(...categories.map(c => c.limit))
  const sorted = [...categories].sort((a, b) => b.limit - a.limit)
  const positions: { cat: Category; size: number; x: number; y: number }[] = []
  const MIN = 38
  const MAX = 90
  let row = 0
  let col = 0
  let rowY = 8

  sorted.forEach(cat => {
    const size = MIN + Math.round(((cat.limit / maxLimit) * (MAX - MIN)))
    const x = 8 + col * (MAX + 10)
    if (x + size > containerW - 8) {
      col = 0
      row++
      rowY += MAX + 12
    }
    positions.push({ cat, size, x: 8 + col * (MAX + 10), y: rowY })
    col++
  })
  return positions
}

export function BubbleChart({ categories, currency }: Props) {
  const [selected, setSelected] = useState<Category | null>(null)
  const containerW = 340
  const positions = computePositions(categories, containerW)
  const containerH = Math.max(...positions.map(p => p.y + p.size)) + 16

  return (
    <>
      <div className="relative mx-auto bg-slate-800/50 rounded-2xl overflow-hidden" style={{ width: containerW, height: containerH }}>
        {positions.map(({ cat, size, x, y }) => (
          <CategoryBubble
            key={cat.id}
            category={cat}
            size={size}
            x={x}
            y={y}
            onClick={() => setSelected(cat)}
          />
        ))}
      </div>
      {selected && (
        <BubbleDetail
          category={selected}
          currency={currency}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
```

- [ ] **Step 5: Create BubbleDetail**

Create `src/features/bubble-budget/BubbleDetail.tsx`:

```typescript
import type { Category, Currency } from '../../context/types'
import { formatAmount } from '../../utils/formatAmount'

type Props = {
  category: Category
  currency: Currency
  onClose: () => void
}

export function BubbleDetail({ category, currency, onClose }: Props) {
  const pct = Math.min(100, Math.round((category.spent / category.limit) * 100))
  const remaining = Math.max(0, category.limit - category.spent)
  const barColor = pct >= 95 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-400' : 'bg-emerald-400'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-t-3xl w-full max-w-lg z-10 p-6">
        <div className="flex items-center gap-4 mb-5">
          <span className="text-4xl">{category.animal}</span>
          <div>
            <h2 className="text-slate-100 font-bold text-lg">{category.name}</h2>
            <p className="text-slate-500 text-sm">{pct}% of monthly budget used</p>
          </div>
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-slate-300 text-xl">✕</button>
        </div>

        {/* progress bar */}
        <div className="h-2 bg-slate-700 rounded-full mb-5">
          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Budget',    value: formatAmount(category.limit, currency),   color: 'text-slate-100' },
            { label: 'Spent',     value: formatAmount(category.spent, currency),   color: 'text-rose-400'  },
            { label: 'Remaining', value: formatAmount(remaining, currency),        color: 'text-emerald-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-slate-800 rounded-xl p-3 text-center">
              <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">{label}</div>
              <div className={`font-bold text-sm ${color}`}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Run tests to verify all pass**

```bash
npm run test
```

Expected: all 3 CategoryBubble tests PASS. All previous tests still PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/bubble-budget/
git commit -m "feat: add Bubble Budget components (CategoryBubble, BubbleChart, BubbleDetail)"
```

---

## Task 13: Bubble Budget Screen

**Files:**
- Create: `src/features/bubble-budget/BubbleBudget.tsx`

- [ ] **Step 1: Create BubbleBudget screen**

Create `src/features/bubble-budget/BubbleBudget.tsx`:

```typescript
import { useBudget } from '../../context/BudgetContext'
import { BubbleChart } from './BubbleChart'
import { toMonthKey } from '../../utils/dateHelpers'

export function BubbleBudget() {
  const { state, dispatch } = useBudget()
  const [year, month] = state.selectedMonth.split('-').map(Number)
  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  function shiftMonth(delta: number) {
    const d = new Date(year, month - 1 + delta, 1)
    dispatch({ type: 'SET_MONTH', payload: toMonthKey(d) })
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-12 pb-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-extrabold text-slate-100">Bubble Budget</h1>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => shiftMonth(-1)} className="text-slate-400 hover:text-slate-200 text-xl px-1">‹</button>
        <span className="text-slate-400 text-sm">{monthLabel}</span>
        <button onClick={() => shiftMonth(1)} className="text-slate-400 hover:text-slate-200 text-xl px-1">›</button>
        <span className="text-slate-600 text-xs ml-2">· tap a bubble for details</span>
      </div>

      <BubbleChart categories={state.categories} currency={state.user.currency} />

      {/* Legend */}
      <div className="flex gap-4 mt-5">
        {[
          { color: 'bg-emerald-400', label: 'Under budget' },
          { color: 'bg-amber-400',   label: 'Near limit'   },
          { color: 'bg-red-500',     label: 'Over budget'  },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-slate-500 text-xs">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
npm run test
```

Expected: all previous tests still PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/bubble-budget/BubbleBudget.tsx
git commit -m "feat: add BubbleBudget screen"
```

---

## Task 14: Expense Logging Components

**Files:**
- Create: `src/features/expense-logging/CategoryPicker.tsx`
- Create: `src/features/expense-logging/CategoryPicker.test.tsx`
- Create: `src/features/expense-logging/ExpenseForm.tsx`
- Create: `src/features/expense-logging/ExpenseList.tsx`

- [ ] **Step 1: Write failing test for CategoryPicker**

Create `src/features/expense-logging/CategoryPicker.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryPicker } from './CategoryPicker'
import { mockCategories } from '../../data/mockBudget'

describe('CategoryPicker', () => {
  it('renders all category chips', () => {
    render(<CategoryPicker categories={mockCategories} selected={null} onSelect={vi.fn()} />)
    expect(screen.getByText('🐿️')).toBeInTheDocument()
    expect(screen.getByText('🦉')).toBeInTheDocument()
    expect(screen.getAllByRole('button').length).toBe(mockCategories.length)
  })

  it('highlights selected category', () => {
    render(<CategoryPicker categories={mockCategories} selected="food" onSelect={vi.fn()} />)
    const chip = screen.getByRole('button', { name: /Food & Groceries/i })
    expect(chip).toHaveClass('border-emerald-400')
  })

  it('calls onSelect with category id when clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<CategoryPicker categories={mockCategories} selected={null} onSelect={onSelect} />)
    await user.click(screen.getByRole('button', { name: /Food & Groceries/i }))
    expect(onSelect).toHaveBeenCalledWith('food')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test
```

Expected: FAIL — `Cannot find module './CategoryPicker'`

- [ ] **Step 3: Create CategoryPicker**

Create `src/features/expense-logging/CategoryPicker.tsx`:

```typescript
import type { Category } from '../../context/types'

type Props = {
  categories: Category[]
  selected: string | null
  onSelect: (id: string) => void
}

export function CategoryPicker({ categories, selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(cat => {
        const isSelected = cat.id === selected
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            aria-label={cat.name}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
              isSelected
                ? 'border-emerald-400 bg-emerald-950/60 text-emerald-300'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500'
            }`}
          >
            <span className="text-base">{cat.animal}</span>
            <span className="hidden sm:inline">{cat.name}</span>
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Create ExpenseForm**

Create `src/features/expense-logging/ExpenseForm.tsx`:

```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBudget } from '../../context/BudgetContext'
import { CategoryPicker } from './CategoryPicker'
import type { Expense } from '../../context/types'

function generateId(): string {
  return `exp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function ExpenseForm() {
  const { state, dispatch } = useBudget()
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || !categoryId) return
    const expense: Expense = {
      id: generateId(),
      categoryId,
      amount: parseFloat(amount),
      note: note.trim(),
      date,
    }
    dispatch({ type: 'ADD_EXPENSE', payload: expense })
    navigate('/')
  }

  const parsedAmount = parseFloat(amount) || 0
  const { symbol } = state.user.currency

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Amount */}
      <div>
        <label className="block text-slate-500 text-xs uppercase tracking-widest mb-2">Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">{symbol}</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 pl-10 text-slate-100 font-bold text-2xl focus:outline-none focus:border-emerald-500 transition-colors"
            required
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-slate-500 text-xs uppercase tracking-widest mb-2">Category</label>
        <CategoryPicker
          categories={state.categories}
          selected={categoryId}
          onSelect={setCategoryId}
        />
      </div>

      {/* Note */}
      <div>
        <label className="block text-slate-500 text-xs uppercase tracking-widest mb-2">Note <span className="normal-case text-slate-600">(optional)</span></label>
        <input
          type="text"
          placeholder="e.g. weekly grocery run…"
          value={note}
          onChange={e => setNote(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      {/* Date */}
      <div>
        <label className="block text-slate-500 text-xs uppercase tracking-widest mb-2">Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          required
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!amount || !categoryId}
        className="mt-2 w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-900 font-bold py-4 rounded-2xl text-sm uppercase tracking-wide disabled:opacity-40 disabled:cursor-not-allowed hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-900/30"
      >
        Save {parsedAmount > 0 ? `${symbol}${parsedAmount.toFixed(2)}` : 'Expense'}
      </button>
    </form>
  )
}
```

- [ ] **Step 5: Create ExpenseList**

Create `src/features/expense-logging/ExpenseList.tsx`:

```typescript
import { useBudget } from '../../context/BudgetContext'
import { formatAmount } from '../../utils/formatAmount'
import { friendlyDate } from '../../utils/dateHelpers'
import { Card } from '../../components/Card'

export function ExpenseList() {
  const { state, dispatch } = useBudget()
  const catMap = Object.fromEntries(state.categories.map(c => [c.id, c]))
  const sorted = [...state.expenses].sort((a, b) => b.date.localeCompare(a.date))

  if (sorted.length === 0) {
    return <p className="text-slate-600 text-sm text-center py-8">No expenses logged yet.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {sorted.map(expense => {
        const cat = catMap[expense.categoryId]
        return (
          <Card key={expense.id} className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-xl flex-shrink-0">
                {cat?.animal ?? '💸'}
              </div>
              <div>
                <div className="text-slate-100 text-sm font-semibold">{expense.note || cat?.name}</div>
                <div className="text-slate-500 text-xs">{friendlyDate(expense.date)}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-rose-400 text-sm font-bold">-{formatAmount(expense.amount, state.user.currency)}</div>
              <button
                onClick={() => dispatch({ type: 'DELETE_EXPENSE', payload: { id: expense.id } })}
                className="text-slate-600 hover:text-rose-400 transition-colors text-sm"
                aria-label="Delete expense"
              >
                🗑
              </button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 6: Run tests to verify all pass**

```bash
npm run test
```

Expected: all 3 CategoryPicker tests PASS. All previous tests still PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/expense-logging/
git commit -m "feat: add Expense Logging components (CategoryPicker, ExpenseForm, ExpenseList)"
```

---

## Task 15: Expense Logging Screen + App Wiring

**Files:**
- Create: `src/features/expense-logging/ExpenseLogging.tsx`
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Create ExpenseLogging screen**

Create `src/features/expense-logging/ExpenseLogging.tsx`:

```typescript
import { ExpenseForm } from './ExpenseForm'
import { ExpenseList } from './ExpenseList'

export function ExpenseLogging() {
  return (
    <div className="max-w-lg mx-auto px-4 pt-12 pb-6">
      <h1 className="text-2xl font-extrabold text-slate-100 mb-6">Log Expense</h1>
      <ExpenseForm />
      <div className="mt-10">
        <div className="text-slate-500 text-xs uppercase tracking-widest mb-3">All Expenses</div>
        <ExpenseList />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create a Profile page placeholder**

Create `src/features/profile/Profile.tsx`:

```typescript
import { ProfilePopover } from '../../components/ProfilePopover'

export function Profile() {
  return (
    <div className="max-w-lg mx-auto px-4 pt-12 pb-6">
      <h1 className="text-2xl font-extrabold text-slate-100 mb-6">Profile</h1>
      <ProfilePopover />
    </div>
  )
}
```

- [ ] **Step 3: Wire App.tsx with Router + Provider + routes**

Replace `src/App.tsx`:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BudgetProvider } from './context/BudgetContext'
import { Layout } from './components/Layout'
import { Dashboard } from './features/dashboard/Dashboard'
import { BubbleBudget } from './features/bubble-budget/BubbleBudget'
import { ExpenseLogging } from './features/expense-logging/ExpenseLogging'
import { Profile } from './features/profile/Profile'

export default function App() {
  return (
    <BrowserRouter>
      <BudgetProvider>
        <Layout>
          <Routes>
            <Route path="/"        element={<Dashboard />} />
            <Route path="/budget"  element={<BubbleBudget />} />
            <Route path="/log"     element={<ExpenseLogging />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Layout>
      </BudgetProvider>
    </BrowserRouter>
  )
}
```

- [ ] **Step 4: Update main.tsx**

Replace `src/main.tsx`:

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 5: Run all tests**

```bash
npm run test
```

Expected: all tests PASS (no regressions).

- [ ] **Step 6: Verify the dev server runs**

```bash
npm run dev
```

Open `http://localhost:5173` — expect to see the Dashboard with mock data, working bottom nav, and a rendered balance card. Navigate to `/budget` for bubbles and `/log` for the expense form.

- [ ] **Step 7: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/
git commit -m "feat: wire App with Router, BudgetProvider, and all 4 routes"
```

---

## Done

The app runs at `http://localhost:5173` with:
- ✅ Dashboard — greeting, balance card with currency picker, animal guide strip, recent expenses
- ✅ Bubble Budget — animated bubble field, tap-for-detail bottom sheet, month navigator
- ✅ Expense Logging — form with category picker, saves to Context, lists all expenses with delete
- ✅ Profile — currency selection, month navigation
- ✅ Responsive nav — bottom tabs on mobile, collapsing sidebar on desktop
- ✅ All mock data swappable by changing `src/context/BudgetContext.tsx` initial state source
