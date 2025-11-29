/**
 * Sistema de Configuração de Atividades/Sessões por Empresa
 */

// Atividades/Sessões disponíveis no sistema
const AVAILABLE_ACTIVITIES = {
  diary: {
    id: 'diary',
    name: 'Diário Emocional',
    description: 'Registro diário de humor e sentimentos',
    icon: 'BookHeart',
    category: 'core'
  },
  meditation: {
    id: 'meditation',
    name: 'Meditação Guiada',
    description: 'Sessões de meditação para relaxamento',
    icon: 'Brain',
    category: 'wellness'
  },
  breathing: {
    id: 'breathing',
    name: 'Exercícios de Respiração',
    description: 'Técnicas de respiração para ansiedade',
    icon: 'Wind',
    category: 'wellness'
  },
  gratitude: {
    id: 'gratitude',
    name: 'Diário de Gratidão',
    description: 'Prática diária de gratidão',
    icon: 'Heart',
    category: 'mindfulness'
  },
  goals: {
    id: 'goals',
    name: 'Metas e Objetivos',
    description: 'Acompanhamento de metas pessoais',
    icon: 'Target',
    category: 'productivity'
  },
  mood_tracker: {
    id: 'mood_tracker',
    name: 'Rastreador de Humor',
    description: 'Gráficos e análises de humor',
    icon: 'TrendingUp',
    category: 'analytics'
  },
  chat: {
    id: 'chat',
    name: 'Chat com RH',
    description: 'Conversa com equipe de RH',
    icon: 'MessageCircle',
    category: 'support'
  },
  resources: {
    id: 'resources',
    name: 'Recursos de Bem-Estar',
    description: 'Artigos, vídeos e materiais',
    icon: 'Library',
    category: 'education'
  },
  emergency: {
    id: 'emergency',
    name: 'Suporte de Emergência',
    description: 'Contatos de apoio imediato',
    icon: 'Phone',
    category: 'support'
  },
  achievements: {
    id: 'achievements',
    name: 'Conquistas',
    description: 'Sistema de gamificação',
    icon: 'Award',
    category: 'engagement'
  }
};

/**
 * Inicializa tabelas de configuração
 */
function initializeActivityTables(dbModule) {
  const db = dbModule.db;

  // Tabela de configurações por empresa
  db.run(`
    CREATE TABLE IF NOT EXISTS company_activity_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company TEXT NOT NULL,
      activity_id TEXT NOT NULL,
      enabled BOOLEAN DEFAULT TRUE,
      custom_settings TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(company, activity_id)
    )
  `);

  // Inserir configuração padrão para empresa "geral"
  db.get('SELECT COUNT(*) as count FROM company_activity_config WHERE company = ?', ['geral'], (err, row) => {
    if (!err && row.count === 0) {
      // Habilitar todas as atividades para empresa "geral"
      Object.keys(AVAILABLE_ACTIVITIES).forEach(activityId => {
        db.run(
          'INSERT INTO company_activity_config (company, activity_id, enabled) VALUES (?, ?, ?)',
          ['geral', activityId, true]
        );
      });
      console.log('✅ Configuração padrão criada para empresa "geral"');
    }
  });

  console.log('✅ Tabelas de configuração de atividades inicializadas');
}

/**
 * Busca configuração de atividades de uma empresa
 */
function getCompanyActivities(dbModule, company) {
  const db = dbModule.db;

  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        activity_id,
        enabled,
        custom_settings
      FROM company_activity_config
      WHERE company = ?
    `;

    db.all(sql, [company], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      // Se não houver configuração, retornar todas desabilitadas
      if (!rows || rows.length === 0) {
        const allActivities = Object.keys(AVAILABLE_ACTIVITIES).map(id => ({
          ...AVAILABLE_ACTIVITIES[id],
          enabled: false,
          custom_settings: null
        }));
        resolve(allActivities);
        return;
      }

      // Mapear configurações
      const activities = Object.keys(AVAILABLE_ACTIVITIES).map(id => {
        const config = rows.find(r => r.activity_id === id);
        return {
          ...AVAILABLE_ACTIVITIES[id],
          enabled: config ? Boolean(config.enabled) : false,
          custom_settings: config?.custom_settings ? JSON.parse(config.custom_settings) : null
        };
      });

      resolve(activities);
    });
  });
}

/**
 * Atualiza configuração de uma atividade
 */
function updateActivityConfig(dbModule, company, activityId, enabled, customSettings = null) {
  const db = dbModule.db;

  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO company_activity_config (company, activity_id, enabled, custom_settings, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(company, activity_id)
      DO UPDATE SET
        enabled = excluded.enabled,
        custom_settings = excluded.custom_settings,
        updated_at = CURRENT_TIMESTAMP
    `;

    const settings = customSettings ? JSON.stringify(customSettings) : null;

    db.run(sql, [company, activityId, enabled ? 1 : 0, settings], function(err) {
      if (err) {
        reject(err);
        return;
      }

      resolve({ success: true, changes: this.changes });
    });
  });
}

