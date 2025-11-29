/**
 * Card de Conquistas
 * Exibe conquistas desbloqueadas e bloqueadas
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Trophy, X } from 'lucide-react';
import { getUserGamification, GamificationData, Achievement } from '../services/gamification-api';

interface AchievementsCardProps {
  userId: string;
}

export default function AchievementsCard({ userId }: AchievementsCardProps) {
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
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
      console.log('🏆 Carregando conquistas para usuário:', userId);
      const result = await getUserGamification(userId);
      console.log('🏆 Conquistas recebidas:', result);
      setData(result);
    } catch (error: any) {
      console.error('❌ Erro ao carregar conquistas:', error);
      setError(error.message || 'Erro ao carregar conquistas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl p-6 shadow-sm">
        <p className="text-sm text-red-600">⚠️ {error}</p>
      </div>
    );
  }

  if (!data) return null;

  const filteredAchievements =
    filter === 'all'
      ? [...data.unlockedAchievements, ...data.lockedAchievements]
      : filter === 'unlocked'
      ? data.unlockedAchievements
      : data.lockedAchievements;

  return (
    <>
      <motion.div
        className="bg-white rounded-xl shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h3 className="text-lg font-bold text-gray-800">Conquistas</h3>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver todas
          </button>
        </div>

        {/* Progresso */}
        <div className="mb-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progresso</span>
            <span className="text-lg font-bold text-gray-900">
              {data.unlockedCount} / {data.totalAchievements}
            </span>
          </div>
          <div className="h-2 bg-white rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
              initial={{ width: 0 }}
              animate={{
                width: `${(data.unlockedCount / data.totalAchievements) * 100}%`,
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Preview das conquistas (últimas 3 desbloqueadas) */}
        <div className="grid grid-cols-3 gap-3">
          {data.unlockedAchievements.slice(0, 3).map((achievement, index) => (
            <motion.div
              key={achievement.id}
              className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-3 text-center border-2 border-yellow-200"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="text-3xl mb-1">{achievement.icon}</div>
              <div className="text-xs font-semibold text-gray-800 line-clamp-1">
                {achievement.name}
              </div>
              <div className="text-xs text-yellow-600 font-medium">
                +{achievement.points} pts
              </div>
            </motion.div>
          ))}

          {data.unlockedCount < 3 &&
            data.lockedAchievements.slice(0, 3 - data.unlockedCount).map((achievement) => (
              <div
                key={achievement.id}
                className="bg-gray-100 rounded-lg p-3 text-center border-2 border-gray-200 opacity-60"
              >
                <Lock className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                <div className="text-xs font-semibold text-gray-500 line-clamp-1">
                  Bloqueada
                </div>
              </div>
            ))}
        </div>
      </motion.div>

      {/* Modal de Todas as Conquistas */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Suas Conquistas</h2>
                    <p className="text-yellow-100">
                      {data.unlockedCount} de {data.totalAchievements} desbloqueadas
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Filtros */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                      filter === 'all'
                        ? 'bg-white text-orange-600'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setFilter('unlocked')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                      filter === 'unlocked'
                        ? 'bg-white text-orange-600'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    Desbloqueadas
                  </button>
                  <button
                    onClick={() => setFilter('locked')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                      filter === 'locked'
                        ? 'bg-white text-orange-600'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    Bloqueadas
                  </button>
                </div>
              </div>

              {/* Lista de Conquistas */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAchievements.map((achievement: Achievement) => {
                    const isUnlocked = 'unlocked_at' in achievement;

                    return (
                      <motion.div
                        key={achievement.id}
                        className={`p-4 rounded-xl border-2 ${
                          isUnlocked
                            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                            : 'bg-gray-50 border-gray-200 opacity-70'
                        }`}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{isUnlocked ? achievement.icon : '🔒'}</div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800 mb-1">
                              {achievement.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {achievement.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-sm font-semibold ${
                                  isUnlocked ? 'text-yellow-600' : 'text-gray-400'
                                }`}
                              >
                                +{achievement.points} pontos
                              </span>
                              {isUnlocked && achievement.unlocked_at && (
                                <span className="text-xs text-gray-500">
                                  {new Date(achievement.unlocked_at).toLocaleDateString('pt-BR')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
