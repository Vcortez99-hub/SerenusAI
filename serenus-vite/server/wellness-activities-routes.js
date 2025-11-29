/**
 * Rotas para gerenciamento de atividades de bem-estar por empresa
 */

function setupWellnessActivitiesRoutes(app, dbModule) {
  /**
   * GET /api/admin/wellness-activities
   * Lista todas as atividades de bem-estar com detalhes
   */
  app.get('/api/admin/wellness-activities', (req, res) => {
    // Atividades expandidas com detalhes completos
    const wellnessActivities = [
      {
        id: 'meditation_1',
        title: 'Meditação Guiada',
        description: 'Pratique mindfulness com exercícios de meditação',
        category: 'meditation',
        duration: 10,
        icon: 'brain',
        instructions: [
          'Encontre um lugar tranquilo',
          'Sente-se confortavelmente',
          'Feche os olhos suavemente',
          'Respire profundamente',
          'Observe seus pensamentos sem julgamento'
        ],
        benefits: ['Reduz ansiedade', 'Melhora foco', 'Aumenta clareza mental'],
        enabled: true
      },
      {
        id: 'breathing_1',
        title: 'Respiração 4-7-8',
        description: 'Técnica de respiração para relaxamento',
        category: 'breathing',
        duration: 5,
        icon: 'wind',
        instructions: [
          'Inspire pelo nariz contando até 4',
          'Segure a respiração por 7 segundos',
          'Expire pela boca contando até 8',
          'Repita 4 vezes'
        ],
        benefits: ['Reduz estresse', 'Melhora sono', 'Acalma sistema nervoso'],
        enabled: true
      },
      {
        id: 'gratitude_1',
        title: 'Diário de Gratidão',
        description: 'Liste 3 coisas pelas quais você é grato hoje',
        category: 'gratitude',
        duration: 5,
        icon: 'heart',
        instructions: [
          'Pense em 3 coisas positivas do dia',
          'Escreva por que você é grato por cada uma',
          'Reflita sobre como elas impactaram você',
          'Releia suas anotações anteriores'
        ],
        benefits: ['Aumenta positividade', 'Melhora humor', 'Fortalece relacionamentos'],
        enabled: true
      },
      {
        id: 'movement_1',
        title: 'Alongamento Rápido',
        description: 'Movimentos suaves para relaxar o corpo',
        category: 'movement',
        duration: 7,
        icon: 'activity',
        instructions: [
          'Alongue pescoço girando suavemente',
          'Estique os braços acima da cabeça',
          'Torça o tronco para os lados',
          'Alongue as pernas'
        ],
        benefits: ['Reduz tensão muscular', 'Melhora postura', 'Aumenta energia'],
        enabled: true
      },
      {
        id: 'relaxation_1',
        title: 'Relaxamento Progressivo',
        description: 'Relaxe cada grupo muscular progressivamente',
        category: 'relaxation',
        duration: 15,
        icon: 'moon',
        instructions: [
          'Deite-se confortavelmente',
          'Tensione e relaxe cada grupo muscular',
          'Comece pelos pés e suba até a cabeça',
          'Respire profundamente entre cada grupo'
        ],
        benefits: ['Alivia tensão', 'Melhora qualidade do sono', 'Reduz dor muscular'],
        enabled: true
      },
      {
        id: 'journaling_1',
        title: 'Escrita Terapêutica',
        description: 'Escreva livremente sobre seus sentimentos',
        category: 'journaling',
        duration: 10,
        icon: 'book',
        instructions: [
          'Escreva sem se preocupar com gramática',
          'Expresse seus sentimentos honestamente',
          'Não se censure',
          'Releia depois para reflexão'
        ],
        benefits: ['Processa emoções', 'Aumenta autoconhecimento', 'Reduz estresse'],
        enabled: true
      }
    ];

    res.json({
      success: true,
      activities: wellnessActivities
    });
  });

  /**
   * GET /api/admin/company-activities/:companyId
   * Busca configurações de atividades de uma empresa específica
   */
  app.get('/api/admin/company-activities/:companyId', async (req, res) => {
    try {
      const { companyId } = req.params;

      const sql = `
        SELECT activity_id, enabled, custom_settings
        FROM company_activity_config
        WHERE company = ?
      `;

      const db = dbModule.db;
      db.all(sql, [companyId], (err, rows) => {
        if (err) {
          console.error('Erro ao buscar configurações:', err);
          return res.status(500).json({ error: 'Erro ao buscar configurações' });
        }

        const configs = rows.map(row => ({
          company_id: companyId,
          activity_id: row.activity_id,
          enabled: Boolean(row.enabled),
          customSettings: row.custom_settings ? JSON.parse(row.custom_settings) : null
        }));

        res.json({
          success: true,
          configs
        });
      });
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      res.status(500).json({ error: 'Erro ao buscar configurações' });
    }
  });

  /**
   * POST /api/admin/company-activities
   * Ativa/desativa uma atividade para uma empresa
   */
  app.post('/api/admin/company-activities', async (req, res) => {
    try {
      const { company_id, activity_id, enabled } = req.body;

      if (!company_id || !activity_id) {
        return res.status(400).json({ error: 'company_id e activity_id são obrigatórios' });
      }

      const db = dbModule.db;
      const sql = `
        INSERT INTO company_activity_config (company, activity_id, enabled, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(company, activity_id)
        DO UPDATE SET
          enabled = excluded.enabled,
          updated_at = CURRENT_TIMESTAMP
      `;

      db.run(sql, [company_id, activity_id, enabled ? 1 : 0], function(err) {
        if (err) {
          console.error('Erro ao atualizar atividade:', err);
          return res.status(500).json({ error: 'Erro ao atualizar atividade' });
        }

        res.json({
          success: true,
          changes: this.changes
        });
      });
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
      res.status(500).json({ error: 'Erro ao atualizar atividade' });
    }
  });

  /**
   * POST /api/admin/company-activities/customize
   * Personaliza o conteúdo de uma atividade para uma empresa
   */
  app.post('/api/admin/company-activities/customize', async (req, res) => {
    try {
      const { company_id, activity_id, customTitle, customDescription, customInstructions, videoUrl, richContent } = req.body;

      if (!company_id || !activity_id) {
        return res.status(400).json({ error: 'company_id e activity_id são obrigatórios' });
      }

      const customSettings = {
        customTitle,
        customDescription,
        customInstructions,
        videoUrl,
        richContent
      };

      const db = dbModule.db;
      const sql = `
        INSERT INTO company_activity_config (company, activity_id, custom_settings, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(company, activity_id)
        DO UPDATE SET
          custom_settings = excluded.custom_settings,
          updated_at = CURRENT_TIMESTAMP
      `;

      db.run(sql, [company_id, activity_id, JSON.stringify(customSettings)], function(err) {
        if (err) {
          console.error('Erro ao personalizar atividade:', err);
          return res.status(500).json({ error: 'Erro ao personalizar atividade' });
        }

        res.json({
          success: true,
          changes: this.changes
        });
      });
    } catch (error) {
      console.error('Erro ao personalizar atividade:', error);
      res.status(500).json({ error: 'Erro ao personalizar atividade' });
    }
  });

  /**
   * GET /api/activities/user
   * Busca atividades disponíveis para o usuário logado (filtradas por empresa)
   */
  app.get('/api/activities/user', async (req, res) => {
    try {
      const userId = req.query.userId;

      if (!userId) {
        return res.status(400).json({ error: 'userId é obrigatório' });
      }

      const db = dbModule.db;

      // Buscar empresa do usuário
      const userSql = 'SELECT company FROM users WHERE id = ?';
      db.get(userSql, [userId], (err, userRow) => {
        if (err) {
          console.error('Erro ao buscar usuário:', err);
          return res.status(500).json({ error: 'Erro ao buscar usuário' });
        }

        const userCompany = userRow?.company;

        // Atividades base (padrão)
        const baseActivities = [
          {
            id: 'meditation_1',
            title: 'Meditação Guiada',
            description: 'Pratique mindfulness com exercícios de meditação',
            category: 'meditation',
            duration: 10,
            icon: 'brain',
            instructions: [
              'Encontre um lugar tranquilo',
              'Sente-se confortavelmente',
              'Feche os olhos suavemente',
              'Respire profundamente',
              'Observe seus pensamentos sem julgamento'
            ],
            benefits: ['Reduz ansiedade', 'Melhora foco', 'Aumenta clareza mental'],
            enabled: true
          },
          {
            id: 'breathing_1',
            title: 'Respiração 4-7-8',
            description: 'Técnica de respiração para relaxamento',
            category: 'breathing',
            duration: 5,
            icon: 'wind',
            instructions: [
              'Inspire pelo nariz contando até 4',
              'Segure a respiração por 7 segundos',
              'Expire pela boca contando até 8',
              'Repita 4 vezes'
            ],
            benefits: ['Reduz estresse', 'Melhora sono', 'Acalma sistema nervoso'],
            enabled: true
          },
          {
            id: 'gratitude_1',
            title: 'Diário de Gratidão',
            description: 'Liste 3 coisas pelas quais você é grato hoje',
            category: 'gratitude',
            duration: 5,
            icon: 'heart',
            instructions: [
              'Pense em 3 coisas positivas do dia',
              'Escreva por que você é grato por cada uma',
              'Reflita sobre como elas impactaram você',
              'Releia suas anotações anteriores'
            ],
            benefits: ['Aumenta positividade', 'Melhora humor', 'Fortalece relacionamentos'],
            enabled: true
          },
          {
            id: 'movement_1',
            title: 'Alongamento Rápido',
            description: 'Movimentos suaves para relaxar o corpo',
            category: 'movement',
            duration: 7,
            icon: 'activity',
            instructions: [
              'Alongue pescoço girando suavemente',
              'Estique os braços acima da cabeça',
              'Torça o tronco para os lados',
              'Alongue as pernas'
            ],
            benefits: ['Reduz tensão muscular', 'Melhora postura', 'Aumenta energia'],
            enabled: true
          },
          {
            id: 'relaxation_1',
            title: 'Relaxamento Progressivo',
            description: 'Relaxe cada grupo muscular progressivamente',
            category: 'relaxation',
            duration: 15,
            icon: 'moon',
            instructions: [
              'Deite-se confortavelmente',
              'Tensione e relaxe cada grupo muscular',
              'Comece pelos pés e suba até a cabeça',
              'Respire profundamente entre cada grupo'
            ],
            benefits: ['Alivia tensão', 'Melhora qualidade do sono', 'Reduz dor muscular'],
            enabled: true
          },
          {
            id: 'journaling_1',
            title: 'Escrita Terapêutica',
            description: 'Escreva livremente sobre seus sentimentos',
            category: 'journaling',
            duration: 10,
            icon: 'book',
            instructions: [
              'Escreva sem se preocupar com gramática',
              'Expresse seus sentimentos honestamente',
              'Não se censure',
              'Releia depois para reflexão'
            ],
            benefits: ['Processa emoções', 'Aumenta autoconhecimento', 'Reduz estresse'],
            enabled: true
          }
        ];

        // Se usuário não tem empresa, retornar atividades padrão
        if (!userCompany) {
          return res.json({
            success: true,
            activities: baseActivities
          });
        }

        // Buscar configurações da empresa
        const configSql = `
          SELECT activity_id, enabled, custom_settings
          FROM company_activity_config
          WHERE company = ?
        `;

        db.all(configSql, [userCompany], (err, configs) => {
          if (err) {
            console.error('Erro ao buscar configurações:', err);
            // Em caso de erro, retornar atividades padrão
            return res.json({
              success: true,
              activities: baseActivities
            });
          }

          // Aplicar configurações da empresa
          const filteredActivities = baseActivities.map(activity => {
            const config = configs.find(c => c.activity_id === activity.id);

            if (!config) {
              // Sem configuração = atividade habilitada com conteúdo padrão
              return activity;
            }

            // Se desabilitada, não incluir
            if (config.enabled === 0) {
              return null;
            }

            // Aplicar customizações
            let customSettings = {};
            try {
              customSettings = config.custom_settings ? JSON.parse(config.custom_settings) : {};
            } catch (e) {
              console.error('Erro ao parsear custom_settings:', e);
            }

            return {
              ...activity,
              title: customSettings.customTitle || activity.title,
              description: customSettings.customDescription || activity.description,
              instructions: customSettings.customInstructions || activity.instructions,
              videoUrl: customSettings.videoUrl || null,
              richContent: customSettings.richContent || null,
              enabled: true
            };
          }).filter(a => a !== null); // Remover atividades desabilitadas

          res.json({
            success: true,
            activities: filteredActivities
          });
        });
      });
    } catch (error) {
      console.error('Erro ao buscar atividades do usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar atividades' });
    }
  });

  console.log('✅ Rotas de atividades de bem-estar configuradas');
}

module.exports = {
  setupWellnessActivitiesRoutes
};
