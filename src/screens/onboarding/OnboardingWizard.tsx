import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { planApi } from '../../api/planApi'
import { useToast } from '../../components/Toast'
import type { Currency, PlanCategory, FinancialGoal, PlanAnalysis } from '../../api/types'
import { StepPlanName } from './StepPlanName'
import { StepIncome } from './StepIncome'
import { StepCategories } from './StepCategories'
import { StepLimits } from './StepLimits'
import { StepGoals } from './StepGoals'
import { StepAiAnalysis } from './StepAiAnalysis'

const STEPS = ['Plan', 'Income', 'Categories', 'Limits', 'Goals', 'Analysis'] as const

export function OnboardingWizard() {
  const navigate = useNavigate()
  const { upsertPlan } = useApp()
  const { toast } = useToast()
  const [step, setStep] = useState(0)

  // Wizard state
  const [planName, setPlanName] = useState('')
  const [currency, setCurrency] = useState<Currency>({ code: 'USD', symbol: '$', locale: 'en-US' })
  const [monthlyIncome, setMonthlyIncome] = useState(0)
  const [categories, setCategories] = useState<PlanCategory[]>([])
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [analysis, setAnalysis] = useState<PlanAnalysis | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  function next() { setStep(s => Math.min(s + 1, STEPS.length - 1)) }
  function back() { setStep(s => Math.max(s - 1, 0)) }

  async function handleCreatePlan() {
    setIsCreating(true)
    try {
      const newPlan = await planApi.createPlan({
        name: planName,
        currency,
        monthlyIncome,
        categories,
        goals,
      })
      upsertPlan(newPlan)

      // Get AI analysis
      const result = await planApi.analyzePlan(newPlan.id)
      setAnalysis(result)
      next() // Go to analysis step
    } catch (err) {
      console.error('Failed to create plan:', err)
      toast('Failed to create plan. Please try again.', 'error')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleFinish() {
    navigate('/')
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Decorative blobs */}
      <div className="fixed top-0 right-0 w-64 h-64 bg-brand-pink/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-lg mx-auto px-4 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-brand-muted text-xs font-medium uppercase tracking-wide">
              Step {step + 1} of {STEPS.length}
            </span>
            <span className="text-brand-muted text-xs">{STEPS[step]}</span>
          </div>
          <div className="h-2 bg-brand-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-blue to-brand-pink rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Step dots */}
          <div className="flex justify-between mt-2 px-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i <= step ? 'bg-brand-blue' : 'bg-brand-border'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-3xl shadow-soft border border-brand-border p-6 md:p-8">
          {step === 0 && (
            <StepPlanName
              planName={planName}
              setPlanName={setPlanName}
              currency={currency}
              setCurrency={setCurrency}
              onNext={next}
            />
          )}
          {step === 1 && (
            <StepIncome
              monthlyIncome={monthlyIncome}
              setMonthlyIncome={setMonthlyIncome}
              currency={currency}
              onNext={next}
              onBack={back}
            />
          )}
          {step === 2 && (
            <StepCategories
              categories={categories}
              setCategories={setCategories}
              onNext={next}
              onBack={back}
            />
          )}
          {step === 3 && (
            <StepLimits
              categories={categories}
              setCategories={setCategories}
              monthlyIncome={monthlyIncome}
              currency={currency}
              onNext={next}
              onBack={back}
            />
          )}
          {step === 4 && (
            <StepGoals
              goals={goals}
              setGoals={setGoals}
              currency={currency}
              onNext={handleCreatePlan}
              onBack={back}
              isLoading={isCreating}
            />
          )}
          {step === 5 && analysis && (
            <StepAiAnalysis
              analysis={analysis}
              goals={goals}
              currency={currency}
              onFinish={handleFinish}
            />
          )}
        </div>
      </div>
    </div>
  )
}
