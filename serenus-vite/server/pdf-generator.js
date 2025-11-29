const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Gera relatório em PDF com analytics do dashboard
 */
async function generateAnalyticsPDF(analyticsData, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: 'Relatório de Analytics - EssentIA',
          Author: 'EssentIA System',
          Subject: 'Relatório de Bem-Estar Emocional'
        }
      });

      const fileName = `relatorio-${Date.now()}.pdf`;
      const filePath = path.join(__dirname, 'reports', fileName);

      // Criar diretório se não existir
      if (!fs.existsSync(path.join(__dirname, 'reports'))) {
        fs.mkdirSync(path.join(__dirname, 'reports'), { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // === HEADER ===
      doc.fontSize(24)
         .fillColor('#4F46E5')
         .text('EssentIA', { align: 'center' });

      doc.fontSize(12)
         .fillColor('#6B7280')
         .text('Relatório de Bem-Estar Emocional', { align: 'center' });

      doc.moveDown();
      doc.fontSize(10)
         .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });

      if (options.companyName) {
        doc.text(`Empresa: ${options.companyName}`, { align: 'center' });
      }
      if (options.departmentName) {
        doc.text(`Departamento: ${options.departmentName}`, { align: 'center' });
      }

      doc.moveDown(2);

      // === LINHA DIVISÓRIA ===
      doc.strokeColor('#E5E7EB')
         .lineWidth(1)
         .moveTo(50, doc.y)
         .lineTo(545, doc.y)
         .stroke();

      doc.moveDown();

      // === MÉTRICAS PRINCIPAIS ===
      doc.fontSize(16)
         .fillColor('#111827')
         .text('Métricas Principais', { underline: true });

      doc.moveDown(0.5);

      const { overview } = analyticsData;

      // Grid de métricas
      const startY = doc.y;
      const colWidth = 120;

      // Total de Usuários
      doc.fontSize(10)
         .fillColor('#6B7280')
         .text('Total de Usuários', 50, startY);
      doc.fontSize(20)
         .fillColor('#111827')
         .text(overview.currentPeriod.totalUsers.toString(), 50, startY + 15);

      const change1 = overview.changes.totalUsers;
      doc.fontSize(9)
         .fillColor(change1 >= 0 ? '#10B981' : '#EF4444')
         .text(`${change1 >= 0 ? '+' : ''}${change1.toFixed(1)}%`, 50, startY + 40);

      // Total de Entradas
      doc.fontSize(10)
         .fillColor('#6B7280')
         .text('Total de Entradas', 50 + colWidth, startY);
      doc.fontSize(20)
         .fillColor('#111827')
         .text(overview.currentPeriod.totalEntries.toString(), 50 + colWidth, startY + 15);

      const change2 = overview.changes.totalEntries;
      doc.fontSize(9)
         .fillColor(change2 >= 0 ? '#10B981' : '#EF4444')
         .text(`${change2 >= 0 ? '+' : ''}${change2.toFixed(1)}%`, 50 + colWidth, startY + 40);

      // Humor Médio
      doc.fontSize(10)
         .fillColor('#6B7280')
         .text('Humor Médio', 50 + colWidth * 2, startY);
      doc.fontSize(20)
         .fillColor('#111827')
         .text(overview.currentPeriod.avgMood.toFixed(1), 50 + colWidth * 2, startY + 15);

      const change3 = overview.changes.avgMood;
      doc.fontSize(9)
         .fillColor(change3 >= 0 ? '#10B981' : '#EF4444')
         .text(`${change3 >= 0 ? '+' : ''}${change3.toFixed(1)}%`, 50 + colWidth * 2, startY + 40);

      // Taxa Positiva
      doc.fontSize(10)
         .fillColor('#6B7280')
         .text('Taxa Positiva', 50 + colWidth * 3, startY);
      doc.fontSize(20)
         .fillColor('#111827')
         .text(`${overview.currentPeriod.positiveRate.toFixed(0)}%`, 50 + colWidth * 3, startY + 15);

      const change4 = overview.changes.positiveRate;
      doc.fontSize(9)
         .fillColor(change4 >= 0 ? '#10B981' : '#EF4444')
         .text(`${change4 >= 0 ? '+' : ''}${change4.toFixed(1)}%`, 50 + colWidth * 3, startY + 40);

      doc.y = startY + 70;
      doc.moveDown(2);

      // === SENTIMENTOS ===
      doc.fontSize(16)
         .fillColor('#111827')
         .text('Distribuição de Sentimentos', { underline: true });

      doc.moveDown(0.5);

      const sentStartY = doc.y;

      // Positivos
      doc.fontSize(10)
         .fillColor('#6B7280')
         .text('Positivos', 50, sentStartY);
      doc.fontSize(18)
         .fillColor('#10B981')
         .text(overview.currentPeriod.positive.toString(), 50, sentStartY + 15);
      doc.fontSize(9)
         .fillColor('#6B7280')
         .text(`${((overview.currentPeriod.positive / overview.currentPeriod.totalEntries) * 100).toFixed(0)}%`, 50, sentStartY + 38);

      // Neutros
      doc.fontSize(10)
         .fillColor('#6B7280')
         .text('Neutros', 220, sentStartY);
      doc.fontSize(18)
         .fillColor('#6B7280')
         .text(overview.currentPeriod.neutral.toString(), 220, sentStartY + 15);
      doc.fontSize(9)
         .fillColor('#6B7280')
         .text(`${((overview.currentPeriod.neutral / overview.currentPeriod.totalEntries) * 100).toFixed(0)}%`, 220, sentStartY + 38);

      // Negativos
      doc.fontSize(10)
         .fillColor('#6B7280')
         .text('Negativos', 390, sentStartY);
      doc.fontSize(18)
         .fillColor('#EF4444')
         .text(overview.currentPeriod.negative.toString(), 390, sentStartY + 15);
      doc.fontSize(9)
         .fillColor('#6B7280')
         .text(`${((overview.currentPeriod.negative / overview.currentPeriod.totalEntries) * 100).toFixed(0)}%`, 390, sentStartY + 38);

      doc.y = sentStartY + 60;
      doc.moveDown(2);

      // === ALERTAS ===
      if (analyticsData.alerts && analyticsData.alerts.length > 0) {
        doc.fontSize(16)
           .fillColor('#111827')
           .text('Alertas - Usuários com Humor Baixo', { underline: true });

        doc.moveDown(0.5);

        doc.fontSize(10)
           .fillColor('#EF4444')
           .text(`${analyticsData.alerts.length} usuário(s) com humor abaixo de 3.0 nos últimos 7 dias`);

        doc.moveDown(0.5);

        analyticsData.alerts.slice(0, 5).forEach((alert, index) => {
          doc.fontSize(9)
             .fillColor('#6B7280')
             .text(`• ${alert.name} (${alert.email}) - Humor: ${alert.avgMood.toFixed(1)} - ${alert.entryCount} entradas`);
        });

        if (analyticsData.alerts.length > 5) {
          doc.fontSize(9)
             .fillColor('#6B7280')
             .text(`... e mais ${analyticsData.alerts.length - 5} usuário(s)`);
        }

        doc.moveDown(2);
      }

      // === ENGAJAMENTO ===
      if (analyticsData.engagement) {
        doc.fontSize(16)
           .fillColor('#111827')
           .text('Engajamento', { underline: true });

        doc.moveDown(0.5);

        const eng = analyticsData.engagement;

        doc.fontSize(10)
           .fillColor('#6B7280')
           .text(`Taxa de Engajamento Semanal: `, { continued: true })
           .fillColor('#111827')
           .text(`${eng.weeklyEngagement.toFixed(1)}%`);

        doc.fontSize(10)
           .fillColor('#6B7280')
           .text(`Taxa de Engajamento Mensal: `, { continued: true })
           .fillColor('#111827')
           .text(`${eng.monthlyEngagement.toFixed(1)}%`);

        doc.fontSize(10)
           .fillColor('#6B7280')
           .text(`Usuários Ativos (7 dias): `, { continued: true })
           .fillColor('#111827')
           .text(`${eng.activeUsersLast7Days} de ${eng.totalUsers}`);

        doc.fontSize(10)
           .fillColor('#6B7280')
           .text(`Usuários Ativos (30 dias): `, { continued: true })
           .fillColor('#111827')
           .text(`${eng.activeUsersLast30Days} de ${eng.totalUsers}`);

        doc.moveDown(2);
      }

      // === FOOTER ===
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);

        doc.fontSize(8)
           .fillColor('#9CA3AF')
           .text(
             `Página ${i + 1} de ${pageCount}`,
             50,
             doc.page.height - 50,
             { align: 'center' }
           );

        doc.text(
          'EssentIA - Plataforma de Bem-Estar Emocional',
          50,
          doc.page.height - 35,
          { align: 'center' }
        );
      }

      doc.end();

      stream.on('finish', () => {
        resolve({ filePath, fileName });
      });

      stream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateAnalyticsPDF };
