import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { useSearchParams, Link } from 'react-router-dom';
import { getCheckoutSession } from '../services/stripeService';

interface SessionData {
  id: string;
  payment_status: string;
  customer_email: string;
  metadata: {
    planId: string;
    planName: string;
  };
}

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!sessionId) {
        setError('ID da sessão não encontrado na URL');
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔍 Buscando dados da sessão:', sessionId);
        const response = await getCheckoutSession(sessionId);
        console.log('📦 Resposta da API:', response);
        
        if (response.success && response.session) {
          setSessionData(response.session);
        } else {
          setError(response.error || 'Sessão não encontrada');
        }
      } catch (err) {
        console.error('❌ Erro ao buscar dados da sessão:', err);
        setError(`Erro ao verificar pagamento: ${err.message || 'Erro desconhecido'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Verificando pagamento...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Oops! Algo deu errado
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'Não foi possível verificar o status do pagamento.'}
          </p>
          
          {/* Debug info for development */}
          {sessionId && (
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                Informações de Debug:
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                Session ID: {sessionId}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Verifique o console do navegador para mais detalhes
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/plans"
              className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
            >
              Voltar aos Planos
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Link>
            
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isPaymentSuccessful = sessionData.payment_status === 'paid';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircleIcon className="w-12 h-12 text-white" />
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              🎉 Pagamento Realizado com Sucesso!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Bem-vindo ao EssentIA! Sua assinatura foi ativada.
            </p>
          </motion.div>

          {/* Payment Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 max-w-2xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Detalhes da Assinatura
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Plano Selecionado
                </h3>
                <p className="text-lg text-gray-900 dark:text-white">
                  {sessionData.metadata.planName}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </h3>
                <p className="text-lg text-gray-900 dark:text-white">
                  {sessionData.customer_email}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Status do Pagamento
                </h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  ✅ Pago
                </span>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  ID da Transação
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {sessionData.id}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-blue-50 dark:bg-gray-700 rounded-2xl p-8 mb-8 max-w-2xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Próximos Passos
            </h2>
            
            <div className="space-y-4 text-left">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Configure sua conta
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Acesse o dashboard e personalize suas preferências
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Conecte seu WhatsApp
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Configure a integração para começar a usar o diário
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Comece sua jornada
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Envie sua primeira mensagem e veja a mágica acontecer
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Ir para Dashboard
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
            
            <Link
              to="/settings"
              className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-semibold text-lg transition-all duration-200"
            >
              Configurar WhatsApp
            </Link>
          </motion.div>

          {/* Support Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-600 dark:text-gray-400">
              Precisa de ajuda? Entre em contato conosco pelo email{' '}
              <a href="mailto:suporte@essentia.com" className="text-blue-500 hover:text-blue-600">
              suporte@essentia.com
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccess;