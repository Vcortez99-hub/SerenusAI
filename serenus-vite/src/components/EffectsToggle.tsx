import React from 'react'
import { motion } from 'framer-motion'
import { useEffects } from '../contexts/EffectsContext'

const EffectsToggle: React.FC = () => {
  const { leavesEffect, toggleLeavesEffect } = useEffects()

  return (
    <motion.button
      onClick={toggleLeavesEffect}
      className={`
        fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all duration-300
        ${leavesEffect 
          ? 'bg-green-500 text-white hover:bg-green-600' 
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
        }
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={leavesEffect ? 'Desativar efeito de folhas' : 'Ativar efeito de folhas'}
    >
      <motion.div
        animate={{ rotate: leavesEffect ? 360 : 0 }}
        transition={{ duration: 0.5 }}
        className="text-xl"
      >
        {leavesEffect ? '🍃' : '🌿'}
      </motion.div>
    </motion.button>
  )
}

export default EffectsToggle