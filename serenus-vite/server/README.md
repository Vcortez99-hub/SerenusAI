# EssentIA WhatsApp Integration Server

Servidor backend para integração do EssentIA com WhatsApp Business API, permitindo que usuários escrevam em seus diários através de mensagens do WhatsApp.

## 🚀 Funcionalidades

- ✅ Recebimento de webhooks do WhatsApp Business API
- ✅ Processamento automático de mensagens como entradas de diário
- ✅ Respostas automáticas de confirmação
- ✅ Mensagens de boas-vindas para novos usuários
- ✅ Sistema de ajuda integrado
- ✅ Validação de configuração automática

## 📋 Pré-requisitos

1. **Node.js** (versão 16 ou superior)
2. **Conta WhatsApp Business** configurada no Meta for Developers
3. **Ngrok** ou similar para túnel HTTPS (desenvolvimento)
4. **Certificado SSL válido** (produção)

## ⚙️ Configuração

### 1. Instalar Dependências

```bash
cd server
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Configurações do Servidor
PORT=3001

# WhatsApp Business API Configuration
WA_PHONE_NUMBER_ID=seu_phone_number_id_aqui
CLOUD_API_ACCESS_TOKEN=seu_access_token_aqui
CLOUD_API_VERSION=v18.0

# Webhook Configuration
WEBHOOK_VERIFICATION_TOKEN=seu_token_seguro_aqui
WEBHOOK_ENDPOINT=webhook
```

### 3. Obter Credenciais do WhatsApp Business API

1. Acesse [Meta for Developers](https://developers.facebook.com/)
2. Crie um novo app ou use um existente
3. Adicione o produto "WhatsApp Business Platform"
4. Obtenha:
   - **Phone Number ID**: Na seção "Getting Started"
   - **Access Token**: Token de acesso temporário ou permanente
   - **Webhook Verification Token**: Crie um token seguro personalizado

## 🔧 Desenvolvimento

### Executar em Modo de Desenvolvimento

```bash
npm run dev
```

### Configurar Túnel HTTPS com Ngrok

```bash
# Instalar ngrok globalmente
npm install -g ngrok

# Criar túnel para porta 3001
ngrok http 3001
```

Copie a URL HTTPS gerada (ex: `https://abc123.ngrok.io`) e configure no Meta for Developers:

- **Webhook URL**: `https://abc123.ngrok.io/webhook`
- **Verify Token**: O valor configurado em `WEBHOOK_VERIFICATION_TOKEN`

## 📱 Como Usar

### Para Usuários

1. **Primeira mensagem**: Envie qualquer texto para o número do WhatsApp Business
2. **Receba boas-vindas**: O sistema enviará instruções automáticas
3. **Escreva no diário**: Qualquer mensagem de texto será salva como entrada
4. **Receba confirmação**: Cada entrada gerará uma resposta de confirmação
5. **Obtenha ajuda**: Envie "ajuda" para ver comandos disponíveis

### Comandos Especiais

- `ajuda` - Mostra informações de uso
- `status` - Informações da conta (futuro)

## 🛠️ API Endpoints

### Webhook Endpoints

- `GET /webhook` - Verificação do webhook (Meta for Developers)
- `POST /webhook` - Recebimento de mensagens do WhatsApp

### Utilitários

- `GET /health` - Status do servidor
- `GET /api/diary-entries` - Listar entradas (futuro)

## 📊 Estrutura do Projeto

```
server/
├── index.js              # Servidor principal Express
├── whatsapp.js           # Serviço WhatsApp Business API
├── package.json          # Dependências e scripts
├── .env.example          # Exemplo de configuração
└── README.md            # Esta documentação
```

## 🔒 Segurança

- ✅ Verificação de token do webhook
- ✅ Validação de origem das mensagens
- ✅ HTTPS obrigatório para webhooks
- ✅ Variáveis de ambiente para credenciais
- ⚠️ TODO: Autenticação de usuários
- ⚠️ TODO: Rate limiting
- ⚠️ TODO: Criptografia de dados

## 🚀 Produção

### Deploy

1. Configure um servidor com HTTPS válido
2. Configure as variáveis de ambiente
3. Execute: `npm start`
4. Configure o webhook no Meta for Developers com a URL de produção

### Monitoramento

- Logs são exibidos no console
- TODO: Implementar logging estruturado
- TODO: Métricas e alertas

## 🐛 Troubleshooting

### Webhook não recebe mensagens

1. Verifique se o túnel HTTPS está ativo
2. Confirme a URL do webhook no Meta for Developers
3. Verifique os logs do servidor
4. Teste o endpoint `/health`

### Mensagens não são enviadas

1. Verifique o `CLOUD_API_ACCESS_TOKEN`
2. Confirme o `WA_PHONE_NUMBER_ID`
3. Verifique se o número está dentro da janela de 24h
4. Consulte os logs de erro

### Erro de configuração

1. Verifique se todas as variáveis do `.env` estão configuradas
2. Execute `npm run dev` e observe as mensagens de validação
3. Confirme as credenciais no Meta for Developers

## 📚 Próximos Passos

- [ ] Integração com banco de dados
- [ ] Sistema de autenticação de usuários
- [ ] Interface web para configuração
- [ ] Suporte a mídia (imagens, áudios)
- [ ] Análise de sentimentos
- [ ] Backup automático
- [ ] Métricas e analytics

## 🤝 Contribuição

Para contribuir com o projeto:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Teste localmente
5. Envie um Pull Request

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.