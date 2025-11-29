const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const WhatsAppService = require('./whatsapp');
const BRDIDService = require('./brdid-service');
const UserStorage = require('./user-storage');
const ReminderScheduler = require('./reminder-scheduler');
const { createCheckoutSession, verifyWebhook, handleWebhookEvent, PLANS } = require('./stripe-config');
const { GamificationService } = require('./gamification-service');
const integrationService = require('./integration-service');

// Helper para gerar UUID
function generateUUID() {
  return crypto.randomUUID();
}

// Usar SQLite para desenvolvimento local, PostgreSQL para produção
require('dotenv').config();

// Função helper para obter data/hora no fuso horário de Brasília
function getBrasiliaDate() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
}

// Função para criar log de auditoria
async function createAuditLog(userId, userEmail, action, entityType, entityId, details, req) {
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

// Detectar qual banco usar baseado na DATABASE_URL
const usePostgres = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres');
const dbModule = usePostgres ? require('./db') : require('./db-sqlite');
const { initializeDatabase } = dbModule;

console.log('🗄️  Configuração do banco de dados:');
console.log('   - NODE_ENV:', process.env.NODE_ENV);
console.log('   - DATABASE_URL configurada:', !!process.env.DATABASE_URL);
console.log('   - Usando:', usePostgres ? 'PostgreSQL (produção)' : 'SQLite (desenvolvimento)');

const app = express();
const PORT = process.env.PORT || 3001;
const whatsappService = new WhatsAppService();
const brDidService = new BRDIDService();
const userStorage = new UserStorage();
const reminderScheduler = new ReminderScheduler(brDidService, userStorage);
const gamificationService = new GamificationService();

// Inicializar o UserStorage
userStorage.initialize().then(() => {
  console.log('✅ UserStorage inicializado com sucesso');
}).catch(error => {
  console.error('❌ Erro ao inicializar UserStorage:', error);
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// WhatsApp Webhook Verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Verificar se o token corresponde ao configurado
  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFICATION_TOKEN) {
    console.log('Webhook verificado com sucesso!');
    res.status(200).send(challenge);
  } else {
    console.log('Falha na verificação do webhook');
    res.sendStatus(403);
  }
});

