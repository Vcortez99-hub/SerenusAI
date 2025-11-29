import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector do elemento alvo
  position: 'top' | 'bottom' | 'left' | 'right';
  icon?: React.ReactNode;
  action?: () => void;
}

interface OnboardingGuideProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  userId?: string;
  storageKey?: string;
}

export default function OnboardingGuide({ steps, onComplete, userId, storageKey = 'onboarding-completed' }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    // Verificar se onboarding já foi completado via API
    const checkOnboardingStatus = async () => {
      if (!userId) {
        setIsActive(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/user/onboarding-status?userId=${userId}`);
        const data = await response.json();

        if (!data.completed) {
          setIsActive(true);
        }
      } catch (error) {
        console.error('Erro ao verificar onboarding:', error);
        // Em caso de erro na API, não mostra onboarding
        setIsActive(false);
      }
    };

    checkOnboardingStatus();
  }, [storageKey, userId]);

  // Atualizar posição do elemento alvo quando o step muda
  useEffect(() => {
    if (!isActive || !steps[currentStep]) return;

    const updatePosition = () => {
      const element = document.querySelector(steps[currentStep].target);
      if (element) {
        // Scroll suave até o elemento
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

        // Aguardar scroll completar antes de pegar posição
        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          setTargetPosition({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height
          });
        }, 300);
      } else {
        // Se elemento não existe, pular para o próximo passo automaticamente
        console.warn(`Onboarding: Elemento não encontrado: ${steps[currentStep].target}`);
        setTimeout(() => {
          if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
          } else {
            handleComplete();
          }
        }, 100);
      }
    };

    // Aguardar um pouco para garantir que o DOM foi renderizado
    const timeout = setTimeout(updatePosition, 100);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [currentStep, isActive, steps]);

  const handleComplete = async () => {
    setIsActive(false);

    if (userId) {
      try {
        await fetch(`${API_BASE_URL}/user/complete-onboarding`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
      } catch (error) {
        console.error('Erro ao marcar onboarding:', error);
      }
    }

    onComplete();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      steps[currentStep].action?.();
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const getTooltipPosition = () => {
    const offset = 20;
    const tooltipWidth = 360;
    const tooltipHeight = 280; // Aumentado para caber todo o conteúdo
    const padding = 16; // Margem da borda da tela

    let position = { top: 0, left: 0 };

    switch (steps[currentStep].position) {
      case 'top':
        position = {
          top: targetPosition.top - tooltipHeight - offset,
          left: targetPosition.left + targetPosition.width / 2 - tooltipWidth / 2
        };
        break;
      case 'bottom':
        position = {
          top: targetPosition.top + targetPosition.height + offset,
          left: targetPosition.left + targetPosition.width / 2 - tooltipWidth / 2
        };
        break;
      case 'left':
        position = {
          top: targetPosition.top + targetPosition.height / 2 - tooltipHeight / 2,
          left: targetPosition.left - tooltipWidth - offset
        };
        break;
      case 'right':
        position = {
          top: targetPosition.top + targetPosition.height / 2 - tooltipHeight / 2,
          left: targetPosition.left + targetPosition.width + offset
        };
        break;
      default:
        position = { top: targetPosition.top, left: targetPosition.left };
    }

    // Ajustar para não sair da viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Ajustar horizontalmente
    if (position.left < padding) {
      position.left = padding;
    } else if (position.left + tooltipWidth > viewportWidth - padding) {
      position.left = viewportWidth - tooltipWidth - padding;
    }

    // Ajustar verticalmente
    if (position.top < padding) {
      position.top = padding;
    } else if (position.top + tooltipHeight > viewportHeight - padding) {
      position.top = viewportHeight - tooltipHeight - padding;
    }

    return position;
  };

  if (!isActive || steps.length === 0) return null;

  const currentStepData = steps[currentStep];

  // Não renderizar se a posição do alvo é inválida
  if (targetPosition.width === 0 && targetPosition.height === 0) {
    return null;
  }

  const tooltipPos = getTooltipPosition();

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Overlay escuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[9998]"
            onClick={handleSkip}
          />

          {/* Destaque no elemento alvo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed z-[9999] pointer-events-none"
            style={{
              top: targetPosition.top,
              left: targetPosition.left,
              width: targetPosition.width,
              height: targetPosition.height,
              boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5)'
            }}
          />

          {/* Tooltip card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed z-[10000] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full"
            style={{
              top: tooltipPos.top,
              left: tooltipPos.left,
              maxWidth: '360px',
              minHeight: 'auto'
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Passo {currentStep + 1} de {steps.length}
                </span>
              </div>
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {currentStepData.description}
              </p>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex gap-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      index <= currentStep
                        ? 'bg-indigo-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                >
                  Pular
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      Concluir
                      <Check className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Próximo
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
