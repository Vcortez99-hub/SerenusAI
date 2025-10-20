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

## 🏗️ Arquitetura

### Frontend
- **React 18** + **TypeScript**
- **Vite** para build ultrarrápido
- **Tailwind CSS** para estilização
- **Framer Motion** para animações
- **React Router** para navegação

### Backend
- **Node.js** + **Express**
- **WhatsApp Business API** para webhooks
- **OpenAI API** para análise de sentimento
- **Stripe** para pagamentos

---

## 🚀 Como Iniciar

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

# Instalar dependências
npm install
cd server && npm install && cd ..

# Configurar variáveis de ambiente
cp .env.example .env
cp server/.env.example server/.env

# Edite os arquivos .env com suas credenciais
```

### Desenvolvimento

```bash
# Iniciar frontend e backend simultaneamente
npm start

# Ou separadamente:
npm run dev          # Frontend em http://localhost:5173
npm run dev:backend  # Backend em http://localhost:3001
```

---

## 📚 Documentação

- [📱 Configurar WhatsApp](./WHATSAPP_SETUP.md)
- [🚀 Deploy no Render](./DEPLOY_RENDER.md)
- [🏛️ Plano de Melhorias](./PLANO_MELHORIAS_ARQUITETURA.md)

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
FRONTEND_URL=http://localhost:5173

# WhatsApp
WA_PHONE_NUMBER_ID=seu_phone_number_id
CLOUD_API_ACCESS_TOKEN=seu_token
WEBHOOK_VERIFICATION_TOKEN=seu_webhook_token

# OpenAI
OPENAI_API_KEY=sua_chave_openai

# Stripe
STRIPE_SECRET_KEY=sua_chave_stripe
```

Veja [WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md) para detalhes completos.

---

## 📦 Estrutura do Projeto

```
essentia-vite/
├── src/                      # Frontend React
│   ├── components/           # Componentes reutilizáveis
│   ├── pages/               # Páginas da aplicação
│   ├── contexts/            # Context API
│   ├── services/            # Serviços (API, OpenAI)
│   └── hooks/               # Custom hooks
│
├── server/                  # Backend Node.js
│   ├── index.js            # Servidor principal
│   ├── whatsapp.js         # Integração WhatsApp
│   ├── diary-storage.js    # Armazenamento do diário
│   ├── user-storage.js     # Gerenciamento de usuários
│   └── sentiment-analysis.js  # Análise de sentimento
│
├── WHATSAPP_SETUP.md       # Guia de configuração WhatsApp
├── DEPLOY_RENDER.md        # Guia de deploy
└── package.json            # Dependências
```

---

## 🎨 Funcionalidades Detalhadas

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

### 4. Integração WhatsApp
- Envie mensagens → vira entrada no diário
- Confirmação automática
- Análise de sentimento
- Comandos de ajuda

### 5. Sistema de Planos
- Free, Premium, Enterprise
- Integração com Stripe
- Gestão de assinaturas

---

## 🧪 Testes

```bash
# Rodar testes (quando implementados)
npm test

# Coverage
npm run test:coverage
```

---

## 🚀 Deploy

### Opção 1: Render (Free)

```bash
# Seguir guia em DEPLOY_RENDER.md
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

---

## 🤝 Contribuindo

Contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Autores

**EssentIA Team**
- [Seu Nome](https://github.com/seu-usuario)

---

## 🙏 Agradecimentos

- Meta for Developers (WhatsApp API)
- OpenAI (Análise de sentimento)
- Stripe (Pagamentos)
- Comunidade React e Node.js

---

## 📞 Suporte

Encontrou um bug? Tem uma sugestão?

- 📧 Email: suporte@essentia.app
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/essentia/issues)

---

## 🗺️ Roadmap

- [ ] Testes automatizados
- [ ] Modo offline (PWA)
- [ ] Notificações push
- [ ] Marketplace de terapeutas
- [ ] Videochamadas
- [ ] Grupos de apoio
- [ ] Wearables integration
- [ ] Multi-idioma

---

## 📊 Status

- ✅ Frontend: Completo
- ✅ Backend: Completo
- ✅ WhatsApp: Funcional
- ⚠️ Banco de dados: Local (JSON) - migrar para MongoDB/PostgreSQL
- ✅ Stripe: Configurado
- 🔄 Testes: Em desenvolvimento

---

**Feito com ❤️ e ☕ pela equipe EssentIA**
