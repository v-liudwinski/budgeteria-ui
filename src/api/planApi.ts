import type { FamilyPlan, PlanCategory, FinancialGoal, PlanAnalysis } from './types'
import { api } from './apiClient'
import { mockPlanApi } from './mock/mockPlanApi'

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'

export type InviteResponse = {
  memberId: string
  userId: string
  inviteToken: string
  inviteUrl: string
}

const realPlanApi = {
  async getPlans(): Promise<FamilyPlan[]> {
    return api.get<FamilyPlan[]>('/plans')
  },

  async createPlan(data: {
    name: string
    currency: FamilyPlan['currency']
    monthlyIncome: number
    categories: PlanCategory[]
    goals: FinancialGoal[]
  }): Promise<FamilyPlan> {
    return api.post<FamilyPlan>('/plans', {
      name: data.name,
      currency: data.currency,
      monthlyIncome: data.monthlyIncome,
      categories: data.categories.map(c => ({
        name: c.name, emoji: c.emoji, color: c.color,
        monthlyLimit: c.monthlyLimit, isEssential: c.isEssential,
      })),
      goals: data.goals.map(g => ({
        name: g.name, targetAmount: g.targetAmount, currentAmount: g.currentAmount,
        deadline: g.deadline, priority: g.priority, monthlyContribution: g.monthlyContribution,
      })),
    })
  },

  async updatePlan(planId: string, updates: Partial<Pick<FamilyPlan, 'name' | 'currency' | 'monthlyIncome' | 'categories' | 'goals'>>): Promise<FamilyPlan> {
    return api.put<FamilyPlan>(`/plans/${planId}`, {
      name: updates.name ?? null,
      currency: updates.currency ?? null,
      monthlyIncome: updates.monthlyIncome ?? null,
      categories: updates.categories?.map(c => ({
        id: c.id, name: c.name, emoji: c.emoji, color: c.color,
        monthlyLimit: c.monthlyLimit, isEssential: c.isEssential,
      })) ?? null,
      goals: updates.goals?.map(g => ({
        id: g.id, name: g.name, targetAmount: g.targetAmount, currentAmount: g.currentAmount,
        deadline: g.deadline, priority: g.priority, monthlyContribution: g.monthlyContribution,
      })) ?? null,
    })
  },

  async analyzePlan(planId: string): Promise<PlanAnalysis> {
    return api.post<PlanAnalysis>(`/plans/${planId}/analyze`)
  },

  /** Generate an invite link. Pass email to also send an invite email. */
  async inviteMember(planId: string, email?: string): Promise<InviteResponse> {
    return api.post<InviteResponse>(`/plans/${planId}/members`, { email: email ?? null })
  },

  async removeMember(planId: string, memberId: string): Promise<void> {
    return api.del(`/plans/${planId}/members/${memberId}`)
  },

  async acceptInvite(token: string): Promise<FamilyPlan> {
    return api.post<FamilyPlan>('/plans/members/accept', { token })
  },

  async deletePlan(planId: string): Promise<void> {
    return api.del(`/plans/${planId}`)
  },
}

// Shape the mock API to the same interface (getPlans returns array)
const adaptedMockApi = {
  ...mockPlanApi,
  getPlans: async () => {
    const p = await (mockPlanApi as any).getPlan?.()
    return p ? [p] : []
  },
  inviteMember: async (planId: string, email?: string) => ({
    memberId: crypto.randomUUID(),
    userId: `pending|${crypto.randomUUID()}`,
    inviteToken: crypto.randomUUID().replace(/-/g, ''),
    inviteUrl: `${window.location.origin}/invite/accept?token=mock`,
  }),
  removeMember: async (planId: string, memberId: string) =>
    (mockPlanApi as any).removeMember?.(memberId),
  updatePlan: async (planId: string, updates: any) =>
    (mockPlanApi as any).updatePlan?.(updates),
  analyzePlan: async (planId: string) =>
    (mockPlanApi as any).analyzePlan?.(),
  deletePlan: async (_planId: string) => {},
}

export const planApi = useMocks ? adaptedMockApi : realPlanApi
