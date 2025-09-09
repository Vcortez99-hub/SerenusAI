import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  goals: string[]
  preferences: {
    notifications: boolean
    privacy: 'public' | 'private'
    reminderTime: string
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
  goals: string[]
  preferences: {
    notifications: boolean
    privacy: 'public' | 'private'
    reminderTime: string
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
        const currentUser = localStorage.getItem('serenus_current_user')
        if (currentUser) {
          setUser(JSON.parse(currentUser))
        }
      } catch (error) {
        console.error('Erro ao verificar status de autenticação:', error)
        localStorage.removeItem('serenus_current_user')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      // Verificar se o email já existe
      const existingUsers = JSON.parse(localStorage.getItem('serenus_users') || '[]')
      const emailExists = existingUsers.some((u: User) => u.email === userData.email)
      
      if (emailExists) {
        return false // Email já cadastrado
      }

      // Criar novo usuário
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        goals: userData.goals,
        preferences: userData.preferences,
        createdAt: new Date().toISOString()
      }

      // Salvar senha separadamente (hash simples para demo)
      const userCredentials = {
        email: userData.email,
        password: btoa(userData.password) // Base64 encoding (não é seguro para produção)
      }

      // Salvar no localStorage
      const updatedUsers = [...existingUsers, newUser]
      const credentials = JSON.parse(localStorage.getItem('serenus_credentials') || '[]')
      const updatedCredentials = [...credentials, userCredentials]

      localStorage.setItem('serenus_users', JSON.stringify(updatedUsers))
      localStorage.setItem('serenus_credentials', JSON.stringify(updatedCredentials))
      localStorage.setItem('serenus_current_user', JSON.stringify(newUser))

      setUser(newUser)
      return true
    } catch (error) {
      console.error('Erro ao registrar usuário:', error)
      return false
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Verificar credenciais
      const credentials = JSON.parse(localStorage.getItem('serenus_credentials') || '[]')
      const userCredential = credentials.find((c: any) => 
        c.email === email && c.password === btoa(password)
      )

      if (!userCredential) {
        return false // Credenciais inválidas
      }

      // Buscar dados do usuário
      const users = JSON.parse(localStorage.getItem('serenus_users') || '[]')
      const userData = users.find((u: User) => u.email === email)

      if (!userData) {
        return false // Usuário não encontrado
      }

      localStorage.setItem('serenus_current_user', JSON.stringify(userData))
      setUser(userData)
      return true
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('serenus_current_user')
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