// WhatsApp Webhook para receber mensagens
app.post('/webhook', (req, res) => {
  const body = req.body;

  console.log('Webhook recebido:', JSON.stringify(body, null, 2));

  // Verificar se é uma mensagem do WhatsApp
  if (body.object === 'whatsapp_business_account') {
    body.entry?.forEach(entry => {
      const changes = entry.changes || [];

      changes.forEach(async (change) => {
        const value = change.value;

        if (value.messages) {
          for (const message of value.messages) {
            await processWhatsAppMessage(message, value.metadata);
          }
        }
      });
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Função para processar mensagens do WhatsApp
async function processWhatsAppMessage(message, metadata) {
  try {
    console.log('🔄 Iniciando processamento da mensagem:', {
      id: message.id,
      from: message.from,
      type: message.type,
      content: message.text?.body?.substring(0, 50) + '...'
    });

    const result = await whatsappService.processIncomingMessage(message, metadata);

    console.log('✅ Mensagem processada com sucesso:', {
      id: message.id,
      result: result
    });
  } catch (error) {
    console.error('❌ Erro ao processar mensagem do WhatsApp:', error);
  }
}

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Servidor WhatsApp funcionando!' })
})

// Rota de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// 🎮 Rota para registrar conclusão de atividade de bem-estar
app.post('/api/activities/complete', async (req, res) => {
  try {
    const { userId, activityKey, activityName } = req.body;

    if (!userId || !activityKey) {
      return res.status(400).json({
        success: false,
        error: 'userId e activityKey são obrigatórios'
      });
    }

    // Determinar pontos e tipo de atividade
    let points = 10; // Padrão
    let activityType = 'general';

    if (activityKey.includes('meditation')) {
      points = 20;
      activityType = 'meditation';
    } else if (activityKey.includes('breathing')) {
      points = 15;
      activityType = 'breathing';
    } else if (activityKey.includes('gratitude')) {
      points = 15;
      activityType = 'gratitude';
    } else if (activityKey.includes('movement')) {
      points = 15;
      activityType = 'movement';
    }

    // Contar quantas atividades do tipo o usuário completou
    const countResult = await dbModule.query(
      'SELECT COUNT(*) as count FROM points_history WHERE user_id = $1 AND action LIKE $2',
      [userId, `activity_${activityType}%`]
    );
    const activityCount = parseInt(countResult.rows[0]?.count || 0) + 1;

    // Adicionar pontos
    const pointsResult = await gamificationService.addPoints(
      dbModule,
      userId,
      points,
      `activity_${activityType}`,
      `Atividade: ${activityName || activityKey}`
    );

    // Verificar conquistas
    const hour = new Date().getHours();
    const achievements = await gamificationService.checkAndUnlockAchievements(
      dbModule,
      userId,
      {
        action: activityCount === 1 ? 'first_activity' : null,
        activityType,
        activityCount,
        hour
      }
    );

    console.log(`🎮 Atividade concluída: ${activityKey} | Pontos: +${points} | Total: ${pointsResult.totalPoints}`);
    if (achievements.length > 0) {
      console.log(`🏆 Conquistas: ${achievements.map(a => a.achievement.name).join(', ')}`);
    }

    res.json({
      success: true,
      gamification: {
        pointsAdded: pointsResult.pointsAdded,
        totalPoints: pointsResult.totalPoints,
        leveledUp: pointsResult.leveledUp,
        newLevel: pointsResult.leveledUp ? pointsResult.levelName : null,
        levelColor: pointsResult.leveledUp ? pointsResult.levelColor : null,
        achievements: achievements
      }
    });

    // Log de auditoria
    await createAuditLog(userId, null, 'COMPLETE_ACTIVITY', 'ACTIVITY', activityKey, { points, activityType }, req);
  } catch (error) {
    console.error('Erro ao registrar atividade:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao registrar atividade'
    });
  }
});

// Rota para criar nova entrada no diário (via frontend)
app.post('/api/diary-entries', async (req, res) => {
  try {
    let { userId, userName, userPhone, title, content, mood, moodScore, tags, gratitude } = req.body;

    if (!userId || !content) {
      return res.status(400).json({
        error: 'Campos "userId" e "content" são obrigatórios'
      });
    }

    // 🤖 GERAR TAGS COM IA se não foram fornecidas
    if (!tags || tags.length === 0) {
      try {
        console.log('🤖 Gerando tags automaticamente com IA...');
        const { OpenAI } = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "system",
            content: "Você é um assistente que analisa entradas de diário e sugere tags relevantes. Retorne apenas as tags separadas por vírgula, sem explicações."
          }, {
            role: "user",
            content: `Analise esta entrada de diário e sugira 3-5 tags relevantes (palavras-chave simples em português): "${content}"`
          }],
          max_tokens: 50,
          temperature: 0.7
        });

        const generatedTags = completion.choices[0].message.content
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);

        tags = generatedTags;
        console.log(`✨ Tags geradas: ${tags.join(', ')}`);
      } catch (aiError) {
        console.error('⚠️ Erro ao gerar tags com IA:', aiError.message);
        tags = ['reflexão']; // Tag padrão se IA falhar
      }
    }

    // 🛡️ VERIFICAR DUPLICAÇÃO: Checar se já existe uma entrada com mesmo conteúdo e usuário nos últimos 5 minutos
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const duplicateCheck = await dbModule.query(
        `SELECT id FROM diary_entries 
         WHERE user_id = $1 
         AND content = $2 
         AND timestamp > $3 
         LIMIT 1`,
        [userId, content, fiveMinutesAgo]
      );

      if (duplicateCheck.rows.length > 0) {
        console.log(`⚠️ Entrada duplicada detectada para usuário ${userId} - ignorando`);
        return res.status(200).json({
          success: true,
          entry: duplicateCheck.rows[0],
          message: 'Entrada já existe (duplicação evitada)',
          duplicate: true
        });
      }
    } catch (dupError) {
      console.warn('Erro ao verificar duplicação:', dupError.message);
      // Continuar mesmo se a verificação falhar
    }

    // Criar entrada no formato do backend
    const diaryEntry = {
      id: `frontend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: content,
      whatsappNumber: userPhone || 'N/A',
      userId: userId,
      userName: userName || 'Usuário',
      timestamp: getBrasiliaDate(),
      metadata: {
        source: 'frontend',
        title: title || '',
        mood: mood || 'neutral',
        moodScore: moodScore || 3,
        tags: tags || [],
        gratitude: gratitude || []
      }
    };

    const savedEntry = await whatsappService.diaryStorage.saveEntry(diaryEntry);

    console.log(`📝 Nova entrada criada via frontend: ${title || 'Sem título'} (usuário: ${userName})`);

    // 🔄 INTEGRAÇÃO: Processar entrada com análise de IA, métricas e notificações
    try {
      const integrationResult = await integrationService.registerDiaryEntry(
        userId,
        content,
        diaryEntry.metadata,
        diaryEntry.id  // Passar o ID para evitar duplicação
      );
      console.log('✅ Entrada processada pelo serviço de integração');
    } catch (integrationError) {
      console.error('⚠️ Erro na integração do diário:', integrationError);
    }

    // 🎮 Gamificação: Adicionar pontos por entrada de diário
    let gamificationData = null;
    try {
      // Contar quantas entradas de diário o usuário tem
      const countResult = await dbModule.query(
        'SELECT COUNT(*) as count FROM diary_entries WHERE user_id = $1',
        [userId]
      );
      const diaryCount = parseInt(countResult.rows[0]?.count || 0);

      // Adicionar pontos
      const pointsResult = await gamificationService.addPoints(
        dbModule,
        userId,
        15, // 15 pontos por entrada
        'diary_entry',
        `Entrada no diário: ${title || 'Reflexão pessoal'}`
      );

      // Verificar conquistas
      const achievements = await gamificationService.checkAndUnlockAchievements(
        dbModule,
        userId,
        { action: 'diary_entry', diaryCount }
      );

      console.log(`🎮 Pontos adicionados: ${pointsResult.pointsAdded} | Total: ${pointsResult.totalPoints}`);
      if (achievements.length > 0) {
        console.log(`🏆 Conquistas desbloqueadas: ${achievements.map(a => a.achievement.name).join(', ')}`);
      }

      gamificationData = {
        pointsAdded: pointsResult.pointsAdded,
        totalPoints: pointsResult.totalPoints,
        leveledUp: pointsResult.leveledUp,
        newLevel: pointsResult.leveledUp ? pointsResult.levelName : null,
        achievements: achievements
      };
    } catch (gamificationError) {
      console.error('Erro ao processar gamificação:', gamificationError);
      // Continuar mesmo se gamificação falhar
    }

    // Log de auditoria
    await createAuditLog(userId, null, 'CREATE_DIARY_ENTRY', 'DIARY', savedEntry.id, { title: title || 'Sem título' }, req);

    res.status(201).json({
      success: true,
      entry: savedEntry,
      message: 'Entrada salva com sucesso!',
      gamification: gamificationData
    });
  } catch (error) {
    console.error('Erro ao criar entrada do diário:', error);
    res.status(500).json({
      error: 'Erro ao criar entrada do diário',
      details: error.message
    });
  }
});

// Rota para listar entradas de diário (APENAS DO USUÁRIO LOGADO)
app.get('/api/diary-entries', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(401).json({
        error: 'Usuário não autenticado'
      });
    }

    // Buscar apenas entradas do usuário logado
    const result = await dbModule.query(
      'SELECT * FROM diary_entries WHERE user_id = $1 ORDER BY timestamp DESC',
      [userId]
    );

    res.json({ success: true, entries: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Erro ao buscar entradas do diário:', error);
    res.status(500).json({ error: 'Erro ao buscar entradas do diário', details: error.message });
  }
});

// Rota para buscar entradas por data (APENAS DO USUÁRIO LOGADO)
app.get('/api/diary-entries/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(401).json({
        error: 'Usuário não autenticado'
      });
    }

    // Buscar apenas entradas do usuário logado na data específica
    const result = await dbModule.query(
      'SELECT * FROM diary_entries WHERE user_id = $1 AND DATE(timestamp) = $2 ORDER BY timestamp DESC',
      [userId, date]
    );

    res.json({ success: true, entries: result.rows, total: result.rows.length, date });
  } catch (error) {
    console.error('Erro ao buscar entradas por data:', error);
    res.status(500).json({ error: 'Erro ao buscar entradas por data', details: error.message });
  }
});

// Rota para excluir entrada do diário (APENAS PRÓPRIAS ENTRADAS)
app.delete('/api/diary-entries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!id) {
      return res.status(400).json({
        error: 'ID da entrada é obrigatório'
      });
    }

    if (!userId) {
      return res.status(401).json({
        error: 'Usuário não autenticado'
      });
    }

    // Verificar se a entrada pertence ao usuário antes de deletar
    const checkResult = await dbModule.query(
      'SELECT user_id FROM diary_entries WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Entrada não encontrada'
      });
    }

    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({
        error: 'Você não tem permissão para excluir esta entrada'
      });
    }

    // Deletar a entrada
    await dbModule.query('DELETE FROM diary_entries WHERE id = $1', [id]);

    console.log(`🗑️ Entrada excluída: ${id} (usuário: ${userId})`);

    res.json({
      success: true,
      message: 'Entrada excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir entrada do diário:', error);
    res.status(500).json({
      error: 'Erro ao excluir entrada do diário',
      details: error.message
    });
  }
});

// Rota para estatísticas do diário
app.get('/api/diary-stats', async (req, res) => {
  try {
    const stats = await whatsappService.diaryStorage.getStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas', details: error.message });
  }
});

// ========== USER MANAGEMENT ENDPOINTS ==========

// ========== AUTH ENDPOINTS ==========

// Rota para verificar se email já existe
app.post('/api/auth/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email obrigatório' });

    const result = await dbModule.query('SELECT id FROM users WHERE email = $1', [email]);
    res.json({ exists: result.rows.length > 0 });
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    res.status(500).json({ error: 'Erro ao verificar email' });
  }
});

// Rota de registro
// Função de validação de CPF
function validateCPF(cpf) {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleanCPF)) return false;
  let sum = 0;
  let remainder;
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  return true;
}

// Rota de registro
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, goals, preferences, emotionalHealthData, wellnessScore, cpf } = req.body;

    console.log(`📝 Tentativa de registro: ${email}`);

    // Validação de campos obrigatórios
    if (!name || !email || !password || !phone || !cpf) {
      return res.status(400).json({
        error: 'Todos os campos (Nome, Email, Senha, Telefone, CPF) são obrigatórios'
      });
    }

    // Validação de CPF
    if (!validateCPF(cpf)) {
      return res.status(400).json({ error: 'CPF inválido' });
    }

    // Validação de Email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Validação de Telefone (simples)
    const phoneClean = phone.replace(/[^\d]/g, '');
    if (phoneClean.length < 10 || phoneClean.length > 11) {
      return res.status(400).json({ error: 'Telefone inválido' });
    }

    // Verificar se o email já existe
    const existingUser = await dbModule.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    // Verificar se o CPF já existe
    const existingCPF = await dbModule.query('SELECT id FROM users WHERE cpf = $1', [cpf]);
    if (existingCPF.rows.length > 0) {
      return res.status(409).json({ error: 'CPF já cadastrado' });
    }

    console.log(`✅ Dados válidos, criando usuário...`);

    // Hash da senha (simples - em produção usar bcrypt)
    const passwordHash = Buffer.from(password).toString('base64');

    // ========================================================================
    // GARANTIR QUE EMPRESA "GENERAL" EXISTE
    // ========================================================================
    const companyCheck = await dbModule.query(
      `SELECT id FROM companies WHERE name = 'General' LIMIT 1`
    );

    if (companyCheck.rows.length === 0) {
      // Criar empresa General se não existir
      const companyId = `company_general_${Date.now()}`;
      await dbModule.query(
        `INSERT INTO companies (id, name, description, settings, created_at, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          companyId,
          'General',
          'Empresa padrão para todos os usuários individuais',
          JSON.stringify({
            default: true,
            allowAutoEnrollment: true,
            features: ['diary', 'chat', 'wellness', 'gamification']
          })
        ]
      );
      console.log(`✅ Empresa "General" criada automaticamente: ${companyId}`);
    }

    // Criar usuário vinculado à empresa "General"
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const company = 'General'; // SEMPRE "General" para novos usuários

    const result = await dbModule.query(
      `INSERT INTO users (
        id, name, email, password_hash, phone, goals, preferences, mental_health_data, wellness_score, cpf, company
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, name, email, phone, goals, preferences, mental_health_data, wellness_score, created_at, company, cpf`,
      [
        userId,
        name,
        email,
        passwordHash,
        phone,
        goals || [],
        JSON.stringify(preferences || { notifications: true, privacy: 'private', reminderTime: '20:00' }),
        JSON.stringify(emotionalHealthData || null),
        JSON.stringify(wellnessScore || null),
        cpf,
        company
      ]
    );

    const user = result.rows[0];

    console.log(`✅ Usuário registrado: ${name} (${email}) - CPF: ${cpf}`);

    // Log de auditoria
    await createAuditLog(user.id, user.email, 'CREATE_USER', 'USER', user.id, { method: 'register' }, req);

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        cpf: user.cpf,
        company: user.company,
        goals: user.goals || [],
        preferences: typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences,
        emotionalHealthData: user.mental_health_data ? (typeof user.mental_health_data === 'string' ? JSON.parse(user.mental_health_data) : user.mental_health_data) : null,
        wellnessScore: user.wellness_score ? (typeof user.wellness_score === 'string' ? JSON.parse(user.wellness_score) : user.wellness_score) : null,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({
      error: 'Erro ao registrar usuário',
      details: error.message
    });
  }
});

