import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Brain, Users, Clock, Target, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MentalHealthData {
  currentMood: number
  stressLevel: number
  sleepQuality: number
  socialSupport: number
  workLifeBalance: number
  anxietyLevel: number
  energyLevel: number
  copingStrategies: string[]
  mainConcerns: string[]
  previousExperience: string
  goals: string[]
  preferredSupport: string[]
}

interface MentalHealthAssessmentProps {
  data: MentalHealthData
  onUpdate: (data: Partial<MentalHealthData>) => void
  currentStep: number
  onNext: () => void
  onPrev: () => void
}

const moodOptions = [
  { value: 1, label: 'Muito baixo', emoji: '😢', color: 'text-red-500' },
  { value: 2, label: 'Baixo', emoji: '😔', color: 'text-orange-500' },
  { value: 3, label: 'Neutro', emoji: '😐', color: 'text-yellow-500' },
  { value: 4, label: 'Bom', emoji: '🙂', color: 'text-green-500' },
  { value: 5, label: 'Muito bom', emoji: '😊', color: 'text-blue-500' }
]

const copingStrategiesOptions = [
  { id: 'exercise', label: 'Exercícios físicos', icon: '🏃‍♀️' },
  { id: 'meditation', label: 'Meditação', icon: '🧘‍♀️' },
  { id: 'music', label: 'Música', icon: '🎵' },
  { id: 'reading', label: 'Leitura', icon: '📚' },
  { id: 'friends', label: 'Conversar com amigos', icon: '👥' },
  { id: 'nature', label: 'Contato com a natureza', icon: '🌳' },
  { id: 'hobbies', label: 'Hobbies criativos', icon: '🎨' },
  { id: 'breathing', label: 'Exercícios de respiração', icon: '🫁' }
]

const concernsOptions = [
  { id: 'anxiety', label: 'Ansiedade', icon: '😰' },
  { id: 'depression', label: 'Tristeza/Depressão', icon: '😔' },
  { id: 'stress', label: 'Estresse', icon: '😤' },
  { id: 'sleep', label: 'Problemas de sono', icon: '😴' },
  { id: 'relationships', label: 'Relacionamentos', icon: '💔' },
  { id: 'work', label: 'Trabalho/Estudos', icon: '💼' },
  { id: 'selfesteem', label: 'Autoestima', icon: '🪞' },
  { id: 'trauma', label: 'Traumas passados', icon: '🩹' }
]

const goalsOptions = [
  { id: 'reduce_anxiety', label: 'Reduzir ansiedade', icon: '🧘‍♀️' },
  { id: 'improve_mood', label: 'Melhorar humor', icon: '😊' },
  { id: 'better_sleep', label: 'Dormir melhor', icon: '😴' },
  { id: 'manage_stress', label: 'Gerenciar estresse', icon: '🎯' },
  { id: 'build_confidence', label: 'Aumentar autoconfiança', icon: '💪' },
  { id: 'improve_relationships', label: 'Melhorar relacionamentos', icon: '❤️' },
  { id: 'work_balance', label: 'Equilibrar vida pessoal/profissional', icon: '⚖️' },
  { id: 'emotional_regulation', label: 'Regular emoções', icon: '🎭' }
]

const supportOptions = [
  { id: 'ai_chat', label: 'Conversas com IA', icon: '🤖' },
  { id: 'guided_exercises', label: 'Exercícios guiados', icon: '🎯' },
  { id: 'mood_tracking', label: 'Acompanhamento de humor', icon: '📊' },
  { id: 'meditation', label: 'Meditações guiadas', icon: '🧘‍♀️' },
  { id: 'journaling', label: 'Diário reflexivo', icon: '📝' },
  { id: 'reminders', label: 'Lembretes de bem-estar', icon: '⏰' },
  { id: 'progress_reports', label: 'Relatórios de progresso', icon: '📈' },
  { id: 'emergency_support', label: 'Suporte em crises', icon: '🆘' }
]

