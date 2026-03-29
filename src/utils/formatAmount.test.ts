import { describe, it, expect } from 'vitest'
import { formatAmount } from './formatAmount'

const usd = { code: 'USD', symbol: '$', locale: 'en-US' }
const eur = { code: 'EUR', symbol: '€', locale: 'de-DE' }
const uah = { code: 'UAH', symbol: '₴', locale: 'uk-UA' }

describe('formatAmount', () => {
  it('formats USD correctly', () => {
    expect(formatAmount(1234.5, usd)).toBe('$1,234.50')
  })

  it('formats EUR with locale', () => {
    const result = formatAmount(1234.5, eur)
    expect(result).toContain('1.234,50')
    expect(result).toContain('€')
  })

  it('formats UAH correctly', () => {
    const result = formatAmount(4850, uah)
    expect(result).toContain('4')
    expect(result).toContain('850')
  })

  it('formats zero', () => {
    expect(formatAmount(0, usd)).toBe('$0.00')
  })
})
