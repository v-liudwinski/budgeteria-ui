import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { planApi } from '../api/planApi'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { useToast } from '../components/Toast'
import { Plus, Pencil, Trash2, Check, X, ShieldCheck } from 'lucide-react'
import type { PlanCategory } from '../api/types'
import { useTranslation } from 'react-i18next'

const EMOJI_OPTIONS = ['🏠','🍔','🚗','🏥','📱','🎬','👕','✈️','💪','📚','🐾','🛒','💡','🎁','💊','🍷','☕','🎮','🌿','💰']

function newCategory(): Omit<PlanCategory, 'id' | 'spent'> {
  return { name: '', emoji: '💰', color: '#38bdf8', monthlyLimit: 0, isEssential: false }
}

export function CategoriesScreen() {
  const { plan, upsertPlan } = useApp()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Editing form state
  const [formName, setFormName] = useState('')
  const [formEmoji, setFormEmoji] = useState('💰')
  const [formLimit, setFormLimit] = useState('')
  const [formEssential, setFormEssential] = useState(false)

  if (!plan) return null
  const { categories, currency } = plan

  function openEdit(cat: PlanCategory) {
    setEditingId(cat.id)
    setFormName(cat.name)
    setFormEmoji(cat.emoji)
    setFormLimit(String(cat.monthlyLimit))
    setFormEssential(cat.isEssential)
    setShowAdd(false)
  }

  function openAdd() {
    setEditingId(null)
    const d = newCategory()
    setFormName(d.name)
    setFormEmoji(d.emoji)
    setFormLimit('')
    setFormEssential(d.isEssential)
    setShowAdd(true)
  }

  function cancelForm() {
    setEditingId(null)
    setShowAdd(false)
  }

  async function saveEdit() {
    if (!formName.trim()) return
    const limit = parseFloat(formLimit) || 0
    const updated = {
      ...plan!,
      categories: plan!.categories.map(c =>
        c.id === editingId
          ? { ...c, name: formName.trim(), emoji: formEmoji, monthlyLimit: limit, isEssential: formEssential }
          : c
      ),
    }
    await persist(updated)
    setEditingId(null)
  }

  async function saveAdd() {
    if (!formName.trim()) return
    const limit = parseFloat(formLimit) || 0
    const newCat: PlanCategory = {
      id: `cat-${Date.now()}`,
      name: formName.trim(),
      emoji: formEmoji,
      color: '#38bdf8',
      monthlyLimit: limit,
      isEssential: formEssential,
      spent: 0,
    }
    const updated = { ...plan!, categories: [...plan!.categories, newCat] }
    await persist(updated)
    setShowAdd(false)
  }

  async function deleteCategory(id: string) {
    const updated = { ...plan!, categories: plan!.categories.filter(c => c.id !== id) }
    await persist(updated)
    if (editingId === id) setEditingId(null)
  }

  async function persist(updated: typeof plan) {
    setIsSaving(true)
    upsertPlan(updated!)
    try {
      await planApi.updatePlan(updated!.id, { categories: updated!.categories })
      toast(t('categories.saved'))
    } catch {
      toast(t('categories.saveFailed'), 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const FormRow = ({ onSave }: { onSave: () => void }) => (
    <div className="p-4 space-y-3 bg-brand-bg/60 border-t border-brand-border">
      {/* Emoji picker */}
      <div className="flex flex-wrap gap-1.5">
        {EMOJI_OPTIONS.map(e => (
          <button
            key={e}
            onClick={() => setFormEmoji(e)}
            className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all ${
              formEmoji === e ? 'bg-brand-blue/20 ring-2 ring-brand-blue/50 scale-110' : 'hover:bg-brand-bg'
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-brand-muted text-[10px] font-semibold uppercase tracking-wide block mb-1">{t('categories.newCategory')}</label>
          <input
            type="text"
            value={formName}
            onChange={e => setFormName(e.target.value)}
            placeholder={t('categories.namePlaceholder')}
            autoFocus
            className="w-full bg-white border border-brand-border rounded-xl px-3 py-2 text-brand-navy text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 placeholder:text-brand-muted/50"
          />
        </div>
        <div>
          <label className="text-brand-muted text-[10px] font-semibold uppercase tracking-wide block mb-1">{t('categories.monthlyLimit')} ({currency.symbol})</label>
          <input
            type="number"
            value={formLimit}
            onChange={e => setFormLimit(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full bg-white border border-brand-border rounded-xl px-3 py-2 text-brand-navy text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 placeholder:text-brand-muted/50"
          />
        </div>
      </div>

      <button
        onClick={() => setFormEssential(v => !v)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
          formEssential
            ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
            : 'border-brand-border text-brand-muted hover:border-emerald-400/50'
        }`}
      >
        <ShieldCheck size={14} />
        {t('categories.essential')}
      </button>

      <div className="flex gap-2">
        <Button size="sm" onClick={onSave} disabled={!formName.trim() || isSaving} className="flex-1">
          <Check size={14} />
          {t('common.save')}
        </Button>
        <Button size="sm" variant="secondary" onClick={cancelForm} className="flex-1">
          <X size={14} />
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">{t('categories.title')}</h1>
          <p className="text-brand-muted text-sm mt-0.5">{t('categories.subtitle', { count: categories.length, plan: plan.name })}</p>
        </div>
        {!showAdd && (
          <Button size="sm" onClick={openAdd}>
            <Plus size={16} strokeWidth={2.2} />
            {t('categories.add')}
          </Button>
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <Card className="overflow-hidden animate-fade-in-up">
          <div className="px-4 pt-4 pb-1 flex items-center gap-2">
            <span className="text-xl">{formEmoji}</span>
            <span className="text-brand-navy font-semibold text-sm">{t('categories.newCategory')}</span>
          </div>
          <FormRow onSave={saveAdd} />
        </Card>
      )}

      {/* Category list */}
      <Card className="overflow-hidden divide-y divide-brand-border animate-fade-in-up delay-75">
        {categories.length === 0 && (
          <div className="p-8 text-center text-brand-muted text-sm">
            {t('categories.noCategories')}
          </div>
        )}
        {categories.map(cat => {
          const pct = cat.monthlyLimit > 0 ? Math.min(100, Math.round((cat.spent / cat.monthlyLimit) * 100)) : 0
          const isEditing = editingId === cat.id

          return (
            <div key={cat.id}>
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-xl flex-shrink-0">{cat.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-brand-navy text-sm font-medium truncate">{cat.name}</p>
                    {cat.isEssential && (
                      <ShieldCheck size={12} className="text-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-brand-muted text-xs">
                      {currency.symbol}{cat.spent.toLocaleString()} / {currency.symbol}{cat.monthlyLimit.toLocaleString()}
                    </p>
                    {cat.monthlyLimit > 0 && (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                        pct > 100 ? 'bg-red-50 text-brand-danger' :
                        pct >= 85 ? 'bg-amber-50 text-amber-700' :
                        'bg-sky-50 text-brand-blue'
                      }`}>
                        {pct}%
                      </span>
                    )}
                  </div>
                  {cat.monthlyLimit > 0 && (
                    <div className="h-1 bg-brand-border rounded-full overflow-hidden mt-1.5">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${pct > 100 ? 'bg-brand-danger' : pct >= 85 ? 'bg-amber-400' : 'bg-brand-blue'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => isEditing ? cancelForm() : openEdit(cat)}
                    className="text-brand-muted hover:text-brand-blue transition-colors p-1.5 rounded-lg hover:bg-brand-bg"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="text-brand-muted hover:text-brand-danger transition-colors p-1.5 rounded-lg hover:bg-brand-bg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {isEditing && <FormRow onSave={saveEdit} />}
            </div>
          )
        })}
      </Card>
    </div>
  )
}
