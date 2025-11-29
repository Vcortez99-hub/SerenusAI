import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign, Users, TrendingUp, TrendingDown, Building2,
  Activity, Target, AlertTriangle, Heart, Briefcase,
  Award, Clock, Shield, Zap, ArrowUp, ArrowDown, Minus,
  Calendar, BarChart3, PieChart as PieChartIcon, Download, ArrowRight
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { API_BASE_URL } from '@/config/api'
import { cn } from '@/lib/utils'
import { MoodLandscape } from '@/components/ui/MoodLandscape'
import { PredictiveInsights } from '@/components/ai/PredictiveInsights'

// ==================== INTERFACES ====================

interface SaaSMetrics {
  mrr: number
  mrrGrowth: number
  totalCompanies: number
  activeCompanies: number
  churnRate: number
  retentionRate: number
  ltv: number
  cac: number
  ltvCacRatio: number
  avgRevenuePerCompany: number
}

interface CompanyWellnessMetrics {
  totalEmployees: number
  activeUsers: number
  engagementRate: number
  avgMoodScore: number
  moodTrend: number
  activitiesCompleted: number
  avgActivitiesPerUser: number
  wellnessROI: number
  absenteeismReduction: number
  productivityIncrease: number
}

interface DepartmentRisk {
  departmentName: string
  riskLevel: 'high' | 'medium' | 'low'
  avgMood: number
  engagementRate: number
  alertCount: number
  trend: 'up' | 'down' | 'stable'
}

interface GrowthData {
  month: string
  users: number
  revenue: number
  companies: number
  engagement: number
}

interface WellnessImpact {
  metric: string
  before: number
  after: number
  improvement: number
  value: string
}

// ==================== DADOS MOCADOS ====================

const MOCK_SAAS_METRICS: SaaSMetrics = {
  mrr: 45000,
  mrrGrowth: 12.5,
  totalCompanies: 15,
  activeCompanies: 13,
  churnRate: 5.2,
  retentionRate: 94.8,
  ltv: 18500,
  cac: 4200,
  ltvCacRatio: 4.4,
  avgRevenuePerCompany: 3000
}

const MOCK_WELLNESS_METRICS: CompanyWellnessMetrics = {
  totalEmployees: 250,
  activeUsers: 185,
  engagementRate: 74.0,
  avgMoodScore: 7.3,
  moodTrend: 8.5,
  activitiesCompleted: 1247,
  avgActivitiesPerUser: 6.7,
  wellnessROI: 285.0,
  absenteeismReduction: 18.5,
  productivityIncrease: 12.3
}

const MOCK_DEPARTMENT_RISKS: DepartmentRisk[] = [
  {
    departmentName: 'Tecnologia',
    riskLevel: 'medium',
    avgMood: 6.2,
    engagementRate: 58.0,
    alertCount: 3,
    trend: 'down'
  },
  {
    departmentName: 'Atendimento ao Cliente',
    riskLevel: 'high',
    avgMood: 4.8,
    engagementRate: 42.0,
    alertCount: 7,
    trend: 'down'
  }
]

const MOCK_GROWTH_DATA: GrowthData[] = [
  { month: 'Jun', users: 120, revenue: 28500, companies: 8, engagement: 65.5 },
  { month: 'Jul', users: 145, revenue: 32800, companies: 10, engagement: 68.2 },
  { month: 'Ago', users: 175, revenue: 38200, companies: 11, engagement: 71.0 },
  { month: 'Set', users: 195, revenue: 41500, companies: 13, engagement: 69.8 },
  { month: 'Out', users: 225, revenue: 43800, companies: 14, engagement: 72.5 },
  { month: 'Nov', users: 250, revenue: 45000, companies: 15, engagement: 74.0 }
]

const MOCK_WELLNESS_IMPACT: WellnessImpact[] = [
  {
    metric: 'Engajamento dos Colaboradores',
    before: 58.5,
    after: 74.0,
    improvement: 15.5,
    value: '185 usuários ativos'
  },
  {
    metric: 'Satisfação no Trabalho',
    before: 65.0,
    after: 82.0,
    improvement: 17.0,
    value: 'Pesquisa de clima'
  },
  {
    metric: 'Redução de Estresse',
    before: 68.0,
    after: 42.0,
    improvement: -26.0,
    value: 'Relatos de burnout'
  },
  {
    metric: 'Produtividade Percebida',
    before: 72.0,
    after: 87.0,
    improvement: 15.0,
    value: 'Auto-avaliação'
  }
]

