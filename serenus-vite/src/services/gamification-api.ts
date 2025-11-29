/**
 * Serviço de API para Gamificação
 * Integração com backend de pontos, níveis e conquistas
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Level {
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: string;
  unlocked_at?: string;
}

export interface GamificationData {
  success: boolean;
  points: number;
  level: number;
  levelName: string;
  levelColor: string;
  nextLevel: string | null;
  pointsToNextLevel: number;
  progressToNextLevel: number;
  unlockedAchievements: Achievement[];
  lockedAchievements: Achievement[];
  totalAchievements: number;
  unlockedCount: number;
}

export interface ActivityCompleteResponse {
  success: boolean;
  gamification: {
    pointsAdded: number;
    totalPoints: number;
    leveledUp: boolean;
    newLevel: string | null;
    levelColor: string | null;
    achievements: Array<{
      success: boolean;
      achievement: Achievement;
      pointsAdded: number;
      totalPoints: number;
      leveledUp: boolean;
    }>;
  };
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  level: number;
  levelName: string;
  levelColor: string;
  isCurrentUser: boolean;
}

/**
 * Buscar dados de gamificação do usuário
 */
export async function getUserGamification(userId: string): Promise<GamificationData> {
  const response = await fetch(`${API_URL}/api/gamification/user/${userId}`);
  if (!response.ok) {
    throw new Error('Erro ao buscar dados de gamificação');
  }
  return response.json();
}

/**
 * Registrar conclusão de atividade
 */
export async function completeActivity(
  userId: string,
  activityKey: string,
  activityName: string
): Promise<ActivityCompleteResponse> {
  const response = await fetch(`${API_URL}/api/activities/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      activityKey,
      activityName,
    }),
  });

  if (!response.ok) {
    throw new Error('Erro ao registrar atividade');
  }

  return response.json();
}

/**
 * Buscar ranking (leaderboard)
 */
export async function getLeaderboard(
  companyId?: string,
  departmentId?: string,
  limit: number = 10
): Promise<{ success: boolean; leaderboard: LeaderboardEntry[]; totalUsers: number }> {
  const params = new URLSearchParams();
  if (companyId) params.append('companyId', companyId);
  if (departmentId) params.append('departmentId', departmentId);
  params.append('limit', limit.toString());

  const response = await fetch(`${API_URL}/api/gamification/leaderboard?${params}`);
  if (!response.ok) {
    throw new Error('Erro ao buscar ranking');
  }
  return response.json();
}

/**
 * Buscar histórico de pontos
 */
export async function getPointsHistory(
  userId: string,
  limit: number = 50
): Promise<{ success: boolean; history: Array<any> }> {
  const response = await fetch(
    `${API_URL}/api/gamification/history/${userId}?limit=${limit}`
  );
  if (!response.ok) {
    throw new Error('Erro ao buscar histórico de pontos');
  }
  return response.json();
}

/**
 * Buscar todas as conquistas disponíveis
 */
export async function getAllAchievements(): Promise<{
  success: boolean;
  achievements: Achievement[];
  levels: Level[];
}> {
  const response = await fetch(`${API_URL}/api/gamification/achievements`);
  if (!response.ok) {
    throw new Error('Erro ao buscar conquistas');
  }
  return response.json();
}
