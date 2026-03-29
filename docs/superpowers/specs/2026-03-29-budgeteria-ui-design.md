# Budgeteria UI — Design Spec

**Date:** 2026-03-29
**Status:** Approved
**Scope:** Core 3 screens — Dashboard, Bubble Budget, Expense Logging

---

## 1. Overview

Budgeteria is a family budgeting web app built as a mobile-first SPA. Users track spending across life-domain categories, each represented by an animal guide character. The app launches with mocked data; all data access is isolated behind a thin layer that will be swapped for real API calls without touching components.

---

## 2. Stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | Vite + React 18 + TypeScript | Fast dev, simple SPA, no SSR needed |
| Styling | Tailwind CSS + custom components | Maximum creative freedom for bubble/animal visuals |
| Routing | React Router v6 | Standard SPA routing, 3 routes |
| State | React Context + useReducer | Built-in, zero deps, easy API migration path |
| Mock data | TypeScript files in `src/data/` | Single swap point per domain when API arrives |

---

## 3. Folder Structure

```
src/
  features/
    dashboard/
      Dashboard.tsx
      GreetingHeader.tsx
      BalanceSummary.tsx        ← balance card with currency badge
      AnimalGuideStrip.tsx      ← horizontal scroll of category chips
      RecentExpenses.tsx
    bubble-budget/
      BubbleBudget.tsx
      BubbleChart.tsx           ← SVG/CSS free-floating bubble field
      CategoryBubble.tsx        ← single animal bubble (size + color = % spent)
      BubbleDetail.tsx          ← tap → category breakdown sheet
    expense-logging/
      ExpenseLogging.tsx
      ExpenseForm.tsx
      CategoryPicker.tsx        ← horizontal chip grid of all 10 animals
      ExpenseList.tsx
  components/
    Layout.tsx                  ← wraps all pages, renders correct nav
    BottomNav.tsx               ← mobile < 768px
    Sidebar.tsx                 ← desktop ≥ 768px
    Card.tsx                    ← shared dark card primitive
    AnimalGuide.tsx             ← reusable emoji + name + progress
    CurrencyPicker.tsx          ← bottom sheet, 15 currencies
    ProfilePopover.tsx          ← avatar menu: name, currency, month nav
  context/
    BudgetContext.tsx           ← createContext + useReducer + Provider
    budgetReducer.ts            ← pure reducer: ADD_EXPENSE, SET_CURRENCY, SET_MONTH
    types.ts                    ← all shared TypeScript types
  data/
    mockUser.ts
    mockBudget.ts               ← 10 categories with limits + spent
    mockExpenses.ts             ← 15–20 sample expenses
  utils/
    formatAmount.ts             ← Intl.NumberFormat wrapper (currency-aware)
    dateHelpers.ts
  App.tsx                       ← Router + BudgetProvider wrapper
  main.tsx
```

---

## 4. Data Model

```typescript
// context/types.ts

type Currency = {
  code: string    // "USD" | "EUR" | "GBP" | "UAH" | "PLN" …
  symbol: string  // "$" | "€" | "£" | "₴" | "zł" …
  locale: string  // "en-US" | "de-DE" | "uk-UA" … (Intl.NumberFormat)
}

type Category = {
  id: string
  name: string        // "Food & Groceries"
  animal: string      // emoji: "🐿️"
  color: string       // tailwind color name: "emerald" | "amber" …
  limit: number       // monthly budget cap
  spent: number       // current month total spent
}

type Expense = {
  id: string
  categoryId: string
  amount: number
  note: string
  date: string        // ISO 8601 date string
}

type User = {
  name: string
  familyMembers: string[]
  currency: Currency
}

type BudgetState = {
  user: User
  categories: Category[]
  expenses: Expense[]
  selectedMonth: string   // "2026-03"
}
```

**Reducer actions:** `ADD_EXPENSE | DELETE_EXPENSE | SET_CURRENCY | SET_MONTH | UPDATE_CATEGORY_LIMIT`

---

## 5. Categories (10 life domains)

