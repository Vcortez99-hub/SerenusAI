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
import Admin from './pages/Admin'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import PublicRoute from './components/PublicRoute'
import ErrorBoundary from './components/ErrorBoundary'
import { ThemeProvider } from './contexts/ThemeContext'
import { GamificationProvider } from './contexts/GamificationContext'
import TherapistRegister from './pages/TherapistRegister'
import TherapistMarketplace from './pages/TherapistMarketplace'
import AdminTherapists from './pages/AdminTherapists'

const AppContent: React.FC = () => {
  useEffect(() => {
    // Styles are now handled by global CSS and Tailwind classes
  }, [])

  return (
    <div className="App relative">
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={
            <ErrorBoundary>
              <PublicRoute>
                <Home />
              </PublicRoute>
            </ErrorBoundary>
          } />
          <Route path="/login" element={
            <ErrorBoundary>
              <PublicRoute>
                <Login />
              </PublicRoute>
            </ErrorBoundary>
          } />
          <Route path="/onboarding" element={
            <ErrorBoundary>
              <PublicRoute>
                <Onboarding />
              </PublicRoute>
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
          <Route path="/admin" element={
            <ErrorBoundary>
              <AdminRoute><Admin /></AdminRoute>
            </ErrorBoundary>
          } />
          <Route path="/admin/therapists" element={
            <ErrorBoundary>
              <AdminRoute><AdminTherapists /></AdminRoute>
            </ErrorBoundary>
          } />
          <Route path="/therapist-register" element={
            <ErrorBoundary>
              <PublicRoute><TherapistRegister /></PublicRoute>
            </ErrorBoundary>
          } />
          <Route path="/therapists" element={
            <ErrorBoundary>
              <ProtectedRoute><TherapistMarketplace /></ProtectedRoute>
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
    <ThemeProvider>
      <GamificationProvider>
        <AppContent />
      </GamificationProvider>
    </ThemeProvider>
  )
}

export default App