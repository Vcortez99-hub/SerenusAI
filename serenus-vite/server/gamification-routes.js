/**
 * Rotas de API para Gamificação
 * Endpoints: pontos, níveis, conquistas
 */

function setupGamificationRoutes(app, dbModule, gamificationService) {

  /**
   * GET /api/gamification/user/:userId
   * Obtém dados completos de gamificação do usuário
   */
  app.get('/api/gamification/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      const data = await gamificationService.getUserGamificationData(dbModule, userId);
      res.json(data);
    } catch (error) {
      console.error('Erro ao buscar dados de gamificação:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar dados de gamificação'
      });
    }
  });

  /**
   * GET /api/gamification/achievements
   * Lista todas as conquistas disponíveis
   */
  app.get('/api/gamification/achievements', (req, res) => {
    try {
      res.json({
        success: true,
        achievements: gamificationService.achievements,
        levels: gamificationService.levels
      });
    } catch (error) {
      console.error('Erro ao listar conquistas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao listar conquistas'
      });
    }
  });

  /**
   * POST /api/gamification/points
   * Adiciona pontos manualmente (para casos especiais)
   */
  app.post('/api/gamification/points', async (req, res) => {
    try {
      const { userId, points, action, description } = req.body;

      if (!userId || !points || !action) {
        return res.status(400).json({
          success: false,
          error: 'userId, points e action são obrigatórios'
        });
      }

      const result = await gamificationService.addPoints(
        dbModule,
        userId,
        points,
        action,
        description || 'Pontos adicionados manualmente'
      );

      res.json(result);
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao adicionar pontos'
      });
    }
  });

  /**
   * POST /api/gamification/unlock
   * Desbloqueia uma conquista manualmente
   */
  app.post('/api/gamification/unlock', async (req, res) => {
    try {
      const { userId, achievementId } = req.body;

      if (!userId || !achievementId) {
        return res.status(400).json({
          success: false,
          error: 'userId e achievementId são obrigatórios'
        });
      }

      const result = await gamificationService.unlockAchievement(
        dbModule,
        userId,
        achievementId
      );

      res.json(result);
    } catch (error) {
      console.error('Erro ao desbloquear conquista:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao desbloquear conquista'
      });
    }
  });

  /**
   * GET /api/gamification/leaderboard
   * Ranking de usuários por pontos (anônimo)
   */
  app.get('/api/gamification/leaderboard', async (req, res) => {
    try {
      const { companyId, departmentId, limit = 10 } = req.query;
      const db = dbModule.db;

      let sql = `
        SELECT
          u.id,
          u.name,
          u.email,
          u.company,
          u.department,
          COALESCE(up.total_points, 0) as total_points,
          COALESCE(up.current_level, 1) as current_level
        FROM users u
        LEFT JOIN user_points up ON u.id = up.user_id
        WHERE 1=1
      `;
      const params = [];

      if (companyId) {
        sql += ' AND u.company = ?';
        params.push(companyId);
      }

      if (departmentId) {
        sql += ' AND u.department = ?';
        params.push(departmentId);
      }

      sql += ' ORDER BY up.total_points DESC, up.updated_at ASC LIMIT ?';
      params.push(parseInt(limit));

      const leaderboard = await new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      // Anonimizar dados (apenas iniciais)
      const anonymousLeaderboard = leaderboard.map((user, index) => {
        const level = gamificationService.getLevelByPoints(user.total_points);

        return {
          rank: index + 1,
          name: user.name.split(' ').map(n => n[0]).join('') + '***', // "João Silva" → "JS***"
          points: user.total_points,
          level: level.level,
          levelName: level.name,
          levelColor: level.color,
          isCurrentUser: false // O frontend vai marcar o usuário atual
        };
      });

      res.json({
        success: true,
        leaderboard: anonymousLeaderboard,
        totalUsers: leaderboard.length
      });
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar ranking'
      });
    }
  });

  /**
   * GET /api/gamification/history/:userId
   * Histórico de pontos do usuário
   */
  app.get('/api/gamification/history/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = 50 } = req.query;
      const db = dbModule.db;

      const history = await new Promise((resolve, reject) => {
        db.all(
          `SELECT * FROM points_history
           WHERE user_id = ?
           ORDER BY created_at DESC
           LIMIT ?`,
          [userId, parseInt(limit)],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });

      res.json({
        success: true,
        history
      });
    } catch (error) {
      console.error('Erro ao buscar histórico de pontos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar histórico de pontos'
      });
    }
  });

  console.log('✅ Rotas de gamificação configuradas');
}

module.exports = { setupGamificationRoutes };
