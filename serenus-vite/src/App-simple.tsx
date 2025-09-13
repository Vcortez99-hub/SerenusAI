import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'

// Componente Home simplificado
const SimpleHome = () => {
  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <h1 style={{ color: '#1f2937', marginBottom: '20px' }}>🌟 EssentIA - Sua jornada de bem-estar emocional</h1>
        <p style={{ color: '#6b7280', marginBottom: '30px', fontSize: '18px' }}>Plataforma de saúde mental com IA para acompanhamento terapêutico personalizado.</p>
        
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ color: '#1e40af', marginBottom: '10px' }}>✨ Análise de sentimentos</h3>
            <p style={{ color: '#64748b' }}>Compreenda suas emoções através de análise inteligente.</p>
          </div>
          
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ color: '#1e40af', marginBottom: '10px' }}>📝 Diário digital</h3>
            <p style={{ color: '#64748b' }}>Registre seus pensamentos e acompanhe seu progresso.</p>
          </div>
          
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ color: '#1e40af', marginBottom: '10px' }}>📊 Relatórios detalhados</h3>
            <p style={{ color: '#64748b' }}>Visualize insights sobre seu bem-estar emocional.</p>
          </div>
        </div>
        
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <button 
            style={{ 
              background: '#3b82f6', 
              color: 'white', 
              padding: '12px 24px', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '16px', 
              cursor: 'pointer',
              marginRight: '10px'
            }}
            onClick={() => alert('Funcionalidade em desenvolvimento!')}
          >
            Começar Agora
          </button>
          
          <button 
            style={{ 
              background: '#6b7280', 
              color: 'white', 
              padding: '12px 24px', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '16px', 
              cursor: 'pointer'
            }}
            onClick={() => window.location.reload()}
          >
            Recarregar Página
          </button>
        </div>
      </div>
    </div>
  )
}

// Componente de teste para outras rotas
const TestPage = ({ title }: { title: string }) => {
  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#f3f4f6' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '10px' }}>
        <h1 style={{ color: '#1f2937' }}>{title}</h1>
        <p style={{ color: '#6b7280', marginTop: '10px' }}>Esta é uma página de teste simplificada.</p>
        <button 
          style={{ 
            background: '#3b82f6', 
            color: 'white', 
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '6px', 
            marginTop: '20px',
            cursor: 'pointer'
          }}
          onClick={() => window.history.back()}
        >
          Voltar
        </button>
      </div>
    </div>
  )
}

function SimpleApp() {
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Simular carregamento
  setTimeout(() => setIsLoaded(true), 100)
  
  if (!isLoaded) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f3f4f6'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid #e5e7eb', 
            borderTop: '4px solid #3b82f6', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Carregando EssentIA...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<SimpleHome />} />
        <Route path="/test" element={<TestPage title="Página de Teste" />} />
        <Route path="/plans" element={<TestPage title="Planos - Em Desenvolvimento" />} />
        <Route path="*" element={<SimpleHome />} />
      </Routes>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default SimpleApp