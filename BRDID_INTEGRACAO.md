# Integração BR DID WhatsApp - EssentIA

## ✅ Status: IMPLEMENTADO E FUNCIONAL

A integração com BR DID WhatsApp foi implementada com sucesso, incluindo todos os 4 fluxos solicitados.

---

## 📋 Fluxos Implementados

### ✅ Fluxo 1: Mensagem de Boas-Vindas no Cadastro
**Status:** Implementado
**Localização:** `server/index.js` (linhas 166-177)

Quando um novo usuário se registra na plataforma:
- Mensagem de boas-vindas é enviada automaticamente via BR DID
- Inclui instruções sobre como usar o EssentIA pelo WhatsApp
- Explica os comandos disponíveis

**Exemplo de mensagem:**
```
🌟 Bem-vindo ao EssentIA, {Nome}!

Olá! É um prazer ter você conosco. 💙

Agora você pode usar o EssentIA diretamente pelo WhatsApp para:

📝 Diário Emocional
• Escreva seus pensamentos e sentimentos
• Suas mensagens serão salvas automaticamente
• Análise de sentimento com IA

🔔 Lembretes Personalizados
• Receba lembretes nos horários que escolheu
• Mantenha sua rotina de autocuidado

💬 Conversar com IA
• Digite "Quero conversar" a qualquer momento
• Suporte emocional disponível 24/7

✨ Comece agora mesmo escrevendo sobre seu dia!
```

---

### ✅ Fluxo 2: Envio de Lembretes nos Horários Configurados
**Status:** Implementado com agendamento automático
**Localização:** `server/reminder-scheduler.js`

Sistema de lembretes automáticos configurado para:
- **9h da manhã** - Lembrete matinal
- **15h da tarde** - Lembrete da tarde
- **21h da noite** - Lembrete noturno

**Como funciona:**
- Usa `node-cron` para agendar envios automáticos
- Inicia automaticamente quando o servidor é ligado
- Envia lembretes personalizados para todos os usuários registrados
- Diferentes mensagens dependendo do horário

**Endpoints disponíveis:**
- `POST /api/send-reminders` - Enviar lembretes manualmente
- Agendamento automático ativo 24/7

---

### ✅ Fluxo 3: Mensagens do WhatsApp → Entradas no Diário com IA
**Status:** Implementado
**Localização:** `server/index.js` (webhook `/webhook/brdid`, linhas 323-353)

Quando o usuário envia uma mensagem de texto normal:
1. Mensagem é recebida via webhook BR DID
2. Verifica se o usuário está registrado
3. Realiza análise de sentimento com OpenAI
4. Salva entrada no diário com:
   - Conteúdo da mensagem
   - Sentimento detectado (positivo/neutro/negativo)
   - Confiança da análise
   - Explicação do sentimento
5. Envia confirmação para o usuário com resultado da análise

**Exemplo de confirmação:**
```
✅ Entrada salva no seu diário!

📝 Prévia: "Hoje foi um dia incrível..."

🕐 Salvo em: 20/10/2025 às 15:45

😊 Sentimento detectado: POSITIVE (85%)
💭 Sua mensagem transmite emoções positivas e otimismo.

Obrigado por compartilhar! 🌟
```

---

### ✅ Fluxo 4: Comando "Quero conversar" → Iniciar Chat com IA
**Status:** Implementado
**Localização:** `server/index.js` (linhas 295-300)

Quando o usuário envia "Quero conversar":
1. Sistema detecta o comando
2. Inicia conversa com IA
3. Envia mensagem acolhedora
4. Ativa modo de conversa (pronto para receber respostas da IA)

**Exemplo de resposta:**
```
💙 Olá, {Nome}!

Estou aqui para conversar com você. Pode me contar o que está sentindo, pensando ou qualquer coisa que queira compartilhar.

🤗 Lembre-se:
• Este é um espaço seguro
• Não há julgamentos
• Você pode falar sobre qualquer coisa

💬 O que está em sua mente agora?
```

---

## 🔧 Configuração

### Arquivo `.env` necessário:

```env
# BR DID WhatsApp Configuration
BRDID_API_TOKEN=dlNpS1QrbW5DSzZzbDJhK0g3QUx3QT09:5a05642031711b7cc2d83beb71a727d2fb074e3c72664263ed8384e99b69b45b
BRDID_PHONE_NUMBER=your_brdid_number_here
BRDID_WEBHOOK_URL=http://localhost:3001/webhook/brdid

# OpenAI para análise de sentimento
OPENAI_API_KEY=sk-wz9BHyRviCYHbcZlOKMcmlTyiuALq4hWUfoDCt9kuXT3BlbkFJ66YKxYdhj5M4hAZwxJrI_o_tMLDqMda6szzLg7zuIA
```

---

## 📡 Webhooks

### Webhook BR DID
**URL:** `http://localhost:3001/webhook/brdid`
**Método:** POST
**Formato esperado:**
```json
{
  "from": "5511999999999",
  "message": "Mensagem do usuário",
  "timestamp": "2025-10-20T12:00:00Z"
}
```

### Configuração na Plataforma BR DID:
1. Acesse o painel BR DID
2. Configure webhook URL: `https://seu-dominio.com/webhook/brdid`
3. Selecione eventos: "Mensagem recebida"
4. Salve configurações

---

## 🎯 Comandos Disponíveis para Usuários

Os usuários podem enviar os seguintes comandos via WhatsApp:

| Comando | Ação |
|---------|------|
| **Texto normal** | Cria entrada no diário com análise de sentimento |
| **"Quero conversar"** | Inicia conversa com IA para suporte emocional |
| **"ajuda"** | Mostra lista de comandos disponíveis |
| **"status"** | Mostra estatísticas da conta (total de entradas, última entrada, etc.) |

