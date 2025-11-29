# 🚀 Guia Completo de Deploy - Render.com

## 📋 Visão Geral

Este guia te ensina a fazer deploy completo da aplicação **EssentIA** no Render.com (plano 100% gratuito).

### ✅ O que vai funcionar após o deploy:

- ✅ **Registro de usuários** → Automaticamente vinculados à empresa "General"
- ✅ **Diário emocional** com análise de sentimento (IA)
- ✅ **Chat com IA** (Daniella Vilar - psicóloga virtual)
- ✅ **Atividades de bem-estar** e gamificação
- ✅ **Sistema de conquistas** e níveis
- ✅ **Notificações** em tempo real
- ✅ **Pagamentos via Stripe** (plano único R$ 29,90/mês)
- ✅ **Integração WhatsApp** (opcional)
- ✅ **Dashboard de métricas** e insights

---

## 🎯 Pré-requisitos

### 1. Conta no Render.com
- Acesse: https://render.com
- Clique em **"Get Started for Free"**
- Faça login com GitHub/Google/Email

### 2. Chaves de API Necessárias

#### 🔑 **OBRIGATÓRIAS:**

**a) OpenAI** (para IA)
- Acesse: https://platform.openai.com/api-keys
- Clique em **"Create new secret key"**
- Copie: `sk-proj-...`
- **Custo estimado:** $5-10/mês (depende do uso)

**b) Stripe** (para pagamentos)
- Acesse: https://dashboard.stripe.com/apikeys
- Copie as chaves:
  - **Secret Key:** `sk_test_...` (teste) ou `sk_live_...` (produção)
  - **Publishable Key:** `pk_test_...` ou `pk_live_...`
- Configure webhook:
  - Vá em: https://dashboard.stripe.com/webhooks
  - Clique em **"Add endpoint"**
  - URL: `https://essentia-api.onrender.com/api/stripe/webhook`
  - Eventos: Selecione **"checkout.session.completed"** e **"customer.subscription.updated"**
  - Copie o **Webhook Secret:** `whsec_...`

#### 🔑 **OPCIONAIS (mas recomendadas):**

**c) Z-API** (para WhatsApp)
- Acesse: https://www.z-api.io/
- Crie uma instância
- Copie:
  - `ZAPI_INSTANCE_ID`
  - `ZAPI_TOKEN`
  - `ZAPI_CLIENT_TOKEN`

---

## 📦 Passo 1: Preparar o Código

### 1.1 Commit e push das alterações

```bash
git add .
git commit -m "feat: configurar deploy para Render.com"
git push origin master
```

### 1.2 Verificar arquivos essenciais

Certifique-se de que estes arquivos existem:
- ✅ `render.yaml` (na raiz do projeto)
- ✅ `serenus-vite/server/init-database-render.js`
- ✅ `serenus-vite/server/.env.example`

---

## 🌐 Passo 2: Criar Serviços no Render

### 2.1 Criar via Blueprint (RECOMENDADO - MAIS FÁCIL)

1. **No dashboard do Render:**
   - Clique em **"New +"** → **"Blueprint"**

2. **Conectar repositório:**
   - Selecione **"Connect a repository"**
   - Autorize o GitHub
   - Selecione seu repositório: **Essentia**

3. **Aplicar Blueprint:**
   - O Render detectará automaticamente o `render.yaml`
   - Clique em **"Apply"**
   - Nome do Blueprint: `essentia-app`
   - Confirme

4. **Aguardar criação:**
   - O Render criará automaticamente:
     - ✅ `essentia-api` (Backend)
     - ✅ `essentia-frontend` (Frontend)
     - ✅ `essentia-db` (PostgreSQL)
   - **Tempo estimado:** 5-10 minutos

---

## 🔧 Passo 3: Configurar Variáveis de Ambiente

### 3.1 Configurar Backend (essentia-api)

1. **No dashboard:**
   - Clique em **"essentia-api"**
   - Vá em **"Environment"** (menu lateral)

2. **Adicionar variáveis OBRIGATÓRIAS:**

