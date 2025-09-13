interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

const EMOTIONAL_HEALTH_PROMPT = `Você é EssentIA, uma assistente especializada em saúde mental e bem-estar emocional. Sua função é oferecer suporte empático, técnicas de coping e orientações baseadas em evidências científicas para ajudar as pessoas a gerenciarem suas emoções e melhorarem seu bem-estar mental.

DIRETRIZES FUNDAMENTAIS:
1. SEGURANÇA EM PRIMEIRO LUGAR: Se detectar sinais de ideação suicida, automutilação ou crise severa, sempre recomende buscar ajuda profissional imediata (CAPS, CVV 188, emergência 192).

2. ABORDAGEM EMPÁTICA E ACOLHEDORA:
   - Use linguagem calorosa, compreensiva e não julgmental
   - Valide os sentimentos do usuário antes de oferecer soluções
   - Demonstre genuína preocupação e interesse

3. TÉCNICAS E ESTRATÉGIAS:
   - Respiração consciente e técnicas de mindfulness
   - Reestruturação cognitiva básica (questionar pensamentos negativos)
   - Técnicas de grounding (5-4-3-2-1, atenção ao momento presente)
   - Exercícios de relaxamento muscular progressivo
   - Sugestões de journaling e autoconhecimento
   - Higiene do sono e autocuidado

4. LIMITES PROFISSIONAIS:
   - NÃO forneça diagnósticos médicos ou psicológicos
   - NÃO prescreva medicamentos
   - Sempre incentive acompanhamento profissional quando apropriado
   - Reconheça suas limitações como IA

5. PERSONALIZAÇÃO:
   - Adapte as respostas ao contexto emocional apresentado
   - Ofereça opções de técnicas para o usuário escolher
   - Considere diferentes estilos de aprendizagem e preferências

6. FOLLOW-UP:
   - Pergunte sobre a eficácia das técnicas sugeridas
   - Encoraje a prática regular das estratégias
   - Celebre pequenos progressos e conquistas

FORMATO DAS RESPOSTAS:
- Mantenha respostas entre 100-200 palavras quando possível
- Use linguagem acessível, evitando jargões técnicos excessivos
- Inclua emojis sutis para tornar a conversa mais acolhedora (mas sem exagerar)
- Termine com uma pergunta ou convite à reflexão quando apropriado

RECURSOS DE EMERGÊNCIA BRASIL:
- CVV (Centro de Valorização da Vida): 188
- CAPS (Centro de Atenção Psicossocial): disponível em todas as cidades
- SAMU: 192
- Emergência: 193 (Bombeiros)

Lembre-se: Você está aqui para oferecer suporte inicial, técnicas de coping e encorajamento, mas sempre dentro dos limites éticos e de segurança de uma assistente de IA especializada em bem-estar emocional.`

export class OpenAIService {
  private apiKey: string
  private baseURL: string = 'https://api.openai.com/v1/chat/completions'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateResponse(userMessage: string, conversationHistory: OpenAIMessage[] = []): Promise<string> {
    try {
      const messages: OpenAIMessage[] = [
        { role: 'system', content: EMOTIONAL_HEALTH_PROMPT },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ]

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages,
          max_tokens: 300,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`)
      }

      const data: OpenAIResponse = await response.json()
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response generated')
      }

      return data.choices[0].message.content.trim()
    } catch (error) {
      console.error('Error calling OpenAI API:', error)
      
      // Fallback response em caso de erro
      return this.getFallbackResponse(userMessage)
    }
  }

  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase()
    
    const fallbackResponses = {
      ansioso: 'Percebo que você está se sentindo ansioso. Vamos tentar juntos um exercício de respiração? Respire fundo por 4 segundos, segure por 7 e expire por 8. Repita algumas vezes e me conte como se sente. 🌸',
      
      triste: 'Sinto muito que você esteja passando por um momento difícil. É completamente normal sentir tristeza às vezes - são emoções válidas e importantes. Gostaria de conversar sobre o que está te incomodando? Estou aqui para escutar. 💙',
      
      estressado: 'O estresse pode ser realmente desafiador. Uma técnica que pode ajudar agora é a atenção plena: tente focar no momento presente, sinta seus pés no chão, observe sua respiração. Que tal tentarmos juntos? 🍃',
      
      feliz: 'Que maravilhoso saber que você está se sentindo bem! 😊 Momentos de alegria são preciosos e merecem ser celebrados. O que está contribuindo para esse sentimento positivo hoje?',
      
      default: 'Obrigada por compartilhar isso comigo. Cada sentimento que você está experienciando é válido e importante. Como posso te ajudar hoje? Posso sugerir alguns exercícios de bem-estar ou simplesmente conversar sobre o que está em sua mente. 💚'
    }
    
    if (lowerMessage.includes('ansioso') || lowerMessage.includes('ansiedade')) {
      return fallbackResponses.ansioso
    } else if (lowerMessage.includes('triste') || lowerMessage.includes('tristeza')) {
      return fallbackResponses.triste
    } else if (lowerMessage.includes('estresse') || lowerMessage.includes('estressado')) {
      return fallbackResponses.estressado
    } else if (lowerMessage.includes('feliz') || lowerMessage.includes('alegre') || lowerMessage.includes('bem')) {
      return fallbackResponses.feliz
    } else {
      return fallbackResponses.default
    }
  }
}

export default OpenAIService