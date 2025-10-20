# Status da Integração WhatsApp - EssentIA

## ⚠️ PROBLEMA IDENTIFICADO

A integração WhatsApp **não está funcional** devido à falta de informações corretas sobre a API BR DID.

---

## 🔍 Diagnóstico

### Erro encontrado:
```
getaddrinfo ENOTFOUND api.brdid.com.br
```

**Causa:** O domínio `api.brdid.com.br` não existe. Estou tentando conectar a uma URL genérica que não é a API real.

### Teste realizado:
```bash
curl -X POST http://localhost:3001/api/brdid/test-message \
  -H "Content-Type: application/json" \
  -d '{"to":"5511942903819","message":"Teste"}'
```

**Resultado:** Erro de DNS - domínio não encontrado.

---

## ✅ O que está configurado

1. **Token BR DID:** `dlNpS1QrbW5DSzZzbDJhK0g3QUx3QT09:5a05642031711b7cc2d83beb71a727d2fb074e3c72664263ed8384e99b69b45b`
2. **Código de integração:** Implementado e pronto
3. **Fluxos de mensagens:** Todos os 4 fluxos estão programados:
   - ✅ Mensagem de boas-vindas ao cadastrar
   - ✅ Lembretes agendados (9h, 15h, 21h)
   - ✅ Mensagens → Diário com IA
   - ✅ Comando "Quero conversar"

---

## ❌ O que está faltando

### Informações necessárias da BR DID:

1. **URL base da API**
   - Exemplo: `https://api.brdid.com/v1` ou `https://whatsapp.brdid.com.br`
   - Onde encontrar: Painel de administração BR DID ou documentação

2. **Endpoint de envio de mensagens**
   - Exemplo: `/messages/send` ou `/api/send-message`
   - Formato do payload esperado

3. **Formato de autenticação**
   - Confirmar se é `Bearer {token}` no header
   - Ou se usa outro formato (API Key, Basic Auth, etc.)

4. **Formato do payload**
   - Estrutura correta do JSON:
   ```json
   {
     "number": "5511999999999",
     "message": "texto"
   }
   ```
   - Ou outro formato específico da BR DID

---

## 🛠️ Como corrigir

### Opção 1: Obter informações da BR DID (RECOMENDADO)

1. **Acesse o painel BR DID** (onde você comprou o número)
2. **Procure por "API" ou "Integração"**
3. **Copie as seguintes informações:**
   - URL da API (ex: `https://api.brdid.com/v1`)
   - Endpoint de envio (ex: `/send-message`)
   - Exemplo de payload
   - Documentação da API

4. **Me forneça essas informações** para que eu possa atualizar o código

### Opção 2: Usar WhatsApp Business API da Meta

Se BR DID não fornecer uma API clara, podemos migrar para a WhatsApp Business API oficial:

**Vantagens:**
- Documentação completa e bem testada
- Mais estável e confiável
- Suporte oficial da Meta
- Amplamente usado no mercado

**Desvantagens:**
- Precisa de conta Business verificada
- Pode ter custos por mensagem
- Processo de aprovação de templates

---

## 📋 Checklist para correção

- [ ] Obter URL base da API BR DID
- [ ] Obter formato do endpoint de envio
- [ ] Obter exemplo de payload correto
- [ ] Confirmar formato de autenticação
- [ ] Atualizar `server/brdid-service.js` com URLs corretas
- [ ] Testar envio de mensagem com `POST /api/brdid/test-message`
- [ ] Validar recebimento no WhatsApp
- [ ] Testar fluxo completo de cadastro
- [ ] Configurar webhook para recebimento de mensagens

---

## 🧪 Endpoints de teste disponíveis

### 1. Testar configuração BR DID
```bash
GET http://localhost:3001/api/brdid/test
```

### 2. Testar envio de mensagem
```bash
POST http://localhost:3001/api/brdid/test-message
Body: {
  "to": "5511942903819",
  "message": "Mensagem de teste"
}
```

### 3. Enviar lembretes manualmente
```bash
POST http://localhost:3001/api/send-reminders
```

---

## 💡 Alternativas enquanto aguarda correção

### Usar simulação (desenvolvimento)

Podemos criar um "mock" da API BR DID que:
- Simula envio de mensagens (apenas logs, sem envio real)
- Permite testar todo o fluxo da aplicação
- Facilita o desenvolvimento sem depender da API real

Para ativar o modo de simulação:
```javascript
// Em server/.env, adicione:
BRDID_MOCK_MODE=true
```

### Usar WhatsApp Web (manual temporário)

Enquanto a API não funciona:
1. Configure lembretes no Google Calendar
2. Envie mensagens manualmente via WhatsApp Web
3. Use links do tipo `https://wa.me/5511942903819?text=Mensagem`

---

## 📚 Documentação de APIs WhatsApp conhecidas

### 1. WhatsApp Business API (Meta)
- **URL:** https://developers.facebook.com/docs/whatsapp
- **Endpoint:** `https://graph.facebook.com/v18.0/{phone-number-id}/messages`
- **Autenticação:** Bearer token
- **Formato:**
```json
{
  "messaging_product": "whatsapp",
  "to": "5511999999999",
  "type": "text",
  "text": {
    "body": "Mensagem"
  }
}
```

### 2. Twilio WhatsApp API
- **URL:** https://www.twilio.com/docs/whatsapp
- **Endpoint:** `https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json`
- **Autenticação:** Basic Auth
- **Formato:**
```json
{
  "From": "whatsapp:+14155238886",
  "To": "whatsapp:+5511999999999",
  "Body": "Mensagem"
}
```

### 3. Z-API (Brasil)
- **URL:** https://z-api.io
- **Endpoint:** `https://api.z-api.io/instances/{instance}/token/{token}/send-text`
- **Formato:**
```json
{
  "phone": "5511999999999",
  "message": "Mensagem"
}
```

---

## 🎯 Próximos passos

1. **URGENTE:** Obter informações corretas da API BR DID
2. Atualizar código com URLs corretas
3. Testar envio de mensagem
4. Validar recebimento no WhatsApp
5. Configurar webhook para mensagens recebidas
6. Testar todos os 4 fluxos

---

## 📞 Suporte

Se você tiver dificuldade para encontrar as informações da BR DID:

1. **Contate o suporte da BR DID**
   - Solicite documentação da API
   - Peça exemplos de integração
   - Pergunte sobre webhook para receber mensagens

2. **Alternativa:** Me forneça acesso ao painel BR DID (se possível)
   - Posso verificar as configurações diretamente
   - Identificar a URL correta da API

3. **Considere migrar para alternativa conhecida**
   - WhatsApp Business API (Meta)
   - Twilio
   - Z-API
   - Evolution API

---

**Status atual:** ⚠️ Aguardando informações da API BR DID para concluir integração

**Data:** 20/10/2025
**Última atualização:** 13:25 BRT
