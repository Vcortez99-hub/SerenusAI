import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Loader, TrendingUp, AlertTriangle, Info, Star } from 'lucide-react';
import { aiService, Insight } from '@/services/ai-api';
import { cn } from '@/lib/utils';

interface InsightsCardProps {
  userId: string;
  className?: string;
}

export default function InsightsCard({ userId, className }: InsightsCardProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, [userId]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await aiService.getInsights(userId);
      setInsights(data.insights);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar insights');
      console.error('Erro ao carregar insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'positive':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          iconBg: 'bg-green-500',
          icon: <Star className="w-4 h-4" />,
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          iconBg: 'bg-yellow-500',
          icon: <AlertTriangle className="w-4 h-4" />,
        };
      case 'alert':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          iconBg: 'bg-red-500',
          icon: <AlertTriangle className="w-4 h-4" />,
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          iconBg: 'bg-blue-500',
          icon: <Info className="w-4 h-4" />,
        };
    }
  };

  const sortInsights = (insights: Insight[]) => {
    const priorityOrder: Record<string, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };

    return [...insights].sort((a, b) => {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
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
          <span className="ml-3 text-gray-600">Analisando padrões...</span>
        </div>
      </motion.div>
    );
  }

  if (error || insights.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('bg-white rounded-2xl p-6 border border-gray-200', className)}
      >
        <div className="text-center py-8">
          <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            {error || 'Nenhum insight disponível no momento'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Continue registrando seu humor para receber insights personalizados
          </p>
        </div>
      </motion.div>
    );
  }

  const sortedInsights = sortInsights(insights);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('bg-white rounded-2xl p-6 border border-gray-200', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Insights Automáticos</h3>
            <p className="text-xs text-gray-500">{insights.length} {insights.length === 1 ? 'insight detectado' : 'insights detectados'}</p>
          </div>
        </div>
        <button
          onClick={loadInsights}
          className="text-yellow-600 hover:text-yellow-700 text-sm font-medium transition-colors"
        >
          Atualizar
        </button>
      </div>

      {/* Insights */}
      <div className="space-y-3">
        {sortedInsights.map((insight, index) => {
          const style = getInsightStyle(insight.type);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'p-4 rounded-xl border-2',
                style.bg,
                style.border
              )}
            >
              <div className="flex items-start space-x-3">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0 mt-0.5', style.iconBg)}>
                  <span className="text-lg">{insight.icon}</span>
                </div>
                <div className="flex-1">
                  <h4 className={cn('font-medium mb-1', style.text)}>{insight.title}</h4>
                  <p className="text-sm text-gray-700">{insight.message}</p>

                  {/* Action Button */}
                  {insight.action && (
                    <button
                      className={cn(
                        'mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        insight.type === 'alert'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : insight.type === 'warning'
                          ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      )}
                    >
                      {insight.action.label}
                    </button>
                  )}

                  {/* Priority Badge */}
                  {(insight.priority === 'critical' || insight.priority === 'high') && (
                    <div className="mt-2 inline-flex items-center px-2 py-1 bg-white/50 text-xs font-medium rounded-full">
                      {insight.priority === 'critical' ? '🚨 Urgente' : '⚠️ Importante'}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>💡 Baseado em IA e análise de padrões</span>
          <div className="flex items-center space-x-2">
            {sortedInsights.some(i => i.type === 'positive') && (
              <span className="text-green-600">✓ Progresso detectado</span>
            )}
            {sortedInsights.some(i => i.priority === 'high' || i.priority === 'critical') && (
              <span className="text-red-600">! Requer atenção</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
