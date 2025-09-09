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
  Sparkles
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

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
    content: 'Olá! Eu sou a Serenus, sua assistente de bem-estar emocional. Como você está se sentindo hoje?',
    sender: 'ai',
    timestamp: new Date(),
    type: 'text'
  }
]

const quickSuggestions = [
  'Estou me sentindo ansioso',
  'Preciso de ajuda para relaxar',
  'Quero fazer um exercício de respiração',
  'Como posso melhorar meu humor?'
]

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateAIResponse = (userMessage: string): string => {
    const responses = {
      ansioso: 'Entendo que você está se sentindo ansioso. Vamos tentar um exercício de respiração juntos? Respire fundo por 4 segundos, segure por 7 e expire por 8. Repita algumas vezes.',
      triste: 'Sinto muito que você esteja passando por um momento difícil. Lembre-se de que é normal sentir tristeza às vezes. Que tal conversarmos sobre o que está te incomodando?',
      estressado: 'O estresse pode ser muito desafiador. Uma técnica que pode ajudar é a atenção plena. Tente focar no momento presente e em sua respiração por alguns minutos.',
      feliz: 'Que maravilha saber que você está se sentindo bem! Momentos de alegria são preciosos. O que está contribuindo para esse sentimento positivo hoje?',
      default: 'Obrigada por compartilhar isso comigo. Cada sentimento é válido e importante. Como posso te ajudar hoje? Posso sugerir alguns exercícios ou simplesmente conversar sobre o que está em sua mente.'
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

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(content),
        sender: 'ai',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
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
                  <h1 className="font-semibold text-gray-900">Serenus AI</h1>
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
                        <span className="text-xs font-medium text-gray-600">Serenus AI</span>
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
                    <span className="text-xs font-medium text-gray-600">Serenus AI</span>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
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
              <p className="text-sm text-gray-600 mb-3 text-center">Sugestões rápidas:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-primary-300 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Input Area */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg">
            <form onSubmit={handleSubmit} className="flex items-end space-x-3 p-4">
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  disabled={isTyping}
                />
              </div>
              
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Mic className="w-5 h-5" />
              </button>
              
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className={cn(
                  "p-3 rounded-xl transition-all duration-200",
                  inputValue.trim() && !isTyping
                    ? "bg-primary-500 text-white hover:bg-primary-600 shadow-lg hover:shadow-xl"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                <Send className="w-5 h-5" />
              </button>
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