import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, StarIcon, EnvelopeIcon } from '@heroicons/react/24/solid';
import { useStripe, formatPrice, Plan as StripePlan, getPlans } from '../services/stripeService';

const Plans: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [plans, setPlans] = useState<StripePlan[]>([
    // Planos de fallback caso a API não carregue
    {
      id: 'basic',
      name: 'Plano Básico',
      price: 29.90,
      currency: 'brl',
      description: 'Perfeito para começar sua jornada de bem-estar',
      popular: false,
      features: [
        'Análise de sentimentos via WhatsApp',
        'Diário digital personalizado',
        'Relatórios mensais de humor',
        'Suporte por email',
        'Backup automático dos dados',
        'Acesso ao chat de apoio'
      ]
    },
    {
      id: 'premium',
      name: 'Plano Premium',
      price: 49.90,
      currency: 'brl',
      description: 'Para quem busca o máximo em autoconhecimento',
      popular: true,
      features: [
        'Tudo do Plano Básico',
        'Análise avançada com IA',
        'Insights personalizados diários',
        'Relatórios semanais detalhados',
        'Suporte prioritário 24/7',
        'Integração com múltiplas plataformas',
        'Sessões de coaching virtual',
        'Histórico ilimitado',
        'Exportação de dados em PDF'
      ]
    }
  ]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const { isLoading, error, handleCheckout, clearError } = useStripe();

  // Carregar planos da API
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const plansData = await getPlans();
        if (plansData && plansData.length > 0) {
          setPlans(plansData);
        }
        // Se não conseguir carregar da API, mantém os planos de fallback
      } catch (error) {
        console.error('Erro ao carregar planos da API, usando planos de fallback:', error);
        // Mantém os planos de fallback que já estão no estado inicial
      } finally {
        setIsLoadingPlans(false);
      }
    };
    
    loadPlans();
  }, []);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setShowEmailModal(true);
    clearError();
  };

  const handleProceedToCheckout = async () => {
    if (!selectedPlan || !customerEmail) return;
    
    await handleCheckout(selectedPlan, customerEmail);
    setShowEmailModal(false);
  };

  const closeModal = () => {
    setShowEmailModal(false);
    setSelectedPlan(null);
    setCustomerEmail('');
    clearError();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Transforme sua jornada de autoconhecimento com o EssentIA. 
            Escolha o plano que melhor se adapta às suas necessidades.
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoadingPlans ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">Carregando planos...</span>
          </div>
        ) : (
          <>
            {/* Plans Grid */}
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden ${
                plan.popular ? 'ring-4 ring-blue-500 scale-105' : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-bl-lg">
                  <div className="flex items-center space-x-1">
                    <StarIcon className="w-4 h-4" />
                    <span className="text-sm font-semibold">Mais Popular</span>
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-xl text-gray-600 dark:text-gray-400 ml-2">
                      /mês
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isLoading}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    plan.id === 'premium'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading && selectedPlan === plan.id ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processando...
                    </div>
                  ) : (
                    'Assinar Agora'
                  )}
                </button>
              </div>
            </motion.div>
          ))}
            </div>
          </>
        )}

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Por que escolher o EssentIA?
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Seguro e Privado</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Seus dados são criptografados e protegidos com os mais altos padrões de segurança.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">IA Avançada</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Tecnologia de ponta para análise precisa de sentimentos e insights personalizados.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Suporte 24/7</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Nossa equipe está sempre disponível para ajudar você em sua jornada.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Money Back Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="text-gray-600 dark:text-gray-400">
            💰 <strong>Garantia de 30 dias</strong> - Não ficou satisfeito? Devolvemos seu dinheiro!
          </p>
        </motion.div>

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <EnvelopeIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Finalizar Assinatura
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Digite seu email para prosseguir com o pagamento
                </p>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  disabled={isLoading}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={closeModal}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleProceedToCheckout}
                  disabled={isLoading || !customerEmail.trim()}
                  className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processando...
                    </div>
                  ) : (
                    'Prosseguir'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Plans;