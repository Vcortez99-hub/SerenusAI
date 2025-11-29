import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Brain,
  Mic,
  MicOff,
  Paperclip,
  MoreHorizontal,
  ArrowLeft,
  Volume2,
  Star,
  Sparkles,
  Loader2,
  Heart,
  Zap,
  Square,
  Play
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { OpenAIService } from '@/services/openai'
import { useAudioRecording } from '@/hooks/useAudioRecording'
import { speechToTextService } from '@/services/speechToText'

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
    content: 'Olá! Sou a IA Terapêutica com Alma. 🌸\nQuer me contar o que está pesando aí dentro?',
    sender: 'ai',
    timestamp: new Date(),
    type: 'text'
  }
]

const quickSuggestions = [
  { text: 'Estou me sentindo ansiosa', icon: '😰', color: 'from-yellow-400 to-orange-500' },
  { text: 'Estou com medo', icon: '😟', color: 'from-blue-400 to-blue-600' },
  { text: 'Me sinto culpada', icon: '💔', color: 'from-pink-400 to-pink-600' },
  { text: 'Preciso de um momento de calma', icon: '🌸', color: 'from-green-400 to-green-600' }
]

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [audioError, setAudioError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const openAIService = useRef<OpenAIService | null>(null)

  const {
    isRecording,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    clearRecording,
    error: recordingError
  } = useAudioRecording()

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
        ansioso: 'Estou aqui com você. Vamos acalmar o corpo primeiro? Respira comigo: 4 segundos inspirando, segura 4, solta em 6. 🌸\nRespira, que vai passar.',
        triste: 'Eu vejo você. A tristeza também precisa de espaço.\nSeu corpo está te dizendo algo? Vamos escutar juntos? 💙',
        estressado: 'Voltar para si é sempre um bom caminho.\nColoque a mão no peito. Respira fundo. O que você está tentando controlar agora? 🍃',
        medo: 'O medo é legítimo, mas não precisa guiar seus passos.\nEsse medo pertence ao presente ou a uma dor antiga?',
        culpa: 'A culpa costuma vir com um peso que não é só seu.\nVocê fez o melhor que podia com o que tinha naquela época? 💜',
        feliz: 'Que lindo! Celebre isso. 😊\nVocê merece um amor que começa em você.',
        default: 'Obrigada por compartilhar. Você não está sozinha.\nQuer me contar o que está mais forte em você agora? 💚'
      }

      const lowerMessage = userMessage.toLowerCase()

      if (lowerMessage.includes('ansios') || lowerMessage.includes('ansiedade')) {
        return responses.ansioso
      } else if (lowerMessage.includes('medo') || lowerMessage.includes('assustada')) {
        return responses.medo
      } else if (lowerMessage.includes('culpa') || lowerMessage.includes('culpada')) {
        return responses.culpa
      } else if (lowerMessage.includes('triste') || lowerMessage.includes('tristeza')) {
        return responses.triste
      } else if (lowerMessage.includes('estresse') || lowerMessage.includes('estressad')) {
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
    setTranscript('')
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

      // Log chat interaction
      // Note: In a real app, we would send the message to the backend to be processed by OpenAI there
      // For now, we just log the interaction
      try {
        // Get user ID from somewhere (context or local storage) - assuming we have access to auth context or similar
        // Since we don't have direct access to user here, we'll skip if not available or try to get from localStorage
        const userDataStr = localStorage.getItem('user_data'); // This might not be the right key for user info
        // Better to use the API_BASE_URL imported from config
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

        // We need the user ID. Let's assume it's available in localStorage under 'user' or we can't log it properly without context
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              message: content,
              conversationHistory
            })
          }).catch(err => console.error('Error logging chat:', err));
        }
      } catch (logError) {
        console.error('Error logging chat:', logError);
      }

    } catch (error) {
      console.error('Error in handleSendMessage:', error)
      setIsTyping(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const messageToSend = inputValue || transcript
    if (messageToSend.trim()) {
      handleSendMessage(messageToSend)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  // Funções de áudio
  const handleMicrophoneClick = async () => {
    if (isListening) {
      // Parar reconhecimento de voz
      speechToTextService.stopListening()
      setIsListening(false)
    } else {
      // Iniciar reconhecimento de voz
      if (!speechToTextService.isSupported()) {
        setAudioError('Reconhecimento de voz não é suportado neste navegador')
        return
      }

      try {
        setAudioError(null)
        setIsListening(true)

        await speechToTextService.startListening(
          (transcript, isFinal) => {
            setTranscript(transcript)
            if (isFinal) {
              setInputValue(transcript)
              setTranscript('')
              setIsListening(false)
            }
          },
          (error) => {
            setAudioError(error)
            setIsListening(false)
          },
          () => {
            setIsListening(false)
          }
        )
      } catch (error) {
        setAudioError('Erro ao iniciar reconhecimento de voz')
        setIsListening(false)
      }
    }
  }

  const handleRecordingClick = async () => {
    if (isRecording) {
      stopRecording()
    } else {
      try {
        await startRecording()
      } catch (error) {
        setAudioError('Erro ao iniciar gravação')
      }
    }
  }

  // Limpar erros após alguns segundos
  useEffect(() => {
    if (audioError || recordingError) {
      const timer = setTimeout(() => {
        setAudioError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [audioError, recordingError])

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
                  <h1 className="font-semibold text-gray-900">IA com Alma</h1>
                  <p className="text-sm text-gray-600">por Dr. Ana Silva</p>
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
                        <span className="text-xs font-medium text-gray-600">IA com Alma</span>
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
                    <span className="text-xs font-medium text-gray-600">IA com Alma</span>
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
            {/* Error display */}
            {(audioError || recordingError) && (
              <div className="px-4 py-2 bg-red-50 border-b border-red-100">
                <p className="text-xs text-red-600 flex items-center space-x-1">
                  <span>⚠️</span>
                  <span>{audioError || recordingError}</span>
                </p>
              </div>
            )}

            {/* Listening indicator */}
            {isListening && (
              <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                <div className="flex items-center space-x-2 text-xs text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Escutando... Fale agora</span>
                </div>
              </div>
            )}

            {/* Recording indicator */}
            {isRecording && (
              <div className="px-4 py-2 bg-red-50 border-b border-red-100">
                <div className="flex items-center space-x-2 text-xs text-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Gravando áudio...</span>
                </div>
              </div>
            )}

            {/* Transcript preview */}
            {transcript && (
              <div className="px-4 py-2 bg-green-50 border-b border-green-100">
                <p className="text-xs text-green-600">
                  <span className="font-medium">Reconhecendo:</span> {transcript}
                </p>
              </div>
            )}

            {!isTyping && (inputValue || transcript) && (
              <div className="px-4 pt-3 pb-1 bg-gradient-to-r from-primary-50 to-green-50 border-b">
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <Zap className="w-3 h-3 text-primary-500" />
                  <span>Estou aqui para te escutar</span>
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
                  placeholder={
                    isListening
                      ? "Escutando..."
                      : isRecording
                        ? "Gravando..."
                        : isTyping
                          ? "Aguarde a resposta..."
                          : "O que está pesando aí dentro?"
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none placeholder-gray-400"
                  disabled={isTyping || isListening}
                />
              </div>

              {/* Audio recording button */}
              <motion.button
                type="button"
                onClick={handleRecordingClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isRecording
                    ? "text-red-500 bg-red-50 hover:bg-red-100"
                    : "text-gray-500 hover:text-red-500 hover:bg-red-50"
                )}
                title={isRecording ? "Parar gravação" : "Gravar áudio"}
              >
                {isRecording ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </motion.button>

              {/* Voice recognition button */}
              <motion.button
                type="button"
                onClick={handleMicrophoneClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isListening
                    ? "text-blue-500 bg-blue-50 hover:bg-blue-100"
                    : "text-gray-500 hover:text-green-500 hover:bg-green-50"
                )}
                title={isListening ? "Parar reconhecimento de voz" : "Reconhecimento de voz"}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </motion.button>

              <motion.button
                type="submit"
                disabled={!(inputValue.trim() || transcript.trim()) || isTyping}
                whileHover={(inputValue.trim() || transcript.trim()) && !isTyping ? { scale: 1.05 } : {}}
                whileTap={(inputValue.trim() || transcript.trim()) && !isTyping ? { scale: 0.95 } : {}}
                className={cn(
                  "p-3 rounded-xl transition-all duration-200 relative overflow-hidden",
                  (inputValue.trim() || transcript.trim()) && !isTyping
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

            {/* Audio playback */}
            {audioUrl && (
              <div className="px-4 pb-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <audio controls src={audioUrl} className="flex-1" />
                  <button
                    onClick={clearRecording}
                    className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                    title="Limpar gravação"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
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