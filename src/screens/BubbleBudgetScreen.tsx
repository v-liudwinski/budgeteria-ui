import { useState, useMemo, useRef, useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatAmount } from '../utils/formatAmount'
import type { PlanCategory } from '../api/types'
import { X, Settings2 } from 'lucide-react'

// ── Sizing ──────────────────────────────────────────────────────
const MIN_D = 56
const MAX_D_MOBILE = 128
const MAX_D_DESKTOP = 156

function getBubbleDiameter(spent: number, maxSpent: number, isMobile: boolean): number {
  const maxD = isMobile ? MAX_D_MOBILE : MAX_D_DESKTOP
  if (maxSpent === 0) return MIN_D
  const ratio = Math.sqrt(spent / maxSpent)
  return Math.round(MIN_D + ratio * (maxD - MIN_D))
}

// ── Colors ──────────────────────────────────────────────────────
type BubbleTheme = { bg: string; glow: string; bar: string }

function getBubbleTheme(pct: number): BubbleTheme {
  if (pct > 100) return {
    bg: 'radial-gradient(circle at 32% 28%, #fda4af 0%, #f43f5e 60%, #be123c 100%)',
    glow: 'rgba(244,63,94,0.4)',
    bar: 'bg-rose-500',
  }
  if (pct >= 80) return {
    bg: 'radial-gradient(circle at 32% 28%, #fde68a 0%, #f59e0b 60%, #b45309 100%)',
    glow: 'rgba(245,158,11,0.35)',
    bar: 'bg-amber-400',
  }
  return {
    bg: 'radial-gradient(circle at 32% 28%, #bae6fd 0%, #38bdf8 60%, #0284c7 100%)',
    glow: 'rgba(56,189,248,0.35)',
    bar: 'bg-sky-400',
  }
}

// ── Circle-packing layout ───────────────────────────────────────
type Placed = { x: number; y: number; r: number }

function packCircles(radii: number[], containerW: number, containerH: number): { x: number; y: number }[] {
  const cx = containerW / 2, cy = containerH / 2
  const placed: Placed[] = []
  const padding = 8
  const indices = radii.map((_, i) => i).sort((a, b) => radii[b] - radii[a])
  const result: { x: number; y: number }[] = new Array(radii.length)

  for (const idx of indices) {
    const r = radii[idx]
    let bestX = cx, bestY = cy, bestDist = Infinity

    if (placed.length === 0) {
      bestX = cx; bestY = cy
    } else {
      let found = false
      for (let dist = 0; dist < Math.max(containerW, containerH) && !found; dist += 4) {
        const steps = Math.max(8, Math.round((dist * Math.PI * 2) / 12))
        for (let s = 0; s < steps; s++) {
          const angle = (s / steps) * Math.PI * 2
          const tx = cx + Math.cos(angle) * dist
          const ty = cy + Math.sin(angle) * dist
          if (tx - r < 4 || tx + r > containerW - 4 || ty - r < 4 || ty + r > containerH - 4) continue
          let overlaps = false
          for (const p of placed) {
            const dx = tx - p.x, dy = ty - p.y
            if (dx * dx + dy * dy < (r + p.r + padding) ** 2) { overlaps = true; break }
          }
          if (!overlaps) {
            const d = Math.sqrt((tx - cx) ** 2 + (ty - cy) ** 2)
            if (d < bestDist) { bestDist = d; bestX = tx; bestY = ty; found = true }
          }
        }
      }
    }
    placed.push({ x: bestX, y: bestY, r })
    result[idx] = { x: bestX, y: bestY }
  }
  return result
}

