import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  ArrowLeft
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

interface OnboardingStep {
  id: number
  title: string
  description: string
  component: React.ReactNode
}

interface UserData {
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

const initialUserData: UserData = {
  name: '',
  email: '',
  password: '',
  goals: [],
  preferences: {
    notifications: true,
    privacy: 'private',
    reminderTime: '20:00'
  }
}

const goalOptions = [
  { id: 'anxiety', label: 'Reduzir ansiedade' },
  { id: 'mood', label: 'Melhorar humor' },
  { id: 'stress', label: 'Gerenciar estresse' },
  { id: 'sleep', label: 'Melhorar sono' },
  { id: 'mindfulness', label: 'Praticar mindfulness' },
  { id: 'relationships', label: 'Fortalecer relacionamentos' }
]

// Move components outside to prevent re-creation on each render
interface AccountStepProps {
  userData: UserData
  updateUserData: (updates: Partial<UserData>) => void
}

const AccountStep = ({ userData, updateUserData }: AccountStepProps) => (
  <div className="max-w-md mx-auto">
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">👤</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Crie sua conta</h2>
      <p className="text-gray-600">Precisamos de algumas informações básicas</p>
    </div>
    
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">👤</span>
          <input
            type="text"
            value={userData.name}
            onChange={(e) => updateUserData({ name: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Seu nome"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">📧</span>
          <input
            type="email"
            value={userData.email}
            onChange={(e) => updateUserData({ email: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="seu@email.com"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">🔒</span>
          <input
            type="password"
            value={userData.password}
            onChange={(e) => updateUserData({ password: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Mínimo 8 caracteres"
          />
        </div>
      </div>
    </div>
  </div>
)

interface GoalsStepProps {
  userData: UserData
  toggleGoal: (goalId: string) => void
}

const GoalsStep = ({ userData, toggleGoal }: GoalsStepProps) => (
  <div className="max-w-2xl mx-auto">
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">🎯</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Quais são seus objetivos?</h2>
      <p className="text-gray-600">Selecione as áreas que você gostaria de melhorar</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {goalOptions.map((goal) => {
        const isSelected = userData.goals.includes(goal.id)
        
        return (
          <button
            key={goal.id}
            onClick={() => toggleGoal(goal.id)}
            className={cn(
              "p-4 rounded-xl border-2 transition-all duration-200 text-left",
              isSelected
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            )}
          >
            <div className="flex items-center space-x-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                isSelected ? "bg-primary-500" : "bg-gray-100"
              )}>
                <span className={cn(
                  "text-lg",
                  isSelected ? "text-white" : "text-gray-600"
                )}>
                  {goal.id === 'anxiety' ? '🧠' : 
                   goal.id === 'mood' ? '❤️' :
                   goal.id === 'stress' ? '🎯' :
                   goal.id === 'sleep' ? '📅' :
                   goal.id === 'mindfulness' ? '✨' : '❤️'}
                </span>
              </div>
              <span className={cn(
                "font-medium",
                isSelected ? "text-primary-700" : "text-gray-700"
              )}>
                {goal.label}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  </div>
)

interface PreferencesStepProps {
  userData: UserData
  updateUserData: (updates: Partial<UserData>) => void
}

const PreferencesStep = ({ userData, updateUserData }: PreferencesStepProps) => (
  <div className="max-w-md mx-auto">
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">🔔</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Preferências</h2>
      <p className="text-gray-600">Configure como você quer usar o Serenus</p>
    </div>
    
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-medium text-gray-900">Notificações</h3>
          <p className="text-sm text-gray-600">Receber lembretes diários</p>
        </div>
        <button
          onClick={() => updateUserData({
            preferences: {
              ...userData.preferences,
              notifications: !userData.preferences.notifications
            }
          })}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            userData.preferences.notifications ? "bg-primary-500" : "bg-gray-300"
          )}
        >
          <span className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            userData.preferences.notifications ? "translate-x-6" : "translate-x-1"
          )} />
        </button>
      </div>
      
      {userData.preferences.notifications && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Horário do lembrete</label>
          <input
            type="time"
            value={userData.preferences.reminderTime}
            onChange={(e) => updateUserData({
              preferences: {
                ...userData.preferences,
                reminderTime: e.target.value
              }
            })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Privacidade</label>
        <select
          value={userData.preferences.privacy}
          onChange={(e) => updateUserData({
            preferences: {
              ...userData.preferences,
              privacy: e.target.value as 'public' | 'private'
            }
          })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="private">Privado (recomendado)</option>
          <option value="public">Público</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {userData.preferences.privacy === 'private' 
            ? 'Seus dados ficam apenas no seu dispositivo'
            : 'Permite compartilhamento anônimo para pesquisas'
          }
        </p>
      </div>
    </div>
  </div>
)

const WelcomeStep = () => (
  <div className="max-w-lg mx-auto text-center">
    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
      <span className="text-3xl">🌟</span>
    </div>
    <h2 className="text-3xl font-bold text-gray-900 mb-4">Bem-vindo ao Serenus</h2>
    <p className="text-lg text-gray-600 mb-8">
      Sua jornada para o bem-estar mental começa aqui. Vamos configurar sua experiência personalizada.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-blue-600">🎯</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Objetivos</h3>
          <p className="text-sm text-gray-600">Defina suas metas pessoais</p>
        </div>
      </div>
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-green-600">📊</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Progresso</h3>
          <p className="text-sm text-gray-600">Acompanhe sua evolução</p>
        </div>
      </div>
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-purple-600">🔒</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Privacidade</h3>
          <p className="text-sm text-gray-600">Seus dados são seguros</p>
        </div>
      </div>
    </div>
  </div>
)

export default function Onboarding() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [userData, setUserData] = useState<UserData>(initialUserData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const updateUserData = (updates: Partial<UserData>) => {
    setUserData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const success = await register({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        goals: userData.goals,
        preferences: userData.preferences
      })
      
      if (success) {
        navigate('/dashboard')
      } else {
        setError('Este email já está cadastrado. Tente fazer login.')
      }
    } catch (error) {
      setError('Erro ao criar conta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleGoal = (goalId: string) => {
    setUserData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }))
  }

  // Componentes já movidos para fora da função principal

  const steps: OnboardingStep[] = [
    { id: 1, title: 'Bem-vindo', description: 'Conheça o Serenus', component: <WelcomeStep /> },
    { id: 2, title: 'Conta', description: 'Crie sua conta', component: <AccountStep userData={userData} updateUserData={updateUserData} /> },
    { id: 3, title: 'Objetivos', description: 'Defina suas metas', component: <GoalsStep userData={userData} toggleGoal={toggleGoal} /> },
    { id: 4, title: 'Preferências', description: 'Configure sua experiência', component: <PreferencesStep userData={userData} updateUserData={updateUserData} /> }
  ]

  const canProceed = () => {
    switch (currentStep) {
      case 2:
        return userData.name && userData.email && userData.password.length >= 8
      case 3:
        return userData.goals.length > 0
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 flex flex-col">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-gray-900">Configuração inicial</h1>
            <span className="text-sm text-gray-600">{currentStep} de {steps.length}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-4xl">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-center"
            >
              {error}
              {error.includes('já está cadastrado') && (
                <div className="mt-2">
                  <a
                    href="/login"
                    className="text-primary-500 hover:text-primary-600 font-medium underline"
                  >
                    Fazer login
                  </a>
                </div>
              )}
            </motion.div>
          )}
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12"
            >
              {steps[currentStep - 1].component}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors",
                currentStep === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
            
            {currentStep === steps.length ? (
              <button
                onClick={handleComplete}
                disabled={!canProceed() || isLoading}
                className={cn(
                  "flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all",
                  canProceed() && !isLoading
                    ? "bg-primary-500 text-white hover:bg-primary-600 shadow-lg hover:shadow-xl"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Configurando...</span>
                  </>
                ) : (
                  <>
                    <span>Começar jornada</span>
                    <span className="text-lg">✨</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className={cn(
                  "flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all",
                  canProceed()
                    ? "bg-primary-500 text-white hover:bg-primary-600 shadow-lg hover:shadow-xl"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                )}
              >
                <span>Próximo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}