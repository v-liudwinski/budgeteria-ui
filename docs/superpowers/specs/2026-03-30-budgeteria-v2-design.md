# Budgeteria v2 — Redesign Spec

**Date:** 2026-03-30
**Status:** Approved
**Scope:** Full rethink — onboarding flow, family plans, AI analysis, new visual design

---

## 1. User Journey

```
Login (Auth0) → Onboarding Wizard (first-time) → Dashboard (returning)
                    ↓
    Step 1: Name plan + currency
    Step 2: Monthly income
    Step 3: Expense categories (pre-filled + custom)
    Step 4: Budget limits per category
    Step 5: Financial goals (short/medium/long)
    Step 6: AI Plan Analysis + advice
                    ↓
            Invite family members
                    ↓
        All members: log expenses + view dashboard
```

---

## 2. Tech Stack

| Concern | Choice |
|---|---|
| Framework | Vite 5 + React 18 + TypeScript 5 |
| Styling | Tailwind CSS 3 (light-blue + pink palette) |
| Auth | Auth0 SPA SDK (`@auth0/auth0-react`) — mocked in dev |
| Server state | React Query (`@tanstack/react-query`) |
| UI state | React Context (wizard steps, modals) |
| Routing | React Router v6 (protected routes) |
| API | Service layer in `src/api/` — mock implementations swap to real ASP.NET Core |
| Font | Inter (Google Fonts) |
| Testing | Vitest + React Testing Library |

---

## 3. Data Model

```typescript
type Currency = { code: string; symbol: string; locale: string }

type FamilyPlan = {
  id: string
  name: string
  currency: Currency
  monthlyIncome: number
  categories: PlanCategory[]
  goals: FinancialGoal[]
  createdBy: string
  members: FamilyMember[]
  createdAt: string
}

type PlanCategory = {
  id: string
  name: string
  emoji: string
  color: string
  monthlyLimit: number
  spent: number
  isEssential: boolean
}

type FinancialGoal = {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  priority: 'short' | 'medium' | 'long'
  monthlyContribution: number
}

type FamilyMember = {
  id: string
  userId: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'member'
  joinedAt: string
}

type Expense = {
  id: string
  categoryId: string
  amount: number
  note: string
  date: string
  memberId: string
  memberName: string
}

type PlanAnalysis = {
  savingsRate: number
  riskAreas: string[]
  suggestions: string[]
  goalFeasibility: { goalId: string; feasible: boolean; adjustedTimeline?: string }[]
  overallScore: number
}
```

---

## 4. Visual Design

### Color Palette

- Primary: `#7DD3FC` (light sky blue)
- Secondary: `#F9A8D4` (soft pink)
- Background: `#F0F9FF` (ice blue)
- Surface: `#FFFFFF` (white cards)
- Border: `#E0F2FE` (pale blue)
- Text: `#1E3A5F` (deep navy)
- Text Muted: `#94A3B8` (slate)
- Success: `#34D399` (mint green)
- Warning: `#FBBF24` (warm yellow)
- Danger: `#FB7185` (rose)
- Gradient: `135deg, #7DD3FC → #F9A8D4`

### Design Principles

- Light mode, rounded-2xl+ corners, soft shadows with blue tint
- Generous whitespace, large tap targets
- Emoji animals as category identifiers
- Micro-animations (hover lifts, progress fills)
- Inter font: 400/500 body, 700 headings

---

## 5. Folder Structure

```
src/
  api/
    client.ts               ← fetch wrapper with auth token
    types.ts                ← API types
    planApi.ts              ← CRUD plan, categories, goals
    expenseApi.ts           ← CRUD expenses
    memberApi.ts            ← invite, remove members
    aiApi.ts                ← analyzePlan
    mock/
      mockData.ts           ← in-memory state
      mockPlanApi.ts
      mockExpenseApi.ts
      mockMemberApi.ts
      mockAiApi.ts
  auth/
    AuthProvider.tsx         ← Auth0 provider wrapper (mock in dev)
    useAuth.ts              ← hook: user, isAuthenticated, login, logout
    ProtectedRoute.tsx      ← redirect to login if unauthenticated
    MockAuthProvider.tsx    ← dev-mode fake auth
  context/
    AppContext.tsx           ← UI state (active plan, wizard step, etc.)
    types.ts
  screens/
    LoginScreen.tsx
    onboarding/
      OnboardingWizard.tsx
      StepPlanName.tsx
      StepIncome.tsx
      StepCategories.tsx
      StepLimits.tsx
      StepGoals.tsx
      StepAiAnalysis.tsx
    DashboardScreen.tsx
    BubbleBudgetScreen.tsx
    ExpenseLogScreen.tsx
    FamilyScreen.tsx
    ProfileScreen.tsx
  components/
    Layout.tsx
    BottomNav.tsx
    Sidebar.tsx
    Card.tsx
    ProgressRing.tsx
    GoalCard.tsx
    CategoryChip.tsx
    MemberAvatar.tsx
    AiAdviceCard.tsx
    InviteModal.tsx
  utils/
    formatAmount.ts
    dateHelpers.ts
    categories.ts           ← default category presets
  App.tsx
  main.tsx
  index.css
```

---

## 6. Routing

```
/login          → LoginScreen (public)
/onboarding     → OnboardingWizard (auth required, no plan yet)
/               → DashboardScreen (auth required, has plan)
/budget         → BubbleBudgetScreen
/log            → ExpenseLogScreen
/family         → FamilyScreen
/profile        → ProfileScreen
```

Logic: if not authenticated → /login. If authenticated but no plan → /onboarding. Otherwise → /.

---

## 7. Default Category Presets

Essential: Housing & Rent 🏠, Food & Groceries 🛒, Bills & Utilities 💡, Health & Medical 🏥, Insurance 🛡️, Transport 🚗
Lifestyle: Clothes & Shopping 👗, Entertainment 🎭, Education 📚, Dining Out 🍽️, Personal Care 💅, Gifts & Donations 🎁
Savings: Emergency Fund 🏦, Vacation ✈️, Investments 📈, Other Goals 🎯

---

## 8. AI Analysis (Mocked)

POST the plan to AI endpoint → get back:
- Financial health score (0-100)
- Savings rate calculation
- Risk areas ("Food is 35% of income — above recommended 15%")
- Goal feasibility per goal
- 3 actionable suggestions

Mock returns a deterministic analysis based on the actual plan numbers.