```
OPENAI_API_KEY = sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY = sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET = whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

3. **Adicionar variáveis OPCIONAIS (se tiver):**

```
ZAPI_INSTANCE_ID = sua_instance_id
ZAPI_TOKEN = seu_token
ZAPI_CLIENT_TOKEN = seu_client_token
ZAPI_WEBHOOK_URL = https://essentia-api.onrender.com/api/whatsapp/webhook
```

4. **Salvar:**
   - Clique em **"Save Changes"**
   - O serviço reiniciará automaticamente

### 3.2 Verificar Frontend (essentia-frontend)

1. **No dashboard:**
   - Clique em **"essentia-frontend"**
   - Vá em **"Environment"**

2. **Verificar variável:**
   ```
   VITE_API_URL = https://essentia-api.onrender.com
   ```
   *(Deve estar configurada automaticamente pelo render.yaml)*

---

## 🗄️ Passo 4: Inicializar Banco de Dados

### 4.1 Acessar Shell do Backend

1. **No dashboard:**
   - Clique em **"essentia-api"**
   - Vá em **"Shell"** (menu lateral)
   - Aguarde abrir o terminal (pode demorar 1-2 minutos)

### 4.2 Executar script de inicialização

```bash
node init-database-render.js
```

### 4.3 Aguardar confirmação

Você deve ver:
```
✅ Tabela companies criada
✅ Tabela users criada
✅ Tabela diary_entries criada
...
✅ Empresa "General" criada com ID: company_general_xxxxx
✅ Conquistas padrão inseridas
🎉 Banco de dados inicializado com sucesso!
```

**🎉 Se viu isso, está tudo pronto!**

---

## 🧪 Passo 5: Testar a Aplicação

### 5.1 Acessar URLs

**Frontend:**
```
https://essentia-frontend.onrender.com
```

**Backend (Health Check):**
```
https://essentia-api.onrender.com/health
```

### 5.2 Teste completo: Criar usuário

1. **Abra o frontend**
2. **Clique em "Criar Conta"**
3. **Preencha:**
   - Nome: Seu Nome
   - Email: seu@email.com
   - Senha: suasenha123
   - Telefone: (11) 99999-9999
   - CPF: 123.456.789-00 (válido)

4. **Clique em "Registrar"**

5. **Verificar:**
   - ✅ Usuário criado com sucesso
   - ✅ Empresa "General" aparece no perfil
   - ✅ Login funciona
   - ✅ Dashboard carrega

### 5.3 Teste: Diário

1. **Vá em "Meu Diário"**
2. **Escreva uma entrada**
3. **Verificar:**
   - ✅ Entrada salva
   - ✅ Análise de sentimento funciona (emoji)
   - ✅ Dados aparecem no dashboard

### 5.4 Teste: Chat com IA

1. **Vá em "Chat"**
2. **Envie uma mensagem:** "Olá!"
3. **Verificar:**
   - ✅ Daniella responde
   - ✅ Conversa natural
   - ✅ Histórico salvo

### 5.5 Teste: Pagamento (Stripe)

1. **Vá em "Planos"**
2. **Clique em "Assinar Premium"**
3. **Use cartão de teste:**
   - Número: `4242 4242 4242 4242`
   - Validade: qualquer data futura
   - CVC: qualquer 3 dígitos
4. **Verificar:**
   - ✅ Pagamento processado
   - ✅ Plano atualizado
   - ✅ Funcionalidades premium desbloqueadas

---

## 🔍 Troubleshooting

### ❌ Erro: "Service unavailable"
**Causa:** Backend está "dormindo" (cold start)
**Solução:** Aguarde 30-60 segundos e tente novamente

### ❌ Erro: "Database connection failed"
**Causa:** Banco não foi inicializado
**Solução:** Execute novamente o Passo 4 (init-database-render.js)

### ❌ Erro: "OpenAI API key invalid"
**Causa:** Chave da OpenAI incorreta ou não configurada
**Solução:**
1. Verifique se configurou `OPENAI_API_KEY` no dashboard
2. Verifique se a chave começa com `sk-proj-` ou `sk-`
3. Teste a chave em: https://platform.openai.com/api-keys

### ❌ Erro: "Stripe webhook failed"
**Causa:** Webhook secret incorreto
**Solução:**
1. Vá em: https://dashboard.stripe.com/webhooks
2. Copie o **Signing secret** correto
3. Atualize `STRIPE_WEBHOOK_SECRET` no dashboard
4. Salve e reinicie o serviço

### ❌ Erro: "CORS policy blocked"
**Causa:** URLs de frontend/backend inconsistentes
**Solução:**
1. Verifique `FRONTEND_URL` no backend
2. Verifique `VITE_API_URL` no frontend
3. Certifique-se de que estão com as URLs corretas do Render

### ❌ Erro: "Company 'General' not found"
**Causa:** Banco não inicializado corretamente
**Solução:**
1. Acesse Shell do backend
2. Execute novamente:
   ```bash
   node init-database-render.js
   ```

---

## 📊 Monitoramento

### Logs do Backend
1. Dashboard > **essentia-api** > **Logs**
2. Filtrar por tipo:
   - `info` - Operações normais
   - `error` - Erros
   - `warn` - Avisos

### Logs do Frontend
1. Dashboard > **essentia-frontend** > **Logs**
2. Visualizar build e deploy

### Banco de Dados
1. Dashboard > **essentia-db** > **Info**
2. Ver estatísticas:
   - Conexões ativas
   - Tamanho do banco
   - Último backup

---

## 💰 Custos Estimados

### Render.com (FREE)
- ✅ Backend: **$0/mês** (750h/mês)
- ✅ Frontend: **$0/mês** (100GB bandwidth)
- ⚠️ PostgreSQL: **$0/mês** (90 dias, depois $7/mês)

### APIs Externas
- 🔑 OpenAI: **~$5-10/mês** (depende do uso)
- 🔑 Stripe: **Grátis** (cobra 3,99% + R$0,39 por transação)
- 🔑 Z-API (WhatsApp): **~$15-30/mês** (opcional)

**Total estimado:** $5-10/mês (sem WhatsApp) ou $20-40/mês (com WhatsApp)

---

## 🎯 Próximos Passos

### 1. Configurar Domínio Personalizado (Opcional)
- Dashboard > **essentia-frontend** > **Settings** > **Custom Domain**
- Adicionar: `app.seudominio.com`
- Configurar DNS conforme instruções

### 2. Adicionar Monitoramento (Recomendado)
- Integrar com: https://betterstack.com/uptime (grátis)
- Alertas se app ficar fora do ar

### 3. Backup do Banco (Importante)
- Render faz backup automático do PostgreSQL
- Para backup manual: Dashboard > **essentia-db** > **Backups**

### 4. Migrar PostgreSQL após 90 dias
- Opção 1: Pagar $7/mês no Render
- Opção 2: Migrar para Supabase (grátis) ou Neon (grátis)

---

## 📞 Suporte

**Problemas com o deploy?**
- Verifique logs no dashboard
- Consulte: https://render.com/docs
- Abra issue no GitHub do projeto

**Dúvidas sobre APIs?**
- OpenAI: https://platform.openai.com/docs
- Stripe: https://stripe.com/docs
- Z-API: https://developer.z-api.io/

---

## ✅ Checklist Final

Antes de considerar o deploy completo, verifique:

- [ ] Frontend carrega sem erros
- [ ] Backend responde em `/health`
- [ ] Registro de usuário funciona
- [ ] Empresa "General" é criada automaticamente
- [ ] Login funciona
- [ ] Diário salva entradas
- [ ] Chat com IA responde
- [ ] Análise de sentimento funciona
- [ ] Dashboard carrega métricas
- [ ] Pagamento Stripe funciona (teste)
- [ ] WhatsApp integra (se configurado)
- [ ] Notificações funcionam
- [ ] Gamificação (pontos/conquistas) funciona

**🎉 Se todos os itens estão ✅, PARABÉNS! Sua aplicação está 100% funcional!**

---

## 🚀 Deploy realizado com sucesso!

**URLs da sua aplicação:**
- 🌐 Frontend: https://essentia-frontend.onrender.com
- 🔧 Backend: https://essentia-api.onrender.com
- 📊 Dashboard Render: https://dashboard.render.com

**Desenvolvido com ❤️ por EssentIA Team**
