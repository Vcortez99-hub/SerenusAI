import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  ArrowLeft
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import MentalHealthAssessment, { MentalHealthData, calculateWellnessScore } from '@/components/MentalHealthAssessment'

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
  mentalHealthData: MentalHealthData
  wellnessScore?: {
    overallScore: number
    riskLevel: 'low' | 'moderate' | 'high'
    recommendations: string[]
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
  },
  mentalHealthData: {
    currentMood: 3,
    stressLevel: 3,
    sleepQuality: 3,
    socialSupport: 3,
    workLifeBalance: 3,
    anxietyLevel: 3,
    energyLevel: 3,
    copingStrategies: [],
    mainConcerns: [],
    previousExperience: '',
    goals: [],
    preferredSupport: []
  }
}



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
      <p className="text-gray-600">Configure como você quer usar o EssentIA</p>
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
    <h2 className="text-3xl font-bold text-gray-900 mb-4">Bem-vindo ao EssentIA</h2>
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
        preferences: userData.preferences,
        mentalHealthData: userData.mentalHealthData,
        wellnessScore: userData.wellnessScore
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



  // Componentes já movidos para fora da função principal
  const [mentalHealthStep, setMentalHealthStep] = useState(1)
  
  const updateMentalHealthData = (updates: Partial<MentalHealthData>) => {
    setUserData(prev => ({
      ...prev,
      mentalHealthData: { ...prev.mentalHealthData, ...updates }
    }))
  }
  
  const nextMentalHealthStep = () => {
    if (mentalHealthStep < 4) {
      setMentalHealthStep(prev => prev + 1)
    } else {
      // Calcular pontuação de bem-estar ao finalizar avaliação
      const wellnessScore = calculateWellnessScore(userData.mentalHealthData)
      setUserData(prev => ({ ...prev, wellnessScore }))
      nextStep()
    }
  }
  
  const prevMentalHealthStep = () => {
    if (mentalHealthStep > 1) {
      setMentalHealthStep(prev => prev - 1)
    } else {
      prevStep()
    }
  }

  const steps: OnboardingStep[] = [
    { id: 1, title: 'Bem-vindo', description: 'Conheça o EssentIA', component: <WelcomeStep /> },
    { id: 2, title: 'Conta', description: 'Crie sua conta', component: <AccountStep userData={userData} updateUserData={updateUserData} /> },
    { 
      id: 3, 
      title: 'Avaliação', 
      description: 'Panorama de saúde mental', 
      component: (
        <MentalHealthAssessment
          data={userData.mentalHealthData}
          onUpdate={updateMentalHealthData}
          currentStep={mentalHealthStep}
          onNext={nextMentalHealthStep}
          onPrev={prevMentalHealthStep}
        />
      )
    },
    { id: 4, title: 'Preferências', description: 'Configure sua experiência', component: <PreferencesStep userData={userData} updateUserData={updateUserData} /> }
  ]

  const canProceed = () => {
    switch (currentStep) {
      case 2:
        return userData.name && userData.email && userData.password.length >= 8
      case 3:
        // Para a avaliação de saúde mental, sempre permitir navegação
        return true
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden flex flex-col">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-blue-400/15 to-purple-400/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-pink-400/10 to-yellow-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>
      
      {/* Progress Bar */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">Configuração inicial</h1>
            <span className="text-sm text-gray-600 bg-white/50 px-3 py-1 rounded-full">{currentStep} de {steps.length}</span>
          </div>
          
          <div className="w-full bg-gray-200/50 rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-700 shadow-lg relative overflow-hidden"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-4xl">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-red-50/90 backdrop-blur border border-red-200/50 text-red-700 px-6 py-4 rounded-2xl mb-8 text-center shadow-lg"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-medium">{error}</span>
              </div>
              {error.includes('já está cadastrado') && (
                <div className="mt-3">
                  <a
                    href="/login"
                    className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 relative group"
                  >
                    Fazer login
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
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
              transition={{ duration: 0.4 }}
              className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 md:p-12 relative overflow-hidden"
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-500/8 to-transparent rounded-full -translate-y-20 translate-x-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/8 to-transparent rounded-full translate-y-16 -translate-x-16"></div>
              
              <div className="relative z-10">
                {steps[currentStep - 1].component}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl border-t border-white/20 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.button
              onClick={prevStep}
              disabled={currentStep === 1}
              whileHover={{ scale: currentStep === 1 ? 1 : 1.02 }}
              whileTap={{ scale: currentStep === 1 ? 1 : 0.98 }}
              className={cn(
                "flex items-center space-x-2 px-8 py-4 rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm",
                currentStep === 1
                  ? "text-gray-400 cursor-not-allowed bg-gray-100/50"
                  : "text-gray-700 hover:text-gray-900 bg-white/60 hover:bg-white/80 shadow-lg hover:shadow-xl border border-white/30"
              )}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Anterior</span>
            </motion.button>
            
            {currentStep === steps.length ? (
              <motion.button
                onClick={handleComplete}
                disabled={!canProceed() || isLoading}
                whileHover={{ scale: (!canProceed() || isLoading) ? 1 : 1.02 }}
                whileTap={{ scale: (!canProceed() || isLoading) ? 1 : 0.98 }}
                className={cn(
                  "flex items-center space-x-3 px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg relative overflow-hidden group",
                  canProceed() && !isLoading
                    ? "bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white hover:shadow-xl hover:shadow-green-500/25"
                    : "bg-gray-300/80 text-gray-500 cursor-not-allowed backdrop-blur-sm"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-3">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Configurando...</span>
                    </>
                  ) : (
                    <>
                      <span>Começar jornada</span>
                      <span className="text-xl animate-pulse">✨</span>
                    </>
                  )}
                </div>
              </motion.button>
            ) : (
              <motion.button
                onClick={nextStep}
                disabled={!canProceed()}
                whileHover={{ scale: !canProceed() ? 1 : 1.02 }}
                whileTap={{ scale: !canProceed() ? 1 : 0.98 }}
                className={cn(
                  "flex items-center space-x-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg relative overflow-hidden group",
                  canProceed()
                    ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:shadow-xl hover:shadow-blue-500/25"
                    : "bg-gray-300/80 text-gray-500 cursor-not-allowed backdrop-blur-sm"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-2">
                  <span>Próximo</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}