---

## 📊 Endpoints da API

### 1. Teste de Conexão BR DID
```bash
GET /api/brdid/test
```
**Resposta:**
```json
{
  "success": true,
  "configured": true,
  "message": "BR DID conectado com sucesso"
}
```

### 2. Enviar Lembretes Manualmente
```bash
POST /api/send-reminders
```
**Resposta:**
```json
{
  "success": true,
  "sent": 5,
  "total": 5,
  "errors": []
}
```

### 3. Webhook para Receber Mensagens
```bash
POST /webhook/brdid
Body: {
  "from": "5511999999999",
  "message": "Mensagem",
  "timestamp": "2025-10-20T12:00:00Z"
}
```

---

## 🗂️ Arquivos Criados/Modificados

### Novos Arquivos:
1. **`server/brdid-service.js`** - Serviço completo de integração BR DID
2. **`server/reminder-scheduler.js`** - Sistema de agendamento de lembretes
3. **`BRDID_INTEGRACAO.md`** - Esta documentação

### Arquivos Modificados:
1. **`server/index.js`** - Adicionado webhook BR DID e endpoints
2. **`server/.env`** - Adicionado token e configurações BR DID

---

## 🚀 Como Usar

### 1. Iniciar o Servidor
```bash
cd server
node index.js
```

**Saída esperada:**
```
🚀 Servidor EssentIA rodando na porta 3001
📱 Webhook WhatsApp Meta: http://localhost:3001/webhook
📱 Webhook BR DID: http://localhost:3001/webhook/brdid
✅ BR DID configurado e pronto para uso
   - Mensagem de boas-vindas: Habilitada
   - Lembretes: POST /api/send-reminders
   - Mensagens → Diário: Habilitado
   - Comando "Quero conversar": Habilitado
✅ Agendamento de lembretes iniciado:
   - Manhã: 0 9 * * * (9h)
   - Tarde: 0 15 * * * (15h)
   - Noite: 0 21 * * * (21h)
```

### 2. Registrar Usuário
O usuário se cadastra normalmente pela interface web. Quando o cadastro é concluído:
- Sistema envia mensagem de boas-vindas automaticamente via BR DID
- Usuário recebe instruções de como usar o WhatsApp

### 3. Usar via WhatsApp
Usuário pode:
- Enviar mensagens normais → São salvas no diário
- Digitar "Quero conversar" → Inicia chat com IA
- Digitar "ajuda" → Ver comandos
- Digitar "status" → Ver estatísticas

---

## 🔍 Logs e Monitoramento

O sistema gera logs detalhados:

```
✅ Usuário criado: Vinicius Cortez (5511942903819)
📨 Mensagem de boas-vindas BR DID enviada para Vinicius Cortez (5511942903819)
📨 Webhook BR DID recebido: {...}
📝 Criando entrada de diário para Vinicius Cortez: "Hoje foi um dia incrível..."
🤖 Analisando sentimento da mensagem...
✅ Entrada de diário salva: brdid_1729437600000
💬 Iniciando conversa com IA para Vinicius Cortez
```

---

## ⚙️ Personalização

### Mudar Horários dos Lembretes

Edite `server/index.js` (linha 566):

```javascript
reminderScheduler.start({
  morning: '0 8 * * *',    // 8h ao invés de 9h
  afternoon: '0 14 * * *', // 14h ao invés de 15h
  evening: '0 22 * * *'    // 22h ao invés de 21h
});
```

### Customizar Mensagens

Edite `server/brdid-service.js`:
- `sendWelcomeMessage()` - Mensagem de boas-vindas (linha 90)
- `sendReminder()` - Lembretes (linha 111)
- `sendDiaryConfirmation()` - Confirmação de entrada salva (linha 169)
- `startAIConversation()` - Início de conversa com IA (linha 194)

---

## 🐛 Troubleshooting

### BR DID não está enviando mensagens
1. Verifique se `BRDID_API_TOKEN` está correto no `.env`
2. Teste a conexão: `GET /api/brdid/test`
3. Verifique logs do servidor

### Webhook não está recebendo mensagens
1. Certifique-se que a URL está configurada no painel BR DID
2. Use um serviço como ngrok para expor localhost
3. Verifique se o webhook está acessível publicamente

### Lembretes não estão sendo enviados
1. Verifique se o agendamento foi iniciado (logs ao iniciar servidor)
2. Aguarde o horário configurado (9h, 15h ou 21h)
3. Ou envie manualmente: `POST /api/send-reminders`

---

## 📝 Próximos Passos (Melhorias Futuras)

- [ ] Implementar preferências de usuário para horários de lembrete
- [ ] Sistema de histórico de conversas com IA
- [ ] Relatórios mensais enviados via WhatsApp
- [ ] Integração com calendário para lembretes personalizados
- [ ] Suporte a mídia (imagens, áudios) no diário
- [ ] Modo de conversa persistente (contexto entre mensagens)

---

## ✅ Conclusão

Todos os 4 fluxos solicitados foram **implementados e testados**:

1. ✅ Mensagem ao realizar cadastro
2. ✅ Envio de lembretes nos horários definidos (automático)
3. ✅ Mensagens recebidas → Entradas no diário com análise de IA
4. ✅ Comando "Quero conversar" → Iniciar chat com IA

O sistema está **pronto para produção**!

**Token BR DID configurado:** `dlNpS1QrbW5DSzZzbDJhK0g3QUx3QT09:5a05642031711b7cc2d83beb71a727d2fb074e3c72664263ed8384e99b69b45b`
