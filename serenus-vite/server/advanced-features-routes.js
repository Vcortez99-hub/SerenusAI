const { generateAnalyticsPDF } = require('./pdf-generator');
const { getEmailService } = require('./email-service');
const { MoodPredictor } = require('./ai-predictor');
const { ChatService } = require('./chat-service');
const { getNotificationService } = require('./notification-service');

/**
 * Configura rotas avançadas: PDF, Email, IA, Chat, Notificações
 */
function setupAdvancedRoutes(app, dbModule) {
  const emailService = getEmailService();
  const predictor = new MoodPredictor();
  const chatService = new ChatService(dbModule, getNotificationService());
  const notificationService = getNotificationService();

  // ========== RELATÓRIOS PDF ==========

  /**
   * GET /api/reports/pdf
   * Gera relatório em PDF
   */
  app.get('/api/reports/pdf', async (req, res) => {
    try {
      const { companyId, departmentId, dateRange = 30 } = req.query;

      // Buscar dados de analytics
      const analyticsData = await emailService.fetchAnalyticsData(dbModule, {
        companyId,
        departmentId,
        dateRange: parseInt(dateRange)
      });

      // Gerar PDF
      const { filePath, fileName } = await generateAnalyticsPDF(analyticsData, {
        companyName: companyId,
        departmentName: departmentId,
        dateRange
      });

      // Enviar arquivo
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('Erro ao enviar PDF:', err);
        }

        // Deletar arquivo após envio
        const fs = require('fs');
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }, 1000);
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      res.status(500).json({ error: 'Erro ao gerar PDF' });
    }
  });

  // ========== RELATÓRIOS POR EMAIL ==========

  /**
   * POST /api/reports/email
   * Envia relatório por email imediatamente
   */
  app.post('/api/reports/email', async (req, res) => {
    try {
      const { email, companyId, departmentId, dateRange = 30 } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email é obrigatório' });
      }

      // Buscar dados
      const analyticsData = await emailService.fetchAnalyticsData(dbModule, {
        companyId,
        departmentId,
        dateRange: parseInt(dateRange)
      });

      // Enviar email
      const result = await emailService.sendReportEmail(
        email,
        `Relatório EssentIA - ${new Date().toLocaleDateString('pt-BR')}`,
        analyticsData,
        {
          companyName: companyId,
          departmentName: departmentId,
          dateRange
        }
      );

      res.json({ success: true, messageId: result.messageId });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      res.status(500).json({ error: 'Erro ao enviar email' });
    }
  });

  /**
   * POST /api/reports/schedule/weekly
   * Agenda relatório semanal
   */
  app.post('/api/reports/schedule/weekly', async (req, res) => {
    try {
      const { email, companyId, departmentId, companyName, departmentName } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email é obrigatório' });
      }

      const jobId = emailService.scheduleWeeklyReport(dbModule, {
        email,
        companyId,
        departmentId,
        companyName,
        departmentName
      });

      res.json({ success: true, jobId, schedule: 'Toda segunda-feira às 9h' });
    } catch (error) {
      console.error('Erro ao agendar relatório:', error);
      res.status(500).json({ error: 'Erro ao agendar relatório' });
    }
  });

  /**
   * POST /api/reports/schedule/monthly
   * Agenda relatório mensal
   */
  app.post('/api/reports/schedule/monthly', async (req, res) => {
    try {
      const { email, companyId, departmentId, companyName, departmentName } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email é obrigatório' });
      }

      const jobId = emailService.scheduleMonthlyReport(dbModule, {
        email,
        companyId,
        departmentId,
        companyName,
        departmentName
      });

      res.json({ success: true, jobId, schedule: 'Primeiro dia do mês às 9h' });
    } catch (error) {
      console.error('Erro ao agendar relatório:', error);
      res.status(500).json({ error: 'Erro ao agendar relatório' });
    }
  });

  /**
   * DELETE /api/reports/schedule/:jobId
   * Cancela agendamento de relatório
   */
  app.delete('/api/reports/schedule/:jobId', (req, res) => {
    try {
      const { jobId } = req.params;
      const success = emailService.cancelScheduledReport(jobId);

      if (success) {
        res.json({ success: true, message: 'Agendamento cancelado' });
      } else {
        res.status(404).json({ error: 'Agendamento não encontrado' });
      }
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      res.status(500).json({ error: 'Erro ao cancelar agendamento' });
    }
  });

  // ========== IA PREDITIVA ==========

  /**
   * GET /api/ai/predict/:userId
   * Prevê humor de um usuário
   */
  app.get('/api/ai/predict/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { daysAhead = 7 } = req.query;

      const prediction = await predictor.predictMood(dbModule, userId, parseInt(daysAhead));

      res.json(prediction);
    } catch (error) {
      console.error('Erro ao fazer previsão:', error);
      res.status(500).json({ error: 'Erro ao fazer previsão' });
    }
  });

  /**
   * GET /api/ai/predict-group
   * Prevê humor para grupo (empresa/departamento)
   */
  app.get('/api/ai/predict-group', async (req, res) => {
    try {
      const { companyId, departmentId, riskThreshold = 3.0 } = req.query;

      const predictions = await predictor.predictForGroup(dbModule, {
        companyId,
        departmentId,
        riskThreshold: parseFloat(riskThreshold)
      });

      res.json(predictions);
    } catch (error) {
      console.error('Erro ao fazer previsão em grupo:', error);
      res.status(500).json({ error: 'Erro ao fazer previsão em grupo' });
    }
  });

  // ========== CHAT ==========

  /**
   * POST /api/chat/start
   * Inicia um novo chat
   */
  app.post('/api/chat/start', async (req, res) => {
    try {
      const { userId, hrUserId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'userId é obrigatório' });
      }

      const chat = await chatService.startChat(userId, hrUserId);

      res.json({ success: true, chat });
    } catch (error) {
      console.error('Erro ao iniciar chat:', error);
      res.status(500).json({ error: 'Erro ao iniciar chat' });
    }
  });

  /**
   * POST /api/chat/:chatId/message
   * Envia mensagem
   */
  app.post('/api/chat/:chatId/message', async (req, res) => {
    try {
      const { chatId } = req.params;
      const { senderId, message } = req.body;

      if (!senderId || !message) {
        return res.status(400).json({ error: 'senderId e message são obrigatórios' });
      }

      const sentMessage = await chatService.sendMessage(chatId, senderId, message);

      res.json({ success: true, message: sentMessage });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      res.status(500).json({ error: 'Erro ao enviar mensagem' });
    }
  });

  /**
   * GET /api/chat/:chatId/messages
   * Busca mensagens de um chat
   */
  app.get('/api/chat/:chatId/messages', async (req, res) => {
    try {
      const { chatId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const messages = await chatService.getMessages(chatId, parseInt(limit), parseInt(offset));

      res.json({ success: true, messages });
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      res.status(500).json({ error: 'Erro ao buscar mensagens' });
    }
  });

  /**
   * PUT /api/chat/:chatId/read
   * Marca mensagens como lidas
   */
  app.put('/api/chat/:chatId/read', async (req, res) => {
    try {
      const { chatId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'userId é obrigatório' });
      }

      const result = await chatService.markAsRead(chatId, userId);

      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Erro ao marcar como lido:', error);
      res.status(500).json({ error: 'Erro ao marcar como lido' });
    }
  });

  /**
   * GET /api/chat/user/:userId
   * Lista chats de um usuário
   */
  app.get('/api/chat/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { isHR = false } = req.query;

      const chats = await chatService.getUserChats(userId, isHR === 'true');

      res.json({ success: true, chats });
    } catch (error) {
      console.error('Erro ao buscar chats:', error);
      res.status(500).json({ error: 'Erro ao buscar chats' });
    }
  });

  /**
   * GET /api/chat/unassigned
   * Lista chats sem atribuição (para RH)
   */
  app.get('/api/chat/unassigned', async (req, res) => {
    try {
      const chats = await chatService.getUnassignedChats();

      res.json({ success: true, chats });
    } catch (error) {
      console.error('Erro ao buscar chats não atribuídos:', error);
      res.status(500).json({ error: 'Erro ao buscar chats não atribuídos' });
    }
  });

  /**
   * PUT /api/chat/:chatId/assign
   * Atribui chat a um RH
   */
  app.put('/api/chat/:chatId/assign', async (req, res) => {
    try {
      const { chatId } = req.params;
      const { hrUserId } = req.body;

      if (!hrUserId) {
        return res.status(400).json({ error: 'hrUserId é obrigatório' });
      }

      const result = await chatService.assignChatToHR(chatId, hrUserId);

      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Erro ao atribuir chat:', error);
      res.status(500).json({ error: 'Erro ao atribuir chat' });
    }
  });

  /**
   * PUT /api/chat/:chatId/close
   * Fecha um chat
   */
  app.put('/api/chat/:chatId/close', async (req, res) => {
    try {
      const { chatId } = req.params;
      const result = await chatService.closeChat(chatId);

      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Erro ao fechar chat:', error);
      res.status(500).json({ error: 'Erro ao fechar chat' });
    }
  });

  /**
   * GET /api/chat/stats
   * Estatísticas de chat
   */
  app.get('/api/chat/stats', async (req, res) => {
    try {
      const stats = await chatService.getChatStats();

      res.json({ success: true, stats });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  });

  // ========== NOTIFICAÇÕES ==========

  /**
   * GET /api/notifications/status
   * Status do serviço de notificações
   */
  app.get('/api/notifications/status', (req, res) => {
    res.json({
      success: true,
      connected: notificationService.getConnectedCount(),
      onlineUsers: notificationService.getOnlineUsers()
    });
  });

  /**
   * POST /api/notifications/test
   * Envia notificação de teste
   */
  app.post('/api/notifications/test', (req, res) => {
    try {
      const { userId, type = 'test' } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'userId é obrigatório' });
      }

      const sent = notificationService.sendToUser(userId, {
        type,
        severity: 'low',
        title: '🧪 Notificação de Teste',
        message: 'Sistema de notificações funcionando corretamente!',
        data: { timestamp: new Date().toISOString() }
      });

      res.json({ success: true, sent });
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      res.status(500).json({ error: 'Erro ao enviar notificação' });
    }
  });

  console.log('✅ Rotas avançadas configuradas (PDF, Email, IA, Chat, Notificações)');
}

module.exports = { setupAdvancedRoutes };
