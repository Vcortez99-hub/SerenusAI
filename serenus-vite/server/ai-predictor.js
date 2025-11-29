/**
 * Sistema de IA Preditiva para Bem-Estar Emocional
 * Usa regressão linear e análise de tendências para prever o humor futuro
 */

class MoodPredictor {
  constructor() {
    this.minDataPoints = 7; // Mínimo de dias para fazer previsão
  }

  /**
   * Prevê o humor para os próximos N dias
   */
  async predictMood(dbModule, userId, daysAhead = 7) {
    const db = dbModule.db;

    // Buscar histórico de humor do usuário
    const history = await new Promise((resolve, reject) => {
      const sql = `
        SELECT
          DATE(timestamp) as date,
          AVG(COALESCE(sentiment_score, 3)) as avgMood,
          COUNT(*) as entryCount,
          AVG(CASE WHEN sentiment_label = 'positive' THEN 1 WHEN sentiment_label = 'neutral' THEN 0 ELSE -1 END) as sentimentScore
        FROM diary_entries
        WHERE user_id = ?
          AND timestamp >= datetime('now', '-90 days')
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
      `;

      db.all(sql, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    if (history.length < this.minDataPoints) {
      return {
        success: false,
        message: `Dados insuficientes. Necessário pelo menos ${this.minDataPoints} dias de histórico.`,
        dataPoints: history.length
      };
    }

    // Análise de tendência usando regressão linear simples
    const trend = this.calculateTrend(history);

    // Detectar padrões semanais (dia da semana)
    const weekdayPatterns = this.analyzeWeekdayPatterns(history);

    // Detectar sazonalidade e ciclos
    const seasonality = this.detectSeasonality(history);

    // Fazer previsões
    const predictions = [];
    const today = new Date();

    for (let i = 1; i <= daysAhead; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);

      const dayOfWeek = futureDate.getDay();
      const weekdayAdjustment = weekdayPatterns[dayOfWeek] || 0;

      // Previsão base (tendência linear)
      const basePrediction = trend.slope * (history.length + i) + trend.intercept;

      // Aplicar ajuste por dia da semana
      let adjustedPrediction = basePrediction + weekdayAdjustment;

      // Aplicar fator de sazonalidade
      adjustedPrediction += seasonality.adjustment;

      // Limitar entre 1 e 5
      adjustedPrediction = Math.max(1, Math.min(5, adjustedPrediction));

      // Calcular confiança da previsão (decresce com distância)
      const confidence = Math.max(0, 100 - (i * 5));

      // Classificar risco
      let risk = 'low';
      let riskMessage = 'Humor estável previsto';

      if (adjustedPrediction < 2.5) {
        risk = 'high';
        riskMessage = 'Atenção: humor baixo previsto';
      } else if (adjustedPrediction < 3.5) {
        risk = 'medium';
        riskMessage = 'Alerta: humor pode diminuir';
      }

      predictions.push({
        date: futureDate.toISOString().split('T')[0],
        dayOfWeek: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dayOfWeek],
        predictedMood: parseFloat(adjustedPrediction.toFixed(2)),
        confidence: Math.round(confidence),
        risk,
        riskMessage
      });
    }

    // Análise de padrões preocupantes
    const warnings = this.generateWarnings(history, predictions, trend);

    return {
      success: true,
      userId,
      dataPoints: history.length,
      trend: {
        direction: trend.slope > 0 ? 'improving' : trend.slope < -0.01 ? 'declining' : 'stable',
        strength: Math.abs(trend.slope),
        description: this.describeTrend(trend.slope)
      },
      weekdayPatterns: {
        bestDay: this.getBestDay(weekdayPatterns),
        worstDay: this.getWorstDay(weekdayPatterns),
        patterns: weekdayPatterns
      },
      predictions,
      warnings,
      recommendations: this.generateRecommendations(predictions, warnings, trend)
    };
  }

  /**
   * Calcula tendência linear (regressão linear simples)
   */
  calculateTrend(history) {
    const n = history.length;
    const reversedHistory = [...history].reverse(); // Ordem cronológica

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    reversedHistory.forEach((point, i) => {
      const x = i;
      const y = point.avgMood;

      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  /**
   * Analisa padrões por dia da semana
   */
  analyzeWeekdayPatterns(history) {
    const patterns = {};
    const counts = {};

    history.forEach(point => {
      const date = new Date(point.date + 'T00:00:00');
      const dayOfWeek = date.getDay();

      if (!patterns[dayOfWeek]) {
        patterns[dayOfWeek] = 0;
        counts[dayOfWeek] = 0;
      }

      patterns[dayOfWeek] += point.avgMood;
      counts[dayOfWeek]++;
    });

    // Calcular média por dia da semana
    Object.keys(patterns).forEach(day => {
      patterns[day] = patterns[day] / counts[day];
    });

    // Calcular desvio da média geral
    const overallAvg = history.reduce((sum, p) => sum + p.avgMood, 0) / history.length;
    Object.keys(patterns).forEach(day => {
      patterns[day] = patterns[day] - overallAvg;
    });

    return patterns;
  }

  /**
   * Detecta sazonalidade
   */
  detectSeasonality(history) {
    // Analisar últimos 7 dias vs 7-14 dias vs 14-21 dias
    const recent7 = history.slice(0, 7);
    const previous7 = history.slice(7, 14);

    if (recent7.length < 7 || previous7.length < 7) {
      return { detected: false, adjustment: 0 };
    }

    const avg7 = recent7.reduce((sum, p) => sum + p.avgMood, 0) / recent7.length;
    const avgPrev7 = previous7.reduce((sum, p) => sum + p.avgMood, 0) / previous7.length;

    const diff = avg7 - avgPrev7;

    return {
      detected: Math.abs(diff) > 0.3,
      adjustment: diff * 0.5, // Aplica 50% da tendência recente
      recentAvg: avg7,
      previousAvg: avgPrev7
    };
  }

  /**
   * Gera warnings baseados em padrões preocupantes
   */
  generateWarnings(history, predictions, trend) {
    const warnings = [];

    // Warning 1: Tendência de queda consistente
    if (trend.slope < -0.05) {
      warnings.push({
        type: 'declining_trend',
        severity: 'high',
        message: 'Tendência de queda no humor detectada nos últimos dias',
        recommendation: 'Considere intervenção preventiva'
      });
    }

    // Warning 2: Previsão de humor muito baixo
    const lowMoodDays = predictions.filter(p => p.predictedMood < 2.5).length;
    if (lowMoodDays > 0) {
      warnings.push({
        type: 'low_mood_predicted',
        severity: lowMoodDays > 3 ? 'high' : 'medium',
        message: `Humor baixo previsto para ${lowMoodDays} dia(s)`,
        recommendation: 'Agende check-in com o colaborador'
      });
    }

    // Warning 3: Variabilidade alta (humor instável)
    const recentMoods = history.slice(0, 7).map(h => h.avgMood);
    const stdDev = this.calculateStdDev(recentMoods);
    if (stdDev > 1.2) {
      warnings.push({
        type: 'high_variability',
        severity: 'medium',
        message: 'Humor instável detectado (alta variabilidade)',
        recommendation: 'Investigue possíveis causas de estresse'
      });
    }

    // Warning 4: Queda súbita recente
    if (history.length >= 2) {
      const recentChange = history[0].avgMood - history[1].avgMood;
      if (recentChange < -1.5) {
        warnings.push({
          type: 'sudden_drop',
          severity: 'high',
          message: 'Queda súbita de humor detectada',
          recommendation: 'Ação imediata recomendada'
        });
      }
    }

    return warnings;
  }

  /**
   * Gera recomendações personalizadas
   */
  generateRecommendations(predictions, warnings, trend) {
    const recommendations = [];

    // Baseado em warnings
    if (warnings.some(w => w.severity === 'high')) {
      recommendations.push({
        priority: 'high',
        action: 'immediate_intervention',
        title: 'Intervenção Imediata',
        description: 'Agende conversa individual com o colaborador nas próximas 24-48h',
        icon: '🚨'
      });
    }

    // Baseado em tendência
    if (trend.slope < -0.03) {
      recommendations.push({
        priority: 'medium',
        action: 'preventive_support',
        title: 'Suporte Preventivo',
        description: 'Ofereça recursos de bem-estar e verifique carga de trabalho',
        icon: '🛡️'
      });
    }

    // Baseado em previsões
    const avgPredicted = predictions.reduce((sum, p) => sum + p.predictedMood, 0) / predictions.length;
    if (avgPredicted < 3.5) {
      recommendations.push({
        priority: 'medium',
        action: 'monitor_closely',
        title: 'Monitoramento Próximo',
        description: 'Acompanhe diariamente e esteja disponível para conversas',
        icon: '👁️'
      });
    }

    // Recomendações positivas
    if (trend.slope > 0.05) {
      recommendations.push({
        priority: 'low',
        action: 'positive_reinforcement',
        title: 'Reforço Positivo',
        description: 'Reconheça o progresso e mantenha o ambiente de suporte',
        icon: '🌟'
      });
    }

    return recommendations;
  }

  /**
   * Funções auxiliares
   */
  describeTrend(slope) {
    if (slope > 0.1) return 'Melhora significativa';
    if (slope > 0.03) return 'Melhora gradual';
    if (slope > -0.03) return 'Estável';
    if (slope > -0.1) return 'Declínio gradual';
    return 'Declínio significativo';
  }

  getBestDay(patterns) {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    let best = { day: null, value: -Infinity };
    Object.entries(patterns).forEach(([dayNum, value]) => {
      if (value > best.value) {
        best = { day: days[dayNum], value };
      }
    });
    return best.day;
  }

  getWorstDay(patterns) {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    let worst = { day: null, value: Infinity };
    Object.entries(patterns).forEach(([dayNum, value]) => {
      if (value < worst.value) {
        worst = { day: days[dayNum], value };
      }
    });
    return worst.day;
  }

  calculateStdDev(values) {
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squareDiffs = values.map(v => Math.pow(v - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((sum, v) => sum + v, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  }

  /**
   * Prevê humor para múltiplos usuários (departamento ou empresa)
   */
  async predictForGroup(dbModule, filters = {}) {
    const { companyId, departmentId, riskThreshold = 3.0 } = filters;
    const db = dbModule.db;

    // Buscar usuários do grupo
    let sql = 'SELECT id, name, email FROM users WHERE 1=1';
    const params = [];

    if (companyId) {
      sql += ' AND company = ?';
      params.push(companyId);
    }

    if (departmentId) {
      sql += ' AND department = ?';
      params.push(departmentId);
    }

    const users = await new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // Fazer previsão para cada usuário
    const results = [];
    for (const user of users) {
      try {
        const prediction = await this.predictMood(dbModule, user.id, 7);

        if (prediction.success) {
          const avgPredicted = prediction.predictions.reduce((sum, p) => sum + p.predictedMood, 0) / prediction.predictions.length;
          const highRiskDays = prediction.predictions.filter(p => p.predictedMood < riskThreshold).length;

          results.push({
            userId: user.id,
            name: user.name,
            email: user.email,
            avgPredictedMood: parseFloat(avgPredicted.toFixed(2)),
            highRiskDays,
            trend: prediction.trend.direction,
            warningCount: prediction.warnings.length,
            needsAttention: highRiskDays > 2 || prediction.warnings.some(w => w.severity === 'high')
          });
        }
      } catch (error) {
        console.error(`Erro ao prever humor para usuário ${user.id}:`, error);
      }
    }

    // Ordenar por risco (maior para menor)
    results.sort((a, b) => {
      if (a.needsAttention && !b.needsAttention) return -1;
      if (!a.needsAttention && b.needsAttention) return 1;
      return a.avgPredictedMood - b.avgPredictedMood;
    });

    return {
      success: true,
      totalUsers: results.length,
      usersNeedingAttention: results.filter(r => r.needsAttention).length,
      predictions: results
    };
  }
}

module.exports = { MoodPredictor };
