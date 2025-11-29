import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Loader } from 'lucide-react';
import { aiService, BurnoutPrediction } from '@/services/ai-api';
import { cn } from '@/lib/utils';

interface BurnoutPredictionCardProps {
  userId: string;
  className?: string;
}

export default function BurnoutPredictionCard({ userId, className }: BurnoutPredictionCardProps) {
  const [prediction, setPrediction] = useState<BurnoutPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPrediction();
  }, [userId]);

  const loadPrediction = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await aiService.predictBurnout(userId);
      setPrediction(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar predição');
      console.error('Erro ao carregar predição:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'crítico':
        return 'from-red-500 to-red-600';
      case 'alto':
        return 'from-orange-500 to-orange-600';
      case 'médio':
        return 'from-yellow-500 to-yellow-600';
      case 'baixo':
        return 'from-green-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'crítico':
      case 'alto':
        return <AlertTriangle className="w-6 h-6" />;
      case 'médio':
        return <Minus className="w-6 h-6" />;
      case 'baixo':
        return <TrendingUp className="w-6 h-6" />;
      default:
        return <Minus className="w-6 h-6" />;
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <Minus className="w-5 h-5 text-blue-600" />;
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
          <span className="ml-3 text-gray-600">Analisando seus dados...</span>
        </div>
      </motion.div>
    );
  }

  if (error || !prediction) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('bg-white rounded-2xl p-6 border border-gray-200', className)}
      >
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            {error || 'Dados insuficientes para predição'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Continue registrando seu humor para análises mais precisas
          </p>
        </div>
      </motion.div>
    );
  }

  const { burnoutScore, riskLevel, details } = prediction;
  const riskInfo = aiService.formatRiskLevel(riskLevel);
  const trendInfo = aiService.formatTrend(details.trend.direction);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('bg-white rounded-2xl p-6 border border-gray-200 overflow-hidden relative', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br', getRiskColor(riskLevel))}>
            <span className="text-white">{riskInfo.emoji}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Predição de Burnout</h3>
            <p className="text-xs text-gray-500">Próximos 7 dias</p>
          </div>
        </div>
        <button
          onClick={loadPrediction}
          className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors"
        >
          Atualizar
        </button>
      </div>

      {/* Score Principal */}
      <div className="mb-6">
        <div className="flex items-end space-x-3 mb-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-5xl font-bold text-gray-900"
          >
            {burnoutScore}
            <span className="text-2xl text-gray-500">%</span>
          </motion.div>
          <div className={cn('px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r', getRiskColor(riskLevel))}>
            Risco {riskInfo.label}
          </div>
        </div>
        <p className="text-sm text-gray-600">{prediction.prediction}</p>
      </div>

      {/* Barra de Progresso */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${burnoutScore}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={cn('h-full bg-gradient-to-r rounded-full', getRiskColor(riskLevel))}
          />
        </div>
      </div>

      {/* Tendência e Padrões */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            {getTrendIcon(details.trend.direction)}
            <span className="text-xs text-gray-600 font-medium">Tendência</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">{trendInfo.label}</p>
          <p className="text-xs text-gray-500">{details.trend.description}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-lg">📅</span>
            <span className="text-xs text-gray-600 font-medium">Pior Dia</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">{details.weekdayPatterns.worstDay}</p>
          <p className="text-xs text-gray-500">Requer mais atenção</p>
        </div>
      </div>

      {/* Warnings */}
      {details.warnings.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-700 mb-2">⚠️ Alertas Detectados:</p>
          {details.warnings.slice(0, 2).map((warning, index) => (
            <div
              key={index}
              className={cn(
                'p-3 rounded-lg text-sm',
                warning.severity === 'high'
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-yellow-50 border border-yellow-200'
              )}
            >
              <p className="font-medium text-gray-900">{warning.message}</p>
              <p className="text-xs text-gray-600 mt-1">{warning.recommendation}</p>
            </div>
          ))}
        </div>
      )}

      {/* Previsões dos próximos dias */}
      <div className="mt-6">
        <p className="text-xs font-medium text-gray-700 mb-3">📊 Previsão para os próximos dias:</p>
        <div className="flex items-end justify-between space-x-2">
          {details.predictions.slice(0, 7).map((pred, index) => {
            const height = (pred.predictedMood / 5) * 100;
            const isLowRisk = pred.predictedMood >= 3.5;
            const isMediumRisk = pred.predictedMood >= 2.5 && pred.predictedMood < 3.5;

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={cn(
                    'w-full rounded-t-lg min-h-[20px]',
                    isLowRisk ? 'bg-green-400' : isMediumRisk ? 'bg-yellow-400' : 'bg-red-400'
                  )}
                />
                <span className="text-[10px] text-gray-600 mt-1">{pred.dayOfWeek}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Baseado em {details.predictions[0]?.confidence || 0}% de confiança • {prediction.details.dataPoints} dias de dados
        </p>
      </div>
    </motion.div>
  );
}
