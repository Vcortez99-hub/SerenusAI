const { Pool } = require('pg');
require('dotenv').config();

/**
 * Configuração do pool de conexões PostgreSQL
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Inicializa o banco de dados criando as tabelas necessárias
 */
async function initializeDatabase() {
  const client = await pool.connect();

  try {
    console.log('🔄 Inicializando banco de dados PostgreSQL...');

    // Criar tabela de usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        goals TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        subscription_plan VARCHAR(50) DEFAULT 'free',
        subscription_status VARCHAR(50) DEFAULT 'active',
        stripe_customer_id VARCHAR(255),
        preferences JSONB DEFAULT '{"notifications": true, "privacy": "private", "reminderTime": "20:00"}'::jsonb,
        mental_health_data JSONB,
        wellness_score JSONB,
        is_admin INTEGER DEFAULT 0
      );
    `);

    // Criar índices para melhor performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    `);

    // Criar tabela de entradas do diário
    await client.query(`
      CREATE TABLE IF NOT EXISTS diary_entries (
        id VARCHAR(255) PRIMARY KEY,
        content TEXT NOT NULL,
        whatsapp_number VARCHAR(50),
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        user_name VARCHAR(255),
        timestamp TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sentiment VARCHAR(50),
        sentiment_confidence FLOAT,
        sentiment_explanation TEXT,
        metadata JSONB DEFAULT '{}'::jsonb
      );
    `);

    // Criar índices para entradas do diário
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_diary_user_id ON diary_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_diary_whatsapp ON diary_entries(whatsapp_number);
      CREATE INDEX IF NOT EXISTS idx_diary_timestamp ON diary_entries(timestamp DESC);
    `);

    // Criar tabela de terapeutas
    await client.query(`
      CREATE TABLE IF NOT EXISTS therapists (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone VARCHAR(20),
        age INTEGER,
        photo_url TEXT,
        bio TEXT,
        specialties TEXT[],
        credentials TEXT,
        experience_years INTEGER,
        status VARCHAR(20) DEFAULT 'pending',
        price_per_session DECIMAL(10,2) DEFAULT 49.90,
        availability JSONB,
        rating DECIMAL(3,2) DEFAULT 0.00,
        total_sessions INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_by VARCHAR(255),
        approved_at TIMESTAMP,
        rejection_reason TEXT
      );
    `);

    // Criar tabela de sessões de terapia
    await client.query(`
      CREATE TABLE IF NOT EXISTS therapy_sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        therapist_id VARCHAR(255) REFERENCES therapists(id) ON DELETE CASCADE,
        scheduled_at TIMESTAMP NOT NULL,
        duration_minutes INTEGER DEFAULT 50,
        status VARCHAR(20) DEFAULT 'scheduled',
        meeting_link TEXT,
        payment_status VARCHAR(20) DEFAULT 'pending',
        payment_id VARCHAR(255),
        amount DECIMAL(10,2) DEFAULT 49.90,
        notes TEXT,
        user_rating INTEGER,
        user_feedback TEXT,
        therapist_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        cancelled_at TIMESTAMP,
        cancelled_by VARCHAR(255),
        cancellation_reason TEXT
      );
    `);

    // Criar índices para terapeutas
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_therapists_status ON therapists(status);
      CREATE INDEX IF NOT EXISTS idx_therapists_email ON therapists(email);
      CREATE INDEX IF NOT EXISTS idx_therapy_sessions_user_id ON therapy_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_therapy_sessions_therapist_id ON therapy_sessions(therapist_id);
      CREATE INDEX IF NOT EXISTS idx_therapy_sessions_scheduled_at ON therapy_sessions(scheduled_at);
      CREATE INDEX IF NOT EXISTS idx_therapy_sessions_status ON therapy_sessions(status);
    `);

    console.log('✅ Banco de dados PostgreSQL inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Executa uma query no banco de dados
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Query executada:', { text: text.substring(0, 50) + '...', duration, rows: res.rowCount });
    }

    return res;
  } catch (error) {
    console.error('❌ Erro na query:', error);
    throw error;
  }
}

/**
 * Obtém um cliente do pool para transações
 */
async function getClient() {
  const client = await pool.connect();
  const originalQuery = client.query;
  const originalRelease = client.release;

  // Adicionar timeout para queries
  const timeout = setTimeout(() => {
    console.error('❌ Cliente mantido por mais de 5 segundos!');
  }, 5000);

  // Wrapper para liberar o cliente corretamente
  client.release = () => {
    clearTimeout(timeout);
    client.query = originalQuery;
    client.release = originalRelease;
    return originalRelease.apply(client);
  };

  return client;
}

/**
 * Fecha o pool de conexões
 */
async function closePool() {
  await pool.end();
  console.log('🔒 Pool de conexões PostgreSQL fechado');
}

module.exports = {
  query,
  getClient,
  pool,
  initializeDatabase,
  closePool
};
