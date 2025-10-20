# 🌊 EssentIA - Plataforma de Bem-Estar Emocional

**Sua jornada de bem-estar emocional, guiada por IA e cuidado humano**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

---

## 🎯 Sobre o Projeto

**EssentIA** é uma plataforma SaaS inovadora que combina Inteligência Artificial com terapia e práticas integrativas para promover o bem-estar emocional.

### ✨ Principais Funcionalidades

- 🤖 **Chat com IA** - Assistente emocional disponível 24/7
- 📝 **Diário Digital** - Registre seus pensamentos e sentimentos
- 📱 **Integração WhatsApp** - Escreva no diário pelo WhatsApp
- 📊 **Análise de Sentimento** - IA analisa seu humor automaticamente
- 💳 **Sistema de Planos** - Integração com Stripe
- 🎨 **Interface Moderna** - Design glassmorphism e animações fluidas

---

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Meta for Developers (para WhatsApp)
- Chave API OpenAI (opcional)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/essentia.git
cd essentia/essentia-vite

# Instalar dependências do frontend
npm install

# Instalar dependências do backend
cd server && npm install && cd ..

# Configurar variáveis de ambiente
cp .env.example .env
cp server/.env.example server/.env

# Edite os arquivos .env com suas credenciais
```

### Iniciar Aplicação

```bash
# Iniciar frontend e backend simultaneamente
npm start
```

Acesse:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

---

## 📚 Documentação Completa

- [📱 Configurar WhatsApp](./WHATSAPP_SETUP.md) - Guia passo a passo
- [🚀 Deploy no Render/Railway](./DEPLOY_RENDER.md) - Colocar em produção
- [🏛️ Plano de Melhorias](./PLANO_MELHORIAS_ARQUITETURA.md) - Roadmap técnico

---

## 🏗️ Arquitetura

```
essentia-vite/
├── src/                      # Frontend React + TypeScript
│   ├── components/           # Componentes reutilizáveis
│   ├── pages/               # Páginas da aplicação
│   ├── contexts/            # Context API (Auth, etc)
│   └── services/            # APIs (OpenAI, Diary, etc)
│
├── server/                  # Backend Node.js + Express
│   ├── index.js            # Servidor principal
│   ├── whatsapp.js         # Integração WhatsApp
│   ├── diary-storage.js    # Armazenamento do diário
│   └── user-storage.js     # Gerenciamento de usuários
│
└── docs/                    # Documentação
    ├── WHATSAPP_SETUP.md
    └── DEPLOY_RENDER.md
```

---

## 🔧 Configuração

### Frontend (`.env`)

```env
VITE_OPENAI_API_KEY=sua_chave_openai
VITE_API_URL=http://localhost:3001
```

### Backend (`server/.env`)

```env
# Server
PORT=3001
NODE_ENV=development

# WhatsApp Business API
WA_PHONE_NUMBER_ID=seu_phone_number_id
CLOUD_API_ACCESS_TOKEN=seu_token
WEBHOOK_VERIFICATION_TOKEN=seu_webhook_token

# OpenAI
OPENAI_API_KEY=sua_chave_openai

# Stripe (opcional)
STRIPE_SECRET_KEY=sua_chave_stripe
```

📖 **Guia completo**: [WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md)

---

## 🎨 Funcionalidades

### 1. Dashboard
- Rastreamento de humor diário
- Gráficos de evolução emocional  
- Exercícios recomendados pela IA
- Progresso gamificado

### 2. Chat com IA
- Assistente terapêutico 24/7
- Análise de sentimento em tempo real
- Sugestões personalizadas
- Histórico de conversas

### 3. Diário Digital
- Entradas locais + WhatsApp
- Tags automáticas
- Análise de humor
- Busca e filtros avançados
- Relatórios com IA

### 4. Integração WhatsApp ⭐
- Envie mensagens → vira entrada no diário
- Confirmação automática
- Análise de sentimento
- Comandos: `ajuda`, `status`

### 5. Sistema de Planos
- Free, Premium, Enterprise
- Integração com Stripe
- Gestão de assinaturas

---

## 🚀 Deploy

### Opção 1: Render (Free)

```bash
# Seguir: DEPLOY_RENDER.md
```

### Opção 2: Vercel + Railway

- **Frontend**: Vercel (free, ilimitado)
- **Backend**: Railway ($5 free/mês)

```bash
# Frontend
vercel

# Backend  
railway init && railway up
```

📖 **Guia completo**: [DEPLOY_RENDER.md](./DEPLOY_RENDER.md)

---

## 💰 Custos

### Free Tier (para começar)
- Frontend (Vercel): **R$ 0**
- Backend (Render/Railway): **R$ 0**
- Banco (MongoDB Atlas/Supabase): **R$ 0**
- WhatsApp (Meta): **R$ 0** (até 1000 conversas/mês)
- **TOTAL**: **R$ 0/mês** 🎉

### Produção Recomendada
- Frontend (Vercel): **R$ 0**
- Backend (Render Starter): **~R$ 35/mês**
- Banco (MongoDB Atlas M0): **R$ 0**
- **TOTAL**: **~R$ 35/mês**

---

## 🛠️ Scripts Disponíveis

```bash
npm start          # Inicia frontend + backend
npm run dev        # Apenas frontend
npm run dev:backend # Apenas backend
npm run build      # Build de produção
npm run lint       # Linter
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Nova feature'`)
4. Push (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT.

---

## 👥 Equipe

**EssentIA Team**

---

## 📞 Suporte

- 📧 Email: suporte@essentia.app
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/essentia/issues)
- 📖 Docs: [Documentação Completa](./docs/)

---

## 🗺️ Roadmap

- [x] Frontend React + TypeScript
- [x] Backend Node.js + Express
- [x] Integração WhatsApp
- [x] Análise de Sentimento (OpenAI)
- [x] Sistema de Autenticação
- [x] Stripe Integration
- [ ] Testes Automatizados
- [ ] PWA (Modo Offline)
- [ ] Notificações Push
- [ ] Marketplace de Terapeutas
- [ ] Videochamadas
- [ ] Multi-idioma

---

## ⚡ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Chart.js

**Backend:**
- Node.js + Express
- WhatsApp Business API
- OpenAI API
- Stripe

**Deploy:**
- Frontend: Vercel
- Backend: Render/Railway
- Database: MongoDB Atlas/Supabase

---

**Feito com ❤️ e ☕ pela equipe EssentIA**

🌊 Transformando cuidado emocional através da tecnologia
