# 🎨 Guia de Implementação Frontend - EssentIA Premium

## ✅ Já Implementado

### Notificações Push
- ✅ `src/services/notification-socket.ts` - Cliente Socket.IO
- ✅ `src/hooks/useNotifications.ts` - Hook React
- ✅ `src/components/NotificationCenter.tsx` - Componente de notificações

### Uso
```tsx
import NotificationCenter from '@/components/NotificationCenter';

// No header/navbar
<NotificationCenter userId={user.id} />
```

---

## 📝 Componentes a Criar

### 1. Botão de Download PDF no Dashboard Admin

Adicionar em `src/pages/Admin.tsx` no dashboard:

```tsx
import { FileDown } from 'lucide-react';

const handleDownloadPDF = async () => {
  const params = new URLSearchParams({
    companyId: selectedCompany !== 'all' ? selectedCompany : '',
    departmentId: selectedDepartment !== 'all' ? selectedDepartment : '',
    dateRange: '30'
  });

  const response = await fetch(`http://localhost:3001/api/reports/pdf?${params}`);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relatorio-essentia-${new Date().toISOString().split('T')[0]}.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
};

// No header do dashboard:
<button
  onClick={handleDownloadPDF}
  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
>
  <FileDown className="w-4 h-4" />
  <span>Download PDF</span>
</button>
```

---

### 2. Configuração de Relatórios Agendados

Criar `src/components/admin/ReportsScheduler.tsx`:

```tsx
import { useState } from 'react';
import { Calendar, Mail, Check } from 'lucide-react';

