import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, ArrowRight, Loader, X } from 'lucide-react';
import { aiService, Recommendation } from '@/services/ai-api';
import { cn } from '@/lib/utils';

interface RecommendationsCardProps {
  userId: string;
  className?: string;
}

export default function RecommendationsCard({ userId, className }: RecommendationsCardProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, [userId]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await aiService.getRecommendations(userId);
      setRecommendations(data.recommendations);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar recomendações');
      console.error('Erro ao carregar recomendações:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-300 bg-red-50';
      case 'medium':
        return 'border-yellow-300 bg-yellow-50';
      case 'low':
        return 'border-green-300 bg-green-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'support':
        return 'bg-red-500';
      case 'breathing':
        return 'bg-cyan-500';
      case 'meditation':
        return 'bg-purple-500';
      case 'journaling':
        return 'bg-orange-500';
      default:
        return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('bg-white rounded-2xl p-6 border border-gray-200', className)}
      >
        <div className="flex items-center justify-center h-40">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-600">Gerando recomendações...</span>
        </div>
      </motion.div>
    );
  }

  if (error || recommendations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('bg-white rounded-2xl p-6 border border-gray-200', className)}
      >
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            {error || 'Nenhuma recomendação disponível no momento'}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('bg-white rounded-2xl p-6 border border-gray-200', className)}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Recomendações Personalizadas</h3>
              <p className="text-xs text-gray-500">Para você hoje</p>
            </div>
          </div>
          <button
            onClick={loadRecommendations}
            className="text-purple-500 hover:text-purple-600 text-sm font-medium transition-colors"
          >
            Atualizar
          </button>
        </div>

        {/* Recomendações */}
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedRec(rec)}
              className={cn(
                'p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md',
                getPriorityColor(rec.priority)
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0', getTypeColor(rec.type))}>
                    <span className="text-lg">{rec.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {rec.duration}
                      </span>
                      <span>• {rec.time}</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
              </div>

              {/* Badge de prioridade */}
              {rec.priority === 'high' && (
                <div className="mt-3 inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                  🔥 Prioridade Alta
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            💡 Recomendações baseadas no seu humor e padrões
          </p>
        </div>
      </motion.div>

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {selectedRec && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedRec(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-white', getTypeColor(selectedRec.type))}>
                    <span className="text-2xl">{selectedRec.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{selectedRec.title}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedRec.duration} • {selectedRec.time}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRec(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Descrição</h4>
                  <p className="text-gray-600">{selectedRec.description}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Por que fazer agora?</h4>
                  <p className="text-gray-600">
                    {selectedRec.type === 'support' && 'Buscar apoio é essencial quando estamos com dificuldades. Compartilhar seus sentimentos pode trazer alívio imediato.'}
                    {selectedRec.type === 'breathing' && 'Exercícios de respiração acalmam o sistema nervoso rapidamente, reduzindo ansiedade e estresse.'}
                    {selectedRec.type === 'meditation' && 'A meditação promove clareza mental e equilíbrio emocional, ajudando você a se reconectar consigo mesmo.'}
                    {selectedRec.type === 'journaling' && 'Escrever seus pensamentos ajuda a processar emoções e ganhar perspectiva sobre situações difíceis.'}
                    {selectedRec.type === 'general' && 'Manter práticas regulares de bem-estar é fundamental para sua saúde emocional a longo prazo.'}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Dica Extra
                  </h4>
                  <p className="text-sm text-blue-700">
                    {selectedRec.type === 'support' && 'Se preferir, comece conversando com nossa IA no chat. Ela está sempre disponível para te ouvir.'}
                    {selectedRec.type === 'breathing' && 'Tente inspirar contando até 4, segurar por 4, e expirar contando até 6. Repita 5 vezes.'}
                    {selectedRec.type === 'meditation' && 'Use fones de ouvido e encontre um lugar tranquilo. Apenas 5 minutos já fazem diferença!'}
                    {selectedRec.type === 'journaling' && 'Não se preocupe com gramática. Escreva livremente o que vier à mente.'}
                    {selectedRec.type === 'general' && 'Consistência é mais importante que perfeição. Pequenos passos diários levam a grandes transformações.'}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedRec(null)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-colors"
                >
                  Entendi! Vou fazer agora
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
