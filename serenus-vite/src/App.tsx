import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Diary from './pages/Diary'
import Settings from './pages/Settings'
import Plans from './pages/Plans'
import PaymentSuccess from './pages/PaymentSuccess'
import Onboarding from './pages/Onboarding'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
// Temporariamente removidos para debug:
// import DebugPanel from './components/DebugPanel'
// import { EffectsProvider, useEffects } from './contexts/EffectsContext'
// import FallingLeaves from './components/FallingLeaves'
// import EffectsToggle from './components/EffectsToggle'
// import { useGlobalErrorHandler } from './hooks/useErrorHandler'

const AppContent: React.FC = () => {
  // Temporariamente removido para debug:
  // const { leavesEffect } = useEffects()
  // const { setupGlobalHandlers } = useGlobalErrorHandler()
  // const [debugPanelVisible, setDebugPanelVisible] = useState(false)

  useEffect(() => {
    // Aplicar background padrão
    document.body.style.background = 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)'
    document.body.style.transition = 'background 0.5s ease'
    console.log('Applied default gradient background')
  }, [])

  // Temporariamente removido para debug:
  // useEffect(() => {
  //   const cleanup = setupGlobalHandlers()
  //   return cleanup
  // }, [setupGlobalHandlers])

  return (
    <div className="App relative">
      {/* Temporariamente removidos para debug: */}
      {/* <FallingLeaves isActive={leavesEffect} /> */}
      {/* <EffectsToggle /> */}
      {/* {process.env.NODE_ENV === 'development' && (
          <DebugPanel 
            isVisible={debugPanelVisible} 
            onToggle={() => setDebugPanelVisible(!debugPanelVisible)} 
          />
        )} */}
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={
            <ErrorBoundary>
              <Home />
            </ErrorBoundary>
          } />
          <Route path="/login" element={
            <ErrorBoundary>
              <Login />
            </ErrorBoundary>
          } />
          <Route path="/onboarding" element={
            <ErrorBoundary>
              <Onboarding />
            </ErrorBoundary>
          } />
          <Route path="/dashboard" element={
            <ErrorBoundary>
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            </ErrorBoundary>
          } />
          <Route path="/dashboards" element={<Navigate to="/dashboard" replace />} />
          <Route path="/chat" element={
            <ErrorBoundary>
              <ProtectedRoute><Chat /></ProtectedRoute>
            </ErrorBoundary>
          } />
          <Route path="/diary" element={
            <ErrorBoundary>
              <ProtectedRoute><Diary /></ProtectedRoute>
            </ErrorBoundary>
          } />
          <Route path="/settings" element={
            <ErrorBoundary>
              <ProtectedRoute><Settings /></ProtectedRoute>
            </ErrorBoundary>
          } />
          <Route path="/plans" element={
            <ErrorBoundary>
              <ProtectedRoute><Plans /></ProtectedRoute>
            </ErrorBoundary>
          } />
          <Route path="/payment-success" element={
            <ErrorBoundary>
              <ProtectedRoute><PaymentSuccess /></ProtectedRoute>
            </ErrorBoundary>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </div>
  )
}

function App() {
  return (
    // Temporariamente removido EffectsProvider para debug
    // <EffectsProvider>
      <AppContent />
    // </EffectsProvider>
  )
}

export default App