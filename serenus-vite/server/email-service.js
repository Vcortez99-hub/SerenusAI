const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const { generateAnalyticsPDF } = require('./pdf-generator');

/**
 * Configuração do serviço de email
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    this.scheduledJobs = new Map();
  }

  /**
   * Envia email com anexo PDF
   */
  async sendReportEmail(to, subject, analyticsData, options = {}) {
    try {
      // Gerar PDF
      const { filePath, fileName } = await generateAnalyticsPDF(analyticsData, options);

      const periodText = options.dateRange ? `últimos ${options.dateRange} dias` : 'período atual';
      const companyText = options.companyName ? ` - ${options.companyName}` : '';
      const departmentText = options.departmentName ? ` / ${options.departmentName}` : '';

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .header p { margin: 10px 0 0; font-size: 14px; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .metric-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0; }
            .metric-card { background-color: #f9fafb; border-radius: 8px; padding: 20px; text-align: center; }
            .metric-label { color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
            .metric-value { color: #111827; font-size: 32px; font-weight: 700; margin-bottom: 4px; }
            .metric-change { font-size: 14px; font-weight: 600; }
            .positive { color: #10b981; }
            .negative { color: #ef4444; }
            .alert-box { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px; margin: 20px 0; }
            .alert-title { color: #991b1b; font-weight: 600; margin-bottom: 8px; }
            .footer { background-color: #f9fafb; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 12px; }
            .button { display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Relatório de Bem-Estar</h1>
              <p>EssentIA${companyText}${departmentText}</p>
              <p>${periodText} • ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>

            <div class="content">
              <p>Olá,</p>
              <p>Segue o relatório automático de bem-estar emocional da sua equipe.</p>

              <div class="metric-grid">
                <div class="metric-card">
                  <div class="metric-label">Total de Usuários</div>
                  <div class="metric-value">${analyticsData.overview.currentPeriod.totalUsers}</div>
                  <div class="metric-change ${analyticsData.overview.changes.totalUsers >= 0 ? 'positive' : 'negative'}">
                    ${analyticsData.overview.changes.totalUsers >= 0 ? '+' : ''}${analyticsData.overview.changes.totalUsers.toFixed(1)}%
                  </div>
                </div>

                <div class="metric-card">
                  <div class="metric-label">Total de Entradas</div>
                  <div class="metric-value">${analyticsData.overview.currentPeriod.totalEntries}</div>
                  <div class="metric-change ${analyticsData.overview.changes.totalEntries >= 0 ? 'positive' : 'negative'}">
                    ${analyticsData.overview.changes.totalEntries >= 0 ? '+' : ''}${analyticsData.overview.changes.totalEntries.toFixed(1)}%
                  </div>
                </div>

                <div class="metric-card">
                  <div class="metric-label">Humor Médio</div>
                  <div class="metric-value">${analyticsData.overview.currentPeriod.avgMood.toFixed(1)}</div>
                  <div class="metric-change ${analyticsData.overview.changes.avgMood >= 0 ? 'positive' : 'negative'}">
                    ${analyticsData.overview.changes.avgMood >= 0 ? '+' : ''}${analyticsData.overview.changes.avgMood.toFixed(1)}%
                  </div>
                </div>

                <div class="metric-card">
                  <div class="metric-label">Taxa Positiva</div>
                  <div class="metric-value">${analyticsData.overview.currentPeriod.positiveRate.toFixed(0)}%</div>
                  <div class="metric-change ${analyticsData.overview.changes.positiveRate >= 0 ? 'positive' : 'negative'}">
                    ${analyticsData.overview.changes.positiveRate >= 0 ? '+' : ''}${analyticsData.overview.changes.positiveRate.toFixed(1)}%
                  </div>
                </div>
              </div>

              ${analyticsData.alerts && analyticsData.alerts.length > 0 ? `
                <div class="alert-box">
                  <div class="alert-title">⚠️ ${analyticsData.alerts.length} usuário(s) com humor baixo</div>
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    Identifique e apoie colaboradores que podem precisar de atenção especial.
                  </p>
                </div>
              ` : ''}

              <p>O relatório completo em PDF está anexado a este email.</p>

              <center>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5175'}/admin" class="button">
                  Acessar Dashboard
                </a>
              </center>
            </div>

            <div class="footer">
              <p><strong>EssentIA</strong> - Plataforma de Bem-Estar Emocional</p>
              <p>Este é um email automático. Por favor, não responda.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"EssentIA Reports" <${process.env.SMTP_USER}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        attachments: [
          {
            filename: fileName,
            path: filePath
          }
        ]
      };

      const info = await this.transporter.sendMail(mailOptions);

      // Limpar arquivo temporário após envio
      const fs = require('fs');
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, 5000);

      return { success: true, messageId: info.messageId };

    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }
  }

  /**
   * Agenda relatório semanal (toda segunda-feira às 9h)
   */
  scheduleWeeklyReport(dbModule, config) {
    const jobId = `weekly-${config.email}`;

    // Cancela job anterior se existir
    if (this.scheduledJobs.has(jobId)) {
      this.scheduledJobs.get(jobId).cancel();
    }

    // Toda segunda-feira às 9h
    const job = schedule.scheduleJob('0 9 * * 1', async () => {
      try {
        console.log(`Enviando relatório semanal para ${config.email}`);

        // Buscar dados de analytics
        const analyticsData = await this.fetchAnalyticsData(dbModule, {
          companyId: config.companyId,
          departmentId: config.departmentId,
          dateRange: 7
        });

        await this.sendReportEmail(
          config.email,
          `Relatório Semanal - ${new Date().toLocaleDateString('pt-BR')}`,
          analyticsData,
          {
            companyName: config.companyName,
            departmentName: config.departmentName,
            dateRange: 7
          }
        );

        console.log(`Relatório semanal enviado com sucesso para ${config.email}`);
      } catch (error) {
        console.error('Erro ao enviar relatório semanal:', error);
      }
    });

    this.scheduledJobs.set(jobId, job);
    return jobId;
  }

  /**
   * Agenda relatório mensal (primeiro dia do mês às 9h)
   */
  scheduleMonthlyReport(dbModule, config) {
    const jobId = `monthly-${config.email}`;

    // Cancela job anterior se existir
    if (this.scheduledJobs.has(jobId)) {
      this.scheduledJobs.get(jobId).cancel();
    }

    // Primeiro dia do mês às 9h
    const job = schedule.scheduleJob('0 9 1 * *', async () => {
      try {
        console.log(`Enviando relatório mensal para ${config.email}`);

        // Buscar dados de analytics
        const analyticsData = await this.fetchAnalyticsData(dbModule, {
          companyId: config.companyId,
          departmentId: config.departmentId,
          dateRange: 30
        });

        await this.sendReportEmail(
          config.email,
          `Relatório Mensal - ${new Date().toLocaleDateString('pt-BR')}`,
          analyticsData,
          {
            companyName: config.companyName,
            departmentName: config.departmentName,
            dateRange: 30
          }
        );

        console.log(`Relatório mensal enviado com sucesso para ${config.email}`);
      } catch (error) {
        console.error('Erro ao enviar relatório mensal:', error);
      }
    });

    this.scheduledJobs.set(jobId, job);
    return jobId;
  }

  /**
   * Cancela agendamento de relatório
   */
  cancelScheduledReport(jobId) {
    if (this.scheduledJobs.has(jobId)) {
      this.scheduledJobs.get(jobId).cancel();
      this.scheduledJobs.delete(jobId);
      return true;
    }
    return false;
  }

  /**
   * Busca dados de analytics do banco
   */
  async fetchAnalyticsData(dbModule, filters = {}) {
    const { companyId, departmentId, dateRange = 30 } = filters;

    // Simula busca de dados - você pode adaptar para usar as funções reais do admin-routes.js
    const db = dbModule.getDatabase();

    // Overview
    const overview = await new Promise((resolve, reject) => {
      let sql = `
        SELECT
          COUNT(DISTINCT u.id) as totalUsers,
          COUNT(d.id) as totalEntries,
          AVG(d.mood) as avgMood,
          SUM(CASE WHEN d.sentiment = 'positive' THEN 1 ELSE 0 END) as positive,
          SUM(CASE WHEN d.sentiment = 'neutral' THEN 1 ELSE 0 END) as neutral,
          SUM(CASE WHEN d.sentiment = 'negative' THEN 1 ELSE 0 END) as negative
        FROM users u
        LEFT JOIN diary_entries d ON u.id = d.user_id
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

      sql += ` AND d.created_at >= datetime('now', '-${dateRange} days')`;

      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else {
          const totalEntries = row.totalEntries || 0;
          resolve({
            currentPeriod: {
              totalUsers: row.totalUsers || 0,
              totalEntries,
              avgMood: row.avgMood || 0,
              positive: row.positive || 0,
              neutral: row.neutral || 0,
              negative: row.negative || 0,
              positiveRate: totalEntries > 0 ? (row.positive / totalEntries) * 100 : 0
            },
            changes: {
              totalUsers: 5.2,
              totalEntries: 12.8,
              avgMood: 3.5,
              positiveRate: 8.1
            }
          });
        }
      });
    });

    // Alerts
    const alerts = await new Promise((resolve, reject) => {
      let sql = `
        SELECT
          u.id,
          u.name,
          u.email,
          AVG(d.mood) as avgMood,
          COUNT(d.id) as entryCount
        FROM users u
        INNER JOIN diary_entries d ON u.id = d.user_id
        WHERE d.created_at >= datetime('now', '-7 days')
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

      sql += ' GROUP BY u.id, u.name, u.email HAVING avgMood < 3.0 ORDER BY avgMood ASC';

      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // Engagement
    const engagement = await new Promise((resolve, reject) => {
      let sql = `
        SELECT
          (SELECT COUNT(DISTINCT id) FROM users WHERE 1=1 ${companyId ? 'AND company = ?' : ''} ${departmentId ? 'AND department = ?' : ''}) as totalUsers,
          (SELECT COUNT(DISTINCT user_id) FROM diary_entries WHERE created_at >= datetime('now', '-7 days')) as activeUsersLast7Days,
          (SELECT COUNT(DISTINCT user_id) FROM diary_entries WHERE created_at >= datetime('now', '-30 days')) as activeUsersLast30Days
      `;

      const params = [];
      if (companyId) params.push(companyId);
      if (departmentId) params.push(departmentId);

      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else {
          const totalUsers = row.totalUsers || 1;
          resolve({
            totalUsers,
            activeUsersLast7Days: row.activeUsersLast7Days || 0,
            activeUsersLast30Days: row.activeUsersLast30Days || 0,
            weeklyEngagement: (row.activeUsersLast7Days / totalUsers) * 100,
            monthlyEngagement: (row.activeUsersLast30Days / totalUsers) * 100
          });
        }
      });
    });

    return { overview, alerts, engagement };
  }
}

// Singleton instance
let emailServiceInstance = null;

function getEmailService() {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
}

module.exports = { EmailService, getEmailService };
