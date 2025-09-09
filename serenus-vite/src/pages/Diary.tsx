import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Smile, 
  Meh, 
  Frown, 
  Search,
  ArrowLeft,
  Edit3,
  Trash2,
  BookOpen,
  TrendingUp,
  Star
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface DiaryEntry {
  id: string
  date: Date
  mood: 'happy' | 'neutral' | 'sad'
  title: string
  content: string
  tags: string[]
  gratitude?: string[]
}

const mockEntries: DiaryEntry[] = [
  {
    id: '1',
    date: new Date('2024-01-15'),
    mood: 'happy',
    title: 'Um dia produtivo',
    content: 'Hoje consegui completar todas as tarefas que havia planejado. Me senti muito realizado e motivado para continuar trabalhando nos meus objetivos.',
    tags: ['trabalho', 'produtividade', 'motivação'],
    gratitude: ['Pela saúde', 'Pelo trabalho', 'Pela família']
  },
  {
    id: '2',
    date: new Date('2024-01-14'),
    mood: 'neutral',
    title: 'Reflexões sobre o futuro',
    content: 'Passei o dia pensando sobre os próximos passos na minha carreira. Ainda não tenho certeza do caminho, mas sei que estou no processo certo.',
    tags: ['carreira', 'reflexão', 'futuro'],
    gratitude: ['Pelas oportunidades', 'Pelo aprendizado']
  },
  {
    id: '3',
    date: new Date('2024-01-13'),
    mood: 'sad',
    title: 'Dia desafiador',
    content: 'Enfrentei algumas dificuldades hoje que me deixaram um pouco para baixo. Mas sei que isso faz parte do processo de crescimento.',
    tags: ['desafios', 'crescimento', 'superação'],
    gratitude: ['Pelo apoio dos amigos']
  }
]

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

export default function Diary() {
  const [entries] = useState<DiaryEntry[]>(mockEntries)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMood, setSelectedMood] = useState<string>('all')
  const [, setShowNewEntryForm] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null)

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
            
            <button
              onClick={() => setShowNewEntryForm(true)}
              className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Entrada</span>
            </button>
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
                      <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg">
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
                                <h3 className="font-semibold text-gray-900 truncate">{entry.title}</h3>
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
                          className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                        >
                          Criar Primeira Entrada
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
    </div>
  )
}