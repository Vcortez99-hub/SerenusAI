# 🚀 Deploy no Render com MongoDB Atlas (Banco de Dados Gratuito)

## 📋 Visão Geral

Este guia mostra como fazer deploy da aplicação EssentIA no Render com persistência real de dados usando MongoDB Atlas.

**Stack Final:**
- **Frontend**: Vercel (grátis, ilimitado)
- **Backend**: Render Free Tier
- **Banco de Dados**: MongoDB Atlas M0 (grátis, 512MB)
- **Custo Total**: R$ 0/mês 🎉

---

## 🗄️ PASSO 1: Configurar MongoDB Atlas

### 1.1 Criar Conta

1. Acesse: https://www.mongodb.com/cloud/atlas/register
2. Crie uma conta gratuita
3. Escolha o plano **M0 Sandbox** (FREE)

### 1.2 Criar Cluster

1. Após login, clique em **"Build a Database"**
2. Escolha **M0 (FREE)**
3. Selecione o provider: **AWS**
4. Região: **São Paulo (sa-east-1)** (mais próximo do Brasil)
5. Nome do cluster: `essentia-cluster`
6. Clique em **"Create"**

### 1.3 Configurar Acesso

#### Usuário do Banco

1. Em "Security > Database Access"
2. Clique em **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `essentia_admin`
5. Password: Gere uma senha forte (salve ela!)
6. Database User Privileges: **Read and write to any database**
7. Clique em **"Add User"**

#### Whitelist de IPs

1. Em "Security > Network Access"
2. Clique em **"Add IP Address"**
3. Escolha **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Necessário para Render acessar
4. Clique em **"Confirm"**

### 1.4 Obter Connection String

1. Em "Deployment > Database"
2. Clique em **"Connect"** no seu cluster
3. Escolha **"Connect your application"**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copie a connection string:

```
mongodb+srv://essentia_admin:<password>@essentia-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

6. Substitua `<password>` pela senha que você criou
7. Adicione o nome do banco: `essentia`

String final:
```
mongodb+srv://essentia_admin:SUA_SENHA@essentia-cluster.xxxxx.mongodb.net/essentia?retryWrites=true&w=majority
```

---

## ⚙️ PASSO 2: Instalar Mongoose no Backend

```bash
cd server
npm install mongoose
```

---

## 🔧 PASSO 3: Criar Models do Mongoose

Vou criar os models para Users e DiaryEntries.

---

## 📦 PASSO 4: Atualizar Backend para Usar MongoDB

O código será atualizado para usar MongoDB ao invés de arquivos JSON.

---

## 🚀 PASSO 5: Deploy no Render

### 5.1 Preparar Repositório

```bash
# Commitar mudanças
git add .
git commit -m "feat: Add MongoDB integration"
git push origin main
```

### 5.2 Criar Web Service no Render

1. Acesse: https://render.com
2. Clique em **"New +"** > **"Web Service"**
3. Conecte seu repositório GitHub
4. Configurações:
   - **Name**: `essentia-backend`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Plan**: `Free`

### 5.3 Configurar Variáveis de Ambiente no Render

Na seção "Environment", adicione:

```
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://seu-frontend.vercel.app

# MongoDB
MONGODB_URI=mongodb+srv://essentia_admin:SUA_SENHA@essentia-cluster.xxxxx.mongodb.net/essentia?retryWrites=true&w=majority

# WhatsApp Business API
WA_PHONE_NUMBER_ID=seu_phone_number_id
CLOUD_API_ACCESS_TOKEN=seu_token
CLOUD_API_VERSION=v18.0
WEBHOOK_VERIFICATION_TOKEN=seu_webhook_token
AUTHORIZED_NUMBERS=5511999999999

# OpenAI
OPENAI_API_KEY=sua_chave_openai

