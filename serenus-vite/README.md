# Serenus AI - Assistente de Bem-estar Emocional

Uma aplicação React moderna para suporte emocional com integração OpenAI.

## 🚀 Funcionalidades

- **Chat com IA Especializada**: Conversas com agente especializado em saúde mental e bem-estar emocional
- **Dashboard Interativo**: Acompanhamento do humor e progresso pessoal
- **Exercícios de Bem-estar**: Técnicas de respiração, meditação e mindfulness
- **Design Responsivo**: Interface otimizada para desktop e mobile
- **Animações Suaves**: Experiência visual agradável sem sobrecarga mental

## 🛠️ Tecnologias

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Framer Motion (animações)
- Lucide React (ícones)
- OpenAI GPT-4o-mini

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Vcortez99-hub/SerenusAI.git
cd SerenusAI/serenus-vite
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Adicione sua API key da OpenAI no arquivo `.env`:
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

5. Execute o projeto:
```bash
npm run dev
```

## 🤖 Configuração da OpenAI

### Obtendo sua API Key

1. Acesse [platform.openai.com](https://platform.openai.com)
2. Faça login ou crie uma conta
3. Vá para API Keys e gere uma nova chave
4. Adicione créditos à sua conta (o GPT-4o-mini é muito econômico)

### Modelo Utilizado

- **GPT-4o-mini**: Modelo mais econômico da OpenAI, otimizado para conversas
- **Custo aproximado**: ~$0.15 por 1 milhão de tokens de entrada
- **Ideal para**: Aplicações de chat com boa qualidade e baixo custo

### Prompt Especializado

O agente possui um prompt detalhado com:
- Diretrizes de segurança (detecção de crises)
- Técnicas baseadas em evidências científicas
- Abordagem empática e acolhedora
- Recursos de emergência do Brasil (CVV 188, CAPS, etc.)
- Limitações éticas claras

## 🎨 Melhorias no Design

### Elementos Visuais
- Gradientes suaves e cores calmantes
- Ícones e emojis contextuais
- Animações micro-interativas
- Feedback visual em tempo real

### UX Aprimorada
- Sugestões rápidas com ícones coloridos
- Indicador de digitação personalizado
- Estados de hover e transições suaves
- Responsividade completa

### Funcionalidades de Bem-estar
- Rastreamento de humor com escala visual
- Exercícios guiados de respiração
- Diário digital com tags
- Sistema de conquistas

## 🔧 Scripts Disponíveis

```bash
npm run dev        # Servidor de desenvolvimento
npm run build      # Build para produção
npm run preview    # Preview do build
npm run lint       # Verificação de código
```

## 🌟 Funcionalidades Principais

### Chat Inteligente
- Integração com OpenAI GPT-4o-mini
- Respostas especializadas em saúde mental
- Fallback para respostas offline
- Histórico de conversa mantido

### Dashboard Personalizado
- Acompanhamento de humor diário
- Estatísticas de progresso
- Exercícios personalizados
- Conquistas desbloqueáveis

### Segurança e Privacidade
- Dados armazenados localmente
- Detecção de situações de crise
- Orientações para busca de ajuda profissional
- Compliance com boas práticas de saúde mental

## 📱 Uso da Aplicação

1. **Login**: Use qualquer nome para entrar no sistema
2. **Dashboard**: Acompanhe seu humor e progresso
3. **Chat**: Converse com a Serenus AI sobre seus sentimentos
4. **Diário**: Registre suas experiências e reflexões

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Add nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📋 Roadmap

- [ ] Integração com APIs de saúde
- [ ] Sistema de lembretes
- [ ] Modo offline completo
- [ ] Sincronização com múltiplos dispositivos
- [ ] Relatórios de progresso em PDF

## 🆘 Recursos de Emergência

- **CVV**: 188 (24h, gratuito)
- **CAPS**: Centro de Atenção Psicossocial (busque na sua cidade)
- **SAMU**: 192
- **Bombeiros**: 193

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**Importante**: Esta aplicação oferece suporte emocional complementar e não substitui acompanhamento profissional especializado. Em caso de crise ou ideação suicida, procure ajuda imediatamente.