// Rota de login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`🔐 Tentativa de login: ${email}`);

    if (!email || !password) {
      return res.status(400).json({
        error: 'Campos "email" e "password" são obrigatórios'
      });
    }

    // AUTO-FIX: Adicionar coluna is_admin se não existir
    try {
      await dbModule.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin INTEGER DEFAULT 0;
      `);
      console.log('✅ Coluna is_admin verificada/adicionada');
    } catch (error) {
      console.log('⚠️ Erro ao adicionar coluna is_admin (pode já existir):', error.message);
    }

    const result = await dbModule.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    console.log(`🔍 Usuários encontrados: ${result.rows.length}`);

    if (result.rows.length === 0) {
      console.log(`❌ Email não encontrado: ${email}`);
      return res.status(401).json({
        error: 'Email ou senha incorretos'
      });
    }

    const user = result.rows[0];
    const passwordHash = Buffer.from(password).toString('base64');

    console.log(`🔑 Comparando senha...`);
    console.log(`   - Hash recebido: ${passwordHash.substring(0, 20)}...`);
    console.log(`   - Hash no banco: ${user.password_hash.substring(0, 20)}...`);

    if (user.password_hash !== passwordHash) {
      console.log(`❌ Senha incorreta para: ${email}`);
      return res.status(401).json({
        error: 'Email ou senha incorretos'
      });
    }

    console.log(`✅ Login bem-sucedido: ${user.name} (${email})`);
    console.log(`🔍 DEBUG - is_admin do banco: ${user.is_admin}`);
    console.log(`🔍 DEBUG - tipo: ${typeof user.is_admin}`);

    // AUTO-FIX: Tornar admin se for o email específico ou se is_admin for null
    if (email === 'vinicius.cortez03@gmail.com' || user.is_admin === null) {
      try {
        await dbModule.query(
          'UPDATE users SET is_admin = 1 WHERE id = $1',
          [user.id]
        );
        user.is_admin = 1;
        console.log(`✅ Usuário ${user.name} definido como admin automaticamente`);
      } catch (error) {
        console.log('⚠️ Erro ao definir admin:', error.message);
      }
    }

    const responseUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      goals: user.goals || [],
      preferences: user.preferences ? (typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences) : {},
      emotionalHealthData: user.mental_health_data ? (typeof user.mental_health_data === 'string' ? JSON.parse(user.mental_health_data) : user.mental_health_data) : null,
      wellnessScore: user.wellness_score ? (typeof user.wellness_score === 'string' ? JSON.parse(user.wellness_score) : user.wellness_score) : null,
      createdAt: user.created_at,
      is_admin: user.is_admin || 0
    };

    console.log(`🔍 DEBUG - is_admin na resposta: ${responseUser.is_admin}`);

    // Log de auditoria
    await createAuditLog(user.id, user.email, 'LOGIN', 'USER', user.id, { method: 'email_password' }, req);

    res.json({
      success: true,
      user: responseUser
    });
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error);
    res.status(500).json({
      error: 'Erro ao fazer login',
      details: error.message
    });
  }
});

// Rota para criar usuário (legacy - manter para compatibilidade)
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        error: 'Campos "name", "email" e "phone" são obrigatórios'
      });
    }

    // Verificar se o telefone já está cadastrado
    if (userStorage.isPhoneRegistered(phone)) {
      return res.status(409).json({
        error: 'Telefone já cadastrado'
      });
    }

    // Criar usuário
    const user = await userStorage.createUser({ name, email, phone });

    console.log(`✅ Usuário criado: ${name} (${phone})`);

    // FLUXO 1: Enviar mensagem de boas-vindas via BR DID ao registrar
    if (brDidService.isConfigured()) {
      try {
        await brDidService.sendWelcomeMessage(phone, name);
        console.log(`📨 Mensagem de boas-vindas BR DID enviada para ${name} (${phone})`);
      } catch (error) {
        console.error(`❌ Erro ao enviar mensagem de boas-vindas BR DID:`, error.message);
        // Não falhar o registro se a mensagem falhar
      }
    } else {
      console.warn('⚠️ BR DID não configurado - mensagem de boas-vindas não enviada');
    }

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      error: 'Erro ao criar usuário',
      details: error.message
    });
  }
});

// Rota para buscar usuário por telefone
app.get('/api/users/phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const user = await userStorage.getUserByPhone(phone);

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      error: 'Erro ao buscar usuário',
      details: error.message
    });
  }
});

// Rota para atualizar usuário
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, cpf } = req.body;

    console.log(`📝 Atualizando usuário: ${id}`);

    // Buscar usuário atual
    const currentUser = await dbModule.query('SELECT * FROM users WHERE id = $1', [id]);

    if (currentUser.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Verificar se o email já está em uso por outro usuário
    if (email && email !== currentUser.rows[0].email) {
      const emailCheck = await dbModule.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({
          error: 'Email já está em uso'
        });
      }
    }

    // Atualizar usuário
    const result = await dbModule.query(
      `UPDATE users 
       SET name = $1, email = $2, phone = $3, cpf = $4, updated_at = $5
       WHERE id = $6
       RETURNING id, name, email, phone, cpf, goals, preferences, mental_health_data, wellness_score, created_at, is_admin`,
      [
        name || currentUser.rows[0].name,
        email || currentUser.rows[0].email,
        phone || currentUser.rows[0].phone,
        cpf || currentUser.rows[0].cpf,
        getBrasiliaDate(),
        id
      ]
    );

    const user = result.rows[0];

    console.log(`✅ Usuário atualizado: ${user.name} (${user.email})`);

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        cpf: user.cpf,
        goals: user.goals || [],
        preferences: user.preferences ? (typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences) : {},
        emotionalHealthData: user.mental_health_data ? (typeof user.mental_health_data === 'string' ? JSON.parse(user.mental_health_data) : user.mental_health_data) : null,
        wellnessScore: user.wellness_score ? (typeof user.wellness_score === 'string' ? JSON.parse(user.wellness_score) : user.wellness_score) : null,
        createdAt: user.created_at,
        is_admin: user.is_admin
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      error: 'Erro ao atualizar usuário',
      details: error.message
    });
  }
});

// Rota para listar todos os usuários
app.get('/api/users', async (req, res) => {
  try {
    const users = await userStorage.getAllUsers();

    res.json({
      success: true,
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      error: 'Erro ao listar usuários',
      details: error.message
    });
  }
});

// Rota para excluir conta permanentemente
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Excluindo conta: ${id}`);

    // Verificar se o usuário existe
    const userCheck = await dbModule.query('SELECT email FROM users WHERE id = $1', [id]);

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    const userEmail = userCheck.rows[0].email;

    // Excluir todas as entradas do diário do usuário
    await dbModule.query('DELETE FROM diary_entries WHERE user_id = $1', [id]);

    // Excluir histórico de pontos
    await dbModule.query('DELETE FROM points_history WHERE user_id = $1', [id]);

    // Excluir conquistas do usuário
    await dbModule.query('DELETE FROM user_achievements WHERE user_id = $1', [id]);

    // Excluir o usuário
    await dbModule.query('DELETE FROM users WHERE id = $1', [id]);

    console.log(`✅ Conta excluída permanentemente: ${userEmail}`);

    res.json({
      success: true,
      message: 'Conta excluída permanentemente'
    });
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    res.status(500).json({
      error: 'Erro ao excluir conta',
      details: error.message
    });
  }
});

// Rota para limpar dados do usuário (mantém a conta)
app.delete('/api/users/:id/clear-data', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🧹 Limpando dados do usuário: ${id}`);

    // Verificar se o usuário existe
    const userCheck = await dbModule.query('SELECT email FROM users WHERE id = $1', [id]);

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Excluir apenas as entradas do diário
    await dbModule.query('DELETE FROM diary_entries WHERE user_id = $1', [id]);

    console.log(`✅ Dados limpos para: ${userCheck.rows[0].email}`);

    res.json({
      success: true,
      message: 'Dados limpos com sucesso'
    });
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    res.status(500).json({
      error: 'Erro ao limpar dados',
      details: error.message
    });
  }
});

// Rota para listar logs de auditoria
app.get('/api/admin/audit-logs', async (req, res) => {
  try {
    const { userId, limit = 50 } = req.query;

    let query = 'SELECT * FROM audit_logs';
    const params = [];

    if (userId) {
      query += ' WHERE user_id = $1';
      params.push(userId);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(parseInt(limit));

    const result = await dbModule.query(query, params);

    res.json({
      success: true,
      logs: result.rows
    });
  } catch (error) {
    console.error('Erro ao listar logs de auditoria:', error);
    res.status(500).json({
      error: 'Erro ao listar logs de auditoria',
      details: error.message
    });
  }
});

// ========== THERAPIST ENDPOINTS ==========

// Rota de registro de terapeuta
app.post('/api/therapists/register', async (req, res) => {
  try {
    const { name, email, password, phone, age, bio, specialties, credentials, experience_years } = req.body;

    console.log(`📝 [CADASTRO NORMAL] Tentativa de registro: ${email}`);
    console.log(`   Dados recebidos:`, { name, email, phone, age, bio: bio?.substring(0, 50), specialties, credentials, experience_years });

    if (!name || !email || !password || !bio || !specialties || !credentials) {
      console.log(`❌ [CADASTRO NORMAL] Campos obrigatórios faltando`);
      return res.status(400).json({
        error: 'Campos obrigatórios: name, email, password, bio, specialties, credentials'
      });
    }

    // Verificar se o email já existe
    const existingTherapist = await dbModule.query('SELECT id FROM therapists WHERE email = $1', [email]);

    if (existingTherapist.rows.length > 0) {
      console.log(`❌ [CADASTRO NORMAL] Email já cadastrado: ${email}`);
      return res.status(409).json({
        error: 'Email já cadastrado'
      });
    }

    // Hash da senha
    const passwordHash = Buffer.from(password).toString('base64');

    // Criar terapeuta
    const therapistId = `therapist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`   Inserindo no banco... ID: ${therapistId}`);

    const result = await dbModule.query(
      `INSERT INTO therapists (
        id, name, email, password_hash, phone, age, bio, specialties, credentials, experience_years, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, name, email, phone, age, bio, specialties, credentials, experience_years, status, created_at`,
      [
        therapistId,
        name,
        email,
        passwordHash,
        phone || null,
        age || null,
        bio,
        JSON.stringify(specialties), // CORRIGIDO: Converter array para JSON string
        credentials,
        experience_years || 0,
        'pending' // Status inicial sempre pending
      ]
    );

    const therapist = result.rows[0];

    console.log(`✅ [CADASTRO NORMAL] Terapeuta registrado com sucesso!`);
    console.log(`   ID: ${therapist.id}, Nome: ${name}, Status: ${therapist.status}`);

    res.status(201).json({
      success: true,
      message: 'Cadastro realizado com sucesso! Aguarde a aprovação do administrador.',
      therapist: {
        id: therapist.id,
        name: therapist.name,
        email: therapist.email,
        status: therapist.status
      }
    });
  } catch (error) {
    console.error('❌ [CADASTRO NORMAL] Erro ao registrar terapeuta:', error);
    console.error('   Stack:', error.stack);
    res.status(500).json({
      error: 'Erro ao registrar terapeuta',
      details: error.message
    });
  }
});

