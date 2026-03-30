import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AnimalGuide } from './AnimalGuide'
import type { Category } from '../context/types'

const foodCategory: Category = {
  id: 'food',
  name: 'Food & Groceries',
  animal: '🐿️',
  color: 'emerald',
  limit: 600,
  spent: 320,
}

const usd = { code: 'USD', symbol: '$', locale: 'en-US' }

describe('AnimalGuide', () => {
  it('renders animal, name, and spent/limit', () => {
    render(<AnimalGuide category={foodCategory} currency={usd} />)
    expect(screen.getByText('🐿️')).toBeInTheDocument()
    expect(screen.getByText('Food & Groceries')).toBeInTheDocument()
    expect(screen.getByText('$320.00 / $600.00')).toBeInTheDocument()
  })

  it('shows warning state when over 75% spent', () => {
    const nearLimit = { ...foodCategory, spent: 500 }
    render(<AnimalGuide category={nearLimit} currency={usd} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '83')
  })

  it('shows danger state when over 95% spent', () => {
    const overLimit = { ...foodCategory, spent: 570 }  // 570/600 = 95%
    render(<AnimalGuide category={overLimit} currency={usd} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '95')
  })
})
