import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { MentalHealthData } from '@/components/MentalHealthAssessment'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  goals: string[]
  preferences: {
    notifications: boolean
    privacy: 'public' | 'private'
    reminderTime: string
  }
  mentalHealthData?: MentalHealthData
  wellnessScore?: {
    overallScore: number
    riskLevel: 'low' | 'moderate' | 'high'
    recommendations: string[]
  }
  createdAt: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

interface RegisterData {
  name: string
  email: string
  password: string
  phone: string
  goals: string[]
  preferences: {
    notifications: boolean
    privacy: 'public' | 'private'
    reminderTime: string
  }
  mentalHealthData?: MentalHealthData
  wellnessScore?: {
    overallScore: number
    riskLevel: 'low' | 'moderate' | 'high'
    recommendations: string[]
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar se há usuário logado ao inicializar
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const currentUser = localStorage.getItem('essentia_current_user')
        if (currentUser) {
          setUser(JSON.parse(currentUser))
        }
      } catch (error) {
        console.error('Erro ao verificar status de autenticação:', error)
        localStorage.removeItem('essentia_current_user')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      // Registrar no backend
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          phone: userData.phone,
          goals: userData.goals,
          preferences: userData.preferences,
          mentalHealthData: userData.mentalHealthData,
          wellnessScore: userData.wellnessScore
        })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Erro ao registrar:', data.error)
        return false
      }

      if (data.success && data.user) {
        // Salvar usuário no localStorage para persistência
        localStorage.setItem('essentia_current_user', JSON.stringify(data.user))
        setUser(data.user)
        return true
      }

      return false
    } catch (error) {
      console.error('Erro ao registrar usuário:', error)
      return false
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Fazer login no backend
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Erro ao fazer login:', data.error)
        return false
      }

      if (data.success && data.user) {
        // Salvar usuário no localStorage para persistência
        localStorage.setItem('essentia_current_user', JSON.stringify(data.user))
        setUser(data.user)
        return true
      }

      return false
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('essentia_current_user')
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}