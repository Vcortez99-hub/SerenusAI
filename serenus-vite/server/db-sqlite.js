const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

/**
 * Configuração do banco SQLite para desenvolvimento local
 */
const dbPath = path.join(__dirname, 'essentia-local.db');
const db = new sqlite3.Database(dbPath);

/**
 * Inicializa o banco de dados criando as tabelas necessárias
 */
async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    console.log('🔄 Inicializando banco de dados SQLite...');

    db.serialize(() => {
      // Criar tabela de usuários
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          phone TEXT,
          goals TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          subscription_plan TEXT DEFAULT 'free',
          subscription_status TEXT DEFAULT 'active',
          stripe_customer_id TEXT,
          preferences TEXT DEFAULT '{"notifications": true, "privacy": "private", "reminderTime": "20:00"}',
          mental_health_data TEXT,
          wellness_score TEXT,
          company TEXT DEFAULT 'Geral',
          department TEXT,
          role TEXT,
          is_admin INTEGER DEFAULT 0,
          is_company_manager INTEGER DEFAULT 0,
          cpf TEXT UNIQUE
        );
      `);

      // Criar tabela de entradas do diário
      db.run(`
        CREATE TABLE IF NOT EXISTS diary_entries (
          id TEXT PRIMARY KEY,
          content TEXT NOT NULL,
          whatsapp_number TEXT,
          user_id TEXT,
          user_name TEXT,
          timestamp DATETIME NOT NULL,
          metadata TEXT,
          sentiment_score REAL,
          sentiment_label TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      // Criar tabela de lembretes
      db.run(`
        CREATE TABLE IF NOT EXISTS reminders (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          reminder_time TIME NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      // Criar tabela de logs de auditoria
      db.run(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          user_email TEXT,
          action TEXT NOT NULL,
          entity_type TEXT,
          entity_id TEXT,
          details TEXT,
          ip_address TEXT,
          user_agent TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        );
      `);

      // Criar tabela de terapeutas
      db.run(`
        CREATE TABLE IF NOT EXISTS therapists (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          phone TEXT,
          age INTEGER,
          bio TEXT NOT NULL,
          specialties TEXT NOT NULL,
          credentials TEXT NOT NULL,
          experience_years INTEGER DEFAULT 0,
          status TEXT DEFAULT 'pending',
          profile_image TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          approved_at DATETIME,
          approved_by TEXT,
          FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
        );
      `);

      // Criar tabela de empresas
      db.run(`
        CREATE TABLE IF NOT EXISTS companies (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          settings TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Criar tabela de departamentos (company_id NULL = genérico)
      db.run(`
        CREATE TABLE IF NOT EXISTS departments (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          company_id TEXT,
          description TEXT,
          parent_department_id TEXT,
          manager_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
          FOREIGN KEY (parent_department_id) REFERENCES departments(id) ON DELETE SET NULL,
          FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
        );
      `);

      // Adicionar coluna status se não existir (migration)
      db.run(`
        ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';
      `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.warn('⚠️ Aviso ao adicionar coluna status:', err.message);
        }
      });

      // Adicionar colunas de relacionamento com empresas/departamentos se não existirem
      db.run(`
        ALTER TABLE users ADD COLUMN company_id TEXT;
      `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.warn('⚠️ Aviso ao adicionar coluna company_id:', err.message);
        }
      });

      db.run(`
        ALTER TABLE users ADD COLUMN department_id TEXT;
      `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.warn('⚠️ Aviso ao adicionar coluna department_id:', err.message);
        }
      });

      db.run(`
        ALTER TABLE users ADD COLUMN onboarding_completed INTEGER DEFAULT 0;
      `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.warn('⚠️ Aviso ao adicionar coluna onboarding_completed:', err.message);
        }
      });

      db.run(`
        ALTER TABLE users ADD COLUMN manager_id TEXT;
      `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.warn('⚠️ Aviso ao adicionar coluna manager_id:', err.message);
        }
      });

      // Adicionar coluna cpf se não existir
      db.run(`
        ALTER TABLE users ADD COLUMN cpf TEXT;
      `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.warn('⚠️ Aviso ao adicionar coluna cpf:', err.message);
        } else {
          // Tentar adicionar índice único se a coluna foi adicionada ou já existia
          db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf)`, (err) => {
            if (err) console.warn('⚠️ Aviso ao criar índice cpf:', err.message);
          });
        }
      });

      // Garantir que coluna company existe
      db.run(`
        ALTER TABLE users ADD COLUMN company TEXT DEFAULT 'Geral';
      `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.warn('⚠️ Aviso ao adicionar coluna company:', err.message);
        }
      });

      // Migration: Adicionar colunas faltantes na tabela therapists
      db.run(`ALTER TABLE therapists ADD COLUMN rating REAL DEFAULT 5.0`, (err) => {
        if (err && !err.message.includes('duplicate column')) console.warn('⚠️ Aviso migration rating:', err.message);
      });

      db.run(`ALTER TABLE therapists ADD COLUMN total_sessions INTEGER DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column')) console.warn('⚠️ Aviso migration total_sessions:', err.message);
      });

      db.run(`ALTER TABLE therapists ADD COLUMN price_per_session REAL DEFAULT 150.0`, (err) => {
        if (err && !err.message.includes('duplicate column')) console.warn('⚠️ Aviso migration price_per_session:', err.message);
      });

      // Finalizar inicialização
      db.get("SELECT 1", (err) => {
        if (err) {
          console.error('❌ Erro ao inicializar banco SQLite:', err);
          reject(err);
        } else {
          console.log('✅ Banco de dados SQLite inicializado com sucesso!');
          resolve();
        }
      });
    });
  });
}

/**
 * Executa uma query no banco SQLite
 * Retorna no formato compatível com PostgreSQL (com .rows)
 */
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    // Converter parâmetros do formato PostgreSQL ($1, $2) para SQLite (?, ?)
    let sqliteSql = sql;
    let sqliteParams = params;

    if (sql.includes('$')) {
      sqliteSql = sql.replace(/\$(\d+)/g, '?');
    }

    // Para INSERT...RETURNING, precisamos adaptar
    if (sql.toUpperCase().includes('RETURNING')) {
      // Remover a cláusula RETURNING (suportando quebras de linha)
      const returningMatch = sql.match(/RETURNING\s+([\s\S]+)$/i);
      const returningFields = returningMatch ? returningMatch[1].trim() : '*';
      sqliteSql = sql.replace(/RETURNING\s+[\s\S]+$/i, '');

      // Extrair nome da tabela
      const tableMatch = sql.match(/INSERT\s+INTO\s+([^\s(]+)/i);
      const tableName = tableMatch ? tableMatch[1] : 'users';

      console.log(`🔍 SQLite Emulation: Table=${tableName}, Fields=${returningFields}`);

      db.run(sqliteSql, sqliteParams, function (err) {
        if (err) {
          console.error('❌ SQLite Insert Error:', err);
          reject(err);
        } else {
          // Buscar o registro inserido usando rowid
          const selectSql = `SELECT ${returningFields} FROM ${tableName} WHERE rowid = ?`;
          console.log(`🔍 SQLite Fetching: ${selectSql} (rowid=${this.lastID})`);

          db.get(selectSql, [this.lastID], (err, row) => {
            if (err) {
              console.error('❌ SQLite Fetch Error:', err);
              reject(err);
            } else {
              if (!row) console.warn('⚠️ SQLite: No row found after insert!');
              resolve({ rows: row ? [row] : [], rowCount: this.changes });
            }
          });
        }
      });
    } else {
      db.all(sqliteSql, sqliteParams, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve({ rows: rows || [], rowCount: rows ? rows.length : 0 });
        }
      });
    }
  });
}

/**
 * Executa uma query de inserção/atualização no banco SQLite
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

/**
 * Fecha a conexão com o banco
 */
function close() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        console.log('🔒 Conexão com SQLite fechada');
        resolve();
      }
    });
  });
}

module.exports = {
  initializeDatabase,
  query,
  run,
  close,
  db
};