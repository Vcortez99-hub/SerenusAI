import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';
import { Save, AlertCircle, CheckCircle, MessageCircle, Heart, Shield, User, Bell, LogOut, Download, Trash2, Sparkles, CreditCard, Palette } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/Header';
import { useTheme } from '@/contexts/ThemeContext';

const Settings: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { mode, setMode, moodTheme, setMoodTheme, isSereneMode, toggleSereneMode } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoAdaptColors, setAutoAdaptColors] = useState(() => {
    return localStorage.getItem('autoAdaptColors') === 'true';
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    cpf: user?.cpf || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        cpf: user.cpf || ''
      });
    }
  }, [user]);

  // Adaptação Inteligente de Cores baseada no humor
  useEffect(() => {
    if (!autoAdaptColors || !user) return;

    // Buscar último humor registrado
    const userDataKey = `user_data_${user.id}`;
    const savedData = localStorage.getItem(userDataKey);

    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        const lastMood = data.moodToday;

        if (lastMood) {
          // Mapear humor para tema
          if (lastMood >= 8) {
            setMoodTheme('energetic'); // Muito feliz = Energético
          } else if (lastMood >= 6) {
            setMoodTheme('calm'); // Feliz = Calmo
          } else if (lastMood >= 4) {
            setMoodTheme('focus'); // Neutro = Foco
          } else {
            setMoodTheme('melancholic'); // Triste = Melancólico
          }
        }
      } catch (error) {
        console.error('Erro ao adaptar cores:', error);
      }
    }
  }, [autoAdaptColors, user, setMoodTheme]);

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar perfil');
      }

      const data = await response.json();

      if (updateUser) {
        updateUser(data.user);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/diary-entries?userId=${user.id}`);

      if (!response.ok) throw new Error('Erro ao exportar dados');

      const data = await response.json();
      const entries = data.entries || [];

      // Converter para CSV
      const headers = ['Data', 'Título', 'Conteúdo', 'Humor', 'Tags'];
      const csvData = entries.map((entry: any) => [
        new Date(entry.timestamp).toLocaleString('pt-BR'),
        entry.metadata?.title || '',
        entry.content,
        entry.metadata?.mood || '',
        (entry.metadata?.tags || []).join('; ')
      ]);

      const csv = [
        headers.join(','),
        ...csvData.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download do arquivo
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `essentia-dados-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao exportar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      'Tem certeza que deseja limpar todos os seus dados? Esta ação não pode ser desfeita!'
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/clear-data`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Erro ao limpar dados');

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao limpar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      'ATENÇÃO: Tem certeza que deseja excluir sua conta permanentemente? Todos os seus dados serão perdidos e esta ação NÃO pode ser desfeita!'
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      'Esta é sua última chance! Digite OK na próxima janela para confirmar a exclusão permanente da conta.'
    );

    if (!doubleConfirm) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users/${user.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Erro ao excluir conta');

      alert('Conta excluída com sucesso. Você será redirecionado para a página inicial.');
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir conta');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      {/* Header with Glassmorphism */}
      <Header />

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-headings font-bold text-neutral-900 mb-2">
            Configurações
          </h1>
          <p className="text-neutral-500">
            Personalize sua experiência no Essentia
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Alertas */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 shadow-sm"
            >
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">
                Dados atualizados com sucesso!
              </p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-sm"
            >
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">{error}</p>
            </motion.div>
          )}

          {/* Informações Cadastrais */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="card-premium p-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-headings font-bold text-neutral-900">
                  Informações da Conta
                </h2>
                <p className="text-sm text-neutral-500">
                  Edite seus dados cadastrais
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2 ml-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2 ml-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl bg-neutral-50 text-neutral-500 cursor-not-allowed"
                    placeholder="seu@email.com"
                  />
                  <p className="mt-1.5 ml-1 text-xs text-neutral-400">
                    O e-mail não pode ser alterado por questões de segurança
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2 ml-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2 ml-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </motion.section>


          {/* Configurações de Tema */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-premium p-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-secondary-100 rounded-2xl flex items-center justify-center text-secondary-600">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-headings font-bold text-neutral-900">
                  Aparência
                </h2>
                <p className="text-sm text-neutral-500">
                  Personalize o tema e visual do aplicativo
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Seletor de Tema */}
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-3 ml-1">
                  Tema
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: 'Claro', icon: '☀️' },
                    { value: 'dark', label: 'Escuro', icon: '🌙' },
                    { value: 'system', label: 'Sistema', icon: '💻' }
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => setMode(theme.value as any)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all",
                        mode === theme.value
                          ? "border-primary-500 bg-primary-50"
                          : "border-neutral-200 hover:border-neutral-300"
                      )}
                    >
                      <div className="text-2xl mb-1">{theme.icon}</div>
                      <div className="text-sm font-medium">{theme.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tema de Humor */}
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-3 ml-1">
                  Tema Emocional
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: 'default', label: 'Padrão', color: 'bg-blue-500' },
                    { value: 'calm', label: 'Calmo', color: 'bg-teal-500' },
                    { value: 'energetic', label: 'Energético', color: 'bg-orange-500' },
                    { value: 'melancholic', label: 'Melancólico', color: 'bg-purple-500' },
                    { value: 'focus', label: 'Foco', color: 'bg-indigo-500' }
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => setMoodTheme(theme.value as any)}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all flex items-center gap-2",
                        moodTheme === theme.value
                          ? "border-primary-500 bg-primary-50"
                          : "border-neutral-200 hover:border-neutral-300"
                      )}
                    >
                      <div className={cn("w-4 h-4 rounded-full", theme.color)} />
                      <span className="text-sm font-medium">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Adaptação Inteligente de Cores */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <h3 className="font-bold text-neutral-900">Adaptação Inteligente</h3>
                    </div>
                    <p className="text-sm text-neutral-600">
                      O tema se adapta automaticamente ao seu humor registrado
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newValue = !autoAdaptColors;
                      setAutoAdaptColors(newValue);
                      localStorage.setItem('autoAdaptColors', String(newValue));
                    }}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      autoAdaptColors ? "bg-primary-600" : "bg-neutral-300"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        autoAdaptColors ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* Modo Sereno */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Heart className="w-4 h-4 text-blue-600" />
                      <h3 className="font-bold text-neutral-900">Modo Sereno</h3>
                    </div>
                    <p className="text-sm text-neutral-600">
                      Reduz animações e usa cores mais suaves
                    </p>
                  </div>
                  <button
                    onClick={toggleSereneMode}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      isSereneMode ? "bg-primary-600" : "bg-neutral-300"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        isSereneMode ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Configurações de Notificações */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-premium p-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-headings font-bold text-neutral-900">
                  Notificações
                </h2>
                <p className="text-sm text-neutral-500">
                  Configure lembretes e alertas
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                <div>
                  <h3 className="font-bold text-neutral-900">
                    Lembrete Diário
                  </h3>
                  <p className="text-sm text-neutral-500">
                    Receber lembrete para escrever no diário
                  </p>
                </div>
                <button className="relative inline-flex h-7 w-12 items-center rounded-full bg-primary-600 transition-colors">
                  <span className="inline-block h-5 w-5 transform rounded-full bg-white transition-transform translate-x-6 shadow-sm" />
                </button>
              </div>

              <div className="ml-4 space-y-2">
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2 ml-1">
                    Horário do Lembrete
                  </label>
                  <input
                    type="time"
                    defaultValue="20:00"
                    className="px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                <div>
                  <h3 className="font-bold text-neutral-900">
                    Confirmações WhatsApp
                  </h3>
                  <p className="text-sm text-neutral-500">
                    Receber confirmações via WhatsApp
                  </p>
                </div>
                <button className="relative inline-flex h-7 w-12 items-center rounded-full bg-primary-600 transition-colors">
                  <span className="inline-block h-5 w-5 transform rounded-full bg-white transition-transform translate-x-6 shadow-sm" />
                </button>
              </div>
            </div>
          </motion.section>

          {/* Ações de Conta */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card-premium p-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-600">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-headings font-bold text-neutral-900">
                  Gerenciar Conta
                </h2>
                <p className="text-sm text-neutral-500">
                  Ações relacionadas à sua conta
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleExportData}
                className="p-5 border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-primary-200 transition-all text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary-50 text-primary-600 rounded-lg group-hover:bg-primary-100 transition-colors">
                    <Download className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-neutral-900">
                    Exportar Dados
                  </h3>
                </div>
                <p className="text-sm text-neutral-500 pl-[3.25rem]">
                  Baixar todas as suas entradas
                </p>
              </button>

              <button
                onClick={handleClearData}
                className="p-5 border border-neutral-200 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-red-600">
                    Limpar Dados
                  </h3>
                </div>
                <p className="text-sm text-red-500 pl-[3.25rem]">
                  Remover todas as entradas
                </p>
              </button>

              <button
                onClick={handleDeleteAccount}
                className="p-5 border border-red-200 bg-red-50/50 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all text-left md:col-span-2 group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-100 text-red-700 rounded-lg group-hover:bg-red-200 transition-colors">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-red-700">
                    Excluir Conta
                  </h3>
                </div>
                <p className="text-sm text-red-600 pl-[3.25rem]">
                  Remover permanentemente sua conta e todos os dados
                </p>
              </button>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default Settings;