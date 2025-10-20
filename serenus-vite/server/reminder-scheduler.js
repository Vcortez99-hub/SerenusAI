const cron = require('node-cron');

/**
 * Sistema de agendamento de lembretes
 * Envia lembretes automáticos para os usuários nos horários configurados
 */
class ReminderScheduler {
  constructor(brDidService, userStorage) {
    this.brDidService = brDidService;
    this.userStorage = userStorage;
    this.jobs = [];
    this.isEnabled = false;
  }

  /**
   * Inicia o sistema de agendamento
   * @param {Object} config - Configurações de horários (padrão: 9h, 15h, 21h)
   */
  start(config = {}) {
    if (!this.brDidService.isConfigured()) {
      console.warn('⚠️ BR DID não configurado - agendamento de lembretes desabilitado');
      return;
    }

    const defaultTimes = {
      morning: '0 9 * * *',   // 9h da manhã
      afternoon: '0 15 * * *', // 3h da tarde
      evening: '0 21 * * *'    // 9h da noite
    };

    const times = { ...defaultTimes, ...config };

    // Lembrete matinal
    const morningJob = cron.schedule(times.morning, async () => {
      await this.sendScheduledReminders('morning');
    });

    // Lembrete da tarde
    const afternoonJob = cron.schedule(times.afternoon, async () => {
      await this.sendScheduledReminders('afternoon');
    });

    // Lembrete noturno
    const eveningJob = cron.schedule(times.evening, async () => {
      await this.sendScheduledReminders('evening');
    });

    this.jobs = [morningJob, afternoonJob, eveningJob];
    this.isEnabled = true;

    console.log('✅ Agendamento de lembretes iniciado:');
    console.log(`   - Manhã: ${times.morning} (9h)`);
    console.log(`   - Tarde: ${times.afternoon} (15h)`);
    console.log(`   - Noite: ${times.evening} (21h)`);
  }

  /**
   * Envia lembretes agendados para todos os usuários
   * @param {string} reminderType - Tipo do lembrete (morning, afternoon, evening)
   */
  async sendScheduledReminders(reminderType) {
    try {
      console.log(`📤 Enviando lembretes ${reminderType} agendados...`);

      const users = await this.userStorage.getAllUsers();
      let sentCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          // Verificar se o usuário tem preferências de lembrete configuradas
          // TODO: Implementar sistema de preferências de usuário
          // Por enquanto, enviar para todos

          await this.brDidService.sendReminder(user.phone, user.name, reminderType);
          sentCount++;
          console.log(`   ✅ Lembrete enviado para ${user.name}`);
        } catch (error) {
          errorCount++;
          console.error(`   ❌ Erro ao enviar para ${user.name}:`, error.message);
        }
      }

      console.log(`📊 Resumo - Enviados: ${sentCount} | Erros: ${errorCount} | Total: ${users.length}`);
    } catch (error) {
      console.error('❌ Erro ao enviar lembretes agendados:', error);
    }
  }

  /**
   * Para o sistema de agendamento
   */
  stop() {
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    this.isEnabled = false;
    console.log('🛑 Agendamento de lembretes parado');
  }

  /**
   * Verifica se o agendamento está ativo
   * @returns {boolean}
   */
  isActive() {
    return this.isEnabled;
  }

  /**
   * Retorna informações sobre os jobs agendados
   * @returns {Object}
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      jobsCount: this.jobs.length,
      configured: this.brDidService.isConfigured()
    };
  }
}

module.exports = ReminderScheduler;
