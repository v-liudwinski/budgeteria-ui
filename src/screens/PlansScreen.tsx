import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../auth/AuthProvider'
import { planApi } from '../api/planApi'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { useToast } from '../components/Toast'
import { formatAmount } from '../utils/formatAmount'
import { useTranslation } from 'react-i18next'
import { PlusCircle, CheckCircle2, Users, LayoutGrid, Trash2, X, Settings2, ChevronDown, ChevronUp } from 'lucide-react'

const CURRENCIES = [
  { code: 'USD', symbol: '$', locale: 'en-US' },
  { code: 'EUR', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', locale: 'en-GB' },
  { code: 'UAH', symbol: '₴', locale: 'uk-UA' },
  { code: 'PLN', symbol: 'zł', locale: 'pl-PL' },
  { code: 'CHF', symbol: 'Fr', locale: 'de-CH' },
  { code: 'JPY', symbol: '¥', locale: 'ja-JP' },
  { code: 'CZK', symbol: 'Kč', locale: 'cs-CZ' },
]

export function PlansScreen() {
  const { plans, plan: activePlan, switchPlan, removePlan, upsertPlan } = useApp()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useTranslation()

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  async function handleDelete(planId: string) {
    setIsDeletingId(planId)
    try {
      await planApi.deletePlan(planId)
      removePlan(planId)
      toast('Plan deleted')
      setConfirmDeleteId(null)
      if (activePlan?.id === planId) navigate('/')
    } catch {
      toast('Failed to delete plan', 'error')
    } finally {
      setIsDeletingId(null)
    }
  }

  function openSettings(planId: string, currentName: string) {
    setEditingPlanId(planId)
    setEditName(currentName)
  }

  function closeSettings() {
    setEditingPlanId(null)
    setEditName('')
  }

  async function savePlanName(planId: string) {
    if (!editName.trim()) return
    const plan = plans.find(p => p.id === planId)
    if (!plan) return
    setIsSavingSettings(true)
    try {
      const updated = await planApi.updatePlan(planId, { name: editName.trim() })
      upsertPlan(updated)
      closeSettings()
    } catch {
      toast('Failed to save', 'error')
    } finally {
      setIsSavingSettings(false)
    }
  }

  async function changeCurrency(planId: string, code: string) {
    const c = CURRENCIES.find(c => c.code === code)
    if (!c) return
    const plan = plans.find(p => p.id === planId)
    if (!plan) return
    const optimistic = { ...plan, currency: c }
    upsertPlan(optimistic)
    try {
      const updated = await planApi.updatePlan(planId, { currency: c })
      upsertPlan(updated)
    } catch (err) {
      console.error('Failed to update currency:', err)
      upsertPlan(plan) // revert
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-brand-navy">{t('plans.title')}</h1>
        <p className="text-brand-muted text-sm mt-0.5">{t('plans.subtitle')}</p>
      </div>

      <div className="space-y-3 animate-fade-in-up delay-75">
        {plans.map(p => {
          const isActive = p.id === activePlan?.id
          const totalBudget = p.categories.reduce((s, c) => s + c.monthlyLimit, 0)
          const totalSpent = p.categories.reduce((s, c) => s + c.spent, 0)
          const memberCount = p.members.filter(m => !m.userId.startsWith('pending|')).length
          const isAdmin = p.createdBy === user?.id
          const isConfirming = confirmDeleteId === p.id
          const isDeleting = isDeletingId === p.id
          const isEditingSettings = editingPlanId === p.id

          return (
            <div key={p.id}>
              <div
                className={`rounded-2xl border transition-all ${
                  isActive ? 'border-brand-blue bg-sky-50 shadow-sm' : 'border-brand-border bg-white'
                }`}
              >
                {/* Main card row */}
                <button
                  onClick={() => { switchPlan(p.id); navigate('/') }}
                  className="w-full text-left p-4 rounded-2xl hover:bg-opacity-80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <LayoutGrid size={16} className={isActive ? 'text-brand-blue' : 'text-brand-muted'} />
                        <span className="text-brand-navy font-semibold truncate">{p.name}</span>
                        {isAdmin && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-sky-100 text-brand-blue flex-shrink-0">
                            {t('common.admin')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-brand-muted">
                        <span className="flex items-center gap-1">
                          <Users size={11} />
                          {memberCount} {memberCount !== 1 ? t('plans.members_other', { count: memberCount }).replace(/^\d+ /, '') : t('plans.members', { count: memberCount }).replace(/^\d+ /, '')}
                        </span>
                        <span>{formatAmount(totalSpent, p.currency)} / {formatAmount(totalBudget, p.currency)}</span>
                      </div>
                    </div>
                    {isActive && <CheckCircle2 size={20} className="text-brand-blue flex-shrink-0 mt-0.5" />}
                  </div>
                </button>

                {/* Admin action row */}
                {isAdmin && !isConfirming && !isEditingSettings && (
                  <div className="border-t border-brand-border/60 px-4 py-2 flex justify-between items-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); openSettings(p.id, p.name) }}
                      className="flex items-center gap-1 text-brand-muted hover:text-brand-navy text-xs transition-colors py-1"
                    >
                      <Settings2 size={12} />
                      {t('plans.editPlan')}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(p.id) }}
                      className="flex items-center gap-1 text-brand-muted hover:text-brand-danger text-xs transition-colors py-1"
                    >
                      <Trash2 size={12} />
                      {t('plans.deletePlan')}
                    </button>
                  </div>
                )}

                {/* Plan settings panel */}
                {isEditingSettings && (
                  <div className="border-t border-brand-border/60 px-4 py-4 space-y-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-brand-navy text-sm font-semibold">{t('plans.editPlan')}</h3>
                      <button onClick={closeSettings} className="text-brand-muted hover:text-brand-navy transition-colors p-1">
                        <X size={14} />
                      </button>
                    </div>

                    {/* Plan name */}
                    <div>
                      <label className="text-brand-navy text-xs font-semibold block mb-1">{t('plans.planName')}</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          placeholder={t('plans.planNamePlaceholder')}
                          className="flex-1 bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-brand-navy text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                        />
                        <button
                          onClick={() => savePlanName(p.id)}
                          disabled={isSavingSettings || !editName.trim()}
                          className="px-3 py-2 bg-brand-blue text-white rounded-xl text-xs font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                          {isSavingSettings ? t('common.saving') : t('common.save')}
                        </button>
                      </div>
                    </div>

                    {/* Currency */}
                    <div>
                      <label className="text-brand-navy text-xs font-semibold block mb-2">{t('plans.currency')}</label>
                      <div className="flex flex-wrap gap-2">
                        {CURRENCIES.map(c => (
                          <button
                            key={c.code}
                            onClick={() => changeCurrency(p.id, c.code)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                              c.code === p.currency.code
                                ? 'border-brand-blue bg-sky-50 text-brand-blue shadow-sm'
                                : 'border-brand-border text-brand-muted hover:border-brand-blue/40'
                            }`}
                          >
                            {c.symbol} {c.code}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirm delete */}
                {isConfirming && (
                  <div className="border-t border-rose-200 bg-rose-50 rounded-b-2xl px-4 py-3 flex items-center justify-between gap-3">
                    <p className="text-brand-danger text-xs font-medium">
                      {t('plans.confirmDelete', { name: p.name })}
                    </p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={isDeleting}
                        className="px-3 py-1.5 bg-brand-danger text-white rounded-xl text-xs font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
                      >
                        {isDeleting ? t('common.deleting') : t('common.delete')}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        disabled={isDeleting}
                        className="p-1.5 text-brand-muted hover:text-brand-navy transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Button
        variant="dashed"
        onClick={() => navigate('/onboarding')}
        className="w-full animate-fade-in-up delay-100"
      >
        <PlusCircle size={16} strokeWidth={2} />
        {t('plans.createNew')}
      </Button>
    </div>
  )
}
