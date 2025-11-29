/**
 * Script de inicialização do banco PostgreSQL para Render
 *
 * Este script:
 * 1. Cria todas as tabelas necessárias
 * 2. Cria a empresa "General" padrão
 * 3. Insere dados iniciais (conquistas, etc)
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initializeDatabase() {
  const client = await pool.connect();

  try {
    console.log('🔄 Inicializando banco de dados PostgreSQL...');

    // =========================================================================
    // TABELAS PRINCIPAIS
    // =========================================================================

    // Tabela de empresas (CRIAR PRIMEIRO)
    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        settings JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela companies criada');

    // Tabela de usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        cpf VARCHAR(14) UNIQUE,
        goals TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        subscription_plan VARCHAR(50) DEFAULT 'free',
        subscription_status VARCHAR(50) DEFAULT 'active',
        stripe_customer_id VARCHAR(255),
        preferences JSONB DEFAULT '{"notifications": true, "privacy": "private", "reminderTime": "20:00"}'::jsonb,
        mental_health_data JSONB,
        wellness_score JSONB,
        company VARCHAR(255) DEFAULT 'General',
        department VARCHAR(255),
        role VARCHAR(255),
        is_admin INTEGER DEFAULT 0,
        is_company_manager INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        FOREIGN KEY (company) REFERENCES companies(name) ON DELETE SET DEFAULT
      );
    `);
    console.log('✅ Tabela users criada');

    // Índices de users
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
      CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);
      CREATE INDEX IF NOT EXISTS idx_users_company ON users(company);
    `);

    // Tabela de departamentos
    await client.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        company_id VARCHAR(255),
        description TEXT,
        parent_department_id VARCHAR(255),
        manager_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_department_id) REFERENCES departments(id) ON DELETE SET NULL,
        FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    console.log('✅ Tabela departments criada');

    // Tabela de entradas do diário
    await client.query(`
      CREATE TABLE IF NOT EXISTS diary_entries (
        id VARCHAR(255) PRIMARY KEY,
        content TEXT NOT NULL,
        whatsapp_number VARCHAR(50),
        user_id VARCHAR(255),
        user_name VARCHAR(255),
        timestamp TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sentiment_score REAL,
        sentiment_label VARCHAR(50),
        metadata JSONB DEFAULT '{}'::jsonb,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Tabela diary_entries criada');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_diary_user_id ON diary_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_diary_whatsapp ON diary_entries(whatsapp_number);
      CREATE INDEX IF NOT EXISTS idx_diary_timestamp ON diary_entries(timestamp DESC);
    `);

    // Tabela de lembretes
    await client.query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        reminder_time TIME NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Tabela reminders criada');

    // Tabela de logs de auditoria
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        user_email VARCHAR(255),
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(100),
        entity_id VARCHAR(255),
        details JSONB,
        ip_address VARCHAR(100),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    console.log('✅ Tabela audit_logs criada');

    // Tabela de terapeutas
    await client.query(`
      CREATE TABLE IF NOT EXISTS therapists (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone VARCHAR(20),
        age INTEGER,
        bio TEXT,
        specialties TEXT,
        credentials TEXT,
        experience_years INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending',
        profile_image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP,
        approved_by VARCHAR(255),
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    console.log('✅ Tabela therapists criada');

    // =========================================================================
    // TABELAS DE ATIVIDADES E BEM-ESTAR
    // =========================================================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_activities (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        activity_type VARCHAR(100) NOT NULL,
        activity_name VARCHAR(255) NOT NULL,
        description TEXT,
        duration_minutes INTEGER,
        intensity VARCHAR(50),
        mood_before INTEGER,
        mood_after INTEGER,
        notes TEXT,
        completed_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB DEFAULT '{}'::jsonb,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_activities_completed_at ON user_activities(completed_at);
      CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);
    `);
    console.log('✅ Tabela user_activities criada');

    await client.query(`
      CREATE TABLE IF NOT EXISTS company_activity_templates (
        id VARCHAR(255) PRIMARY KEY,
        company_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        activity_type VARCHAR(100) NOT NULL,
        duration_minutes INTEGER,
        instructions TEXT,
        difficulty_level VARCHAR(50),
        benefits JSONB,
        is_active INTEGER DEFAULT 1,
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    console.log('✅ Tabela company_activity_templates criada');

    await client.query(`
      CREATE TABLE IF NOT EXISTS wellness_goals (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        goal_type VARCHAR(100) NOT NULL,
        target_value INTEGER NOT NULL,
        current_value INTEGER DEFAULT 0,
        start_date DATE NOT NULL,
        end_date DATE,
        status VARCHAR(50) DEFAULT 'active',
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Tabela wellness_goals criada');

    // =========================================================================
    // TABELAS DE GAMIFICAÇÃO
    // =========================================================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_points (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL UNIQUE,
        total_points INTEGER DEFAULT 0,
        current_level INTEGER DEFAULT 1,
        points_to_next_level INTEGER DEFAULT 100,
        streak_days INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_activity_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
    `);
    console.log('✅ Tabela user_points criada');

    await client.query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(255),
        category VARCHAR(100),
        requirement_type VARCHAR(100) NOT NULL,
        requirement_value INTEGER NOT NULL,
        points_reward INTEGER DEFAULT 0,
        rarity VARCHAR(50) DEFAULT 'common',
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela achievements criada');

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        achievement_id VARCHAR(255) NOT NULL,
        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        progress INTEGER DEFAULT 0,
        is_unlocked INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
        UNIQUE(user_id, achievement_id)
      );

      CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
    `);
    console.log('✅ Tabela user_achievements criada');

    await client.query(`
      CREATE TABLE IF NOT EXISTS points_history (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        points INTEGER NOT NULL,
        reason TEXT NOT NULL,
        activity_id VARCHAR(255),
        achievement_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
    `);
    console.log('✅ Tabela points_history criada');

    // =========================================================================
    // TABELAS DE NOTIFICAÇÕES
    // =========================================================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(100) NOT NULL,
        priority VARCHAR(50) DEFAULT 'normal',
        is_read INTEGER DEFAULT 0,
        action_url TEXT,
        action_label VARCHAR(255),
        related_entity_type VARCHAR(100),
        related_entity_id VARCHAR(255),
        scheduled_for TIMESTAMP,
        sent_at TIMESTAMP,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
      CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
    `);
    console.log('✅ Tabela notifications criada');

    await client.query(`
      CREATE TABLE IF NOT EXISTS notification_settings (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL UNIQUE,
        email_enabled INTEGER DEFAULT 1,
        push_enabled INTEGER DEFAULT 1,
        whatsapp_enabled INTEGER DEFAULT 1,
        reminders_enabled INTEGER DEFAULT 1,
        achievements_enabled INTEGER DEFAULT 1,
        wellness_tips_enabled INTEGER DEFAULT 1,
        daily_summary_enabled INTEGER DEFAULT 1,
        quiet_hours_start TIME,
        quiet_hours_end TIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Tabela notification_settings criada');

    // =========================================================================
    // TABELAS ADICIONAIS (Chat, WhatsApp, etc)
    // =========================================================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) DEFAULT 'support',
        status VARCHAR(50) DEFAULT 'active',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_message_at TIMESTAMP,
        resolved_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
    `);
    console.log('✅ Tabela chat_conversations criada');

    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(255) PRIMARY KEY,
        conversation_id VARCHAR(255) NOT NULL,
        sender_id VARCHAR(255),
        sender_type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        sentiment_score REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
    `);
    console.log('✅ Tabela chat_messages criada');

    await client.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        phone_number VARCHAR(50) NOT NULL,
        session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        session_end TIMESTAMP,
        last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        context JSONB DEFAULT '{}'::jsonb,
        is_active INTEGER DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_user_id ON whatsapp_sessions(user_id);
    `);
    console.log('✅ Tabela whatsapp_sessions criada');

    await client.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_messages (
        id VARCHAR(255) PRIMARY KEY,
        session_id VARCHAR(255),
        user_id VARCHAR(255),
        phone_number VARCHAR(50) NOT NULL,
        direction VARCHAR(50) NOT NULL,
        message_text TEXT NOT NULL,
        message_type VARCHAR(50) DEFAULT 'text',
        metadata JSONB DEFAULT '{}'::jsonb,
        processed INTEGER DEFAULT 0,
        processed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES whatsapp_sessions(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_session_id ON whatsapp_messages(session_id);
    `);
    console.log('✅ Tabela whatsapp_messages criada');

    await client.query(`
      CREATE TABLE IF NOT EXISTS onboarding_progress (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL UNIQUE,
        current_step INTEGER DEFAULT 0,
        total_steps INTEGER DEFAULT 5,
        steps_completed JSONB DEFAULT '[]'::jsonb,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        data JSONB DEFAULT '{}'::jsonb,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Tabela onboarding_progress criada');

    // =========================================================================
    // CRIAR EMPRESA "GENERAL" PADRÃO
    // =========================================================================

    const checkCompany = await client.query(
      `SELECT id FROM companies WHERE name = 'General' LIMIT 1`
    );

    if (checkCompany.rows.length === 0) {
      const companyId = `company_general_${Date.now()}`;
      await client.query(
        `INSERT INTO companies (id, name, description, settings)
         VALUES ($1, $2, $3, $4)`,
        [
          companyId,
          'General',
          'Empresa padrão para todos os usuários individuais',
          JSON.stringify({
            default: true,
            allowAutoEnrollment: true,
            features: ['diary', 'chat', 'wellness', 'gamification']
          })
        ]
      );
      console.log(`✅ Empresa "General" criada com ID: ${companyId}`);
    } else {
      console.log(`✅ Empresa "General" já existe: ${checkCompany.rows[0].id}`);
    }

    // =========================================================================
    // INSERIR CONQUISTAS PADRÃO
    // =========================================================================

    const achievements = [
      ['ach_first_activity', 'Primeira Atividade', 'Complete sua primeira atividade de bem-estar', 'activities', 'activity_count', 1, 10, 'common'],
      ['ach_5_activities', 'Dedicado', 'Complete 5 atividades de bem-estar', 'activities', 'activity_count', 5, 25, 'common'],
      ['ach_10_activities', 'Comprometido', 'Complete 10 atividades de bem-estar', 'activities', 'activity_count', 10, 50, 'rare'],
      ['ach_50_activities', 'Mestre do Bem-Estar', 'Complete 50 atividades de bem-estar', 'activities', 'activity_count', 50, 200, 'epic'],
      ['ach_100_activities', 'Lenda do Bem-Estar', 'Complete 100 atividades de bem-estar', 'activities', 'activity_count', 100, 500, 'legendary'],
      ['ach_3_day_streak', 'Consistência', 'Mantenha uma sequência de 3 dias', 'streak', 'streak_days', 3, 30, 'common'],
      ['ach_7_day_streak', 'Uma Semana Forte', 'Mantenha uma sequência de 7 dias', 'streak', 'streak_days', 7, 75, 'rare'],
      ['ach_30_day_streak', 'Hábito Formado', 'Mantenha uma sequência de 30 dias', 'streak', 'streak_days', 30, 300, 'epic'],
      ['ach_100_day_streak', 'Imparável', 'Mantenha uma sequência de 100 dias', 'streak', 'streak_days', 100, 1000, 'legendary'],
      ['ach_first_diary', 'Autoconhecimento', 'Escreva sua primeira entrada no diário', 'wellness', 'custom', 1, 10, 'common']
    ];

    for (const achievement of achievements) {
      await client.query(
        `INSERT INTO achievements (id, name, description, category, requirement_type, requirement_value, points_reward, rarity)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        achievement
      );
    }
    console.log('✅ Conquistas padrão inseridas');

    console.log('🎉 Banco de dados inicializado com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Script finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
