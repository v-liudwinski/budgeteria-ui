import { useState } from 'react'
import type { PlanCategory } from '../../api/types'
import { defaultCategories, type CategoryPreset } from '../../utils/categories'
import { CategoryChip } from '../../components/CategoryChip'
import { Button } from '../../components/Button'

type Props = {
  categories: PlanCategory[]
  setCategories: (v: PlanCategory[]) => void
  onNext: () => void
  onBack: () => void
}

function presetToCategory(p: CategoryPreset): PlanCategory {
  return {
    id: p.id,
    name: p.name,
    emoji: p.emoji,
    color: p.color,
    monthlyLimit: 0,
    spent: 0,
    isEssential: p.isEssential,
  }
}

export function StepCategories({ categories, setCategories, onNext, onBack }: Props) {
  const [customName, setCustomName] = useState('')
  const [customEmoji, setCustomEmoji] = useState('📌')

  const selectedIds = new Set(categories.map(c => c.id))

  function toggle(preset: CategoryPreset) {
    if (selectedIds.has(preset.id)) {
      setCategories(categories.filter(c => c.id !== preset.id))
    } else {
      setCategories([...categories, presetToCategory(preset)])
    }
  }

  function addCustom() {
    if (!customName.trim()) return
    const id = `custom-${Date.now()}`
    setCategories([...categories, {
      id,
      name: customName.trim(),
      emoji: customEmoji,
      color: 'slate',
      monthlyLimit: 0,
      spent: 0,
      isEssential: false,
    }])
    setCustomName('')
    setCustomEmoji('📌')
  }

  const canProceed = categories.length >= 3

  const essentials = defaultCategories.filter(c => c.isEssential)
  const lifestyle = defaultCategories.filter(c => !c.isEssential)

  return (
    <div>
      <div className="text-4xl mb-3">📋</div>
      <h2 className="text-xl font-bold text-brand-navy mb-1">Choose your categories</h2>
      <p className="text-brand-muted text-sm mb-6">
        Pick at least 3. You can always add or remove later.
      </p>

      {/* Essential */}
      <div className="mb-4">
        <h3 className="text-brand-navy text-xs font-semibold uppercase tracking-wide mb-2">Essential</h3>
        <div className="flex flex-wrap gap-2">
          {essentials.map(p => (
            <CategoryChip
              key={p.id}
              label={p.name}
              emoji={p.emoji}
              selected={selectedIds.has(p.id)}
              onClick={() => toggle(p)}
              variant="blue"
            />
          ))}
        </div>
      </div>

      {/* Lifestyle */}
      <div className="mb-4">
        <h3 className="text-brand-navy text-xs font-semibold uppercase tracking-wide mb-2">Lifestyle & Savings</h3>
        <div className="flex flex-wrap gap-2">
          {lifestyle.map(p => (
            <CategoryChip
              key={p.id}
              label={p.name}
              emoji={p.emoji}
              selected={selectedIds.has(p.id)}
              onClick={() => toggle(p)}
              variant="pink"
            />
          ))}
        </div>
      </div>

      {/* Custom */}
      <div className="bg-brand-bg border border-brand-border rounded-xl p-3">
        <h3 className="text-brand-navy text-xs font-semibold uppercase tracking-wide mb-2">Add Custom</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={customEmoji}
            onChange={e => setCustomEmoji(e.target.value)}
            className="w-12 bg-white border border-brand-border rounded-lg px-2 py-2 text-center text-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            maxLength={2}
          />
          <input
            type="text"
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            placeholder="Category name"
            className="flex-1 bg-white border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/40 placeholder:text-brand-muted/60"
            onKeyDown={e => e.key === 'Enter' && addCustom()}
          />
          <button
            onClick={addCustom}
            disabled={!customName.trim()}
            className="px-3 py-2 bg-brand-blue text-white rounded-lg text-sm font-semibold disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </div>

      <p className="text-brand-muted text-xs mt-3">{categories.length} selected (min 3)</p>

      <div className="flex gap-3 mt-6">
        <Button variant="secondary" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed} className="flex-[2]">
          Continue
        </Button>
      </div>
    </div>
  )
}
