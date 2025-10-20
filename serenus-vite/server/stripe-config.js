const Stripe = require('stripe');
require('dotenv').config();

// Inicializar Stripe com a chave secreta (opcional)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'your_stripe_secret_key_here') {
  stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  console.log('✅ Stripe configurado');
} else {
  console.warn('⚠️ Stripe não configurado - funcionalidades de pagamento desabilitadas');
}

// Configurações dos produtos
const PLANS = {
  test: {
    name: 'Plano Teste',
    priceId: process.env.STRIPE_TEST_PRICE_ID,
    price: 100, // em centavos (R$ 1,00)
    currency: 'brl',
    features: [
      'Acesso completo por 7 dias',
      'Análise de sentimentos',
      'Diário digital personalizado',
      'Teste todas as funcionalidades'
    ]
  },
  basic: {
    name: 'Plano Básico',
    priceId: process.env.STRIPE_BASIC_PRICE_ID,
    price: 2990, // em centavos (R$ 29,90)
    currency: 'brl',
    features: [
      'Análise de sentimentos',
      'Diário digital personalizado',
      'Relatórios mensais de humor',
      'Backup automático dos dados',
      'Acesso ao chat de apoio'
    ]
  },
  premium: {
    name: 'Plano Premium',
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    price: 4990, // em centavos (R$ 49,90)
    currency: 'brl',
    features: [
      'Tudo do Plano Básico',
      'Análise avançada com IA',
      'Insights personalizados diários',
      'Relatórios semanais detalhados',
      'Integração com múltiplas plataformas',
      'Sessões de coaching virtual',
      'Histórico ilimitado',
      'Exportação de dados em PDF'
    ]
  }
};

/**
 * Criar sessão de checkout do Stripe
 * @param {string} planId - ID do plano (basic ou premium)
 * @param {string} customerEmail - Email do cliente
 * @param {string} successUrl - URL de sucesso
 * @param {string} cancelUrl - URL de cancelamento
 * @returns {Promise<Object>} Sessão de checkout
 */
async function createCheckoutSession(planId, customerEmail, successUrl, cancelUrl) {
  try {
    if (!stripe) {
      throw new Error('Stripe não está configurado. Configure STRIPE_SECRET_KEY no .env');
    }

    const plan = PLANS[planId];
    if (!plan) {
      throw new Error(`Plano '${planId}' não encontrado`);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: customerEmail,
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        planId: planId,
        planName: plan.name
      },
      subscription_data: {
        metadata: {
          planId: planId,
          planName: plan.name
        }
      }
    });

    return session;
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    throw error;
  }
}

/**
 * Criar produtos e preços no Stripe (função de setup)
 * Esta função deve ser executada uma vez para configurar os produtos
 */
async function setupStripeProducts() {
  try {
    if (!stripe) {
      throw new Error('Stripe não está configurado. Configure STRIPE_SECRET_KEY no .env');
    }

    console.log('🔧 Configurando produtos no Stripe...');

    // Criar produto de teste
    const testProduct = await stripe.products.create({
      name: PLANS.test.name,
      description: 'Plano de teste do EssentIA - Experimente por apenas R$ 1,00',
      metadata: {
        planId: 'test'
      }
    });

    const testPrice = await stripe.prices.create({
      unit_amount: PLANS.test.price,
      currency: PLANS.test.currency,
      recurring: { interval: 'month' },
      product: testProduct.id,
      metadata: {
        planId: 'test'
      }
    });

    // Criar produto básico
    const basicProduct = await stripe.products.create({
      name: PLANS.basic.name,
      description: 'Plano básico do EssentIA - Perfeito para começar sua jornada de bem-estar',
      metadata: {
        planId: 'basic'
      }
    });

    const basicPrice = await stripe.prices.create({
      unit_amount: PLANS.basic.price,
      currency: PLANS.basic.currency,
      recurring: { interval: 'month' },
      product: basicProduct.id,
      metadata: {
        planId: 'basic'
      }
    });

    // Criar produto premium
    const premiumProduct = await stripe.products.create({
      name: PLANS.premium.name,
      description: 'Plano premium do EssentIA - Para quem busca o máximo em autoconhecimento',
      metadata: {
        planId: 'premium'
      }
    });

    const premiumPrice = await stripe.prices.create({
      unit_amount: PLANS.premium.price,
      currency: PLANS.premium.currency,
      recurring: { interval: 'month' },
      product: premiumProduct.id,
      metadata: {
        planId: 'premium'
      }
    });

    console.log('✅ Produtos criados com sucesso!');
    console.log('📋 Adicione estas informações ao seu arquivo .env:');
    console.log(`STRIPE_TEST_PRICE_ID=${testPrice.id}`);
    console.log(`STRIPE_BASIC_PRICE_ID=${basicPrice.id}`);
    console.log(`STRIPE_PREMIUM_PRICE_ID=${premiumPrice.id}`);

    return {
      test: {
        product: testProduct,
        price: testPrice
      },
      basic: {
        product: basicProduct,
        price: basicPrice
      },
      premium: {
        product: premiumProduct,
        price: premiumPrice
      }
    };
  } catch (error) {
    console.error('❌ Erro ao configurar produtos:', error);
    throw error;
  }
}

/**
 * Verificar webhook do Stripe
 * @param {string} payload - Payload do webhook
 * @param {string} signature - Assinatura do webhook
 * @returns {Object} Evento verificado
 */
function verifyWebhook(payload, signature) {
  try {
    if (!stripe) {
      throw new Error('Stripe não está configurado. Configure STRIPE_SECRET_KEY no .env');
    }

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    console.error('❌ Erro na verificação do webhook:', error);
    throw error;
  }
}

/**
 * Processar eventos do webhook
 * @param {Object} event - Evento do Stripe
 */
async function handleWebhookEvent(event) {
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('✅ Pagamento concluído:', session.id);
        // Aqui você pode ativar a assinatura do usuário
        await handleSuccessfulPayment(session);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        console.log('✅ Pagamento de fatura bem-sucedido:', invoice.id);
        // Renovação de assinatura
        await handleSubscriptionRenewal(invoice);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        console.log('❌ Falha no pagamento:', failedInvoice.id);
        // Lidar com falha no pagamento
        await handlePaymentFailure(failedInvoice);
        break;

      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        console.log('🚫 Assinatura cancelada:', subscription.id);
        // Desativar acesso do usuário
        await handleSubscriptionCancellation(subscription);
        break;

      default:
        console.log(`⚠️ Evento não tratado: ${event.type}`);
    }
  } catch (error) {
    console.error('❌ Erro ao processar evento do webhook:', error);
    throw error;
  }
}

// Funções auxiliares para processar eventos
async function handleSuccessfulPayment(session) {
  // Implementar lógica para ativar assinatura
  console.log('🎉 Ativando assinatura para:', session.customer_email);
  // TODO: Salvar informações da assinatura no banco de dados
}

async function handleSubscriptionRenewal(invoice) {
  // Implementar lógica para renovação
  console.log('🔄 Renovando assinatura:', invoice.subscription);
}

async function handlePaymentFailure(invoice) {
  // Implementar lógica para falha no pagamento
  console.log('⚠️ Notificando usuário sobre falha no pagamento');
}

async function handleSubscriptionCancellation(subscription) {
  // Implementar lógica para cancelamento
  console.log('❌ Desativando acesso do usuário');
}

module.exports = {
  stripe,
  PLANS,
  createCheckoutSession,
  setupStripeProducts,
  verifyWebhook,
  handleWebhookEvent
};