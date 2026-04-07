import { describe, it, expect, vi, afterEach } from 'vitest'
import { getGreeting, formatDisplayDate, toMonthKey } from './dateHelpers'

describe('getGreeting', () => {
  afterEach(() => vi.useRealTimers())

  it('returns morning for 9am', () => {
    vi.setSystemTime(new Date('2026-03-29T09:00:00'))
    expect(getGreeting()).toBe('morning')
  })

  it('returns afternoon for 2pm', () => {
    vi.setSystemTime(new Date('2026-03-29T14:00:00'))
    expect(getGreeting()).toBe('afternoon')
  })

  it('returns evening for 7pm', () => {
    vi.setSystemTime(new Date('2026-03-29T19:00:00'))
    expect(getGreeting()).toBe('evening')
  })
})

describe('formatDisplayDate', () => {
  it('formats ISO date to readable string', () => {
    expect(formatDisplayDate('2026-03-29')).toBe('Mar 29')
  })
})

describe('toMonthKey', () => {
  it('converts date to YYYY-MM', () => {
    expect(toMonthKey(new Date('2026-03-29'))).toBe('2026-03')
  })
})
