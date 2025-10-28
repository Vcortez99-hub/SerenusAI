# Variáveis de Ambiente para Configurar no Render

## 🚨 URGENTE - Configure AGORA no Dashboard do Render

### Backend (essentia-api)

1. **DATABASE_URL** - JÁ ESTÁ CONFIGURADO AUTOMATICAMENTE pelo banco de dados
2. **NODE_ENV** = `production` - JÁ ESTÁ NO render.yaml
3. **OPENAI_API_KEY** = `sua_chave_openai_aqui` ⚠️ OBRIGATÓRIO
4. **FRONTEND_URL** = `https://essentia-frontend.onrender.com` (ou URL real do seu frontend)

#### WhatsApp Z-API (Opcional - para mensagens automáticas)
5. **ZAPI_INSTANCE_ID** = sua_instance_id
6. **ZAPI_TOKEN** = seu_token
7. **ZAPI_CLIENT_TOKEN** = seu_client_token
8. **ZAPI_WEBHOOK_URL** = `https://essentia-api.onrender.com/webhook/zapi`

### Frontend (essentia-frontend)

1. **VITE_API_URL** = `https://essentia-api.onrender.com` ⚠️ OBRIGATÓRIO
2. **VITE_OPENAI_API_KEY** = `sua_chave_openai_aqui` ⚠️ OBRIGATÓRIO

---

## 📋 Passo a Passo RÁPIDO (5 minutos):

### 1. Configure o Backend
1. Acesse: https://dashboard.render.com
2. Clique no serviço **essentia-api**
3. Vá em **Environment**
4. Adicione:
   - `OPENAI_API_KEY` = sua chave OpenAI
   - `FRONTEND_URL` = URL do frontend (pegar após deploy)

### 2. Configure o Frontend
1. Clique no serviço **essentia-frontend**
2. Vá em **Environment**
3. Adicione:
   - `VITE_API_URL` = https://essentia-api.onrender.com
   - `VITE_OPENAI_API_KEY` = sua chave OpenAI

### 3. Faça o Deploy
```bash
git add .
git commit -m "fix: configurar variáveis de ambiente"
git push
```

### 4. Aguarde 3-5 minutos para o deploy completar

---

## ✅ URLs Finais

- **Frontend**: https://essentia-frontend.onrender.com
- **Backend API**: https://essentia-api.onrender.com
- **Banco de dados**: PostgreSQL gerenciado pelo Render

---

## 🔍 Como testar se está funcionando:

1. Abra: https://essentia-frontend.onrender.com
2. Cadastre um email: teste@exemplo.com
3. Senha: teste123
4. Se criar conta e logar → ✅ FUNCIONOU!

---

## ⚠️ Problemas Comuns

### "Email já cadastrado" mas não consigo logar
- **Causa**: Banco SQLite local sendo usado (dados não persistem)
- **Solução**: Certifique-se que `DATABASE_URL` está configurada no Render

### "Senha inválida"
- **Causa**: Hash de senha diferente entre deploys
- **Solução**: Delete o banco e recrie (só funciona se DATABASE_URL estiver configurada)

### Página em branco
- **Causa**: `VITE_API_URL` não configurada
- **Solução**: Configure no frontend e faça redeploy
