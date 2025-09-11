# 🔧 Guia de Configuração do Webhook WhatsApp

## ❌ Problema Identificado

O sistema Serenus está funcionando perfeitamente para mensagens de teste, mas **não está recebendo mensagens reais** enviadas do seu WhatsApp porque o webhook não está configurado no Meta for Developers.

## ✅ Solução: Configurar Webhook no Meta for Developers

### Pré-requisitos
- Conta Meta for Developers ativa
- App WhatsApp Business criado
- Servidor rodando em `http://localhost:3001`
- Túnel público (ngrok, localtunnel, etc.) para expor o servidor local

### Passo 1: Criar Túnel Público

Para que o Meta possa enviar webhooks para seu servidor local, você precisa de um túnel público:

#### Opção A: Usando ngrok (Recomendado)
```bash
# Instalar ngrok: https://ngrok.com/download
ngrok http 3001
```

#### Opção B: Usando localtunnel
```bash
npm install -g localtunnel
lt --port 3001
```

Após executar, você receberá uma URL pública como:
- `https://abc123.ngrok.io` (ngrok)
- `https://random-name.loca.lt` (localtunnel)

### Passo 2: Configurar Webhook no Meta for Developers

1. **Acesse o Meta for Developers**
   - Vá para: https://developers.facebook.com/
   - Faça login com sua conta
   - Selecione seu app WhatsApp Business

2. **Navegar para Webhooks**
   - No menu lateral, clique em **"WhatsApp" > "Configuration"**
   - Ou vá para **"Webhooks"** no menu principal

3. **Configurar o Webhook**
   - **Callback URL**: `https://sua-url-publica.ngrok.io/webhook`
     - Exemplo: `https://abc123.ngrok.io/webhook`
   - **Verify Token**: `serenus_webhook_token_2024` (mesmo do .env)
   - **Webhook Fields**: Marque **"messages"**

4. **Verificar e Salvar**
   - Clique em **"Verify and Save"**
   - O Meta enviará uma requisição de verificação para seu servidor
   - Se tudo estiver correto, aparecerá ✅ "Verified"

### Passo 3: Subscrever aos Eventos

1. **Na seção Webhooks**
   - Encontre seu **WhatsApp Business Account ID**
   - Clique em **"Subscribe"** ao lado de **"messages"**
   - Confirme a subscrição

### Passo 4: Testar Mensagens Reais

1. **Envie uma mensagem** do seu WhatsApp (5511942903819) para o número da API
2. **Verifique os logs** do servidor para confirmar o recebimento
3. **Confirme** se a mensagem foi salva no diário

## 🔍 Verificação de Funcionamento

### Logs Esperados no Servidor
```
🔄 Iniciando processamento da mensagem: {
  id: 'wamid.xxx',
  from: '5511942903819',
  type: 'text',
  content: 'Sua mensagem aqui'
}

✅ Mensagem processada com sucesso
💾 Nova entrada salva no diário
```

### Estrutura do Webhook Recebido
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "+55 11 94290-3819",
          "phone_number_id": "827949157064763"
        },
        "messages": [{
          "from": "5511942903819",
          "id": "wamid.xxx",
          "timestamp": "1234567890",
          "text": {
            "body": "Sua mensagem aqui"
          },
          "type": "text"
        }]
      },
      "field": "messages"
    }]
  }]
}
```

## 🚨 Problemas Comuns

### 1. Webhook não verifica
- ✅ Verifique se o servidor está rodando
- ✅ Confirme se a URL pública está acessível
- ✅ Verifique se o `WEBHOOK_VERIFICATION_TOKEN` no .env está correto

### 2. Mensagens não chegam
- ✅ Confirme se subscreveu ao campo "messages"
- ✅ Verifique se o número está autorizado no .env
- ✅ Confirme se o túnel público está ativo

### 3. Erro de autorização
- ✅ Verifique se seu número (5511942903819) está em `AUTHORIZED_NUMBERS`
- ✅ Confirme se o `CLOUD_API_ACCESS_TOKEN` está válido

## 📝 Próximos Passos

1. **Configure o túnel público** (ngrok ou localtunnel)
2. **Configure o webhook** no Meta for Developers
3. **Teste com mensagem real** do seu WhatsApp
4. **Verifique** se aparece no diário da aplicação

## 🔗 Links Úteis

- [Meta for Developers - Webhooks](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks/)
- [ngrok Download](https://ngrok.com/download)
- [WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api/)

---

**⚠️ Importante**: Mantenha o túnel público ativo enquanto estiver testando. Para produção, você precisará de um servidor com domínio próprio e certificado SSL.