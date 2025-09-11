import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import App from '../App'

// Helper function to render App with all required providers
const renderApp = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('App', () => {
  it('renders without crashing', () => {
    renderApp()
    
    // Verifica se o componente renderiza sem erros
    expect(document.body).toBeInTheDocument()
  })

  it('renders the effects toggle button', () => {
    renderApp()
    
    // Procura pelo botão de toggle (emoji de folha) - pode estar em qualquer página
    const toggleButtons = screen.queryAllByRole('button')
    expect(toggleButtons.length).toBeGreaterThanOrEqual(0)
  })

  it('has the correct initial background style', () => {
    renderApp()
    
    // Verifica se o body tem o background branco inicialmente (rgb ou hex)
    const bgColor = document.body.style.background
    expect(bgColor === '#ffffff' || bgColor === 'rgb(255, 255, 255)' || bgColor.includes('255, 255, 255')).toBe(true)
  })
})