// Rota de login de terapeuta
app.post('/api/therapists/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`🔐 Tentativa de login de terapeuta: ${email}`);

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e senha são obrigatórios'
      });
    }

    const result = await dbModule.query(
      'SELECT * FROM therapists WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Email ou senha incorretos'
      });
    }

    const therapist = result.rows[0];
    const passwordHash = Buffer.from(password).toString('base64');

    if (therapist.password_hash !== passwordHash) {
      return res.status(401).json({
        error: 'Email ou senha incorretos'
      });
    }

    console.log(`✅ Login de terapeuta bem-sucedido: ${therapist.name} (${email})`);

    res.json({
      success: true,
      therapist: {
        id: therapist.id,
        name: therapist.name,
        email: therapist.email,
        phone: therapist.phone,
        age: therapist.age,
        bio: therapist.bio,
        photo_url: therapist.photo_url,
        specialties: therapist.specialties,
        credentials: therapist.credentials,
        experience_years: therapist.experience_years,
        status: therapist.status,
        rating: therapist.rating,
        total_sessions: therapist.total_sessions,
        createdAt: therapist.created_at
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login de terapeuta:', error);
    res.status(500).json({
      error: 'Erro ao fazer login',
      details: error.message
    });
  }
});

// Rota para listar terapeutas aprovados (marketplace)
app.get('/api/therapists', async (req, res) => {
  try {
    const { specialty } = req.query;

    console.log(`👥 [MARKETPLACE] Listando terapeutas aprovados - Filtro: ${specialty || 'nenhum'}`);

    let query = 'SELECT * FROM therapists WHERE status = $1';
    const params = ['approved'];

    if (specialty) {
      query += ' AND $2 = ANY(specialties)';
      params.push(specialty);
    }

    query += ' ORDER BY created_at DESC';

    const result = await dbModule.query(query, params);

    console.log(`✅ [MARKETPLACE] Encontrados ${result.rows.length} terapeutas aprovados`);

    if (result.rows.length > 0) {
      console.log('   Primeiro terapeuta (raw):', result.rows[0]);
    }

    const therapists = result.rows.map((t, index) => {
      try {
        // Parse specialties com tratamento de erro
        let specialties = [];
        if (t.specialties) {
          if (typeof t.specialties === 'string') {
            try {
              specialties = JSON.parse(t.specialties);
            } catch (parseError) {
              console.error(`❌ [MARKETPLACE] Erro ao fazer parse de specialties do terapeuta ${t.id}:`, parseError);
              console.error('   Valor raw:', t.specialties);
              specialties = [];
            }
          } else if (Array.isArray(t.specialties)) {
            specialties = t.specialties;
          }
        }

        const therapist = {
          id: t.id,
          name: t.name,
          age: t.age || 0,
          photo_url: t.photo_url || '',
          bio: t.bio || '',
          specialties: specialties,
          experience_years: t.experience_years || 0,
          credentials: t.credentials || '',
          // Usar valores do banco de dados
          rating: t.rating || 5.0,
          total_sessions: t.total_sessions || 0,
          price_per_session: t.price_per_session || 150.0
        };

        if (index === 0) {
          console.log('   Primeiro terapeuta (processado):', therapist);
          console.log('   Typeof specialties:', typeof therapist.specialties);
          console.log('   Is Array:', Array.isArray(therapist.specialties));
        }

        return therapist;
      } catch (mapError) {
        console.error(`❌ [MARKETPLACE] Erro ao processar terapeuta ${t.id}:`, mapError);
        console.error('   Dados do terapeuta:', t);
        // Retorna um objeto básico em caso de erro
        return {
          id: t.id,
          name: t.name || 'Nome não disponível',
          age: 0,
          photo_url: '',
          bio: '',
          specialties: [],
          experience_years: 0,
          credentials: '',
          rating: 5.0,
          total_sessions: 0,
          price_per_session: 150.0
        };
      }
    });

    console.log(`📤 [MARKETPLACE] Enviando ${therapists.length} terapeutas para o frontend`);

    res.json({
      success: true,
      therapists: therapists,
      total: therapists.length
    });
  } catch (error) {
    console.error('❌ [MARKETPLACE] Erro ao listar terapeutas:', error);
    console.error('   Stack:', error.stack);
    res.status(500).json({
      error: 'Erro ao listar terapeutas',
      details: error.message
    });
  }
});

// Rota para buscar detalhes de um terapeuta
app.get('/api/therapists/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await dbModule.query(
      'SELECT * FROM therapists WHERE id = $1 AND status = $2',
      [id, 'approved']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Terapeuta não encontrado'
      });
    }

    const therapist = result.rows[0];

    res.json({
      success: true,
      therapist: {
        id: therapist.id,
        name: therapist.name,
        age: therapist.age,
        phone: therapist.phone,
        photo_url: therapist.photo_url,
        bio: therapist.bio,
        specialties: therapist.specialties,
        credentials: therapist.credentials,
        experience_years: therapist.experience_years,
        rating: parseFloat(therapist.rating),
        total_sessions: therapist.total_sessions,
        price_per_session: parseFloat(therapist.price_per_session),
        availability: therapist.availability
      }
    });
  } catch (error) {
    console.error('Erro ao buscar terapeuta:', error);
    res.status(500).json({
      error: 'Erro ao buscar terapeuta',
      details: error.message
    });
  }
});

// ========== ADMIN THERAPIST MANAGEMENT ==========

// Listar todos os terapeutas (admin)
app.get('/api/admin/therapists', async (req, res) => {
  try {
    const { status } = req.query;

    console.log(`📋 Listando terapeutas (admin) - Status filter: ${status || 'all'}`);

    let query = 'SELECT * FROM therapists';
    const params = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const result = await dbModule.query(query, params);

    console.log(`✅ Encontrados ${result.rows.length} terapeutas`);
    if (result.rows.length > 0) {
      console.log(`Primeiro terapeuta: ${result.rows[0].name} (${result.rows[0].status})`);
    }

    res.json({
      success: true,
      therapists: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Erro ao listar terapeutas (admin):', error);
    res.status(500).json({
      error: 'Erro ao listar terapeutas',
      details: error.message
    });
  }
});

// Aprovar terapeuta (admin)
app.put('/api/admin/therapists/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    const result = await dbModule.query(
      `UPDATE therapists 
       SET status = $1, approved_by = $2, approved_at = $3, updated_at = $4
       WHERE id = $5
       RETURNING *`,
      ['approved', adminId, getBrasiliaDate(), getBrasiliaDate(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Terapeuta não encontrado'
      });
    }

    console.log(`✅ Terapeuta aprovado: ${result.rows[0].name} (${result.rows[0].email})`);

    res.json({
      success: true,
      message: 'Terapeuta aprovado com sucesso',
      therapist: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao aprovar terapeuta:', error);
    res.status(500).json({
      error: 'Erro ao aprovar terapeuta',
      details: error.message
    });
  }
});

// Reprovar terapeuta (admin)
app.put('/api/admin/therapists/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await dbModule.query(
      `UPDATE therapists 
       SET status = $1, rejection_reason = $2, updated_at = $3
       WHERE id = $4
       RETURNING *`,
      ['rejected', reason || 'Não especificado', getBrasiliaDate(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Terapeuta não encontrado'
      });
    }

    console.log(`❌ Terapeuta reprovado: ${result.rows[0].name} (${result.rows[0].email})`);

    res.json({
      success: true,
      message: 'Terapeuta reprovado',
      therapist: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao reprovar terapeuta:', error);
    res.status(500).json({
      error: 'Erro ao reprovar terapeuta',
      details: error.message
    });
  }
});

