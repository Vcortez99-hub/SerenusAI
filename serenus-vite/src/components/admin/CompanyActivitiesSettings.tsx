import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Search,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Check,
  AlertCircle,
  Heart,
  Brain,
  Wind,
  Music,
  Book,
  Coffee,
  Moon,
  Sun,
  Activity
} from 'lucide-react'
import { API_BASE_URL } from '@/config/api'

interface Company {
  id: string
  name: string
  domain: string
  plan: string
}

interface WellnessActivity {
  id: string
  title: string
  description: string
  category: 'meditation' | 'breathing' | 'gratitude' | 'journaling' | 'movement' | 'relaxation'
  duration: number
  icon: string
  instructions: string[]
  benefits: string[]
  enabled: boolean
  videoUrl?: string
  richContent?: string
}

interface CompanyActivityConfig {
  company_id: string
  activity_id: string
  enabled: boolean
  customTitle?: string
  customDescription?: string
  customInstructions?: string[]
}

const ACTIVITY_ICONS = {
  meditation: Brain,
  breathing: Wind,
  gratitude: Heart,
  journaling: Book,
  movement: Activity,
  relaxation: Moon
}

const DEFAULT_ACTIVITIES: Omit<WellnessActivity, 'id'>[] = [
  {
    title: 'Meditação Guiada',
    description: 'Pratique mindfulness com exercícios de meditação',
    category: 'meditation',
    duration: 10,
    icon: 'brain',
    instructions: [
      'Encontre um lugar tranquilo',
      'Sente-se confortavelmente',
      'Feche os olhos suavemente',
      'Respire profundamente',
      'Observe seus pensamentos sem julgamento'
    ],
    benefits: ['Reduz ansiedade', 'Melhora foco', 'Aumenta clareza mental'],
    enabled: true
  },
  {
    title: 'Respiração 4-7-8',
    description: 'Técnica de respiração para relaxamento',
    category: 'breathing',
    duration: 5,
    icon: 'wind',
    instructions: [
      'Inspire pelo nariz contando até 4',
      'Segure a respiração por 7 segundos',
      'Expire pela boca contando até 8',
      'Repita 4 vezes'
    ],
    benefits: ['Reduz estresse', 'Melhora sono', 'Acalma sistema nervoso'],
    enabled: true
  },
  {
    title: 'Diário de Gratidão',
    description: 'Liste 3 coisas pelas quais você é grato hoje',
    category: 'gratitude',
    duration: 5,
    icon: 'heart',
    instructions: [
      'Pense em 3 coisas positivas do dia',
      'Escreva por que você é grato por cada uma',
      'Reflita sobre como elas impactaram você',
      'Releia suas anotações anteriores'
    ],
    benefits: ['Aumenta positividade', 'Melhora humor', 'Fortalece relacionamentos'],
    enabled: true
  },
  {
    title: 'Alongamento Rápido',
    description: 'Movimentos suaves para relaxar o corpo',
    category: 'movement',
    duration: 7,
    icon: 'activity',
    instructions: [
      'Alongue pescoço girando suavemente',
      'Estique os braços acima da cabeça',
      'Torça o tronco para os lados',
      'Alongue as pernas'
    ],
    benefits: ['Reduz tensão muscular', 'Melhora postura', 'Aumenta energia'],
    enabled: true
  },
  {
    title: 'Relaxamento Progressivo',
    description: 'Relaxe cada grupo muscular progressivamente',
    category: 'relaxation',
    duration: 15,
    icon: 'moon',
    instructions: [
      'Deite-se confortavelmente',
      'Tensione e relaxe cada grupo muscular',
      'Comece pelos pés e suba até a cabeça',
      'Respire profundamente entre cada grupo'
    ],
    benefits: ['Alivia tensão', 'Melhora qualidade do sono', 'Reduz dor muscular'],
    enabled: true
  },
  {
    title: 'Escrita Terapêutica',
    description: 'Escreva livremente sobre seus sentimentos',
    category: 'journaling',
    duration: 10,
    icon: 'book',
    instructions: [
      'Escreva sem se preocupar com gramática',
      'Expresse seus sentimentos honestamente',
      'Não se censure',
      'Releia depois para reflexão'
    ],
    benefits: ['Processa emoções', 'Aumenta autoconhecimento', 'Reduz estresse'],
    enabled: true
  }
]

