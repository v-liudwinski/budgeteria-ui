import type { FamilyPlan, Expense, AuthUser, PlanAnalysis } from '../types'

// In-memory mock state — reset on page refresh
let currentUser: AuthUser | null = null
let plan: FamilyPlan | null = null
let expenses: Expense[] = []

export function getMockUser(): AuthUser | null {
  return currentUser
}

export function setMockUser(user: AuthUser | null) {
  currentUser = user
}

export function getMockPlan(): FamilyPlan | null {
  return plan
}

export function setMockPlan(p: FamilyPlan | null) {
  plan = p
}

export function getMockExpenses(): Expense[] {
  return expenses
}

export function setMockExpenses(e: Expense[]) {
  expenses = e
}

export function addMockExpense(expense: Expense) {
  expenses = [expense, ...expenses]
  // Update category spent
  if (plan) {
    plan = {
      ...plan,
      categories: plan.categories.map(cat =>
        cat.id === expense.categoryId
          ? { ...cat, spent: cat.spent + expense.amount }
          : cat
      ),
    }
  }
}

export function deleteMockExpense(id: string) {
  const expense = expenses.find(e => e.id === id)
  if (!expense) return
  expenses = expenses.filter(e => e.id !== id)
  if (plan) {
    plan = {
      ...plan,
      categories: plan.categories.map(cat =>
        cat.id === expense.categoryId
          ? { ...cat, spent: Math.max(0, cat.spent - expense.amount) }
          : cat
      ),
    }
  }
}

export function generateMockAnalysis(p: FamilyPlan): PlanAnalysis {
  const totalLimits = p.categories.reduce((s, c) => s + c.monthlyLimit, 0)
  const totalGoalContributions = p.goals.reduce((s, g) => s + g.monthlyContribution, 0)
  const savingsRate = p.monthlyIncome > 0
    ? Math.round(((p.monthlyIncome - totalLimits) / p.monthlyIncome) * 100)
    : 0

  const riskAreas: string[] = []
  p.categories.forEach(cat => {
    const pct = Math.round((cat.monthlyLimit / p.monthlyIncome) * 100)
    if (cat.id === 'food' && pct > 20) riskAreas.push(`Food budget is ${pct}% of income — above the recommended 12-15%`)
    if (cat.id === 'housing' && pct > 35) riskAreas.push(`Housing costs at ${pct}% of income — try to keep under 30%`)
    if (cat.id === 'entertainment' && pct > 10) riskAreas.push(`Entertainment at ${pct}% — consider reducing to free up savings`)
  })
  if (totalLimits > p.monthlyIncome) {
    riskAreas.push(`Your planned expenses (${p.currency.symbol}${totalLimits.toLocaleString()}) exceed your income — review limits`)
  }

  const suggestions = [
    savingsRate < 10 ? 'Try to save at least 10% of your income — start by trimming non-essential categories' : 'Great savings rate! Consider increasing investment contributions',
    p.goals.length === 0 ? 'Add at least one financial goal to stay motivated' : `You have ${p.goals.length} goal(s) — stay consistent with monthly contributions`,
    totalGoalContributions > 0 ? `You\'re contributing ${p.currency.symbol}${totalGoalContributions}/mo toward goals — keep it up!` : 'Set monthly contributions for your goals to build momentum',
  ]

  const goalFeasibility = p.goals.map(g => {
    const monthsNeeded = g.monthlyContribution > 0
      ? Math.ceil((g.targetAmount - g.currentAmount) / g.monthlyContribution)
      : Infinity
    const deadlineMonths = Math.max(1, Math.ceil((new Date(g.deadline).getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)))
    const feasible = monthsNeeded <= deadlineMonths
    return {
      goalId: g.id,
      feasible,
      adjustedTimeline: feasible ? undefined : `At current rate: ${monthsNeeded} months (${monthsNeeded - deadlineMonths} more than planned)`,
    }
  })

  const overallScore = Math.min(100, Math.max(10,
    50
    + (savingsRate >= 20 ? 20 : savingsRate >= 10 ? 10 : 0)
    + (riskAreas.length === 0 ? 15 : -riskAreas.length * 5)
    + (p.goals.length > 0 ? 10 : 0)
    + (goalFeasibility.filter(g => g.feasible).length * 5)
  ))

  return { savingsRate, riskAreas, suggestions, goalFeasibility, overallScore }
}
