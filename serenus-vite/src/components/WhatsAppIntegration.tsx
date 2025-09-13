import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface WhatsAppConfig {
  isEnabled: boolean;
  phoneNumber: string;
  isLinked: boolean;
  lastSync: string | null;
}

const WhatsAppIntegration: React.FC = () => {
  const [config, setConfig] = useState<WhatsAppConfig>({
    isEnabled: false,
    phoneNumber: '',
    isLinked: false,
    lastSync: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');

  useEffect(() => {
    // Carregar configuração salva do localStorage
    const savedConfig = localStorage.getItem('whatsapp-config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const saveConfig = (newConfig: WhatsAppConfig) => {
    setConfig(newConfig);
    localStorage.setItem('whatsapp-config', JSON.stringify(newConfig));
  };

  const handleToggleIntegration = () => {
    const newConfig = { ...config, isEnabled: !config.isEnabled };
    saveConfig(newConfig);
  };

  const handleLinkPhone = async () => {
    if (!phoneInput.trim()) return;
    
    setIsLoading(true);
    try {
      // Simular processo de vinculação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newConfig = {
        ...config,
        phoneNumber: phoneInput,
        isLinked: true,
        lastSync: new Date().toISOString()
      };
      
      saveConfig(newConfig);
      setPhoneInput('');
      
      // TODO: Implementar chamada real para API
      console.log('Número vinculado:', phoneInput);
    } catch (error) {
      console.error('Erro ao vincular número:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlinkPhone = () => {
    const newConfig = {
      ...config,
      phoneNumber: '',
      isLinked: false,
      lastSync: null
    };
    saveConfig(newConfig);
  };

  const formatPhoneNumber = (phone: string) => {
    // Formatar número para exibição (ex: +55 11 99999-9999)
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 13) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
    }
    return phone;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Integração WhatsApp
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Escreva no seu diário através do WhatsApp
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {config.isEnabled ? 'Ativo' : 'Inativo'}
          </span>
          <button
            onClick={handleToggleIntegration}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.isEnabled ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {config.isEnabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-6"
        >
          {/* Status da Conexão */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  config.isLinked ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span className="font-medium text-gray-900 dark:text-white">
                  {config.isLinked ? 'Conectado' : 'Aguardando Conexão'}
                </span>
              </div>
              
              {config.isLinked && config.lastSync && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Última sincronização: {new Date(config.lastSync).toLocaleString('pt-BR')}
                </span>
              )}
            </div>
            
            {config.isLinked && config.phoneNumber && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Número: {formatPhoneNumber(config.phoneNumber)}
                </span>
                <button
                  onClick={handleUnlinkPhone}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  Desvincular
                </button>
              </div>
            )}
          </div>

          {/* Vincular Número */}
          {!config.isLinked && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número do WhatsApp
                </label>
                <div className="flex space-x-3">
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+55 11 99999-9999"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={handleLinkPhone}
                    disabled={isLoading || !phoneInput.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Vincular</span>
                    )}
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center space-x-1"
              >
                <span>Como configurar?</span>
                <svg className={`w-4 h-4 transform transition-transform ${
                  showInstructions ? 'rotate-180' : ''
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}

          {/* Instruções */}
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-3"
            >
              <h3 className="font-medium text-blue-900 dark:text-blue-100">
                Como usar a integração WhatsApp:
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li>Digite seu número do WhatsApp no formato internacional (+55 11 99999-9999)</li>
                <li>Clique em "Vincular" para conectar sua conta</li>
                <li>Envie uma mensagem para o número do EssentIA no WhatsApp</li>
                <li>Todas as suas mensagens serão automaticamente salvas como entradas do diário</li>
                <li>Você receberá confirmações a cada entrada criada</li>
              </ol>
              
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-4 border-yellow-400">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Importante:</strong> Certifique-se de que o número está correto e que você tem acesso ao WhatsApp neste número.
                </p>
              </div>
            </motion.div>
          )}

          {/* Funcionalidades */}
          {config.isLinked && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  ✅ Funcionalidades Ativas
                </h3>
                <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  <li>• Criação automática de entradas</li>
                  <li>• Confirmações por mensagem</li>
                  <li>• Comandos de ajuda</li>
                  <li>• Sincronização em tempo real</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  🔄 Comandos Disponíveis
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• <code>ajuda</code> - Mostrar ajuda</li>
                  <li>• <code>status</code> - Ver status da conta</li>
                  <li>• Qualquer texto - Nova entrada</li>
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default WhatsAppIntegration;