import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from '../components/ErrorBoundary'

// Componente que sempre gera erro para testar o ErrorBoundary
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Erro de teste')
  }
  return <div>Componente funcionando</div>
}

// Mock do console.error para evitar logs durante os testes
const originalError = console.error
beforeAll(() => {
  console.error = vi.fn()
})

afterAll(() => {
  console.error = originalError
})

describe('ErrorBoundary', () => {
  it('renderiza children quando não há erro', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Componente funcionando')).toBeInTheDocument()
  })

  it('renderiza UI de erro quando há erro', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Oops! Algo deu errado')).toBeInTheDocument()
    expect(screen.getByText(/Ocorreu um erro inesperado/)).toBeInTheDocument()
    expect(screen.getByText('Recarregar página')).toBeInTheDocument()
    expect(screen.getByText('Tentar novamente')).toBeInTheDocument()
  })

  it('renderiza fallback customizado quando fornecido', () => {
    const customFallback = <div>Erro customizado</div>
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Erro customizado')).toBeInTheDocument()
    expect(screen.queryByText('Oops! Algo deu errado')).not.toBeInTheDocument()
  })

  it('chama callback onError quando há erro', () => {
    const onError = vi.fn()
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })
})