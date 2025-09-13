# 🔧 Script de Configuração do Webhook WhatsApp
# Este script automatiza a configuração do túnel ngrok para o webhook

Write-Host "🚀 Configurando Webhook do WhatsApp para EssentIA" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Verificar se o servidor está rodando
$serverRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/webhook" -Method GET -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 405 -or $response.StatusCode -eq 403) {
        $serverRunning = $true
        Write-Host "✅ Servidor rodando na porta 3001" -ForegroundColor Green
    }
} catch {
    # Verificar se é erro 403 (Forbidden) - isso significa que o servidor está rodando
    if ($_.Exception.Response.StatusCode -eq 403) {
        $serverRunning = $true
        Write-Host "✅ Servidor rodando na porta 3001" -ForegroundColor Green
    } else {
        Write-Host "❌ Servidor não está rodando na porta 3001" -ForegroundColor Red
        Write-Host "   Execute 'npm start' no diretório do servidor primeiro" -ForegroundColor Yellow
        exit 1
    }
}

# Verificar se ngrok está instalado
$ngrokInstalled = $false
try {
    $ngrokVersion = ngrok version 2>$null
    if ($LASTEXITCODE -eq 0) {
        $ngrokInstalled = $true
        Write-Host "✅ ngrok encontrado" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ ngrok não encontrado" -ForegroundColor Red
}

if (-not $ngrokInstalled) {
    Write-Host "" 
    Write-Host "📥 Instalando ngrok..." -ForegroundColor Yellow
    Write-Host "   Opções de instalação:" -ForegroundColor White
    Write-Host "   1. Chocolatey: choco install ngrok" -ForegroundColor Cyan
    Write-Host "   2. Scoop: scoop install ngrok" -ForegroundColor Cyan
    Write-Host "   3. Download: https://ngrok.com/download" -ForegroundColor Cyan
    Write-Host ""
    
    $choice = Read-Host "Deseja tentar instalar via Chocolatey? (s/n)"
    if ($choice -eq 's' -or $choice -eq 'S') {
        try {
            choco install ngrok -y
            Write-Host "✅ ngrok instalado via Chocolatey" -ForegroundColor Green
            $ngrokInstalled = $true
        } catch {
            Write-Host "❌ Falha na instalação via Chocolatey" -ForegroundColor Red
            Write-Host "   Instale manualmente: https://ngrok.com/download" -ForegroundColor Yellow
            exit 1
        }
    } else {
        Write-Host "❌ ngrok é necessário para continuar" -ForegroundColor Red
        Write-Host "   Instale manualmente: https://ngrok.com/download" -ForegroundColor Yellow
        exit 1
    }
}

# Iniciar túnel ngrok
Write-Host "" 
Write-Host "🌐 Iniciando túnel ngrok..." -ForegroundColor Yellow
Write-Host "   Pressione Ctrl+C para parar o túnel" -ForegroundColor Gray
Write-Host ""

# Executar ngrok em background e capturar a URL
$ngrokProcess = Start-Process -FilePath "ngrok" -ArgumentList "http", "3001", "--log=stdout" -PassThru -WindowStyle Hidden -RedirectStandardOutput "ngrok-output.log"

# Aguardar ngrok inicializar
Start-Sleep -Seconds 3

# Tentar obter a URL pública do ngrok
$publicUrl = $null
$attempts = 0
while ($attempts -lt 10 -and $publicUrl -eq $null) {
    try {
        $ngrokApi = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction Stop
        if ($ngrokApi.tunnels.Count -gt 0) {
            $publicUrl = $ngrokApi.tunnels[0].public_url
            if ($publicUrl -like "http://*") {
                $publicUrl = $publicUrl -replace "http://", "https://"
            }
        }
    } catch {
        Start-Sleep -Seconds 1
        $attempts++
    }
}

if ($publicUrl) {
    Write-Host "🎉 Túnel ngrok ativo!" -ForegroundColor Green
    Write-Host "" 
    Write-Host "📋 INFORMAÇÕES PARA CONFIGURAÇÃO:" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "URL do Webhook: $publicUrl/webhook" -ForegroundColor White
    Write-Host "Verify Token: essentia_webhook_token_2024" -ForegroundColor White
    Write-Host "" 
    
    # Copiar URL para clipboard se possível
    try {
        "$publicUrl/webhook" | Set-Clipboard
        Write-Host "✅ URL copiada para a área de transferência!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Copie manualmente a URL acima" -ForegroundColor Yellow
    }
    
    Write-Host "" 
    Write-Host "🔧 PRÓXIMOS PASSOS:" -ForegroundColor Magenta
    Write-Host "==================" -ForegroundColor Magenta
    Write-Host "1. Acesse: https://developers.facebook.com/" -ForegroundColor White
    Write-Host "2. Vá para seu app WhatsApp > Configuration > Webhooks" -ForegroundColor White
    Write-Host "3. Cole a URL do webhook acima" -ForegroundColor White
    Write-Host "4. Use o verify token: essentia_webhook_token_2024" -ForegroundColor White
    Write-Host "5. Marque o campo 'messages'" -ForegroundColor White
    Write-Host "6. Clique em 'Verify and Save'" -ForegroundColor White
    Write-Host "7. Subscribe aos eventos 'messages'" -ForegroundColor White
    Write-Host "" 
    
    Write-Host "📱 TESTE:" -ForegroundColor Green
    Write-Host "========" -ForegroundColor Green
    Write-Host "Envie uma mensagem do seu WhatsApp (5511942903819)" -ForegroundColor White
    Write-Host "para o número da API e verifique se aparece no diário!" -ForegroundColor White
    Write-Host "" 
    
    Write-Host "⚠️  IMPORTANTE: Mantenha este terminal aberto!" -ForegroundColor Red
    Write-Host "   O túnel ngrok precisa ficar ativo para receber webhooks" -ForegroundColor Yellow
    Write-Host "" 
    
    # Monitorar logs do servidor
    Write-Host "📊 Monitorando logs do servidor..." -ForegroundColor Cyan
    Write-Host "   Pressione Ctrl+C para parar" -ForegroundColor Gray
    Write-Host "" 
    
    # Loop para manter o script ativo e mostrar status
    try {
        while ($true) {
            Start-Sleep -Seconds 5
            
            # Verificar se ngrok ainda está ativo
            if ($ngrokProcess.HasExited) {
                Write-Host "❌ Túnel ngrok foi encerrado!" -ForegroundColor Red
                break
            }
            
            # Mostrar status a cada 30 segundos
            $currentTime = Get-Date -Format "HH:mm:ss"
            Write-Host "[$currentTime] 🟢 Túnel ativo - Aguardando mensagens..." -ForegroundColor Green
        }
    } catch {
        Write-Host "" 
        Write-Host "🛑 Encerrando túnel ngrok..." -ForegroundColor Yellow
    } finally {
        # Limpar processo ngrok
        if (-not $ngrokProcess.HasExited) {
            $ngrokProcess.Kill()
        }
        
        # Limpar arquivo de log
        if (Test-Path "ngrok-output.log") {
            Remove-Item "ngrok-output.log" -Force
        }
        
        Write-Host "✅ Limpeza concluída" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Falha ao obter URL pública do ngrok" -ForegroundColor Red
    Write-Host "   Verifique se o ngrok está funcionando corretamente" -ForegroundColor Yellow
    
    # Limpar processo ngrok
    if ($ngrokProcess -and -not $ngrokProcess.HasExited) {
        $ngrokProcess.Kill()
    }
    
    exit 1
}