import { useCallback, useState } from 'react'
import { logger, captureError } from '../utils/logger'

interface ErrorState {
  error: Error | null
  hasError: boolean
}

interface UseErrorHandlerReturn {
  error: Error | null
  hasError: boolean
  handleError: (error: Error, context?: string) => void
  clearError: () => void
  withErrorHandling: <T extends any[], R>(
    fn: (...args: T) => Promise<R>
  ) => (...args: T) => Promise<R | void>
}

/**
 * Hook personalizado para tratamento de erros
 * Útil para capturar erros assíncronos que não são capturados por Error Boundaries
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    hasError: false,
  })

  const handleError = useCallback((error: Error, context?: string) => {
    // Usar o sistema de logging centralizado
    captureError(error, context || 'useErrorHandler')
    
    setErrorState({
      error,
      hasError: true,
    })
  }, [])

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      hasError: false,
    })
  }, [])

  const withErrorHandling = useCallback(
    <T extends any[], R>(fn: (...args: T) => Promise<R>) => {
      return async (...args: T): Promise<R | void> => {
        try {
          return await fn(...args)
        } catch (error) {
          handleError(error instanceof Error ? error : new Error(String(error)))
        }
      }
    },
    [handleError]
  )

  return {
    error: errorState.error,
    hasError: errorState.hasError,
    handleError,
    clearError,
    withErrorHandling,
  }
}

/**
 * Hook para capturar erros não tratados globalmente
 */
export const useGlobalErrorHandler = () => {
  const setupGlobalHandlers = useCallback(() => {
    // Captura erros JavaScript não tratados
    const handleUnhandledError = (event: ErrorEvent) => {
      const error = new Error(event.message)
      error.stack = `${event.filename}:${event.lineno}:${event.colno}`
      captureError(error, 'Global Unhandled Error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    }

    // Captura promises rejeitadas não tratadas
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason))
      
      captureError(error, 'Global Unhandled Promise Rejection', {
        reason: event.reason,
      })
    }

    // Captura erros de recursos (imagens, scripts, etc.)
    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLElement
      const error = new Error(`Failed to load resource: ${target.tagName}`)
      
      captureError(error, 'Resource Load Error', {
        tagName: target.tagName,
        src: (target as any).src || (target as any).href,
        outerHTML: target.outerHTML,
      })
    }

    // Log de informações de performance
    const logPerformanceInfo = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        logger.info('Performance Info', {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
        })
      }
    }

    window.addEventListener('error', handleUnhandledError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleResourceError, true) // Capture phase for resource errors
    window.addEventListener('load', logPerformanceInfo)

    // Log inicial da sessão
    logger.info('Application Started', {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    })

    // Cleanup function
    return () => {
      window.removeEventListener('error', handleUnhandledError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleResourceError, true)
      window.removeEventListener('load', logPerformanceInfo)
    }
  }, [])

  return { setupGlobalHandlers }
}