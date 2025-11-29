# 🌊 EssentIA - SaaS de IA para Saúde Emocional

**Sua jornada de bem-estar emocional, guiada por IA e cuidado humano**

## 📋 Visão Geral do Projeto

EssentIA é uma plataforma inovadora de saúde emocional que combina Inteligência Artificial com terapia humana e práticas integrativas. O sistema foi projetado como uma ponte entre o autocuidado digital assistido por IA e o acompanhamento profissional personalizado, oferecendo uma experiência única no mercado brasileiro.

## 🎨 Design System

### Paleta de Cores
- **Cor Primária**: `#6B9BD1` (Azul serenidade - transmite calma e confiança)
- **Cor Secundária**: `#9DC8E3` (Azul claro suave)
- **Cor de Apoio**: `#E8F4F8` (Azul muito claro para fundos)
- **Acentos Calmantes**: `#7FB069` (Verde suave para elementos positivos)
- **Neutros Quentes**: `#F5F5F0` (Off-white acolhedor)
- **Texto Principal**: `#2C3E50` (Cinza-azulado escuro)
- **Alertas Suaves**: `#F4E4C1` (Amarelo pastel para notificações)

### Tipografia
- **Font Principal**: Inter (para textos)
- **Font Títulos**: Poppins (para títulos e headings)
- **Características**: Cantos arredondados, sombras suaves, animações fluidas

## 🏗️ Arquitetura Implementada

### ✅ Funcionalidades Completadas

#### 1. **Landing Page** (`/`)
- Hero section com animações em Framer Motion
- Demonstração do chat com IA
- Indicadores de confiança e métricas
- Call-to-actions claros para conversão
- Design responsivo e acessível

#### 2. **Onboarding Inteligente** (`/onboarding`)
- **Passo 1**: Avaliação emocional inicial com emojis visuais
- **Passo 2**: Definição de objetivos terapêuticos
- **Passo 3**: Configuração de rotina e preferências
- **Passo 4**: Informações pessoais e situação atual
- Barra de progresso visual
- Validação em tempo real
- Navegação fluida entre etapas

#### 3. **Dashboard Principal** (`/dashboard`)
- **Mood Tracker**: Escala visual de 1-10 com emojis
- **Gráfico de Evolução**: Visualização da jornada emocional
- **Exercícios do Dia**: Recomendações personalizadas por IA
- **Próxima Sessão**: Card com informações do terapeuta
- **Progresso Gamificado**: Badges e conquistas sutis
- **Acesso Rápido**: Botões para principais funcionalidades

#### 4. **Chat com IA** (`/chat`)
- Interface estilo WhatsApp com UX familiar
- **Serenus Assistant**: IA terapêutica disponível 24/7
- Sugestões de resposta rápida
- Cards de exercícios integrados
- Indicador de digitação realista
- Suporte a mensagem de voz (interface preparada)
- Respostas contextuais baseadas no input do usuário

#### 5. **Diário Digital** (`/diary`)
- **Prompts de IA**: Perguntas reflexivas personalizadas
- **Análise de Sentimento**: Detecção automática de mood
- **Insights da IA**: Observações sobre padrões emocionais
- **Sistema de Tags**: Categorização automática de entradas
- **Modo Privado**: Controle de visibilidade das entradas
- **Busca e Filtros**: Localização fácil de entradas anteriores

### 🛠️ Stack Técnica

#### Frontend
- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática para maior confiabilidade
- **Tailwind CSS**: Estilização com sistema de design personalizado
- **Framer Motion**: Animações fluidas e microinterações
- **Lucide React**: Ícones lineares consistentes
- **Chart.js**: Visualizações de dados de humor
- **Headless UI**: Componentes acessíveis

#### Funcionalidades de IA Simuladas
- Análise de sentimento em texto
- Geração de prompts terapêuticos
- Sugestões de exercícios baseadas em estado emocional
- Insights sobre padrões comportamentais
- Respostas contextuais no chat

## 📁 Estrutura do Projeto

```
serenus/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── onboarding/
│   │   │   └── page.tsx          # Fluxo de onboarding
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Dashboard principal
│   │   ├── chat/
│   │   │   └── page.tsx          # Interface de chat com IA
│   │   ├── diary/
│   │   │   └── page.tsx          # Diário digital
│   │   └── globals.css           # Estilos globais e design system
│   └── lib/
│       └── utils.ts              # Utilitários e helpers
├── package.json
└── README.md
```

## 🎯 Funcionalidades Principais

