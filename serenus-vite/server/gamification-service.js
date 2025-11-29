/**
 * Serviço de Gamificação
 * Sistema de pontos, níveis, conquistas e badges
 */

const crypto = require('crypto');

class GamificationService {
  constructor() {
    this.levels = [
      { level: 1, name: 'Iniciante', minPoints: 0, maxPoints: 99, color: '#94a3b8' },
      { level: 2, name: 'Aprendiz', minPoints: 100, maxPoints: 249, color: '#60a5fa' },
      { level: 3, name: 'Explorador', minPoints: 250, maxPoints: 499, color: '#34d399' },
      { level: 4, name: 'Praticante', minPoints: 500, maxPoints: 999, color: '#fbbf24' },
      { level: 5, name: 'Dedicado', minPoints: 1000, maxPoints: 1999, color: '#f97316' },
      { level: 6, name: 'Mestre do Bem-estar', minPoints: 2000, maxPoints: Infinity, color: '#a855f7' }
    ];

    this.achievements = [
      {
        id: 'first_mood',
        name: 'Primeiro Passo',
        description: 'Registre seu primeiro humor',
        icon: '🎯',
        points: 10,
        category: 'inicio'
      },
      {
        id: 'first_activity',
        name: 'Primeira Atividade',
        description: 'Complete sua primeira atividade de bem-estar',
        icon: '🧘',
        points: 20,
        category: 'atividades'
      },
      {
        id: 'streak_3',
        name: 'Consistência',
        description: '3 dias seguidos registrando',
        icon: '🔥',
        points: 30,
        category: 'sequencia'
      },
      {
        id: 'streak_7',
        name: 'Uma Semana Forte',
        description: '7 dias seguidos registrando',
        icon: '⭐',
        points: 50,
        category: 'sequencia'
      },
      {
        id: 'streak_30',
        name: 'Mês Perfeito',
        description: '30 dias seguidos registrando',
        icon: '👑',
        points: 200,
        category: 'sequencia'
      },
      {
        id: 'meditation_5',
        name: 'Meditador Iniciante',
        description: 'Complete 5 meditações',
        icon: '🧘‍♀️',
        points: 40,
        category: 'meditacao'
      },
      {
        id: 'meditation_20',
        name: 'Zen Master',
        description: 'Complete 20 meditações',
        icon: '☯️',
        points: 100,
        category: 'meditacao'
      },
      {
        id: 'positive_week',
        name: 'Semana Positiva',
        description: '7 dias seguidos com humor positivo (4-5)',
        icon: '😄',
        points: 60,
        category: 'humor'
      },
      {
        id: 'diary_10',
        name: 'Escritor',
        description: 'Escreva 10 entradas no diário',
        icon: '📖',
        points: 50,
        category: 'diario'
      },
      {
        id: 'early_bird',
        name: 'Madrugador',
        description: 'Registre humor antes das 8h',
        icon: '🌅',
        points: 15,
        category: 'especial'
      },
      {
        id: 'night_owl',
        name: 'Coruja Noturna',
        description: 'Complete atividade após 22h',
        icon: '🦉',
        points: 15,
        category: 'especial'
      },
      {
        id: 'weekend_warrior',
        name: 'Guerreiro de Fim de Semana',
        description: 'Mantenha sequência no fim de semana',
        icon: '⚡',
        points: 25,
        category: 'especial'
      }
    ];
  }

