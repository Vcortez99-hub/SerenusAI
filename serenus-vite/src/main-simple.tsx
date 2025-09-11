import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import SimpleApp from './App-simple.tsx'

// CSS básico inline para evitar problemas de importação
const basicStyles = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    line-height: 1.6;
    color: #333;
  }
  
  button:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    transition: all 0.2s ease;
  }
`

// Adicionar estilos ao head
const styleElement = document.createElement('style')
styleElement.textContent = basicStyles
document.head.appendChild(styleElement)

// Verificar se o elemento root existe
const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('Elemento root não encontrado!')
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center; color: red;">
      <h1>Erro: Elemento root não encontrado</h1>
      <p>O elemento com id="root" não foi encontrado no HTML.</p>
    </div>
  `
} else {
  console.log('✅ Elemento root encontrado, iniciando aplicação...')
  
  try {
    const root = createRoot(rootElement)
    root.render(
      <StrictMode>
        <BrowserRouter>
          <SimpleApp />
        </BrowserRouter>
      </StrictMode>
    )
    console.log('✅ Aplicação React renderizada com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao renderizar aplicação:', error)
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; color: red;">
        <h1>Erro ao carregar aplicação</h1>
        <p>Detalhes: ${error}</p>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Recarregar Página
        </button>
      </div>
    `
  }
}