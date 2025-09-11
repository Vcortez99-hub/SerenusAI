import React, { createContext, useContext, useState, ReactNode } from 'react'

interface EffectsContextType {
  leavesEffect: boolean
  toggleLeavesEffect: () => void
}

const EffectsContext = createContext<EffectsContextType | undefined>(undefined)

export const useEffects = () => {
  const context = useContext(EffectsContext)
  if (context === undefined) {
    throw new Error('useEffects must be used within an EffectsProvider')
  }
  return context
}

interface EffectsProviderProps {
  children: ReactNode
}

export const EffectsProvider: React.FC<EffectsProviderProps> = ({ children }) => {
  const [leavesEffect, setLeavesEffect] = useState(false)

  const toggleLeavesEffect = () => {
    console.log('Toggle clicked! Current state:', leavesEffect)
    setLeavesEffect(prev => {
      const newState = !prev
      console.log('New state will be:', newState)
      return newState
    })
  }

  return (
    <EffectsContext.Provider value={{ leavesEffect, toggleLeavesEffect }}>
      {children}
    </EffectsContext.Provider>
  )
}