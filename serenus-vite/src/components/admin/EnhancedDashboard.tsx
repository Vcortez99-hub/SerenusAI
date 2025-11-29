import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Activity, TrendingUp, TrendingDown, AlertTriangle,
  Target, Calendar, ArrowUp, ArrowDown, Minus
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { API_BASE_URL } from '@/config/api'
import { cn } from '@/lib/utils'

interface AnalyticsData {
  current: {
    totalUsers: number
    totalEntries: number
    avgMood: number
    positiveEntries: number
    negativeEntries: number
    neutralEntries: number
  }
  previous: {
    totalUsers: number
    totalEntries: number
    avgMood: number
  }
  changes: {
    users: number
    entries: number
    mood: number
    positive: number
  }
}

interface TimelineData {
  date: string
  entriesCount: number
  avgMood: number
  positiveCount: number
  negativeCount: number
}

interface Alert {
  userId: string
  userName: string
  userEmail: string
  avgMood: number
  entriesCount: number
  severity: 'high' | 'medium'
}

interface EngagementData {
  totalUsers: number
  activeUsers: number
  veryActiveUsers: number
  engagementRate: number
  dailyActiveRate: number
}

const COLORS = {
  positive: '#10b981',
  neutral: '#6b7280',
  negative: '#ef4444'
}

export default function EnhancedDashboard({ companyId, departmentId }: { companyId?: string, departmentId?: string }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [timeline, setTimeline] = useState<TimelineData[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [engagement, setEngagement] = useState<EngagementData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')  // últimos 30 dias

  useEffect(() => {
    loadDashboardData()
  }, [companyId, departmentId, dateRange])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(dateRange))

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })
      if (companyId) params.append('companyId', companyId)
      if (departmentId) params.append('departmentId', departmentId)

      const [analyticsRes, timelineRes, alertsRes, engagementRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/analytics/overview?${params}`),
        fetch(`${API_BASE_URL}/admin/analytics/timeline?${params}&groupBy=day`),
        fetch(`${API_BASE_URL}/admin/analytics/alerts?${params}&threshold=2.5&days=7`),
        fetch(`${API_BASE_URL}/admin/analytics/engagement?${params}`)
      ])

      const [analyticsData, timelineData, alertsData, engagementData] = await Promise.all([
        analyticsRes.json(),
        timelineRes.json(),
        alertsRes.json(),
        engagementRes.json()
      ])

      setAnalytics(analyticsData)
      setTimeline(timelineData.timeline || [])
      setAlerts(alertsData.alerts || [])
      setEngagement(engagementData.engagement)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderChangeIndicator = (change: number) => {
    if (Math.abs(change) < 0.1) {
      return <Minus className="w-4 h-4 text-gray-400" />
    }
    return change > 0 ? (
      <div className="flex items-center text-green-600">
        <ArrowUp className="w-4 h-4" />
        <span className="text-sm font-medium">+{change.toFixed(1)}%</span>
      </div>
    ) : (
      <div className="flex items-center text-red-600">
        <ArrowDown className="w-4 h-4" />
        <span className="text-sm font-medium">{change.toFixed(1)}%</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Carregando métricas...</p>
        </div>
      </div>
    )
  }

  if (!analytics || !analytics.current) return null

  const pieData = [
    { name: 'Positivas', value: analytics.current?.positiveEntries || 0, color: COLORS.positive },
    { name: 'Neutras', value: analytics.current?.neutralEntries || 0, color: COLORS.neutral },
    { name: 'Negativas', value: analytics.current?.negativeEntries || 0, color: COLORS.negative }
  ]

  return (
    <div className="space-y-6">
      {/* Filtros de Período */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Período:</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="14">Últimos 14 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>
        </div>
      </div>

      {/* Cards de Métricas Principais com Comparação */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            {renderChangeIndicator(analytics.changes.users)}
          </div>
          <p className="text-sm text-gray-600 mb-1">Colaboradores</p>
          <p className="text-3xl font-bold text-gray-900">{analytics.current?.totalUsers}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            {renderChangeIndicator(analytics.changes.entries)}
          </div>
          <p className="text-sm text-gray-600 mb-1">Entradas do Diário</p>
          <p className="text-3xl font-bold text-gray-900">{analytics.current?.totalEntries}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            {renderChangeIndicator(analytics.changes.mood)}
          </div>
          <p className="text-sm text-gray-600 mb-1">Humor Médio</p>
          <p className="text-3xl font-bold text-gray-900">{analytics.current?.avgMood.toFixed(1)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            {renderChangeIndicator(analytics.changes.positive)}
          </div>
          <p className="text-sm text-gray-600 mb-1">Taxa Positiva</p>
          <p className="text-3xl font-bold text-gray-900">
            {analytics.current?.totalEntries > 0
              ? ((analytics.current?.positiveEntries / analytics.current?.totalEntries) * 100).toFixed(0)
              : 0}%
          </p>
        </motion.div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Linha do Tempo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Linha do Tempo - Humor</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              />
              <YAxis domain={[0, 5]} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                formatter={(value: number) => [value.toFixed(2), 'Humor']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgMood"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Humor Médio"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Gráfico de Pizza - Distribuição de Sentimentos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição de Sentimentos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Cards de Alertas e Engajamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card de Alertas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Alertas de Humor ({alerts.length})
            </h3>
          </div>

          {alerts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum alerta no momento 🎉</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {alerts.slice(0, 10).map((alert) => (
                <div
                  key={alert.userId}
                  className={cn(
                    "p-4 rounded-lg border-l-4",
                    alert.severity === 'high'
                      ? "bg-red-50 border-red-500"
                      : "bg-orange-50 border-orange-500"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{alert.userName}</p>
                      <p className="text-sm text-gray-600">{alert.userEmail}</p>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        "px-2 py-1 rounded text-sm font-medium",
                        alert.severity === 'high' ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                      )}>
                        Humor: {alert.avgMood.toFixed(1)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{alert.entriesCount} entradas</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Card de Engajamento */}
        {engagement && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center space-x-2 mb-6">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Taxa de Engajamento</h3>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Engajamento Geral</span>
                  <span className="text-lg font-bold text-blue-600">
                    {engagement?.engagementRate.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${engagement?.engagementRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {engagement?.activeUsers} de {engagement?.totalUsers} usuários ativos
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Ativos Diariamente</span>
                  <span className="text-lg font-bold text-green-600">
                    {engagement?.dailyActiveRate.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${engagement?.dailyActiveRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {engagement?.veryActiveUsers} usuários muito ativos (últimos 7 dias)
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{engagement?.totalUsers}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{engagement?.activeUsers}</p>
                  <p className="text-xs text-gray-500">Ativos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{engagement?.veryActiveUsers}</p>
                  <p className="text-xs text-gray-500">Muito Ativos</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