### 🧠 Inteligência Artificial
- **Análise Emocional**: Reconhecimento de padrões em texto livre
- **Recomendações Personalizadas**: Exercícios baseados no estado atual
- **Prompts Terapêuticos**: Perguntas adaptativas para reflexão
- **Insights Comportamentais**: Observações sobre evolução do usuário
- **Suporte 24/7**: Disponibilidade constante para crises

### 👤 Experiência do Usuário
- **Onboarding Intuitivo**: 4 passos simples e envolventes
- **Interface Calma**: Cores e animações que transmitem serenidade
- **Gamificação Sutil**: Progresso e conquistas sem pressão
- **Privacidade**: Controle total sobre visibilidade de dados
- **Responsivo**: Experiência otimizada para mobile e desktop

### 📊 Acompanhamento e Evolução
- **Mood Tracking**: Registro diário de estado emocional
- **Visualizações**: Gráficos de evolução ao longo do tempo
- **Métricas de Progresso**: Dias consecutivos, sessões completas
- **Histórico Completo**: Acesso a toda jornada terapêutica
- **Relatórios para Terapeutas**: Insights para profissionais

## 🚀 Como Executar

### Pré-requisitos
- Node.js >= 18.17.0
- npm ou yarn

### Instalação

```bash
# Navegar para o diretório do projeto
cd serenus-vite

# Instalar dependências do frontend
npm install

# Instalar dependências do backend
cd server && npm install && cd ..
```

### Desenvolvimento

**Opção 1: Iniciar Frontend e Backend Simultaneamente (Recomendado)**
```bash
npm run dev:full
```

**Opção 2: Iniciar Apenas Frontend**
```bash
npm run dev
```
Acesse: http://localhost:5173

**Opção 3: Iniciar Apenas Backend**
```bash
npm run dev:backend
```
Acesse: http://localhost:3001

### Configuração de Ambiente

Copie os arquivos de exemplo e configure suas variáveis:
```bash
cp .env.example .env
cp server/.env.example server/.env
```

Edite os arquivos `.env` com suas credenciais (OpenAI, WhatsApp, Stripe, etc.).

## 🎨 Componentes e Padrões

### Animações
- **fadeInUp**: Entrada suave de elementos
- **slideInLeft**: Transições laterais
- **scaleIn**: Efeitos de escala para microinterações
- **Stagger**: Animações sequenciais em listas

### Utilitários
- **Mood System**: Conversão de valores numéricos em emojis e cores
- **Date Helpers**: Formatação consistente de datas
- **Class Names**: Utilitário para classes condicionais
- **Animation Variants**: Configurações reutilizáveis do Framer Motion

## 🔮 Próximas Funcionalidades

### Pendentes
- [ ] Sistema de autenticação completo
- [ ] Agendamento de sessões com terapeutas
- [ ] Biblioteca de exercícios de bem-estar
- [ ] Integração com wearables
- [ ] Notificações push personalizadas
- [ ] Modo offline para diário
- [ ] Exportação de dados terapêuticos
- [ ] Marketplace de terapeutas
- [ ] Sessões de videochamada
- [ ] Grupos de apoio moderados

### Integração Backend
- [ ] API RESTful com Node.js/Express
- [ ] Banco de dados PostgreSQL
- [ ] Sistema de autenticação JWT
- [ ] Integração com OpenAI API
- [ ] WebSockets para chat em tempo real
- [ ] Sistema de pagamentos (Stripe)
- [ ] Compliance LGPD/HIPAA
- [ ] Backup automático e segurança

## 🎉 Destaques da Implementação

### 🏆 Pontos Fortes
- **Design Empático**: Interface que transmite cuidado e acolhimento
- **IA Contextual**: Respostas inteligentes baseadas no estado emocional
- **Gamificação Balanceada**: Motivação sem pressão excessiva
- **Acessibilidade**: Foco em inclusive design
- **Performance**: Animações otimizadas e loading states
- **Modularidade**: Código limpo e reutilizável

### 🛡️ Segurança e Privacidade
- **Controle do Usuário**: Opções claras de privacidade
- **Dados Sensíveis**: Tratamento cuidadoso de informações de saúde
- **Transparência**: Comunicação clara sobre uso de IA
- **Compliance**: Preparado para regulamentações de saúde digital

## 📈 Métricas de Sucesso (Projetadas)
- Taxa de engajamento diário > 60%
- NPS > 70
- Taxa de retenção mensal > 80%
- Tempo médio de resposta da IA < 2 segundos
- Satisfação pós-sessão > 4.5/5

---

**Serenus** - Transformando cuidado emocional através da tecnologia 💙

*"Sua jornada de bem-estar emocional, guiada por IA e cuidado humano"*