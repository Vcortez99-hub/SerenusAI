# 🚀 Guia de Configuração da Integração WhatsApp

## 📋 Pré-requisitos

1. **Conta Meta for Developers**
   - Acesse: https://developers.facebook.com/
   - Crie uma conta ou faça login

2. **WhatsApp Business API**
   - Você precisará de um aplicativo Meta
   - Acesso à API do WhatsApp Business

---

## 🔧 Passo a Passo

### 1. Criar Aplicativo no Meta for Developers

1. Acesse o [Console de Desenvolvedores do Meta](https://developers.facebook.com/apps)
2. Clique em **"Criar Aplicativo"**
3. Selecione **"Negócios"** como tipo de aplicativo
4. Preencha as informações:
   - Nome do aplicativo: `EssentIA WhatsApp Integration`
   - Email de contato: seu email
   - Empresa: seu nome/empresa

### 2. Adicionar WhatsApp ao Aplicativo

1. No painel do aplicativo, procure por **"WhatsApp"**
2. Clique em **"Configurar"**
3. Selecione ou crie uma conta do WhatsApp Business

### 3. Obter Credenciais

#### 3.1 Token de Acesso (Access Token)

1. No painel do WhatsApp, vá para **"Configuração" > "API"**
2. Copie o **"Token de acesso temporário"** (válido por 24h)
3. Para produção, gere um **Token permanente**:
   - Vá em **"Ferramentas de Negócios"**
   - Configure um **"Token do Sistema"**

#### 3.2 Phone Number ID

1. Na aba **"API"**, você verá **"Número de telefone de teste"**
2. Copie o **Phone Number ID** (número longo começando com 1...)

#### 3.3 Webhook Verification Token

1. Crie um token personalizado (exemplo: `meu_token_secreto_12345`)
2. Guarde este token para configurar o webhook

### 4. Configurar Variáveis de Ambiente

Edite o arquivo `essentia-vite/server/.env` com as credenciais:

```env
# WhatsApp Business API Configuration
WA_PHONE_NUMBER_ID=seu_phone_number_id_aqui
CLOUD_API_ACCESS_TOKEN=seu_access_token_aqui
CLOUD_API_VERSION=v18.0
WEBHOOK_VERIFICATION_TOKEN=seu_token_personalizado_aqui

# Números autorizados (opcional, formato: 5511999999999)
AUTHORIZED_NUMBERS=5511999999999,5511888888888

# OpenAI para análise de sentimento
OPENAI_API_KEY=sua_openai_key_aqui
```

### 5. Expor Webhook Localmente (para desenvolvimento)

Para testar localmente, use **ngrok**:

```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta 3001
ngrok http 3001
```

Você receberá uma URL pública (ex: `https://abc123.ngrok.io`)

### 6. Configurar Webhook no Meta

1. No painel do WhatsApp, vá em **"Configuração" > "Webhook"**
2. Clique em **"Editar"**
3. Preencha:
   - **URL do callback**: `https://sua-url.ngrok.io/webhook`
   - **Token de verificação**: o mesmo que você colocou no `.env`
4. Clique em **"Verificar e salvar"**
5. Inscreva-se nos eventos:
   - `messages` ✓

### 7. Testar Integração

#### 7.1 Iniciar os Servidores

```bash
cd essentia-vite
npm start
```

Isso iniciará:
- ✅ Frontend em `http://localhost:5173`
- ✅ Backend em `http://localhost:3001`

#### 7.2 Verificar Health Check

Abra no navegador: `http://localhost:3001/health`

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2025-01-19T...",
  "uptime": 123.45
}
```

#### 7.3 Registrar Usuário

1. Acesse a aplicação: `http://localhost:5173`
2. Crie uma conta no onboarding
3. **Importante**: Forneça seu número de telefone (formato: +5511999999999)

#### 7.4 Vincular WhatsApp

1. Vá em **Configurações** (Settings)
2. Na seção **"Integração WhatsApp"**, ative a integração
3. Digite seu número e clique em **"Vincular"**

#### 7.5 Enviar Mensagem Teste

1. No painel do Meta, na aba **"API Setup"**
2. Há um número de teste para enviar mensagens
3. Adicione seu número na lista de destinatários de teste
4. Envie uma mensagem pelo WhatsApp para o número de teste
5. Verifique se a mensagem apareceu no seu Diário na aplicação!

---

## 🔐 Segurança

### Produção

Quando for para produção:

1. **Não exponha `.env`**: Adicione ao `.gitignore`
2. **Use HTTPS**: Configure certificado SSL
3. **Token permanente**: Substitua o token temporário
4. **Validação**: Ative verificação de assinaturas do webhook
5. **Rate limiting**: Implemente controle de taxa
6. **Monitore**: Configure logs e alertas

---

## 📞 Números Autorizados

Para segurança, você pode limitar quais números podem usar a integração:

No arquivo `server/.env`:
```env
AUTHORIZED_NUMBERS=5511999999999,5511888888888,5521987654321
```

**Formato**: Código do país + DDD + número (sem espaços ou caracteres especiais)

---

## 🐛 Troubleshooting

### Webhook não recebe mensagens

1. Verifique se o ngrok está rodando
2. Confirme se o webhook está configurado corretamente no Meta
3. Veja os logs do servidor: olhe o terminal do backend
4. Teste o endpoint: `curl http://localhost:3001/health`

### Usuário não autorizado

1. Verifique se o usuário está cadastrado
2. Confirme se o número está no formato correto
3. Veja os logs do backend para detalhes

### Erro de API do WhatsApp

1. Verifique se o token está correto
2. Confirme se o Phone Number ID está correto
3. Veja se o token não expirou (tokens temporários duram 24h)

---

## 📊 Monitoramento

### Logs do Backend

O servidor mostra logs detalhados:
- 📱 Mensagens recebidas
- 💾 Entradas salvas no diário
- ✅ Confirmações enviadas
- ❌ Erros e avisos

### Testar Envio de Mensagem

Use o endpoint de teste:

```bash
curl -X POST http://localhost:3001/test-whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999999999",
    "message": "Teste de integração!"
  }'
```

---

## ✨ Funcionalidades

### O que funciona agora:

✅ Receber mensagens pelo WhatsApp  
✅ Salvar automaticamente no diário  
✅ Análise de sentimento com OpenAI  
✅ Confirmação automática por mensagem  
✅ Sistema de usuários registrados  
✅ Integração frontend-backend  
✅ Sincronização em tempo real  

### Comandos disponíveis:

- **Qualquer texto**: Cria uma entrada no diário
- **"ajuda"**: Mostra mensagem de ajuda
- **"status"**: Mostra status da conta

---

## 📚 Recursos Adicionais

- [Documentação WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Guia Webhooks](https://developers.facebook.com/docs/whatsapp/webhooks)
- [ngrok Documentation](https://ngrok.com/docs)

---

## 🎉 Pronto!

Sua integração WhatsApp está configurada! 

Agora você pode escrever no seu diário enviando mensagens direto pelo WhatsApp. 📝✨