// ── Component ───────────────────────────────────────────────────
export function BubbleBudgetScreen() {
  const { plan } = useApp()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<PlanCategory | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 })

  useLayoutEffect(() => {
    function measure() {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setContainerSize({ w: rect.width, h: rect.height })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const isMobile = containerSize.w > 0 && containerSize.w < 640

  const bubbleData = useMemo(() => {
    if (!plan || containerSize.w === 0) return []
    const cats = plan.categories
    const maxSpent = Math.max(...cats.map(c => Math.max(c.spent, c.monthlyLimit * 0.1)), 1)

    const items = cats.map(cat => {
      const displayValue = Math.max(cat.spent, cat.monthlyLimit * 0.15, 1)
      const d = getBubbleDiameter(displayValue, maxSpent, isMobile)
      const pct = cat.monthlyLimit > 0 ? Math.min(150, Math.round((cat.spent / cat.monthlyLimit) * 100)) : 0
      return { cat, d, pct }
    })

    const radii = items.map(b => b.d / 2)
    const positions = packCircles(radii, containerSize.w, containerSize.h)
    return items.map((b, i) => ({ ...b, x: positions[i].x, y: positions[i].y }))
  }, [plan, containerSize, isMobile])

  if (!plan) return null
  const { categories, currency } = plan

  const totalBudget = categories.reduce((s, c) => s + c.monthlyLimit, 0)
  const totalSpent = categories.reduce((s, c) => s + c.spent, 0)
  const overCount = categories.filter(c => c.monthlyLimit > 0 && c.spent > c.monthlyLimit).length
  const pctUsed = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0

  const selPct = selected
    ? (selected.monthlyLimit > 0 ? Math.min(150, Math.round((selected.spent / selected.monthlyLimit) * 100)) : 0)
    : 0
  const selTheme = getBubbleTheme(selPct)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col" style={{ minHeight: 'calc(100vh - 5rem)' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Bubble Budget</h1>
          <p className="text-brand-muted text-sm mt-0.5">{plan.name}</p>
        </div>
        <button
          onClick={() => navigate('/categories')}
          className="flex items-center gap-1.5 text-brand-muted hover:text-brand-blue text-xs font-medium transition-colors px-3 py-2 rounded-xl hover:bg-white border border-brand-border"
        >
          <Settings2 size={14} />
          Edit limits
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4 animate-fade-in-up delay-75">
        <div className="bg-white border border-brand-border rounded-2xl p-3 text-center shadow-sm">
          <p className="text-brand-muted text-[10px] uppercase tracking-wide mb-0.5">Spent</p>
          <p className="text-brand-navy font-bold text-sm tabular-nums">{formatAmount(Math.round(totalSpent), currency)}</p>
        </div>
        <div className="bg-white border border-brand-border rounded-2xl p-3 text-center shadow-sm">
          <p className="text-brand-muted text-[10px] uppercase tracking-wide mb-0.5">Budget</p>
          <p className="text-brand-navy font-bold text-sm tabular-nums">{formatAmount(Math.round(totalBudget), currency)}</p>
        </div>
        <div className={`border rounded-2xl p-3 text-center shadow-sm ${overCount > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
          <p className={`text-[10px] uppercase tracking-wide mb-0.5 ${overCount > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>Over limit</p>
          <p className={`font-bold text-sm ${overCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {overCount > 0 ? `${overCount} categor${overCount === 1 ? 'y' : 'ies'}` : 'None ✓'}
          </p>
        </div>
      </div>

      {/* Overall progress */}
      <div className="mb-4 animate-fade-in-up delay-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-brand-muted text-xs">Overall budget usage</span>
          <span className={`text-xs font-bold ${pctUsed > 100 ? 'text-brand-danger' : pctUsed >= 80 ? 'text-amber-600' : 'text-brand-blue'}`}>{pctUsed}%</span>
        </div>
        <div className="h-2.5 bg-brand-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${pctUsed > 100 ? 'bg-brand-danger' : pctUsed >= 80 ? 'bg-amber-400' : 'bg-brand-blue'}`}
            style={{ width: `${Math.min(100, pctUsed)}%` }}
          />
        </div>
      </div>

      {/* Bubble field */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-[320px] sm:min-h-[400px] rounded-3xl overflow-hidden animate-fade-in-up delay-150"
        style={{
          background: 'radial-gradient(ellipse at 30% 30%, #e0f2fe 0%, #f0f9ff 40%, #fdf4ff 70%, #fff1f2 100%)',
          border: '1px solid rgba(186,230,253,0.6)',
        }}
      >
        {/* Ambient glows */}
        <div className="absolute top-4 left-8 w-28 h-28 bg-sky-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-8 right-6 w-36 h-36 bg-pink-300/15 rounded-full blur-3xl pointer-events-none" />

        {/* Legend */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
          {[
            { color: 'bg-sky-400', label: 'On track' },
            { color: 'bg-amber-400', label: 'Near limit' },
            { color: 'bg-rose-500', label: 'Over budget' },
          ].map(({ color, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5 text-[10px] text-brand-muted bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/60">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              {label}
            </span>
          ))}
        </div>

        {bubbleData.map(({ cat, d, pct, x, y }, i) => {
          const theme = getBubbleTheme(pct)
          const showLabel = d >= 76
          const showPct = d >= 60

          return (
            <button
              key={cat.id}
              onClick={() => setSelected(cat)}
              className="absolute group"
              style={{
                width: d, height: d,
                left: x - d / 2, top: y - d / 2,
                opacity: 0,
                animation: `bubble-appear 0.45s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.055}s forwards`,
              }}
              aria-label={`${cat.name}: ${formatAmount(cat.spent, currency)}`}
            >
              <div className="absolute -inset-2 rounded-full blur-lg opacity-50 transition-opacity group-hover:opacity-80 pointer-events-none"
                style={{ background: theme.glow }} />
              <div
                className="relative w-full h-full rounded-full flex flex-col items-center justify-center select-none transition-transform duration-200 group-hover:scale-110 group-active:scale-95"
                style={{
                  background: theme.bg,
                  boxShadow: `0 6px 24px ${theme.glow}, inset 0 -6px 16px rgba(0,0,0,0.1), inset 0 2px 6px rgba(255,255,255,0.3)`,
                }}
              >
                <div className="absolute rounded-full pointer-events-none"
                  style={{
                    width: d * 0.38, height: d * 0.22,
                    top: d * 0.1, left: d * 0.16,
                    background: 'radial-gradient(ellipse, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%)',
                  }} />
                <span style={{ fontSize: d > 100 ? '1.8rem' : d > 72 ? '1.3rem' : '1rem', lineHeight: 1 }}>{cat.emoji}</span>
                {showLabel && (
                  <span className="text-white/90 font-semibold mt-0.5 px-1 truncate max-w-[88%] text-center leading-tight"
                    style={{ fontSize: d > 110 ? '0.75rem' : '0.65rem' }}>
                    {cat.name}
                  </span>
                )}
                {showPct && pct > 0 && (
                  <span className="text-white/75 font-medium" style={{ fontSize: '0.6rem' }}>{pct}%</span>
                )}
              </div>
            </button>
          )
        })}

        {categories.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-brand-muted">
            <span className="text-4xl">💰</span>
            <p className="text-sm font-medium">No categories yet</p>
            <button onClick={() => navigate('/categories')} className="text-brand-blue text-xs hover:underline">Add categories</button>
          </div>
        )}

        <p className="absolute bottom-3 left-0 right-0 text-center text-brand-muted/60 text-[10px] pointer-events-none select-none">
          Tap a bubble to see details · Size = spending amount
        </p>
      </div>

      {/* Detail sheet */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-white border border-brand-border rounded-t-3xl md:rounded-3xl w-full md:max-w-md shadow-2xl z-10 animate-slide-up">
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 bg-brand-border rounded-full" />
            </div>

            <div className="px-6 pb-6 pt-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                  style={{ background: selTheme.bg }}>
                  <span className="text-2xl">{selected.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-brand-navy font-bold text-xl truncate">{selected.name}</h3>
                  <p className={`text-sm font-semibold mt-0.5 ${selPct > 100 ? 'text-brand-danger' : selPct >= 80 ? 'text-amber-600' : 'text-brand-blue'}`}>
                    {selPct > 100 ? `${selPct - 100}% over budget` : selPct >= 80 ? `${selPct}% — near limit` : selPct > 0 ? `${selPct}% used` : 'No spending yet'}
                  </p>
                </div>
                <button onClick={() => setSelected(null)} className="text-brand-muted hover:text-brand-navy p-2 rounded-xl hover:bg-brand-bg">
                  <X size={18} />
                </button>
              </div>

              {selected.monthlyLimit > 0 && (
                <div className="h-3 bg-brand-border rounded-full overflow-hidden mb-4">
                  <div className={`h-full rounded-full transition-all duration-700 ${selTheme.bar}`}
                    style={{ width: `${Math.min(100, selPct)}%` }} />
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Spent', value: formatAmount(selected.spent, currency), color: selected.spent > 0 ? 'text-brand-danger' : 'text-brand-muted' },
                  { label: 'Budget', value: formatAmount(selected.monthlyLimit, currency), color: 'text-brand-navy' },
                  { label: 'Remaining', value: formatAmount(Math.max(0, selected.monthlyLimit - selected.spent), currency), color: 'text-brand-success' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-brand-bg rounded-2xl p-3 text-center">
                    <p className="text-brand-muted text-[10px] uppercase tracking-wide mb-1">{label}</p>
                    <p className={`font-bold text-sm tabular-nums ${color}`}>{value}</p>
                  </div>
                ))}
              </div>

              {selected.isEssential && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mb-4 text-xs text-emerald-700">
                  Essential category — not projected as daily spending
                </div>
              )}

              <button
                onClick={() => { setSelected(null); navigate('/categories') }}
                className="w-full text-brand-blue text-sm font-semibold hover:underline py-1"
              >
                Edit this category →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