// Excluir terapeuta (admin)
app.delete('/api/admin/therapists/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se tem sessões agendadas
    const sessionsCheck = await dbModule.query(
      'SELECT COUNT(*) as count FROM therapy_sessions WHERE therapist_id = $1 AND status = $2',
      [id, 'scheduled']
    );

    if (parseInt(sessionsCheck.rows[0].count) > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir terapeuta com sessões agendadas'
      });
    }

    await dbModule.query('DELETE FROM therapists WHERE id = $1', [id]);

    console.log(`🗑️ Terapeuta excluído: ${id}`);

    res.json({
      success: true,
      message: 'Terapeuta excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir terapeuta:', error);
    res.status(500).json({
      error: 'Erro ao excluir terapeuta',
      details: error.message
    });
  }
});

// ========== COMPANIES & DEPARTMENTS MANAGEMENT ==========

// Listar todas as empresas
app.get('/api/companies', async (req, res) => {
  try {
    const result = await dbModule.query(
      'SELECT * FROM companies ORDER BY name ASC'
    );

    res.json({
      success: true,
      companies: result.rows
    });
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    res.status(500).json({
      error: 'Erro ao listar empresas',
      details: error.message
    });
  }
});

// Criar empresa
app.post('/api/admin/companies', async (req, res) => {
  try {
    const { name, description, settings } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome da empresa é obrigatório' });
    }

    const companyId = `company_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const result = await dbModule.query(
      `INSERT INTO companies (id, name, description, settings)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [companyId, name, description || null, settings || '{}']
    );

    console.log(`🏢 Empresa criada: ${name}`);

    res.status(201).json({
      success: true,
      company: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    res.status(500).json({
      error: 'Erro ao criar empresa',
      details: error.message
    });
  }
});

// Listar todos os departamentos (genéricos + específicos)
app.get('/api/departments', async (req, res) => {
  try {
    const { companyId } = req.query;

    let query = 'SELECT * FROM departments';
    const params = [];

    if (companyId) {
      // Retornar departamentos da empresa + genéricos
      query += ' WHERE company_id = $1 OR company_id IS NULL';
      params.push(companyId);
    }

    query += ' ORDER BY name ASC';

    const result = await dbModule.query(query, params);

    res.json({
      success: true,
      departments: result.rows
    });
  } catch (error) {
    console.error('Erro ao listar departamentos:', error);
    res.status(500).json({
      error: 'Erro ao listar departamentos',
      details: error.message
    });
  }
});

// Listar apenas departamentos genéricos
app.get('/api/departments/generic', async (req, res) => {
  try {
    const result = await dbModule.query(
      'SELECT * FROM departments WHERE company_id IS NULL ORDER BY name ASC'
    );

    res.json({
      success: true,
      departments: result.rows
    });
  } catch (error) {
    console.error('Erro ao listar departamentos genéricos:', error);
    res.status(500).json({
      error: 'Erro ao listar departamentos genéricos',
      details: error.message
    });
  }
});

// Criar departamento (genérico ou específico)
app.post('/api/admin/departments', async (req, res) => {
  try {
    const { name, companyId, description, isGeneric } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome do departamento é obrigatório' });
    }

    const departmentId = `dept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const result = await dbModule.query(
      `INSERT INTO departments (id, name, company_id, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        departmentId,
        name,
        isGeneric ? null : (companyId || null),
        description || null
      ]
    );

    const deptType = isGeneric ? 'genérico' : 'específico';
    console.log(`📁 Departamento ${deptType} criado: ${name}`);

    res.status(201).json({
      success: true,
      department: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar departamento:', error);
    res.status(500).json({
      error: 'Erro ao criar departamento',
      details: error.message
    });
  }
});

// ========== ADMIN THERAPIST REGISTRATION ==========

// Cadastrar terapeuta pelo admin (já aprovado)
app.post('/api/admin/therapists/register', async (req, res) => {
  try {
    const { name, email, password, phone, age, bio, specialties, credentials, experience_years, adminUserId } = req.body;

    console.log(`📝 [ADMIN] Cadastrando terapeuta: ${email}`);
    console.log(`   Admin ID: ${adminUserId}`);
    console.log(`   Dados recebidos:`, { name, email, phone, age, bio: bio?.substring(0, 50), specialties, credentials, experience_years });

    if (!name || !email || !password || !bio || !specialties || !credentials) {
      console.log(`❌ [ADMIN] Campos obrigatórios faltando`);
      return res.status(400).json({
        error: 'Campos obrigatórios: name, email, password, bio, specialties, credentials'
      });
    }

    // Verificar se o email já existe
    const existingTherapist = await dbModule.query('SELECT id FROM therapists WHERE email = $1', [email]);

    if (existingTherapist.rows.length > 0) {
      console.log(`❌ [ADMIN] Email já cadastrado: ${email}`);
      return res.status(409).json({
        error: 'Email já cadastrado'
      });
    }

    // Hash da senha
    const passwordHash = Buffer.from(password).toString('base64');

    // Criar terapeuta JÁ APROVADO
    const therapistId = `therapist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`   Inserindo no banco... ID: ${therapistId}, Status: approved`);

    const result = await dbModule.query(
      `INSERT INTO therapists (
        id, name, email, password_hash, phone, age, bio, specialties, credentials, 
        experience_years, status, approved_at, approved_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, name, email, phone, age, bio, specialties, credentials, experience_years, status, created_at`,
      [
        therapistId,
        name,
        email,
        passwordHash,
        phone || null,
        age || null,
        bio,
        JSON.stringify(specialties), // Converter array para JSON string
        credentials,
        experience_years || 0,
        'approved', // Status já aprovado
        getBrasiliaDate(), // Data de aprovação
        adminUserId || null // ID do admin que cadastrou
      ]
    );

    const therapist = result.rows[0];

    console.log(`✅ [ADMIN] Terapeuta cadastrado e aprovado com sucesso!`);
    console.log(`   ID: ${therapist.id}, Nome: ${name}, Status: ${therapist.status}`);

    // Log de auditoria
    if (adminUserId) {
      await createAuditLog(
        adminUserId,
        null,
        'CREATE_THERAPIST_ADMIN',
        'THERAPIST',
        therapist.id,
        { therapistName: name, therapistEmail: email },
        req
      );
    }

    res.status(201).json({
      success: true,
      message: 'Terapeuta cadastrado e aprovado com sucesso!',
      therapist: {
        id: therapist.id,
        name: therapist.name,
        email: therapist.email,
        status: therapist.status
      }
    });
  } catch (error) {
    console.error('❌ [ADMIN] Erro ao cadastrar terapeuta:', error);
    console.error('   Stack:', error.stack);
    res.status(500).json({
      error: 'Erro ao cadastrar terapeuta',
      details: error.message
    });
  }
});

// ========== TEMPORARY MIGRATION ENDPOINT ==========
// Rota temporária para adicionar coluna is_admin e tornar usuário admin
app.post('/api/migrate-admin', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    console.log('🔧 Iniciando migração is_admin...');

    // Adicionar coluna is_admin se não existir
    await dbModule.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin INTEGER DEFAULT 0;
    `);
    console.log('✅ Coluna is_admin adicionada/verificada');

    // Tornar o usuário admin
    const result = await dbModule.query(
      'UPDATE users SET is_admin = 1 WHERE email = $1 RETURNING id, name, email, is_admin',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    console.log(`✅ Usuário ${result.rows[0].name} agora é admin!`);

    res.json({
      success: true,
      message: 'Migração concluída! Faça logout e login novamente.',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Erro na migração:', error);
    res.status(500).json({
      error: 'Erro na migração',
      details: error.message
    });
  }
});

// Rota de teste para enviar mensagem WhatsApp
app.post('/test-whatsapp', async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: 'Campos "to" e "message" são obrigatórios' });
    }

    const result = await whatsappService.sendTextMessage(to, message);
    res.json({ success: true, result, message: 'Mensagem enviada com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar mensagem de teste:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem', details: error.message });
  }
});

// ========== CHAT & MOOD ENDPOINTS (AUDIT LOGGING) ==========

// Rota para chat com IA (proxy para OpenAI + logs)
app.post('/api/chat', async (req, res) => {
  try {
    const { userId, message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Mensagem obrigatória' });
    }

    // Aqui você integraria com a OpenAI real se tivesse a chave no backend
    // Por enquanto, vamos simular ou usar a chave do env se disponível

    // Log de auditoria
    if (userId) {
      await createAuditLog(userId, null, 'CHAT_MESSAGE', 'CHAT', null, { messageLength: message.length }, req);
    }

    // Se o frontend já faz a chamada da OpenAI, este endpoint serve apenas para log
    // Mas o ideal é mover a lógica da OpenAI para cá.
    // Como o frontend atual usa OpenAIService diretamente, vamos apenas retornar sucesso para logar

    res.json({ success: true, logged: true });
  } catch (error) {
    console.error('Erro no endpoint de chat:', error);
    res.status(500).json({ error: 'Erro ao processar chat' });
  }
});

// Rota para registrar humor
app.post('/api/mood', async (req, res) => {
  try {
    const { userId, mood, moodScore, time } = req.body;

    if (!userId || !mood) {
      return res.status(400).json({ error: 'UserId e Mood são obrigatórios' });
    }

    // Log de auditoria
    await createAuditLog(userId, null, 'REGISTER_MOOD', 'MOOD', null, { mood, moodScore, time }, req);

    // Aqui poderíamos salvar no banco também, mas o frontend já salva no localStorage/User Data
    // Vamos apenas confirmar o log por enquanto

    res.json({ success: true, message: 'Humor registrado e logado' });
  } catch (error) {
    console.error('Erro ao registrar humor:', error);
    res.status(500).json({ error: 'Erro ao registrar humor' });
  }
});

