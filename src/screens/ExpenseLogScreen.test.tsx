import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { BudgetProvider } from '../context/BudgetContext'
import { ExpenseLogScreen } from './ExpenseLogScreen'

function Wrapper() {
  return (
    <BudgetProvider>
      <MemoryRouter>
        <ExpenseLogScreen />
      </MemoryRouter>
    </BudgetProvider>
  )
}

describe('ExpenseLogScreen', () => {
  it('renders the form', () => {
    render(<Wrapper />)
    expect(screen.getByRole('button', { name: /add expense/i })).toBeInTheDocument()
  })

  it('shows validation error if amount is empty', async () => {
    const user = userEvent.setup()
    render(<Wrapper />)
    await user.click(screen.getByRole('button', { name: /add expense/i }))
    expect(screen.getByText(/valid amount/i)).toBeInTheDocument()
  })

  it('logs a new expense and shows success message', async () => {
    const user = userEvent.setup()
    render(<Wrapper />)
    await user.clear(screen.getByPlaceholderText('0.00'))
    await user.type(screen.getByPlaceholderText('0.00'), '25')
    await user.type(screen.getByPlaceholderText('What did you spend on?'), 'Coffee')
    await user.click(screen.getByRole('button', { name: /add expense/i }))
    expect(screen.getByText(/expense logged/i)).toBeInTheDocument()
  })

  it('can delete an existing expense', async () => {
    const user = userEvent.setup()
    render(<Wrapper />)
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    expect(deleteButtons.length).toBeGreaterThan(0)
    const initialCount = deleteButtons.length
    await user.click(deleteButtons[0])
    expect(screen.getAllByRole('button', { name: /delete/i }).length).toBe(initialCount - 1)
  })
})