// Dados dos gráficos
const MOOD_DISTRIBUTION_DATA = [
  { name: 'Muito Positivo', value: 35, color: '#10b981' },
  { name: 'Positivo', value: 39, color: '#34d399' },
  { name: 'Neutro', value: 18, color: '#fbbf24' },
  { name: 'Negativo', value: 6, color: '#fb923c' },
  { name: 'Muito Negativo', value: 2, color: '#ef4444' }
]

const ACTIVITIES_BY_CATEGORY_DATA = [
  { categoria: 'Meditação', completadas: 287, meta: 300 },
  { categoria: 'Exercícios', completadas: 245, meta: 250 },
  { categoria: 'Respiração', completadas: 198, meta: 200 },
  { categoria: 'Gratidão', completadas: 312, meta: 280 },
  { categoria: 'Journaling', completadas: 205, meta: 220 }
]

const ENGAGEMENT_EVOLUTION_DATA = [
  { dia: '1', engajamento: 65, humor: 6.8 },
  { dia: '5', engajamento: 68, humor: 6.9 },
  { dia: '10', engajamento: 70, humor: 7.0 },
  { dia: '15', engajamento: 71, humor: 7.1 },
  { dia: '20', engajamento: 72, humor: 7.2 },
  { dia: '25', engajamento: 73, humor: 7.2 },
  { dia: '30', engajamento: 74, humor: 7.3 }
]

const DEPARTMENT_ENGAGEMENT_DATA = [
  { departamento: 'RH', engajamento: 85 },
  { departamento: 'Vendas', engajamento: 78 },
  { departamento: 'Marketing', engajamento: 75 },
  { departamento: 'Financeiro', engajamento: 72 },
  { departamento: 'Tecnologia', engajamento: 58 },
  { departamento: 'Atendimento', engajamento: 42 }
]

const MOCK_MOOD_LANDSCAPE_DATA = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
  mood: ['happy', 'neutral', 'sad', 'anxious', 'angry'][Math.floor(Math.random() * 5)] as any,
  intensity: Math.floor(Math.random() * 5) + 5
}));

// ==================== COMPONENT ====================