| Category | Animal | Tailwind color | Default limit (USD) |
|---|---|---|---|
| Food & Groceries | 🐿️ | emerald | $600 |
| Bills & Utilities | 🦉 | amber | $500 |
| Transport | 🐦 | sky | $200 |
| Savings | 🦔 | violet | $500 |
| Insurance | 🐢 | slate | $220 |
| Health & Medical | 🐸 | green | $120 |
| Clothes & Shopping | 🦋 | pink | $300 |
| Entertainment | 🦊 | orange | $150 |
| Education | 🦅 | indigo | $200 |
| Miscellaneous | 🐾 | zinc | $100 |

---

## 6. Screens

### 6.1 Main Dashboard (`/`)

**Layout:** full-height, scrollable content area with sticky bottom nav (mobile) or sidebar (desktop).

**Sections (top to bottom):**
1. **Status bar** — date string
2. **Greeting header** — "Morning, [name]! 👋" with gradient text
3. **Balance card** — dark green gradient card showing total balance, income, spent, remaining. Currency badge (`🌐 USD ▾`) in top-right corner — taps to open `CurrencyPicker`
4. **Animal Guide Strip** — horizontally scrollable chips for all categories showing animal + name + `spent/limit` + mini progress bar (green → amber → red)
5. **Recent Expenses** — last 10 expenses as cards (icon, name, date, amount in red)

### 6.2 Bubble Budget (`/budget`)

**Layout:** full-height with fixed header and bubble field filling remaining space.

**Sections:**
1. **Header** — "Bubble Budget" title + month selector (`< March 2026 >`)
2. **Bubble field** — constrained container, bubbles placed with physics-inspired layout (no overlap). Each bubble:
   - **Size** proportional to category `limit` (largest = Food/Bills/Savings)
   - **Color fill** based on `spent/limit` ratio: `< 75%` emerald, `75–95%` amber, `> 95%` red
   - **Content** — animal emoji + category name + percentage
   - **Tap** → slides up `BubbleDetail` bottom sheet with full breakdown
3. **Legend** — three color dots: Under budget / Near limit / Over budget

### 6.3 Expense Logging (`/log`)

**Layout:** scrollable form.

**Fields:**
1. **Amount** — large tap-to-edit number input, defaults to `$0.00`
2. **Category** — chip grid (all 10 animals), single-select, selected state uses category's color
3. **Note** — optional free-text input
4. **Date** — defaults to today, tappable to change
5. **Save button** — dispatches `ADD_EXPENSE` to context, navigates back to Dashboard

---

## 7. Navigation

### Mobile (< 768px) — `BottomNav`
4 items + central FAB:
`🏠 Home` · `💰 Budget` · **[➕ FAB]** · `📋 Expenses` · `👤 Profile`

### Desktop (≥ 768px) — `Sidebar`
Left sidebar (56px collapsed, 200px expanded on hover):
`🏠 Dashboard` · `💰 Bubble Budget` · `➕ Log Expense` · divider · `👤 Profile`

`ProfilePopover` (clicking 👤): display name, currency selector, selected month navigator.

---

## 8. Currency

- **Supported:** USD, EUR, GBP, UAH, PLN, CHF, CAD, AUD, JPY, SEK, NOK, DKK, CZK, HUF, RON
- **Default:** USD
- **Picker UI:** `CurrencyPicker` bottom sheet — list of currencies with code + symbol + country flag emoji
- **Formatting:** all amounts pass through `formatAmount(amount, currency)` which uses `Intl.NumberFormat(locale, { style: 'currency', currency: code })`
- **Persistence:** stored in `BudgetState.user.currency`, survives reducer updates (localStorage in phase 2)

---

## 9. Mock Data Strategy

`src/data/` files export plain TypeScript objects that match the type definitions exactly. Components never import from `src/data/` directly — they read from Context via `useBudget()` hook. When the API arrives, only `BudgetContext.tsx` changes (fetch replaces static import).

---

## 10. Out of Scope (this iteration)

- Onboarding & Family Setup screen
- Financial Profile Setup screen
- Authentication
- Persistence (localStorage / API)
- Charts / graphs (beyond bubble field)
- Notifications