// ========== Z-API WHATSAPP ENDPOINTS ==========

// Webhook Z-API para receber mensagens
app.post('/webhook/zapi', async (req, res) => {
  try {
    const body = req.body;
    console.log('📨 Webhook Z-API recebido:', JSON.stringify(body, null, 2));

    // Estrutura Z-API webhook
    const { phone, fromMe, text, image, messageId, timestamp, instanceId } = body;

    // Ignorar mensagens enviadas por nós
    if (fromMe) {
      return res.status(200).json({ received: true });
    }

    if (!phone || (!text && !image)) {
      console.warn('⚠️ Webhook Z-API inválido - campos ausentes');
      return res.status(200).json({ received: true });
    }

    // Limpar número (remover @s.whatsapp.net se vier)
    const cleanPhone = phone.replace('@s.whatsapp.net', '').replace('@c.us', '');

    // Verificar se é um usuário registrado
    const user = await userStorage.getUserByPhone(cleanPhone);

    if (!user) {
      console.log(`🔒 Número não registrado: ${cleanPhone}`);
      await brDidService.sendMessage(cleanPhone, '🔒 Olá! Para usar o EssentIA, você precisa criar uma conta em https://essentia.app e vincular este número.');
      return res.status(200).json({ received: true });
    }

    const message = text || (image ? '[Imagem recebida]' : '[Mensagem sem texto]');
    const messageText = message.toLowerCase().trim();

    // FLUXO 4: Comando "Quero conversar" inicia conversa com IA
    if (messageText.includes('quero conversar')) {
      console.log(`💬 Iniciando conversa com IA para ${user.name}`);
      await brDidService.startAIConversation(cleanPhone, user.name);
      return res.status(200).json({ received: true });
    }

    // Comando de ajuda
    if (messageText === 'ajuda') {
      await brDidService.sendHelpMessage(cleanPhone, user.name);
      return res.status(200).json({ received: true });
    }

    // Comando de status
    if (messageText === 'status') {
      const entries = await whatsappService.diaryStorage.getAllEntries();
      const userEntries = entries.filter(entry => entry.whatsappNumber === cleanPhone);
      const stats = {
        totalEntries: userEntries.length,
        lastEntryDate: userEntries.length > 0
          ? new Date(userEntries[0].timestamp).toLocaleDateString('pt-BR')
          : 'Nenhuma',
        streak: 0
      };
      await brDidService.sendStatusMessage(cleanPhone, user.name, stats);
      return res.status(200).json({ received: true });
    }

    // FLUXO 3: Mensagem normal → criar entrada no diário com análise de sentimento
    console.log(`📝 Criando entrada de diário para ${user.name}: "${message.substring(0, 50)}..."`);

    // Análise de sentimento
    const sentimentResult = await whatsappService.sentimentAnalysis.analyzeSentiment(message);

    const diaryEntry = {
      id: `zapi_${Date.now()}`,
      content: message,
      whatsappNumber: cleanPhone,
      userId: user.id,
      userName: user.name,
      timestamp: new Date(timestamp * 1000 || Date.now()),
      sentiment: sentimentResult.sentiment,
      sentimentConfidence: sentimentResult.confidence,
      sentimentExplanation: sentimentResult.explanation,
      metadata: {
        source: 'zapi',
        messageId: messageId,
        instanceId: instanceId,
        phoneNumberId: cleanPhone,
        displayPhoneNumber: cleanPhone
      }
    };

    // Salvar no diário
    const savedEntry = await whatsappService.diaryStorage.saveEntry(diaryEntry);
    console.log(`✅ Entrada de diário salva:`, savedEntry.id);

    // Enviar confirmação com análise de sentimento
    await brDidService.sendDiaryConfirmation(cleanPhone, message, sentimentResult);

    res.status(200).json({ received: true, entryId: savedEntry.id });
  } catch (error) {
    console.error('❌ Erro ao processar webhook Z-API:', error);
    res.status(500).json({ error: 'Erro ao processar webhook', details: error.message });
  }
});

// Webhook BR DID (genérico) para receber mensagens
app.post('/webhook/brdid', async (req, res) => {
  try {
    const body = req.body;
    console.log('📨 Webhook BR DID recebido:', JSON.stringify(body, null, 2));

    // Estrutura típica do BR DID webhook
    const { from, message, timestamp } = body;

    if (!from || !message) {
      console.warn('⚠️ Webhook BR DID inválido - campos ausentes');
      return res.status(200).json({ received: true });
    }

    // Verificar se é um usuário registrado
    const user = await userStorage.getUserByPhone(from);

    if (!user) {
      console.log(`🔒 Número não registrado: ${from}`);
      await brDidService.sendMessage(from, '🔒 Olá! Para usar o EssentIA, você precisa criar uma conta em https://essentia.app e vincular este número.');
      return res.status(200).json({ received: true });
    }

    const messageText = message.toLowerCase().trim();

    // FLUXO 4: Comando "Quero conversar" inicia conversa com IA
    if (messageText.includes('quero conversar')) {
      console.log(`💬 Iniciando conversa com IA para ${user.name}`);
      await brDidService.startAIConversation(from, user.name);
      return res.status(200).json({ received: true });
    }

    // Comando de ajuda
    if (messageText === 'ajuda') {
      await brDidService.sendHelpMessage(from, user.name);
      return res.status(200).json({ received: true });
    }

    // Comando de status
    if (messageText === 'status') {
      const entries = await whatsappService.diaryStorage.getAllEntries();
      const userEntries = entries.filter(entry => entry.whatsappNumber === from);
      const stats = {
        totalEntries: userEntries.length,
        lastEntryDate: userEntries.length > 0
          ? new Date(userEntries[0].timestamp).toLocaleDateString('pt-BR')
          : 'Nenhuma',
        streak: 0 // TODO: calcular streak
      };
      await brDidService.sendStatusMessage(from, user.name, stats);
      return res.status(200).json({ received: true });
    }

    // FLUXO 3: Mensagem normal → criar entrada no diário com análise de sentimento
    console.log(`📝 Criando entrada de diário para ${user.name}: "${message.substring(0, 50)}..."`);

    // Análise de sentimento
    const sentimentResult = await whatsappService.sentimentAnalysis.analyzeSentiment(message);

    const diaryEntry = {
      id: `brdid_${Date.now()}`,
      content: message,
      whatsappNumber: from,
      userId: user.id,
      userName: user.name,
      timestamp: new Date(timestamp || Date.now()),
      sentiment: sentimentResult.sentiment,
      sentimentConfidence: sentimentResult.confidence,
      sentimentExplanation: sentimentResult.explanation,
      metadata: {
        source: 'brdid',
        phoneNumberId: 'brdid',
        displayPhoneNumber: from
      }
    };

    // Salvar no diário
    const savedEntry = await whatsappService.diaryStorage.saveEntry(diaryEntry);
    console.log(`✅ Entrada de diário salva:`, savedEntry.id);

    // Enviar confirmação com análise de sentimento
    await brDidService.sendDiaryConfirmation(from, message, sentimentResult);

    res.status(200).json({ received: true, entryId: savedEntry.id });
  } catch (error) {
    console.error('❌ Erro ao processar webhook BR DID:', error);
    res.status(500).json({ error: 'Erro ao processar webhook', details: error.message });
  }
});

// FLUXO 2: Endpoint para enviar lembretes
app.post('/api/send-reminders', async (req, res) => {
  try {
    if (!brDidService.isConfigured()) {
      return res.status(503).json({
        error: 'BR DID não configurado',
        sent: 0
      });
    }

    const users = await userStorage.getAllUsers();
    let sentCount = 0;
    let errors = [];

    console.log(`📤 Enviando lembretes para ${users.length} usuários...`);

    for (const user of users) {
      try {
        // Determinar tipo de lembrete baseado na hora
        const hour = new Date().getHours();
        let reminderType = 'general';

        if (hour >= 6 && hour < 12) {
          reminderType = 'morning';
        } else if (hour >= 12 && hour < 18) {
          reminderType = 'afternoon';
        } else if (hour >= 18 || hour < 6) {
          reminderType = 'evening';
        }

        await brDidService.sendReminder(user.phone, user.name, reminderType);
        sentCount++;
        console.log(`✅ Lembrete enviado para ${user.name} (${user.phone})`);
      } catch (error) {
        console.error(`❌ Erro ao enviar lembrete para ${user.name}:`, error.message);
        errors.push({ user: user.name, error: error.message });
      }
    }

    res.json({
      success: true,
      sent: sentCount,
      total: users.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('❌ Erro ao enviar lembretes:', error);
    res.status(500).json({
      error: 'Erro ao enviar lembretes',
      details: error.message
    });
  }
});

// Teste de conexão BR DID
app.get('/api/brdid/test', async (req, res) => {
  try {
    const isConnected = await brDidService.testConnection();
    res.json({
      success: isConnected,
      configured: brDidService.isConfigured(),
      message: isConnected ? 'BR DID conectado com sucesso' : 'Falha na conexão BR DID'
    });
  } catch (error) {
    console.error('Erro ao testar BR DID:', error);
    res.status(500).json({
      error: 'Erro ao testar conexão',
      details: error.message
    });
  }
});

// Teste de envio de mensagem BR DID
app.post('/api/brdid/test-message', async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        error: 'Campos "to" e "message" são obrigatórios'
      });
    }

    console.log(`🧪 Testando envio BR DID para ${to}: "${message.substring(0, 50)}..."`);

    const result = await brDidService.sendMessage(to, message);

    res.json({
      success: true,
      result,
      message: 'Mensagem BR DID enviada com sucesso!'
    });
  } catch (error) {
    console.error('❌ Erro no teste BR DID:', error);
    res.status(500).json({
      error: 'Erro ao enviar mensagem de teste',
      details: error.message,
      response: error.response?.data
    });
  }
});