export default function ExecutiveDashboard() {
  const [saasMetrics, setSaasMetrics] = useState<SaaSMetrics>(MOCK_SAAS_METRICS)
  const [wellnessMetrics, setWellnessMetrics] = useState<CompanyWellnessMetrics>(MOCK_WELLNESS_METRICS)
  const [departmentRisks, setDepartmentRisks] = useState<DepartmentRisk[]>(MOCK_DEPARTMENT_RISKS)
  const [growthData, setGrowthData] = useState<GrowthData[]>(MOCK_GROWTH_DATA)
  const [wellnessImpact, setWellnessImpact] = useState<WellnessImpact[]>(MOCK_WELLNESS_IMPACT)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedView, setSelectedView] = useState<'saas' | 'wellness'>('saas')
  const [dateRange, setDateRange] = useState('30')

  useEffect(() => {
    loadExecutiveDashboard()
  }, [dateRange])

  const loadExecutiveDashboard = async () => {
    setIsLoading(true)
    try {
      // Tentar buscar dados da API
      const [saasRes, wellnessRes, risksRes, growthRes, impactRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/executive/saas-metrics?days=${dateRange}`).catch(() => null),
        fetch(`${API_BASE_URL}/admin/executive/wellness-metrics?days=${dateRange}`).catch(() => null),
        fetch(`${API_BASE_URL}/admin/executive/department-risks`).catch(() => null),
        fetch(`${API_BASE_URL}/admin/executive/growth-data?months=6`).catch(() => null),
        fetch(`${API_BASE_URL}/admin/executive/wellness-impact?days=${dateRange}`).catch(() => null)
      ])

      // Usar dados da API se disponíveis, caso contrário usar dados mocados
      if (saasRes?.ok) {
        const data = await saasRes.json()
        setSaasMetrics(data.metrics)
      }

      if (wellnessRes?.ok) {
        const data = await wellnessRes.json()
        setWellnessMetrics(data.metrics)
      }

      if (risksRes?.ok) {
        const data = await risksRes.json()
        setDepartmentRisks(data.risks)
      }

      if (growthRes?.ok) {
        const data = await growthRes.json()
        setGrowthData(data.growth)
      }

      if (impactRes?.ok) {
        const data = await impactRes.json()
        setWellnessImpact(data.impact)
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard executivo:', error)
      // Em caso de erro, dados mocados já estão definidos no useState
    } finally {
      setIsLoading(false)
    }
  }

  const exportReport = () => {
    alert('Exportação de relatório em desenvolvimento')
  }

  // ==================== METRIC CARD COMPONENT ====================

  interface MetricCardProps {
    title: string
    value: string | number
    change?: number
    icon: React.ReactNode
    iconColor: string
    trend?: 'up' | 'down' | 'stable'
    suffix?: string
    description?: string
  }

  const MetricCard = ({ title, value, change, icon, iconColor, trend, suffix = '', description }: MetricCardProps) => {
    const trendIcon = trend === 'up' ? <ArrowUp className="w-4 h-4" /> :
      trend === 'down' ? <ArrowDown className="w-4 h-4" /> :
        <Minus className="w-4 h-4" />

    const trendColor = change && change > 0 ? 'text-success-600 bg-success-50' :
      change && change < 0 ? 'text-danger-600 bg-danger-50' :
        'text-neutral-500 bg-neutral-50'

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium p-6 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity scale-150">
          {icon}
        </div>
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className={cn("p-3 rounded-xl shadow-sm text-white", iconColor)}>
            {icon}
          </div>
          {change !== undefined && (
            <div className={cn("flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full", trendColor)}>
              {trendIcon}
              <span>{Math.abs(change).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <h3 className="text-3xl font-headings font-bold text-neutral-900 mb-1 tracking-tight relative z-10">
          {value}<span className="text-lg text-neutral-400 font-normal ml-1">{suffix}</span>
        </h3>
        <p className="text-sm text-neutral-500 font-medium relative z-10">{title}</p>
        {description && (
          <p className="text-xs text-neutral-400 mt-2 relative z-10">{description}</p>
        )}
      </motion.div>
    )
  }

  // ==================== LOADING STATE ====================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // ==================== RENDER ====================

  return (
    <div className="space-y-8">
      {/* Header com controles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headings font-bold text-neutral-900">
            Visão Geral Executiva
          </h2>
          <p className="text-neutral-500 mt-1">
            Acompanhe os principais indicadores de performance e bem-estar.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none shadow-sm appearance-none cursor-pointer hover:bg-neutral-50 transition-colors"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="365">Último ano</option>
            </select>
          </div>
          <button
            onClick={exportReport}
            className="px-4 py-2.5 bg-neutral-900 text-white rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-900/20 active:scale-95"
          >
            <Download className="w-4 h-4" />
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* Tabs de visualização */}
      <div className="p-1 bg-neutral-100 rounded-xl inline-flex">
        <button
          onClick={() => setSelectedView('saas')}
          className={cn(
            "px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2",
            selectedView === 'saas'
              ? "bg-white text-primary-600 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50"
          )}
        >
          <DollarSign className="w-4 h-4" />
          Métricas SaaS
        </button>
        <button
          onClick={() => setSelectedView('wellness')}
          className={cn(
            "px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2",
            selectedView === 'wellness'
              ? "bg-white text-primary-600 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50"
          )}
        >
          <Heart className="w-4 h-4" />
          Bem-Estar Corporativo
        </button>
      </div>

      {/* ==================== MÉTRICAS SAAS ==================== */}
      {selectedView === 'saas' && (
        <div className="space-y-8 animate-fade-in">
          {/* KPIs principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="MRR (Receita Recorrente)"
              value={`R$ ${(saasMetrics.mrr / 1000).toFixed(1)}k`}
              change={saasMetrics.mrrGrowth}
              icon={<DollarSign className="w-6 h-6" />}
              iconColor="bg-green-500"
              trend={saasMetrics.mrrGrowth > 0 ? 'up' : 'down'}
            />
            <MetricCard
              title="Empresas Ativas"
              value={saasMetrics.activeCompanies}
              change={((saasMetrics.activeCompanies - saasMetrics.totalCompanies) / saasMetrics.totalCompanies * 100)}
              icon={<Building2 className="w-6 h-6" />}
              iconColor="bg-blue-500"
              suffix={` / ${saasMetrics.totalCompanies}`}
            />
            <MetricCard
              title="Taxa de Retenção"
              value={saasMetrics.retentionRate.toFixed(1)}
              change={saasMetrics.retentionRate - 85}
              icon={<Shield className="w-6 h-6" />}
              iconColor="bg-purple-500"
              suffix="%"
              trend={saasMetrics.retentionRate > 85 ? 'up' : 'down'}
            />
            <MetricCard
              title="Razão LTV/CAC"
              value={saasMetrics.ltvCacRatio.toFixed(1)}
              change={((saasMetrics.ltvCacRatio - 3) / 3 * 100)}
              icon={<Target className="w-6 h-6" />}
              iconColor="bg-orange-500"
              suffix=":1"
              description="Meta: 3:1 ou superior"
            />
          </div>

          {/* Métricas secundárias */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Receita Média por Empresa"
              value={`R$ ${saasMetrics.avgRevenuePerCompany.toFixed(0)}`}
              icon={<BarChart3 className="w-6 h-6" />}
              iconColor="bg-indigo-500"
              suffix="/mês"
            />
            <MetricCard
              title="LTV (Lifetime Value)"
              value={`R$ ${(saasMetrics.ltv / 1000).toFixed(1)}k`}
              icon={<Award className="w-6 h-6" />}
              iconColor="bg-teal-500"
            />
            <MetricCard
              title="CAC (Custo de Aquisição)"
              value={`R$ ${saasMetrics.cac.toFixed(0)}`}
              icon={<Users className="w-6 h-6" />}
              iconColor="bg-pink-500"
            />
          </div>

          {/* Gráfico de crescimento */}
          <div className="card-premium p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Crescimento Financeiro</h3>
                <p className="text-sm text-neutral-500">Evolução de receita e base de usuários</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs font-medium text-neutral-500">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Receita
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-neutral-500">
                  <span className="w-2 h-2 rounded-full bg-primary-500"></span> Usuários
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `R$${value / 1000}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.1)' }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Receita (R$)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="users"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                  name="Usuários"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ==================== MÉTRICAS DE BEM-ESTAR ==================== */}
      {selectedView === 'wellness' && (
        <div className="space-y-8 animate-fade-in">
          {/* KPIs principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Taxa de Engajamento"
              value={wellnessMetrics.engagementRate.toFixed(1)}
              change={wellnessMetrics.engagementRate - 60}
              icon={<Activity className="w-6 h-6" />}
              iconColor="bg-blue-500"
              suffix="%"
              trend={wellnessMetrics.engagementRate > 60 ? 'up' : 'down'}
            />
            <MetricCard
              title="Score Médio de Humor"
              value={wellnessMetrics.avgMoodScore.toFixed(1)}
              change={wellnessMetrics.moodTrend}
              icon={<Heart className="w-6 h-6" />}
              iconColor="bg-pink-500"
              suffix="/10"
              trend={wellnessMetrics.moodTrend > 0 ? 'up' : wellnessMetrics.moodTrend < 0 ? 'down' : 'stable'}
            />
            <MetricCard
              title="ROI do Programa"
              value={wellnessMetrics.wellnessROI.toFixed(1)}
              change={wellnessMetrics.wellnessROI - 250}
              icon={<TrendingUp className="w-6 h-6" />}
              iconColor="bg-green-500"
              suffix="%"
              description="Retorno sobre investimento"
            />
            <MetricCard
              title="Atividades Completadas"
              value={wellnessMetrics.activitiesCompleted}
              change={20}
              icon={<Zap className="w-6 h-6" />}
              iconColor="bg-yellow-500"
              suffix=" atividades"
            />
            <MetricCard
              title="Atividades Completadas"
              value={wellnessMetrics.activitiesCompleted}
              change={20}
              icon={<Zap className="w-6 h-6" />}
              iconColor="bg-yellow-500"
              suffix=" atividades"
            />
          </div>

          {/* Mood Landscape Visualization */}
          <div className="card-premium p-8">
            <h3 className="text-lg font-bold text-neutral-900 mb-6">
              Paisagem Emocional da Empresa
            </h3>
            <p className="text-neutral-500 mb-6">
              Visualização artística das flutuações de humor coletivo nos últimos 30 dias.
            </p>
            <MoodLandscape data={MOCK_MOOD_LANDSCAPE_DATA} period="month" />
          </div>

          {/* Predictive Insights */}
          <div className="card-premium p-8">
            <PredictiveInsights
              moodHistory={MOCK_MOOD_LANDSCAPE_DATA}
              currentMood="neutral"
            />
          </div>

          {/* Gráficos de análise */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Pizza - Distribuição de Humor */}
            <div className="card-premium p-8">
              <h3 className="text-lg font-bold text-neutral-900 mb-6">
                Distribuição de Estado Emocional
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={MOOD_DISTRIBUTION_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {MOOD_DISTRIBUTION_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de Barras - Atividades por Categoria */}
            <div className="card-premium p-8">
              <h3 className="text-lg font-bold text-neutral-900 mb-6">
                Atividades por Categoria
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ACTIVITIES_BY_CATEGORY_DATA} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="categoria"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="completadas" fill="#6366f1" name="Completadas" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="meta" fill="#e2e8f0" name="Meta" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Linha - Evolução de Engajamento */}
          <div className="card-premium p-8">
            <h3 className="text-lg font-bold text-neutral-900 mb-6">
              Evolução do Engajamento e Humor (Últimos 30 dias)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ENGAGEMENT_EVOLUTION_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="dia"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="engajamento"
                  stroke="#6366f1"
                  strokeWidth={3}
                  name="Engajamento (%)"
                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 4, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="humor"
                  stroke="#ec4899"
                  strokeWidth={3}
                  name="Humor Médio"
                  dot={{ fill: '#ec4899', strokeWidth: 2, r: 4, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Barras Horizontais - Comparação de Departamentos */}
          <div className="card-premium p-8">
            <h3 className="text-lg font-bold text-neutral-900 mb-6">
              Engajamento por Departamento
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={DEPARTMENT_ENGAGEMENT_DATA}
                layout="vertical"
                margin={{ left: 20 }}
                barSize={20}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis type="category" dataKey="departamento" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} width={100} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="engajamento" fill="#10b981" name="Engajamento (%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Impacto do programa */}
          <div className="card-premium p-8">
            <h3 className="text-lg font-bold text-neutral-900 mb-6">
              Impacto do Programa de Bem-Estar
            </h3>
            <div className="space-y-4">
              {wellnessImpact.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-5 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-bold text-neutral-900">{item.metric}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-neutral-500 bg-white px-2 py-1 rounded border border-neutral-200">
                        Antes: <span className="font-medium text-neutral-700">{item.before}%</span>
                      </span>
                      <ArrowRight className="w-4 h-4 text-neutral-400" />
                      <span className="text-neutral-500 bg-white px-2 py-1 rounded border border-neutral-200">
                        Depois: <span className="font-medium text-neutral-700">{item.after}%</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "text-2xl font-bold",
                      item.improvement > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {item.improvement > 0 ? '+' : ''}{item.improvement}%
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Departamentos em risco */}
          <div className="card-premium p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-neutral-900">
                Departamentos Requerendo Atenção
              </h3>
              <div className="p-2 bg-orange-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
            </div>
            <div className="space-y-3">
              {departmentRisks.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">
                  Nenhum departamento em risco no momento
                </p>
              ) : (
                departmentRisks.map((dept, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center justify-between p-5 rounded-xl border transition-all",
                      dept.riskLevel === 'high' ? "bg-red-50 border-red-100 hover:bg-red-100/50" :
                        dept.riskLevel === 'medium' ? "bg-orange-50 border-orange-100 hover:bg-orange-100/50" :
                          "bg-yellow-50 border-yellow-100 hover:bg-yellow-100/50"
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-neutral-600" />
                        <p className="font-bold text-neutral-900">{dept.departmentName}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-neutral-600">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {dept.avgMood.toFixed(1)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3" /> {dept.engagementRate.toFixed(0)}%
                        </span>
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> {dept.alertCount} alertas
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {dept.trend === 'up' ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      ) : dept.trend === 'down' ? (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      ) : (
                        <Minus className="w-5 h-5 text-neutral-400" />
                      )}
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                        dept.riskLevel === 'high' ? "bg-red-100 text-red-700" :
                          dept.riskLevel === 'medium' ? "bg-orange-100 text-orange-700" :
                            "bg-yellow-100 text-yellow-700"
                      )}>
                        {dept.riskLevel === 'high' ? 'Alto Risco' :
                          dept.riskLevel === 'medium' ? 'Risco Médio' :
                            'Atenção'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Métricas adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricCard
              title="Redução de Absenteísmo"
              value={wellnessMetrics.absenteeismReduction.toFixed(1)}
              change={wellnessMetrics.absenteeismReduction}
              icon={<Calendar className="w-6 h-6" />}
              iconColor="bg-green-500"
              suffix="%"
              trend="up"
            />
            <MetricCard
              title="Aumento de Produtividade"
              value={wellnessMetrics.productivityIncrease.toFixed(1)}
              change={wellnessMetrics.productivityIncrease}
              icon={<Zap className="w-6 h-6" />}
              iconColor="bg-purple-500"
              suffix="%"
              trend="up"
            />
          </div>
        </div>
      )}
    </div>
  )
}
