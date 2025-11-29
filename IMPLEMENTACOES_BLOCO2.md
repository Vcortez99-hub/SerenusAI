# BLOCO 2 - Gestão Avançada de Usuários
## Implementações Necessárias

### 1. ✅ Busca e Filtros - JÁ IMPLEMENTADO
- searchTerm já adicionado no Admin.tsx
- Filtrar usuários por nome ou email

### 2. Exportar Usuários para CSV

Adicionar ao Admin.tsx na seção de usuários:

```tsx
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
```

Adicionar botão na interface:
```tsx
<button
  onClick={exportUsersToCSV}
  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
  <Download className="w-4 h-4" />
  <span>Exportar CSV</span>
</button>
```

### 3. Importação em Massa CSV

Adicionar ao Admin.tsx:

```tsx
const [importFile, setImportFile] = useState<File | null>(null)

const handleImportCSV = async () => {
  if (!importFile) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    const text = e.target?.result as string
    const lines = text.split('\n').slice(1) // Pula cabeçalho

    for (const line of lines) {
      if (!line.trim()) continue

      const [name, email, password, company, department, role] = line.split(',')

      try {
        await fetch(`${API_BASE_URL}/admin/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password: password.trim(),
            company: company?.trim(),
            department: department?.trim(),
            role: role?.trim(),
            is_admin: false,
            is_company_manager: false,
            adminUserId: user?.id,
            adminEmail: user?.email
          })
        })
      } catch (error) {
        console.error('Erro ao importar usuário:', error)
      }
    }

    await loadData()
    alert('Importação concluída!')
  }

  reader.readAsText(importFile)
}
```

Interface:
```tsx
<div className="flex items-center space-x-4">
  <input
    type="file"
    accept=".csv"
    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
  />
  <button
    onClick={handleImportCSV}
    disabled={!importFile}
    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
  >
    Importar
  </button>
</div>
```

### 4. Suspender/Ativar Usuário

Adicionar coluna `status` ao banco (db-sqlite.js):
```sql
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';
```

Endpoint no backend (index.js):
```javascript
app.patch('/api/admin/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status, adminUserId, adminEmail } = req.body

    await dbModule.query('UPDATE users SET status = $1 WHERE id = $2', [status, id])

    await createAuditLog(
      adminUserId,
      adminEmail,
      status === 'active' ? 'ACTIVATE_USER' : 'SUSPEND_USER',
      'user',
      id,
      { status },
      req
    )

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

Interface Admin.tsx:
```tsx
const handleToggleStatus = async (userId: string, currentStatus: string) => {
  const newStatus = currentStatus === 'active' ? 'suspended' : 'active'

  try {
    await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        adminUserId: user?.id,
        adminEmail: user?.email
      })
    })

    await loadData()
  } catch (error) {
    console.error('Erro:', error)
  }
}
```

### 5. Filtros Avançados na Tabela

Implementar filtro por busca:
```tsx
const filteredUsersBySearch = users.filter(u =>
  u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
  (u.company && u.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
  (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()))
)
```

Barra de busca:
```tsx
<div className="relative mb-4">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
  <input
    type="text"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    placeholder="Buscar por nome, email, empresa ou departamento..."
    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>
```

### 6. Histórico de Atividade do Usuário

Endpoint backend:
```javascript
app.get('/api/admin/users/:id/activity', async (req, res) => {
  try {
    const { id } = req.params

    // Buscar logs de auditoria
    const logs = await dbModule.query(
      'SELECT * FROM audit_logs WHERE entity_id = $1 OR user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [id]
    )

    // Buscar entradas do diário
    const entries = await dbModule.query(
      'SELECT id, timestamp, sentiment_score FROM diary_entries WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 20',
      [id]
    )

    res.json({
      success: true,
      logs: logs.rows,
      entries: entries.rows
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

## RESUMO - O QUE IMPLEMENTAR

1. ✅ Busca já adicionada
2. Adicionar botão exportar CSV
3. Adicionar importação CSV com input file
4. Adicionar coluna status e endpoint PATCH
5. Implementar filtro de busca na renderização
6. Criar modal de histórico de atividade

## PRÓXIMO PASSO
Implementar estas funções no Admin.tsx e testar cada uma.
