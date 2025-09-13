import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Brain, 
  Mic, 
  Paperclip, 
  MoreHorizontal,
  ArrowLeft,
  Volume2,
  Star,
  Sparkles,
  Loader2,
  Heart,
  Zap
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { OpenAIService } from '@/services/openai'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
  type?: 'text' | 'suggestion' | 'exercise'
}

const initialMessages: Message[] = [
  {
    id: '1',
    content: 'Olá! Eu sou a EssentIA, sua assistente de bem-estar emocional especializada. 🌸 Como você está se sentindo hoje? Estou aqui para te escutar e oferecer suporte.',
    sender: 'ai',
    timestamp: new Date(),
    type: 'text'
  }
]

const quickSuggestions = [
  { text: 'Estou me sentindo ansioso', icon: '😰', color: 'from-yellow-400 to-orange-500' },
  { text: 'Preciso de ajuda para relaxar', icon: '🧘‍♀️', color: 'from-blue-400 to-blue-600' },
  { text: 'Quero fazer um exercício de respiração', icon: '🌸', color: 'from-green-400 to-green-600' },
  { text: 'Como posso melhorar meu humor?', icon: '💜', color: 'from-purple-400 to-purple-600' }
]

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const openAIService = useRef<OpenAIService | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (apiKey) {
      openAIService.current = new OpenAIService(apiKey)
    }
  }, [])

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    if (openAIService.current) {
      try {
        const response = await openAIService.current.generateResponse(userMessage, conversationHistory)
        return response
      } catch (error) {
        console.error('Error generating AI response:', error)
        return 'Desculpe, estou enfrentando algumas dificuldades técnicas no momento. Que tal tentarmos uma técnica de respiração simples enquanto isso? Respire fundo e expire lentamente. 🌸'
      }
    } else {
      // Fallback para quando não há API key configurada
      const responses = {
        ansioso: 'Percebo que você está se sentindo ansioso. Vamos tentar juntos um exercício de respiração? Respire fundo por 4 segundos, segure por 7 e expire por 8. Repita algumas vezes. 🌸',
        triste: 'Sinto muito que você esteja passando por um momento difícil. É normal sentir tristeza às vezes. Gostaria de conversar sobre o que está te incomodando? 💙',
        estressado: 'O estresse pode ser desafiador. Uma técnica que pode ajudar é a atenção plena: foque no momento presente, sinta seus pés no chão. Vamos tentar juntos? 🍃',
        feliz: 'Que maravilhoso saber que você está se sentindo bem! 😊 Momentos de alegria merecem ser celebrados. O que está contribuindo para esse sentimento?',
        default: 'Obrigada por compartilhar isso comigo. Cada sentimento é válido e importante. Como posso te ajudar hoje? 💚'
      }

      const lowerMessage = userMessage.toLowerCase()
      
      if (lowerMessage.includes('ansioso') || lowerMessage.includes('ansiedade')) {
        return responses.ansioso
      } else if (lowerMessage.includes('triste') || lowerMessage.includes('tristeza')) {
        return responses.triste
      } else if (lowerMessage.includes('estresse') || lowerMessage.includes('estressado')) {
        return responses.estressado
      } else if (lowerMessage.includes('feliz') || lowerMessage.includes('alegre') || lowerMessage.includes('bem')) {
        return responses.feliz
      } else {
        return responses.default
      }
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Generate AI response
    try {
      const aiContent = await generateAIResponse(content)
      
      // Update conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: content },
        { role: 'assistant', content: aiContent }
      ])
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: aiContent,
        sender: 'ai',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    } catch (error) {
      console.error('Error in handleSendMessage:', error)
      setIsTyping(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(inputValue)
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900">EssentIA AI</h1>
                  <p className="text-sm text-gray-600">Assistente de bem-estar</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Volume2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-6 pb-6">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={cn(
                    "flex",
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div className={cn(
                    "max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl",
                    message.sender === 'user'
                      ? 'bg-primary-500 text-white rounded-br-md'
                      : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md shadow-sm'
                  )}>
                    {message.sender === 'ai' && (
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                          <Brain className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-600">EssentIA AI</span>
                      </div>
                    )}
                    
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    
                    <div className={cn(
                      "text-xs mt-2 opacity-70",
                      message.sender === 'user' ? 'text-primary-100' : 'text-gray-500'
                    )}>
                      {message.timestamp.toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                      <Brain className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-600">EssentIA AI</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
                    <span className="text-sm text-gray-600">Pensando com carinho...</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <p className="text-sm text-gray-600 mb-4 text-center flex items-center justify-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Sugestões para começar</span>
                <Sparkles className="w-4 h-4" />
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickSuggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="group p-4 bg-white border border-gray-200 rounded-xl text-left hover:shadow-md transition-all duration-200 hover:border-gray-300"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${suggestion.color} rounded-full flex items-center justify-center text-white shadow-sm`}>
                        <span className="text-lg">{suggestion.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                          {suggestion.text}
                        </p>
                      </div>
                      <Heart className="w-4 h-4 text-gray-300 group-hover:text-red-400 transition-colors" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Input Area */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            {!isTyping && inputValue && (
              <div className="px-4 pt-3 pb-1 bg-gradient-to-r from-primary-50 to-green-50 border-b">
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <Zap className="w-3 h-3 text-primary-500" />
                  <span>EssentIA está pronta para te ajudar</span>
                  <Heart className="w-3 h-3 text-red-400 animate-pulse" />
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="flex items-end space-x-3 p-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <Paperclip className="w-5 h-5" />
              </motion.button>
              
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isTyping ? "Aguarde a resposta..." : "Como você está se sentindo hoje?"}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none placeholder-gray-400"
                  disabled={isTyping}
                />
              </div>
              
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
              >
                <Mic className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                whileHover={inputValue.trim() && !isTyping ? { scale: 1.05 } : {}}
                whileTap={inputValue.trim() && !isTyping ? { scale: 0.95 } : {}}
                className={cn(
                  "p-3 rounded-xl transition-all duration-200 relative overflow-hidden",
                  inputValue.trim() && !isTyping
                    ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg hover:shadow-primary-200"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                {isTyping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </motion.button>
            </form>
          </div>
        </div>
      </div>

      {/* AI Features Sidebar */}
      <div className="hidden lg:block fixed right-6 top-1/2 transform -translate-y-1/2 space-y-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 w-64"
        >
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-primary-500" />
            Recursos IA
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-gray-700">Análise de sentimento</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-gray-700">Sugestões personalizadas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span className="text-gray-700">Exercícios adaptativos</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
              <span className="text-gray-700">Insights comportamentais</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 text-white w-64"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Star className="w-4 h-4" />
            <span className="font-semibold text-sm">Dica do Dia</span>
          </div>
          <p className="text-sm text-primary-100">
            Pratique a gratidão diariamente. Anote 3 coisas pelas quais você é grato hoje.
          </p>
        </motion.div>
      </div>
    </div>
  )
}