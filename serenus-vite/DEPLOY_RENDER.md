# 🚀 Deploy no Render (Free Tier)

## ⚠️ IMPORTANTE: Limitações do Render Free

- **Suspende após 15min de inatividade**
- **Demora 50s+ para "acordar"**
- **Arquivos JSON não persistem** (use banco de dados para produção)
- **WhatsApp webhook pode falhar** se o serviço estiver suspenso

**Alternativa recomendada**: Railway ($5 free/mês) ou Vercel + PlanetScale

---

## 📋 Passo a Passo

### 1. Criar Conta no Render

1. Acesse: https://render.com
2. Faça login com GitHub
3. Conecte seu repositório

### 2. Subir o Código para o GitHub

```bash
cd /c/Users/ebine/OneDrive/Documents/EssentIA/essentia-vite

# Inicializar repositório (se ainda não fez)
git init
git add .
git commit -m "feat: Aplicação EssentIA com integração WhatsApp"

# Criar repositório no GitHub e fazer push
git remote add origin https://github.com/seu-usuario/essentia.git
git branch -M main
git push -u origin main
```

### 3. Configurar Backend no Render

#### 3.1 Criar Web Service

1. No Render Dashboard, clique em **"New +"**
2. Selecione **"Web Service"**
3. Conecte seu repositório GitHub
4. Preencha:
   - **Name**: `essentia-backend`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Plan**: `Free`

#### 3.2 Configurar Variáveis de Ambiente

No painel do serviço, vá em **"Environment"** e adicione:

```
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://seu-frontend.vercel.app

# WhatsApp
WA_PHONE_NUMBER_ID=seu_phone_number_id
CLOUD_API_ACCESS_TOKEN=seu_token
CLOUD_API_VERSION=v18.0
WEBHOOK_VERIFICATION_TOKEN=seu_webhook_token
AUTHORIZED_NUMBERS=5511999999999

# OpenAI
OPENAI_API_KEY=sua_openai_key

# Stripe (opcional)
STRIPE_SECRET_KEY=sua_stripe_key
STRIPE_WEBHOOK_SECRET=seu_webhook_secret
```

#### 3.3 Deploy

Clique em **"Create Web Service"**

Sua API estará disponível em: `https://essentia-backend.onrender.com`

---

### 4. Configurar Frontend (Vercel - Recomendado)

#### 4.1 Preparar Build

1. Instalar Vercel CLI:
```bash
npm install -g vercel
```

2. Fazer login:
```bash
vercel login
```

#### 4.2 Atualizar Configuração

Edite `essentia-vite/.env`:
```env
VITE_OPENAI_API_KEY=sua_openai_key
VITE_API_URL=https://essentia-backend.onrender.com
```

#### 4.3 Deploy

```bash
cd /c/Users/ebine/OneDrive/Documents/EssentIA/essentia-vite
vercel
```

Siga as instruções:
- Setup and deploy? **Y**
- Which scope? Sua conta
- Link to existing project? **N**
- What's your project's name? `essentia`
- In which directory is your code located? `./`
- Want to override the settings? **N**

Pronto! Frontend estará em: `https://essentia.vercel.app`

---

### 5. Configurar Webhook do WhatsApp

Agora que o backend está no ar:

1. Acesse o Meta for Developers
2. Vá em WhatsApp > Configuration > Webhook
3. Edite e coloque:
   - **URL**: `https://essentia-backend.onrender.com/webhook`
   - **Token**: o mesmo do `.env` (WEBHOOK_VERIFICATION_TOKEN)
4. Salve e subscreva nos eventos: `messages`

---

## 🔒 Persistência de Dados

**PROBLEMA**: Render Free reinicia e perde arquivos JSON.

**SOLUÇÕES**:

### Opção A: MongoDB Atlas (Free)

1. Criar conta no MongoDB Atlas (free)
2. Instalar mongoose:
```bash
cd server && npm install mongoose
```

3. Substituir `diary-storage.js` e `user-storage.js` por versões com MongoDB

### Opção B: Supabase (Free)

1. Criar conta no Supabase
2. Instalar cliente:
```bash
cd server && npm install @supabase/supabase-js
```

3. Usar Supabase para armazenamento

### Opção C: PlanetScale (Free)

1. Criar banco MySQL no PlanetScale
2. Usar Prisma:
```bash
cd server && npm install @prisma/client prisma
```

---

## 🐛 Troubleshooting

### Backend suspendeu

**Problema**: Render Free suspende após 15min

**Solução**: Configure um ping service
```bash
# Usar cron-job.org ou UptimeRobot
# Fazer ping a cada 14 minutos em:
https://essentia-backend.onrender.com/health
```

### Webhook não funciona

**Problema**: Backend estava suspenso quando mensagem chegou

**Soluções**:
1. Usar Railway ao invés de Render
2. Upgrade para Render Paid ($7/mês)
3. Implementar fila de mensagens com Redis

---

## 💰 Custo Zero Setup

**Frontend**: Vercel Free (ilimitado)  
**Backend**: Render Free ou Railway Free  
**Banco**: MongoDB Atlas Free (512MB) ou Supabase Free (500MB)  
**WhatsApp**: Meta Free (1000 conversas/mês)  

**Total**: R$ 0,00/mês 🎉

---

## 📊 Monitoramento

### Render Logs

Ver logs em tempo real:
```bash
# Instalar Render CLI
npm install -g @render-cli/cli

# Ver logs
render logs essentia-backend
```

### Health Check

Verificar se está funcionando:
```bash
curl https://essentia-backend.onrender.com/health
```

---

## ✅ Checklist de Deploy

- [ ] Código no GitHub
- [ ] Backend no Render configurado
- [ ] Variáveis de ambiente definidas
- [ ] Frontend no Vercel
- [ ] Webhook configurado no Meta
- [ ] Teste de envio de mensagem
- [ ] Banco de dados configurado (se necessário)
- [ ] Ping service ativado (para manter backend acordado)

---

## 🎉 Pronto para Produção!

Sua aplicação está no ar! 🚀

**URLs finais**:
- Frontend: `https://essentia.vercel.app`
- Backend: `https://essentia-backend.onrender.com`
- Webhook: `https://essentia-backend.onrender.com/webhook`
