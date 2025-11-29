import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Plus, Edit, Trash2, Save, X, Settings, Search } from 'lucide-react'
import { API_BASE_URL } from '@/config/api'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

interface Company {
  id: string
  name: string
  description?: string
  settings?: any
  created_at: string
  updated_at: string
}

export default function CompaniesSection() {
  const { user } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    settings: {}
  })

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/companies`)
      const data = await response.json()
      setCompanies(data.companies || [])
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setIsCreating(true)
    setEditingCompany(null)
    setEditForm({ name: '', description: '', settings: {} })
  }

  const handleEdit = (company: Company) => {
    setIsCreating(false)
    setEditingCompany(company)
    setEditForm({
      name: company.name,
      description: company.description || '',
      settings: company.settings || {}
    })
  }

  const handleSave = async () => {
    try {
      if (isCreating) {
        const response = await fetch(`${API_BASE_URL}/admin/companies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...editForm,
            adminUserId: user?.id,
            adminEmail: user?.email
          })
        })

        if (response.ok) {
          await loadCompanies()
          setIsCreating(false)
          alert('Empresa criada com sucesso!')
        } else {
          const error = await response.json()
          alert(`Erro: ${error.details || error.error}`)
        }
      } else if (editingCompany) {
        const response = await fetch(`${API_BASE_URL}/admin/companies/${editingCompany.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...editForm,
            adminUserId: user?.id,
            adminEmail: user?.email
          })
        })

        if (response.ok) {
          await loadCompanies()
          setEditingCompany(null)
          alert('Empresa atualizada com sucesso!')
        } else {
          alert('Erro ao atualizar empresa')
        }
      }
    } catch (error) {
      console.error('Erro ao salvar empresa:', error)
      alert('Erro ao salvar empresa')
    }
  }

  const handleDelete = async (companyId: string, companyName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a empresa ${companyName}? Isso irá afetar todos os departamentos e usuários vinculados.`)) return

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/companies/${companyId}?adminUserId=${user?.id}&adminEmail=${user?.email}&companyName=${companyName}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        await loadCompanies()
        alert('Empresa excluída com sucesso!')
      } else {
        alert('Erro ao excluir empresa')
      }
    } catch (error) {
      console.error('Erro ao excluir empresa:', error)
      alert('Erro ao excluir empresa')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-neutral-500">Carregando empresas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headings font-bold text-neutral-900">Gestão de Empresas</h2>
          <p className="text-neutral-500 mt-1">Gerencie as empresas cadastradas no sistema</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 flex items-center gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Empresa</span>
        </button>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium p-6 group hover:border-primary-200 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-50 rounded-xl group-hover:bg-primary-100 transition-colors">
                  <Building2 className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-headings font-bold text-neutral-900 text-lg">{company.name}</h3>
                  <p className="text-xs text-neutral-400">
                    Criada em {new Date(company.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            {company.description && (
              <p className="text-neutral-600 text-sm mb-6 line-clamp-2 min-h-[2.5rem]">{company.description}</p>
            )}

            <div className="flex items-center gap-2 pt-4 border-t border-neutral-100">
              <button
                onClick={() => handleEdit(company)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-neutral-50 text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors text-sm font-medium"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => handleDelete(company.id, company.name)}
                className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir empresa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}

        {companies.length === 0 && (
          <div className="col-span-full text-center py-12 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
            <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 font-medium">Nenhuma empresa cadastrada</p>
            <button
              onClick={handleCreate}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium hover:underline"
            >
              Criar primeira empresa
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(editingCompany || isCreating) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => {
                setEditingCompany(null)
                setIsCreating(false)
              }}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-xl w-full relative z-10 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                <h2 className="text-xl font-headings font-bold text-neutral-900">
                  {isCreating ? 'Nova Empresa' : 'Editar Empresa'}
                </h2>
                <button
                  onClick={() => {
                    setEditingCompany(null)
                    setIsCreating(false)
                  }}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Nome da Empresa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    placeholder="Ex: Acme Corporation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                    rows={4}
                    placeholder="Descreva a empresa..."
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setEditingCompany(null)
                    setIsCreating(false)
                  }}
                  className="px-4 py-2 text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!editForm.name}
                  className={cn(
                    "px-6 py-2 rounded-lg transition-all font-medium flex items-center gap-2 shadow-lg",
                    editForm.name
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
