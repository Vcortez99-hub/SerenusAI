import { API_BASE_URL } from '@/config/api';

export interface BurnoutPrediction {
  success: boolean;
  userId: string;
  userName: string;
  burnoutScore: number;
  riskLevel: 'baixo' | 'médio' | 'alto' | 'crítico';
  prediction: string;
  details: {
    trend: {
      direction: 'improving' | 'stable' | 'declining';
      strength: number;
      description: string;
    };
    weekdayPatterns: {
      bestDay: string;
      worstDay: string;
    };
    predictions: Array<{
      date: string;
      dayOfWeek: string;
      predictedMood: number;
      confidence: number;
      risk: 'low' | 'medium' | 'high';
      riskMessage: string;
    }>;
    warnings: Array<{
      type: string;
      severity: 'high' | 'medium' | 'low';
      message: string;
      recommendation: string;
    }>;
  };
  timestamp: string;
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  action: string;
  title: string;
  description: string;
  icon: string;
  type: 'support' | 'breathing' | 'meditation' | 'journaling' | 'general';
  time: string;
  duration: string;
}

export interface RecommendationsResponse {
  success: boolean;
  userId: string;
  userName: string;
  currentMood: number;
  recommendations: Recommendation[];
  totalRecommendations: number;
  timestamp: string;
}

export interface Insight {
  type: 'positive' | 'warning' | 'alert' | 'info';
  title: string;
  message: string;
  icon: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  action?: {
    type: string;
    label: string;
  };
}

export interface InsightsResponse {
  success: boolean;
  userId: string;
  userName: string;
  insights: Insight[];
  totalInsights: number;
  dataPoints: number;
  timestamp: string;
}

export interface GroupPrediction {
  userId: string;
  name: string;
  email: string;
  avgPredictedMood: number;
  highRiskDays: number;
  trend: 'improving' | 'stable' | 'declining';
  warningCount: number;
  needsAttention: boolean;
}

export interface GroupPredictionResponse {
  success: boolean;
  totalUsers: number;
  usersNeedingAttention: number;
  predictions: GroupPrediction[];
  timestamp: string;
}

/**
 * Serviço de API para IA Preditiva
 */
class AIService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/ai`;
  }

  /**
   * Prediz probabilidade de burnout para um usuário
   */
  async predictBurnout(userId: string): Promise<BurnoutPrediction> {
    try {
      const response = await fetch(`${this.baseURL}/predict-burnout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao prever burnout: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Erro ao prever burnout:', error);
      throw error;
    }
  }

  /**
   * Gera recomendações personalizadas
   */
  async getRecommendations(userId: string): Promise<RecommendationsResponse> {
    try {
      const response = await fetch(`${this.baseURL}/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao obter recomendações: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Erro ao obter recomendações:', error);
      throw error;
    }
  }

  /**
   * Gera insights automáticos
   */
  async getInsights(userId: string): Promise<InsightsResponse> {
    try {
      const response = await fetch(`${this.baseURL}/insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao obter insights: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Erro ao obter insights:', error);
      throw error;
    }
  }

  /**
   * Prediz burnout para um grupo (departamento ou empresa)
   */
  async predictGroup(
    companyId?: string,
    departmentId?: string,
    riskThreshold?: number
  ): Promise<GroupPredictionResponse> {
    try {
      const response = await fetch(`${this.baseURL}/predict-group`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId, departmentId, riskThreshold }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao prever grupo: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Erro ao prever grupo:', error);
      throw error;
    }
  }

  /**
   * Verifica saúde da API
   */
  async healthCheck(): Promise<{ success: boolean; status: string }> {
    try {
      const response = await fetch(`${this.baseURL}/health`);

      if (!response.ok) {
        throw new Error(`API offline: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Erro ao verificar saúde da API:', error);
      throw error;
    }
  }

  /**
   * Formata risco para exibição
   */
  formatRiskLevel(level: string): { label: string; color: string; emoji: string } {
    switch (level) {
      case 'crítico':
        return { label: 'Crítico', color: 'red', emoji: '🚨' };
      case 'alto':
        return { label: 'Alto', color: 'orange', emoji: '⚠️' };
      case 'médio':
        return { label: 'Médio', color: 'yellow', emoji: '⚡' };
      case 'baixo':
        return { label: 'Baixo', color: 'green', emoji: '✅' };
      default:
        return { label: 'Desconhecido', color: 'gray', emoji: '❓' };
    }
  }

  /**
   * Formata tendência para exibição
   */
  formatTrend(trend: string): { label: string; color: string; emoji: string } {
    switch (trend) {
      case 'improving':
        return { label: 'Melhorando', color: 'green', emoji: '📈' };
      case 'stable':
        return { label: 'Estável', color: 'blue', emoji: '➡️' };
      case 'declining':
        return { label: 'Piorando', color: 'red', emoji: '📉' };
      default:
        return { label: 'Desconhecido', color: 'gray', emoji: '❓' };
    }
  }

  /**
   * Formata prioridade para exibição
   */
  formatPriority(priority: string): { label: string; color: string } {
    switch (priority) {
      case 'critical':
      case 'high':
        return { label: 'Alta', color: 'red' };
      case 'medium':
        return { label: 'Média', color: 'yellow' };
      case 'low':
        return { label: 'Baixa', color: 'green' };
      default:
        return { label: 'Desconhecida', color: 'gray' };
    }
  }
}

// Exportar instância única
export const aiService = new AIService();
export default aiService;
