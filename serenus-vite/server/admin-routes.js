/**
 * Rotas de Admin - CRUD de Empresas, Departamentos e Analytics
 */

const crypto = require('crypto');

function generateUUID() {
  return crypto.randomUUID();
}

function getBrasiliaDate() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
}

async function createAuditLog(dbModule, userId, userEmail, action, entityType, entityId, details, req) {
  try {
    const logId = generateUUID();
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    await dbModule.query(
      `INSERT INTO audit_logs (id, user_id, user_email, action, entity_type, entity_id, details, ip_address, user_agent, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [logId, userId, userEmail, action, entityType, entityId, JSON.stringify(details), ipAddress, userAgent, getBrasiliaDate()]
    );

    console.log(`📋 Audit Log: ${userEmail} - ${action} - ${entityType}`);
  } catch (error) {
    console.error('Erro ao criar log de auditoria:', error);
  }
}

function setupAdminRoutes(app, dbModule) {
  // ============= CRUD DE DEPARTAMENTOS =============

  // Listar departamentos (Admin)
  app.get('/api/admin/departments', async (req, res) => {
    try {
      const { companyId } = req.query;
      let query = `
        SELECT d.*, c.name as company_name, u.name as manager_name, pd.name as parent_name
        FROM departments d
        LEFT JOIN companies c ON d.company_id = c.id
        LEFT JOIN users u ON d.manager_id = u.id
        LEFT JOIN departments pd ON d.parent_department_id = pd.id
      `;
      const params = [];

      if (companyId) {
        query += ' WHERE d.company_id = $1';
        params.push(companyId);
      }

      query += ' ORDER BY c.name, d.name';

      const result = await dbModule.query(query, params);
      res.json({ success: true, departments: result.rows });
    } catch (error) {
      console.error('Erro ao listar departamentos:', error);
      res.status(500).json({ error: 'Erro ao listar departamentos', details: error.message });
    }
  });

  // Criar departamento (Admin)
  app.post('/api/admin/departments', async (req, res) => {
    try {
      const { name, company_id, description, parent_department_id, manager_id, adminUserId, adminEmail } = req.body;

      if (!name || !company_id) {
        return res.status(400).json({ error: 'Nome e empresa são obrigatórios' });
      }

      const departmentId = generateUUID();

      await dbModule.query(
        'INSERT INTO departments (id, name, company_id, description, parent_department_id, manager_id) VALUES ($1, $2, $3, $4, $5, $6)',
        [departmentId, name, company_id, description || '', parent_department_id || null, manager_id || null]
      );

      await createAuditLog(
        dbModule,
        adminUserId || 'system',
        adminEmail || 'system',
        'CREATE_DEPARTMENT',
        'department',
        departmentId,
        { name, company_id, description },
        req
      );

      res.json({ success: true, message: 'Departamento criado com sucesso', departmentId });
    } catch (error) {
      console.error('Erro ao criar departamento:', error);
      res.status(500).json({ error: 'Erro ao criar departamento', details: error.message });
    }
  });

  // Atualizar departamento (Admin)
  app.put('/api/admin/departments/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, company_id, description, parent_department_id, manager_id, adminUserId, adminEmail } = req.body;

      await dbModule.query(
        'UPDATE departments SET name = $1, company_id = $2, description = $3, parent_department_id = $4, manager_id = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6',
        [name, company_id, description || '', parent_department_id || null, manager_id || null, id]
      );

      await createAuditLog(
        dbModule,
        adminUserId || 'system',
        adminEmail || 'system',
        'UPDATE_DEPARTMENT',
        'department',
        id,
        { name, company_id, description },
        req
      );

      res.json({ success: true, message: 'Departamento atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar departamento:', error);
      res.status(500).json({ error: 'Erro ao atualizar departamento', details: error.message });
    }
  });

  // Deletar departamento (Admin)
  app.delete('/api/admin/departments/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { adminUserId, adminEmail, departmentName } = req.query;

      await dbModule.query('DELETE FROM departments WHERE id = $1', [id]);

      await createAuditLog(
        dbModule,
        adminUserId || 'system',
        adminEmail || 'system',
        'DELETE_DEPARTMENT',
        'department',
        id,
        { deletedDepartment: departmentName || id },
        req
      );

      res.json({ success: true, message: 'Departamento deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar departamento:', error);
      res.status(500).json({ error: 'Erro ao deletar departamento', details: error.message });
    }
  });

  // ============= ANALYTICS ENDPOINTS =============

  // Analytics - Métricas gerais com filtros e comparação temporal
  app.get('/api/admin/analytics/overview', async (req, res) => {
    try {
      const { companyId, departmentId, startDate, endDate } = req.query;

      const now = getBrasiliaDate();
      const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
      const end = endDate ? new Date(endDate) : now;

      const periodDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - periodDays);
      const prevEnd = new Date(end);
      prevEnd.setDate(prevEnd.getDate() - periodDays);

      let userFilter = '';
      let params = [start, end, prevStart, prevEnd];
      let paramIndex = 5;

      if (companyId) {
        userFilter += ` AND u.company_id = $${paramIndex}`;
        params.push(companyId);
        paramIndex++;
      }

      if (departmentId) {
        userFilter += ` AND u.department_id = $${paramIndex}`;
        params.push(departmentId);
        paramIndex++;
      }

      const currentQuery = `
        SELECT
          COUNT(DISTINCT u.id) as total_users,
          COUNT(DISTINCT de.id) as total_entries,
          AVG(COALESCE(de.sentiment_score, 3)) as avg_mood,
          COUNT(DISTINCT CASE WHEN de.sentiment_score >= 4 THEN de.id END) as positive_entries,
          COUNT(DISTINCT CASE WHEN de.sentiment_score <= 2 THEN de.id END) as negative_entries,
          COUNT(DISTINCT CASE WHEN de.sentiment_score = 3 THEN de.id END) as neutral_entries
        FROM users u
        LEFT JOIN diary_entries de ON de.user_id = u.id AND de.timestamp BETWEEN $1 AND $2
        WHERE 1=1 ${userFilter}
      `;

      const previousQuery = currentQuery.replace('$1 AND $2', '$3 AND $4');

      const [currentResult, previousResult] = await Promise.all([
        dbModule.query(currentQuery, params),
        dbModule.query(previousQuery, params)
      ]);

      const current = currentResult.rows[0];
      const previous = previousResult.rows[0];

      const calculateChange = (curr, prev) => {
        if (!prev || prev === 0) return curr > 0 ? 100 : 0;
        return ((curr - prev) / prev) * 100;
      };

      res.json({
        success: true,
        period: { start, end },
        current: {
          totalUsers: parseInt(current.total_users) || 0,
          totalEntries: parseInt(current.total_entries) || 0,
          avgMood: parseFloat(current.avg_mood) || 3,
          positiveEntries: parseInt(current.positive_entries) || 0,
          negativeEntries: parseInt(current.negative_entries) || 0,
          neutralEntries: parseInt(current.neutral_entries) || 0
        },
        previous: {
          totalUsers: parseInt(previous.total_users) || 0,
          totalEntries: parseInt(previous.total_entries) || 0,
          avgMood: parseFloat(previous.avg_mood) || 3,
          positiveEntries: parseInt(previous.positive_entries) || 0,
          negativeEntries: parseInt(previous.negative_entries) || 0,
          neutralEntries: parseInt(previous.neutral_entries) || 0
        },
        changes: {
          users: calculateChange(parseInt(current.total_users), parseInt(previous.total_users)),
          entries: calculateChange(parseInt(current.total_entries), parseInt(previous.total_entries)),
          mood: calculateChange(parseFloat(current.avg_mood), parseFloat(previous.avg_mood)),
          positive: calculateChange(parseInt(current.positive_entries), parseInt(previous.positive_entries))
        }
      });
    } catch (error) {
      console.error('Erro ao buscar analytics:', error);
      res.status(500).json({ error: 'Erro ao buscar analytics', details: error.message });
    }
  });

  // Analytics - Timeline (dados para gráfico de linha do tempo)
  app.get('/api/admin/analytics/timeline', async (req, res) => {
    try {
      const { companyId, departmentId, startDate, endDate, groupBy = 'day' } = req.query;

      const now = getBrasiliaDate();
      const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
      const end = endDate ? new Date(endDate) : now;

      let dateFormat;
      if (groupBy === 'hour') {
        dateFormat = "strftime('%Y-%m-%d %H:00:00', de.timestamp)";
      } else if (groupBy === 'week') {
        dateFormat = "strftime('%Y-W%W', de.timestamp)";
      } else if (groupBy === 'month') {
        dateFormat = "strftime('%Y-%m', de.timestamp)";
      } else {
        dateFormat = "DATE(de.timestamp)";
      }

      let userFilter = '';
      let params = [start.toISOString(), end.toISOString()];
      let paramIndex = 3;

      if (companyId) {
        userFilter += ` AND u.company_id = ?`;
        params.push(companyId);
        paramIndex++;
      }

      if (departmentId) {
        userFilter += ` AND u.department_id = ?`;
        params.push(departmentId);
        paramIndex++;
      }

      const query = `
        SELECT
          ${dateFormat} as date,
          COUNT(DISTINCT de.id) as entries_count,
          AVG(COALESCE(de.sentiment_score, 3)) as avg_mood,
          COUNT(DISTINCT CASE WHEN de.sentiment_score >= 4 THEN de.id END) as positive_count,
          COUNT(DISTINCT CASE WHEN de.sentiment_score <= 2 THEN de.id END) as negative_count
        FROM diary_entries de
        JOIN users u ON de.user_id = u.id
        WHERE de.timestamp BETWEEN ? AND ? ${userFilter}
        GROUP BY ${dateFormat}
        ORDER BY date
      `;

      const result = await dbModule.query(query, params);

      res.json({
        success: true,
        timeline: result.rows.map(row => ({
          date: row.date,
          entriesCount: parseInt(row.entries_count) || 0,
          avgMood: parseFloat(row.avg_mood) || 3,
          positiveCount: parseInt(row.positive_count) || 0,
          negativeCount: parseInt(row.negative_count) || 0
        }))
      });
    } catch (error) {
      console.error('Erro ao buscar timeline:', error);
      res.status(500).json({ error: 'Erro ao buscar timeline', details: error.message });
    }
  });

  // Analytics - Alertas (usuários com humor muito baixo)
  app.get('/api/admin/analytics/alerts', async (req, res) => {
    try {
      const { companyId, departmentId, threshold = 2.5, days = 7 } = req.query;

      const now = getBrasiliaDate();
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - parseInt(days));

      let userFilter = '';
      let params = [startDate.toISOString(), now.toISOString(), parseFloat(threshold)];

      if (companyId) {
        userFilter += ` AND u.company_id = ?`;
        params.push(companyId);
      }

      if (departmentId) {
        userFilter += ` AND u.department_id = ?`;
        params.push(departmentId);
      }

      const query = `
        SELECT
          u.id,
          u.name,
          u.email,
          u.company,
          u.department,
          AVG(COALESCE(de.sentiment_score, 3)) as avg_mood,
          COUNT(de.id) as entries_count,
          MAX(de.timestamp) as last_entry
        FROM users u
        JOIN diary_entries de ON de.user_id = u.id
        WHERE de.timestamp BETWEEN ? AND ? ${userFilter}
        GROUP BY u.id, u.name, u.email, u.company, u.department
        HAVING AVG(COALESCE(de.sentiment_score, 3)) < ?
        ORDER BY avg_mood ASC
        LIMIT 50
      `;

      const result = await dbModule.query(query, params);

      res.json({
        success: true,
        alerts: result.rows.map(row => ({
          userId: row.id,
          userName: row.name,
          userEmail: row.email,
          company: row.company,
          department: row.department,
          avgMood: parseFloat(row.avg_mood),
          entriesCount: parseInt(row.entries_count),
          lastEntry: row.last_entry,
          severity: row.avg_mood <= 2 ? 'high' : 'medium'
        }))
      });
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      res.status(500).json({ error: 'Erro ao buscar alertas', details: error.message });
    }
  });

  // Analytics - Taxa de engajamento
  app.get('/api/admin/analytics/engagement', async (req, res) => {
    try {
      const { companyId, departmentId, startDate, endDate } = req.query;

      const now = getBrasiliaDate();
      const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
      const end = endDate ? new Date(endDate) : now;

      let userFilter = '';
      let params = [start.toISOString(), end.toISOString()];

      if (companyId) {
        userFilter += ` AND u.company_id = ?`;
        params.push(companyId);
      }

      if (departmentId) {
        userFilter += ` AND u.department_id = ?`;
        params.push(departmentId);
      }

      const totalUsersQuery = `
        SELECT COUNT(DISTINCT u.id) as total
        FROM users u
        WHERE 1=1 ${userFilter}
      `;

      const activeUsersQuery = `
        SELECT COUNT(DISTINCT u.id) as active
        FROM users u
        JOIN diary_entries de ON de.user_id = u.id
        WHERE de.timestamp BETWEEN ? AND ? ${userFilter}
      `;

      const last7Days = new Date(now);
      last7Days.setDate(last7Days.getDate() - 7);
      const veryActiveQuery = `
        SELECT COUNT(DISTINCT u.id) as very_active
        FROM users u
        JOIN diary_entries de ON de.user_id = u.id
        WHERE de.timestamp BETWEEN ? AND ? ${userFilter}
      `;

      const veryActiveParams = [last7Days.toISOString(), now.toISOString()];
      if (companyId) veryActiveParams.push(companyId);
      if (departmentId) veryActiveParams.push(departmentId);

      const [totalResult, activeResult, veryActiveResult] = await Promise.all([
        dbModule.query(totalUsersQuery, companyId || departmentId ? params.slice(2) : []),
        dbModule.query(activeUsersQuery, params),
        dbModule.query(veryActiveQuery, veryActiveParams)
      ]);

      const total = parseInt(totalResult.rows[0].total) || 0;
      const active = parseInt(activeResult.rows[0].active) || 0;
      const veryActive = parseInt(veryActiveResult.rows[0].very_active) || 0;

      res.json({
        success: true,
        engagement: {
          totalUsers: total,
          activeUsers: active,
          veryActiveUsers: veryActive,
          engagementRate: total > 0 ? (active / total) * 100 : 0,
          dailyActiveRate: total > 0 ? (veryActive / total) * 100 : 0
        }
      });
    } catch (error) {
      console.error('Erro ao calcular engajamento:', error);
      res.status(500).json({ error: 'Erro ao calcular engajamento', details: error.message });
    }
  });

  console.log('✅ Rotas de admin configuradas: departamentos e analytics');
}

module.exports = { setupAdminRoutes };