// ========== STRIPE ENDPOINTS ==========

// Rota para obter informações dos planos
app.get('/stripe/plans', (req, res) => {
  try {
    const plansInfo = Object.entries(PLANS).map(([id, plan]) => ({
      id,
      name: plan.name,
      price: plan.price / 100, // Converter de centavos para reais
      currency: plan.currency,
      features: plan.features
    }));

    res.json({ success: true, plans: plansInfo });
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    res.status(500).json({ error: 'Erro ao buscar planos', details: error.message });
  }
});

// Rota para criar sessão de checkout
app.post('/stripe/create-checkout-session', async (req, res) => {
  try {
    const { planId, customerEmail } = req.body;

    if (!planId || !customerEmail) {
      return res.status(400).json({
        error: 'Campos "planId" e "customerEmail" são obrigatórios'
      });
    }

    if (!PLANS[planId]) {
      return res.status(400).json({
        error: `Plano "${planId}" não encontrado`
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const successUrl = `${frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${frontendUrl}/plans?canceled=true`;

    const session = await createCheckoutSession(
      planId,
      customerEmail,
      successUrl,
      cancelUrl
    );

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    res.status(500).json({
      error: 'Erro ao criar sessão de checkout',
      details: error.message
    });
  }
});

// Webhook do Stripe (deve usar raw body)
app.post('/stripe/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Assinatura do webhook ausente' });
    }

    const event = verifyWebhook(req.body, signature);

    console.log('📦 Evento do Stripe recebido:', event.type);

    await handleWebhookEvent(event);

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Erro no webhook do Stripe:', error);
    res.status(400).json({ error: 'Erro no webhook', details: error.message });
  }
});

// Rota para verificar status da sessão
app.get('/stripe/session-status', async (req, res) => {
  try {
    const { session_id: sessionId } = req.query;

    const { stripe } = require('./stripe-config');
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({
      success: true,
      session: {
        id: session.id,
        payment_status: session.payment_status,
        customer_email: session.customer_email,
        metadata: session.metadata
      }
    });
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    res.status(500).json({
      error: 'Erro ao verificar sessão',
      details: error.message
    });
  }
});

// Endpoint para enviar mensagem de teste via WhatsApp
app.post('/api/send-whatsapp', async (req, res) => {
  try {
    const { phone, message, userName } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        error: 'Campos "phone" e "message" são obrigatórios'
      });
    }

    if (!brDidService.isConfigured()) {
      return res.status(503).json({
        error: 'Z-API não está configurada no servidor'
      });
    }

    console.log(`📤 Enviando mensagem de teste para ${userName || phone}...`);

    // Enviar mensagem via Z-API
    await brDidService.sendMessage(phone, message);

    res.status(200).json({
      success: true,
      message: 'Mensagem enviada com sucesso!'
    });
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem WhatsApp:', error);
    res.status(500).json({
      error: 'Erro ao enviar mensagem',
      details: error.message
    });
  }
});

// ========== ADMIN ENDPOINTS (TEMPORÁRIO) ==========

// Endpoint para limpar todos os usuários (APENAS PARA DEBUG)
app.delete('/api/admin/clear-users', async (req, res) => {
  try {
    const { confirmPassword } = req.body;

    // Proteção simples
    if (confirmPassword !== 'LIMPAR_TUDO_2025') {
      return res.status(403).json({
        error: 'Senha de confirmação incorreta'
      });
    }

    console.log('🗑️  LIMPANDO TODOS OS USUÁRIOS DO BANCO...');

    // Deletar todas as entradas de diário primeiro (foreign key)
    await dbModule.query('DELETE FROM diary_entries');

    // Deletar todos os usuários
    const result = await dbModule.query('DELETE FROM users');

    console.log(`✅ ${result.rowCount} usuários deletados com sucesso`);

    res.json({
      success: true,
      message: `${result.rowCount} usuários deletados`,
      note: 'Banco limpo. Agora você pode cadastrar novos usuários.'
    });
  } catch (error) {
    console.error('❌ Erro ao limpar usuários:', error);
    res.status(500).json({
      error: 'Erro ao limpar usuários',
      details: error.message
    });
  }
});

// Endpoint para listar todos os usuários (debug)
app.get('/api/admin/list-users', async (req, res) => {
  try {
    const result = await dbModule.query('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC');

    res.json({
      success: true,
      count: result.rows.length,
      users: result.rows
    });
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
    res.status(500).json({
      error: 'Erro ao listar usuários',
      details: error.message
    });
  }
});

// ========== ADMIN ENDPOINTS ==========

// Verificar se o usuário é admin
app.get('/api/admin/check/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await dbModule.query('SELECT is_admin, is_company_manager FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      return res.json({ isAdmin: false, isCompanyManager: false });
    }

    const user = result.rows[0];
    res.json({
      isAdmin: user.is_admin === 1,
      isCompanyManager: user.is_company_manager === 1
    });
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    res.status(500).json({ error: 'Erro ao verificar permissões', details: error.message });
  }
});

// Buscar todos os usuários (Admin)
app.get('/api/admin/users', async (req, res) => {
  try {
    const result = await dbModule.query('SELECT id, name, email, phone, created_at, goals, company, department, role, is_admin, is_company_manager FROM users ORDER BY created_at DESC');
    res.json({ success: true, users: result.rows });
  } catch (error) {
    console.error('Erro ao buscar usuários admin:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários', details: error.message });
  }
});

// Atualizar usuário (Admin)
app.put('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, company, department, role, is_admin, is_company_manager, password, adminUserId, adminEmail } = req.body;

    let query = 'UPDATE users SET name = $1, email = $2, company = $3, department = $4, role = $5, is_admin = $6, is_company_manager = $7';
    let params = [name, email, company, department, role, is_admin ? 1 : 0, is_company_manager ? 1 : 0];

    if (password) {
      const passwordHash = Buffer.from(password).toString('base64');
      query += ', password_hash = $8 WHERE id = $9';
      params.push(passwordHash, id);
    } else {
      query += ' WHERE id = $8';
      params.push(id);
    }

    await dbModule.query(query, params);

    // Log de auditoria
    await createAuditLog(
      adminUserId || 'system',
      adminEmail || 'system',
      'UPDATE_USER',
      'user',
      id,
      { name, email, company, department, role, is_admin, is_company_manager, passwordChanged: !!password },
      req
    );

    res.json({ success: true, message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário', details: error.message });
  }
});

// Deletar usuário (Admin)
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminUserId, adminEmail, userName, userEmail } = req.query;

    await dbModule.query('DELETE FROM users WHERE id = $1', [id]);

    // Log de auditoria
    await createAuditLog(
      adminUserId || 'system',
      adminEmail || 'system',
      'DELETE_USER',
      'user',
      id,
      { deletedUser: userName || userEmail || id },
      req
    );

    res.json({ success: true, message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário', details: error.message });
  }
});

// Suspender/Ativar usuário (Admin)
app.patch('/api/admin/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminUserId, adminEmail } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido. Use "active" ou "suspended"' });
    }

    // Buscar dados do usuário antes de atualizar
    const userResult = await dbModule.query('SELECT name, email FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = userResult.rows[0];

    // Atualizar status
    await dbModule.query('UPDATE users SET status = $1 WHERE id = $2', [status, id]);

    // Log de auditoria
    await createAuditLog(
      adminUserId || 'system',
      adminEmail || 'system',
      status === 'suspended' ? 'SUSPEND_USER' : 'ACTIVATE_USER',
      'user',
      id,
      { targetUser: user.name || user.email, newStatus: status },
      req
    );

    res.json({
      success: true,
      message: `Usuário ${status === 'suspended' ? 'suspenso' : 'ativado'} com sucesso`
    });
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    res.status(500).json({ error: 'Erro ao alterar status do usuário', details: error.message });
  }
});

// Resetar senha de usuário (Admin)
app.post('/api/admin/users/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword, adminUserId, adminEmail } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }

    // Buscar dados do usuário
    const userResult = await dbModule.query('SELECT name, email FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = userResult.rows[0];

    // Hash da nova senha (Base64 simples)
    const passwordHash = Buffer.from(newPassword).toString('base64');

    // Atualizar senha
    await dbModule.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, id]);

    // Log de auditoria
    await createAuditLog(
      adminUserId || 'system',
      adminEmail || 'system',
      'RESET_PASSWORD',
      'user',
      id,
      { targetUser: user.name || user.email },
      req
    );

    res.json({
      success: true,
      message: 'Senha resetada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    res.status(500).json({ error: 'Erro ao resetar senha', details: error.message });
  }
});