export default function CompanyActivitiesSettings() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [activities, setActivities] = useState<WellnessActivity[]>([])
  const [companyConfigs, setCompanyConfigs] = useState<CompanyActivityConfig[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingActivity, setEditingActivity] = useState<WellnessActivity | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Carregar empresas
  useEffect(() => {
    fetchCompanies()
    fetchActivities()
  }, [])

  // Carregar configurações quando empresa for selecionada
  useEffect(() => {
    if (selectedCompany) {
      fetchCompanyConfigs(selectedCompany)
    }
  }, [selectedCompany])

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/companies`)
      const data = await response.json()
      if (data.success) {
        setCompanies(data.companies || [])
        if (data.companies.length > 0) {
          setSelectedCompany(data.companies[0].id)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    }
  }

  const fetchActivities = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/wellness-activities`)
      const data = await response.json()

      if (data.success && data.activities) {
        setActivities(data.activities)
      } else {
        // Se não houver atividades, usar defaults
        setActivities([])
      }
    } catch (error) {
      console.error('Erro ao carregar atividades:', error)
      setActivities([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCompanyConfigs = async (companyId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/company-activities/${companyId}`)
      const data = await response.json()

      if (data.success) {
        setCompanyConfigs(data.configs || [])
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  const isActivityEnabledForCompany = (activityId: string) => {
    const config = companyConfigs.find(c => c.activity_id === activityId)
    return config ? config.enabled : true // Por padrão, atividades estão habilitadas
  }

  const toggleActivity = async (activityId: string) => {
    if (!selectedCompany) return

    const currentlyEnabled = isActivityEnabledForCompany(activityId)

    try {
      const response = await fetch(`${API_BASE_URL}/admin/company-activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: selectedCompany,
          activity_id: activityId,
          enabled: !currentlyEnabled
        })
      })

      const data = await response.json()

      if (data.success) {
        await fetchCompanyConfigs(selectedCompany)
        showNotification('success', `Atividade ${!currentlyEnabled ? 'ativada' : 'desativada'} com sucesso!`)
      }
    } catch (error) {
      console.error('Erro ao alternar atividade:', error)
      showNotification('error', 'Erro ao atualizar atividade')
    }
  }

  const saveActivityCustomization = async (activity: WellnessActivity) => {
    if (!selectedCompany) return

    setIsSaving(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/company-activities/customize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: selectedCompany,
          activity_id: activity.id,
          customTitle: activity.title,
          customDescription: activity.description,
          customInstructions: activity.instructions,
          videoUrl: activity.videoUrl || '',
          richContent: activity.richContent || ''
        })
      })

      const data = await response.json()

      if (data.success) {
        await fetchActivities()
        await fetchCompanyConfigs(selectedCompany)
        setEditingActivity(null)
        showNotification('success', 'Atividade personalizada com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao personalizar atividade:', error)
      showNotification('error', 'Erro ao salvar personalização')
    } finally {
      setIsSaving(false)
    }
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const filteredActivities = activities.filter(activity =>
    activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedCompanyData = companies.find(c => c.id === selectedCompany)

  return (
    <div className="space-y-6">
      {/* Notificação */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
              notification.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {notification.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Configuração de Atividades
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gerencie as atividades de bem-estar disponíveis para cada empresa
            </p>
          </div>
        </div>

        {/* Seletor de Empresa */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Selecione a Empresa
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Selecione uma empresa...</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name} ({company.plan})
                  </option>
                ))}
              </select>
            </div>
            {selectedCompanyData && (
              <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  Plano: {selectedCompanyData.plan}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lista de Atividades */}
      {selectedCompany && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          {/* Barra de busca */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar atividades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Grid de Atividades */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActivities.map(activity => {
              const Icon = ACTIVITY_ICONS[activity.category]
              const isEnabled = isActivityEnabledForCompany(activity.id)

              return (
                <motion.div
                  key={activity.id}
                  layout
                  className={`relative p-4 border-2 rounded-lg transition-all ${
                    isEnabled
                      ? 'border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-700'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-60'
                  }`}
                >
                  {/* Toggle */}
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => toggleActivity(activity.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-3 mb-3 pr-12">
                    <div className={`p-2 rounded-lg ${
                      isEnabled
                        ? 'bg-indigo-100 dark:bg-indigo-900/30'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        isEnabled
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-500'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {activity.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {activity.duration} min • {activity.category}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {activity.description}
                  </p>

                  {/* Benefits */}
                  <div className="space-y-1 mb-3">
                    {activity.benefits.slice(0, 2).map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Check className="w-3 h-3 text-green-500" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => setEditingActivity(activity)}
                    disabled={!isEnabled}
                    className="w-full px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Personalizar
                  </button>
                </motion.div>
              )
            })}
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? 'Nenhuma atividade encontrada' : 'Nenhuma atividade disponível'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal de Edição */}
      <AnimatePresence>
        {editingActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setEditingActivity(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Personalizar Atividade
                  </h3>
                  <button
                    onClick={() => setEditingActivity(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={editingActivity.title}
                    onChange={(e) => setEditingActivity({ ...editingActivity, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={editingActivity.description}
                    onChange={(e) => setEditingActivity({ ...editingActivity, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Instruções */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Instruções
                  </label>
                  <div className="space-y-2">
                    {editingActivity.instructions.map((instruction, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={instruction}
                          onChange={(e) => {
                            const newInstructions = [...editingActivity.instructions]
                            newInstructions[index] = e.target.value
                            setEditingActivity({ ...editingActivity, instructions: newInstructions })
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => {
                            const newInstructions = editingActivity.instructions.filter((_, i) => i !== index)
                            setEditingActivity({ ...editingActivity, instructions: newInstructions })
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setEditingActivity({
                          ...editingActivity,
                          instructions: [...editingActivity.instructions, '']
                        })
                      }}
                      className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar instrução
                    </button>
                  </div>
                </div>

                {/* URL de Vídeo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL do Vídeo (opcional)
                  </label>
                  <input
                    type="url"
                    value={editingActivity.videoUrl || ''}
                    onChange={(e) => setEditingActivity({ ...editingActivity, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Cole o link do YouTube, Vimeo ou outro serviço de vídeo
                  </p>
                </div>

                {/* Conteúdo Rico */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Conteúdo Adicional (opcional)
                  </label>
                  <textarea
                    value={editingActivity.richContent || ''}
                    onChange={(e) => setEditingActivity({ ...editingActivity, richContent: e.target.value })}
                    rows={4}
                    placeholder="Adicione textos motivacionais, dicas extras, links úteis..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Use para adicionar informações extras, frases motivacionais ou links de recursos
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setEditingActivity(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => saveActivityCustomization(editingActivity)}
                  disabled={isSaving}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
