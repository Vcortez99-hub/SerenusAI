/**
 * Animação de Level Up
 * Exibe quando o usuário sobe de nível
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect } from 'react';

interface LevelUpAnimationProps {
  show: boolean;
  level: number;
  levelName: string;
  levelColor: string;
  onClose: () => void;
}

export default function LevelUpAnimation({
  show,
  level,
  levelName,
  levelColor,
  onClose,
}: LevelUpAnimationProps) {
  useEffect(() => {
    if (show) {
      // Tocar som (se disponível)
      playLevelUpSound();

      // Fechar automaticamente após 5 segundos
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const playLevelUpSound = () => {
    try {
      // Criar um AudioContext para tocar um som sintético
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Sequência de notas para "level up"
      const notes = [
        { freq: 523.25, time: 0 }, // C5
        { freq: 659.25, time: 0.1 }, // E5
        { freq: 783.99, time: 0.2 }, // G5
      ];

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(notes[0].freq, audioContext.currentTime);

      notes.forEach((note, index) => {
        oscillator.frequency.setValueAtTime(
          note.freq,
          audioContext.currentTime + note.time
        );
      });

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Erro ao reproduzir som:', error);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Fundo escuro */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Card central */}
          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 pointer-events-auto"
            initial={{ scale: 0.5, rotateY: -180 }}
            animate={{ scale: 1, rotateY: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
            }}
          >
            {/* Confete de fundo */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3'][i % 4],
                    left: `${Math.random() * 100}%`,
                    top: '-10%',
                  }}
                  animate={{
                    y: ['0vh', '110vh'],
                    x: [0, (Math.random() - 0.5) * 100],
                    rotate: [0, 360],
                    opacity: [1, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    ease: 'linear',
                  }}
                />
              ))}
            </div>

            {/* Conteúdo */}
            <div className="relative z-10 text-center">
              {/* Ícone animado */}
              <motion.div
                className="mb-4 flex justify-center"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div
                  className="p-6 rounded-full"
                  style={{
                    backgroundColor: levelColor + '20',
                  }}
                >
                  <TrendingUp className="w-16 h-16" style={{ color: levelColor }} />
                </div>
              </motion.div>

              {/* Texto "Level Up!" */}
              <motion.h1
                className="text-4xl font-black mb-2"
                style={{
                  background: `linear-gradient(135deg, ${levelColor}, ${levelColor}dd)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Nível Aumentado!
              </motion.h1>

              {/* Estrelas decorativas */}
              <div className="flex justify-center gap-2 mb-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <Star
                      className="w-6 h-6"
                      style={{ color: levelColor }}
                      fill={levelColor}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Novo nível */}
              <motion.div
                className="mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring' }}
              >
                <div className="text-6xl font-black mb-2" style={{ color: levelColor }}>
                  Nível {level}
                </div>
                <div
                  className="text-2xl font-bold px-6 py-2 rounded-full inline-block"
                  style={{
                    backgroundColor: levelColor + '20',
                    color: levelColor,
                  }}
                >
                  {levelName}
                </div>
              </motion.div>

              {/* Mensagem */}
              <motion.p
                className="text-gray-600 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                Continue assim! Você está no caminho certo para o bem-estar! 🎉
              </motion.p>

              {/* Botão fechar */}
              <motion.button
                onClick={onClose}
                className="px-8 py-3 rounded-full font-bold text-white shadow-lg hover:shadow-xl transition-all"
                style={{
                  background: `linear-gradient(135deg, ${levelColor}, ${levelColor}dd)`,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                Continuar
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
