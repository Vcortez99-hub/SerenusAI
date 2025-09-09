import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// Mood scoring system (1-10 scale)
export function getMoodColor(score: number): string {
  if (score >= 8) return 'text-green-600'
  if (score >= 6) return 'text-primary-600'
  if (score >= 4) return 'text-amber-600'
  return 'text-red-500'
}

export function getMoodEmoji(score: number): string {
  if (score >= 9) return '😄'
  if (score >= 8) return '😊'
  if (score >= 7) return '🙂'
  if (score >= 6) return '😐'
  if (score >= 5) return '😕'
  if (score >= 4) return '😔'
  if (score >= 3) return '😢'
  return '😭'
}

export function getMoodLabel(score: number): string {
  if (score >= 9) return 'Excelente'
  if (score >= 8) return 'Muito Bem'
  if (score >= 7) return 'Bem'
  if (score >= 6) return 'Ok'
  if (score >= 5) return 'Um pouco triste'
  if (score >= 4) return 'Triste'
  if (score >= 3) return 'Muito triste'
  return 'Devastado'
}

// Animation variants for Framer Motion
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
}

// Exercise categories
export const exerciseCategories = [
  { id: 'breathing', name: 'Respiração', icon: '🫁', color: 'primary' },
  { id: 'meditation', name: 'Meditação', icon: '🧘‍♀️', color: 'green' },
  { id: 'journaling', name: 'Diário', icon: '📝', color: 'amber' },
  { id: 'movement', name: 'Movimento', icon: '🏃‍♂️', color: 'blue' },
] as const

export type ExerciseCategory = typeof exerciseCategories[number]['id']