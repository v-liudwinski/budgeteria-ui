import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { FamilyPlan } from '../api/types'
import { planApi } from '../api/planApi'
import { queryKeys } from '../api/queryKeys'
import { useAuth } from '../auth/AuthProvider'

const ACTIVE_PLAN_KEY = 'budgeteria_active_plan_id'

type AppContextValue = {
  /** All plans the user belongs to. */
  plans: FamilyPlan[]
  /** The currently active (selected) plan. */
  plan: FamilyPlan | null
  /** Switch the active plan by id. */
  switchPlan: (id: string) => void
  /** Manually set/replace a plan in the list (e.g. after accept-invite). */
  upsertPlan: (plan: FamilyPlan) => void
  /** Remove a plan from the list (e.g. after deletion). */
  removePlan: (planId: string) => void
  selectedMonth: string
  setSelectedMonth: (month: string) => void
  isPlansLoading: boolean
  plansError: Error | null
  refreshPlans: () => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isReady } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(currentMonth())
  const [activePlanId, setActivePlanId] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_PLAN_KEY)
  )
  const queryClient = useQueryClient()

  const canFetch = isAuthenticated && isReady

  const {
    data: plans = [],
    isPending,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.plans,
    queryFn: planApi.getPlans,
    enabled: canFetch,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  })

  // When plans load, ensure activePlanId points to a valid plan.
  // Default to first plan if the stored id is no longer valid.
  useEffect(() => {
    if (!plans.length) return
    const valid = plans.find(p => p.id === activePlanId)
    if (!valid) {
      const first = plans[0].id
      setActivePlanId(first)
      localStorage.setItem(ACTIVE_PLAN_KEY, first)
    }
  }, [plans, activePlanId])

  const plan = plans.find(p => p.id === activePlanId) ?? plans[0] ?? null

  const switchPlan = useCallback((id: string) => {
    setActivePlanId(id)
    localStorage.setItem(ACTIVE_PLAN_KEY, id)
  }, [])

  const upsertPlan = useCallback((next: FamilyPlan) => {
    queryClient.setQueryData<FamilyPlan[]>(queryKeys.plans, (old = []) => {
      const idx = old.findIndex(p => p.id === next.id)
      return idx >= 0 ? old.map((p, i) => (i === idx ? next : p)) : [...old, next]
    })
    // Make the newly added/updated plan active
    setActivePlanId(next.id)
    localStorage.setItem(ACTIVE_PLAN_KEY, next.id)
  }, [queryClient])

  const removePlan = useCallback((planId: string) => {
    queryClient.setQueryData<FamilyPlan[]>(queryKeys.plans, (old = []) => old.filter(p => p.id !== planId))
    setActivePlanId(prev => {
      if (prev !== planId) return prev
      localStorage.removeItem(ACTIVE_PLAN_KEY)
      return null
    })
  }, [queryClient])

  const refreshPlans = useCallback(async () => { await refetch() }, [refetch])

  const isPlansLoading = canFetch && (isPending || isFetching)
  const plansError = error as Error | null

  // Clear cache on logout
  const wasAuthenticated = useRef(false)
  useEffect(() => {
    if (isAuthenticated) {
      wasAuthenticated.current = true
    } else if (wasAuthenticated.current) {
      wasAuthenticated.current = false
      queryClient.removeQueries({ queryKey: queryKeys.plans })
      // Clear all expense queries
      queryClient.removeQueries({ queryKey: ['expenses'] })
    }
  }, [isAuthenticated, queryClient])

  return (
    <AppContext.Provider value={{
      plans, plan, switchPlan, upsertPlan, removePlan,
      selectedMonth, setSelectedMonth,
      isPlansLoading, plansError, refreshPlans,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
