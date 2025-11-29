import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Plus, Edit, Trash2, Save, Building2, User, X, Search, Filter } from 'lucide-react'
import { API_BASE_URL } from '@/config/api'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

interface Department {
  id: string
  name: string
  company_id: string
  company_name?: string
  description?: string
  parent_department_id?: string
  parent_name?: string
  manager_id?: string
  manager_name?: string
  created_at: string
}

interface Company {
  id: string
  name: string
}

interface User {
  id: string
  name: string
  email: string
  company?: string
}

export default function DepartmentsSection() {
  const { user } = useAuth()
  const [departments, setDepartments] = useState<Department[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('all')
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    company_id: '',
    description: '',
    parent_department_id: '',
    manager_id: ''
  })

  useEffect(() => {
    loadData()
  }, [selectedCompanyFilter])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [depsRes, compsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/departments${selectedCompanyFilter !== 'all' ? `?companyId=${selectedCompanyFilter}` : ''}`),
        fetch(`${API_BASE_URL}/admin/companies`),
        fetch(`${API_BASE_URL}/admin/users`)
      ])

      const depsData = await depsRes.json()
      const compsData = await compsRes.json()
      const usersData = await usersRes.json()

      setDepartments(depsData.departments || [])
      setCompanies(compsData.companies || [])
      setUsers(usersData.users || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setIsCreating(true)
    setEditingDepartment(null)
    setEditForm({
      name: '',
      company_id: selectedCompanyFilter !== 'all' ? selectedCompanyFilter : '',
      description: '',
      parent_department_id: '',
      manager_id: ''
    })
  }

  const handleEdit = (dept: Department) => {
    setIsCreating(false)
    setEditingDepartment(dept)
    setEditForm({
      name: dept.name,
      company_id: dept.company_id,
      description: dept.description || '',
      parent_department_id: dept.parent_department_id || '',
      manager_id: dept.manager_id || ''
    })
  }

  const handleSave = async () => {
    try {
      if (!editForm.name || !editForm.company_id) {
        alert('Nome e empresa são obrigatórios')
        return
      }

      if (isCreating) {
        const response = await fetch(`${API_BASE_URL}/admin/departments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...editForm,
            parent_department_id: editForm.parent_department_id || null,
            manager_id: editForm.manager_id || null,
            adminUserId: user?.id,
            adminEmail: user?.email
          })
        })

        if (response.ok) {
          await loadData()
          setIsCreating(false)
          alert('Departamento criado com sucesso!')
        } else {
          const error = await response.json()
          alert(`Erro: ${error.details || error.error}`)
        }
      } else if (editingDepartment) {
        const response = await fetch(`${API_BASE_URL}/admin/departments/${editingDepartment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...editForm,
            parent_department_id: editForm.parent_department_id || null,
            manager_id: editForm.manager_id || null,
            adminUserId: user?.id,
            adminEmail: user?.email
          })
        })

        if (response.ok) {
          await loadData()
          setEditingDepartment(null)
          alert('Departamento atualizado com sucesso!')
        } else {
          alert('Erro ao atualizar departamento')
        }
      }
    } catch (error) {
      console.error('Erro ao salvar departamento:', error)
      alert('Erro ao salvar departamento')
    }
  }

  const handleDelete = async (deptId: string, deptName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o departamento ${deptName}?`)) return

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/departments/${deptId}?adminUserId=${user?.id}&adminEmail=${user?.email}&departmentName=${deptName}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        await loadData()
        alert('Departamento excluído com sucesso!')
      } else {
        alert('Erro ao excluir departamento')
      }
    } catch (error) {
      console.error('Erro ao excluir departamento:', error)
      alert('Erro ao excluir departamento')
    }
  }

  const getAvailableParentDepartments = () => {
    if (!editForm.company_id) return []
    return departments.filter(d =>
      d.company_id === editForm.company_id &&
      (!editingDepartment || d.id !== editingDepartment.id)
    )
  }

  const getAvailableManagers = () => {
    if (!editForm.company_id) return []
    return users.filter(u => u.company === companies.find(c => c.id === editForm.company_id)?.name)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-neutral-500">Carregando departamentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headings font-bold text-neutral-900">Gestão de Departamentos</h2>
          <p className="text-neutral-500 mt-1">Gerencie os departamentos e sua hierarquia</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <select
              value={selectedCompanyFilter}
              onChange={(e) => setSelectedCompanyFilter(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none shadow-sm appearance-none cursor-pointer hover:bg-neutral-50 transition-colors"
            >
              <option value="all">Todas as empresas</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCreate}
            className="px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Departamento</span>
          </button>
        </div>
      </div>

      {/* Departments List */}
      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50/50 border-b border-neutral-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Departamento</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Empresa</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Departamento Pai</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Gestor</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-neutral-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-neutral-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-50 rounded-lg text-primary-600 group-hover:bg-primary-100 transition-colors">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900">{dept.name}</div>
                        {dept.description && (
                          <div className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{dept.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-neutral-400" />
                      <span className="text-neutral-600 text-sm">{dept.company_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {dept.parent_name ? (
                      <span className="px-2.5 py-1 bg-neutral-100 rounded-md text-xs font-medium text-neutral-600">
                        {dept.parent_name}
                      </span>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {dept.manager_name ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700">
                          {dept.manager_name.charAt(0)}
                        </div>
                        <span className="text-sm text-neutral-600">{dept.manager_name}</span>
                      </div>
                    ) : (
                      <span className="text-neutral-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(dept)}
                        className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id, dept.name)}
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

          {departments.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500">Nenhum departamento cadastrado</p>
              <button
                onClick={handleCreate}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium hover:underline"
              >
                Criar primeiro departamento
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(editingDepartment || isCreating) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => {
                setEditingDepartment(null)
                setIsCreating(false)
              }}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                <h2 className="text-xl font-headings font-bold text-neutral-900">
                  {isCreating ? 'Novo Departamento' : 'Editar Departamento'}
                </h2>
                <button
                  onClick={() => {
                    setEditingDepartment(null)
                    setIsCreating(false)
                  }}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Nome do Departamento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      placeholder="Ex: TI, RH, Financeiro"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Empresa <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editForm.company_id}
                      onChange={(e) => setEditForm({ ...editForm, company_id: e.target.value })}
                      className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    >
                      <option value="">Selecione...</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                    rows={3}
                    placeholder="Descreva as responsabilidades do departamento..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Departamento Pai
                    </label>
                    <select
                      value={editForm.parent_department_id}
                      onChange={(e) => setEditForm({ ...editForm, parent_department_id: e.target.value })}
                      className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all disabled:bg-neutral-100 disabled:text-neutral-400"
                      disabled={!editForm.company_id}
                    >
                      <option value="">Nenhum (raiz)</option>
                      {getAvailableParentDepartments().map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Gestor
                    </label>
                    <select
                      value={editForm.manager_id}
                      onChange={(e) => setEditForm({ ...editForm, manager_id: e.target.value })}
                      className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all disabled:bg-neutral-100 disabled:text-neutral-400"
                      disabled={!editForm.company_id}
                    >
                      <option value="">Selecione...</option>
                      {getAvailableManagers().map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setEditingDepartment(null)
                    setIsCreating(false)
                  }}
                  className="px-4 py-2 text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!editForm.name || !editForm.company_id}
                  className={cn(
                    "px-6 py-2 rounded-lg transition-all font-medium flex items-center gap-2 shadow-lg",
                    editForm.name && editForm.company_id
                      ? "bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/20"
                      : "bg-neutral-300 text-neutral-500 cursor-not-allowed shadow-none"
                  )}
                >
                  <Save className="w-4 h-4" />
                  <span>{isCreating ? 'Criar' : 'Salvar'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
