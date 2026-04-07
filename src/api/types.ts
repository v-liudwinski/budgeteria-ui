export type Currency = {
  code: string
  symbol: string
  locale: string
}

export type PlanCategory = {
  id: string
  name: string
  emoji: string
  color: string
  monthlyLimit: number
  spent: number
  isEssential: boolean
}

export type FinancialGoal = {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  priority: 'short' | 'medium' | 'long'
  monthlyContribution: number
}

export type FamilyMember = {
  id: string
  userId: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'member'
  joinedAt: string
}

/** A pending member is one who was invited but hasn't accepted yet */
export function isPendingMember(member: FamilyMember): boolean {
  return member.userId.startsWith('pending|')
}

export type FamilyPlan = {
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

export type Expense = {
  id: string
  categoryId: string
  amount: number
  note: string
  date: string
  memberId: string
  memberName: string
}

export type PlanAnalysis = {
  savingsRate: number
  riskAreas: string[]
  suggestions: string[]
  goalFeasibility: {
    goalId: string
    feasible: boolean
    adjustedTimeline?: string
  }[]
  overallScore: number
}

export type AuthUser = {
  id: string
  name: string
  email: string
  avatar?: string
}
