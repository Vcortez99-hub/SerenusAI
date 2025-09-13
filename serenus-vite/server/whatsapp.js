const axios = require('axios');
const DiaryStorage = require('./diary-storage');
const SentimentAnalysisService = require('./sentiment-analysis');
require('dotenv').config();

class WhatsAppService {
  constructor() {
    this.phoneNumberId = process.env.WA_PHONE_NUMBER_ID;
    this.accessToken = process.env.CLOUD_API_ACCESS_TOKEN;
    this.apiVersion = process.env.CLOUD_API_VERSION || 'v18.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;
    
    // Lista de números autorizados (formato: 5511999999999)
    this.authorizedNumbers = process.env.AUTHORIZED_NUMBERS 
      ? process.env.AUTHORIZED_NUMBERS.split(',').map(num => num.trim())
      : [];
    
    // Números pendentes de autorização
    this.pendingAuthorization = new Set();
    
    // Sistema de armazenamento do diário
    this.diaryStorage = new DiaryStorage();
    
    // Serviço de análise de sentimento
    this.sentimentAnalysis = new SentimentAnalysisService();
  }

  /**
   * Envia uma mensagem de texto via WhatsApp
   * @param {string} to - Número do destinatário (formato: 5511999999999)
   * @param {string} message - Texto da mensagem
   */
  async sendTextMessage(to, message) {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: message
        }
      };

      const response = await axios.post(this.baseUrl, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Mensagem enviada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Envia uma mensagem de confirmação personalizada
   * @param {string} to - Número do destinatário
   * @param {string} entryPreview - Prévia da entrada do diário
   */
  async sendDiaryConfirmation(to, entryPreview) {
    const confirmationMessage = `✅ *Entrada salva no seu diário!*\n\n📝 Prévia: "${entryPreview.substring(0, 100)}${entryPreview.length > 100 ? '...' : ''}"\n\n🕐 Salvo em: ${new Date().toLocaleString('pt-BR')}\n\nObrigado por usar o EssentIA! 🌟`;
    
    return await this.sendTextMessage(to, confirmationMessage);
  }

  /**
   * Envia uma mensagem de confirmação com análise de sentimento
   * @param {string} to - Número do destinatário
   * @param {string} entryPreview - Prévia da entrada do diário
   * @param {Object} sentimentResult - Resultado da análise de sentimento
   */
  async sendDiaryConfirmationWithSentiment(to, entryPreview, sentimentResult) {
    const emoji = this.sentimentAnalysis.getSentimentEmoji(sentimentResult.sentiment);
    const confidencePercent = (sentimentResult.confidence * 100).toFixed(0);
    
    const confirmationMessage = `✅ *Entrada salva no seu diário!*\n\n📝 Prévia: "${entryPreview.substring(0, 80)}${entryPreview.length > 80 ? '...' : ''}"\n\n${emoji} *Sentimento detectado:* ${sentimentResult.sentiment.toUpperCase()} (${confidencePercent}%)\n💭 ${sentimentResult.explanation}\n\n🕐 Salvo em: ${new Date().toLocaleString('pt-BR')}\n\nObrigado por usar o EssentIA! 🌟`;
    
    return await this.sendTextMessage(to, confirmationMessage);
  }

  /**
   * Envia mensagem de boas-vindas para novos usuários
   * @param {string} to - Número do destinatário
   */
  async sendWelcomeMessage(to) {
    const welcomeMessage = `🌟 *Bem-vindo ao EssentIA!*\n\nAgora você pode escrever em seu diário pessoal diretamente pelo WhatsApp!\n\n📝 *Como usar:*\n• Envie qualquer mensagem de texto\n• Ela será automaticamente salva como uma entrada do seu diário\n• Você receberá uma confirmação a cada entrada\n\n✨ Comece agora mesmo escrevendo sobre seu dia!`;
    
    return await this.sendTextMessage(to, welcomeMessage);
  }

  /**
   * Verifica se um número está autorizado
   * @param {string} phoneNumber - Número do telefone
   * @returns {boolean} - True se autorizado
   */
  isAuthorized(phoneNumber) {
    return this.authorizedNumbers.includes(phoneNumber);
  }

  /**
   * Envia mensagem de não autorizado
   * @param {string} to - Número do destinatário
   */
  async sendUnauthorizedMessage(to) {
    const unauthorizedMessage = `🔒 *Acesso Não Autorizado*\n\nDesculpe, este número não está autorizado a usar o EssentIA.\n\n📞 *Seu número:* ${to}\n\nPara solicitar acesso, entre em contato com o administrador do sistema.\n\n⚠️ Esta tentativa foi registrada por segurança.`;
    
    return await this.sendTextMessage(to, unauthorizedMessage);
  }

  /**
   * Envia mensagem de solicitação de autorização
   * @param {string} to - Número do destinatário
   */
  async sendAuthorizationRequest(to) {
    const authMessage = `🔐 *Solicitação de Autorização*\n\nOlá! Vejo que você está tentando usar o EssentIA pela primeira vez.\n\n📞 *Seu número:* ${to}\n\nPara sua segurança, preciso autorizar seu acesso primeiro.\n\n✅ Responda com *"AUTORIZAR"* se você é o proprietário deste diário.\n\n⚠️ Caso contrário, ignore esta mensagem.`;
    
    this.pendingAuthorization.add(to);
    return await this.sendTextMessage(to, authMessage);
  }

  /**
   * Processa mensagens recebidas do webhook
   * @param {Object} message - Objeto da mensagem do WhatsApp
   * @param {Object} metadata - Metadados da mensagem
   */
  async processIncomingMessage(message, metadata) {
    console.log('Processando mensagem recebida:', {
      from: message.from,
      type: message.type,
      timestamp: message.timestamp,
      authorized: this.isAuthorized(message.from)
    });

    // Verificar autorização primeiro
    if (!this.isAuthorized(message.from)) {
      // Se está pendente de autorização e enviou "AUTORIZAR"
      if (this.pendingAuthorization.has(message.from) && 
          message.type === 'text' && 
          message.text?.body.toUpperCase().includes('AUTORIZAR')) {
        
        // Adicionar à lista de autorizados (temporariamente na sessão)
        this.authorizedNumbers.push(message.from);
        this.pendingAuthorization.delete(message.from);
        
        console.log(`✅ Número ${message.from} autorizado com sucesso!`);
        
        // Enviar mensagem de boas-vindas
        await this.sendWelcomeMessage(message.from);
        return { authorized: true, action: 'welcomed' };
      }
      // Se não está pendente, enviar solicitação
      else if (!this.pendingAuthorization.has(message.from)) {
        console.log(`🔒 Tentativa de acesso não autorizado: ${message.from}`);
        await this.sendAuthorizationRequest(message.from);
        return { authorized: false, action: 'authorization_requested' };
      }
      // Se está pendente mas não enviou AUTORIZAR
      else {
        const pendingMessage = `⏳ *Autorização Pendente*\n\nPara continuar, responda com *"AUTORIZAR"* se você é o proprietário deste diário.\n\n📞 Seu número: ${message.from}`;
        await this.sendTextMessage(message.from, pendingMessage);
        return { authorized: false, action: 'pending_reminder' };
      }
    }

    // Verificar se é uma mensagem de texto
    if (message.type === 'text' && message.text?.body) {
      // Realizar análise de sentimento
      console.log('🤖 Analisando sentimento da mensagem...');
      const sentimentResult = await this.sentimentAnalysis.analyzeSentiment(message.text.body);
      
      const diaryEntry = {
        id: message.id,
        content: message.text.body,
        whatsappNumber: message.from,
        timestamp: new Date(message.timestamp * 1000),
        sentiment: sentimentResult.sentiment,
        sentimentConfidence: sentimentResult.confidence,
        sentimentExplanation: sentimentResult.explanation,
        metadata: {
          phoneNumberId: metadata.phone_number_id,
          displayPhoneNumber: metadata.display_phone_number
        }
      };

      // Salvar no sistema de persistência
      const savedEntry = await this.diaryStorage.saveEntry(diaryEntry);
      console.log('Nova entrada de diário salva:', savedEntry);
      
      // Enviar confirmação com análise de sentimento
      await this.sendDiaryConfirmationWithSentiment(message.from, message.text.body, sentimentResult);
      
      return savedEntry;
    } else if (message.type === 'text' && message.text?.body.toLowerCase().includes('ajuda')) {
      // Resposta para mensagens de ajuda
      const helpMessage = `🆘 *Ajuda - EssentIA Diário*\n\n📝 *Como usar:*\n• Envie qualquer texto para criar uma entrada no diário\n• Use "ajuda" para ver esta mensagem\n• Use "status" para ver informações da conta\n\n✨ *Dicas:*\n• Escreva sobre seus sentimentos, pensamentos ou eventos do dia\n• Não há limite de tamanho para suas entradas\n• Todas as mensagens são privadas e seguras`;
      
      await this.sendTextMessage(message.from, helpMessage);
    } else {
      // Mensagem para tipos não suportados
      const unsupportedMessage = `⚠️ Desculpe, atualmente só processamos mensagens de texto.\n\nPor favor, envie sua entrada do diário como texto simples.`;
      
      await this.sendTextMessage(message.from, unsupportedMessage);
    }
  }

  /**
   * Valida se as configurações necessárias estão presentes
   */
  validateConfiguration() {
    const requiredEnvVars = [
      'WA_PHONE_NUMBER_ID',
      'CLOUD_API_ACCESS_TOKEN',
      'WEBHOOK_VERIFICATION_TOKEN'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Variáveis de ambiente obrigatórias não configuradas: ${missingVars.join(', ')}`);
    }

    console.log('✅ Configuração do WhatsApp validada com sucesso!');
    return true;
  }
}

module.exports = WhatsAppService;