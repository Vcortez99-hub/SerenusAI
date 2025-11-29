const express = require('express');
const router = express.Router();
const { MoodPredictor } = require('./ai-predictor');

/**
 * Rotas de IA Preditiva e Recomendações
 */

module.exports = (dbModule) => {
  const predictor = new MoodPredictor();

  /**
   * POST /api/ai/predict-burnout
   * Prediz probabilidade de burnout para um usuário
   */
  router.post('/predict-burnout', async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId é obrigatório'
        });
      }

      // Buscar dados do usuário
      const user = await dbModule.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );

      if (!user.rows || user.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      // Fazer predição
      const prediction = await predictor.predictMood(dbModule, userId, 7);

      if (!prediction.success) {
        return res.status(400).json(prediction);
      }

      // Calcular score de burnout baseado nas previsões
      const avgPredicted = prediction.predictions.reduce((sum, p) => sum + p.predictedMood, 0) / prediction.predictions.length;
      const lowMoodDays = prediction.predictions.filter(p => p.predictedMood < 2.5).length;
      const highWarnings = prediction.warnings.filter(w => w.severity === 'high').length;

      // Score de 0-100 (quanto maior, maior o risco)
      let burnoutScore = 0;
      if (avgPredicted < 2.5) burnoutScore += 40;
      else if (avgPredicted < 3.0) burnoutScore += 25;
      else if (avgPredicted < 3.5) burnoutScore += 10;

      burnoutScore += lowMoodDays * 10;
      burnoutScore += highWarnings * 15;

      if (prediction.trend.direction === 'declining') burnoutScore += 15;

      burnoutScore = Math.min(100, burnoutScore);

      let riskLevel = 'baixo';
      if (burnoutScore >= 70) riskLevel = 'crítico';
      else if (burnoutScore >= 50) riskLevel = 'alto';
      else if (burnoutScore >= 30) riskLevel = 'médio';

      res.json({
        success: true,
        userId,
        userName: user.rows[0].name,
        burnoutScore,
        riskLevel,
        prediction: `${user.rows[0].name} tem ${burnoutScore}% de probabilidade de burnout nos próximos 7 dias`,
        details: prediction,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Erro ao prever burnout:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao prever burnout',
        details: error.message
      });
    }
  });

  /**
   * POST /api/ai/recommendations
   * Gera recomendações personalizadas para um usuário
   */
  router.post('/recommendations', async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId é obrigatório'
        });
      }

      // Buscar dados do usuário
      const user = await dbModule.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );

      if (!user.rows || user.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      // Buscar histórico de humor (últimos 30 dias)
      const moodHistory = await dbModule.query(`
        SELECT
          DATE(timestamp) as date,
          AVG(sentiment_score) as mood,
          COUNT(*) as entries
        FROM diary_entries
        WHERE user_id = $1
          AND timestamp >= datetime('now', '-30 days')
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
      `, [userId]);

      // Buscar última entrada do diário
      const lastEntry = await dbModule.query(`
        SELECT * FROM diary_entries
        WHERE user_id = $1
        ORDER BY timestamp DESC
        LIMIT 1
      `, [userId]);

      const currentMood = lastEntry.rows && lastEntry.rows.length > 0
        ? lastEntry.rows[0].sentiment_score || 3
        : 3;

      // Fazer predição para gerar recomendações
      const prediction = await predictor.predictMood(dbModule, userId, 7);

      let recommendations = [];

      if (prediction.success) {
        // Recomendações baseadas na predição
        recommendations = prediction.recommendations || [];
      }

      // Adicionar recomendações baseadas no humor atual
      if (currentMood <= 2) {
        recommendations.push({
          priority: 'high',
          action: 'immediate_support',
          title: 'Busque apoio agora',
          description: 'Converse com alguém de confiança ou use o chat com IA',
          icon: '🆘',
          type: 'support',
          time: 'agora',
          duration: '15-30 min'
        });
        recommendations.push({
          priority: 'high',
          action: 'breathing',
          title: 'Respiração Calmante',
          description: 'Faça exercícios de respiração para reduzir ansiedade',
          icon: '🌬️',
          type: 'breathing',
          time: 'agora',
          duration: '5 min'
        });
      } else if (currentMood <= 3) {
        recommendations.push({
          priority: 'medium',
          action: 'meditation',
          title: 'Meditação Guiada',
          description: 'Uma meditação leve para reequilibrar suas emoções',
          icon: '🧘',
          type: 'meditation',
          time: '15h ou 19h',
          duration: '10 min'
        });
        recommendations.push({
          priority: 'medium',
          action: 'journaling',
          title: 'Escreva seus sentimentos',
          description: 'Coloque no papel o que está te incomodando',
          icon: '📝',
          type: 'journaling',
          time: 'noite',
          duration: '15 min'
        });
      } else {
        recommendations.push({
          priority: 'low',
          action: 'maintain',
          title: 'Continue assim!',
          description: 'Mantenha suas práticas de bem-estar',
          icon: '⭐',
          type: 'general',
          time: 'durante o dia',
          duration: '5-15 min'
        });
      }

      // Recomendação baseada em padrão de dia da semana
      if (prediction.success && prediction.weekdayPatterns.worstDay) {
        const today = new Date();
        const todayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][today.getDay()];

        if (todayName === prediction.weekdayPatterns.worstDay) {
          recommendations.unshift({
            priority: 'high',
            action: 'worst_day_support',
            title: `Hoje é ${todayName} - seu dia mais difícil`,
            description: 'Reserve um tempo extra para autocuidado hoje',
            icon: '💙',
            type: 'support',
            time: 'manhã e tarde',
            duration: '10 min'
          });
        }
      }

      // Remover duplicatas e limitar a 5 recomendações
      const uniqueRecommendations = recommendations
        .filter((rec, index, self) =>
          index === self.findIndex(r => r.action === rec.action)
        )
        .slice(0, 5);

      res.json({
        success: true,
        userId,
        userName: user.rows[0].name,
        currentMood,
        recommendations: uniqueRecommendations,
        totalRecommendations: uniqueRecommendations.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Erro ao gerar recomendações:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao gerar recomendações',
        details: error.message
      });
    }
  });

  /**
   * POST /api/ai/insights
   * Gera insights automáticos baseados em padrões
   */
  router.post('/insights', async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId é obrigatório'
        });
      }

      // Buscar dados do usuário
      const user = await dbModule.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );

      if (!user.rows || user.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      // Fazer predição
      const prediction = await predictor.predictMood(dbModule, userId, 7);

      if (!prediction.success) {
        return res.status(400).json(prediction);
      }

      const insights = [];

      // Insight 1: Tendência
      if (prediction.trend.direction === 'improving') {
        insights.push({
          type: 'positive',
          title: 'Você está melhorando! 📈',
          message: `Seu humor tem melhorado gradualmente. ${prediction.trend.description}`,
          icon: '🎉',
          priority: 'low'
        });
      } else if (prediction.trend.direction === 'declining') {
        insights.push({
          type: 'warning',
          title: 'Atenção ao seu humor 📉',
          message: `Detectamos uma tendência de queda. ${prediction.trend.description}. Que tal conversar com alguém?`,
          icon: '⚠️',
          priority: 'high'
        });
      }

      // Insight 2: Melhor e pior dia
      if (prediction.weekdayPatterns.worstDay) {
        insights.push({
          type: 'info',
          title: `${prediction.weekdayPatterns.worstDay} é seu dia mais difícil`,
          message: `Seu humor costuma cair em ${prediction.weekdayPatterns.worstDay}. Tente agendar algo que goste nesse dia!`,
          icon: '📅',
          priority: 'medium'
        });
      }

      if (prediction.weekdayPatterns.bestDay) {
        insights.push({
          type: 'positive',
          title: `${prediction.weekdayPatterns.bestDay} é seu melhor dia! ⭐`,
          message: `Você tende a se sentir melhor em ${prediction.weekdayPatterns.bestDay}.`,
          icon: '🌟',
          priority: 'low'
        });
      }

      // Insight 3: Warnings da predição
      prediction.warnings.forEach(warning => {
        insights.push({
          type: warning.severity === 'high' ? 'alert' : 'warning',
          title: warning.message,
          message: warning.recommendation,
          icon: warning.severity === 'high' ? '🚨' : '⚠️',
          priority: warning.severity
        });
      });

      // Insight 4: Previsão dos próximos dias
      const lowMoodDays = prediction.predictions.filter(p => p.predictedMood < 2.5).length;
      if (lowMoodDays > 0) {
        insights.push({
          type: 'info',
          title: 'Previsão para os próximos dias',
          message: `Prevemos ${lowMoodDays} dia(s) com humor mais baixo. Prepare-se com atividades de autocuidado.`,
          icon: '🔮',
          priority: 'medium'
        });
      }

      // Insight 5: Consistência
      if (prediction.dataPoints >= 21) {
        insights.push({
          type: 'positive',
          title: 'Você é consistente! 🏆',
          message: `Parabéns! Você tem ${prediction.dataPoints} dias de registro. Isso ajuda muito no autoconhecimento.`,
          icon: '⭐',
          priority: 'low'
        });
      } else if (prediction.dataPoints < 7) {
        insights.push({
          type: 'info',
          title: 'Continue registrando',
          message: 'Quanto mais você registrar seu humor, melhores serão as previsões e insights.',
          icon: '📝',
          priority: 'medium'
        });
      }

      res.json({
        success: true,
        userId,
        userName: user.rows[0].name,
        insights,
        totalInsights: insights.length,
        dataPoints: prediction.dataPoints,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Erro ao gerar insights:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao gerar insights',
        details: error.message
      });
    }
  });

  /**
   * POST /api/ai/predict-group
   * Prediz burnout para um grupo (departamento ou empresa)
   */
  router.post('/predict-group', async (req, res) => {
    try {
      const { companyId, departmentId, riskThreshold } = req.body;

      if (!companyId && !departmentId) {
        return res.status(400).json({
          success: false,
          error: 'companyId ou departmentId é obrigatório'
        });
      }

      const result = await predictor.predictForGroup(dbModule, {
        companyId,
        departmentId,
        riskThreshold: riskThreshold || 3.0
      });

      res.json({
        success: true,
        ...result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Erro ao prever para grupo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao prever para grupo',
        details: error.message
      });
    }
  });

  /**
   * GET /api/ai/health
   * Health check da API de IA
   */
  router.get('/health', (req, res) => {
    res.json({
      success: true,
      service: 'AI Prediction API',
      status: 'online',
      features: [
        'burnout_prediction',
        'personalized_recommendations',
        'automatic_insights',
        'group_predictions',
        'pattern_detection'
      ],
      timestamp: new Date().toISOString()
    });
  });

  return router;
};
