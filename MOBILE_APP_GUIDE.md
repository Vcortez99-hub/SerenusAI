# 📱 Guia Completo: Transformar Essentia em App Mobile Android

## ✅ O que já foi feito:

1. ✅ Capacitor instalado e configurado
2. ✅ Plugins nativos instalados (SplashScreen, StatusBar, App, Keyboard, Network)
3. ✅ Arquivo `capacitor.config.ts` criado
4. ✅ Build de produção gerado (`dist/`)

---

## ⚠️ Pré-requisito: Atualizar Node.js

O Capacitor CLI requer **Node.js 20 ou superior**. Você está usando v18.16.1.

### Instalar Node.js 20 LTS:

**Opção 1: Download direto**
1. Acesse: https://nodejs.org/
2. Baixe a versão **LTS (Long Term Support)** - atualmente v20.x
3. Instale e reinicie o terminal

**Opção 2: Usar NVM (Node Version Manager)**
```bash
# Instalar NVM para Windows: https://github.com/coreybutler/nvm-windows/releases
nvm install 20
nvm use 20
```

**Verificar instalação:**
```bash
node --version  # Deve mostrar v20.x.x
```

---

## 📱 Passo a Passo: Gerar App Android

### 1️⃣ Adicionar Plataforma Android

```bash
cd c:/Users/ebine/OneDrive/Documents/Essentia/serenus-vite
npx cap add android
```

Isso criará a pasta `android/` com o projeto nativo.

### 2️⃣ Sincronizar Assets e Plugins

```bash
npx cap sync android
```

Este comando:
- Copia os arquivos do `dist/` para o projeto Android
- Configura todos os plugins nativos
- Atualiza dependências

### 3️⃣ Abrir no Android Studio

```bash
npx cap open android
```

**Primeiro uso:**
- Android Studio irá baixar dependências do Gradle (pode demorar)
- Aguarde a sincronização completa
- Se aparecer erro de SDK, instale o Android SDK 34

---

## 🎨 Personalização: Ícones e Splash Screen

### Criar Ícones do App

1. **Gerar ícone 1024x1024px** com o logo da Essentia
2. Use o site: https://icon.kitchen/ ou https://appicon.co/
3. Baixe o pacote de ícones Android

**Substituir ícones manualmente:**
```
android/app/src/main/res/
├── mipmap-hdpi/ic_launcher.png (72x72)
├── mipmap-mdpi/ic_launcher.png (48x48)
├── mipmap-xhdpi/ic_launcher.png (96x96)
├── mipmap-xxhdpi/ic_launcher.png (144x144)
└── mipmap-xxxhdpi/ic_launcher.png (192x192)
```

### Criar Splash Screen

1. Crie uma imagem 1242x2688px (proporção 9:16)
2. Salve como `splash.png`
3. Coloque em: `android/app/src/main/res/drawable/splash.png`

---

## 🔧 Configurações do AndroidManifest.xml

Edite: `android/app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:label="Essentia"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <!-- Permissões necessárias -->
        <uses-permission android:name="android.permission.INTERNET" />
        <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
        <uses-permission android:name="android.permission.VIBRATE" />

        <!-- Activity principal -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

---

## 🏗️ Build do APK/AAB

### Build de Desenvolvimento (APK)

No Android Studio:
1. Menu: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Aguarde a conclusão
3. APK estará em: `android/app/build/outputs/apk/debug/app-debug.apk`

**Via Terminal:**
```bash
cd android
./gradlew assembleDebug
```

### Build de Produção (AAB para Play Store)

1. **Criar Keystore (certificado):**
```bash
keytool -genkey -v -keystore essentia-release.keystore -alias essentia -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configurar signing em `android/app/build.gradle`:**
```gradle
android {
    signingConfigs {
        release {
            storeFile file('../../essentia-release.keystore')
            storePassword 'SUA_SENHA'
            keyAlias 'essentia'
            keyPassword 'SUA_SENHA'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
        }
    }
}
```

3. **Gerar AAB:**
```bash
cd android
./gradlew bundleRelease
```

AAB estará em: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 📤 Publicar na Google Play Store

### 1. Criar Conta Google Play Developer
- Acesse: https://play.google.com/console
- Taxa única: **$25 USD**
- Preencha informações da conta

### 2. Criar Nova Aplicação
1. Click em "**Criar app**"
2. Preencha:
   - **Nome**: Essentia - Bem-Estar Corporativo
   - **Idioma**: Português (Brasil)
   - **App/Jogo**: App
   - **Gratuito/Pago**: Gratuito

### 3. Configurar Ficha da Loja

**Detalhes do App:**
- **Descrição curta** (80 chars):
  ```
  Plataforma de bem-estar mental e produtividade para empresas
  ```