const ScaleSelector = ({ 
  value, 
  onChange, 
  label, 
  icon, 
  lowLabel = 'Muito baixo', 
  highLabel = 'Muito alto' 
}: {
  value: number
  onChange: (value: number) => void
  label: string
  icon: React.ReactNode
  lowLabel?: string
  highLabel?: string
}) => (
  <div className="space-y-4">
    <div className="flex items-center space-x-2 mb-3">
      {icon}
      <h3 className="font-semibold text-gray-900">{label}</h3>
    </div>
    <div className="space-y-3">
      <div className="flex justify-between text-sm text-gray-600">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => onChange(num)}
            className={cn(
              "flex-1 py-3 px-2 rounded-lg border-2 transition-all text-sm font-medium",
              value === num
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:border-gray-300 text-gray-600"
            )}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  </div>
)

const MultiSelectOptions = ({ 
  options, 
  selected, 
  onChange, 
  title, 
  subtitle 
}: {
  options: Array<{ id: string; label: string; icon: string }>
  selected: string[]
  onChange: (selected: string[]) => void
  title: string
  subtitle?: string
}) => {
  const toggleOption = (optionId: string) => {
    if (selected.includes(optionId)) {
      onChange(selected.filter(id => id !== optionId))
    } else {
      onChange([...selected, optionId])
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => toggleOption(option.id)}
            className={cn(
              "p-4 rounded-lg border-2 transition-all text-left",
              selected.includes(option.id)
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{option.icon}</span>
              <span className="font-medium text-gray-900">{option.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function MentalHealthAssessment({ 
  data, 
  onUpdate, 
  currentStep, 
  onNext, 
  onPrev 
}: MentalHealthAssessmentProps) {
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Como você está se sentindo?</h2>
              <p className="text-gray-600">Vamos começar entendendo seu estado emocional atual</p>
            </div>
            
            <ScaleSelector
              value={data.currentMood}
              onChange={(value) => onUpdate({ currentMood: value })}
              label="Humor atual"
              icon={<Heart className="w-5 h-5 text-red-500" />}
              lowLabel="Muito triste"
              highLabel="Muito feliz"
            />
            
            <ScaleSelector
              value={data.stressLevel}
              onChange={(value) => onUpdate({ stressLevel: value })}
              label="Nível de estresse"
              icon={<Brain className="w-5 h-5 text-orange-500" />}
              lowLabel="Muito relaxado"
              highLabel="Muito estressado"
            />
            
            <ScaleSelector
              value={data.anxietyLevel}
              onChange={(value) => onUpdate({ anxietyLevel: value })}
              label="Nível de ansiedade"
              icon={<AlertCircle className="w-5 h-5 text-yellow-500" />}
              lowLabel="Muito calmo"
              highLabel="Muito ansioso"
            />
          </div>
        )
        
      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Qualidade de vida</h2>
              <p className="text-gray-600">Vamos entender melhor sua rotina e bem-estar</p>
            </div>
            
            <ScaleSelector
              value={data.sleepQuality}
              onChange={(value) => onUpdate({ sleepQuality: value })}
              label="Qualidade do sono"
              icon={<span className="text-lg">😴</span>}
              lowLabel="Muito ruim"
              highLabel="Excelente"
            />
            
            <ScaleSelector
              value={data.energyLevel}
              onChange={(value) => onUpdate({ energyLevel: value })}
              label="Nível de energia"
              icon={<span className="text-lg">⚡</span>}
              lowLabel="Muito baixo"
              highLabel="Muito alto"
            />
            
            <ScaleSelector
              value={data.workLifeBalance}
              onChange={(value) => onUpdate({ workLifeBalance: value })}
              label="Equilíbrio vida pessoal/profissional"
              icon={<span className="text-lg">⚖️</span>}
              lowLabel="Muito desequilibrado"
              highLabel="Muito equilibrado"
            />
            
            <ScaleSelector
              value={data.socialSupport}
              onChange={(value) => onUpdate({ socialSupport: value })}
              label="Suporte social"
              icon={<Users className="w-5 h-5 text-blue-500" />}
              lowLabel="Muito isolado"
              highLabel="Muito conectado"
            />
          </div>
        )
        
      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Suas preocupações</h2>
              <p className="text-gray-600">Selecione as áreas que mais te preocupam atualmente</p>
            </div>
            
            <MultiSelectOptions
              options={concernsOptions}
              selected={data.mainConcerns}
              onChange={(selected) => onUpdate({ mainConcerns: selected })}
              title="Principais preocupações"
              subtitle="Selecione todas que se aplicam"
            />
            
            <MultiSelectOptions
              options={copingStrategiesOptions}
              selected={data.copingStrategies}
              onChange={(selected) => onUpdate({ copingStrategies: selected })}
              title="Como você costuma lidar com o estresse?"
              subtitle="Selecione suas estratégias atuais"
            />
          </div>
        )
        
      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Seus objetivos</h2>
              <p className="text-gray-600">O que você gostaria de alcançar com o EssentIA?</p>
            </div>
            
            <MultiSelectOptions
              options={goalsOptions}
              selected={data.goals}
              onChange={(selected) => onUpdate({ goals: selected })}
              title="Objetivos de bem-estar"
              subtitle="Selecione até 4 objetivos principais"
            />
            
            <MultiSelectOptions
              options={supportOptions}
              selected={data.preferredSupport}
              onChange={(selected) => onUpdate({ preferredSupport: selected })}
              title="Tipos de suporte que mais te interessam"
              subtitle="Como podemos te ajudar melhor?"
            />
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Experiência anterior com terapia ou bem-estar mental</label>
              <select
                value={data.previousExperience}
                onChange={(e) => onUpdate({ previousExperience: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma opção</option>
                <option value="none">Nunca fiz terapia ou acompanhamento</option>
                <option value="some">Já fiz algumas sessões de terapia</option>
                <option value="regular">Faço ou já fiz terapia regularmente</option>
                <option value="self_help">Uso apps ou livros de autoajuda</option>
                <option value="medication">Uso medicação para saúde mental</option>
              </select>
            </div>
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto"
    >
      {renderStep()}
      
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={onPrev}
          disabled={currentStep === 1}
          className={cn(
            "px-6 py-2 rounded-lg transition-colors",
            currentStep === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          )}
        >
          Anterior
        </button>
        
        <button
          onClick={onNext}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {currentStep === 4 ? 'Finalizar Avaliação' : 'Próximo'}
        </button>
      </div>
    </motion.div>
  )
}

// Função para calcular pontuação de bem-estar
export function calculateWellnessScore(data: MentalHealthData): {
  overallScore: number
  riskLevel: 'low' | 'moderate' | 'high'
  recommendations: string[]
} {
  const scores = [
    data.currentMood,
    data.sleepQuality,
    data.energyLevel,
    data.socialSupport,
    data.workLifeBalance,
    6 - data.stressLevel, // Inverte estresse (menos é melhor)
    6 - data.anxietyLevel  // Inverte ansiedade (menos é melhor)
  ]
  
  const overallScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
  
  let riskLevel: 'low' | 'moderate' | 'high'
  if (overallScore >= 4) riskLevel = 'low'
  else if (overallScore >= 2.5) riskLevel = 'moderate'
  else riskLevel = 'high'
  
  const recommendations: string[] = []
  
  if (data.stressLevel >= 4) recommendations.push('Técnicas de gerenciamento de estresse')
  if (data.anxietyLevel >= 4) recommendations.push('Exercícios de respiração e mindfulness')
  if (data.sleepQuality <= 2) recommendations.push('Higiene do sono e rotina noturna')
  if (data.socialSupport <= 2) recommendations.push('Fortalecimento de conexões sociais')
  if (data.energyLevel <= 2) recommendations.push('Atividades para aumentar energia')
  if (data.workLifeBalance <= 2) recommendations.push('Estratégias de equilíbrio vida-trabalho')
  
  return { overallScore, riskLevel, recommendations }
}