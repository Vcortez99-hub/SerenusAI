/**
 * SERVIÇO CENTRAL DE INTEGRAÇÃO
 * Conecta todos os módulos do sistema de forma inteligente
 */

const { query, run } = require('./db-sqlite');
const { v4: uuidv4 } = require('uuid');

class IntegrationService {
  /**
   * Registra uma atividade e dispara todos os eventos relacionados
   */
  async registerActivity(userId, activityData) {
    const activityId = uuidv4();

    try {
      // 1. Criar a atividade
      await query(`
        INSERT INTO user_activities
        (id, user_id, activity_type, activity_name, description, duration_minutes,
         intensity, mood_before, mood_after, notes, completed_at, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        activityId,
        userId,
        activityData.activity_type,
        activityData.activity_name,
        activityData.description,
        activityData.duration_minutes,
        activityData.intensity,
        activityData.mood_before,
        activityData.mood_after,
        activityData.notes,
        activityData.completed_at || new Date().toISOString(),
        JSON.stringify(activityData.metadata || {})
      ]);

      // 2. Atualizar pontos e gamificação
      await this.updateGamification(userId, activityData);

      // 3. Verificar e desbloquear conquistas
      await this.checkAchievements(userId);

      // 4. Atualizar métricas de bem-estar
      await this.updateWellnessMetrics(userId, activityData);

      // 5. Criar notificações relevantes
      await this.createActivityNotifications(userId, activityData);

      // 6. Atualizar progresso de metas
      await this.updateGoalsProgress(userId, activityData);

      return { activityId, success: true };
    } catch (error) {
      console.error('Erro ao registrar atividade:', error);
      throw error;
    }
  }

  /**
   * Atualiza gamificação: pontos, nível e streak
   */
  async updateGamification(userId, activityData) {
    // Calcular pontos baseado na atividade
    const basePoints = 10;
    const durationBonus = Math.floor((activityData.duration_minutes || 0) / 5);
    const intensityMultiplier = { low: 1, medium: 1.5, high: 2 }[activityData.intensity || 'medium'];
    const moodImprovement = (activityData.mood_after || 5) - (activityData.mood_before || 5);
    const moodBonus = Math.max(0, moodImprovement * 2);

    const totalPoints = Math.floor((basePoints + durationBonus + moodBonus) * intensityMultiplier);

    // Verificar se user_points existe
    const userPoints = await query(
      'SELECT * FROM user_points WHERE user_id = ?',
      [userId]
    );

    if (userPoints.rows.length === 0) {
      // Criar registro inicial
      await query(`
        INSERT INTO user_points (id, user_id, total_points, current_level, streak_days, last_activity_date)
        VALUES (?, ?, ?, ?, ?, DATE('now'))
      `, [uuidv4(), userId, totalPoints, 1, 1]);
    } else {
      const current = userPoints.rows[0];
      const lastDate = new Date(current.last_activity_date);
      const today = new Date();
      const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

      let newStreak = current.streak_days;
      if (daysDiff === 0) {
        // Mesmo dia - mantém streak
        newStreak = current.streak_days;
      } else if (daysDiff === 1) {
        // Dia consecutivo - aumenta streak
        newStreak = current.streak_days + 1;
      } else {
        // Streak quebrada
        newStreak = 1;
      }

      const newTotal = current.total_points + totalPoints;
      const newLevel = Math.floor(newTotal / 100) + 1;
      const longestStreak = Math.max(current.longest_streak || 0, newStreak);

      await query(`
        UPDATE user_points
        SET total_points = ?,
            current_level = ?,
            streak_days = ?,
            longest_streak = ?,
            last_activity_date = DATE('now'),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `, [newTotal, newLevel, newStreak, longestStreak, userId]);
    }

    // Registrar no histórico
    await query(`
      INSERT INTO points_history (id, user_id, points, reason, activity_id, created_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [uuidv4(), userId, totalPoints, 'activity_completed', activityData.activity_id]);

    return { points: totalPoints };
  }

  /**
   * Verifica e desbloqueia conquistas
   */
  async checkAchievements(userId) {
    // Buscar conquistas ativas
    const achievements = await query('SELECT * FROM achievements WHERE is_active = 1');

    // Buscar estatísticas do usuário
    const stats = await this.getUserStats(userId);
    const userPoints = await query('SELECT * FROM user_points WHERE user_id = ?', [userId]);
    const streak = userPoints.rows[0]?.streak_days || 0;

    const unlockedAchievements = [];

    for (const achievement of achievements.rows) {
      // Verificar se já possui
      const existing = await query(
        'SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
        [userId, achievement.id]
      );

      if (existing.rows.length > 0 && existing.rows[0].is_unlocked) {
        continue; // Já desbloqueada
      }

      let unlocked = false;

      // Verificar condições
      switch (achievement.requirement_type) {
        case 'activity_count':
          unlocked = stats.total_activities >= achievement.requirement_value;
          break;
        case 'streak_days':
          unlocked = streak >= achievement.requirement_value;
          break;
        case 'points':
          unlocked = (userPoints.rows[0]?.total_points || 0) >= achievement.requirement_value;
          break;
      }

      if (unlocked) {
        // Desbloquear conquista
        if (existing.rows.length === 0) {
          await query(`
            INSERT INTO user_achievements (id, user_id, achievement_id, is_unlocked, unlocked_at)
            VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
          `, [uuidv4(), userId, achievement.id]);
        } else {
          await query(`
            UPDATE user_achievements
            SET is_unlocked = 1, unlocked_at = CURRENT_TIMESTAMP
            WHERE user_id = ? AND achievement_id = ?
          `, [userId, achievement.id]);
        }

        // Adicionar pontos de recompensa
        if (achievement.points_reward > 0) {
          await query(`
            UPDATE user_points
            SET total_points = total_points + ?
            WHERE user_id = ?
          `, [achievement.points_reward, userId]);

          await query(`
            INSERT INTO points_history (id, user_id, points, reason, achievement_id)
            VALUES (?, ?, ?, ?, ?)
          `, [uuidv4(), userId, achievement.points_reward, 'achievement_unlocked', achievement.id]);
        }

        // Criar notificação
        await this.createNotification(userId, {
          title: '🏆 Nova Conquista!',
          message: `Você desbloqueou: ${achievement.name}`,
          type: 'achievement',
          priority: 'high',
          related_entity_type: 'achievement',
          related_entity_id: achievement.id
        });

        unlockedAchievements.push(achievement);
      }
    }

    return unlockedAchievements;
  }

  /**
   * Atualiza métricas de bem-estar
   */
  async updateWellnessMetrics(userId, activityData) {
    const today = new Date().toISOString().split('T')[0];

    // Buscar métricas do dia
    const existing = await query(
      'SELECT * FROM wellness_metrics WHERE user_id = ? AND date = ?',
      [userId, today]
    );

    const moodAverage = activityData.mood_after || null;
    const activitiesCompleted = 1;

    if (existing.rows.length === 0) {
      // Criar novo registro
      await query(`
        INSERT INTO wellness_metrics
        (id, user_id, date, mood_average, activities_completed, wellbeing_score)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [uuidv4(), userId, today, moodAverage, activitiesCompleted, moodAverage]);
    } else {
      // Atualizar existente
      const current = existing.rows[0];
      const newMoodAvg = current.mood_average
        ? (current.mood_average + (moodAverage || 0)) / 2
        : moodAverage;
      const newActivities = current.activities_completed + 1;

      await query(`
        UPDATE wellness_metrics
        SET mood_average = ?,
            activities_completed = ?,
            wellbeing_score = ?,
            calculated_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND date = ?
      `, [newMoodAvg, newActivities, newMoodAvg, userId, today]);
    }
  }

  /**
   * Cria notificações relevantes
   */
  async createActivityNotifications(userId, activityData) {
    const userPoints = await query('SELECT * FROM user_points WHERE user_id = ?', [userId]);

    if (userPoints.rows.length === 0) return;

    const { streak_days, current_level } = userPoints.rows[0];

    // Notificação de streak
    if (streak_days === 3 || streak_days === 7 || streak_days % 10 === 0) {
      await this.createNotification(userId, {
        title: '🔥 Sequência Incrível!',
        message: `Você mantém uma sequência de ${streak_days} dias!`,
        type: 'wellness',
        priority: 'normal'
      });
    }

    // Notificação de nível
    if (current_level > 1) {
      const lastLevel = Math.floor((userPoints.rows[0].total_points - 10) / 100) + 1;
      if (current_level > lastLevel) {
        await this.createNotification(userId, {
          title: '⬆️ Subiu de Nível!',
          message: `Parabéns! Você alcançou o nível ${current_level}`,
          type: 'system',
          priority: 'high'
        });
      }
    }
  }

  /**
   * Atualiza progresso de metas
   */
  async updateGoalsProgress(userId, activityData) {
    const goals = await query(
      'SELECT * FROM wellness_goals WHERE user_id = ? AND status = ?',
      [userId, 'active']
    );

    for (const goal of goals.rows) {
      if (goal.goal_type === 'daily_activities') {
        const newValue = goal.current_value + 1;
        const completed = newValue >= goal.target_value;

        await query(`
          UPDATE wellness_goals
          SET current_value = ?,
              status = ?,
              completed_at = ?
          WHERE id = ?
        `, [
          newValue,
          completed ? 'completed' : 'active',
          completed ? new Date().toISOString() : null,
          goal.id
        ]);

        if (completed) {
          await this.createNotification(userId, {
            title: '🎯 Meta Alcançada!',
            message: `Você completou sua meta: ${goal.goal_type}`,
            type: 'wellness',
            priority: 'high'
          });
        }
      }
    }
  }

  /**
   * Registra entrada no diário com análise de IA
   * NOTA: NÃO salva a entrada novamente - ela já foi salva pelo whatsappService.diaryStorage
   */
  async registerDiaryEntry(userId, content, metadata = {}, existingEntryId = null) {
    // Usar o ID da entrada existente ou gerar um novo (caso seja chamado standalone)
    const entryId = existingEntryId || uuidv4();

    try {
      // NÃO criar entrada duplicada - ela já foi salva no index.js
      // Apenas processar análise e métricas

      // 1. Analisar sentimento (simulado - pode integrar com API real)
      const analysis = this.analyzeSentiment(content);

      // 3. Salvar análise de IA
      await query(`
        INSERT INTO diary_ai_analysis
        (id, diary_entry_id, user_id, sentiment_score, sentiment_label,
         emotions_detected, stress_level, wellbeing_score, analyzed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        uuidv4(),
        entryId,
        userId,
        analysis.sentiment_score,
        analysis.sentiment_label,
        JSON.stringify(analysis.emotions),
        analysis.stress_level,
        analysis.wellbeing_score
      ]);

      // 4. Atualizar métricas
      await this.updateWellnessMetricsFromDiary(userId, analysis);

      // 5. Verificar conquistas
      await this.checkAchievements(userId);

      // 6. Criar notificações se necessário
      if (analysis.needs_attention) {
        await this.createNotification(userId, {
          title: '💙 Estamos aqui por você',
          message: 'Notamos que você pode estar passando por um momento difícil. Considere fazer uma atividade de bem-estar.',
          type: 'wellness',
          priority: 'high'
        });
      }

      return { entryId, analysis, success: true };
    } catch (error) {
      console.error('Erro ao registrar entrada no diário:', error);
      throw error;
    }
  }

  /**
   * Análise de sentimento simplificada
   */
  analyzeSentiment(text) {
    // Palavras positivas e negativas (simplificado)
    const positiveWords = ['feliz', 'alegre', 'ótimo', 'bem', 'bom', 'excelente', 'amor', 'paz'];
    const negativeWords = ['triste', 'mal', 'ruim', 'difícil', 'stress', 'ansioso', 'preocupado', 'cansado'];

    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveCount++;
    });

    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeCount++;
    });

    const sentiment_score = (positiveCount - negativeCount) / Math.max(1, positiveCount + negativeCount);
    const sentiment_label = sentiment_score > 0.2 ? 'positive' :
                           sentiment_score < -0.2 ? 'negative' : 'neutral';

    const stress_level = negativeCount > 2 ? 'high' : negativeCount > 0 ? 'medium' : 'low';
    const wellbeing_score = Math.max(1, Math.min(10, 5 + sentiment_score * 5));

    return {
      sentiment_score,
      sentiment_label,
      emotions: positiveCount > negativeCount ? ['joy', 'contentment'] : ['concern', 'reflection'],
      stress_level,
      wellbeing_score: Math.round(wellbeing_score),
      needs_attention: negativeCount > 3
    };
  }

  /**
   * Atualiza métricas de bem-estar a partir do diário
   */
  async updateWellnessMetricsFromDiary(userId, analysis) {
    const today = new Date().toISOString().split('T')[0];

    const existing = await query(
      'SELECT * FROM wellness_metrics WHERE user_id = ? AND date = ?',
      [userId, today]
    );

    const stressValue = { low: 3, medium: 6, high: 9 }[analysis.stress_level];

    if (existing.rows.length === 0) {
      await query(`
        INSERT INTO wellness_metrics
        (id, user_id, date, stress_level, diary_entries_count, wellbeing_score)
        VALUES (?, ?, ?, ?, 1, ?)
      `, [uuidv4(), userId, today, stressValue, analysis.wellbeing_score]);
    } else {
      await query(`
        UPDATE wellness_metrics
        SET stress_level = ?,
            diary_entries_count = diary_entries_count + 1,
            wellbeing_score = (COALESCE(wellbeing_score, 0) + ?) / 2
        WHERE user_id = ? AND date = ?
      `, [stressValue, analysis.wellbeing_score, userId, today]);
    }
  }

  /**
   * Cria uma notificação
   */
  async createNotification(userId, notificationData) {
    return await query(`
      INSERT INTO notifications
      (id, user_id, title, message, type, priority, related_entity_type, related_entity_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      userId,
      notificationData.title,
      notificationData.message,
      notificationData.type,
      notificationData.priority || 'normal',
      notificationData.related_entity_type || null,
      notificationData.related_entity_id || null
    ]);
  }

  /**
   * Obtém estatísticas do usuário
   */
  async getUserStats(userId) {
    const activities = await query(
      'SELECT COUNT(*) as count FROM user_activities WHERE user_id = ?',
      [userId]
    );
    const diaryEntries = await query(
      'SELECT COUNT(*) as count FROM diary_entries WHERE user_id = ?',
      [userId]
    );

    return {
      total_activities: activities.rows[0]?.count || 0,
      total_diary_entries: diaryEntries.rows[0]?.count || 0
    };
  }
}

module.exports = new IntegrationService();
