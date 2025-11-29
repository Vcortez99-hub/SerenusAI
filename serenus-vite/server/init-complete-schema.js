const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'essentia-local.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 Criando schema completo do sistema Essent IA...\n');

const tables = [
  {
    name: 'user_activities',
    sql: `CREATE TABLE IF NOT EXISTS user_activities (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      activity_name TEXT NOT NULL,
      description TEXT,
      duration_minutes INTEGER,
      intensity TEXT,
      mood_before INTEGER,
      mood_after INTEGER,
      notes TEXT,
      completed_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      metadata TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  },
  {
    name: 'company_activity_templates',
    sql: `CREATE TABLE IF NOT EXISTS company_activity_templates (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      activity_type TEXT NOT NULL,
      duration_minutes INTEGER,
      instructions TEXT,
      difficulty_level TEXT,
      benefits TEXT,
      is_active INTEGER DEFAULT 1,
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )`
  },
  {
    name: 'wellness_goals',
    sql: `CREATE TABLE IF NOT EXISTS wellness_goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      goal_type TEXT NOT NULL,
      target_value INTEGER NOT NULL,
      current_value INTEGER DEFAULT 0,
      start_date DATE NOT NULL,
      end_date DATE,
      status TEXT DEFAULT 'active',
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  },
  {
    name: 'achievements',
    sql: `CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT,
      category TEXT,
      requirement_type TEXT NOT NULL,
      requirement_value INTEGER NOT NULL,
      points_reward INTEGER DEFAULT 0,
      rarity TEXT DEFAULT 'common',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  },
  {
    name: 'notifications',
    sql: `CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      priority TEXT DEFAULT 'normal',
      is_read INTEGER DEFAULT 0,
      action_url TEXT,
      action_label TEXT,
      related_entity_type TEXT,
      related_entity_id TEXT,
      scheduled_for DATETIME,
      sent_at DATETIME,
      read_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  },
  {
    name: 'notification_settings',
    sql: `CREATE TABLE IF NOT EXISTS notification_settings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      email_enabled INTEGER DEFAULT 1,
      push_enabled INTEGER DEFAULT 1,
      whatsapp_enabled INTEGER DEFAULT 1,
      reminders_enabled INTEGER DEFAULT 1,
      achievements_enabled INTEGER DEFAULT 1,
      wellness_tips_enabled INTEGER DEFAULT 1,
      daily_summary_enabled INTEGER DEFAULT 1,
      quiet_hours_start TIME,
      quiet_hours_end TIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  },
  {
    name: 'diary_ai_analysis',
    sql: `CREATE TABLE IF NOT EXISTS diary_ai_analysis (
      id TEXT PRIMARY KEY,
      diary_entry_id TEXT NOT NULL UNIQUE,
      user_id TEXT NOT NULL,
      sentiment_score REAL,
      sentiment_label TEXT,
      emotions_detected TEXT,
      stress_level TEXT,
      wellbeing_score INTEGER,
      key_themes TEXT,
      recommendations TEXT,
      concerns_detected TEXT,
      needs_attention INTEGER DEFAULT 0,
      analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (diary_entry_id) REFERENCES diary_entries(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  },
  {
    name: 'wellness_metrics',
    sql: `CREATE TABLE IF NOT EXISTS wellness_metrics (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date DATE NOT NULL,
      mood_average REAL,
      stress_level REAL,
      energy_level REAL,
      sleep_quality REAL,
      activities_completed INTEGER DEFAULT 0,
      diary_entries_count INTEGER DEFAULT 0,
      wellbeing_score REAL,
      calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, date)
    )`
  },
  {
    name: 'ai_predictions',
    sql: `CREATE TABLE IF NOT EXISTS ai_predictions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      prediction_type TEXT NOT NULL,
      prediction_value REAL NOT NULL,
      confidence_level REAL,
      factors TEXT,
      recommendations TEXT,
      valid_from DATE NOT NULL,
      valid_until DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  },
  {
    name: 'chat_conversations',
    sql: `CREATE TABLE IF NOT EXISTS chat_conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT DEFAULT 'support',
      status TEXT DEFAULT 'active',
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_message_at DATETIME,
      resolved_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  },
  {
    name: 'whatsapp_sessions',
    sql: `CREATE TABLE IF NOT EXISTS whatsapp_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      phone_number TEXT NOT NULL,
      session_start DATETIME DEFAULT CURRENT_TIMESTAMP,
      session_end DATETIME,
      last_interaction DATETIME DEFAULT CURRENT_TIMESTAMP,
      context TEXT,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )`
  },
  {
    name: 'whatsapp_messages',
    sql: `CREATE TABLE IF NOT EXISTS whatsapp_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      user_id TEXT,
      phone_number TEXT NOT NULL,
      direction TEXT NOT NULL,
      message_text TEXT NOT NULL,
      message_type TEXT DEFAULT 'text',
      metadata TEXT,
      processed INTEGER DEFAULT 0,
      processed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES whatsapp_sessions(id) ON DELETE SET NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )`
  },
  {
    name: 'onboarding_progress',
    sql: `CREATE TABLE IF NOT EXISTS onboarding_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      current_step INTEGER DEFAULT 0,
      total_steps INTEGER DEFAULT 5,
      steps_completed TEXT,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      data TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  }
];

const indices = [
  'CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_user_activities_completed_at ON user_activities(completed_at)',
  'CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type)',
  'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)',
  'CREATE INDEX IF NOT EXISTS idx_diary_ai_analysis_user_id ON diary_ai_analysis(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_wellness_metrics_user_date ON wellness_metrics(user_id, date)',
  'CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_user_id ON whatsapp_sessions(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_session_id ON whatsapp_messages(session_id)'
];

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
  ['ach_first_diary', 'Autoconhecimento', 'Escreva sua primeira entrada no diário', 'wellness', 'custom', 1, 10, 'common'],
  ['ach_morning_person', 'Madrugador', 'Complete 10 atividades antes das 9h', 'special', 'custom', 10, 100, 'rare'],
  ['ach_night_owl', 'Coruja Noturna', 'Complete 10 atividades após as 20h', 'special', 'custom', 10, 100, 'rare']
];

let totalCreated = 0;
let totalErrors = 0;

db.serialize(() => {
  // Criar tabelas
  console.log('📋 Criando tabelas...\n');
  tables.forEach(table => {
    db.run(table.sql, (err) => {
      if (err) {
        console.error(`❌ Erro ao criar ${table.name}:`, err.message);
        totalErrors++;
      } else {
        console.log(`✅ Tabela criada: ${table.name}`);
        totalCreated++;
      }
    });
  });

  // Criar índices
  setTimeout(() => {
    console.log('\n📌 Criando índices...\n');
    indices.forEach(index => {
      db.run(index, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error(`❌ Erro ao criar índice:`, err.message);
        }
      });
    });

    // Inserir conquistas
    setTimeout(() => {
      console.log('\n🏆 Inserindo conquistas...\n');
      const stmt = db.prepare(`
        INSERT OR IGNORE INTO achievements
        (id, name, description, category, requirement_type, requirement_value, points_reward, rarity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      achievements.forEach(ach => {
        stmt.run(ach, (err) => {
          if (err) {
            console.error(`❌ Erro ao inserir conquista ${ach[1]}:`, err.message);
          } else {
            console.log(`✅ Conquista criada: ${ach[1]}`);
          }
        });
      });

      stmt.finalize();

      // Listar todas as tabelas
      setTimeout(() => {
        db.all(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`, (err, rows) => {
          if (err) {
            console.error('❌ Erro ao listar tabelas:', err);
          } else {
            console.log(`\n📊 Total de tabelas no banco: ${rows.length}`);
            rows.forEach(row => console.log(`   - ${row.name}`));
          }

          console.log(`\n✅ Processo concluído!`);
          console.log(`   Tabelas criadas: ${totalCreated}`);
          console.log(`   Erros: ${totalErrors}\n`);

          db.close();
          process.exit(0);
        });
      }, 1000);
    }, 1000);
  }, 1000);
});
