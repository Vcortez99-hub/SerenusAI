import React from 'react'
import { createRoot } from 'react-dom/client'

// Componente de teste simples
function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Teste da Aplicação EssentIA</h1>
      <p>Se você está vendo esta mensagem, o React está funcionando!</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h2>Status dos Componentes:</h2>
        <ul>
          <li>✅ React renderizando</li>
          <li>✅ DOM funcionando</li>
          <li>✅ Estilos aplicados</li>
        </ul>
      </div>
    </div>
  )
}

// Renderizar o componente de teste
const root = document.getElementById('root')
if (root) {
  createRoot(root).render(<TestApp />)
} else {
  console.error('Elemento root não encontrado!')
}