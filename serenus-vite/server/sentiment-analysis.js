const axios = require('axios');
require('dotenv').config();

class SentimentAnalysisService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
    
    if (!this.apiKey) {
      console.warn('⚠️ OPENAI_API_KEY não configurada. Análise de sentimento desabilitada.');
    }
  }

  /**
   * Analisa o sentimento de um texto usando OpenAI GPT
   * @param {string} text - Texto para análise
   * @returns {Promise<{sentiment: string, confidence: number, explanation: string}>}
   */
  async analyzeSentiment(text) {
    if (!this.apiKey) {
      return {
        sentiment: 'neutro',
        confidence: 0,
        explanation: 'API da OpenAI não configurada'
      };
    }

    try {
      const prompt = `Analise o sentimento da seguinte mensagem de diário em português brasileiro e classifique como "triste", "neutro" ou "feliz".

Regras importantes:
- "neutro" deve ser usado para situações cotidianas, rotineiras ou sem carga emocional forte
- "triste" apenas para situações claramente negativas, depressivas ou melancólicas
- "feliz" apenas para situações claramente positivas, alegres ou entusiasmadas
- Seja conservador: na dúvida, prefira "neutro"

Mensagem: "${text}"

Responda APENAS no formato JSON:
{
  "sentiment": "triste|neutro|feliz",
  "confidence": 0.0-1.0,
  "explanation": "breve explicação da classificação"
}`;

      const response = await axios.post(this.baseUrl, {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em análise de sentimentos para textos em português brasileiro. Seja preciso e conservador nas classificações.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.1
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const result = response.data.choices[0].message.content.trim();
      
      try {
        const parsed = JSON.parse(result);
        
        // Validar resposta
        if (!['triste', 'neutro', 'feliz'].includes(parsed.sentiment)) {
          throw new Error('Sentimento inválido');
        }
        
        console.log(`📊 Análise de sentimento: ${parsed.sentiment} (${(parsed.confidence * 100).toFixed(1)}%)`);
        console.log(`💭 Explicação: ${parsed.explanation}`);
        
        return parsed;
      } catch (parseError) {
        console.error('Erro ao parsear resposta da OpenAI:', parseError);
        return {
          sentiment: 'neutro',
          confidence: 0.5,
          explanation: 'Erro na análise automática'
        };
      }
    } catch (error) {
      console.error('Erro na análise de sentimento:', error.response?.data || error.message);
      return {
        sentiment: 'neutro',
        confidence: 0,
        explanation: 'Erro na comunicação com a API'
      };
    }
  }

  /**
   * Obtém emoji baseado no sentimento
   * @param {string} sentiment - triste, neutro ou feliz
   * @returns {string} Emoji correspondente
   */
  getSentimentEmoji(sentiment) {
    const emojis = {
      'triste': '😢',
      'neutro': '😐',
      'feliz': '😊'
    };
    return emojis[sentiment] || '😐';
  }

  /**
   * Valida se a configuração da OpenAI está presente
   * @returns {boolean}
   */
  isConfigured() {
    return !!this.apiKey;
  }
}

module.exports = SentimentAnalysisService;