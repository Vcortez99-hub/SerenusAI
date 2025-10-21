// Configuração centralizada da API

const isDevelopment = import.meta.env.DEV
const isProduction = import.meta.env.PROD

// URL base da API baseada no ambiente
export const API_BASE_URL = isProduction
  ? import.meta.env.VITE_API_URL || 'https://serenusai.onrender.com/api' // Backend no Render
  : '/api' // Em desenvolvimento, usa proxy do Vite

// URL completa (com protocolo e domínio) - útil para health checks
export const API_FULL_URL = import.meta.env.VITE_API_URL || 'https://serenusai.onrender.com'

// OpenAI API Key
export const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''

// Configurações
export const config = {
  isDevelopment,
  isProduction,
  apiBaseUrl: API_BASE_URL,
  apiFullUrl: API_FULL_URL,
  openaiApiKey: OPENAI_API_KEY
}
