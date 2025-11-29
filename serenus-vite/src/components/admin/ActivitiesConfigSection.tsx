import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookHeart,
  Brain,
  Wind,
  Heart,
  Target,
  TrendingUp,
  MessageCircle,
  Library,
  Phone,
  Award,
  Settings,
  Copy,
  Save,
  RefreshCw
} from 'lucide-react';

const ACTIVITY_ICONS: Record<string, any> = {
  BookHeart,
  Brain,
  Wind,
  Heart,
  Target,
  TrendingUp,
  MessageCircle,
  Library,
  Phone,
  Award
};

interface Activity {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  enabled: boolean;
  custom_settings?: any;
}

interface ActivitiesConfigSectionProps {
  selectedCompany?: string;
}

export default function ActivitiesConfigSection({ selectedCompany = 'geral' }: ActivitiesConfigSectionProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copyFromCompany, setCopyFromCompany] = useState('');

  useEffect(() => {
    loadActivities();
  }, [selectedCompany]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3002/api/admin/activities/company/${selectedCompany}`);
      const data = await response.json();

      if (data.success) {
        setActivities(data.activities);
      }
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    }
    setLoading(false);
  };

  const toggleActivity = async (activityId: string, enabled: boolean) => {
    setSaving(true);
    try {
      const response = await fetch(
        `http://localhost:3002/api/admin/activities/company/${selectedCompany}/${activityId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled })
        }
      );

      const data = await response.json();

      if (data.success) {
        setActivities(prev =>
          prev.map(act =>
            act.id === activityId ? { ...act, enabled } : act
          )
        );
      }
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
    }
    setSaving(false);
  };

  const copyConfiguration = async () => {
    if (!copyFromCompany) return;

    setSaving(true);
    try {
      const response = await fetch('http://localhost:3002/api/admin/activities/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromCompany: copyFromCompany,
          toCompany: selectedCompany
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Configuração copiada com sucesso!');
        loadActivities();
      }
    } catch (error) {
      console.error('Erro ao copiar configuração:', error);
      alert('Erro ao copiar configuração');
    }
    setSaving(false);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      core: 'bg-blue-100 text-blue-700',
      wellness: 'bg-green-100 text-green-700',
      mindfulness: 'bg-purple-100 text-purple-700',
      productivity: 'bg-orange-100 text-orange-700',
      analytics: 'bg-indigo-100 text-indigo-700',
      support: 'bg-pink-100 text-pink-700',
      education: 'bg-yellow-100 text-yellow-700',
      engagement: 'bg-red-100 text-red-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      core: 'Principal',
      wellness: 'Bem-Estar',
      mindfulness: 'Mindfulness',
      productivity: 'Produtividade',
      analytics: 'Analytics',
      support: 'Suporte',
      education: 'Educação',
      engagement: 'Engajamento'
    };
    return names[category] || category;
  };

  const groupedActivities = activities.reduce((acc, activity) => {
    if (!acc[activity.category]) {
      acc[activity.category] = [];
    }
    acc[activity.category].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="w-7 h-7" />
              Configuração de Atividades/Sessões
            </h2>
            <p className="text-gray-600 mt-2">
              Configure quais atividades estarão disponíveis para os colaboradores de{' '}
              <span className="font-semibold text-blue-600">
                {selectedCompany === 'geral' ? 'Cadastros Públicos (Empresa Geral)' : selectedCompany}
              </span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={loadActivities}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Copiar Configuração */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Copiar Configuração de Outra Empresa
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={copyFromCompany}
              onChange={(e) => setCopyFromCompany(e.target.value)}
              placeholder="Nome da empresa origem"
              className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={copyConfiguration}
              disabled={!copyFromCompany || saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copiar
            </button>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            Isso substituirá todas as configurações atuais pelas da empresa selecionada
          </p>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-600">Total de Atividades</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{activities.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-600">Habilitadas</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {activities.filter(a => a.enabled).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-600">Desabilitadas</p>
          <p className="text-3xl font-bold text-gray-400 mt-1">
            {activities.filter(a => !a.enabled).length}
          </p>
        </div>
      </div>

      {/* Atividades por Categoria */}
      {Object.entries(groupedActivities).map(([category, categoryActivities]) => (
        <div key={category} className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className={`p-4 ${getCategoryColor(category)}`}>
            <h3 className="font-semibold text-lg">{getCategoryName(category)}</h3>
            <p className="text-sm opacity-80">{categoryActivities.length} atividades</p>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryActivities.map((activity) => {
              const IconComponent = ACTIVITY_ICONS[activity.icon] || Settings;

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    activity.enabled
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3 flex-1">
                      <div
                        className={`p-3 rounded-lg ${
                          activity.enabled
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>

                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{activity.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleActivity(activity.id, !activity.enabled)}
                      disabled={saving}
                      className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        activity.enabled ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          activity.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
