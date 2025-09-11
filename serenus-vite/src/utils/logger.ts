export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: any
  stack?: string
  userAgent?: string
  url?: string
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000
  private minLevel: LogLevel

  constructor() {
    this.minLevel = process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO
  }

  private createLogEntry(level: LogLevel, message: string, data?: any, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      stack: error?.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
    }
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry)
    
    // Manter apenas os últimos maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Log no console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(entry)
    }
  }

  private logToConsole(entry: LogEntry) {
    const { timestamp, level, message, data, stack } = entry
    const formattedMessage = `[${timestamp}] ${LogLevel[level]}: ${message}`

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, data)
        break
      case LogLevel.INFO:
        console.info(formattedMessage, data)
        break
      case LogLevel.WARN:
        console.warn(formattedMessage, data)
        break
      case LogLevel.ERROR:
        console.error(formattedMessage, data)
        if (stack) console.error(stack)
        break
    }
  }

  debug(message: string, data?: any) {
    if (this.minLevel <= LogLevel.DEBUG) {
      this.addLog(this.createLogEntry(LogLevel.DEBUG, message, data))
    }
  }

  info(message: string, data?: any) {
    if (this.minLevel <= LogLevel.INFO) {
      this.addLog(this.createLogEntry(LogLevel.INFO, message, data))
    }
  }

  warn(message: string, data?: any) {
    if (this.minLevel <= LogLevel.WARN) {
      this.addLog(this.createLogEntry(LogLevel.WARN, message, data))
    }
  }

  error(message: string, error?: Error, data?: any) {
    if (this.minLevel <= LogLevel.ERROR) {
      this.addLog(this.createLogEntry(LogLevel.ERROR, message, data, error))
    }

    // Em produção, enviar para serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService({
        message,
        error: error?.message,
        stack: error?.stack,
        data,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      })
    }
  }

  private async sendToMonitoringService(errorData: any) {
    try {
      // Exemplo de integração com serviço de monitoramento
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData)
      // })
      
      // Por enquanto, apenas armazenar localmente
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]')
      errors.push(errorData)
      
      // Manter apenas os últimos 50 erros
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50)
      }
      
      localStorage.setItem('app_errors', JSON.stringify(errors))
    } catch (e) {
      console.error('Falha ao enviar erro para serviço de monitoramento:', e)
    }
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level)
    }
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  // Método para capturar informações do contexto da aplicação
  captureContext(): any {
    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      memory: (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit,
      } : undefined,
    }
  }
}

// Instância singleton do logger
export const logger = new Logger()

// Função utilitária para capturar erros de forma consistente
export const captureError = (error: Error, context?: string, additionalData?: any) => {
  logger.error(
    context ? `${context}: ${error.message}` : error.message,
    error,
    {
      ...additionalData,
      context: logger.captureContext(),
    }
  )
}

// Função para capturar erros de API
export const captureApiError = (error: any, endpoint: string, method: string) => {
  const errorMessage = error?.response?.data?.message || error?.message || 'Erro desconhecido na API'
  
  logger.error(`API Error [${method}] ${endpoint}`, error, {
    endpoint,
    method,
    status: error?.response?.status,
    statusText: error?.response?.statusText,
    responseData: error?.response?.data,
  })
}