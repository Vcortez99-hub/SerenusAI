# Configuração Evolution API - EssentIA

## ⚠️ IMPORTANTE

Você tem um número WhatsApp ativo da **BR DID** e o token fornecido é da **Evolution API**.

**BR DID** é um provedor de **números DID** (telefone virtual).
**Evolution API** é a plataforma que envia/recebe mensagens WhatsApp.

---

## 🔍 O que você tem

**Token Evolution API:**
`dlNpS1QrbW5DSzZzbDJhK0g3QUx3QT09:5a05642031711b7cc2d83beb71a727d2fb074e3c72664263ed8384e99b69b45b`

---

## ✅ O que falta configurar

### 1. URL do servidor Evolution API

Você precisa descobrir **onde está hospedada** a Evolution API que está usando.

**Possíveis cenários:**

#### Cenário A: Você contratou um serviço gerenciado
Se você contratou Evolution API de um provedor (como EvoAPI Cloud, WhatsGW, etc.), eles forneceram uma URL tipo:
- `https://api.evocloud.com.br`
- `https://whatsapp.seudominio.com.br`
- `https://evo-1234.provider.com`

**Como descobrir:**
- Verifique o email de confirmação do serviço
- Acesse o painel de controle do provedor
- Entre em contato com o suporte

#### Cenário B: Você instalou Evolution API no seu próprio servidor
Se você instalou Evolution API em uma VPS/servidor próprio:
- A URL é o domínio ou IP do seu servidor
- Exemplo: `https://evo.seudominio.com.br` ou `http://SEU_IP:8080`

### 2. Nome da instância

A Evolution API trabalha com "instâncias" (cada uma conecta um número WhatsApp).

Você precisa saber o **nome da instância** que foi criada com seu número BR DID.

**Nome comum de instâncias:**
- `essentia`
- `whatsapp`
- `main`
- `production`
- Ou personalizado (ex: `essentia-5511942903819`)

**Como descobrir:**
- Acesse o painel Evolution API
- Use o endpoint: `GET {URL_API}/instance/fetchInstances` com seu token
- Entre em contato com quem configurou

---

## 📝 Como configurar no EssentIA

### Passo 1: Editar o arquivo `.env`

Abra o arquivo `server/.env` e adicione:

```env
# Evolution API Configuration
EVOLUTION_API_URL=https://SEU-SERVIDOR-EVOLUTION.com.br
EVOLUTION_INSTANCE_NAME=nome-da-sua-instancia

# Token já configurado
BRDID_API_TOKEN=dlNpS1QrbW5DSzZzbDJhK0g3QUx3QT09:5a05642031711b7cc2d83beb71a727d2fb074e3c72664263ed8384e99b69b45b
```

**Exemplo real:**
```env
EVOLUTION_API_URL=https://api.evocloud.com.br
EVOLUTION_INSTANCE_NAME=essentia
BRDID_API_TOKEN=dlNpS1QrbW5DSzZzbDJhK0g3QUx3QT09:5a05642031711b7cc2d83beb71a727d2fb074e3c72664263ed8384e99b69b45b
```

### Passo 2: Reiniciar o servidor

```bash
cd server
node index.js
```

### Passo 3: Testar a conexão

```bash
curl http://localhost:3001/api/brdid/test
```

**Resposta esperada:**
```json
{
  "success": true,
  "configured": true,
  "message": "Evolution API conectada com sucesso"
}
```

### Passo 4: Testar envio de mensagem

```bash
curl -X POST http://localhost:3001/api/brdid/test-message \
  -H "Content-Type: application/json" \
  -d '{"to":"5511942903819","message":"Teste EssentIA 🌟"}'
```

**Se funcionar:** Você receberá a mensagem no WhatsApp! 🎉

---

## 🔍 Como descobrir suas configurações

### Método 1: Testar endpoints Evolution API

Se você tem o token mas não sabe a URL, teste URLs comuns:

```bash
# Teste 1: EvoAPI Cloud
curl -X GET "https://api.evocloud.com.br/instance/fetchInstances" \
  -H "apikey: dlNpS1QrbW5DSzZzbDJhK0g3QUx3QT09:5a05642031711b7cc2d83beb71a727d2fb074e3c72664263ed8384e99b69b45b"

# Teste 2: Localhost (se instalou localmente)
curl -X GET "http://localhost:8080/instance/fetchInstances" \
  -H "apikey: dlNpS1QrbW5DSzZzbDJhK0g3QUx3QT09:5a05642031711b7cc2d83beb71a727d2fb074e3c72664263ed8384e99b69b45b"

# Teste 3: Outras URLs comuns
curl -X GET "https://evo.seudominio.com.br/instance/fetchInstances" \
  -H "apikey: dlNpS1QrbW5DSzZzbDJhK0g3QUx3QT09:5a05642031711b7cc2d83beb71a727d2fb074e3c72664263ed8384e99b69b45b"
```

**Se algum funcionar:** A URL que retornou dados é a correta!

### Método 2: Verificar documentos/emails

- Procure por emails de confirmação do serviço Evolution API
- Verifique contratos ou documentação recebida
- Procure por URLs em mensagens do suporte

### Método 3: Contatar o provedor

Se você contratou Evolution API de alguém:
- Entre em contato com o suporte
- Solicite: "URL da API" e "Nome da instância"
- Eles devem fornecer imediatamente

---

## 📊 Status atual

✅ **Token configurado**
❌ **URL da API - FALTANDO**
❌ **Nome da instância - FALTANDO**

---

## 🎯 Próximos passos

1. **URGENTE:** Descobrir URL do servidor Evolution API
2. **URGENTE:** Descobrir nome da instância
3. Adicionar ao `.env`
4. Reiniciar servidor
5. Testar envio de mensagem
6. Validar todos os 4 fluxos

---

## 💡 Alternativas

### Se não conseguir descobrir as configurações:

**Opção 1: Instalar Evolution API própria**
- Instalar Evolution API em um servidor próprio
- Conectar seu número BR DID
- Controle total sobre a integração

**Opção 2: Migrar para serviço conhecido**
- Z-API (brasileiro, bem documentado)
- Twilio (internacional, muito confiável)
- WhatsApp Business API oficial

---

## 📞 Ajuda

**Me forneça:**
1. URL do servidor Evolution API
2. Nome da instância

**Ou:**
- Acesso ao painel Evolution API (se possível)
- Documentação recebida do provedor
- Nome do provedor que você contratou

Assim que tiver essas informações, a integração ficará funcional em **menos de 5 minutos**! 🚀

---

**Última atualização:** 20/10/2025 13:45 BRT
**Status:** Aguardando URL e nome da instância
