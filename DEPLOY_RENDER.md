# 🚀 Deploy no Render - EssentIA

Este guia explica como fazer deploy da aplicação EssentIA no Render com PostgreSQL.

## 📋 Pré-requisitos

1. Conta no [Render](https://render.com)
2. Conta no [GitHub](https://github.com) (repositório do projeto)
3. Credenciais da Z-API (WhatsApp)
4. API Key da OpenAI

## 🗄️ Passo 1: Criar Banco de Dados PostgreSQL

1. Acesse o [Dashboard do Render](https://dashboard.render.com/)
2. Clique em **"New +"** → **"PostgreSQL"**
3. Preencha:
   - **Name**: `essentia-db`
   - **Database**: `essentia`
   - **User**: `essentia_user`
   - **Region**: Oregon (ou mais próximo)
   - **Plan**: Free
4. Clique em **"Create Database"**
5. **Aguarde a criação** (pode levar alguns minutos)
6. **Copie a "Internal Database URL"** (usaremos depois)

## 🖥️ Passo 2: Deploy do Backend (API)

1. No Dashboard do Render, clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório GitHub
3. Preencha:
   - **Name**: `essentia-api`
   - **Region**: Oregon (mesmo do banco)
   - **Branch**: `main` ou `master`
   - **Root Directory**: `serenus-vite/server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Plan**: Free

4. **Variáveis de Ambiente** (Environment Variables):

Clique em **"Advanced"** e adicione:

```
NODE_ENV=production
PORT=3001
DATABASE_URL=[Cole a Internal Database URL copiada no Passo 1]
OPENAI_API_KEY=sua_api_key_openai
ZAPI_INSTANCE_ID=3E9006AB044D1184F4CFF2C46BC83976
ZAPI_TOKEN=2FE3FA64536F49A3ADF0D637
ZAPI_CLIENT_TOKEN=F45fde400d96e47fba9fff384f7cd4ba4S
ZAPI_WEBHOOK_URL=https://essentia-api.onrender.com/webhook/zapi
FRONTEND_URL=https://essentia-frontend.onrender.com
```

5. Clique em **"Create Web Service"**
6. **Aguarde o deploy** (5-10 minutos na primeira vez)

## 🌐 Passo 3: Deploy do Frontend

1. No Dashboard do Render, clique em **"New +"** → **"Static Site"**
2. Conecte o mesmo repositório GitHub
3. Preencha:
   - **Name**: `essentia-frontend`
   - **Branch**: `main` ou `master`
   - **Root Directory**: `serenus-vite`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Variáveis de Ambiente**:

```
VITE_API_URL=https://essentia-api.onrender.com
```

5. Clique em **"Create Static Site"**
6. **Aguarde o deploy**

## ⚙️ Passo 4: Configurar Webhook da Z-API

1. Acesse o [Dashboard da Z-API](https://api.z-api.io)
2. Selecione sua instância **"SignaProd"**
3. Vá em **"Webhooks"**
4. Configure:
   - **URL**: `https://essentia-api.onrender.com/webhook/zapi`
   - **Eventos**: Marque "Mensagens Recebidas"
5. Salve as configurações

## ✅ Passo 5: Testar a Aplicação

1. Acesse o frontend: `https://essentia-frontend.onrender.com`
2. Faça um cadastro com seu WhatsApp
3. Verifique se recebeu a mensagem de boas-vindas
4. Envie uma mensagem para o WhatsApp conectado
5. Verifique se a mensagem aparece no diário

## 🔧 Troubleshooting

### Banco de dados não conecta
- Verifique se a `DATABASE_URL` está correta
- Certifique-se de usar a **Internal Database URL**
- Verifique os logs do backend no Render

### Mensagens do WhatsApp não chegam
- Verifique se a instância Z-API está conectada (QR Code escaneado)
- Confirme se o webhook está configurado corretamente
- Verifique se o `ZAPI_CLIENT_TOKEN` está correto

### Frontend não carrega dados
- Verifique se `VITE_API_URL` aponta para o backend correto
- Confirme que o backend está rodando (acesse `/health`)
- Verifique o CORS no backend

## 📊 Monitoramento

- **Logs do Backend**: Dashboard Render → essentia-api → Logs
- **Logs do Banco**: Dashboard Render → essentia-db → Logs
- **Status da Z-API**: https://api.z-api.io/dashboard

## 🔄 Atualizações

Para atualizar a aplicação:

1. Faça push das alterações para o GitHub
2. O Render fará deploy automático (se configurado)
3. Ou clique em **"Manual Deploy" → "Deploy latest commit"**

## 💡 Dicas

- O plano Free do Render hiberna após 15 minutos de inatividade
- O banco PostgreSQL Free tem limite de 1GB
- Configure domínio personalizado em Settings → Custom Domain
- Habilite auto-deploy em Settings → Build & Deploy

## 🆘 Suporte

- [Documentação do Render](https://render.com/docs)
- [Documentação da Z-API](https://developer.z-api.io)
- [Documentação do PostgreSQL](https://www.postgresql.org/docs/)

---

✅ **Aplicação pronta para produção com dados persistentes!**
