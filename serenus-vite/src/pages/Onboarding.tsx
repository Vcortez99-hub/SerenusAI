import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Shield,
  Target,
  BarChart2,
  Check,
  Sparkles
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { API_BASE_URL } from '@/config/api'
import EmotionalHealthAssessment, { EmotionalHealthData, calculateWellnessScore } from '@/components/EmotionalHealthAssessment'
import { validateCPF, validateEmail, validatePhone, formatCPF, formatPhone } from '@/utils/validators'

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
  phone: string
  cpf: string
  goals: string[]
  preferences: {
    notifications: boolean
    privacy: 'public' | 'private'
    reminderTime: string
  }
  emotionalHealthData: EmotionalHealthData
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
  phone: '',
  cpf: '',
  goals: [],
  preferences: {
    notifications: true,
    privacy: 'private',
    reminderTime: '20:00'
  },
  emotionalHealthData: {
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

interface AccountStepProps {
  userData: UserData
  updateUserData: (updates: Partial<UserData>) => void
  onCheckEmail: (email: string) => Promise<boolean>
}

const AccountStep = ({ userData, updateUserData, onCheckEmail }: AccountStepProps) => {
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [emailError, setEmailError] = useState<string | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  const isValidEmail = validateEmail(userData.email)
  const isValidPhone = validatePhone(userData.phone)
  const isValidCPF = validateCPF(userData.cpf)
  const isValidPassword = userData.password.length >= 8
  const isValidName = userData.name.length >= 3

  const handleBlur = async (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))

    if (field === 'email' && isValidEmail) {
      setIsCheckingEmail(true)
      const exists = await onCheckEmail(userData.email)
      setIsCheckingEmail(false)
      if (exists) {
        setEmailError('Email já cadastrado')
      } else {
        setEmailError(null)
      }
    }
  }

  const getInputClass = (isValid: boolean, field: string) => {
    const baseClass = "w-full pl-12 pr-10 py-3.5 bg-neutral-50 border rounded-xl focus:outline-none focus:ring-2 transition-all"
    if (touched[field]) {
      if (field === 'email' && emailError) {
        return cn(baseClass, "border-red-300 focus:ring-red-500/20 focus:border-red-500")
      }
      return isValid
        ? cn(baseClass, "border-green-500 focus:ring-green-500/20 focus:border-green-500")
        : cn(baseClass, "border-red-300 focus:ring-red-500/20 focus:border-red-500")
    }
    return cn(baseClass, "border-neutral-200 focus:ring-primary-500/20 focus:border-primary-500")
  }

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-600 shadow-lg shadow-primary-500/20">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-headings font-bold text-neutral-900 mb-2">Crie sua conta</h2>
        <p className="text-neutral-500">Precisamos de algumas informações básicas</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-neutral-700 mb-2 ml-1">Nome completo</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={userData.name}
              onChange={(e) => updateUserData({ name: e.target.value })}
              onBlur={() => handleBlur('name')}
              className={getInputClass(isValidName, 'name')}
              placeholder="Seu nome"
            />
            {touched.name && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                {isValidName ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <span className="text-red-500 text-xs font-bold">!</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-neutral-700 mb-2 ml-1">CPF</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors">
              <Shield className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={userData.cpf}
              onChange={(e) => updateUserData({ cpf: formatCPF(e.target.value) })}
              onBlur={() => handleBlur('cpf')}
              maxLength={14}
              className={getInputClass(isValidCPF, 'cpf')}
              placeholder="000.000.000-00"
            />
            {touched.cpf && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                {isValidCPF ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <span className="text-red-500 text-xs font-bold">Inválido</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-neutral-700 mb-2 ml-1">Email</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              value={userData.email}
              onChange={(e) => updateUserData({ email: e.target.value })}
              onBlur={() => handleBlur('email')}
              className={getInputClass(isValidEmail, 'email')}
              placeholder="seu@email.com"
            />
            {touched.email && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                {isCheckingEmail ? (
                  <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                ) : emailError ? (
                  <span className="text-red-500 text-xs font-bold">Já existe</span>
                ) : isValidEmail ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <span className="text-red-500 text-xs font-bold">Inválido</span>
                )}
              </div>
            )}
          </div>
          {emailError && (
            <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{emailError}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-neutral-700 mb-2 ml-1">Telefone (WhatsApp)</label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors">
            <Phone className="w-5 h-5" />
          </div>
          <input
            type="tel"
            value={userData.phone}
            onChange={(e) => updateUserData({ phone: formatPhone(e.target.value) })}
            onBlur={() => handleBlur('phone')}
            maxLength={15}
            className={getInputClass(isValidPhone, 'phone')}
            placeholder="(11) 99999-9999"
          />
          {touched.phone && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              {isValidPhone ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <span className="text-red-500 text-xs font-bold">Inválido</span>
              )}
            </div>
          )}
        </div>
        <p className="text-xs text-neutral-500 mt-1.5 ml-1">
          Vincule seu WhatsApp para receber lembretes e registrar entradas no diário
        </p>
      </div>

      <div>
        <label className="block text-sm font-bold text-neutral-700 mb-2 ml-1">Senha</label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors">
            <Lock className="w-5 h-5" />
          </div>
          <input
            type="password"
            value={userData.password}
            onChange={(e) => updateUserData({ password: e.target.value })}
            onBlur={() => handleBlur('password')}
            className={getInputClass(isValidPassword, 'password')}
            placeholder="Mínimo 8 caracteres"
          />
          {touched.password && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              {isValidPassword ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <span className="text-red-500 text-xs font-bold">Curta</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface PreferencesStepProps {
  userData: UserData
  updateUserData: (updates: Partial<UserData>) => void
}

const PreferencesStep = ({ userData, updateUserData }: PreferencesStepProps) => (
  <div className="max-w-md mx-auto animate-fade-in">
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-secondary-600 shadow-lg shadow-secondary-500/20">
        <Bell className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-headings font-bold text-neutral-900 mb-2">Preferências</h2>
      <p className="text-neutral-500">Configure como você quer usar o EssentIA</p>
    </div>

    <div className="space-y-6">
      <div className="flex items-center justify-between p-5 bg-neutral-50 rounded-xl border border-neutral-100">
        <div>
          <h3 className="font-bold text-neutral-900">Notificações</h3>
          <p className="text-sm text-neutral-500">Receber lembretes diários</p>
        </div>
        <button
          onClick={() => updateUserData({
            preferences: {
              ...userData.preferences,
              notifications: !userData.preferences.notifications
            }
          })}
          className={cn(
            "relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20",
            userData.preferences.notifications ? "bg-primary-600" : "bg-neutral-300"
          )}
        >
          <span className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm",
            userData.preferences.notifications ? "translate-x-6" : "translate-x-1"
          )} />
        </button>
      </div>

      {userData.preferences.notifications && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden"
        >
          <label className="block text-sm font-bold text-neutral-700 mb-2 ml-1">Horário do lembrete</label>
          <input
            type="time"
            value={userData.preferences.reminderTime}
            onChange={(e) => updateUserData({
              preferences: {
                ...userData.preferences,
                reminderTime: e.target.value
              }
            })}
            className="w-full px-4 py-3.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </motion.div>
      )}

      <div>
        <label className="block text-sm font-bold text-neutral-700 mb-2 ml-1">Privacidade</label>
        <div className="relative">
          <select
            value={userData.preferences.privacy}
            onChange={(e) => updateUserData({
              preferences: {
                ...userData.preferences,
                privacy: e.target.value as 'public' | 'private'
              }
            })}
            className="w-full px-4 py-3.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none bg-white"
          >
            <option value="private">Privado (recomendado)</option>
            <option value="public">Público</option>
          </select>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-neutral-400">
            <Shield className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xs text-neutral-500 mt-1.5 ml-1 flex items-center gap-1">
          <Shield className="w-3 h-3" />
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
  <div className="max-w-lg mx-auto text-center animate-fade-in">
    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary-500/30 transform rotate-3">
      <Sparkles className="w-10 h-10 text-white -rotate-3" />
    </div>
    <h2 className="text-3xl font-headings font-bold text-neutral-900 mb-4">Bem-vindo ao EssentIA</h2>
    <p className="text-lg text-neutral-600 mb-10 leading-relaxed">
      Sua jornada para o bem-estar mental começa aqui. Vamos configurar sua experiência personalizada.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
      <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 hover:shadow-md transition-shadow">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 text-blue-600">
          <Target className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-neutral-900 mb-1">Objetivos</h3>
        <p className="text-sm text-neutral-500">Defina suas metas pessoais</p>
      </div>
      <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 hover:shadow-md transition-shadow">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3 text-green-600">
          <BarChart2 className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-neutral-900 mb-1">Progresso</h3>
        <p className="text-sm text-neutral-500">Acompanhe sua evolução</p>
      </div>
      <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 hover:shadow-md transition-shadow">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3 text-purple-600">
          <Shield className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-neutral-900 mb-1">Privacidade</h3>
        <p className="text-sm text-neutral-500">Seus dados são seguros</p>
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

  const checkEmail = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      return data.exists
    } catch (err) {
      console.error('Erro ao verificar email:', err)
      return false
    }
  }

  const nextStep = async () => {
    if (currentStep === 2) {
      // Verificar email antes de prosseguir
      setIsLoading(true)
      const exists = await checkEmail(userData.email)

      if (exists) {
        setError('Este email já está cadastrado. Tente fazer login.')
        setIsLoading(false)
        return
      }

      setIsLoading(false)
      setError('')
    }

    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    setError('')
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
        phone: userData.phone,
        cpf: userData.cpf,
        goals: userData.goals,
        preferences: userData.preferences,
        emotionalHealthData: userData.emotionalHealthData,
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
  const [emotionalHealthStep, setEmotionalHealthStep] = useState(1)

  const updateEmotionalHealthData = (updates: Partial<EmotionalHealthData>) => {
    setUserData(prev => ({
      ...prev,
      emotionalHealthData: { ...prev.emotionalHealthData, ...updates }
    }))
  }

  const nextEmotionalHealthStep = () => {
    if (emotionalHealthStep < 5) {
      setEmotionalHealthStep(prev => prev + 1)
    } else {
      // Calcular pontuação de bem-estar ao finalizar avaliação
      const wellnessScore = calculateWellnessScore(userData.emotionalHealthData)
      setUserData(prev => ({ ...prev, wellnessScore }))
      nextStep()
    }
  }

  const prevEmotionalHealthStep = () => {
    if (emotionalHealthStep > 1) {
      setEmotionalHealthStep(prev => prev - 1)
    } else {
      prevStep()
    }
  }

  const steps: OnboardingStep[] = [
    { id: 1, title: 'Bem-vindo', description: 'Conheça o EssentIA', component: <WelcomeStep /> },
    { id: 2, title: 'Conta', description: 'Crie sua conta', component: <AccountStep userData={userData} updateUserData={updateUserData} onCheckEmail={checkEmail} /> },
    {
      id: 3,
      title: 'Avaliação',
      description: 'Panorama de saúde emocional',
      component: (
        <EmotionalHealthAssessment
          data={userData.emotionalHealthData}
          onUpdate={updateEmotionalHealthData}
          currentStep={emotionalHealthStep}
          onNext={nextEmotionalHealthStep}
          onPrev={prevEmotionalHealthStep}
        />
      )
    },
    { id: 4, title: 'Preferências', description: 'Configure sua experiência', component: <PreferencesStep userData={userData} updateUserData={updateUserData} /> }
  ]

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true
      case 2:
        return !!(userData.name.trim().length >= 3 &&
          validateEmail(userData.email) &&
          validateCPF(userData.cpf) &&
          validatePhone(userData.phone) &&
          userData.password.length >= 8)
      case 3:
        return emotionalHealthStep === 5 && userData.emotionalHealthData.goals.length > 0
      case 4:
        return true
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 relative overflow-hidden flex flex-col">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary-100/40 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-secondary-100/40 via-transparent to-transparent" />
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-neutral-200/60 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-headings font-bold text-neutral-900">Configuração inicial</h1>
            <span className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
              Passo {currentStep} de {steps.length}
            </span>
          </div>

          <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-full rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </motion.div>
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
              className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl mb-8 text-center shadow-sm"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="font-medium">{error}</span>
              </div>
              {error.includes('já está cadastrado') && (
                <div className="mt-3">
                  <a
                    href="/login"
                    className="text-primary-600 font-bold hover:text-primary-700 hover:underline transition-colors"
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
              transition={{ duration: 0.4 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-neutral-200/50 border border-white/50 p-8 md:p-12 relative overflow-hidden"
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-500/5 to-transparent rounded-full -translate-y-32 translate-x-32 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary-500/5 to-transparent rounded-full translate-y-24 -translate-x-24 pointer-events-none"></div>

              <div className="relative z-10">
                {steps[currentStep - 1].component}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl border-t border-neutral-200/60 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.button
              onClick={prevStep}
              disabled={currentStep === 1}
              whileHover={{ scale: currentStep === 1 ? 1 : 1.02 }}
              whileTap={{ scale: currentStep === 1 ? 1 : 0.98 }}
              className={cn(
                "flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all duration-200",
                currentStep === 1
                  ? "text-neutral-300 cursor-not-allowed"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
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
                  "flex items-center gap-3 px-8 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg relative overflow-hidden group",
                  canProceed() && !isLoading
                    ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:shadow-xl hover:shadow-primary-500/25"
                    : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                )}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-3">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Configurando...</span>
                    </>
                  ) : (
                    <>
                      <span>Começar jornada</span>
                      <Sparkles className="w-5 h-5" />
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
                  "flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg relative overflow-hidden group",
                  canProceed()
                    ? "bg-neutral-900 text-white hover:bg-neutral-800 hover:shadow-xl hover:shadow-neutral-900/20"
                    : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                )}
              >
                <div className="relative flex items-center gap-2">
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