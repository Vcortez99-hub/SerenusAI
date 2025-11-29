import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Heart,
  Brain,
  Calendar,
  TrendingUp,
  MessageCircle,
  Book,
  Clock,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Plus,
  Zap,
  BarChart3,
  Target,
  X,
  Play,
  Pause,
  Shield,
  Users
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { cn, getMoodColor, getMoodEmoji, getMoodLabel } from '@/lib/utils'
import ActivityGuide from '@/components/ActivityGuide'
import OnboardingGuide from '@/components/OnboardingGuide'
import Confetti from '@/components/Confetti'
import GamificationBadge from '@/components/GamificationBadge'
import AchievementsCard from '@/components/AchievementsCard'
import { Header } from '@/components/layout/Header'
import LevelUpAnimation from '@/components/LevelUpAnimation'
import { LevelIndicator } from '@/components/gamification/LevelIndicator'
import { Serenipet } from '@/components/gamification/Serenipet'
import { API_BASE_URL } from '@/config/api'
import * as gamificationApi from '@/services/gamification-api'
import { activities } from '@/data/activities'

interface UserData {
  moodToday?: number
  lastMoodUpdate?: string
  currentStreak: number
  totalSessions: number
  exercises: Exercise[]
  moodHistory: MoodEntry[]
  diaryEntries: DiaryEntry[]
  weeklyProgress: number
}

interface Exercise {
  id: string
  title: string
  duration: string
  category: string
  completed: boolean
  dateCompleted?: string
  icon?: string
}

interface MoodEntry {
  date: string
  mood: number
  time?: string
}

