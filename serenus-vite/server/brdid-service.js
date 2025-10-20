const axios = require('axios');
require('dotenv').config();

/**
 * Serviço de integração com Z-API WhatsApp
 * Documentação: https://developer.z-api.io/
 */
class BRDIDService {
  constructor() {
    // Credenciais Z-API
    this.instanceId = process.env.ZAPI_INSTANCE_ID;
    this.token = process.env.ZAPI_TOKEN;
    this.clientToken = process.env.ZAPI_CLIENT_TOKEN;
    this.baseUrl = 'https://api.z-api.io';

    // Validar configuração
    if (!this.instanceId) {
      console.warn('⚠️ Z-API Instance ID não configurado no .env (ZAPI_INSTANCE_ID)');
    }
    if (!this.token) {
      console.warn('⚠️ Z-API Token não configurado no .env (ZAPI_TOKEN)');
    }
    if (!this.clientToken) {
      console.warn('⚠️ Z-API Client Token não configurado no .env (ZAPI_CLIENT_TOKEN)');
      console.warn('   Obtenha em: Dashboard Z-API > Security > Account Security Token');
    }
  }

  /**
   * Envia uma mensagem de texto via Z-API
   * @param {string} to - Número do destinatário (formato: 5511999999999)
   * @param {string} message - Texto da mensagem
   * @returns {Promise<Object>} - Resposta da API
   */
  async sendMessage(to, message) {
    try {
      if (!this.instanceId || !this.token) {
        throw new Error('Z-API não configurada (Instance ID ou Token ausente)');
      }

      // Formato correto da Z-API
      const payload = {
        phone: to,
        message: message
      };

      const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.token}/send-text`;

      console.log(`📤 Enviando mensagem Z-API:`, {
        url: `${this.baseUrl}/instances/${this.instanceId}/token/****/send-text`,
        to,
        messagePreview: message.substring(0, 50) + '...'
      });

      const headers = {
        'Content-Type': 'application/json'
      };

      // Adicionar Client-Token se configurado
      if (this.clientToken) {
        headers['Client-Token'] = this.clientToken;
      }

      const response = await axios.post(url, payload, { headers });

      console.log('✅ Mensagem Z-API enviada com sucesso:', {
        to,
        messageId: response.data.messageId || response.data.id,
        status: response.data.status || 'ENVIADA'
      });

      return response.data;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem via Z-API:', {
        error: error.response?.data || error.message,
        status: error.response?.status,
        to,
        messagePreview: message.substring(0, 50)
      });
      throw error;
    }
  }

  /**
   * Envia mensagem de boas-vindas para novo usuário
   * @param {string} to - Número do destinatário
   * @param {string} userName - Nome do usuário
   * @returns {Promise<Object>}
   */
  async sendWelcomeMessage(to, userName) {
    const message = `🌟 *Bem-vindo ao EssentIA, ${userName}!*

Olá! É um prazer ter você conosco. 💙

Agora você pode usar o EssentIA diretamente pelo WhatsApp para:

📝 *Diário Emocional*
• Escreva seus pensamentos e sentimentos
• Suas mensagens serão salvas automaticamente
• Análise de sentimento com IA

🔔 *Lembretes Personalizados*
• Receba lembretes nos horários que escolheu
• Mantenha sua rotina de autocuidado

💬 *Conversar com IA*
• Digite "Quero conversar" a qualquer momento
• Suporte emocional disponível 24/7

✨ Comece agora mesmo escrevendo sobre seu dia!`;

    return await this.sendMessage(to, message);
  }

  /**
   * Envia lembrete personalizado
   * @param {string} to - Número do destinatário
   * @param {string} userName - Nome do usuário
   * @param {string} reminderType - Tipo do lembrete
   * @returns {Promise<Object>}
   */
  async sendReminder(to, userName, reminderType = 'general') {
    const reminders = {
      morning: `☀️ *Bom dia, ${userName}!*

Como você está se sentindo hoje?

🌅 *Dica matinal:*
• Respire fundo 3 vezes
• Pense em algo pelo qual é grato
• Escreva sobre suas expectativas para o dia

💬 Conte-me como você está!`,

      afternoon: `🌤️ *Boa tarde, ${userName}!*

Como está sendo seu dia até agora?

🕐 *Pausa para reflexão:*
• Como está seu nível de energia?
• O que de bom aconteceu hoje?
• Como pode tornar a tarde ainda melhor?

📝 Escreva seus pensamentos!`,

      evening: `🌙 *Boa noite, ${userName}!*

Hora de refletir sobre o dia que passou.

✨ *Reflexão noturna:*
• O que você aprendeu hoje?
• Quais foram os momentos especiais?
• Pelo que você é grato?

💭 Compartilhe seus pensamentos antes de dormir!`,

      general: `💙 *Olá, ${userName}!*

Este é seu lembrete para cuidar da sua saúde mental.

🧘‍♀️ *Momento de autocuidado:*
• Como você está se sentindo?
• O que está em sua mente?
• Precisa conversar sobre algo?

📝 Estou aqui para ouvir!`
    };

    const message = reminders[reminderType] || reminders.general;
    return await this.sendMessage(to, message);
  }

  /**
   * Envia confirmação de entrada no diário salva
   * @param {string} to - Número do destinatário
   * @param {string} entryPreview - Prévia da entrada
   * @param {Object} sentiment - Resultado da análise de sentimento
   * @returns {Promise<Object>}
   */
  async sendDiaryConfirmation(to, entryPreview, sentiment = null) {
    let message = `✅ *Entrada salva no seu diário!*

📝 *Prévia:* "${entryPreview.substring(0, 100)}${entryPreview.length > 100 ? '...' : ''}"

🕐 *Salvo em:* ${new Date().toLocaleString('pt-BR')}`;

    if (sentiment) {
      const emoji = this.getSentimentEmoji(sentiment.sentiment);
      const confidencePercent = (sentiment.confidence * 100).toFixed(0);

      message += `\n\n${emoji} *Sentimento detectado:* ${sentiment.sentiment.toUpperCase()} (${confidencePercent}%)\n💭 ${sentiment.explanation}`;
    }

    message += '\n\nObrigado por compartilhar! 🌟';

    return await this.sendMessage(to, message);
  }

  /**
   * Inicia uma conversa com IA
   * @param {string} to - Número do destinatário
   * @param {string} userName - Nome do usuário
   * @returns {Promise<Object>}
   */
  async startAIConversation(to, userName) {
    const message = `💙 *Olá, ${userName}!*

Estou aqui para conversar com você. Pode me contar o que está sentindo, pensando ou qualquer coisa que queira compartilhar.

🤗 *Lembre-se:*
• Este é um espaço seguro
• Não há julgamentos
• Você pode falar sobre qualquer coisa

💬 O que está em sua mente agora?`;

    return await this.sendMessage(to, message);
  }

  /**
   * Envia resposta de IA para conversa
   * @param {string} to - Número do destinatário
   * @param {string} aiResponse - Resposta gerada pela IA
   * @returns {Promise<Object>}
   */
  async sendAIResponse(to, aiResponse) {
    return await this.sendMessage(to, aiResponse);
  }

  /**
   * Envia mensagem de ajuda
   * @param {string} to - Número do destinatário
   * @param {string} userName - Nome do usuário
   * @returns {Promise<Object>}
   */
  async sendHelpMessage(to, userName) {
    const message = `🆘 *Ajuda - EssentIA*

Olá ${userName}! 👋

📝 *Comandos disponíveis:*

• *Diário:* Envie qualquer mensagem de texto para criar uma entrada no diário

• *"Quero conversar"* - Inicia uma conversa com IA para suporte emocional

• *"Ajuda"* - Mostra esta mensagem

• *"Status"* - Informações da sua conta

✨ *Dicas:*
• Escreva livremente sobre seus sentimentos
• Use o comando "Quero conversar" quando precisar de apoio
• Todas as mensagens são privadas e seguras

💙 Estamos aqui para você!`;

    return await this.sendMessage(to, message);
  }

  /**
   * Envia mensagem de status da conta
   * @param {string} to - Número do destinatário
   * @param {string} userName - Nome do usuário
   * @param {Object} stats - Estatísticas do usuário
   * @returns {Promise<Object>}
   */
  async sendStatusMessage(to, userName, stats = {}) {
    const message = `📊 *Status da sua conta - EssentIA*

👤 *Usuário:* ${userName}
📞 *Telefone:* ${to}

📝 *Estatísticas do Diário:*
• Total de entradas: ${stats.totalEntries || 0}
• Última entrada: ${stats.lastEntryDate || 'Nenhuma ainda'}
• Dias de sequência: ${stats.streak || 0}

💙 Continue compartilhando seus sentimentos!`;

    return await this.sendMessage(to, message);
  }

  /**
   * Retorna emoji baseado no sentimento
   * @param {string} sentiment - Sentimento (positive, neutral, negative)
   * @returns {string} - Emoji correspondente
   */
  getSentimentEmoji(sentiment) {
    const emojiMap = {
      'positive': '😊',
      'neutral': '😐',
      'negative': '😔'
    };
    return emojiMap[sentiment] || '💭';
  }

  /**
   * Verifica se o serviço está configurado corretamente
   * @returns {boolean}
   */
  isConfigured() {
    return !!this.instanceId && !!this.token && !!this.clientToken;
  }

  /**
   * Testa a conexão com a Z-API
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      if (!this.instanceId || !this.token) {
        console.log('❌ Z-API não configurada - Instance ID ou Token ausente');
        return false;
      }

      // Teste de conexão - verificar status da instância
      const url = `${this.baseUrl}/instances/${this.instanceId}/token/${this.token}/status`;

      const response = await axios.get(url);

      console.log('✅ Conexão Z-API OK');
      console.log(`   Status: ${response.data.connected ? 'Conectado' : 'Desconectado'}`);
      console.log(`   Instância: ${this.instanceId}`);

      return response.data.connected;
    } catch (error) {
      console.error('❌ Erro ao conectar com Z-API:', {
        error: error.response?.data || error.message,
        status: error.response?.status
      });
      return false;
    }
  }
}

module.exports = BRDIDService;
