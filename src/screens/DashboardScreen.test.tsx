import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BudgetProvider } from '../context/BudgetContext'
import { DashboardScreen } from './DashboardScreen'

function Wrapper() {
  return (
    <BudgetProvider>
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>
    </BudgetProvider>
  )
}

describe('DashboardScreen', () => {
  it('renders greeting and user name', () => {
    render(<Wrapper />)
    expect(screen.getByText(/senior/i)).toBeInTheDocument()
  })

  it('renders total spent progress bars', () => {
    render(<Wrapper />)
    expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(0)
  })

  it('shows multiple progress bars for categories', () => {
    render(<Wrapper />)
    expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(3)
  })

  it('shows recent expenses', () => {
    render(<Wrapper />)
    expect(screen.getByText('Grocery run')).toBeInTheDocument()
  })
})
