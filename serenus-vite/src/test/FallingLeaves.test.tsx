import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import FallingLeaves from '../components/FallingLeaves'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, style, ...props }: any) => (
      <div 
        className={className} 
        style={style} 
        data-testid="falling-leaf"
        {...props}
      >
        {children}
      </div>
    )
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>
}))

describe('FallingLeaves', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('renders nothing when isActive is false', () => {
    render(<FallingLeaves isActive={false} />)
    expect(screen.queryByTestId('falling-leaf')).not.toBeInTheDocument()
  })

  it('renders leaves when isActive is true', () => {
    render(<FallingLeaves isActive={true} />)
    const leaves = screen.queryAllByTestId('falling-leaf')
    expect(leaves.length).toBeGreaterThan(0)
  })

  it('creates initial leaves with correct emojis', () => {
    render(<FallingLeaves isActive={true} />)
    const leaves = screen.getAllByTestId('falling-leaf')
    
    // Verificar que pelo menos uma folha tem emoji válido
    const leafEmojis = ['🍃', '🌿', '🍂', '🌱']
    const hasValidEmoji = leaves.some(leaf => 
      leafEmojis.includes(leaf.textContent || '')
    )
    expect(hasValidEmoji).toBe(true)
  })

  it('applies correct CSS classes to leaves', () => {
    render(<FallingLeaves isActive={true} />)
    const leaves = screen.getAllByTestId('falling-leaf')
    
    leaves.forEach(leaf => {
      expect(leaf).toHaveClass('absolute')
      expect(leaf).toHaveClass('text-green-600')
    })
  })

  it('sets up interval when active', () => {
    const setIntervalSpy = vi.spyOn(global, 'setInterval')
    render(<FallingLeaves isActive={true} />)
    
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 600)
  })

  it('cleans up interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
    
    const { unmount } = render(<FallingLeaves isActive={true} />)
    unmount()
    
    expect(clearIntervalSpy).toHaveBeenCalled()
  })
})