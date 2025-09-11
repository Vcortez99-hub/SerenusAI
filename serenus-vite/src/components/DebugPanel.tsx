import React, { useState, useEffect } from 'react'
import { logger, LogLevel, LogEntry } from '../utils/logger'

interface DebugPanelProps {
  isVisible?: boolean
  onToggle?: () => void
}

const DebugPanel: React.FC<DebugPanelProps> = ({ isVisible = false, onToggle }) => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [selectedLevel, setSelectedLevel] = useState<LogLevel>(LogLevel.DEBUG)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(logger.getLogs(selectedLevel))
    }, 1000)

    return () => clearInterval(interval)
  }, [selectedLevel])

  const clearLogs = () => {
    logger.clearLogs()
    setLogs([])
  }

  const exportLogs = () => {
    const dataStr = logger.exportLogs()
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `logs-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const getLogLevelColor = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.DEBUG: return 'text-gray-600'
      case LogLevel.INFO: return 'text-blue-600'
      case LogLevel.WARN: return 'text-yellow-600'
      case LogLevel.ERROR: return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getLogLevelBg = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.DEBUG: return 'bg-gray-100'
      case LogLevel.INFO: return 'bg-blue-100'
      case LogLevel.WARN: return 'bg-yellow-100'
      case LogLevel.ERROR: return 'bg-red-100'
      default: return 'bg-gray-100'
    }
  }

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 z-50"
        title="Abrir Debug Panel"
      >
        🐛
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl z-50 max-w-2xl">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Debug Panel</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-800"
            title={isExpanded ? 'Minimizar' : 'Expandir'}
          >
            {isExpanded ? '📉' : '📈'}
          </button>
          <button
            onClick={onToggle}
            className="text-gray-600 hover:text-gray-800"
            title="Fechar"
          >
            ✕
          </button>
        </div>
      </div>

      <div className={`${isExpanded ? 'h-96' : 'h-48'} flex flex-col`}>
        <div className="flex items-center justify-between p-2 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Nível:</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(Number(e.target.value) as LogLevel)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value={LogLevel.DEBUG}>DEBUG</option>
              <option value={LogLevel.INFO}>INFO</option>
              <option value={LogLevel.WARN}>WARN</option>
              <option value={LogLevel.ERROR}>ERROR</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{logs.length} logs</span>
            <button
              onClick={exportLogs}
              className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              title="Exportar logs"
            >
              📥
            </button>
            <button
              onClick={clearLogs}
              className="text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              title="Limpar logs"
            >
              🗑️
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {logs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Nenhum log encontrado
            </div>
          ) : (
            logs.slice(-50).reverse().map((log, index) => (
              <div
                key={index}
                className={`text-xs p-2 rounded border-l-4 ${getLogLevelBg(log.level)} border-l-current ${getLogLevelColor(log.level)}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    [{LogLevel[log.level]}] {log.message}
                  </span>
                  <span className="text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                {log.data && (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                      Dados
                    </summary>
                    <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-20">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  </details>
                )}
                
                {log.stack && (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                      Stack Trace
                    </summary>
                    <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-20">
                      {log.stack}
                    </pre>
                  </details>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default DebugPanel