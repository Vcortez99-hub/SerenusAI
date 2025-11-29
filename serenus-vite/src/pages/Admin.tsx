import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import {
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  Activity,
  Download,
  Upload,
  RefreshCw,
  Shield,
  Filter,
  Menu,
  X,
  Edit,
  Trash2,
  Plus,
  Settings as SettingsIcon,
  LayoutDashboard,
  Save,
  Search,
  Ban,
  CheckCircle,
  Key,
  History,
  ArrowRight,
  AlertCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { API_BASE_URL } from '@/config/api'
import { useAuth } from '@/contexts/AuthContext'
import CompaniesSection from '@/components/admin/CompaniesSection'
import DepartmentsSection from '@/components/admin/DepartmentsSection'
import EnhancedDashboard from '@/components/admin/EnhancedDashboard'
import ExecutiveDashboard from '@/components/admin/ExecutiveDashboard'
import CompanyActivitiesSettings from '@/components/admin/CompanyActivitiesSettings'


interface User {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  department?: string
  role?: string
  is_admin: number
  is_company_manager: number
  status?: string
  created_at: string
}

interface DiaryEntry {
  id: string
  user_name: string
  content: string
  timestamp: string
  sentiment_score: number
  user_id: string
}

interface DepartmentStats {
  department: string
  totalUsers: number
  totalEntries: number
  avgMood: number
  positiveRate: number
}

interface AuditLog {
  id: string
  user_id: string
  user_email: string
  action: string
  entity_type: string
  entity_id: string
  details: string
  ip_address: string
  user_agent: string
  created_at: string
}

type SidebarSection = 'dashboard' | 'users' | 'therapists' | 'companies' | 'departments' | 'settings'

export default function Admin() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState<SidebarSection>('dashboard')
  const [searchTerm, setSearchTerm] = useState('')

  // Filtros
  const [selectedCompany, setSelectedCompany] = useState<string>('all')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [companiesList, setCompaniesList] = useState<string[]>([]);
  const [departmentsList, setDepartmentsList] = useState<{ id: string, name: string, company: string }[]>([]);

  // Derivar listas de companies e departments dos dados carregados
  const companies = ['all', ...companiesList];
  const departments = ['all', ...departmentsList.filter(d => selectedCompany === 'all' || d.company === selectedCompany).map(d => d.name)];

  // Modal de edição/criação
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    company: '',
    department: '',
    role: '',
    password: '',
    is_admin: false,
    is_company_manager: false
  })

  // Modal de histórico de atividades
  const [viewingHistory, setViewingHistory] = useState<User | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [usersRes, entriesRes, companiesRes, departmentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/users`),
        fetch(`${API_BASE_URL}/admin/entries`),
        fetch(`${API_BASE_URL}/companies`),
        fetch(`${API_BASE_URL}/departments`)
      ])

      const usersData = await usersRes.json()
      const entriesData = await entriesRes.json()
      const companiesData = await companiesRes.json()
      const departmentsData = await departmentsRes.json()

      setUsers(usersData.users || [])
      setEntries(entriesData.entries || [])
      setCompaniesList((companiesData.companies || []).map((c: any) => c.name))
      setDepartmentsList(departmentsData.departments || [])

      console.log('✅ Empresas carregadas:', companiesData.companies)
      console.log('✅ Departamentos carregados:', departmentsData.departments)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = () => {
    setIsCreating(true)
    setEditingUser(null)
    setEditForm({
      name: '',
      email: '',
      company: '',
      department: '',
      role: '',
      password: '',
      is_admin: false,
      is_company_manager: false
    })
  }

  const handleEditUser = (user: User) => {
    setIsCreating(false)
    setEditingUser(user)
    setEditForm({
      name: user.name,
      email: user.email,
      company: user.company || '',
      department: user.department || '',
      role: user.role || '',
      password: '',
      is_admin: user.is_admin === 1,
      is_company_manager: user.is_company_manager === 1
    })
  }

  const handleSaveUser = async () => {
    try {
      if (isCreating) {
        // Criar novo usuário
        if (!editForm.password) {
          alert('Senha é obrigatória para novos usuários')
          return
        }

        const response = await fetch(`${API_BASE_URL}/admin/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...editForm,
            adminUserId: user?.id,
            adminEmail: user?.email
          })
        })

        if (response.ok) {
          await loadData()
          setIsCreating(false)
          alert('Usuário criado com sucesso!')
        } else {
          const error = await response.json()
          alert(`Erro ao criar usuário: ${error.details || error.error}`)
        }
      } else {
        // Atualizar usuário existente
        if (!editingUser) return

        const response = await fetch(`${API_BASE_URL}/admin/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...editForm,
            adminUserId: user?.id,
            adminEmail: user?.email
          })
        })

        if (response.ok) {
          await loadData()
          setEditingUser(null)
          alert('Usuário atualizado com sucesso!')
        } else {
          alert('Erro ao atualizar usuário')
        }
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
      alert('Erro ao salvar usuário')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find(u => u.id === userId)
    if (!confirm(`Tem certeza que deseja excluir o usuário ${userToDelete?.name || userId}?`)) return

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/users/${userId}?adminUserId=${user?.id}&adminEmail=${user?.email}&userName=${userToDelete?.name}&userEmail=${userToDelete?.email}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        await loadData()
        alert('Usuário excluído com sucesso!')
      } else {
        alert('Erro ao excluir usuário')
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      alert('Erro ao excluir usuário')
    }
  }

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const userToToggle = users.find(u => u.id === userId)
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended'
    const action = newStatus === 'suspended' ? 'suspender' : 'ativar'

    if (!confirm(`Tem certeza que deseja ${action} o usuário ${userToToggle?.name || userId}?`)) return

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          adminUserId: user?.id,
          adminEmail: user?.email
        })
      })

      if (response.ok) {
        await loadData()
        alert(`Usuário ${newStatus === 'suspended' ? 'suspenso' : 'ativado'} com sucesso!`)
      } else {
        const error = await response.json()
        alert(`Erro ao alterar status: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      alert('Erro ao alterar status do usuário')
    }
  }

  const handleResetPassword = async (userId: string) => {
    const userToReset = users.find(u => u.id === userId)
    const newPassword = prompt(`Digite a nova senha para ${userToReset?.name || userToReset?.email}:`)

    if (!newPassword) return
    if (newPassword.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword,
          adminUserId: user?.id,
          adminEmail: user?.email
        })
      })

      if (response.ok) {
        alert(`Senha resetada com sucesso!\n\nNova senha: ${newPassword}\n\nEnvie esta senha para ${userToReset?.email}`)
      } else {
        const error = await response.json()
        alert(`Erro ao resetar senha: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao resetar senha:', error)
      alert('Erro ao resetar senha do usuário')
    }
  }

  const handleViewHistory = async (targetUser: User) => {
    setViewingHistory(targetUser)
    setLoadingHistory(true)
    setAuditLogs([])

    try {
      const response = await fetch(`${API_BASE_URL}/admin/audit-logs?userId=${targetUser.id}&limit=50`)
      const data = await response.json()

      if (data.success) {
        setAuditLogs(data.logs || [])
      } else {
        console.error('Erro ao carregar histórico:', data.error)
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const getActionLabel = (action: string) => {
    const actions: Record<string, string> = {
      'CREATE_USER': 'Criou usuário',
      'UPDATE_USER': 'Atualizou usuário',
      'DELETE_USER': 'Excluiu usuário',
      'SUSPEND_USER': 'Suspendeu usuário',
      'ACTIVATE_USER': 'Ativou usuário',
      'RESET_PASSWORD': 'Resetou senha',
      'LOGIN': 'Login realizado',
      'CREATE_DIARY_ENTRY': 'Criou entrada no diário',
      'COMPLETE_ACTIVITY': 'Completou atividade',
      'CHAT_MESSAGE': 'Conversou com IA',
      'REGISTER_MOOD': 'Registrou humor'
    }
    return actions[action] || action
  }

  // Obter listas únicas
  const filterCompanies = ['all', ...new Set(users.map(u => u.company).filter(Boolean))]
  const filterDepartments = ['all', ...new Set(
    users
      .filter(u => selectedCompany === 'all' || u.company === selectedCompany)
      .map(u => u.department)
      .filter(Boolean)
  )]

  // Filtrar dados
  const filteredUsers = users.filter(u =>
    (selectedCompany === 'all' || u.company === selectedCompany) &&
    (selectedDepartment === 'all' || u.department === selectedDepartment)
  )

  const filteredUserIds = new Set(filteredUsers.map(u => u.id))
  const filteredEntries = entries.filter(e => filteredUserIds.has(e.user_id))

  // Calcular métricas
  const totalUsers = filteredUsers.length
  const totalEntries = filteredEntries.length
  const avgMood = filteredEntries.length > 0
    ? filteredEntries.reduce((sum, e) => sum + (e.sentiment_score || 3), 0) / filteredEntries.length
    : 3

  const positiveEntries = filteredEntries.filter(e => (e.sentiment_score || 3) >= 4).length
  const negativeEntries = filteredEntries.filter(e => (e.sentiment_score || 3) <= 2).length
  const neutralEntries = filteredEntries.filter(e => (e.sentiment_score || 3) === 3).length

  // Métricas por departamento
  const departmentStats: DepartmentStats[] = departments
    .filter(d => d !== 'all')
    .map(dept => {
      const deptUsers = users.filter(u =>
        u.department === dept &&
        (selectedCompany === 'all' || u.company === selectedCompany)
      )
      const deptUserIds = new Set(deptUsers.map(u => u.id))
      const deptEntries = entries.filter(e => deptUserIds.has(e.user_id))

      const avgMood = deptEntries.length > 0
        ? deptEntries.reduce((sum, e) => sum + (e.sentiment_score || 3), 0) / deptEntries.length
        : 3

      const positive = deptEntries.filter(e => (e.sentiment_score || 3) >= 4).length
      const positiveRate = deptEntries.length > 0 ? (positive / deptEntries.length) * 100 : 0

      return {
        department: dept,
        totalUsers: deptUsers.length,
        totalEntries: deptEntries.length,
        avgMood,
        positiveRate
      }
    })
    .sort((a, b) => b.totalEntries - a.totalEntries)

  const exportToCSV = () => {
    const csv = [
      ['Departamento', 'Usuários', 'Entradas', 'Humor Médio', '% Positivo'],
      ...departmentStats.map(d => [
        d.department,
        d.totalUsers,
        d.totalEntries,
        d.avgMood.toFixed(2),
        d.positiveRate.toFixed(1) + '%'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `metricas-${selectedCompany}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const exportUsersToCSV = () => {
    const csv = [
      ['Nome', 'Email', 'Empresa', 'Departamento', 'Cargo', 'Permissões', 'Data Criação'],
      ...users.map(u => [
        u.name,
        u.email,
        u.company || '-',
        u.department || '-',
        u.role || '-',
        u.is_admin === 1 ? 'Admin' : u.is_company_manager === 1 ? 'Gestor' : 'Usuário',
        new Date(u.created_at).toLocaleDateString('pt-BR')
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `usuarios-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Filtrar usuários por empresa, departamento E busca
  const filteredUsersBySearch = users.filter(u => {
    // Filtro de empresa
    const matchesCompany = selectedCompany === 'all' || u.company === selectedCompany;

    // Filtro de departamento
    const matchesDepartment = selectedDepartment === 'all' || u.department === selectedDepartment;

    // Filtro de busca por texto
    const matchesSearch = searchTerm === '' ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.company && u.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCompany && matchesDepartment && matchesSearch;
  })

  // Importar usuários de CSV
  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())

        // Pular a primeira linha (cabeçalho)
        const dataLines = lines.slice(1)

        let successCount = 0
        let errorCount = 0
        const errors: string[] = []

        for (const line of dataLines) {
          // Parse CSV (considerando campos entre aspas)
          const fields = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map(field =>
            field.replace(/^"(.*)"$/, '$1').trim()
          ) || []

          if (fields.length < 3) {
            errorCount++
            errors.push(`Linha inválida: ${line.substring(0, 50)}...`)
            continue
          }

          const [name, email, company, department, role, permissions, password] = fields

          // Validar campos obrigatórios
          if (!name || !email) {
            errorCount++
            errors.push(`Email ou nome ausente: ${email || 'sem email'}`)
            continue
          }

          // Determinar permissões
          const is_admin = permissions?.toLowerCase().includes('admin')
          const is_company_manager = permissions?.toLowerCase().includes('gestor')

          try {
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name,
                email,
                company: company || '',
                department: department || '',
                role: role || '',
                password: password || 'senha123', // Senha padrão se não fornecida
                is_admin,
                is_company_manager,
                adminUserId: user?.id,
                adminEmail: user?.email
              })
            })

            if (response.ok) {
              successCount++
            } else {
              const error = await response.json()
              errorCount++
              errors.push(`${email}: ${error.details || error.error}`)
            }
          } catch (error) {
            errorCount++
            errors.push(`${email}: Erro ao criar usuário`)
          }
        }

        // Recarregar dados
        await loadData()

        // Mostrar resultado
        let message = `Importação concluída!\n\n`
        message += `✅ Sucesso: ${successCount} usuários\n`
        message += `❌ Erros: ${errorCount} usuários\n`

        if (errors.length > 0) {
          message += `\nPrimeiros erros:\n${errors.slice(0, 5).join('\n')}`
        }

        alert(message)
      } catch (error) {
        console.error('Erro ao importar CSV:', error)
        alert('Erro ao processar arquivo CSV')
      }
    }

    reader.readAsText(file, 'UTF-8')

    // Resetar input para permitir reimportação do mesmo arquivo
    event.target.value = ''
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex font-sans text-neutral-900 selection:bg-primary-100 selection:text-primary-900">
      {/* Sidebar Backdrop for Mobile */}
      {!sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white/80 backdrop-blur-xl border-r border-neutral-200 transition-all duration-300 ease-in-out flex flex-col shadow-2xl shadow-neutral-200/50",
          sidebarOpen ? "w-72 translate-x-0" : "w-20 -translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-neutral-100">
          {sidebarOpen ? (
            <div className="flex items-center space-x-3 animate-fade-in">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-headings font-bold text-xl text-neutral-900 leading-none">Admin</h2>
                <span className="text-xs font-medium text-primary-600 tracking-wider uppercase">Painel</span>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                <Shield className="w-6 h-6" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'users', icon: Users, label: 'Usuários' },
            { id: 'therapists', icon: Users, label: 'Terapeutas' },
            { id: 'companies', icon: Building2, label: 'Empresas' },
            { id: 'departments', icon: Briefcase, label: 'Departamentos' },
            { id: 'settings', icon: SettingsIcon, label: 'Configurações' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as SidebarSection)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                activeSection === item.id
                  ? "bg-primary-50 text-primary-700 font-semibold shadow-sm ring-1 ring-primary-100"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              {activeSection === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full" />
              )}
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                activeSection === item.id ? "text-primary-600" : "text-neutral-400 group-hover:text-neutral-600"
              )} />
              {sidebarOpen && <span className="animate-fade-in">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-3 top-24 w-6 h-6 bg-white border border-neutral-200 rounded-full flex items-center justify-center text-neutral-400 hover:text-primary-600 hover:border-primary-200 shadow-sm transition-all hidden lg:flex"
          >
            {sidebarOpen ? <X className="w-3 h-3" /> : <Menu className="w-3 h-3" />}
          </button>

          <Link
            to="/dashboard"
            className={cn(
              "flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-xl transition-all duration-200",
              "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 hover:border-neutral-300 shadow-sm hover:shadow"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            {sidebarOpen && <span className="font-medium text-sm">Voltar ao App</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out min-h-screen flex flex-col",
          sidebarOpen ? "lg:ml-72" : "lg:ml-20"
        )}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-neutral-200/60 px-8 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                className="lg:hidden p-2 -ml-2 text-neutral-500 hover:text-neutral-900"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-6 h-6" />
              </button>

              <div>
                <h1 className="text-2xl font-headings font-bold text-neutral-900 tracking-tight">
                  {activeSection === 'dashboard' && 'Dashboard Corporativo'}
                  {activeSection === 'users' && 'Gestão de Usuários'}
                  {activeSection === 'companies' && 'Gestão de Empresas'}
                  {activeSection === 'departments' && 'Gestão de Departamentos'}
                  {activeSection === 'settings' && 'Configurações do Sistema'}
                </h1>
                <p className="text-sm text-neutral-500 mt-0.5">
                  {activeSection === 'dashboard' && 'Visão geral de métricas e indicadores de performance'}
                  {activeSection === 'users' && 'Gerencie o acesso e permissões dos colaboradores'}
                  {activeSection === 'companies' && 'Administração de organizações parceiras'}
                  {activeSection === 'departments' && 'Estrutura organizacional e hierarquias'}
                  {activeSection === 'settings' && 'Preferências globais da aplicação'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {activeSection === 'dashboard' && (
                <button
                  onClick={exportToCSV}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-all shadow-sm text-sm font-medium"
                >
                  <Download className="w-4 h-4 text-neutral-500" />
                  <span>Exportar</span>
                </button>
              )}
              <button
                onClick={loadData}
                className="flex items-center space-x-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/20 transition-all text-sm font-medium active:scale-95"
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                <span>Atualizar</span>
              </button>

              <div className="h-8 w-px bg-neutral-200 mx-2" />

              <div className="flex items-center space-x-3 pl-2">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold text-neutral-900">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-neutral-500">Administrador</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-100 to-primary-200 border-2 border-white shadow-sm flex items-center justify-center text-primary-700 font-bold">
                  {user?.name?.charAt(0) || 'A'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-8 animate-slide-up">

            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <>
                {/* Filtros Modernos */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 mb-8">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                      <Filter className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900">Filtros de Visualização</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-neutral-700">Empresa</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <select
                          value={selectedCompany}
                          onChange={(e) => {
                            setSelectedCompany(e.target.value)
                            setSelectedDepartment('all')
                          }}
                          className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none"
                        >
                          {companies.map(c => (
                            <option key={c} value={c}>{c === 'all' ? 'Todas as Empresas' : c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-neutral-700">Departamento</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <select
                          value={selectedDepartment}
                          onChange={(e) => setSelectedDepartment(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none"
                        >
                          {departments.map(d => (
                            <option key={d} value={d}>{d === 'all' ? 'Todos os Departamentos' : d}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card de Acesso Rápido - Gestão de Terapeutas */}
                <Link
                  to="/admin/therapists"
                  className="block bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg border border-purple-400/20 p-6 mb-8 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Gestão de Terapeutas</h3>
                        <p className="text-purple-100 text-sm">Aprovar, reprovar e cadastrar terapeutas</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-white">
                      <span className="font-medium">Acessar</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>

                <ExecutiveDashboard />
              </>
            )}

            {/* Companies Section */}
            {activeSection === 'companies' && <CompaniesSection />}

            {/* Departments Section */}
            {activeSection === 'departments' && <DepartmentsSection />}

            {/* Therapists Section - Redirect */}
            {activeSection === 'therapists' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg border border-purple-400/20 p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Users className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Gestão de Terapeutas</h2>
                        <p className="text-purple-100">Aprovar, reprovar e cadastrar terapeutas profissionais</p>
                      </div>
                    </div>
                    <Link
                      to="/admin/therapists"
                      className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium shadow-lg flex items-center gap-2"
                    >
                      Acessar Gestão Completa
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Acesso Rápido</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                      to="/admin/therapists"
                      className="p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Ver Todos</p>
                          <p className="text-sm text-gray-600">Lista completa</p>
                        </div>
                      </div>
                    </Link>
                    <Link
                      to="/admin/therapists"
                      className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl hover:bg-yellow-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Pendentes</p>
                          <p className="text-sm text-gray-600">Aguardando aprovação</p>
                        </div>
                      </div>
                    </Link>
                    <Link
                      to="/admin/therapists"
                      className="p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <Plus className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Cadastrar</p>
                          <p className="text-sm text-gray-600">Novo terapeuta</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Users Section */}
            {activeSection === 'users' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por nome, email, empresa..."
                      className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-neutral-400"
                    />
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <label className="flex items-center justify-center space-x-2 px-5 py-3 bg-secondary-50 text-secondary-700 rounded-xl hover:bg-secondary-100 transition-colors cursor-pointer font-medium border border-secondary-200/50">
                      <Upload className="w-4 h-4" />
                      <span>Importar</span>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleImportCSV}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={exportUsersToCSV}
                      className="flex items-center justify-center space-x-2 px-5 py-3 bg-white border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors font-medium shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>CSV</span>
                    </button>
                    <button
                      onClick={handleCreateUser}
                      className="flex items-center justify-center space-x-2 px-5 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/25 transition-all font-medium hover:-translate-y-0.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Novo Usuário</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-card border border-neutral-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-100">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Usuário</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Empresa / Dept</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Função</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {filteredUsersBySearch.map((u) => (
                          <tr key={u.id} className="hover:bg-neutral-50/50 transition-colors group">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold text-sm mr-3 ring-2 ring-white shadow-sm">
                                  {u.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-neutral-900">{u.name}</div>
                                  <div className="text-sm text-neutral-500">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-neutral-900 font-medium">{u.company || '-'}</div>
                              <div className="text-xs text-neutral-500">{u.department || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col gap-1">
                                {u.is_admin === 1 && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 w-fit">
                                    Admin
                                  </span>
                                )}
                                {u.is_company_manager === 1 && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 w-fit">
                                    Gestor
                                  </span>
                                )}
                                <span className="text-sm text-neutral-600">{u.role || 'Colaborador'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                u.status === 'suspended'
                                  ? "bg-red-50 text-red-700 border-red-100"
                                  : "bg-green-50 text-green-700 border-green-100"
                              )}>
                                {u.status === 'suspended' ? 'Suspenso' : 'Ativo'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleViewHistory(u)}
                                  className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                  title="Histórico"
                                >
                                  <History className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEditUser(u)}
                                  className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleResetPassword(u.id)}
                                  className="p-2 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                  title="Resetar Senha"
                                >
                                  <Key className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(u.id, u.status || 'active')}
                                  className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    u.status === 'suspended'
                                      ? "text-green-400 hover:text-green-600 hover:bg-green-50"
                                      : "text-amber-400 hover:text-amber-600 hover:bg-amber-50"
                                  )}
                                  title={u.status === 'suspended' ? 'Ativar' : 'Suspender'}
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredUsersBySearch.length === 0 && (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-neutral-400" />
                      </div>
                      <h3 className="text-lg font-medium text-neutral-900">Nenhum usuário encontrado</h3>
                      <p className="text-neutral-500 mt-1">Tente ajustar seus filtros ou termos de busca.</p>
                    </div>
                  )}
                </div>
              </div>
            )
            }

            {/* Settings Section */}
            {
              activeSection === 'settings' && (
                <CompanyActivitiesSettings />
              )
            }
          </div >
        </div >
      </main >

      {/* Modal de Edição/Criação */}
      <AnimatePresence>
        {
          (editingUser || isCreating) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => {
                  setEditingUser(null)
                  setIsCreating(false)
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                  <h3 className="text-lg font-bold text-neutral-900">
                    {isCreating ? 'Novo Usuário' : 'Editar Usuário'}
                  </h3>
                  <button
                    onClick={() => {
                      setEditingUser(null)
                      setIsCreating(false)
                    }}
                    className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700">Nome</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700">Empresa</label>
                      <input
                        type="text"
                        value={editForm.company}
                        onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                        className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-700">Departamento</label>
                      <input
                        type="text"
                        value={editForm.department}
                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                        className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Cargo/Função</label>
                    <input
                      type="text"
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">
                      {isCreating ? 'Senha' : 'Nova Senha (opcional)'}
                    </label>
                    <input
                      type="password"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                      placeholder={isCreating ? 'Mínimo 6 caracteres' : 'Deixe em branco para manter'}
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <label className="flex items-center space-x-3 p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={editForm.is_admin}
                        onChange={(e) => setEditForm({ ...editForm, is_admin: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
                      />
                      <div>
                        <span className="block text-sm font-medium text-neutral-900">Administrador do Sistema</span>
                        <span className="block text-xs text-neutral-500">Acesso total a todas as configurações</span>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={editForm.is_company_manager}
                        onChange={(e) => setEditForm({ ...editForm, is_company_manager: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
                      />
                      <div>
                        <span className="block text-sm font-medium text-neutral-900">Gestor de Empresa</span>
                        <span className="block text-xs text-neutral-500">Acesso aos dados da própria empresa</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setEditingUser(null)
                      setIsCreating(false)
                    }}
                    className="px-4 py-2 text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveUser}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all font-medium"
                  >
                    Salvar
                  </button>
                </div>
              </motion.div>
            </div>
          )
        }
      </AnimatePresence >

      {/* Modal de Histórico */}
      <AnimatePresence>
        {
          viewingHistory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setViewingHistory(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[80vh]"
              >
                <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">Histórico de Atividades</h3>
                    <p className="text-sm text-neutral-500">{viewingHistory.name}</p>
                  </div>
                  <button
                    onClick={() => setViewingHistory(null)}
                    className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {loadingHistory ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  ) : auditLogs.length > 0 ? (
                    <div className="space-y-6">
                      {auditLogs.map((log) => (
                        <div key={log.id} className="relative pl-6 border-l-2 border-neutral-200 pb-6 last:pb-0">
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-primary-500" />
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-semibold text-neutral-900">{getActionLabel(log.action)}</span>
                            <span className="text-xs text-neutral-400">
                              {new Date(log.created_at).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                            {log.details}
                          </p>
                          <div className="mt-2 flex items-center gap-2 text-xs text-neutral-400">
                            <span>IP: {log.ip_address}</span>
                            <span>•</span>
                            <span>Admin: {log.user_email}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-neutral-500">
                      <History className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                      <p>Nenhum registro encontrado.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )
        }
      </AnimatePresence >
    </div >
  )
}