# Stripe
STRIPE_SECRET_KEY=sua_chave_stripe
STRIPE_WEBHOOK_SECRET=seu_webhook_secret
```

### 5.4 Deploy

Clique em **"Create Web Service"**

Aguarde o deploy (3-5 minutos)

Sua API estará em: `https://essentia-backend.onrender.com`

---

## 🎨 PASSO 6: Deploy do Frontend no Vercel

### 6.1 Instalar Vercel CLI

```bash
npm install -g vercel
```

### 6.2 Fazer Login

```bash
vercel login
```

### 6.3 Atualizar .env

Edite `serenus-vite/.env`:

```env
VITE_OPENAI_API_KEY=sua_chave_openai
VITE_API_URL=https://essentia-backend.onrender.com
```

### 6.4 Deploy

```bash
cd serenus-vite
vercel --prod
```

Frontend estará em: `https://essentia.vercel.app`

---

## ✅ PASSO 7: Testar Integração

### 7.1 Verificar Backend

```bash
curl https://essentia-backend.onrender.com/health
```

Deve retornar:
```json
{"status":"ok","database":"connected"}
```

### 7.2 Criar Usuário de Teste

```bash
curl -X POST https://essentia-backend.onrender.com/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste User",
    "email": "teste@essentia.app",
    "phone": "5511999999999"
  }'
```

### 7.3 Verificar no MongoDB

1. Acesse MongoDB Atlas
2. Vá em "Deployment > Database"
3. Clique em **"Browse Collections"**
4. Verifique se o banco `essentia` foi criado
5. Veja as collections: `users`, `diaryentries`

---

## 📊 Monitoramento

### Logs do Render

```bash
# Via CLI
render logs essentia-backend

# Via Dashboard
https://dashboard.render.com > essentia-backend > Logs
```

### Logs do MongoDB

No Atlas Dashboard:
- "Deployment > Database" > "Monitoring"
- Veja métricas de uso, conexões, queries

---

## 🔐 Backup

### Backup Manual do MongoDB

1. No Atlas, vá em "Deployment > Database"
2. Clique no cluster > "..." > "Download Backup"

### Backup Automático

MongoDB Atlas faz backup automático diário (retenção de 2 dias no free tier)

---

## 💰 Custos e Limites

### MongoDB Atlas M0 (Free)
- ✅ 512MB de armazenamento
- ✅ Shared RAM
- ✅ Backup básico
- ✅ ~100 conexões simultâneas
- ⚠️ Pode ser pausado após 60 dias de inatividade

### Render Free
- ✅ 750h/mês de uptime
- ⚠️ Suspende após 15min de inatividade
- ⚠️ Demora ~50s para "acordar"

### Vercel Free
- ✅ Ilimitado
- ✅ Edge Network global
- ✅ SSL automático

**Total: R$ 0/mês** 🎉

---

## 🚨 Limitações do Free Tier

### Para resolver:

**Render Paid ($7/mês)**:
- Não suspende
- Sempre ativo
- Recomendado para produção

**MongoDB Atlas M2 ($9/mês)**:
- 2GB de armazenamento
- Backups contínuos
- Melhor performance

---

## 🎯 Próximos Passos

1. ✅ Configurar domínio personalizado
2. ✅ Adicionar monitoramento (Sentry)
3. ✅ Configurar alertas
4. ✅ Implementar cache (Redis)
5. ✅ Adicionar CI/CD

---

## 📞 Troubleshooting

### Erro: Cannot connect to MongoDB

**Solução**:
1. Verifique se o IP está na whitelist (0.0.0.0/0)
2. Confirme username/password na connection string
3. Teste conexão localmente primeiro

### Erro: Render suspendeu o serviço

**Solução**:
1. Configure UptimeRobot para fazer ping a cada 14min
2. Ou upgrade para Render Paid

### Erro: MongoDB Atlas pausou o cluster

**Solução**:
1. Faça login no Atlas uma vez por mês para evitar pausa
2. Ou upgrade para M2

---

**Pronto! Sua aplicação está no ar com banco de dados real!** 🚀
