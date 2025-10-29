import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ArrowLeft, Check, Play, Pause, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityData {
  title: string
  duration: string
  icon: string
  color: string
  description: string
  intro: string
  steps: Array<{
    title: string
    instruction: string
    duration?: string
    tip?: string
  }>
  benefits: string[]
}

interface ActivityGuideProps {
  activity: ActivityData
  onClose: () => void
  onComplete: () => void
}

export default function ActivityGuide({ activity, onClose, onComplete }: ActivityGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isStarted, setIsStarted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timer, setTimer] = useState(0)

  const totalSteps = activity.steps.length
  const isIntro = currentStep === -1
  const isComplete = currentStep === totalSteps

  const handleStart = () => {
    setIsStarted(true)
    setCurrentStep(0)
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
      setIsPlaying(false)
    } else {
      setCurrentStep(totalSteps)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setIsPlaying(false)
    }
  }

  const handleRestart = () => {
    setCurrentStep(0)
    setIsPlaying(false)
    setTimer(0)
  }

  const handleFinish = () => {
    onComplete()
    onClose()
  }

  const getColorClasses = () => {
    const colors: Record<string, { bg: string, text: string, border: string, hover: string }> = {
      blue: {
        bg: 'bg-blue-500',
        text: 'text-blue-600',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-600'
      },
      green: {
        bg: 'bg-green-500',
        text: 'text-green-600',
        border: 'border-green-200',
        hover: 'hover:bg-green-600'
      },
      purple: {
        bg: 'bg-purple-500',
        text: 'text-purple-600',
        border: 'border-purple-200',
        hover: 'hover:bg-purple-600'
      },
      orange: {
        bg: 'bg-orange-500',
        text: 'text-orange-600',
        border: 'border-orange-200',
        hover: 'hover:bg-orange-600'
      }
    }
    return colors[activity.color] || colors.blue
  }

  const colors = getColorClasses()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colors.bg)}>
                <span className="text-white text-2xl">{activity.icon}</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{activity.title}</h2>
                <p className="text-sm text-gray-600">{activity.duration}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Progress Bar */}
          {isStarted && !isComplete && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-600">
                  Passo {currentStep + 1} de {totalSteps}
                </span>
                <span className="text-xs font-medium text-gray-700">
                  {Math.round(((currentStep + 1) / totalSteps) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={cn("h-full", colors.bg)}
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {!isStarted ? (
              // Tela de Introdução
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Sobre esta prática</h3>
                  <p className="text-gray-700 leading-relaxed">{activity.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">O que você vai precisar</h3>
                  <p className="text-gray-700 leading-relaxed">{activity.intro}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefícios</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {activity.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={cn("p-4 rounded-lg border-2", `bg-${activity.color}-50`, colors.border)}>
                  <p className="text-sm text-gray-700">
                    <strong>💡 Dica:</strong> Encontre um lugar tranquilo onde você não será interrompido durante a prática.
                  </p>
                </div>
              </motion.div>
            ) : isComplete ? (
              // Tela de Conclusão
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-8 space-y-6"
              >
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-10 h-10 text-white" />
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    Parabéns! 🎉
                  </h3>
                  <p className="text-gray-600">
                    Você completou a prática de {activity.title}
                  </p>
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Como você se sente?</strong><br />
                    Reserve um momento para perceber as sensações no seu corpo e mente agora.
                  </p>
                </div>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleRestart}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Praticar novamente</span>
                  </button>
                  <button
                    onClick={handleFinish}
                    className={cn("px-6 py-3 text-white rounded-lg transition-colors flex items-center space-x-2", colors.bg, colors.hover)}
                  >
                    <Check className="w-4 h-4" />
                    <span>Concluir</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              // Passo a passo
              <motion.div
                key={`step-${currentStep}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className={cn("inline-flex items-center justify-center w-16 h-16 rounded-full mb-4", colors.bg)}>
                    <span className="text-2xl font-bold text-white">{currentStep + 1}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {activity.steps[currentStep].title}
                  </h3>
                  {activity.steps[currentStep].duration && (
                    <p className="text-sm text-gray-600">⏱️ {activity.steps[currentStep].duration}</p>
                  )}
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <p className="text-gray-800 text-lg leading-relaxed text-center">
                    {activity.steps[currentStep].instruction}
                  </p>
                </div>

                {activity.steps[currentStep].tip && (
                  <div className={cn("p-4 rounded-lg border-2", `bg-${activity.color}-50`, colors.border)}>
                    <p className="text-sm text-gray-700">
                      <strong>💡 Dica:</strong> {activity.steps[currentStep].tip}
                    </p>
                  </div>
                )}

                {/* Ilustração visual (pode adicionar animações aqui) */}
                <div className="flex justify-center">
                  <div className="text-6xl">
                    {activity.icon}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer com botões de navegação */}
        <div className="p-6 border-t border-gray-200">
          {!isStarted ? (
            <button
              onClick={handleStart}
              className={cn("w-full py-3 text-white rounded-lg transition-colors flex items-center justify-center space-x-2", colors.bg, colors.hover)}
            >
              <Play className="w-5 h-5" />
              <span className="font-medium">Começar prática</span>
            </button>
          ) : !isComplete ? (
            <div className="flex gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Anterior</span>
              </button>
              <button
                onClick={handleNext}
                className={cn("flex-1 py-3 text-white rounded-lg transition-colors flex items-center justify-center space-x-2", colors.bg, colors.hover)}
              >
                <span className="font-medium">
                  {currentStep === totalSteps - 1 ? 'Finalizar' : 'Próximo passo'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  )
}