- **Descrição completa** (4000 chars):
  ```
  🌟 Essentia - Transforme o Bem-Estar da Sua Empresa

  Essentia é a plataforma completa de bem-estar mental e produtividade corporativa.

  ✨ PRINCIPAIS RECURSOS:
  • Diário de Emoções com IA
  • Atividades de Mindfulness e Meditação
  • Dashboard Analítico para Gestores
  • Acompanhamento de Humor e Engajamento
  • Relatórios de ROI e Impacto

  💼 PARA EMPRESAS:
  • Redução de absenteísmo
  • Aumento de produtividade
  • Melhoria do clima organizacional
  • Identificação de departamentos em risco

  👥 PARA COLABORADORES:
  • Exercícios de respiração e meditação
  • Diário emocional privado
  • Atividades de gratidão e relaxamento
  • Conversas com IA especializada em bem-estar

  📊 ROI COMPROVADO:
  • +285% de retorno sobre investimento
  • -18.5% redução de absenteísmo
  • +12.3% aumento de produtividade
  • 74% de engajamento dos colaboradores

  🔒 PRIVACIDADE E SEGURANÇA:
  • Dados criptografados
  • Diários privados e confidenciais
  • Conformidade com LGPD

  Baixe agora e transforme o bem-estar da sua organização!
  ```

**Assets Gráficos:**
- **Ícone do App**: 512x512px (PNG, sem transparência)
- **Imagem de Destaque**: 1024x500px
- **Screenshots**:
  - Pelo menos 2 capturas de tela
  - Tamanho: 1080x1920px (16:9)
  - Mostrar: Dashboard, Diário, Atividades, Analytics

### 4. Classificação de Conteúdo
1. Preencha questionário
2. Selecione: **E (Livre para todos)**
3. Não contém: violência, sexo, linguagem inadequada

### 5. Público-Alvo e Conteúdo
- **Público-alvo**: Adultos (18+)
- **Categoria**: Saúde e Fitness
- **Tags**: bem-estar, saúde mental, produtividade, RH

### 6. Política de Privacidade
Crie uma página com a política em:
- **URL**: https://serenusai.onrender.com/privacy-policy

### 7. Fazer Upload do AAB
1. Vá em: **Produção > Criar nova versão**
2. Upload do arquivo `app-release.aab`
3. Preencha notas da versão:
   ```
   Versão 1.0.0 - Lançamento Inicial
   • Dashboard executivo com métricas SaaS e bem-estar
   • Diário emocional com IA
   • Atividades de mindfulness
   • Sistema de autenticação seguro
   • Gestão de empresas e departamentos
   ```

### 8. Revisar e Publicar
- Revise todas as informações
- Click em "**Enviar para análise**"
- Aguarde aprovação (1-7 dias)

---

## 🔄 Workflow de Desenvolvimento

### Fazer Alterações no Código

1. **Editar código React/TypeScript**
2. **Build:**
   ```bash
   npm run build
   ```

3. **Sincronizar com Android:**
   ```bash
   npx cap sync android
   ```

4. **Testar no Android Studio ou dispositivo**

### Atalhos Úteis

**Build + Sync completo:**
```bash
npm run build && npx cap sync android
```

**Abrir no Android Studio:**
```bash
npx cap open android
```

**Ver logs do app:**
```bash
npx cap run android --livereload --external
```

---

## 🐛 Debugging

### Testar em Dispositivo Real

1. **Habilitar modo desenvolvedor no Android:**
   - Configurações > Sobre o telefone
   - Toque 7x em "Número da versão"
   - Configurações > Opções do desenvolvedor
   - Ativar "Depuração USB"

2. **Conectar via USB e rodar:**
```bash
npx cap run android
```

### Ver Logs

**Chrome DevTools:**
1. No Chrome, acesse: `chrome://inspect`
2. Selecione o dispositivo/emulador
3. Click em "inspect"

**Android Studio:**
- Menu: View > Tool Windows > Logcat

---

## 🎯 Próximos Passos

1. ⬆️ **Atualizar Node.js para v20**
2. 🏗️ **Executar:** `npx cap add android`
3. 🎨 **Criar ícones e splash screen**
4. 📱 **Abrir no Android Studio:** `npx cap open android`
5. 🧪 **Testar em emulador/dispositivo**
6. 📦 **Gerar AAB de produção**
7. 🚀 **Publicar na Play Store**

---

## 📚 Recursos Úteis

- **Documentação Capacitor**: https://capacitorjs.com/docs
- **Guia Android**: https://capacitorjs.com/docs/android
- **Play Console**: https://play.google.com/console
- **Icon Kitchen**: https://icon.kitchen/
- **App Screenshots**: https://www.screely.com/

---

## 💡 Dicas Importantes

1. **Backend Production:**
   - Certifique-se que o backend está rodando em produção (Render)
   - Configure CORS para aceitar requisições do app mobile

2. **Versionamento:**
   - Incremente versão em `android/app/build.gradle`:
     ```gradle
     versionCode 1
     versionName "1.0.0"
     ```

3. **Performance:**
   - Ative ProGuard para minificar código
   - Use imagens otimizadas (WebP)
   - Implemente lazy loading

4. **Notificações Push (Futuro):**
   - Instalar: `@capacitor/push-notifications`
   - Configurar Firebase Cloud Messaging

5. **Atualizações OTA:**
   - Considere usar Capacitor Live Updates ou CodePush
   - Permite atualizar sem publicar nova versão na Store

---

## 🎉 Parabéns!

Você agora tem todo o conhecimento para transformar a Essentia em um app mobile Android profissional! 📱✨

**Tempo estimado do processo completo:** 4-8 horas (primeira vez)

**Custo total:**
- Google Play Developer: $25 USD (única vez)
- Grátis para desenvolvimento e testes

---

*Gerado por Claude Code - Essentia Mobile App Guide*
