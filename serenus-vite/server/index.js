const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const WhatsAppService = require('./whatsapp');
const BRDIDService = require('./brdid-service');
const UserStorage = require('./user-storage');
const ReminderScheduler = require('./reminder-scheduler');
const { createCheckoutSession, verifyWebhook, handleWebhookEvent, PLANS } = require('./stripe-config');

// Usar SQLite para desenvolvimento local, PostgreSQL para produção
const dbModule = process.env.NODE_ENV === 'production' 
  ? require('./db') 
  : require('./db-sqlite');
const { initializeDatabase } = dbModule;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const whatsappService = new WhatsAppService();
const brDidService = new BRDIDService();
const userStorage = new UserStorage();
const reminderScheduler = new ReminderScheduler(brDidService, userStorage);

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

// Rota para criar nova entrada no diário (via frontend)
app.post('/api/diary-entries', async (req, res) => {
  try {
    const { userId, userName, userPhone, title, content, mood, moodScore, tags, gratitude } = req.body;

    if (!userId || !content) {
      return res.status(400).json({
        error: 'Campos "userId" e "content" são obrigatórios'
      });
    }

    // Criar entrada no formato do backend
    const diaryEntry = {
      id: `frontend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: content,
      whatsappNumber: userPhone || 'N/A',
      userId: userId,
      userName: userName || 'Usuário',
      timestamp: new Date(),
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

    res.status(201).json({
      success: true,
      entry: savedEntry,
      message: 'Entrada salva com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao criar entrada do diário:', error);
    res.status(500).json({
      error: 'Erro ao criar entrada do diário',
      details: error.message
    });
  }
});

// Rota para listar entradas de diário
app.get('/api/diary-entries', async (req, res) => {
  try {
    const entries = await whatsappService.diaryStorage.getAllEntries();
    res.json({ success: true, entries, total: entries.length });
  } catch (error) {
    console.error('Erro ao buscar entradas do diário:', error);
    res.status(500).json({ error: 'Erro ao buscar entradas do diário', details: error.message });
  }
});

// Rota para buscar entradas por data
app.get('/api/diary-entries/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const entries = await whatsappService.diaryStorage.getEntriesByDate(date);
    res.json({ success: true, entries, total: entries.length, date });
  } catch (error) {
    console.error('Erro ao buscar entradas por data:', error);
    res.status(500).json({ error: 'Erro ao buscar entradas por data', details: error.message });
  }
});

// Rota para excluir entrada do diário
app.delete('/api/diary-entries/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: 'ID da entrada é obrigatório'
      });
    }

    const success = await whatsappService.diaryStorage.deleteEntry(id);

    if (!success) {
      return res.status(404).json({
        error: 'Entrada não encontrada'
      });
    }

    console.log(`🗑️ Entrada excluída: ${id}`);

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

// Rota de registro
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, goals, preferences, mentalHealthData, wellnessScore } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Campos "name", "email" e "password" são obrigatórios'
      });
    }

    // Verificar se o email já existe
    const { query } = require('./db');
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'Email já cadastrado'
      });
    }

    // Hash da senha (simples - em produção usar bcrypt)
    const passwordHash = Buffer.from(password).toString('base64');

    // Criar usuário
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const result = await query(
      `INSERT INTO users (
        id, name, email, password_hash, phone, goals, preferences, mental_health_data, wellness_score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, name, email, phone, goals, preferences, mental_health_data, wellness_score, created_at`,
      [
        userId,
        name,
        email,
        passwordHash,
        phone || null,
        goals || [],
        JSON.stringify(preferences || { notifications: true, privacy: 'private', reminderTime: '20:00' }),
        JSON.stringify(mentalHealthData || null),
        JSON.stringify(wellnessScore || null)
      ]
    );

    const user = result.rows[0];

    console.log(`✅ Usuário registrado: ${name} (${email})`);

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        goals: user.goals,
        preferences: typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences,
        mentalHealthData: user.mental_health_data ? (typeof user.mental_health_data === 'string' ? JSON.parse(user.mental_health_data) : user.mental_health_data) : null,
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

    if (!email || !password) {
      return res.status(400).json({
        error: 'Campos "email" e "password" são obrigatórios'
      });
    }

    const { query } = require('./db');
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Email ou senha incorretos'
      });
    }

    const user = result.rows[0];
    const passwordHash = Buffer.from(password).toString('base64');

    if (user.password_hash !== passwordHash) {
      return res.status(401).json({
        error: 'Email ou senha incorretos'
      });
    }

    console.log(`✅ Login bem-sucedido: ${user.name} (${email})`);

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        goals: user.goals || [],
        preferences: user.preferences ? (typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences) : {},
        mentalHealthData: user.mental_health_data ? (typeof user.mental_health_data === 'string' ? JSON.parse(user.mental_health_data) : user.mental_health_data) : null,
        wellnessScore: user.wellness_score ? (typeof user.wellness_score === 'string' ? JSON.parse(user.wellness_score) : user.wellness_score) : null,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
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

// Inicializar banco de dados e servidor
async function startServer() {
  try {
    // Inicializar banco de dados PostgreSQL
    await initializeDatabase();

    // Iniciar servidor
    app.listen(PORT, () => {
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