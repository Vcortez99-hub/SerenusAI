import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EffectsToggle from '../components/EffectsToggle'
import { EffectsProvider } from '../contexts/EffectsContext'

// Mock do framer-motion para evitar problemas nos testes
vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, onClick, className, title, ...props }: any) => (
      <button onClick={onClick} className={className} title={title} {...props}>
        {children}
      </button>
    ),
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}))

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <EffectsProvider>
      {component}
    </EffectsProvider>
  )
}

describe('EffectsToggle', () => {
  it('renders without crashing', () => {
    renderWithProvider(<EffectsToggle />)
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('displays correct initial state (leaves effect disabled)', () => {
    renderWithProvider(<EffectsToggle />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title', 'Ativar efeito de folhas')
    expect(button).toHaveTextContent('🌿')
    expect(button).toHaveClass('bg-white', 'text-gray-600')
  })

  it('toggles leaves effect when clicked', () => {
    renderWithProvider(<EffectsToggle />)
    
    const button = screen.getByRole('button')
    
    // Estado inicial - desativado
    expect(button).toHaveAttribute('title', 'Ativar efeito de folhas')
    expect(button).toHaveTextContent('🌿')
    
    // Clicar para ativar
    fireEvent.click(button)
    
    // Estado ativado
    expect(button).toHaveAttribute('title', 'Desativar efeito de folhas')
    expect(button).toHaveTextContent('🍃')
    expect(button).toHaveClass('bg-green-500', 'text-white')
    
    // Clicar novamente para desativar
    fireEvent.click(button)
    
    // Volta ao estado inicial
    expect(button).toHaveAttribute('title', 'Ativar efeito de folhas')
    expect(button).toHaveTextContent('🌿')
    expect(button).toHaveClass('bg-white', 'text-gray-600')
  })

  it('has correct CSS classes for positioning and styling', () => {
    renderWithProvider(<EffectsToggle />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass(
      'fixed',
      'top-4',
      'right-4',
      'z-50',
      'p-3',
      'rounded-full',
      'shadow-lg'
    )
  })

  it('displays correct emoji and styles when effect is active', () => {
    renderWithProvider(<EffectsToggle />)
    
    const button = screen.getByRole('button')
    
    // Ativar o efeito
    fireEvent.click(button)
    
    // Verificar emoji e classes CSS
    expect(button).toHaveTextContent('🍃')
    expect(button).toHaveClass('bg-green-500', 'text-white')
    expect(button).not.toHaveClass('bg-white', 'text-gray-600')
  })

  it('has proper accessibility attributes', () => {
    renderWithProvider(<EffectsToggle />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title')
    
    // Verificar que o title muda conforme o estado
    expect(button).toHaveAttribute('title', 'Ativar efeito de folhas')
    
    fireEvent.click(button)
    expect(button).toHaveAttribute('title', 'Desativar efeito de folhas')
  })

  it('contains emoji within a div element', () => {
    renderWithProvider(<EffectsToggle />)
    
    const button = screen.getByRole('button')
    const emojiDiv = button.querySelector('div')
    
    expect(emojiDiv).toBeInTheDocument()
    expect(emojiDiv).toHaveClass('text-xl')
    expect(emojiDiv).toHaveTextContent('🌿')
  })
})