  /**
   * Inicializa tabelas de gamificação
   * Em produção (PostgreSQL), as tabelas já são criadas em init-database-render.js
   */
  async initializeTables(dbModule) {
    // Em produção, as tabelas já foram criadas
    if (process.env.NODE_ENV === 'production') {
      console.log('✅ Gamification: PostgreSQL (tabelas já criadas)');
      return Promise.resolve();
    }

    const db = dbModule.db;

    // Verificar se db existe (SQLite)
    if (!db || !db.run) {
      console.log('✅ Gamification: PostgreSQL (tabelas já criadas)');
      return Promise.resolve();
    }

    // SQLite (desenvolvimento local)
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        // Tabela de pontos do usuário
        db.run(`
          CREATE TABLE IF NOT EXISTS user_points (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            total_points INTEGER DEFAULT 0,
            current_level INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id)
          );
        `);

        // Tabela de conquistas desbloqueadas
        db.run(`
          CREATE TABLE IF NOT EXISTS user_achievements (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            achievement_id TEXT NOT NULL,
            unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            points_earned INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, achievement_id)
          );
        `);

        // Tabela de histórico de pontos
        db.run(`
          CREATE TABLE IF NOT EXISTS points_history (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            points INTEGER NOT NULL,
            action TEXT NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          );
        `);

        db.get("SELECT 1", (err) => {
          if (err) {
            console.error('❌ Erro ao criar tabelas de gamificação SQLite:', err);
            reject(err);
          } else {
            console.log('✅ Tabelas de gamificação SQLite inicializadas');
            resolve();
          }
        });
      });
    });
  }

  /**
   * Obtém nível baseado nos pontos
   */
  getLevelByPoints(points) {
    return this.levels.find(l => points >= l.minPoints && points <= l.maxPoints) || this.levels[0];
  }

  /**
   * Adiciona pontos ao usuário
   */
  async addPoints(dbModule, userId, points, action, description) {
    const db = dbModule.db;

    return new Promise(async (resolve, reject) => {
      try {
        // Buscar pontos atuais
        const currentData = await new Promise((res, rej) => {
          db.get('SELECT * FROM user_points WHERE user_id = ?', [userId], (err, row) => {
            if (err) rej(err);
            else res(row);
          });
        });

        const currentPoints = currentData ? currentData.total_points : 0;
        const newPoints = currentPoints + points;
        const oldLevel = this.getLevelByPoints(currentPoints);
        const newLevel = this.getLevelByPoints(newPoints);

        // Atualizar ou inserir pontos
        if (currentData) {
          db.run(
            'UPDATE user_points SET total_points = ?, current_level = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
            [newPoints, newLevel.level, userId]
          );
        } else {
          const id = crypto.randomUUID();
          db.run(
            'INSERT INTO user_points (id, user_id, total_points, current_level) VALUES (?, ?, ?, ?)',
            [id, userId, newPoints, newLevel.level]
          );
        }

        // Adicionar ao histórico
        const historyId = crypto.randomUUID();
        db.run(
          'INSERT INTO points_history (id, user_id, points, action, description) VALUES (?, ?, ?, ?, ?)',
          [historyId, userId, points, action, description]
        );

        const leveledUp = newLevel.level > oldLevel.level;

        resolve({
          success: true,
          pointsAdded: points,
          totalPoints: newPoints,
          oldLevel: oldLevel.level,
          newLevel: newLevel.level,
          leveledUp,
          levelName: newLevel.name,
          levelColor: newLevel.color
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Desbloqueia conquista
   */
  async unlockAchievement(dbModule, userId, achievementId) {
    const db = dbModule.db;
    const achievement = this.achievements.find(a => a.id === achievementId);

    if (!achievement) {
      return { success: false, error: 'Conquista não encontrada' };
    }

    return new Promise(async (resolve, reject) => {
      try {
        // Verificar se já foi desbloqueada
        const existing = await new Promise((res, rej) => {
          db.get(
            'SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
            [userId, achievementId],
            (err, row) => {
              if (err) rej(err);
              else res(row);
            }
          );
        });

        if (existing) {
          return resolve({ success: false, alreadyUnlocked: true });
        }

        // Desbloquear conquista
        const id = crypto.randomUUID();
        db.run(
          'INSERT INTO user_achievements (id, user_id, achievement_id, points_earned) VALUES (?, ?, ?, ?)',
          [id, userId, achievementId, achievement.points]
        );

        // Adicionar pontos
        const pointsResult = await this.addPoints(
          dbModule,
          userId,
          achievement.points,
          'achievement',
          `Conquista: ${achievement.name}`
        );

        resolve({
          success: true,
          achievement,
          ...pointsResult
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Verifica e desbloqueia conquistas automaticamente
   */
  async checkAndUnlockAchievements(dbModule, userId, context = {}) {
    const unlockedAchievements = [];

    try {
      const { action, streak, moodCount, activityType, activityCount, hour } = context;

      // Primeira entrada de humor
      if (action === 'first_mood' && moodCount === 1) {
        const result = await this.unlockAchievement(dbModule, userId, 'first_mood');
        if (result.success) unlockedAchievements.push(result);
      }

      // Primeira atividade
      if (action === 'first_activity' && activityCount === 1) {
        const result = await this.unlockAchievement(dbModule, userId, 'first_activity');
        if (result.success) unlockedAchievements.push(result);
      }

      // Sequências
      if (streak === 3) {
        const result = await this.unlockAchievement(dbModule, userId, 'streak_3');
        if (result.success) unlockedAchievements.push(result);
      }
      if (streak === 7) {
        const result = await this.unlockAchievement(dbModule, userId, 'streak_7');
        if (result.success) unlockedAchievements.push(result);
      }
      if (streak === 30) {
        const result = await this.unlockAchievement(dbModule, userId, 'streak_30');
        if (result.success) unlockedAchievements.push(result);
      }

      // Meditações
      if (activityType === 'meditation') {
        if (activityCount === 5) {
          const result = await this.unlockAchievement(dbModule, userId, 'meditation_5');
          if (result.success) unlockedAchievements.push(result);
        }
        if (activityCount === 20) {
          const result = await this.unlockAchievement(dbModule, userId, 'meditation_20');
          if (result.success) unlockedAchievements.push(result);
        }
      }

      // Madrugador
      if (hour && hour < 8) {
        const result = await this.unlockAchievement(dbModule, userId, 'early_bird');
        if (result.success) unlockedAchievements.push(result);
      }

      // Coruja noturna
      if (hour && hour >= 22) {
        const result = await this.unlockAchievement(dbModule, userId, 'night_owl');
        if (result.success) unlockedAchievements.push(result);
      }

      return unlockedAchievements;
    } catch (error) {
      console.error('Erro ao verificar conquistas:', error);
      return unlockedAchievements;
    }
  }

  /**
   * Obtém dados de gamificação do usuário
   */
  async getUserGamificationData(dbModule, userId) {
    const db = dbModule.db;

    return new Promise(async (resolve, reject) => {
      try {
        // Pontos e nível
        const pointsData = await new Promise((res, rej) => {
          db.get('SELECT * FROM user_points WHERE user_id = ?', [userId], (err, row) => {
            if (err) rej(err);
            else res(row || { total_points: 0, current_level: 1 });
          });
        });

        const level = this.getLevelByPoints(pointsData.total_points);
        const nextLevel = this.levels.find(l => l.level === level.level + 1);
        const progressToNext = nextLevel
          ? ((pointsData.total_points - level.minPoints) / (nextLevel.minPoints - level.minPoints)) * 100
          : 100;

        // Conquistas desbloqueadas
        const achievements = await new Promise((res, rej) => {
          db.all(
            'SELECT * FROM user_achievements WHERE user_id = ? ORDER BY unlocked_at DESC',
            [userId],
            (err, rows) => {
              if (err) rej(err);
              else res(rows || []);
            }
          );
        });

        const unlockedIds = achievements.map(a => a.achievement_id);
        const unlockedAchievements = this.achievements
          .filter(a => unlockedIds.includes(a.id))
          .map(a => ({
            ...a,
            unlocked_at: achievements.find(ua => ua.achievement_id === a.id).unlocked_at
          }));

        const lockedAchievements = this.achievements.filter(a => !unlockedIds.includes(a.id));

        resolve({
          success: true,
          points: pointsData.total_points,
          level: level.level,
          levelName: level.name,
          levelColor: level.color,
          nextLevel: nextLevel ? nextLevel.name : null,
          pointsToNextLevel: nextLevel ? nextLevel.minPoints - pointsData.total_points : 0,
          progressToNextLevel: Math.round(progressToNext),
          unlockedAchievements,
          lockedAchievements,
          totalAchievements: this.achievements.length,
          unlockedCount: unlockedAchievements.length
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = { GamificationService };
