import { loadStripe, Stripe } from '@stripe/stripe-js';
import { API_FULL_URL } from '@/config/api';

// Configuração do Stripe
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here';

// Debug das variáveis de ambiente
console.log('🔧 Variáveis de ambiente:');
console.log('- VITE_STRIPE_PUBLISHABLE_KEY:', STRIPE_PUBLISHABLE_KEY ? '✅ Definida' : '❌ Não definida');
console.log('- API_FULL_URL:', API_FULL_URL);

// Instância do Stripe (singleton) - COMENTADO PARA DEMONSTRAÇÃO
let stripePromise: Promise<Stripe | null>;

/**
 * Obter instância do Stripe - COMENTADO PARA DEMONSTRAÇÃO
 */
export const getStripe = (): Promise<Stripe | null> => {
  // if (!stripePromise) {
  //   stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  // }
  // return stripePromise;
  console.warn('⚠️ Stripe desabilitado para demonstração');
  return Promise.resolve(null);
};

/**
 * Interface para dados do plano
 */
export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
}

/**
 * Interface para resposta da API
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

/**
 * Interface para sessão de checkout
 */
interface CheckoutSession {
  sessionId: string;
  url: string;
}

/**
 * Buscar planos disponíveis
 */
export const getPlans = async (): Promise<Plan[]> => {
  try {
    console.log('🔍 Buscando planos da API:', `${API_FULL_URL}/stripe/plans`);
    const response = await fetch(`${API_FULL_URL}/stripe/plans`);
    console.log('📡 Resposta da API:', response.status, response.statusText);
    
    const data = await response.json();
    console.log('📊 Dados recebidos:', data);
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar planos');
    }
    
    return data.plans;
  } catch (error) {
    console.error('❌ Erro ao buscar planos:', error);
    throw error;
  }
};

/**
 * Criar sessão de checkout
 */
export const createCheckoutSession = async (
  planId: string,
  customerEmail: string
): Promise<{ url: string }> => {
  try {
    const response = await fetch(`${API_FULL_URL}/stripe/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        customerEmail,
        successUrl: `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/plans`,
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao criar sessão de checkout');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao criar checkout:', error);
    throw error;
  }
};

/**
 * Redirecionar para checkout do Stripe
 */
export const redirectToCheckout = async (
  planId: string,
  customerEmail: string
): Promise<void> => {
  try {
    const stripe = await getStripe();
    
    if (!stripe) {
      throw new Error('Stripe não foi carregado corretamente');
    }
    
    const session = await createCheckoutSession(planId, customerEmail);
    
    // Redirecionar para o checkout
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.sessionId,
    });
    
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Erro ao redirecionar para checkout:', error);
    throw error;
  }
};

/**
 * Verificar status da sessão de checkout
 */
export const getCheckoutSession = async (sessionId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_FULL_URL}/stripe/session-status?session_id=${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao obter dados da sessão');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao obter sessão:', error);
    throw error;
  }
};

/**
 * Utilitário para formatar preço em reais
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
};

/**
 * Validar email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Hook personalizado para gerenciar estado do Stripe
 */
export const useStripe = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleCheckout = async (planId: string, customerEmail: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!isValidEmail(customerEmail)) {
        throw new Error('Email inválido');
      }
      
      await redirectToCheckout(planId, customerEmail);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro no checkout:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    error,
    handleCheckout,
    clearError: () => setError(null),
  };
};

// Importar useState para o hook
import { useState } from 'react';

export default {
  getStripe,
  getPlans,
  createCheckoutSession,
  redirectToCheckout,
  getCheckoutSession,
  formatPrice,
  isValidEmail,
  useStripe,
};