// Serviço para integração com a API do diário WhatsApp
import { API_BASE_URL, API_FULL_URL } from '@/config/api'

interface WhatsAppDiaryEntry {
  id: string
  content: string
  whatsappNumber: string
  timestamp: string
  createdAt: string
  updatedAt: string
  metadata: {
    phoneNumberId: string
    displayPhoneNumber: string
  }
}

interface DiaryApiResponse {
  success: boolean
  entries: WhatsAppDiaryEntry[]
  total: number
  error?: string
  details?: string
}

interface DiaryStats {
  totalEntries: number
  uniqueUsers: number
  lastEntry: {
    date: string
    preview: string
  } | null
}

interface DiaryStatsResponse {
  success: boolean
  stats: DiaryStats
  error?: string
  details?: string
}

interface CreateDiaryEntryData {
  userId: string
  userName: string
  userPhone: string
  title: string
  content: string
  mood: 'happy' | 'neutral' | 'sad'
  moodScore: number
  tags: string[]
  gratitude: string[]
}

class DiaryApiService {
  private baseUrl: string

  constructor() {
    // URL do servidor backend - usar configuração centralizada
    this.baseUrl = API_BASE_URL
  }

  /**
   * Cria uma nova entrada no diário
   */
  async createEntry(entryData: CreateDiaryEntryData): Promise<WhatsAppDiaryEntry> {
    try {
      const response = await fetch(`${this.baseUrl}/diary-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erro ao criar entrada')
      }

      return data.entry
    } catch (error) {
      console.error('Erro ao criar entrada do diário:', error)
      throw error
    }
  }

  /**
   * Busca todas as entradas do diário (APENAS DO USUÁRIO LOGADO)
   */
  async getAllEntries(userId: string): Promise<WhatsAppDiaryEntry[]> {
    try {
      const response = await fetch(`${this.baseUrl}/diary-entries?userId=${encodeURIComponent(userId)}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: DiaryApiResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erro ao buscar entradas')
      }

      return data.entries
    } catch (error) {
      console.error('Erro ao buscar entradas do diário:', error)
      throw error
    }
  }

  /**
   * Busca entradas por data específica (APENAS DO USUÁRIO LOGADO)
   */
  async getEntriesByDate(date: string, userId: string): Promise<WhatsAppDiaryEntry[]> {
    try {
      const response = await fetch(`${this.baseUrl}/diary-entries/date/${date}?userId=${encodeURIComponent(userId)}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: DiaryApiResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erro ao buscar entradas por data')
      }

      return data.entries
    } catch (error) {
      console.error('Erro ao buscar entradas por data:', error)
      throw error
    }
  }

  /**
   * Busca estatísticas do diário
   */
  async getStats(): Promise<DiaryStats> {
    try {
      const response = await fetch(`${this.baseUrl}/diary-stats`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: DiaryStatsResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erro ao buscar estatísticas')
      }

      return data.stats
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      throw error
    }
  }

  /**
   * Exclui uma entrada do diário (APENAS PRÓPRIAS ENTRADAS)
   */
  async deleteEntry(entryId: string, userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/diary-entries/${entryId}?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erro ao excluir entrada')
      }
    } catch (error) {
      console.error('Erro ao excluir entrada do diário:', error)
      throw error
    }
  }

  /**
   * Converte entrada do servidor para formato do frontend
   */
  convertToFrontendEntry(serverEntry: WhatsAppDiaryEntry) {
    return {
      id: serverEntry.id,
      date: new Date(serverEntry.timestamp),
      title: this.generateTitleFromContent(serverEntry.content),
      content: serverEntry.content,
      mood: this.analyzeMoodFromContent(serverEntry.content),
      moodScore: this.getMoodScoreFromContent(serverEntry.content),
      tags: this.extractTagsFromContent(serverEntry.content),
      gratitude: [],
      createdAt: serverEntry.createdAt,
      updatedAt: serverEntry.updatedAt
    }
  }

  /**
   * Gera um título baseado no conteúdo
   */
  private generateTitleFromContent(content: string): string {
    // Pegar as primeiras palavras como título
    const words = content.trim().split(' ')
    const title = words.slice(0, 6).join(' ')
    return title.length > 50 ? title.substring(0, 47) + '...' : title
  }

  /**
   * Analisa o humor baseado no conteúdo (análise simples)
   */
  private analyzeMoodFromContent(content: string): 'happy' | 'neutral' | 'sad' {
    const lowerContent = content.toLowerCase()
    
    // Palavras positivas
    const positiveWords = ['feliz', 'alegre', 'bem', 'ótimo', 'bom', 'excelente', 'maravilhoso', 'incrível', 'amor', 'gratidão', 'obrigado', 'sucesso', 'vitória']
    // Palavras negativas
    const negativeWords = ['triste', 'mal', 'ruim', 'péssimo', 'terrível', 'horrível', 'deprimido', 'ansioso', 'preocupado', 'medo', 'raiva', 'frustrado']
    
    let positiveCount = 0
    let negativeCount = 0
    
    positiveWords.forEach(word => {
      if (lowerContent.includes(word)) positiveCount++
    })
    
    negativeWords.forEach(word => {
      if (lowerContent.includes(word)) negativeCount++
    })
    
    if (positiveCount > negativeCount) return 'happy'
    if (negativeCount > positiveCount) return 'sad'
    return 'neutral'
  }

  /**
   * Converte humor para score numérico
   */
  private getMoodScoreFromContent(content: string): number {
    const mood = this.analyzeMoodFromContent(content)
    switch (mood) {
      case 'sad': return 2
      case 'neutral': return 3
      case 'happy': return 4
      default: return 3
    }
  }

  /**
   * Extrai tags do conteúdo
   */
  private extractTagsFromContent(content: string): string[] {
    const tags: string[] = []
    const lowerContent = content.toLowerCase()
    
    // Tags baseadas em palavras-chave
    const tagMap = {
      'trabalho': ['trabalho', 'emprego', 'escritório', 'reunião', 'projeto'],
      'família': ['família', 'pai', 'mãe', 'filho', 'filha', 'irmão', 'irmã'],
      'amor': ['amor', 'namorado', 'namorada', 'marido', 'esposa', 'relacionamento'],
      'saúde': ['saúde', 'médico', 'hospital', 'exercício', 'academia'],
      'estudos': ['estudo', 'escola', 'universidade', 'prova', 'curso'],
      'viagem': ['viagem', 'férias', 'passeio', 'turismo'],
      'amigos': ['amigo', 'amiga', 'encontro', 'festa']
    }
    
    Object.entries(tagMap).forEach(([tag, keywords]) => {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        tags.push(tag)
      }
    })
    
    return tags.slice(0, 3) // Limitar a 3 tags
  }

  /**
   * Verifica se o servidor está online
   */
  async checkServerStatus(): Promise<boolean> {
    try {
      const response = await fetch(`/health`)
      return response.ok
    } catch (error) {
      return false
    }
  }
}

export const diaryApiService = new DiaryApiService()
export type { WhatsAppDiaryEntry, DiaryApiResponse, DiaryStats, CreateDiaryEntryData }