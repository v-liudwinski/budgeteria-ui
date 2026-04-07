import { useApp } from '../context/AppContext'
import { useAuth } from '../auth/AuthProvider'
import { useQuery } from '@tanstack/react-query'
import { expenseApi } from '../api/expenseApi'
import { queryKeys } from '../api/queryKeys'
import { ProgressRing } from '../components/ProgressRing'
import { GoalCard } from '../components/GoalCard'
import { Card } from '../components/Card'
import { formatAmount } from '../utils/formatAmount'
import { getGreeting, friendlyDate } from '../utils/dateHelpers'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PlusCircle, Users, AlertTriangle, TrendingUp, TrendingDown, Minus, Target } from 'lucide-react'

export function DashboardScreen() {
  const { plan } = useApp()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data: expenses = [] } = useQuery({
    queryKey: queryKeys.expenses(plan?.id ?? ''),
    queryFn: () => expenseApi.getExpenses(plan!.id),
    enabled: !!plan,
  })

  if (!plan) return null
  const { categories, currency, goals } = plan

  const totalBudget = categories.reduce((s, c) => s + c.monthlyLimit, 0)
  const totalSpent  = categories.reduce((s, c) => s + c.spent, 0)
  const remaining   = totalBudget - totalSpent
  const pct         = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0

  const overBudget = categories.filter(c => c.spent > c.monthlyLimit && c.monthlyLimit > 0)
  const topSpenders = [...categories].sort((a, b) => b.spent - a.spent).filter(c => c.spent > 0).slice(0, 5)
  const recentExpenses = expenses.slice(0, 4)

  // Compute projected spending:
  // Essential categories (rent, subscriptions, etc.) are one-time monthly costs — don't project as daily.
  // Only variable (non-essential) spending is projected as a daily rate.
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const dayOfMonth = new Date().getDate()
  const essentialSpent = categories.filter(c => c.isEssential).reduce((s, c) => s + c.spent, 0)
  const variableSpent = totalSpent - essentialSpent
  const dailyAvg = dayOfMonth > 0 ? variableSpent / dayOfMonth : 0
  const projectedTotal = essentialSpent + dailyAvg * daysInMonth
  const projectedStatus = projectedTotal > totalBudget * 1.1 ? 'over' : projectedTotal > totalBudget * 0.85 ? 'tight' : 'good'

  const greetingText = getGreeting()

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <p className="text-brand-muted text-sm">{t(`dashboard.greeting.${greetingText}`)}</p>
        <h1 className="text-brand-navy text-2xl font-bold">{user?.name || plan.members[0]?.name || 'there'}</h1>
        <p className="text-brand-muted text-xs mt-0.5">{plan.name}</p>
      </div>

      {/* Hero balance card */}
      <div className="bg-gradient-to-br from-sky-100 via-white to-pink-100 border border-brand-border rounded-3xl p-6 shadow-soft relative overflow-hidden animate-fade-in-up delay-75">
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand-blue/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-brand-pink/10 rounded-full blur-2xl" />

        <div className="relative flex items-center gap-5">
          <ProgressRing
            value={pct}
            size={90}
            color={pct > 100 ? 'text-brand-danger' : pct >= 85 ? 'text-brand-warning' : 'text-brand-blue'}
            label={t('dashboard.used')}
          />
          <div className="flex-1">
            <p className="text-brand-muted text-xs uppercase tracking-wide">{t('dashboard.remaining')}</p>
            <p className={`text-3xl font-extrabold ${remaining < 0 ? 'text-brand-danger' : 'text-brand-navy'}`}>
              {formatAmount(remaining, currency)}
            </p>
            <p className="text-brand-muted text-xs mt-1">
              {formatAmount(totalSpent, currency)} {t('common.of')} {formatAmount(totalBudget, currency)}
            </p>
          </div>
        </div>

        {/* Projected spending hint */}
        {totalSpent > 0 && (
          <div className={`mt-4 pt-3 border-t border-brand-border/50 text-xs flex items-center gap-1.5 ${
            projectedStatus === 'over' ? 'text-brand-danger' : projectedStatus === 'tight' ? 'text-brand-warning' : 'text-brand-success'
          }`}>
            {projectedStatus === 'over' && <TrendingUp size={14} className="flex-shrink-0" />}
            {projectedStatus === 'tight' && <Minus size={14} className="flex-shrink-0" />}
            {projectedStatus === 'good' && <TrendingDown size={14} className="flex-shrink-0" />}
            <span>
              {t(`dashboard.pace.${projectedStatus}`, { amount: formatAmount(Math.round(projectedTotal), currency) })}
            </span>
          </div>
        )}
      </div>

      {/* Over-budget alert */}
      {overBudget.length > 0 && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3 flex items-start gap-3 animate-fade-in-up">
          <AlertTriangle size={18} className="text-rose-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-rose-700 font-semibold text-sm">{t('dashboard.overBudget', { count: overBudget.length })}</p>
            <p className="text-rose-500 text-xs">{overBudget.map(c => `${c.emoji} ${c.name}`).join(', ')}</p>
          </div>
        </div>
      )}

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-3 animate-fade-in-up delay-150">
        <Card className="p-3 text-center">
          <p className="text-brand-muted text-[10px] uppercase tracking-wide mb-0.5">{t('dashboard.dailyAvg')}</p>
          <p className="text-brand-navy font-bold text-sm">{formatAmount(Math.round(dailyAvg), currency)}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-brand-muted text-[10px] uppercase tracking-wide mb-0.5">{t('dashboard.allCategories')}</p>
          <p className="text-brand-navy font-bold text-sm">{categories.length}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-brand-muted text-[10px] uppercase tracking-wide mb-0.5">{t('dashboard.monthlyIncome')}</p>
          <p className="text-brand-navy font-bold text-sm">{formatAmount(plan.monthlyIncome, currency)}</p>
        </Card>
      </div>

      {/* Recent expenses */}
      {recentExpenses.length > 0 && (
        <div className="animate-fade-in-up delay-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-brand-navy font-semibold text-sm uppercase tracking-wide">{t('dashboard.recentExpenses')}</h2>
            <button onClick={() => navigate('/log')} className="text-brand-blue text-xs font-medium hover:underline">{t('common.viewAll')}</button>
          </div>
          <Card>
            {recentExpenses.map((exp, i) => {
              const cat = categories.find(c => c.id === exp.categoryId)
              return (
                <div
                  key={exp.id}
                  className={`flex items-center gap-3 px-4 py-3 ${i < recentExpenses.length - 1 ? 'border-b border-brand-border' : ''}`}
                >
                  <span className="text-xl flex-shrink-0">{cat?.emoji ?? '$'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-brand-navy text-sm font-medium truncate">{exp.note}</p>
                    <p className="text-brand-muted text-xs">{cat?.name} · {friendlyDate(exp.date)}</p>
                  </div>
                  <span className="text-brand-navy font-semibold text-sm tabular-nums">{formatAmount(exp.amount, currency)}</span>
                </div>
              )
            })}
          </Card>
        </div>
      )}

      {/* Top spenders */}
      {topSpenders.length > 0 && (
        <div className="animate-fade-in-up delay-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-brand-navy font-semibold text-sm uppercase tracking-wide">{t('dashboard.topCategories')}</h2>
            <button onClick={() => navigate('/budget')} className="text-brand-blue text-xs font-medium hover:underline">{t('dashboard.viewBudget')}</button>
          </div>
          <div className="space-y-2">
            {topSpenders.map(cat => {
              const catPct = cat.monthlyLimit > 0 ? Math.min(100, Math.round((cat.spent / cat.monthlyLimit) * 100)) : 0
              return (
                <button
                  key={cat.id}
                  onClick={() => navigate('/budget')}
                  className="flex items-center gap-3 w-full bg-white border border-brand-border rounded-xl px-3 py-2.5 hover:shadow-soft hover:-translate-y-0.5 transition-all"
                >
                  <span className="text-lg">{cat.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-brand-navy text-xs font-semibold">{cat.name}</span>
                      <span className="text-brand-muted text-[10px]">{catPct}%</span>
                    </div>
                    <div className="h-1.5 bg-brand-border rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${catPct > 100 ? 'bg-brand-danger' : catPct >= 85 ? 'bg-brand-warning' : 'bg-brand-blue'}`}
                        style={{ width: `${catPct}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-brand-navy text-xs font-semibold tabular-nums ml-2">
                    {formatAmount(cat.spent, currency)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Category scroll */}
      <div className="animate-fade-in-up delay-300">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-brand-navy font-semibold text-sm uppercase tracking-wide">{t('dashboard.allCategories')}</h2>
          <button onClick={() => navigate('/categories')} className="text-brand-blue text-xs font-medium hover:underline">{t('common.viewAll')}</button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {categories.map(cat => {
            const catPct = cat.monthlyLimit > 0 ? Math.min(100, Math.round((cat.spent / cat.monthlyLimit) * 100)) : 0
            return (
              <button
                key={cat.id}
                onClick={() => navigate('/budget')}
                className="flex-shrink-0 bg-white border border-brand-border rounded-2xl p-3 min-w-[140px] hover:shadow-soft hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="text-brand-navy text-xs font-semibold truncate">{cat.name}</span>
                </div>
                <div className="h-1.5 bg-brand-border rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full transition-all ${catPct > 100 ? 'bg-brand-danger' : catPct >= 85 ? 'bg-brand-warning' : 'bg-brand-blue'}`}
                    style={{ width: `${catPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-brand-muted">{formatAmount(cat.spent, currency)}</span>
                  <span className="text-brand-muted">{formatAmount(cat.monthlyLimit, currency)}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Goals */}
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-brand-navy font-semibold text-sm uppercase tracking-wide">{t('dashboard.goals')}</h2>
          <button onClick={() => navigate('/goals')} className="text-brand-blue text-xs font-medium hover:underline">
            {goals.length > 0 ? t('dashboard.viewGoals') : t('goals.addGoal')}
          </button>
        </div>
        {goals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {goals.map(goal => (
              <GoalCard key={goal.id} goal={goal} currency={currency} />
            ))}
          </div>
        ) : (
          <Card className="p-5 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-violet-50 mb-2">
              <Target size={20} className="text-violet-500" />
            </div>
            <p className="text-brand-muted text-sm">{t('dashboard.noGoals')}</p>
          </Card>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 animate-fade-in-up">
        <button
          onClick={() => navigate('/log')}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-blue to-sky-300 text-white font-semibold py-4 rounded-2xl text-sm hover:shadow-soft hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          <PlusCircle size={18} strokeWidth={2.2} />
          {t('nav.logExpense')}
        </button>
        <button
          onClick={() => navigate('/family')}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-pink to-rose-300 text-white font-semibold py-4 rounded-2xl text-sm hover:shadow-soft hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          <Users size={18} strokeWidth={2.2} />
          {t('nav.family')}
        </button>
      </div>
    </div>
  )
}