interface DiaryEntry {
  id: string
  date: string
  title: string
  content: string
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [userData, setUserData] = useState<UserData>({
    currentStreak: 0,
    totalSessions: 0,
    exercises: [],
    moodHistory: [],
    diaryEntries: [],
    weeklyProgress: 0
  })
  const [moodToday, setMoodToday] = useState<number | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [weeklyActivities, setWeeklyActivities] = useState<Array<{ date: string, activity: string, completed: boolean }>>([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastMood, setToastMood] = useState<number>(3)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [levelUpData, setLevelUpData] = useState<{ level: number, name: string, color: string } | null>(null)
  const [availableActivities, setAvailableActivities] = useState<any[]>([])


  const dashboardSteps = [
    {
      id: 'mood-card',
      target: '[data-tour="mood-card"]',
      title: '💚 Bem-vindo ao Essentia!',
      description: 'Este é seu espaço de bem-estar! Comece registrando como você está se sentindo hoje. É rápido e ajuda você a acompanhar suas emoções.',
      position: 'bottom' as const
    },
    {
      id: 'activities',
      target: '[data-tour="activities"]',
      title: '🎯 Atividades de Bem-Estar',
      description: 'Explore meditações, exercícios de respiração e outras atividades para melhorar seu dia! Complete uma e veja a mágica acontecer com confete! 🎊',
      position: 'top' as const
    }
  ]

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    // Verificar se o usuário é admin
    const checkAdmin = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/check/${user.id}`)
        const data = await response.json()
        setIsAdmin(data.isAdmin || false)
      } catch (error) {
        console.error('Erro ao verificar admin:', error)
      }
    }
    checkAdmin()

    // Buscar atividades disponíveis para o usuário
    const fetchUserActivities = async () => {
      if (!user?.id) return

      try {
        const response = await fetch(`${API_BASE_URL}/activities/user?userId=${user.id}`)
        const data = await response.json()

        if (data.success && data.activities) {
          setAvailableActivities(data.activities)
        }
      } catch (error) {
        console.error('Erro ao buscar atividades:', error)
        // Fallback: use empty array
        setAvailableActivities([])
      }
    }

    fetchUserActivities()

    // Carregar dados do usuário do localStorage
    const userDataKey = `user_data_${user.id}`
    const savedData = localStorage.getItem(userDataKey)
    const savedWeeklyActivities = localStorage.getItem(`weekly_activities_${user.id}`)

    const activities = savedWeeklyActivities ? JSON.parse(savedWeeklyActivities) : []
    setWeeklyActivities(activities)

    if (savedData) {
      const data = JSON.parse(savedData)

      // Migrar dados antigos: aceitar valores 1-5 (escala atual) e 6-10 (escala antiga)
      const validMoodHistory = (data.moodHistory || []).filter((entry: any) => {
        return entry.mood >= 1 && entry.mood <= 10
      })

      // Calcular progresso semanal real
      const weeklyProgress = calculateWeeklyProgress(activities, validMoodHistory)
      const currentStreak = calculateCurrentStreak(activities)

      const migratedData = {
        ...data,
        moodHistory: validMoodHistory,
        weeklyProgress,
        currentStreak,
        totalSessions: activities.filter((a: any) => a.completed).length
      }

      // Salvar dados migrados de volta no localStorage
      localStorage.setItem(userDataKey, JSON.stringify(migratedData))

      setUserData(migratedData)

      // Verificar se já registrou humor hoje e restaurar o valor
      const today = new Date().toISOString().split('T')[0]
      if (migratedData.lastMoodUpdate === today && migratedData.moodToday) {
        setMoodToday(migratedData.moodToday)
      }
    }
  }, [user, navigate])

  const handleMoodSelect = (mood: number) => {
    setMoodToday(mood)
  }

  const handleMoodRegister = () => {
    if (!moodToday) {
      alert('Por favor, selecione como você está se sentindo primeiro.')
      return
    }

    const today = new Date().toISOString().split('T')[0]
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    // Verificar se já existe registro para hoje
    const existingTodayEntry = userData.moodHistory.find(entry => entry.date === today)
    const isUpdatingToday = !!existingTodayEntry

    const newMoodHistory = [
      ...userData.moodHistory.filter(entry => entry.date !== today),
      { date: today, mood: moodToday, time }
    ]

    // Recalcular progresso semanal ao registrar humor
    const newProgress = calculateWeeklyProgress(weeklyActivities, newMoodHistory)

    const updatedUserData = {
      ...userData,
      moodToday: moodToday,
      lastMoodUpdate: today,
      moodHistory: newMoodHistory,
      weeklyProgress: newProgress,
      // Só incrementar streak se for um novo dia, não uma atualização
      currentStreak: isUpdatingToday ? userData.currentStreak : userData.currentStreak + 1
    }

    setUserData(updatedUserData)

    // Salvar no localStorage
    if (user) {
      const userDataKey = `user_data_${user.id}`
      localStorage.setItem(userDataKey, JSON.stringify(updatedUserData))
      console.log('✅ Dados salvos no localStorage:', userDataKey, updatedUserData)
    }

    // Enviar para o backend para log de auditoria
    if (user) {
      fetch(`${API_BASE_URL}/mood`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          mood: moodToday,
          moodScore: moodToday,
          time
        })
      }).catch(err => console.error('Erro ao logar humor:', err));
    }

    // Mostrar toast com o humor selecionado
    setToastMood(moodToday)
    setToastMessage(isUpdatingToday ? 'Humor atualizado com sucesso!' : 'Humor registrado com sucesso!')
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const addCustomExercise = () => {
    const title = prompt('Nome do exercício:')
    const duration = prompt('Duração (ex: 5 min):')

    if (title && duration) {
      const newExercise: Exercise = {
        id: Date.now().toString(),
        title,
        duration,
        category: 'custom',
        completed: false,
        icon: '🧘‍♀️'
      }

      const updatedUserData = {
        ...userData,
        exercises: [...userData.exercises, newExercise]
      }

      setUserData(updatedUserData)

      if (user) {
        const userDataKey = `user_data_${user.id}`
        localStorage.setItem(userDataKey, JSON.stringify(updatedUserData))
      }
    }
  }

  const toggleExercise = (id: string) => {
    const updatedExercises = userData.exercises.map(ex => {
      if (ex.id === id) {
        const completed = !ex.completed
        return {
          ...ex,
          completed,
          dateCompleted: completed ? new Date().toISOString().split('T')[0] : undefined
        }
      }
      return ex
    })

    const updatedUserData = {
      ...userData,
      exercises: updatedExercises
    }

    setUserData(updatedUserData)

    if (user) {
      const userDataKey = `user_data_${user.id}`
      localStorage.setItem(userDataKey, JSON.stringify(updatedUserData))
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) {
    return null
  }

  // Calcular dias de uso baseado na data de criação da conta
  const accountCreated = new Date(user.createdAt)
  const today = new Date()
  const daysUsing = Math.floor((today.getTime() - accountCreated.getTime()) / (1000 * 60 * 60 * 24))

  // Determinar energia baseada no humor
  const getEnergyLevel = () => {
    if (!moodToday) return 'Neutra'
    if (moodToday >= 8) return 'Alta'
    if (moodToday >= 6) return 'Boa'
    if (moodToday >= 4) return 'Média'
    return 'Baixa'
  }

  const openActivityModal = (activityKey: string) => {
    setSelectedActivity(activityKey)
    setIsActivityModalOpen(true)
  }

  const closeActivityModal = () => {
    setSelectedActivity(null)
    setIsActivityModalOpen(false)
  }

  const calculateWeeklyProgress = (activities: any[], moodHistory: any[]) => {
    const now = new Date()
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())

    // Atividades da semana atual
    const thisWeekActivities = activities.filter(activity => {
      const activityDate = new Date(activity.date)
      return activityDate >= weekStart && activity.completed
    })

    // Humor da semana atual (contar apenas dias únicos, não importa o valor)
    const thisWeekMoods = moodHistory.filter(mood => {
      const moodDate = new Date(mood.date)
      return moodDate >= weekStart
    })

    // Contar dias únicos com registro de humor
    const uniqueMoodDays = new Set(thisWeekMoods.map(mood => mood.date)).size

    // Calcular progresso baseado em:
    // - Atividades completadas (60% do peso)
    // - Dias com registro de humor (40% do peso)
    const activityScore = Math.min((thisWeekActivities.length / 7) * 100, 100) // Máximo 7 atividades por semana
    const moodScore = Math.min((uniqueMoodDays / 7) * 100, 100) // Máximo 7 dias com registro

    const totalProgress = Math.round((activityScore * 0.6) + (moodScore * 0.4))

    console.log('📊 Cálculo de Progresso Semanal:', {
      diasComRegistro: uniqueMoodDays,
      atividadesCompletas: thisWeekActivities.length,
      pontuacaoHumor: moodScore,
      pontuacaoAtividades: activityScore,
      progressoTotal: totalProgress
    })

    return totalProgress
  }

  const calculateCurrentStreak = (activities: any[]) => {
    if (activities.length === 0) return 0

    const sortedActivities = activities
      .filter(a => a.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (sortedActivities.length === 0) return 0

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const activity of sortedActivities) {
      const activityDate = new Date(activity.date)
      activityDate.setHours(0, 0, 0, 0)

      const daysDiff = Math.floor((currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === streak) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  const completeActivity = async (activityKey: string) => {
    const newActivity = {
      date: new Date().toISOString(),
      activity: activityKey,
      completed: true
    }

    const updatedActivities = [...weeklyActivities, newActivity]
    setWeeklyActivities(updatedActivities)

    // Salvar no localStorage
    if (user) {
      localStorage.setItem(`weekly_activities_${user.id}`, JSON.stringify(updatedActivities))
    }

    // Recalcular progresso
    const newProgress = calculateWeeklyProgress(updatedActivities, userData.moodHistory)
    const newStreak = calculateCurrentStreak(updatedActivities)

    const updatedUserData = {
      ...userData,
      weeklyProgress: newProgress,
      currentStreak: newStreak,
      totalSessions: userData.totalSessions + 1
    }

    setUserData(updatedUserData)

    // Salvar no localStorage
    if (user) {
      const userDataKey = `user_data_${user.id}`
      localStorage.setItem(userDataKey, JSON.stringify(updatedUserData))
      console.log('✅ Atividade completada e dados salvos:', updatedUserData)

      // 🎮 Registrar atividade no backend de gamificação
      try {
        const activityName = availableActivities.find(a => a.id === activityKey)?.title || activityKey
        const result = await gamificationApi.completeActivity(user.id, activityKey, activityName)

        console.log('🎮 Gamificação:', result)

        // Verificar se subiu de nível
        if (result.gamification.leveledUp && result.gamification.newLevel) {
          setLevelUpData({
            level: parseInt(result.gamification.newLevel.split(' ')[1]) || 0,
            name: result.gamification.newLevel,
            color: result.gamification.levelColor || '#a855f7'
          })
          setShowLevelUp(true)
        }

        // Mostrar conquistas desbloqueadas
        if (result.gamification.achievements.length > 0) {
          console.log('🏆 Conquistas:', result.gamification.achievements.map(a => a.achievement.name))
        }
      } catch (error) {
        console.error('Erro ao registrar gamificação:', error)
      }
    }

    // Mostrar confete ao completar atividade
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)

    closeActivityModal()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header com saudação */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-lg sm:text-xl font-semibold text-blue-600">V</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm text-gray-500">☀️ Bom dia</span>
              </div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">{user.name}</h1>
              <p className="text-xs sm:text-sm text-gray-500">Como você está se sentindo hoje?</p>
            </div>
          </div>
        </div>

        {/* Cards de estatísticas no topo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {/* Progresso Semanal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100 text-sm">Progresso Semanal</span>
              <TrendingUp className="w-4 h-4 text-blue-200" />
            </div>
            <div className="text-2xl font-bold mb-1">{userData.weeklyProgress || 0}%</div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
          </motion.div>

          {/* Registros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Registros</span>
              <BarChart3 className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{userData.moodHistory.length}</div>
          </motion.div>

          {/* Sequência */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Sequência</span>
              <Target className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{userData.currentStreak} dias</div>
          </motion.div>

          {/* Energia */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-4 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Energia</span>
              <Zap className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{getEnergyLevel()}
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Como você se sente? */}
            <motion.div data-tour="mood-card" className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Como você se sente?</h2>
              </div>

              <p className="text-gray-600 text-sm mb-6">Registre seu humor e acompanhe sua evolução</p>

              <div className="grid grid-cols-5 gap-2 sm:gap-4 mb-6">
                {[
                  { mood: 1, label: 'Muito triste', emoji: '😢' },
                  { mood: 2, label: 'Triste', emoji: '😔' },
                  { mood: 3, label: 'Neutro', emoji: '😐' },
                  { mood: 4, label: 'Feliz', emoji: '😊' },
                  { mood: 5, label: 'Muito feliz', emoji: '😄' }
                ].map(({ mood, label, emoji }) => (
                  <button
                    key={mood}
                    onClick={() => handleMoodSelect(mood)}
                    className={cn(
                      "aspect-square rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center p-3 hover:scale-105",
                      moodToday === mood
                        ? "border-blue-500 bg-blue-50 scale-105 shadow-lg"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    )}
                  >
                    <span className="text-2xl sm:text-3xl mb-1 sm:mb-2">{emoji}</span>
                    <span className="text-[10px] sm:text-xs text-gray-600 font-medium text-center leading-tight">{label}</span>
                  </button>
                ))}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">Como foi seu dia? Compartilhe seus pensamentos...</p>
                <button
                  onClick={handleMoodRegister}
                  className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!moodToday}
                >
                  Registrar Humor ✨
                </button>
              </div>
            </motion.div>

            {/* Card: Fale com um Terapeuta */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg"
              data-tour="therapist-card"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Fale com um Terapeuta Humano</h3>
                  <p className="text-purple-100 text-sm">Sessões a partir de R$ 49,90</p>
                </div>
              </div>
              <p className="text-white/90 mb-4 text-sm">
                Conecte-se com profissionais qualificados prontos para te ajudar em sua jornada de bem-estar.
              </p>
              <Link to="/therapists">
                <button className="w-full bg-white text-purple-600 py-3 rounded-xl font-bold hover:bg-purple-50 transition-colors shadow-lg">
                  Ver Terapeutas Disponíveis
                </button>
              </Link>
            </motion.div>

            {/* Atividades de Bem-estar */}
            <motion.div data-tour="activities" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Atividades de Bem-estar</h2>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-6">Práticas recomendadas para seu momento atual</p>

              {userData.exercises.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {userData.exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all cursor-pointer",
                        exercise.completed
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                      )}
                      onClick={() => toggleExercise(exercise.id)}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          exercise.completed ? "bg-green-500" : "bg-blue-500"
                        )}>
                          <span className="text-white text-sm">{exercise.icon || '🧘‍♀️'}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{exercise.title}</h3>
                          <p className="text-sm text-gray-600">{exercise.duration}</p>
                        </div>
                        {exercise.completed && (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div
                    onClick={() => openActivityModal('meditation')}
                    className="p-4 rounded-xl bg-blue-50 border-2 border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">🧘‍♀️</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Meditação Guiada</h3>
                        <p className="text-sm text-gray-600">5-15 min</p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => openActivityModal('breathing')}
                    className="p-4 rounded-xl bg-green-50 border-2 border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">🌬️</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Respiração Consciente</h3>
                        <p className="text-sm text-gray-600">3-10 min</p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => openActivityModal('mindful')}
                    className="p-4 rounded-xl bg-purple-50 border-2 border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">🌸</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Pausa Mindful</h3>
                        <p className="text-sm text-gray-600">2-5 min</p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => openActivityModal('journaling')}
                    className="p-4 rounded-xl bg-orange-50 border-2 border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">📖</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Escrita Terapêutica</h3>
                        <p className="text-sm text-gray-600">10-20 min</p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => openActivityModal('grounding')}
                    className="p-4 rounded-xl bg-green-50 border-2 border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">🌿</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Ancoragem</h3>
                        <p className="text-sm text-gray-600">3-7 min</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Cards de Gamificação */}
            {user && (
              <>
                <GamificationBadge userId={user.id} />
                <AchievementsCard userId={user.id} />
              </>
            )}

            {/* Progresso Semanal */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Progresso Semanal</h3>
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Bem-estar Geral</span>
                  <span className="text-sm font-medium text-gray-900">{userData.weeklyProgress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${userData.weeklyProgress || 0}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500">+12% em relação à semana passada</p>
            </motion.div>

            {/* Registros Recentes */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-2xl p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Registros Recentes</h3>
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>

              {userData.moodHistory.length > 0 ? (
                <div className="space-y-3">
                  {userData.moodHistory.slice(-3).reverse().map((entry, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            {getMoodLabel(entry.mood)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          {entry.time && `, ${entry.time}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Heart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Nenhum registro ainda</p>
                </div>
              )}
            </motion.div>

            {/* Ações Rápidas */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-2xl p-6 border border-gray-200"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Ações Rápidas</h3>

              <div className="space-y-3">
                <Link data-tour="chat-ia" to="/chat" className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800">Chat com IA</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link data-tour="diary-link" to="/diary" className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <Book className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Diário Digital</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-green-600 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link to="/therapists" className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-800">Encontrar Terapeuta</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Modal de Atividade com Guia Passo a Passo */}
        {isActivityModalOpen && selectedActivity && availableActivities.find(a => a.id === selectedActivity) && (
          <ActivityGuide
            activity={availableActivities.find(a => a.id === selectedActivity)}
            onClose={closeActivityModal}
            onComplete={() => completeActivity(selectedActivity)}
          />
        )}

        {/* Toast de Sucesso */}
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="fixed bottom-8 right-8 z-50"
          >
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-400 p-6 flex items-center space-x-4 min-w-[320px]">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-3xl shadow-lg">
                  {getMoodEmoji(toastMood)}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-lg mb-1">{toastMessage}</h4>
                <p className="text-sm text-gray-600">
                  Você está se sentindo: <span className="font-semibold text-green-600">{getMoodLabel(toastMood)}</span>
                </p>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Confetti ao completar atividade */}
        <Confetti show={showConfetti} />

        {/* Animação de Level Up */}
        {levelUpData && (
          <LevelUpAnimation
            show={showLevelUp}
            level={levelUpData.level}
            levelName={levelUpData.name}
            levelColor={levelUpData.color}
            onClose={() => setShowLevelUp(false)}
          />
        )}

        {/* Onboarding Guide */}
        <OnboardingGuide
          steps={dashboardSteps}
          userId={user?.id}
          storageKey="dashboard-onboarding-completed"
          onComplete={() => console.log('Onboarding completed!')}
        />

        {/* Activity Guide Modal */}
        {isActivityModalOpen && selectedActivity && activities[selectedActivity] && (
          <ActivityGuide
            activity={activities[selectedActivity]}
            onClose={closeActivityModal}
            onComplete={async () => {
              try {
                // Registrar conclusão da atividade no backend
                const response = await fetch(`${API_BASE_URL}/api/activities/complete`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: user.id,
                    activityKey: selectedActivity,
                    activityName: activities[selectedActivity].title
                  })
                });

                const data = await response.json();

                if (data.success) {
                  // Mostrar confete
                  setShowConfetti(true);
                  setTimeout(() => setShowConfetti(false), 4000);

                  // Verificar level up
                  if (data.gamification?.leveledUp) {
                    setLevelUpData({
                      level: data.gamification.newLevel || 1,
                      name: data.gamification.newLevel || 'Iniciante',
                      color: data.gamification.levelColor || 'blue'
                    });
                    setShowLevelUp(true);
                  }

                  console.log('Atividade concluída:', data);
                }
              } catch (error) {
                console.error('Erro ao registrar atividade:', error);
              }
            }}
          />
        )}
      </div>
    </div>
  )
}