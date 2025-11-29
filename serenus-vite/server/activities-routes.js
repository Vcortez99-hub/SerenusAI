const express = require('express');
const router = express.Router();
const integrationService = require('./integration-service');
const { query } = require('./db-sqlite');
const { v4: uuidv4 } = require('uuid');

/**
 * GET /api/activities
 * Buscar atividades do usuário
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { limit = 50, offset = 0, type } = req.query;

    let sql = `
      SELECT *
      FROM user_activities
      WHERE user_id = ?
    `;
    const params = [userId];

    if (type) {
      sql += ' AND activity_type = ?';
      params.push(type);
    }

    sql += ' ORDER BY completed_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(sql, params);

    // Parsear metadata JSON
    const activities = result.rows.map(activity => ({
      ...activity,
      metadata: activity.metadata ? JSON.parse(activity.metadata) : {}
    }));

    res.json({ activities });
  } catch (error) {
    console.error('Erro ao buscar atividades:', error);
    res.status(500).json({ error: 'Erro ao buscar atividades' });
  }
});

/**
 * POST /api/activities
 * Registrar nova atividade
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const {
      activity_type,
      activity_name,
      description,
      duration_minutes,
      intensity,
      mood_before,
      mood_after,
      notes,
      metadata
    } = req.body;

    // Validação
    if (!activity_type || !activity_name) {
      return res.status(400).json({ error: 'Tipo e nome da atividade são obrigatórios' });
    }

    // Registrar atividade usando o serviço de integração
    const result = await integrationService.registerActivity(userId, {
      activity_type,
      activity_name,
      description,
      duration_minutes,
      intensity,
      mood_before,
      mood_after,
      notes,
      metadata,
      completed_at: new Date().toISOString()
    });

    res.json({
      success: true,
      activityId: result.activityId,
      message: 'Atividade registrada com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao registrar atividade:', error);
    res.status(500).json({ error: 'Erro ao registrar atividade' });
  }
});

/**
 * GET /api/activities/stats
 * Estatísticas de atividades do usuário
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    // Total de atividades
    const total = await query(
      'SELECT COUNT(*) as count FROM user_activities WHERE user_id = ?',
      [userId]
    );

    // Atividades por tipo
    const byType = await query(`
      SELECT activity_type, COUNT(*) as count
      FROM user_activities
      WHERE user_id = ?
      GROUP BY activity_type
    `, [userId]);

    // Atividades nos últimos 7 dias
    const last7Days = await query(`
      SELECT DATE(completed_at) as date, COUNT(*) as count
      FROM user_activities
      WHERE user_id = ? AND completed_at >= datetime('now', '-7 days')
      GROUP BY DATE(completed_at)
      ORDER BY date DESC
    `, [userId]);

    // Média de humor
    const moodStats = await query(`
      SELECT
        AVG(mood_before) as avg_mood_before,
        AVG(mood_after) as avg_mood_after
      FROM user_activities
      WHERE user_id = ? AND mood_before IS NOT NULL AND mood_after IS NOT NULL
    `, [userId]);

    // Tempo total
    const timeStats = await query(`
      SELECT SUM(duration_minutes) as total_minutes
      FROM user_activities
      WHERE user_id = ?
    `, [userId]);

    res.json({
      total: total.rows[0]?.count || 0,
      byType: byType.rows,
      last7Days: last7Days.rows,
      avgMoodBefore: moodStats.rows[0]?.avg_mood_before || 0,
      avgMoodAfter: moodStats.rows[0]?.avg_mood_after || 0,
      totalMinutes: timeStats.rows[0]?.total_minutes || 0
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

/**
 * GET /api/activities/templates
 * Buscar templates de atividades da empresa
 */
router.get('/templates', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    // Buscar empresa do usuário
    const user = await query('SELECT company_id FROM users WHERE id = ?', [userId]);
    const companyId = user.rows[0]?.company_id;

    if (!companyId) {
      return res.json({ templates: [] });
    }

    const result = await query(`
      SELECT *
      FROM company_activity_templates
      WHERE company_id = ? AND is_active = 1
      ORDER BY name
    `, [companyId]);

    const templates = result.rows.map(t => ({
      ...t,
      benefits: t.benefits ? JSON.parse(t.benefits) : []
    }));

    res.json({ templates });
  } catch (error) {
    console.error('Erro ao buscar templates:', error);
    res.status(500).json({ error: 'Erro ao buscar templates' });
  }
});

/**
 * GET /api/activities/goals
 * Buscar metas de bem-estar
 */
router.get('/goals', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const result = await query(`
      SELECT *
      FROM wellness_goals
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [userId]);

    res.json({ goals: result.rows });
  } catch (error) {
    console.error('Erro ao buscar metas:', error);
    res.status(500).json({ error: 'Erro ao buscar metas' });
  }
});

/**
 * POST /api/activities/goals
 * Criar nova meta de bem-estar
 */
router.post('/goals', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { goal_type, target_value, start_date, end_date } = req.body;

    if (!goal_type || !target_value || !start_date) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const goalId = uuidv4();

    await query(`
      INSERT INTO wellness_goals
      (id, user_id, goal_type, target_value, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [goalId, userId, goal_type, target_value, start_date, end_date || null]);

    res.json({
      success: true,
      goalId,
      message: 'Meta criada com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao criar meta:', error);
    res.status(500).json({ error: 'Erro ao criar meta' });
  }
});

/**
 * GET /api/activities/wellness-metrics
 * Buscar métricas de bem-estar
 */
router.get('/wellness-metrics', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { days = 30 } = req.query;

    const result = await query(`
      SELECT *
      FROM wellness_metrics
      WHERE user_id = ? AND date >= date('now', '-${parseInt(days)} days')
      ORDER BY date DESC
    `, [userId]);

    res.json({ metrics: result.rows });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    res.status(500).json({ error: 'Erro ao buscar métricas' });
  }
});

module.exports = router;
