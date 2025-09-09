import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Brain, 
  Calendar, 
  TrendingUp, 
  Play, 
  MessageCircle,
  Book,
  Award,
  Clock,
  Sparkles,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { cn, getMoodColor, getMoodEmoji, getMoodLabel } from '@/lib/utils'

const defaultExercises = [
  { id: 1, title: 'Respiração 4-7-8', duration: '5 min', category: 'breathing', completed: false },
  { id: 2, title: 'Meditação Matinal', duration: '10 min', category: 'meditation', completed: true },
  { id: 3, title: 'Diário de Gratidão', duration: '3 min', category: 'journaling', completed: false },
]

const mockData = {
  nextSession: {
    therapist: 'Dr. Maria Silva',
    date: '15 Jan 2025',
    time: '14:00',
    type: 'Terapia Individual'
  },
  user: {
    currentStreak: 7,
    totalSessions: 42
  },
  achievements: [
    { id: 1, title: '7 dias consecutivos', icon: '🔥', unlocked: true },
    { id: 2, title: 'Primeira meditação', icon: '🧘‍♀️', unlocked: true },
    { id: 3, title: '30 dias de jornada', icon: '🌟', unlocked: false },
  ]
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [moodToday, setMoodToday] = useState<number | null>(null)
  const [exercises, setExercises] = useState(defaultExercises)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [, setTotalSessions] = useState(0)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    // Carregar dados do usuário do localStorage
    const userDataKey = `user_data_${user.id}`
    const savedData = localStorage.getItem(userDataKey)
    if (savedData) {
      const data = JSON.parse(savedData)
      setMoodToday(data.moodToday || null)
      setCurrentStreak(data.currentStreak || 0)
      setTotalSessions(data.totalSessions || 0)
    }
  }, [user, navigate])

  const handleMoodSelect = (mood: number) => {
    setMoodToday(mood)
    
    // Salvar no localStorage
    if (user) {
      const userDataKey = `user_data_${user.id}`
      const existingData = JSON.parse(localStorage.getItem(userDataKey) || '{}')
      const updatedData = {
        ...existingData,
        moodToday: mood,
        lastMoodUpdate: new Date().toISOString().split('T')[0]
      }
      localStorage.setItem(userDataKey, JSON.stringify(updatedData))
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) {
    return null
  }

  const toggleExercise = (id: number) => {
    setExercises(prev => prev.map(ex => 
      ex.id === id ? { ...ex, completed: !ex.completed } : ex
    ))
  }

  const completedExercises = exercises.filter(ex => ex.completed).length
  const totalExercises = exercises.length
  const progressPercentage = (completedExercises / totalExercises) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-neutral-800 font-headings">Dashboard</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/chat"
                className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat IA
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Olá, {user.name}! 👋
                </h1>
                <p className="text-primary-100 text-lg">
                  Como você está se sentindo hoje?
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{currentStreak}</div>
                <div className="text-primary-100 text-sm">dias consecutivos</div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mood Tracker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-800 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-primary-500" />
                  Como você está hoje?
                </h2>
                {moodToday && (
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getMoodEmoji(moodToday)}</span>
                    <span className={cn("font-medium", getMoodColor(moodToday))}>
                      {getMoodLabel(moodToday)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((mood) => (
                  <button
                    key={mood}
                    onClick={() => handleMoodSelect(mood)}
                    className={cn(
                      "aspect-square rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center p-2",
                      moodToday === mood
                        ? "border-primary-500 bg-primary-50 scale-105"
                        : "border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                    )}
                  >
                    <span className="text-xl mb-1">{getMoodEmoji(mood)}</span>
                    <span className="text-xs text-gray-600 font-medium">{mood}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Today's Exercises */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-800 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-green-500" />
                  Exercícios de Hoje
                </h2>
                <div className="text-sm text-gray-600">
                  {completedExercises}/{totalExercises} concluídos
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progresso diário</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                      exercise.completed
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleExercise(exercise.id)}
                        className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                          exercise.completed
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 hover:border-green-400"
                        )}
                      >
                        {exercise.completed && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      <div>
                        <h3 className={cn(
                          "font-medium",
                          exercise.completed ? "text-green-800 line-through" : "text-gray-900"
                        )}>
                          {exercise.title}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {exercise.duration}
                        </p>
                      </div>
                    </div>
                    
                    {!exercise.completed && (
                      <button className="flex items-center px-3 py-1 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors">
                        <Play className="w-3 h-3 mr-1" />
                        Iniciar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Next Session */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary-500" />
                Próxima Sessão
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Terapeuta</span>
                  <span className="font-medium">{mockData.nextSession.therapist}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data</span>
                  <span className="font-medium">{mockData.nextSession.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Horário</span>
                  <span className="font-medium">{mockData.nextSession.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo</span>
                  <span className="font-medium">{mockData.nextSession.type}</span>
                </div>
              </div>
              
              <button className="w-full mt-4 bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition-colors">
                Entrar na Sessão
              </button>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                Seu Progresso
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="text-gray-700">Dias consecutivos</span>
                  </div>
                  <span className="text-2xl font-bold text-primary-600">{mockData.user.currentStreak}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Brain className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Total de sessões</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{mockData.user.totalSessions}</span>
                </div>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-amber-500" />
                Conquistas
              </h2>
              
              <div className="space-y-3">
                {mockData.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg",
                      achievement.unlocked ? "bg-amber-50" : "bg-gray-50"
                    )}
                  >
                    <span className={cn(
                      "text-2xl",
                      !achievement.unlocked && "grayscale opacity-50"
                    )}>
                      {achievement.icon}
                    </span>
                    <span className={cn(
                      "font-medium",
                      achievement.unlocked ? "text-amber-800" : "text-gray-500"
                    )}>
                      {achievement.title}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <h2 className="text-lg font-semibold text-neutral-800 mb-4">
                Ações Rápidas
              </h2>
              
              <div className="space-y-3">
                <Link
                  to="/chat"
                  className="flex items-center justify-between p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="w-5 h-5 text-primary-600" />
                    <span className="font-medium text-primary-800">Chat com IA</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary-600 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  to="/diary"
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <Book className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Diário Digital</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-green-600 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}