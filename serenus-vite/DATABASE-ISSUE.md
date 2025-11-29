# PROBLEMA IDENTIFICADO: PostgreSQL não está rodando

## Erro
```
ECONNREFUSED na porta 5432
```

O banco de dados PostgreSQL não está ativo na sua máquina.

## SOLUÇÕES

### Opção 1: Iniciar PostgreSQL (se já instalado)
```bash
# Windows - PowerShell como Admin:
net start postgresql-x64-14

# OU
pg_ctl start -D "C:\Program Files\PostgreSQL\14\data"
```

### Opção 2: Converter para SQLite (RECOMENDADO - mais simples)
- Não precisa de servidor rodando
- Arquivo local
- Mais fácil de gerenciar
- Posso converter automaticamente

### Opção 3: Instalar PostgreSQL
Se não tiver instalado, baixar em: https://www.postgresql.org/download/windows/

## PRÓXIMO PASSO
Escolha uma opção e me avise para eu continuar!
