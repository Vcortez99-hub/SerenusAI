const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const WhatsAppService = require('./whatsapp');
const { createCheckoutSession, verifyWebhook, handleWebhookEvent, PLANS } = require('./stripe-config');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const whatsappService = new WhatsAppService();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// WhatsApp Webhook Verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Verificar se o token corresponde ao configurado
  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFICATION_TOKEN) {
    console.log('Webhook verificado com sucesso!');
    res.status(200).send(challenge);
  } else {
    console.log('Falha na verificação do webhook');
    res.sendStatus(403);
  }
});

// WhatsApp Webhook para receber mensagens
app.post('/webhook', (req, res) => {
  const body = req.body;

  console.log('Webhook recebido:', JSON.stringify(body, null, 2));

  // Verificar se é uma mensagem do WhatsApp
  if (body.object === 'whatsapp_business_account') {
    body.entry?.forEach(entry => {
      const changes = entry.changes || [];
      
      changes.forEach(async (change) => {
            const value = change.value;
            
            if (value.messages) {
              for (const message of value.messages) {
                await processWhatsAppMessage(message, value.metadata);
              }
            }
          });
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Função para processar mensagens do WhatsApp
async function processWhatsAppMessage(message, metadata) {
  try {
    console.log('🔄 Iniciando processamento da mensagem:', {
      id: message.id,
      from: message.from,
      type: message.type,
      content: message.text?.body?.substring(0, 50) + '...'
    });
    
    const result = await whatsappService.processIncomingMessage(message, metadata);
    
    console.log('✅ Mensagem processada com sucesso:', {
      id: message.id,
      result: result
    });
  } catch (error) {
    console.error('❌ Erro ao processar mensagem do WhatsApp:', error);
  }
}

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Servidor WhatsApp funcionando!' })
})

// Rota de health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Rota para listar entradas de diário
app.get('/api/diary-entries', async (req, res) => {
  try {
    const entries = await whatsappService.diaryStorage.getAllEntries();
    res.json({ success: true, entries, total: entries.length });
  } catch (error) {
    console.error('Erro ao buscar entradas do diário:', error);
    res.status(500).json({ error: 'Erro ao buscar entradas do diário', details: error.message });
  }
});

// Rota para buscar entradas por data
app.get('/api/diary-entries/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const entries = await whatsappService.diaryStorage.getEntriesByDate(date);
    res.json({ success: true, entries, total: entries.length, date });
  } catch (error) {
    console.error('Erro ao buscar entradas por data:', error);
    res.status(500).json({ error: 'Erro ao buscar entradas por data', details: error.message });
  }
});

// Rota para estatísticas do diário
app.get('/api/diary-stats', async (req, res) => {
  try {
    const stats = await whatsappService.diaryStorage.getStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas', details: error.message });
  }
});

// Rota de teste para enviar mensagem WhatsApp
app.post('/test-whatsapp', async (req, res) => {
  try {
    const { to, message } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({ error: 'Campos "to" e "message" são obrigatórios' });
    }
    
    const result = await whatsappService.sendTextMessage(to, message);
    res.json({ success: true, result, message: 'Mensagem enviada com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar mensagem de teste:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem', details: error.message });
  }
});

// ========== STRIPE ENDPOINTS ==========

// Rota para obter informações dos planos
app.get('/stripe/plans', (req, res) => {
  try {
    const plansInfo = Object.entries(PLANS).map(([id, plan]) => ({
      id,
      name: plan.name,
      price: plan.price / 100, // Converter de centavos para reais
      currency: plan.currency,
      features: plan.features
    }));
    
    res.json({ success: true, plans: plansInfo });
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    res.status(500).json({ error: 'Erro ao buscar planos', details: error.message });
  }
});

// Rota para criar sessão de checkout
app.post('/stripe/create-checkout-session', async (req, res) => {
  try {
    const { planId, customerEmail } = req.body;
    
    if (!planId || !customerEmail) {
      return res.status(400).json({ 
        error: 'Campos "planId" e "customerEmail" são obrigatórios' 
      });
    }
    
    if (!PLANS[planId]) {
      return res.status(400).json({ 
        error: `Plano "${planId}" não encontrado` 
      });
    }
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const successUrl = `${frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${frontendUrl}/plans?canceled=true`;
    
    const session = await createCheckoutSession(
      planId,
      customerEmail,
      successUrl,
      cancelUrl
    );
    
    res.json({ 
      success: true, 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    res.status(500).json({ 
      error: 'Erro ao criar sessão de checkout', 
      details: error.message 
    });
  }
});

// Webhook do Stripe (deve usar raw body)
app.post('/stripe/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    if (!signature) {
      return res.status(400).json({ error: 'Assinatura do webhook ausente' });
    }
    
    const event = verifyWebhook(req.body, signature);
    
    console.log('📦 Evento do Stripe recebido:', event.type);
    
    await handleWebhookEvent(event);
    
    res.json({ received: true });
  } catch (error) {
    console.error('❌ Erro no webhook do Stripe:', error);
    res.status(400).json({ error: 'Erro no webhook', details: error.message });
  }
});

// Rota para verificar status da sessão
app.get('/stripe/session-status', async (req, res) => {
  try {
    const { session_id: sessionId } = req.query;
    
    const { stripe } = require('./stripe-config');
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.json({ 
      success: true, 
      session: {
        id: session.id,
        payment_status: session.payment_status,
        customer_email: session.customer_email,
        metadata: session.metadata
      }
    });
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    res.status(500).json({ 
      error: 'Erro ao verificar sessão', 
      details: error.message 
    });
  }
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor WhatsApp rodando na porta ${PORT}`);
  console.log(`📱 Webhook URL: http://localhost:${PORT}/webhook`);
  
  // Validar configuração do WhatsApp
  try {
    whatsappService.validateConfiguration();
  } catch (error) {
    console.error('❌ Erro na configuração:', error.message);
    console.log('💡 Verifique o arquivo .env e configure as variáveis necessárias');
  }
});