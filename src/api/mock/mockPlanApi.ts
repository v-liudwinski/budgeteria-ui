import type { FamilyPlan, PlanCategory, FinancialGoal, FamilyMember } from '../types'
import { getMockPlan, setMockPlan, getMockUser, generateMockAnalysis } from './mockData'

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))

export const mockPlanApi = {
  async getPlan(): Promise<FamilyPlan | null> {
    await delay(200)
    return getMockPlan()
  },

  async createPlan(data: {
    name: string
    currency: FamilyPlan['currency']
    monthlyIncome: number
    categories: PlanCategory[]
    goals: FinancialGoal[]
  }): Promise<FamilyPlan> {
    await delay(400)
    const user = getMockUser()!
    const plan: FamilyPlan = {
      id: `plan-${Date.now()}`,
      ...data,
      createdBy: user.id,
      members: [{
        id: `member-${user.id}`,
        userId: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: 'admin',
        joinedAt: new Date().toISOString(),
      }],
      createdAt: new Date().toISOString(),
    }
    setMockPlan(plan)
    return plan
  },

  async updatePlan(updates: Partial<Pick<FamilyPlan, 'name' | 'currency' | 'monthlyIncome' | 'categories' | 'goals'>>): Promise<FamilyPlan> {
    await delay(300)
    const plan = getMockPlan()
    if (!plan) throw new Error('No plan found')
    const updated = { ...plan, ...updates }
    setMockPlan(updated)
    return updated
  },

  async analyzePlan(): Promise<ReturnType<typeof generateMockAnalysis>> {
    await delay(800)
    const plan = getMockPlan()
    if (!plan) throw new Error('No plan found')
    return generateMockAnalysis(plan)
  },

  async inviteMember(email: string, name: string): Promise<FamilyMember> {
    await delay(400)
    const plan = getMockPlan()
    if (!plan) throw new Error('No plan found')
    const member: FamilyMember = {
      id: `member-${Date.now()}`,
      userId: `user-${Date.now()}`,
      name,
      email,
      role: 'member',
      joinedAt: new Date().toISOString(),
    }
    setMockPlan({ ...plan, members: [...plan.members, member] })
    return member
  },

  async removeMember(memberId: string): Promise<void> {
    await delay(300)
    const plan = getMockPlan()
    if (!plan) throw new Error('No plan found')
    setMockPlan({ ...plan, members: plan.members.filter(m => m.id !== memberId) })
  },

  async acceptInvite(_token: string): Promise<FamilyPlan> {
    await delay(400)
    const plan = getMockPlan()
    if (!plan) throw new Error('No plan found')
    return plan
  },
}
