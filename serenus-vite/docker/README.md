# Docker Setup para EssentIA

Este diretório contém a configuração Docker para o projeto EssentIA, incluindo desenvolvimento e produção.

## Estrutura

```
docker/
├── README.md           # Este arquivo
├── nginx.conf          # Configuração do Nginx para produção
└── init-db/
    └── 01-init.sql     # Script de inicialização do PostgreSQL
```

## Desenvolvimento Local

### Pré-requisitos

- Docker Desktop instalado
- Docker Compose v2+

### Comandos Principais

```bash
# Iniciar todos os serviços
docker-compose up -d

# Iniciar apenas serviços específicos
docker-compose up -d db redis

# Ver logs dos serviços
docker-compose logs -f app

# Parar todos os serviços
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados do banco)
docker-compose down -v

# Rebuild da aplicação
docker-compose build app
docker-compose up -d app
```

### Serviços Disponíveis

| Serviço | Porta | Descrição |
|---------|-------|----------|
| **app** | 3000 | Aplicação React (Vite) |
| **db** | 5432 | PostgreSQL 15 |
| **redis** | 6379 | Redis para cache |
| **adminer** | 8080 | Interface web para PostgreSQL |
| **mailhog** | 8025 | Interface web para emails de desenvolvimento |

### URLs de Acesso

- **Aplicação**: http://localhost:3000
- **Adminer (DB)**: http://localhost:8080
- **MailHog**: http://localhost:8025

### Configuração do Banco

**Credenciais de desenvolvimento:**
- Host: `localhost` (ou `db` dentro do container)
- Porta: `5432`
- Database: `essentia_dev`
- Usuário: `essentia`
- Senha: `essentia_password`

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
# Database
DATABASE_URL=postgresql://essentia:essentia_password@localhost:5432/essentia_dev

# Redis
REDIS_URL=redis://localhost:6379

# Email (desenvolvimento)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
```

## Produção

### Build de Produção

```bash
# Build da imagem de produção
docker build -t essentia-app .

# Executar container de produção
docker run -p 80:80 essentia-app
```

### Docker Compose para Produção

Crie um `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - db
      - redis
    networks:
      - essentia-network

  db:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: essentia_prod
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    networks:
      - essentia-network

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_prod_data:/data
    networks:
      - essentia-network
    command: redis-server --appendonly yes

volumes:
  postgres_prod_data:
  redis_prod_data:

networks:
  essentia-network:
    driver: bridge
```

## Troubleshooting

### Problemas Comuns

1. **Porta já em uso**
   ```bash
   # Verificar processos usando a porta
   netstat -tulpn | grep :3000
   
   # Parar containers conflitantes
   docker-compose down
   ```

2. **Problemas de permissão (Linux/Mac)**
   ```bash
   # Ajustar permissões do diretório
   sudo chown -R $USER:$USER .
   ```

3. **Banco não inicializa**
   ```bash
   # Verificar logs do PostgreSQL
   docker-compose logs db
   
   # Resetar volume do banco (CUIDADO: apaga dados)
   docker-compose down -v
   docker volume rm essentia-vite_postgres_data
   ```

4. **Hot reload não funciona**
   - Certifique-se que `CHOKIDAR_USEPOLLING=true` está definido
   - No Windows, pode ser necessário usar WSL2

### Comandos Úteis

```bash
# Executar comandos dentro do container da aplicação
docker-compose exec app npm install
docker-compose exec app npm run test

# Acessar shell do container
docker-compose exec app sh
docker-compose exec db psql -U essentia -d essentia_dev

# Verificar status dos containers
docker-compose ps

# Ver uso de recursos
docker stats

# Limpar recursos não utilizados
docker system prune -a
```

## Monitoramento

### Logs

```bash
# Logs de todos os serviços
docker-compose logs -f

# Logs de um serviço específico
docker-compose logs -f app

# Logs com timestamp
docker-compose logs -f -t app
```

### Health Checks

O Nginx está configurado com um endpoint de health check:

```bash
curl http://localhost/health
```

## Backup e Restore

### Backup do Banco

```bash
# Criar backup
docker-compose exec db pg_dump -U essentia essentia_dev > backup.sql

# Restaurar backup
docker-compose exec -T db psql -U essentia essentia_dev < backup.sql
```

### Backup dos Volumes

```bash
# Backup do volume do PostgreSQL
docker run --rm -v essentia-vite_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restaurar volume
docker run --rm -v essentia-vite_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```