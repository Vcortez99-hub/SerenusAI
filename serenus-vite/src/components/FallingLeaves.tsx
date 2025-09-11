import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Leaf {
  id: number
  x: number
  delay: number
  duration: number
  emoji: string
  size: number
}

interface FallingLeavesProps {
  isActive: boolean
}

const FallingLeaves: React.FC<FallingLeavesProps> = ({ isActive }) => {
  const [leaves, setLeaves] = useState<Leaf[]>([])

  const leafEmojis = ['🍃', '🍂', '🌿', '🍀', '🌱']

  useEffect(() => {
    if (!isActive) {
      setLeaves([])
      return
    }

    const createLeaf = (id: number): Leaf => ({
      id,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 4,
      emoji: leafEmojis[Math.floor(Math.random() * leafEmojis.length)],
      size: 0.8 + Math.random() * 0.4
    })

    // Criar folhas iniciais
    const initialLeaves = Array.from({ length: 15 }, (_, i) => createLeaf(i))
    setLeaves(initialLeaves)

    // Adicionar novas folhas periodicamente
    const interval = setInterval(() => {
      setLeaves(prev => {
        const newLeaf = createLeaf(Date.now())
        const updatedLeaves = [...prev, newLeaf]
        // Manter apenas as últimas 20 folhas para performance
        return updatedLeaves.slice(-20)
      })
    }, 600)

    return () => clearInterval(interval)
  }, [isActive])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      <AnimatePresence>
        {leaves.map((leaf) => (
          <motion.div
            key={leaf.id}
            initial={{
              x: `${leaf.x}vw`,
              y: '-10vh',
              rotate: 0,
              opacity: 0
            }}
            animate={{
              x: [`${leaf.x}vw`, `${leaf.x + (Math.random() - 0.5) * 20}vw`],
              y: '110vh',
              rotate: [0, 360, 720],
              opacity: [0, 0.7, 0.5, 0]
            }}
            exit={{
              opacity: 0
            }}
            transition={{
              duration: leaf.duration,
              delay: leaf.delay,
              ease: 'linear',
              x: {
                duration: leaf.duration,
                ease: 'easeInOut'
              },
              rotate: {
                duration: leaf.duration,
                ease: 'linear'
              }
            }}
            className="absolute text-green-600"
            style={{
              fontSize: `${leaf.size}rem`,
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
            }}
            onAnimationComplete={() => {
              setLeaves(prev => prev.filter(l => l.id !== leaf.id))
            }}
          >
            {leaf.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default FallingLeaves