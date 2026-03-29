import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BudgetProvider, useBudget } from './BudgetContext'

function TestConsumer() {
  const { state, dispatch } = useBudget()
  return (
    <div>
      <span data-testid="name">{state.user.name}</span>
      <span data-testid="currency">{state.user.currency.code}</span>
      <button
        onClick={() => dispatch({ type: 'SET_CURRENCY', payload: { code: 'EUR', symbol: '€', locale: 'de-DE' } })}
      >
        Switch to EUR
      </button>
    </div>
  )
}

describe('BudgetContext', () => {
  it('provides initial state', () => {
    render(<BudgetProvider><TestConsumer /></BudgetProvider>)
    expect(screen.getByTestId('name')).toHaveTextContent('Senior')
    expect(screen.getByTestId('currency')).toHaveTextContent('USD')
  })

  it('dispatches actions and updates state', async () => {
    const user = userEvent.setup()
    render(<BudgetProvider><TestConsumer /></BudgetProvider>)
    await user.click(screen.getByText('Switch to EUR'))
    expect(screen.getByTestId('currency')).toHaveTextContent('EUR')
  })
})
