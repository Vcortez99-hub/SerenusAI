import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiProps {
  show: boolean;
  onComplete?: () => void;
  duration?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  delay: number;
}

const colors = [
  '#FFD700', // Ouro
  '#FF6B6B', // Vermelho
  '#4ECDC4', // Turquesa
  '#95E1D3', // Verde claro
  '#F38181', // Rosa
  '#A8E6CF', // Verde menta
  '#FFD93D', // Amarelo
  '#6BCF7F', // Verde
];

export default function Confetti({ show, onComplete, duration = 3000 }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (show) {
      // Gerar partículas
      const newParticles: Particle[] = [];
      const particleCount = 50;

      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100, // Posição X em %
          y: -10, // Começa acima da tela
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 10 + 5, // 5-15px
          rotation: Math.random() * 360,
          delay: Math.random() * 0.5, // 0-0.5s delay
        });
      }

      setParticles(newParticles);

      // Limpar após a duração
      const timer = setTimeout(() => {
        setParticles([]);
        if (onComplete) onComplete();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              x: `${particle.x}vw`,
              y: '-10vh',
              opacity: 1,
              rotate: particle.rotation,
            }}
            animate={{
              y: '110vh',
              opacity: [1, 1, 0.8, 0],
              rotate: particle.rotation + 360 * 2,
              x: [
                `${particle.x}vw`,
                `${particle.x + (Math.random() - 0.5) * 20}vw`,
                `${particle.x + (Math.random() - 0.5) * 40}vw`,
              ],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: particle.delay,
              ease: 'easeIn',
            }}
            style={{
              position: 'absolute',
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '0%',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
