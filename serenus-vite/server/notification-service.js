const { Server } = require('socket.io');

/**
 * Serviço de Notificações Push em Tempo Real
 */
class NotificationService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
  }

  /**
   * Inicializa o serviço com o servidor HTTP
   */
  initialize(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5175',
        methods: ['GET', 'POST'],
        credentials: true
      },
      path: '/socket.io/'
    });

    this.io.on('connection', (socket) => {
      console.log(`✅ Cliente conectado: ${socket.id}`);

      // Registro de usuário
      socket.on('register', (userId) => {
        this.connectedUsers.set(userId, socket.id);
        console.log(`👤 Usuário registrado: ${userId} -> ${socket.id}`);

        // Enviar confirmação
        socket.emit('registered', { userId, socketId: socket.id });
      });

      // Desconexão
      socket.on('disconnect', () => {
        // Remove usuário da lista
        for (const [userId, socketId] of this.connectedUsers.entries()) {
          if (socketId === socket.id) {
            this.connectedUsers.delete(userId);
            console.log(`👋 Usuário desconectado: ${userId}`);
            break;
          }
        }
      });

      // Heartbeat para manter conexão ativa
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });

    console.log('🔔 Serviço de Notificações iniciado');
  }

  /**
   * Envia notificação para um usuário específico
   */
  sendToUser(userId, notification) {
    const socketId = this.connectedUsers.get(userId);

    if (socketId) {
      this.io.to(socketId).emit('notification', {
        ...notification,
        timestamp: new Date().toISOString()
      });
      return true;
    }

    return false;
  }

  /**
   * Envia notificação para múltiplos usuários
   */
  sendToUsers(userIds, notification) {
    let sentCount = 0;

    userIds.forEach(userId => {
      if (this.sendToUser(userId, notification)) {
        sentCount++;
      }
    });

    return sentCount;
  }

  /**
   * Broadcast para todos os usuários conectados
   */
  broadcast(notification) {
    this.io.emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Envia notificação para administradores
   */
  sendToAdmins(dbModule, notification) {
    const db = dbModule.getDatabase();

    db.all('SELECT id FROM users WHERE role = ?', ['admin'], (err, rows) => {
      if (err) {
        console.error('Erro ao buscar admins:', err);
        return;
      }

      const adminIds = rows.map(r => r.id);
      this.sendToUsers(adminIds, notification);
    });
  }

  /**
   * TIPOS DE NOTIFICAÇÕES ESPECÍFICAS
   */

  // Alerta de humor baixo
  notifyLowMood(userId, moodData) {
    this.sendToUser(userId, {
      type: 'low_mood_alert',
      severity: 'medium',
      title: 'Percebemos que você pode precisar de apoio',
      message: 'Seu humor tem estado mais baixo recentemente. Estamos aqui para ajudar.',
      data: moodData,
      actions: [
        { label: 'Conversar com RH', action: 'open_chat' },
        { label: 'Ver recursos', action: 'view_resources' }
      ]
    });
  }

  // Alerta para RH sobre usuário em risco
  notifyHRLowMood(hrUserIds, userData) {
    this.sendToUsers(hrUserIds, {
      type: 'user_low_mood',
      severity: 'high',
      title: `⚠️ ${userData.name} pode precisar de atenção`,
      message: `Humor médio: ${userData.avgMood.toFixed(1)} nos últimos 7 dias`,
      data: userData,
      actions: [
        { label: 'Ver detalhes', action: 'view_user_details', userId: userData.id },
        { label: 'Iniciar conversa', action: 'start_chat', userId: userData.id }
      ]
    });
  }

  // Notificação de previsão de humor baixo (IA Preditiva)
  notifyPredictedLowMood(userId, predictionData) {
    this.sendToUser(userId, {
      type: 'predicted_low_mood',
      severity: 'medium',
      title: '🔮 Previsão de Bem-Estar',
      message: `Nossa IA prevê que você pode se sentir menos animado nos próximos dias. Que tal planejar algo positivo?`,
      data: predictionData,
      actions: [
        { label: 'Ver previsão', action: 'view_prediction' },
        { label: 'Agendar conversa', action: 'schedule_chat' }
      ]
    });
  }

  // Notificação de nova mensagem no chat
  notifyNewMessage(userId, messageData) {
    this.sendToUser(userId, {
      type: 'new_message',
      severity: 'low',
      title: `💬 Nova mensagem de ${messageData.senderName}`,
      message: messageData.preview,
      data: messageData,
      actions: [
        { label: 'Responder', action: 'open_chat', chatId: messageData.chatId }
      ]
    });
  }

  // Notificação de relatório disponível
  notifyReportReady(userId, reportData) {
    this.sendToUser(userId, {
      type: 'report_ready',
      severity: 'low',
      title: '📊 Relatório Disponível',
      message: `Seu relatório de ${reportData.period} está pronto para download`,
      data: reportData,
      actions: [
        { label: 'Download PDF', action: 'download_report', reportId: reportData.id }
      ]
    });
  }

  // Lembrete de diário
  notifyDiaryReminder(userId) {
    this.sendToUser(userId, {
      type: 'diary_reminder',
      severity: 'low',
      title: '📝 Hora do seu check-in diário',
      message: 'Reserve um momento para registrar como você está se sentindo hoje',
      actions: [
        { label: 'Escrever agora', action: 'open_diary' },
        { label: 'Lembrar mais tarde', action: 'snooze_reminder' }
      ]
    });
  }

  // Reconhecimento positivo
  notifyPositiveStreak(userId, streakData) {
    this.sendToUser(userId, {
      type: 'positive_streak',
      severity: 'low',
      title: `🎉 ${streakData.days} dias consecutivos!`,
      message: 'Parabéns por manter uma rotina consistente de bem-estar!',
      data: streakData,
      actions: [
        { label: 'Ver progresso', action: 'view_progress' }
      ]
    });
  }

  /**
   * UTILITÁRIOS
   */

  // Verifica se usuário está online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  // Retorna lista de usuários online
  getOnlineUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  // Retorna número de usuários conectados
  getConnectedCount() {
    return this.connectedUsers.size;
  }
}

// Singleton instance
let notificationServiceInstance = null;

function getNotificationService() {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new NotificationService();
  }
  return notificationServiceInstance;
}

module.exports = { NotificationService, getNotificationService };
