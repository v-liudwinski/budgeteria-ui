import type { Currency, FinancialGoal, PlanAnalysis } from '../../api/types'
import { ProgressRing } from '../../components/ProgressRing'
import { formatAmount } from '../../utils/formatAmount'
import { AiAdviceCard } from '../../components/AiAdviceCard'
import { Button } from '../../components/Button'

type Props = {
  analysis: PlanAnalysis
  goals: FinancialGoal[]
  currency: Currency
  onFinish: () => void
}

export function StepAiAnalysis({ analysis, goals, currency, onFinish }: Props) {
  const scoreColor =
    analysis.overallScore >= 70 ? 'text-brand-success' :
    analysis.overallScore >= 40 ? 'text-brand-warning' : 'text-brand-danger'

  const scoreLabel =
    analysis.overallScore >= 70 ? 'Great start!' :
    analysis.overallScore >= 40 ? 'Room to improve' : 'Needs attention'

  return (
    <div>
      <div className="text-4xl mb-3">🤖</div>
      <h2 className="text-xl font-bold text-brand-navy mb-1">Your plan analysis</h2>
      <p className="text-brand-muted text-sm mb-6">Here's what our AI thinks about your budget plan.</p>

      {/* Score */}
      <div className="flex items-center gap-5 mb-6">
        <ProgressRing value={analysis.overallScore} size={90} color={scoreColor} label="score" />
        <div>
          <p className={`text-lg font-bold ${scoreColor}`}>{scoreLabel}</p>
          <p className="text-brand-muted text-sm">Savings rate: {analysis.savingsRate}%</p>
        </div>
      </div>

      {/* Risk areas */}
      {analysis.riskAreas.length > 0 && (
        <div className="mb-4">
          <h3 className="text-brand-navy text-xs font-semibold uppercase tracking-wide mb-2">
            ⚠️ Watch out for
          </h3>
          <div className="space-y-2">
            {analysis.riskAreas.map((risk, i) => (
              <AiAdviceCard
                key={i}
                variant="risk"
                icon="⚠️"
                text={risk}
              />
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      <div className="mb-4">
        <h3 className="text-brand-navy text-xs font-semibold uppercase tracking-wide mb-2">
          💡 Suggestions
        </h3>
        <div className="space-y-2">
          {analysis.suggestions.map((tip, i) => (
            <AiAdviceCard
              key={i}
              variant="tip"
              icon="💡"
              text={tip}
            />
          ))}
        </div>
      </div>

      {/* Goal feasibility */}
      {analysis.goalFeasibility.length > 0 && (
        <div className="mb-6">
          <h3 className="text-brand-navy text-xs font-semibold uppercase tracking-wide mb-2">
            🎯 Goal feasibility
          </h3>
          <div className="space-y-2">
            {analysis.goalFeasibility.map(gf => {
              const goal = goals.find(g => g.id === gf.goalId)
              if (!goal) return null
              return (
                <div key={gf.goalId} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border ${gf.feasible ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                  <span className="text-lg">{gf.feasible ? '✅' : '⏳'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-navy truncate">{goal.name}</p>
                    <p className="text-xs text-brand-muted">
                      {gf.feasible
                        ? `On track — ${formatAmount(goal.monthlyContribution, currency)}/mo`
                        : gf.adjustedTimeline}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <Button
        onClick={onFinish}
        size="lg"
        className="w-full"
      >
        Go to Dashboard 🚀
      </Button>
    </div>
  )
}
