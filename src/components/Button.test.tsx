import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button variant="primary">Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button variant="primary" onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByText('Click me'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button variant="primary" disabled onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button'))

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('does not call onClick when loading', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button variant="primary" loading onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button'))

    expect(handleClick).not.toHaveBeenCalled()
  })

  it.each(['default', 'primary', 'secondary', 'success', 'warning', 'danger'] as const)(
    'renders without error for variant "%s"',
    (variant) => {
      render(<Button variant={variant}>{variant}</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    }
  )

  it.each(['small', 'medium', 'large'] as const)(
    'renders without error for size "%s"',
    (size) => {
      render(<Button size={size}>Button</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    }
  )
})