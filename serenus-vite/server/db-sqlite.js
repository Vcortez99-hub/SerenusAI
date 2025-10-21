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
          phone TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          subscription_plan TEXT DEFAULT 'free',
          subscription_status TEXT DEFAULT 'active',
          stripe_customer_id TEXT,
          preferences TEXT DEFAULT '{"notifications": true, "privacy": "private", "reminderTime": "20:00"}'
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
 */
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
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