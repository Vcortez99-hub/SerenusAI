import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Smile,
  Meh,
  Frown,
  Search,
  ArrowLeft,
  Edit3,
  Edit,
  Trash2,
  BookOpen,
  TrendingUp,
  Star,
  BarChart3,
  Sparkles
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn, formatDate, formatTime, moodScoreToCategory, moodCategoryToScore, getMoodScoreLabel, convertDiaryMoodToDashboard, type MoodCategory, type MoodScore } from '@/lib/utils'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { OpenAIService } from '../services/openai'
import { diaryApiService } from '../services/diary-api'
import { encryptionService } from '../services/encryption'
import { VoiceAssistant } from '../components/ai/VoiceAssistant'
import { useGamification } from '../contexts/GamificationContext'
import { Toast, ToastType } from '@/components/ui/Toast'

interface DiaryEntry {
  id: string
  date: Date
  mood: 'happy' | 'neutral' | 'sad'
  moodScore?: MoodScore  // Compatibilidade com sistema numérico
  title: string
  content: string
  tags: string[]
  gratitude?: string[]
  createdAt?: string
  updatedAt?: string
}



const moodIcons = {
  happy: { icon: Smile, color: 'text-green-500', bg: 'bg-green-100' },
  neutral: { icon: Meh, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  sad: { icon: Frown, color: 'text-red-500', bg: 'bg-red-100' }
}

const moodLabels = {
  happy: 'Feliz',
  neutral: 'Neutro',
  sad: 'Triste'
}

// Mapeamento simplificado - apenas 3 opções
const moodOptions = [
  { category: 'sad' as MoodCategory, score: 2, emoji: '😔', label: 'Triste' },
  { category: 'neutral' as MoodCategory, score: 3, emoji: '😐', label: 'Neutro' },
  { category: 'happy' as MoodCategory, score: 4, emoji: '😊', label: 'Feliz' }
]

// Função para saudação baseada no horário de São Paulo
const getGreeting = () => {
  const saoPauloTime = new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
  const hour = new Date(saoPauloTime).getHours()

  if (hour >= 5 && hour < 12) return 'Bom dia'
  if (hour >= 12 && hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default function Diary() {
  const { user } = useAuth()
  const { moodTheme, setMoodTheme } = useTheme()
  const { addXp } = useGamification()
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMood, setSelectedMood] = useState<string>('all')
  const [showNewEntryForm, setShowNewEntryForm] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: 'neutral' as 'happy' | 'neutral' | 'sad',
    moodScore: 3 as MoodScore,
    tags: [] as string[],
    gratitude: [] as string[]
  })
  const [isSaving, setIsSaving] = useState(false)
  const submissionLock = React.useRef(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  })

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, isVisible: true })
  }

  // Carregar entradas do localStorage e WhatsApp quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      loadAllEntries()
    }
  }, [user])

  // Função para carregar todas as entradas do servidor (API)
  const loadAllEntries = async () => {
    if (!user) return

    try {
      setIsLoading(true)

      try {
        const serverEntries = await diaryApiService.getAllEntries(user.id)
        const convertedEntries = await Promise.all(serverEntries.map(async entry => {
          const frontendEntry = diaryApiService.convertToFrontendEntry(entry)
          // Ensure moodScore is typed correctly
          if (frontendEntry.moodScore) {
            frontendEntry.moodScore = frontendEntry.moodScore as MoodScore
          }

          // Descriptografar conteúdo se estiver criptografado
          if (encryptionService.isEncrypted(frontendEntry.content)) {
            try {
              frontendEntry.content = await encryptionService.decrypt(frontendEntry.content, user.id)

              // Regenerar título se ele não veio do servidor ou se parece ser gerado de conteúdo criptografado
              // Se o título original for igual ao gerado do conteúdo criptografado (que seria o caso se serverEntry.title fosse nulo)
              // então regeneramos com o conteúdo descriptografado
              if (!entry.title) {
                const words = frontendEntry.content.trim().split(' ')
                const title = words.slice(0, 6).join(' ')
                frontendEntry.title = title.length > 50 ? title.substring(0, 47) + '...' : title
              }
            } catch (error) {
              console.warn('Erro ao descriptografar entrada:', error)
            }
          }

          return frontendEntry
        }))

        // Ordenar por data (mais recente primeiro)
        convertedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        // Remover duplicatas (mesmo conteúdo e mesmo dia)
        const uniqueEntries: DiaryEntry[] = []
        const seenSignatures = new Set<string>()

        for (const entry of convertedEntries) {
          // Assinatura baseada em título, conteúdo e data (dia)
          // Isso evita que entradas duplicadas por erro de rede/clique duplo apareçam
          const dateStr = entry.date.toISOString().split('T')[0]
          const signature = `${entry.title.trim()}|${entry.content.trim()}|${dateStr}`

          if (!seenSignatures.has(signature)) {
            seenSignatures.add(signature)
            uniqueEntries.push(entry as DiaryEntry)
          }
        }

        setEntries(uniqueEntries)
      } catch (apiError) {
        console.warn('Erro ao carregar entradas da API:', apiError)
        setEntries([])
      }
    } catch (error) {
      console.error('Erro ao carregar entradas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Salvar entradas localmente (sincronização)
  const saveLocalEntries = (localEntries: DiaryEntry[]) => {
    if (user) {
      const diaryKey = `diary_entries_${user.id}`
      localStorage.setItem(diaryKey, JSON.stringify(localEntries))
    }
  }

  // Salvar entradas e sincronizar com Dashboard
  const saveEntries = (updatedEntries: DiaryEntry[]) => {
    if (user) {
      // Salvar apenas entradas locais no localStorage
      saveLocalEntries(updatedEntries)

      // Sincronizar com dados do Dashboard (todas as entradas)
      const userDataKey = `user_data_${user.id}`
      const savedUserData = localStorage.getItem(userDataKey)
      if (savedUserData) {
        const userData = JSON.parse(savedUserData)

        // Atualizar histórico de humor no Dashboard
        const moodHistory = updatedEntries.map(entry => {
          const diaryMoodScore = entry.moodScore || moodCategoryToScore(entry.mood)
          return {
            date: entry.date.toISOString().split('T')[0],
            mood: convertDiaryMoodToDashboard(diaryMoodScore),
            time: entry.date.toTimeString().slice(0, 5)
          }
        })

        const updatedUserData = {
          ...userData,
          moodHistory: moodHistory
        }

        localStorage.setItem(userDataKey, JSON.stringify(updatedUserData))
      }

      setEntries(updatedEntries)
    }
  }

  // Adicionar nova entrada
  const handleAddEntry = async () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      showToast('Por favor, preencha o título e o conteúdo da entrada.', 'error')
      return
    }

    if (!user) {
      showToast('Usuário não autenticado.', 'error')
      return
    }

    if (isSaving || submissionLock.current) return

    try {
      setIsSaving(true)
      submissionLock.current = true
      const moodScore = moodCategoryToScore(newEntry.mood)

      // Criptografar conteúdo antes de salvar
      const encryptedContent = await encryptionService.encrypt(newEntry.content, user.id)

      // Salvar na API do servidor
      await diaryApiService.createEntry({
        userId: user.id,
        userName: user.name,
        userPhone: user.phone || '',
        title: newEntry.title,
        content: encryptedContent,
        mood: newEntry.mood,
        moodScore: moodScore,
        tags: newEntry.tags,
        gratitude: newEntry.gratitude
      })

      // Recarregar entradas após salvar
      await loadAllEntries()

      // Award XP
      addXp(50, 'Nova entrada no diário')

      // Resetar formulário
      setNewEntry({
        title: '',
        content: '',
        mood: 'neutral',
        moodScore: 5 as MoodScore,
        tags: [],
        gratitude: []
      })
      setShowNewEntryForm(false)

      showToast('Entrada salva com sucesso!', 'success')
    } catch (error) {
      console.error('Erro ao salvar entrada:', error)
      showToast('Erro ao salvar entrada. Tente novamente.', 'error')
    } finally {
      setIsSaving(false)
      submissionLock.current = false
    }
  }

  // Excluir entrada
  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta entrada?')) {
      return
    }

    try {
      // Excluir do servidor (com verificação de propriedade)
      await diaryApiService.deleteEntry(id, user.id)

      // Atualizar lista local
      const updatedEntries = entries.filter(entry => entry.id !== id)
      setEntries(updatedEntries)
      saveLocalEntries(updatedEntries)
      setSelectedEntry(null)

      showToast('Entrada excluída com sucesso!', 'success')
    } catch (error) {
      console.error('Erro ao excluir entrada:', error)
      showToast('Erro ao excluir entrada. Tente novamente.', 'error')
    }
  }

  // Iniciar edição
  const startEditEntry = (entry: DiaryEntry) => {
    setEditingEntry(entry)
    setSelectedEntry(null)
  }

  // Salvar edição
  const handleSaveEdit = () => {
    if (!editingEntry || !editingEntry.title.trim() || !editingEntry.content.trim()) {
      showToast('Por favor, preencha o título e o conteúdo da entrada.', 'error')
      return
    }

    const moodScore = moodCategoryToScore(editingEntry.mood)
    const updatedEntry = {
      ...editingEntry,
      moodScore: moodScore
    }

    const updatedEntries = entries.map(entry =>
      entry.id === editingEntry.id ? updatedEntry : entry
    )
    saveEntries(updatedEntries)
    setEditingEntry(null)
  }

  // Cancelar edição
  const cancelEdit = () => {
    setEditingEntry(null)
  }

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMood = selectedMood === 'all' || entry.mood === selectedMood
    return matchesSearch && matchesMood
  })

  const getMoodStats = () => {
    const total = entries.length
    const happy = entries.filter(e => e.mood === 'happy').length
    const neutral = entries.filter(e => e.mood === 'neutral').length
    const sad = entries.filter(e => e.mood === 'sad').length

    return {
      happy: Math.round((happy / total) * 100),
      neutral: Math.round((neutral / total) * 100),
      sad: Math.round((sad / total) * 100)
    }
  }

  const stats = getMoodStats()

  // Função para gerar análise do diário
  const generateDiaryAnalysis = async () => {
    if (entries.length === 0) {
      setAnalysisResult('Você ainda não possui entradas suficientes para uma análise completa. Continue registrando seus sentimentos e experiências para obter insights mais detalhados! 📝')
      return
    }

    setIsAnalyzing(true)

    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY
      if (!apiKey) {
        throw new Error('API Key não configurada')
      }

      const openAIService = new OpenAIService(apiKey)

      // Preparar dados do diário para análise
      const diaryData = entries.map(entry => ({
        date: entry.date.toLocaleDateString('pt-BR'),
        mood: moodLabels[entry.mood],
        title: entry.title,
        content: entry.content,
        tags: entry.tags,
        gratitude: entry.gratitude
      }))

      const analysisPrompt = `Como especialista em análise comportamental e bem-estar emocional, analise o diário emocional abaixo e forneça insights detalhados sobre:

1. **Padrões Emocionais**: Identifique tendências de humor e momentos de picos altos/baixos
2. **Gatilhos e Motivadores**: O que parece influenciar positiva ou negativamente o estado emocional
3. **Evolução Temporal**: Como os sentimentos mudaram ao longo do tempo
4. **Pontos de Atenção**: Aspectos que merecem cuidado ou acompanhamento
5. **Recomendações**: Sugestões práticas para melhorar o bem-estar emocional

Dados do diário (${entries.length} entradas):
${JSON.stringify(diaryData, null, 2)}

Estatísticas de humor:
- Dias felizes: ${stats.happy}%
- Dias neutros: ${stats.neutral}%
- Dias tristes: ${stats.sad}%

Forneça uma análise empática, construtiva e orientada para o crescimento pessoal. Use linguagem acolhedora e evite julgamentos.`

      const analysis = await openAIService.generateResponse(analysisPrompt)
      setAnalysisResult(analysis)
    } catch (error) {
      console.error('Erro ao gerar análise:', error)
      setAnalysisResult('Não foi possível gerar a análise no momento. Tente novamente mais tarde ou verifique sua conexão com a internet. 🔄')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Função para abrir modal de análise
  const handleOpenAnalysis = () => {
    setShowAnalysisModal(true)
    if (!analysisResult && !isAnalyzing) {
      generateDiaryAnalysis()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900">Diário Emocional</h1>
                  <p className="text-sm text-gray-600">Registre seus sentimentos</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleOpenAnalysis}
                disabled={entries.length === 0}
                className={cn(
                  "hidden sm:flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 shadow-sm text-sm",
                  entries.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700"
                )}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden md:inline">Análise do meu Diário</span>
                <span className="md:hidden">Análise</span>
              </button>

              <button
                onClick={() => setShowNewEntryForm(true)}
                className="flex items-center space-x-2 bg-primary-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nova Entrada</span>
                <span className="sm:hidden">Novo</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Filtros</h3>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar entradas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Mood Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Humor</label>
                <select
                  value={selectedMood}
                  onChange={(e) => setSelectedMood(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">Todos</option>
                  <option value="happy">Feliz</option>
                  <option value="neutral">Neutro</option>
                  <option value="sad">Triste</option>
                </select>
              </div>
            </div>

            {/* Mood Statistics */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-primary-500" />
                Estatísticas
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm text-gray-700">Feliz</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{stats.happy}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <span className="text-sm text-gray-700">Neutro</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{stats.neutral}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-sm text-gray-700">Triste</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{stats.sad}%</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-2">Total de Entradas</h3>
              <p className="text-3xl font-bold">{entries.length}</p>
              <p className="text-primary-100 text-sm mt-1">Registros salvos</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedEntry ? (
              /* Entry Detail View */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setSelectedEntry(null)}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Voltar</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          startEditEntry(selectedEntry)
                        }}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteEntry(selectedEntry.id)
                        }}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-4">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      moodIcons[selectedEntry.mood].bg
                    )}>
                      {React.createElement(moodIcons[selectedEntry.mood].icon, {
                        className: cn("w-6 h-6", moodIcons[selectedEntry.mood].color)
                      })}
                    </div>

                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{selectedEntry.title}</h1>
                      <p className="text-gray-600">
                        {selectedEntry.date.toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">{selectedEntry.content}</p>
                  </div>

                  {selectedEntry.gratitude && selectedEntry.gratitude.length > 0 && (
                    <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <h3 className="font-semibold text-amber-800 mb-3 flex items-center">
                        <Star className="w-4 h-4 mr-2" />
                        Gratidão
                      </h3>
                      <ul className="space-y-1">
                        {selectedEntry.gratitude.map((item, index) => (
                          <li key={index} className="text-amber-700 text-sm">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              /* Entries List */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Suas Entradas ({filteredEntries.length})
                  </h2>
                  <button
                    onClick={() => setShowNewEntryForm(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Entrada
                  </button>
                </div>

                <div className="grid gap-6">
                  <AnimatePresence>
                    {filteredEntries.map((entry) => {
                      const MoodIcon = moodIcons[entry.mood].icon

                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <div className="flex items-start space-x-4">
                            <div className={cn(
                              "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                              moodIcons[entry.mood].bg
                            )}>
                              <MoodIcon className={cn("w-6 h-6", moodIcons[entry.mood].color)} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 truncate">{entry.title}</h3>
                                </div>
                                <span className="text-sm text-gray-500 flex-shrink-0">
                                  {entry.date.toLocaleDateString('pt-BR')}
                                </span>
                              </div>

                              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                {entry.content}
                              </p>

                              <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-1">
                                  {entry.tags.slice(0, 3).map((tag, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                  {entry.tags.length > 3 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                      +{entry.tags.length - 3}
                                    </span>
                                  )}
                                </div>

                                <span className={cn(
                                  "px-2 py-1 rounded-full text-xs font-medium",
                                  moodIcons[entry.mood].bg,
                                  moodIcons[entry.mood].color
                                )}>
                                  {moodLabels[entry.mood]}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>

                  {filteredEntries.length === 0 && (
                    <div className="text-center py-12">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma entrada encontrada</h3>
                      <p className="text-gray-600 mb-4">
                        {searchTerm || selectedMood !== 'all'
                          ? 'Tente ajustar os filtros de busca'
                          : 'Comece criando sua primeira entrada no diário'
                        }
                      </p>
                      {!searchTerm && selectedMood === 'all' && (
                        <button
                          onClick={() => setShowNewEntryForm(true)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Nova Entrada
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Nova Entrada */}
      <AnimatePresence>
        {showNewEntryForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowNewEntryForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">{getGreeting()}! Nova Entrada no Diário</h2>
                <button
                  onClick={() => setShowNewEntryForm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                    placeholder="Como foi seu dia?"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Humor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Como você se sente?
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {moodOptions.map((option) => (
                      <button
                        key={option.score}
                        type="button"
                        onClick={() => {
                          setNewEntry({
                            ...newEntry,
                            mood: option.category,
                            moodScore: option.score as MoodScore
                          })
                          // Update global theme based on mood
                          if (option.category === 'happy') setMoodTheme('energetic')
                          else if (option.category === 'sad') setMoodTheme('melancholic')
                          else setMoodTheme('calm')
                        }}
                        className={cn(
                          "flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105",
                          newEntry.moodScore === option.score
                            ? "border-blue-500 bg-blue-50 scale-105 shadow-lg"
                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                        )}
                      >
                        <span className="text-2xl mb-1">{option.emoji}</span>
                        <span className="text-xs text-gray-600 font-medium text-center">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conteúdo */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Conte sobre seu dia
                    </label>
                    <VoiceAssistant
                      onTranscript={(text) => setNewEntry(prev => ({
                        ...prev,
                        content: prev.content + (prev.content ? ' ' : '') + text
                      }))}
                    />
                  </div>
                  <textarea
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                    placeholder="Descreva seus pensamentos, sentimentos e experiências... (ou use o microfone para ditar)"
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="trabalho, família, saúde (separadas por vírgula)"
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                      setNewEntry({ ...newEntry, tags })
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Gratidão */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gratidão (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Pelo que você é grato hoje? (separado por vírgula)"
                    onChange={(e) => {
                      const gratitude = e.target.value.split(',').map(item => item.trim()).filter(item => item)
                      setNewEntry({ ...newEntry, gratitude })
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Botões */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowNewEntryForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddEntry}
                    disabled={isSaving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Entrada'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Edição de Entrada */}
      <AnimatePresence>
        {editingEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={cancelEdit}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Editar Entrada</h2>
                <button
                  onClick={cancelEdit}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={editingEntry.title}
                    onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
                    placeholder="Como foi seu dia?"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Humor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Como você se sente?
                  </label>
                  <div className="grid grid-cols-5 gap-2 sm:gap-3">
                    {moodOptions.map((option) => (
                      <button
                        key={option.score}
                        type="button"
                        onClick={() => setEditingEntry({
                          ...editingEntry,
                          mood: option.category,
                          moodScore: option.score as MoodScore
                        })}
                        className={cn(
                          "flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105",
                          editingEntry.moodScore === option.score
                            ? "border-blue-500 bg-blue-50 scale-105 shadow-lg"
                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                        )}
                      >
                        <span className="text-2xl mb-1">{option.emoji}</span>
                        <span className="text-xs text-gray-600 font-medium text-center">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conteúdo */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Conte sobre seu dia
                    </label>
                    <VoiceAssistant
                      onTranscript={(text) => setEditingEntry(prev => prev ? ({
                        ...prev,
                        content: prev.content + (prev.content ? ' ' : '') + text
                      }) : null)}
                    />
                  </div>
                  <textarea
                    value={editingEntry.content}
                    onChange={(e) => setEditingEntry({ ...editingEntry, content: e.target.value })}
                    placeholder="Descreva seus pensamentos, sentimentos e experiências..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (opcional)
                  </label>
                  <input
                    type="text"
                    value={editingEntry.tags.join(', ')}
                    placeholder="trabalho, família, saúde (separadas por vírgula)"
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                      setEditingEntry({ ...editingEntry, tags })
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Gratidão */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gratidão (opcional)
                  </label>
                  <input
                    type="text"
                    value={editingEntry.gratitude?.join(', ') || ''}
                    placeholder="Pelo que você é grato hoje? (separado por vírgula)"
                    onChange={(e) => {
                      const gratitude = e.target.value.split(',').map(item => item.trim()).filter(item => item)
                      setEditingEntry({ ...editingEntry, gratitude })
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Botões */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Análise do Diário */}
      <AnimatePresence>
        {showAnalysisModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAnalysisModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Análise do seu Diário</h2>
                    <p className="text-sm text-gray-600">Insights baseados em {entries.length} entrada{entries.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAnalysisModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Estatísticas Rápidas */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.happy}%</div>
                    <div className="text-xs sm:text-sm text-green-700">Dias Felizes</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.neutral}%</div>
                    <div className="text-xs sm:text-sm text-yellow-700">Dias Neutros</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.sad}%</div>
                    <div className="text-xs sm:text-sm text-red-700">Dias Tristes</div>
                  </div>
                </div>

                {/* Resultado da Análise */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Análise Detalhada</h3>
                  </div>

                  {isAnalyzing ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Analisando seu diário...</p>
                        <p className="text-sm text-gray-500 mt-2">Isso pode levar alguns segundos</p>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {analysisResult || 'Clique em "Gerar Nova Análise" para obter insights sobre seu diário.'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Botões de Ação */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setAnalysisResult('')
                      generateDiaryAnalysis()
                    }}
                    disabled={isAnalyzing || entries.length === 0}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors",
                      isAnalyzing || entries.length === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    )}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isAnalyzing ? 'Analisando...' : 'Gerar Nova Análise'}</span>
                  </button>

                  <button
                    onClick={() => setShowAnalysisModal(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  )
}