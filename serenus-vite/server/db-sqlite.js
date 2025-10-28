const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

/**
 * Configuração do banco SQLite para desenvolvimento local
 */
const dbPath = path.join(__dirname, 'serenus.db');
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
          wellness_score TEXT
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
      `, (err) => {
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
      const returningMatch = sql.match(/RETURNING\s+(.+)$/i);
      const returningFields = returningMatch ? returningMatch[1].trim() : '*';
      sqliteSql = sql.replace(/RETURNING\s+.+$/i, '');

      db.run(sqliteSql, sqliteParams, function(err) {
        if (err) {
          reject(err);
        } else {
          // Buscar o registro inserido
          const selectSql = `SELECT ${returningFields} FROM users WHERE rowid = ?`;
          db.get(selectSql, [this.lastID], (err, row) => {
            if (err) {
              reject(err);
            } else {
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
    db.run(sql, params, function(err) {
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