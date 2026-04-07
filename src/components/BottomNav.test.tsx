import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { BottomNav } from './BottomNav'

function Wrapper({ initialPath = '/' }) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="*" element={<BottomNav />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('BottomNav', () => {
  it('renders 4+ nav items', () => {
    render(<Wrapper />)
    expect(screen.getAllByRole('link').length).toBeGreaterThanOrEqual(4)
  })

  it('highlights Home when on /', () => {
    render(<Wrapper initialPath="/" />)
    const homeLink = screen.getByLabelText('Home')
    expect(homeLink).toHaveClass('text-brand-blue')
  })
})
