// Configuração centralizada da API

const isDevelopment = import.meta.env.DEV
const isProduction = import.meta.env.PROD

// URL completa do backend (sem /api)
const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://serenusai.onrender.com'

// URL base da API (com /api)
export const API_BASE_URL = isProduction
  ? `${BACKEND_URL}/api` // Produção: https://serenusai.onrender.com/api
  : '/api' // Desenvolvimento: usa proxy do Vite

// URL completa (sem /api) - útil para health checks
export const API_FULL_URL = BACKEND_URL

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
