# 🚀 Configuração Completa - Essentia

## 📊 1. Banco de Dados PostgreSQL (Render)

✅ **Já Criado**: `essentia-bd`

```bash
DATABASE_URL=postgresql://essentia_user:ILTng0T1rHxEoHM0CbodgULI1x2eQXGR@dpg-d40hmtq4d50c73d6glmg-a/essentia_production
```

## 🔑 2. Chave OpenAI - AÇÃO NECESSÁRIA

### Problema Atual
A chave OpenAI nos arquivos `.env` está **inválida/revogada**.

### Como Obter Nova Chave

1. Acesse: https://platform.openai.com/api-keys
2. Clique em **"Create new secret key"**
3. Nome: `Essentia Production`
4. **COPIE A CHAVE** (ela começa com `sk-proj-` ou `sk-`)
5. ⚠️ A chave só aparece UMA VEZ!

### Onde Adicionar a Nova Chave

Após obter a nova chave da OpenAI, configure nos seguintes locais:

#### A. Localmente (Desenvolvimento)

**Frontend** - `serenus-vite/.env`:
```bash
VITE_OPENAI_API_KEY=sua_nova_chave_aqui
```

**Backend** - `serenus-vite/server/.env`:
```bash
OPENAI_API_KEY=sua_nova_chave_aqui
```

#### B. Render (Produção)

1. Vá em **essentia-api** → **Environment**
2. Adicione/Atualize:
```bash
OPENAI_API_KEY=sua_nova_chave_aqui
```

3. Vá em **essentia** (frontend) → **Environment**
4. Adicione/Atualize:
```bash
VITE_OPENAI_API_KEY=sua_nova_chave_aqui
```

## 🌐 3. Variáveis de Ambiente Completas

### Backend (essentia-api)

```bash
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://serenusai-1.onrender.com
DATABASE_URL=postgresql://essentia_user:ILTng0T1rHxEoHM0CbodgULI1x2eQXGR@dpg-d40hmtq4d50c73d6glmg-a/essentia_production
OPENAI_API_KEY=sua_nova_chave_openai_aqui
```

### Frontend (essentia)

```bash
VITE_API_URL=https://essentia-api.onrender.com
VITE_OPENAI_API_KEY=sua_nova_chave_openai_aqui
```

## ✅ 4. Checklist de Configuração

- [x] Banco PostgreSQL criado
- [x] DATABASE_URL configurado no render.yaml
- [ ] **Obter nova chave OpenAI**
- [ ] **Configurar OPENAI_API_KEY no backend (Render)**
- [ ] **Configurar VITE_OPENAI_API_KEY no frontend (Render)**
- [ ] Fazer push para GitHub
- [ ] Aguardar deploy automático do Render

## 🧪 5. Como Testar

### Localmente

1. Adicione a nova chave OpenAI nos arquivos `.env`
2. Reinicie os servidores:
```bash
# Terminal 1 - Backend
cd serenus-vite/server
npm start

# Terminal 2 - Frontend
cd serenus-vite
npm run dev
```

3. Acesse: http://localhost:5173
4. Vá em **Chat** e teste a IA

### Produção

1. Configure as variáveis no Render
2. Aguarde o redeploy
3. Acesse: https://serenusai-1.onrender.com
4. Teste o Chat com a IA

## 🆘 Troubleshooting

### IA não responde
- ✅ Verifique se a chave OpenAI é válida
- ✅ Verifique console do navegador (F12)
- ✅ Erro 401: Chave inválida
- ✅ Erro 429: Cota excedida (upgrade do plano)

### Erro de login
- ✅ Banco configurado corretamente?
- ✅ DATABASE_URL no Render está correta?
- ✅ Aguarde 2-3 minutos após mudar variáveis

## 📞 Links Importantes

- Dashboard Render: https://dashboard.render.com
- OpenAI Platform: https://platform.openai.com
- Repositório: https://github.com/Vcortez99-hub/SerenusAI
- Frontend: https://serenusai-1.onrender.com
- Backend: https://essentia-api.onrender.com
