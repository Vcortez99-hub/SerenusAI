import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
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

const AppContent: React.FC = () => {
  useEffect(() => {
    document.body.style.background = 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)'
    document.body.style.transition = 'background 0.5s ease'
  }, [])

  return (
    <div className="App relative">
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
  return <AppContent />
}

export default App