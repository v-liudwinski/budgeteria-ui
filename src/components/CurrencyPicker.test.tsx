import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CurrencyPicker } from './CurrencyPicker'

const usd = { code: 'USD', symbol: '$', locale: 'en-US' }

describe('CurrencyPicker', () => {
  it('renders list of currencies', () => {
    render(<CurrencyPicker current={usd} onSelect={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('EUR')).toBeInTheDocument()
    expect(screen.getByText('GBP')).toBeInTheDocument()
    expect(screen.getByText('UAH')).toBeInTheDocument()
  })

  it('calls onSelect with chosen currency', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<CurrencyPicker current={usd} onSelect={onSelect} onClose={vi.fn()} />)
    await user.click(screen.getByText('EUR'))
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'EUR' })
    )
  })

  it('calls onClose when backdrop clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<CurrencyPicker current={usd} onSelect={vi.fn()} onClose={onClose} />)
    await user.click(screen.getByTestId('backdrop'))
    expect(onClose).toHaveBeenCalled()
  })
})
