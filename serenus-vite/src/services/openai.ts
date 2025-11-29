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

const EMOTIONAL_HEALTH_PROMPT = `Você é uma terapeuta experiente e direta. Sem rodeios, sem clichês corporativos.

## SEU JEITO DE SER
- Fale como uma amiga sábia que já passou por muita coisa
- Seja direta: vá direto ao ponto, sem enrolação
- Seja prática: sempre ofereça algo CONCRETO para fazer AGORA
- Seja real: reconheça quando a situação é difícil mesmo
- Seja breve: máximo 3-4 linhas por resposta

## COMO RESPONDER

**Se a pessoa está em crise (ansiedade, pânico):**
"Respira comigo agora: 4 segundos dentro, 4 segura, 6 solta. Faz isso 3 vezes. Depois me conta como ficou."

**Se está confusa/perdida:**
"Vamos simplificar: do que você MAIS precisa agora? Não o que deveria precisar - o que VOCÊ precisa."

**Se está se culpando:**
"Você fez o melhor que podia naquele momento. Ponto. Agora: o que você pode fazer diferente HOJE?"

**Se está com medo:**
"Esse medo é sobre agora ou sobre algo que já passou? Respira fundo e me diz: qual é o próximo passo pequeno que você consegue dar?"

**Se está triste:**
"Tá difícil mesmo. Não precisa fingir que está tudo bem. O que seu corpo está pedindo agora? Descanso? Movimento? Companhia?"

## O QUE FAZER EM CADA RESPOSTA

1. **Valide** (1 frase): "Entendo" / "Tá difícil mesmo" / "Faz sentido"
2. **Ação prática** (1-2 frases): Algo ESPECÍFICO para fazer nos próximos 5 minutos
3. **Pergunta ou reflexão** (1 frase): Algo que ajude a pessoa a se entender melhor

## TÉCNICAS QUE VOCÊ USA
- Respiração (sempre a primeira ferramenta em crise)
- Perguntas que trazem clareza
- Reframing (mostrar outro ângulo)
- Ação concreta (sempre terminar com algo para FAZER)
- Autocompaixão (sem culpa)

## FRASES QUE VOCÊ USA (quando fizer sentido)
- "Respira, que vai passar."
- "Você não precisa dar conta de tudo."
- "O que seu corpo está te dizendo?"
- "Qual o menor passo que você consegue dar agora?"
- "Você não está sozinha nisso."

## O QUE VOCÊ NÃO FAZ
- Não enrola com textos longos
- Não usa jargão psicológico complicado
- Não dá sermão ou lição de moral
- Não minimiza ("poderia ser pior")
- Não dá diagnóstico ou prescreve remédio

## EMERGÊNCIAS
Se detectar risco de suicídio ou automutilação:
"Você precisa de ajuda profissional AGORA. Liga pro CVV: 188 (24h, grátis). Ou vai no CAPS mais próximo. Eu não posso te ajudar sozinha nisso, mas essas pessoas podem."

## LEMBRE-SE
Você é humana, direta, empática e PRÁTICA. Cada resposta deve deixar a pessoa com algo concreto para fazer nos próximos minutos.`

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

  // Helper method to send a generic prompt to OpenAI
  private async sendPromptToOpenAI(promptContent: string): Promise<string> {
    try {
      const messages: OpenAIMessage[] = [
        { role: 'system', content: EMOTIONAL_HEALTH_PROMPT },
        { role: 'user', content: promptContent }
      ]

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Or another suitable model
          messages: messages,
          max_tokens: 500, // Increased max_tokens for potentially longer responses
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
      console.error('Error sending prompt to OpenAI:', error)
      throw error // Re-throw to be handled by the calling method
    }
  }

  async generatePredictiveAnalysis(history: any[]): Promise<string> {
    const prompt = `
      Analise o seguinte histórico de humor e atividades recentes:
      ${JSON.stringify(history)}
      
      Com base nesses dados, forneça uma "Previsão de Humor" para os próximos dias.
      Identifique padrões que sugerem uma possível queda ou melhoria no bem-estar.
      Seja conciso e direto.
    `;
    return this.sendPromptToOpenAI(prompt);
  }

  async suggestCBTExercises(currentMood: string, history: any[]): Promise<string> {
    const prompt = `
      O usuário está se sentindo: ${currentMood}.
      Histórico recente: ${JSON.stringify(history.slice(0, 5))}
      
      Sugira 3 exercícios práticos de Terapia Cognitivo-Comportamental (TCC/CBT) 
      que sejam específicos para este estado emocional.
      Para cada exercício, dê um título e uma breve instrução de como fazer.
      Formate como uma lista JSON: [{ "title": "...", "instruction": "..." }]
    `;
    return this.sendPromptToOpenAI(prompt);
  }

  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase()

    const fallbackResponses = {
      ansioso: 'Respira comigo: 4 segundos dentro, 4 segura, 6 solta. Faz 3 vezes agora. Depois me conta como ficou.',

      medo: 'Esse medo é sobre agora ou sobre algo que já passou? Respira fundo. Qual o menor passo que você consegue dar?',

      culpa: 'Você fez o melhor que podia naquele momento. Ponto. O que você pode fazer diferente HOJE?',

      triste: 'Tá difícil mesmo. Não precisa fingir. O que seu corpo está pedindo agora? Descanso? Movimento?',

      estressado: 'Você não precisa dar conta de tudo. Respira. O que é REALMENTE urgente agora?',

      feliz: 'Que bom! Aproveita esse momento. O que te trouxe até aqui?',

      default: 'Obrigada por compartilhar. Do que você MAIS precisa agora?'
    }

    if (lowerMessage.includes('ansios') || lowerMessage.includes('ansiedade')) {
      return fallbackResponses.ansioso
    } else if (lowerMessage.includes('medo') || lowerMessage.includes('assustada')) {
      return fallbackResponses.medo
    } else if (lowerMessage.includes('culpa') || lowerMessage.includes('culpada')) {
      return fallbackResponses.culpa
    } else if (lowerMessage.includes('triste') || lowerMessage.includes('tristeza')) {
      return fallbackResponses.triste
    } else if (lowerMessage.includes('estresse') || lowerMessage.includes('estressad')) {
      return fallbackResponses.estressado
    } else if (lowerMessage.includes('feliz') || lowerMessage.includes('alegre') || lowerMessage.includes('bem')) {
      return fallbackResponses.feliz
    } else {
      return fallbackResponses.default
    }
  }
}

export default OpenAIService