export default function ReportsScheduler() {
  const [email, setEmail] = useState('');
  const [weeklyEnabled, setWeeklyEnabled] = useState(false);
  const [monthlyEnabled, setMonthlyEnabled] = useState(false);

  const scheduleWeekly = async () => {
    const response = await fetch('http://localhost:3001/api/reports/schedule/weekly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    if (data.success) {
      setWeeklyEnabled(true);
      alert('Relatório semanal agendado!');
    }
  };

  const scheduleMonthly = async () => {
    const response = await fetch('http://localhost:3001/api/reports/schedule/monthly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    if (data.success) {
      setMonthlyEnabled(true);
      alert('Relatório mensal agendado!');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Relatórios Agendados
      </h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email para receber relatórios
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="rh@empresa.com"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">Relatório Semanal</p>
            <p className="text-sm text-gray-600">Toda segunda-feira às 9h</p>
          </div>
          <button
            onClick={scheduleWeekly}
            disabled={weeklyEnabled}
            className={`px-4 py-2 rounded-lg transition-colors ${
              weeklyEnabled
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {weeklyEnabled ? (
              <><Check className="w-4 h-4 inline mr-2" />Ativo</>
            ) : (
              'Ativar'
            )}
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">Relatório Mensal</p>
            <p className="text-sm text-gray-600">Primeiro dia do mês às 9h</p>
          </div>
          <button
            onClick={scheduleMonthly}
            disabled={monthlyEnabled}
            className={`px-4 py-2 rounded-lg transition-colors ${
              monthlyEnabled
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {monthlyEnabled ? (
              <><Check className="w-4 h-4 inline mr-2" />Ativo</>
            ) : (
              'Ativar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
```

Adicionar no Admin.tsx na seção de Settings:
```tsx
{activeSection === 'settings' && <ReportsScheduler />}
```

---

### 3. Dashboard de IA Preditiva

Criar `src/components/admin/AIPredictionDashboard.tsx`:

```tsx
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Brain, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';

interface Prediction {
  date: string;
  dayOfWeek: string;
  predictedMood: number;
  confidence: number;
  risk: 'low' | 'medium' | 'high';
  riskMessage: string;
}

interface AIData {
  success: boolean;
  predictions: Prediction[];
  trend: {
    direction: string;
    description: string;
  };
  warnings: any[];
  recommendations: any[];
}

export default function AIPredictionDashboard({ userId }: { userId: string }) {
  const [aiData, setAiData] = useState<AIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrediction();
  }, [userId]);

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/ai/predict/${userId}?daysAhead=7`);
      const data = await response.json();
      setAiData(data);
    } catch (error) {
      console.error('Erro ao buscar previsão:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando previsão de IA...</div>;
  }

  if (!aiData || !aiData.success) {
    return <div className="p-8 text-center text-gray-500">Dados insuficientes para previsão</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-8 h-8" />
          <h2 className="text-2xl font-bold">IA Preditiva - Previsão de Humor</h2>
        </div>
        <p className="opacity-90">
          Nossa inteligência artificial prevê o humor para os próximos 7 dias com base em padrões históricos
        </p>
      </div>

      {/* Tendência Geral */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Tendência Geral</h3>
        <div className="flex items-center gap-4">
          {aiData.trend.direction === 'improving' ? (
            <TrendingUp className="w-12 h-12 text-green-500" />
          ) : aiData.trend.direction === 'declining' ? (
            <TrendingDown className="w-12 h-12 text-red-500" />
          ) : (
            <div className="w-12 h-12 text-gray-500">→</div>
          )}
          <div>
            <p className="text-2xl font-bold text-gray-900">{aiData.trend.description}</p>
            <p className="text-gray-600">Análise dos últimos 90 dias</p>
          </div>
        </div>
      </div>

      {/* Gráfico de Previsão */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Previsão para os Próximos 7 Dias</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={aiData.predictions}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dayOfWeek" />
            <YAxis domain={[1, 5]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="predictedMood"
              stroke="#8B5CF6"
              strokeWidth={3}
              name="Humor Previsto"
            />
            <Line
              type="monotone"
              dataKey="confidence"
              stroke="#10B981"
              strokeWidth={2}
              name="Confiança (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Previsões Detalhadas */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Previsões Detalhadas</h3>
        <div className="space-y-3">
          {aiData.predictions.map((pred, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                pred.risk === 'high'
                  ? 'border-red-500 bg-red-50'
                  : pred.risk === 'medium'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-green-500 bg-green-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {pred.dayOfWeek} - {pred.date}
                  </p>
                  <p className="text-sm text-gray-600">{pred.riskMessage}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{pred.predictedMood.toFixed(1)}</p>
                  <p className="text-sm text-gray-500">{pred.confidence}% confiança</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warnings */}
      {aiData.warnings.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Alertas
          </h3>
          <div className="space-y-3">
            {aiData.warnings.map((warning, index) => (
              <div
                key={index}
                className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg"
              >
                <p className="font-medium text-red-900">{warning.message}</p>
                <p className="text-sm text-red-700 mt-1">{warning.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recomendações */}
      {aiData.recommendations.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Recomendações da IA</h3>
          <div className="space-y-3">
            {aiData.recommendations.map((rec, index) => (
              <div key={index} className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium flex items-center gap-2">
                  <span>{rec.icon}</span>
                  {rec.title}
                </p>
                <p className="text-sm text-gray-700 mt-1">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

Adicionar seção "IA Preditiva" no Admin.tsx:
```tsx
<button onClick={() => setActiveSection('ai-prediction')}>
  <Brain className="w-5 h-5" />
  {sidebarOpen && <span>IA Preditiva</span>}
</button>

{activeSection === 'ai-prediction' && <AIPredictionDashboard userId={selectedUser?.id} />}
```

---

### 4. Chat Interno

Criar `src/components/ChatWidget.tsx`:

```tsx
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender_name: string;
}

export default function ChatWidget({ userId, userName }: { userId: string; userName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !chatId) {
      startChat();
    }
  }, [isOpen]);

  useEffect(() => {
    if (chatId) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000); // Poll a cada 3s
      return () => clearInterval(interval);
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startChat = async () => {
    const response = await fetch('http://localhost:3001/api/chat/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await response.json();
    if (data.success) {
      setChatId(data.chat.id);
    }
  };

  const loadMessages = async () => {
    if (!chatId) return;

    const response = await fetch(`http://localhost:3001/api/chat/${chatId}/messages`);
    const data = await response.json();
    if (data.success) {
      setMessages(data.messages.reverse());

      // Marcar como lido
      await fetch(`http://localhost:3001/api/chat/${chatId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    const response = await fetch(`http://localhost:3001/api/chat/${chatId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: userId,
        message: newMessage
      })
    });

    const data = await response.json();
    if (data.success) {
      setMessages([...messages, data.message]);
      setNewMessage('');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Botão Flutuante */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-shadow z-50"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Janela de Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl flex flex-col z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-xl flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Conversar com RH</h3>
                <p className="text-xs opacity-80">Estamos aqui para ajudar</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.sender_id === userId
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender_id === userId ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

Adicionar em `src/App.tsx` ou na página principal do usuário:
```tsx
import ChatWidget from '@/components/ChatWidget';

<ChatWidget userId={user.id} userName={user.name} />
```

---

## 🚀 Checklist de Implementação

- [x] NotificationCenter component
- [ ] Download PDF button
- [ ] ReportsScheduler component
- [ ] AIPredictionDashboard component
- [ ] ChatWidget component
- [ ] Integrar NotificationCenter no header
- [ ] Integrar ChatWidget na página do usuário
- [ ] Adicionar seção "IA Preditiva" no Admin
- [ ] Adicionar seção "Configurações" com ReportsScheduler
- [ ] Adicionar variável VITE_API_URL no .env

## 📝 Variáveis de Ambiente Frontend

Adicionar em `.env`:
```env
VITE_API_URL=http://localhost:3001
```

---

**Status**: Frontend parcialmente implementado (Notificações ✅)
**Próximo**: Implementar componentes de PDF, Chat e IA Preditiva
