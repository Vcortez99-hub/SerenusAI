# Guia de Deploy - EssentIA

## Arquitetura

O projeto está dividido em:
- **Frontend**: React + Vite (hospedado no Render como site estático)
- **Backend**: Node.js + Express (hospedado no Render como Web Service)

## Configuração no Render

### 1. Backend (API)

Serviço: `essentia-api`

**Configurações:**
- Runtime: Node
- Build Command: `npm install`
- Start Command: `node index.js`
- Root Directory: `server`

**Variáveis de Ambiente Obrigatórias:**
```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://serenusai-1.onrender.com

# WhatsApp (Z-API)
ZAPI_INSTANCE_ID=seu_instance_id
ZAPI_TOKEN=seu_token

# OpenAI (para análise de sentimento)
OPENAI_API_KEY=sua_chave_openai

# Stripe (para pagamentos)
STRIPE_SECRET_KEY=sua_chave_secreta_stripe
STRIPE_WEBHOOK_SECRET=seu_webhook_secret_stripe

# Webhook verification (Meta WhatsApp - opcional)
WEBHOOK_VERIFICATION_TOKEN=seu_token_de_verificacao
WA_PHONE_NUMBER_ID=seu_phone_number_id
CLOUD_API_ACCESS_TOKEN=seu_access_token
```

### 2. Frontend (Site Estático)

Serviço: `serenusai-1` (já existente)

**Configurações:**
- Runtime: Static Site
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Root Directory: `serenus-vite`
- URL: https://serenusai-1.onrender.com

**Variáveis de Ambiente:**
```bash
VITE_API_URL=https://essentia-api.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=sua_chave_publica_stripe
```

**Rewrites (já configurados no render.yaml):**
- `/api/*` → Backend API
- `/webhook/*` → Backend API
- `/stripe/*` → Backend API
- `/*` → `/index.html` (SPA fallback)

## Deploy Manual

### Via render.yaml

1. Faça commit das alterações:
```bash
git add .
git commit -m "fix: ajustes de configuração para produção"
git push origin master
```

2. O Render detectará automaticamente o `render.yaml` e criará/atualizará os serviços

### Via Dashboard do Render

1. Acesse https://dashboard.render.com
2. Crie dois Web Services:
   - Backend: configure conforme seção 1
   - Frontend: configure conforme seção 2

## Problemas Comuns

### 1. 404 ao recarregar páginas (RESOLVIDO)
- Arquivo `_redirects` configurado com SPA fallback
- Render configurado com rewrites no render.yaml

### 2. API não conecta (RESOLVIDO)
- URLs padronizadas usando `@/config/api.ts`
- Rewrites configurados para proxy das chamadas de API

### 3. WhatsApp não funciona
**Checklist:**
- [ ] Variáveis Z-API configuradas no backend
- [ ] Webhook configurado no painel Z-API: `https://essentia-api.onrender.com/webhook/zapi`
- [ ] Usuário cadastrado na plataforma com telefone
- [ ] Número de telefone no formato correto (5511999999999)

### 4. Entrada de diário não salva
**Checklist:**
- [ ] Backend rodando (acesse `/health` para verificar)
- [ ] Usuário autenticado no frontend
- [ ] Console do navegador sem erros
- [ ] Backend recebendo requisições (verificar logs)

## Verificação Pós-Deploy

### 1. Verificar Backend
```bash
curl https://essentia-api.onrender.com/health
# Deve retornar: {"status":"ok","timestamp":"...","uptime":...}
```

### 2. Verificar Frontend
- Acesse https://serenusai-1.onrender.com
- Navegue entre páginas e recarregue (F5)
- Todas as rotas devem funcionar

### 3. Verificar WhatsApp
- Configure o webhook no painel Z-API
- Envie mensagem de teste via Settings
- Verifique logs do backend no Render

## Estrutura de Arquivos Importantes

```
serenus-vite/
├── render.yaml                    # Configuração do Render
├── DEPLOY.md                      # Este arquivo
├── public/
│   └── _redirects                 # Regras de redirecionamento
├── src/
│   ├── config/
│   │   └── api.ts                 # Configuração centralizada da API
│   └── services/
│       ├── diary-api.ts           # Serviço de diário
│       └── stripeService.ts       # Serviço de pagamentos
└── server/
    ├── index.js                   # Servidor principal
    ├── whatsapp.js                # Serviço WhatsApp
    └── brdid-service.js           # Integração Z-API
```

## Monitoramento

### Logs do Backend
```bash
# No dashboard do Render, acesse:
# Services > essentia-api > Logs
```

### Logs do Frontend
- Abra o Console do navegador (F12)
- Verifique a aba Network para chamadas de API

## Rollback

Se algo der errado:

1. Acesse o dashboard do Render
2. Vá em "Deploys" do serviço
3. Clique em "Rollback" no deploy anterior

Ou via Git:
```bash
git revert HEAD
git push origin master
```

## Suporte

- Documentação Render: https://render.com/docs
- Issues do projeto: https://github.com/seu-usuario/essentia/issues