// Criar novo usuário (Admin)
app.post('/api/admin/users', async (req, res) => {
  try {
    const { name, email, password, company, department, role, is_admin, is_company_manager, adminUserId, adminEmail } = req.body;
    const userId = generateUUID();
    const passwordHash = Buffer.from(password).toString('base64');

    await dbModule.query(
      'INSERT INTO users (id, name, email, password_hash, company, department, role, is_admin, is_company_manager) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [userId, name, email, passwordHash, company, department, role, is_admin ? 1 : 0, is_company_manager ? 1 : 0]
    );

    // Log de auditoria
    await createAuditLog(
      adminUserId || 'system',
      adminEmail || 'system',
      'CREATE_USER',
      'user',
      userId,
      { name, email, company, department, role, is_admin, is_company_manager },
      req
    );

    res.json({ success: true, message: 'Usuário criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário', details: error.message });
  }
});

// Promover usuário para admin (endpoint temporário)
app.post('/api/admin/promote/:email', async (req, res) => {
  try {
    const { email } = req.params;
    await dbModule.query('UPDATE users SET is_admin = 1 WHERE email = $1', [email]);
    res.json({ success: true, message: `Usuário ${email} promovido a admin` });
  } catch (error) {
    console.error('Erro ao promover usuário:', error);
    res.status(500).json({ error: 'Erro ao promover usuário', details: error.message });
  }
});

// ==================== CRUD DE EMPRESAS ====================

// Listar todas as empresas (Admin)
app.get('/api/admin/companies', async (req, res) => {
  try {
    const result = await dbModule.query('SELECT * FROM companies ORDER BY name');
    res.json({ success: true, companies: result.rows });
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    res.status(500).json({ error: 'Erro ao listar empresas', details: error.message });
  }
});

// Criar empresa (Admin)
app.post('/api/admin/companies', async (req, res) => {
  try {
    const { name, description, settings, adminUserId, adminEmail } = req.body;
    const companyId = generateUUID();

    await dbModule.query(
      'INSERT INTO companies (id, name, description, settings) VALUES ($1, $2, $3, $4)',
      [companyId, name, description || '', settings ? JSON.stringify(settings) : '{}']
    );

    await createAuditLog(
      adminUserId || 'system',
      adminEmail || 'system',
      'CREATE_COMPANY',
      'company',
      companyId,
      { name, description },
      req
    );

    res.json({ success: true, message: 'Empresa criada com sucesso', companyId });
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    res.status(500).json({ error: 'Erro ao criar empresa', details: error.message });
  }
});

// Atualizar empresa (Admin)
app.put('/api/admin/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, settings, adminUserId, adminEmail } = req.body;

    await dbModule.query(
      'UPDATE companies SET name = $1, description = $2, settings = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
      [name, description || '', settings ? JSON.stringify(settings) : '{}', id]
    );

    await createAuditLog(
      adminUserId || 'system',
      adminEmail || 'system',
      'UPDATE_COMPANY',
      'company',
      id,
      { name, description },
      req
    );

    res.json({ success: true, message: 'Empresa atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    res.status(500).json({ error: 'Erro ao atualizar empresa', details: error.message });
  }
});

// Deletar empresa (Admin)
app.delete('/api/admin/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminUserId, adminEmail, companyName } = req.query;

    await dbModule.query('DELETE FROM companies WHERE id = $1', [id]);

    await createAuditLog(
      adminUserId || 'system',
      adminEmail || 'system',
      'DELETE_COMPANY',
      'company',
      id,
      { deletedCompany: companyName || id },
      req
    );

    res.json({ success: true, message: 'Empresa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar empresa:', error);
    res.status(500).json({ error: 'Erro ao deletar empresa', details: error.message });
  }
});

// Buscar logs de auditoria (Admin)
app.get('/api/admin/audit-logs', async (req, res) => {
  try {
    const { limit = 100, offset = 0, action, userId } = req.query;

    let query = 'SELECT * FROM audit_logs';
    let params = [];
    let conditions = [];

    if (action) {
      conditions.push(`action = $${params.length + 1}`);
      params.push(action);
    }

    if (userId) {
      conditions.push(`user_id = $${params.length + 1}`);
      params.push(userId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await dbModule.query(query, params);
    res.json({ success: true, logs: result.rows });
  } catch (error) {
    console.error('Erro ao buscar logs de auditoria:', error);
    res.status(500).json({ error: 'Erro ao buscar logs', details: error.message });
  }
});

// Buscar todas as entradas do diário (Admin)
app.get('/api/admin/entries', async (req, res) => {
  try {
    const result = await dbModule.query('SELECT * FROM diary_entries ORDER BY timestamp DESC LIMIT 100');
    res.json({ success: true, entries: result.rows });
  } catch (error) {
    console.error('Erro ao buscar entradas admin:', error);
    res.status(500).json({ error: 'Erro ao buscar entradas', details: error.message });
  }
});


// ==================== ROTAS DE ONBOARDING ====================

// Verificar status do onboarding do usuário
app.get('/api/user/onboarding-status', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId é obrigatório' });
    }

    const result = await dbModule.query(
      'SELECT onboarding_completed FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      completed: result.rows[0].onboarding_completed === 1 || result.rows[0].onboarding_completed === true
    });
  } catch (error) {
    console.error('Erro ao verificar onboarding:', error);
    res.status(500).json({ error: 'Erro ao verificar onboarding' });
  }
});

// Marcar onboarding como completo
app.post('/api/user/complete-onboarding', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId é obrigatório' });
    }

    await dbModule.query(
      'UPDATE users SET onboarding_completed = 1 WHERE id = $1',
      [userId]
    );

    res.json({ success: true, message: 'Onboarding marcado como completo' });
  } catch (error) {
    console.error('Erro ao marcar onboarding:', error);
    res.status(500).json({ error: 'Erro ao marcar onboarding como completo' });
  }
});

// Inicializar banco de dados e servidor
async function startServer() {
  // Configurar rotas de admin (departamentos e analytics)
  const { setupAdminRoutes } = require('./admin-routes');
  setupAdminRoutes(app, dbModule);

  // Configurar rotas avançadas (PDF, Email, IA, Chat, Notificações)
  const { setupAdvancedRoutes } = require('./advanced-features-routes');
  setupAdvancedRoutes(app, dbModule);

  // Configurar rotas de atividades por empresa
  const { setupActivityConfigRoutes, initializeActivityTables } = require('./company-activities-config');
  setupActivityConfigRoutes(app, dbModule);

  // Configurar rotas de atividades de bem-estar
  const { setupWellnessActivitiesRoutes } = require('./wellness-activities-routes');
  setupWellnessActivitiesRoutes(app, dbModule);

  // Configurar rotas de métricas executivas
  const { setupExecutiveMetricsRoutes } = require('./executive-metrics-routes');
  setupExecutiveMetricsRoutes(app, dbModule);

  // Configurar rotas de IA Preditiva
  const aiRoutes = require('./ai-routes');
  app.use('/api/ai', aiRoutes(dbModule));

  // Configurar rotas de gamificação
  const { setupGamificationRoutes } = require('./gamification-routes');
  setupGamificationRoutes(app, dbModule, gamificationService);

  // Configurar rotas de atividades integradas
  const activitiesRoutes = require('./activities-routes');
  app.use('/api/activities', activitiesRoutes);
  console.log('✅ Rotas de atividades configuradas');

  try {
    // Inicializar banco de dados PostgreSQL
    await initializeDatabase();

    // Inicializar tabelas de configuração de atividades
    initializeActivityTables(dbModule);

    // Inicializar tabelas de gamificação
    await gamificationService.initializeTables(dbModule);

    // Criar servidor HTTP (necessário para Socket.IO)
    const http = require('http');
    const server = http.createServer(app);

    // Inicializar serviço de notificações (Socket.IO)
    const { getNotificationService } = require('./notification-service');
    const notificationService = getNotificationService();
    notificationService.initialize(server);

    // Iniciar servidor
    server.listen(PORT, () => {
      console.log(`🚀 Servidor EssentIA rodando na porta ${PORT}`);
      console.log(`📱 Webhook WhatsApp Meta: http://localhost:${PORT}/webhook`);
      console.log(`📱 Webhook Z-API: http://localhost:${PORT}/webhook/zapi`);

      // Validar configuração do WhatsApp Meta
      try {
        whatsappService.validateConfiguration();
      } catch (error) {
        console.warn('⚠️ WhatsApp Meta não configurado:', error.message);
      }

      // Validar configuração do Z-API
      if (brDidService.isConfigured()) {
        console.log('✅ Z-API WhatsApp configurado e pronto para uso');
        console.log('   - Instance ID: ' + process.env.ZAPI_INSTANCE_ID);
        console.log('   - Mensagem de boas-vindas: Habilitada');
        console.log('   - Lembretes: POST /api/send-reminders');
        console.log('   - Mensagens → Diário: Habilitado');
        console.log('   - Comando "Quero conversar": Habilitado');

        // Iniciar agendamento automático de lembretes
        reminderScheduler.start();
      } else {
        console.warn('⚠️ Z-API não configurado');
        console.log('💡 Configure ZAPI_INSTANCE_ID e ZAPI_TOKEN no arquivo .env');
      }
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

// Iniciar o servidor
startServer();