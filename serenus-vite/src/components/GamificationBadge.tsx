/**
 * Badge de Gamificação
 * Exibe nível, pontos e progresso do usuário
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, TrendingUp } from 'lucide-react';
import { getUserGamification, GamificationData } from '../services/gamification-api';

interface GamificationBadgeProps {
  userId: string;
  compact?: boolean;
}

export default function GamificationBadge({ userId, compact = false }: GamificationBadgeProps) {
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🎮 Carregando gamificação para usuário:', userId);
      const result = await getUserGamification(userId);
      console.log('🎮 Dados recebidos:', result);
      setData(result);
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados de gamificação:', error);
      setError(error.message || 'Erro ao carregar gamificação');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl p-4 shadow-sm">
        <p className="text-sm text-red-600">⚠️ {error}</p>
      </div>
    );
  }

  if (!data) return null;

  if (compact) {
    return (
      <motion.div
        className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg px-3 py-2"
        whileHover={{ scale: 1.05 }}
      >
        <Star className="w-4 h-4" style={{ color: data.levelColor }} fill={data.levelColor} />
        <div className="text-sm font-medium text-gray-700">{data.levelName}</div>
        <div className="text-xs text-gray-500">{data.points} pts</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-xl shadow-md p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h3 className="text-lg font-bold text-gray-800">Seu Progresso</h3>
        </div>
        <div
          className="px-3 py-1 rounded-full text-sm font-bold"
          style={{
            backgroundColor: data.levelColor + '20',
            color: data.levelColor,
          }}
        >
          Nível {data.level}
        </div>
      </div>

      {/* Nível Atual */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Star
            className="w-8 h-8"
            style={{ color: data.levelColor }}
            fill={data.levelColor}
          />
          <h2 className="text-2xl font-bold" style={{ color: data.levelColor }}>
            {data.levelName}
          </h2>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {data.points.toLocaleString()} pontos
        </div>
      </div>

      {/* Barra de Progresso */}
      {data.nextLevel && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Próximo nível: {data.nextLevel}</span>
            <span className="font-semibold text-gray-700">
              {data.progressToNextLevel}%
            </span>
          </div>

          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${data.levelColor}, ${data.levelColor}dd)`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${data.progressToNextLevel}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>

          <div className="text-xs text-gray-500 mt-1 text-right">
            {data.pointsToNextLevel} pontos para o próximo nível
          </div>
        </div>
      )}

      {/* Conquistas */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Conquistas</span>
        </div>
        <span className="text-lg font-bold text-gray-900">
          {data.unlockedCount} / {data.totalAchievements}
        </span>
      </div>
    </motion.div>
  );
}
