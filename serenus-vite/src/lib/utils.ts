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
  // Escala 1-5 usada no Dashboard
  if (score === 5) return '😄'  // Muito feliz
  if (score === 4) return '😊'  // Feliz
  if (score === 3) return '😐'  // Neutro
  if (score === 2) return '😔'  // Triste
  if (score === 1) return '😢'  // Muito triste
  
  // Fallback para escala 1-10 (dados antigos)
  if (score >= 9) return '😄'
  if (score >= 8) return '😊'
  if (score >= 7) return '🙂'
  if (score >= 6) return '😐'
  return '😢'
}

export function getMoodLabel(score: number): string {
  // Escala 1-5 usada no Dashboard
  if (score === 5) return 'Muito Bem'     // Muito feliz
  if (score === 4) return 'Bem'           // Feliz
  if (score === 3) return 'Ok'            // Neutro
  if (score === 2) return 'Triste'        // Triste
  if (score === 1) return 'Muito triste'  // Muito triste
  
  // Fallback para escala 1-10 (dados antigos)
  if (score >= 9) return 'Excelente'
  if (score >= 8) return 'Muito Bem'
  if (score >= 7) return 'Bem'
  if (score >= 6) return 'Ok'
  return 'Triste'
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

// Mood conversion utilities
export type MoodCategory = 'happy' | 'neutral' | 'sad'
export type MoodScore = 1 | 2 | 3 | 4 | 5

// Convert numeric mood (1-5) to category (happy/neutral/sad)
export function moodScoreToCategory(score: MoodScore): MoodCategory {
  if (score >= 4) return 'happy'  // 4-5: Feliz/Muito feliz
  if (score === 3) return 'neutral'  // 3: Neutro
  return 'sad'  // 1-2: Triste/Muito triste
}

// Convert category (happy/neutral/sad) to numeric mood (1-5)
export function moodCategoryToScore(category: MoodCategory): MoodScore {
  switch (category) {
    case 'happy': return 4  // Default to "Feliz"
    case 'neutral': return 3  // "Neutro"
    case 'sad': return 2  // Default to "Triste"
  }
}

// Get mood category label in Portuguese
export function getMoodCategoryLabel(category: MoodCategory): string {
  switch (category) {
    case 'happy': return 'Feliz'
    case 'neutral': return 'Neutro'
    case 'sad': return 'Triste'
  }
}

// Get mood score label in Portuguese (for 1-5 scale)
export function getMoodScoreLabel(score: MoodScore): string {
  switch (score) {
    case 5: return 'Muito feliz'
    case 4: return 'Feliz'
    case 3: return 'Neutro'
    case 2: return 'Triste'
    case 1: return 'Muito triste'
  }
}

// Convert Diary mood scale (1-5) to Dashboard mood scale (1-10)
export function convertDiaryMoodToDashboard(diaryMood: MoodScore): number {
  switch (diaryMood) {
    case 5: return 9  // Muito feliz -> Excelente
    case 4: return 8  // Feliz -> Muito Bem
    case 3: return 6  // Neutro -> Ok
    case 2: return 4  // Triste -> Triste
    case 1: return 2  // Muito triste -> Muito triste
  }
}