/**
 * Copia configuração de uma empresa para outra
 */
function copyCompanyConfig(dbModule, fromCompany, toCompany) {
  const db = dbModule.db;

  return new Promise((resolve, reject) => {
    // Buscar configurações da empresa origem
    const selectSql = 'SELECT activity_id, enabled, custom_settings FROM company_activity_config WHERE company = ?';

    db.all(selectSql, [fromCompany], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      if (!rows || rows.length === 0) {
        reject(new Error('Empresa origem não encontrada'));
        return;
      }

      // Deletar configurações existentes da empresa destino
      db.run('DELETE FROM company_activity_config WHERE company = ?', [toCompany], (delErr) => {
        if (delErr) {
          reject(delErr);
          return;
        }

        // Inserir novas configurações
        const insertSql = 'INSERT INTO company_activity_config (company, activity_id, enabled, custom_settings) VALUES (?, ?, ?, ?)';
        let completed = 0;

        rows.forEach(row => {
          db.run(insertSql, [toCompany, row.activity_id, row.enabled, row.custom_settings], (insertErr) => {
            if (insertErr) {
              reject(insertErr);
              return;
            }

            completed++;
            if (completed === rows.length) {
              resolve({ success: true, copied: rows.length });
            }
          });
        });
      });
    });
  });
}

/**
 * Atividades habilitadas para um usuário (baseado na empresa)
 */
function getUserEnabledActivities(dbModule, userId) {
  const db = dbModule.db;

  return new Promise((resolve, reject) => {
    // Primeiro buscar a empresa do usuário
    db.get('SELECT company FROM users WHERE id = ?', [userId], async (err, user) => {
      if (err) {
        reject(err);
        return;
      }

      if (!user) {
        reject(new Error('Usuário não encontrado'));
        return;
      }

      const company = user.company || 'geral';

      // Buscar atividades habilitadas
      try {
        const activities = await getCompanyActivities(dbModule, company);
        const enabled = activities.filter(a => a.enabled);
        resolve(enabled);
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * Rotas da API
 */
function setupActivityConfigRoutes(app, dbModule) {
  /**
   * GET /api/admin/activities/available
   * Lista todas as atividades disponíveis
   */
  app.get('/api/admin/activities/available', (req, res) => {
    res.json({
      success: true,
      activities: Object.values(AVAILABLE_ACTIVITIES)
    });
  });

  /**
   * GET /api/admin/activities/company/:company
   * Busca configuração de uma empresa
   */
  app.get('/api/admin/activities/company/:company', async (req, res) => {
    try {
      const { company } = req.params;
      const activities = await getCompanyActivities(dbModule, company);

      res.json({
        success: true,
        company,
        activities
      });
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      res.status(500).json({ error: 'Erro ao buscar configuração' });
    }
  });

  /**
   * PUT /api/admin/activities/company/:company/:activityId
   * Atualiza configuração de uma atividade
   */
  app.put('/api/admin/activities/company/:company/:activityId', async (req, res) => {
    try {
      const { company, activityId } = req.params;
      const { enabled, customSettings } = req.body;

      const result = await updateActivityConfig(dbModule, company, activityId, enabled, customSettings);

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      res.status(500).json({ error: 'Erro ao atualizar configuração' });
    }
  });

  /**
   * POST /api/admin/activities/copy
   * Copia configuração de uma empresa para outra
   */
  app.post('/api/admin/activities/copy', async (req, res) => {
    try {
      const { fromCompany, toCompany } = req.body;

      if (!fromCompany || !toCompany) {
        return res.status(400).json({ error: 'fromCompany e toCompany são obrigatórios' });
      }

      const result = await copyCompanyConfig(dbModule, fromCompany, toCompany);

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Erro ao copiar configuração:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/user/activities/enabled
   * Retorna atividades habilitadas para o usuário logado
   */
  app.get('/api/user/activities/enabled', async (req, res) => {
    try {
      const userId = req.query.userId || req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const activities = await getUserEnabledActivities(dbModule, userId);

      res.json({
        success: true,
        activities
      });
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
      res.status(500).json({ error: error.message });
    }
  });

  console.log('✅ Rotas de configuração de atividades configuradas');
}

module.exports = {
  AVAILABLE_ACTIVITIES,
  initializeActivityTables,
  getCompanyActivities,
  updateActivityConfig,
  copyCompanyConfig,
  getUserEnabledActivities,
  setupActivityConfigRoutes
};
