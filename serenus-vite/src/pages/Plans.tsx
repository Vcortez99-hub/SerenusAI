import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Mail, Shield, Zap, Heart, ArrowRight } from 'lucide-react';
import { useStripe, formatPrice, Plan as StripePlan, getPlans } from '../services/stripeService';
import { Link } from 'react-router-dom';

const Plans: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [plans, setPlans] = useState<StripePlan[]>([
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

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const plansData = await getPlans();
        if (plansData && plansData.length > 0) {
          setPlans(plansData);
        }
      } catch (error) {
        console.error('Erro ao carregar planos da API, usando planos de fallback:', error);
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
    <div className="min-h-screen bg-neutral-50 pb-12">
      {/* Header with Glassmorphism */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
                <Heart className="w-5 h-5" />
              </div>
              <span className="text-xl font-headings font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Essentia
              </span>
            </Link>

            <Link
              to="/dashboard"
              className="text-neutral-600 hover:text-primary-600 font-medium transition-colors flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Voltar para Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-white border border-primary-100 rounded-full shadow-sm mb-6">
            <Star className="w-4 h-4 text-primary-500 mr-2 fill-current" />
            <span className="text-sm font-bold text-primary-700">Invista em você</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-headings font-bold text-neutral-900 mb-6">
            Escolha o plano ideal para <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
              sua jornada de evolução
            </span>
          </h1>
          <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
            Desbloqueie todo o potencial do EssentIA com recursos exclusivos projetados para acelerar seu bem-estar.
          </p>
        </motion.div>

        {isLoadingPlans ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-3xl p-8 border transition-all duration-300 ${plan.popular
                    ? 'border-primary-500 shadow-2xl shadow-primary-500/10 scale-105 z-10'
                    : 'border-neutral-200 shadow-xl hover:shadow-2xl hover:border-primary-200'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                      <Star className="w-4 h-4 fill-current" />
                      Mais Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-headings font-bold text-neutral-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-neutral-500 mb-6 h-12 flex items-center justify-center">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-neutral-900 tracking-tight">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-neutral-500 ml-2 font-medium">
                      /mês
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.popular ? 'bg-primary-100 text-primary-600' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-neutral-600 font-medium">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isLoading}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 group ${plan.popular
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-lg hover:shadow-primary-500/25'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading && selectedPlan === plan.id ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <span>Assinar Agora</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-20"
        >
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-green-600">
                <Shield className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-neutral-900 mb-3">Seguro e Privado</h4>
              <p className="text-neutral-500">
                Seus dados são criptografados de ponta a ponta e protegidos com os mais altos padrões de segurança.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100 text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                <Zap className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-neutral-900 mb-3">IA Avançada</h4>
              <p className="text-neutral-500">
                Tecnologia de ponta para análise precisa de sentimentos e insights personalizados em tempo real.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100 text-center">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-600">
                <Heart className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-neutral-900 mb-3">Suporte Humanizado</h4>
              <p className="text-neutral-500">
                Nossa equipe de especialistas está sempre disponível para ajudar você em cada passo da sua jornada.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12 bg-primary-50 rounded-2xl p-6 border border-primary-100 inline-block w-full"
        >
          <p className="text-primary-800 font-medium flex items-center justify-center gap-2">
            <span className="text-2xl">💰</span>
            <strong>Garantia de 30 dias</strong> - Não ficou satisfeito? Devolvemos seu dinheiro integralmente!
          </p>
        </motion.div>

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-neutral-200"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-600">
                  <Mail className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-headings font-bold text-neutral-900 mb-2">
                  Finalizar Assinatura
                </h3>
                <p className="text-neutral-500">
                  Confirme seu email para prosseguir com o pagamento seguro
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-start gap-3">
                  <div className="mt-0.5"><Shield className="w-4 h-4" /></div>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <div className="mb-8">
                <label className="block text-sm font-bold text-neutral-700 mb-2 ml-1">
                  Email
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 border border-neutral-200 rounded-xl text-neutral-700 font-bold hover:bg-neutral-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleProceedToCheckout}
                  disabled={isLoading || !customerEmail.trim()}
                  className="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <span>Prosseguir</span>
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