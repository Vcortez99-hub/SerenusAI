-- ============================================================================
-- SCHEMA COMPLETO DO SISTEMA ESSENTIA
-- Todas as tabelas necessárias para funcionamento 100% integrado
-- ============================================================================

-- ============================================================================
-- TABELAS DE ATIVIDADES E BEM-ESTAR
-- ============================================================================

-- Tabela de atividades dos usuários
CREATE TABLE IF NOT EXISTS user_activities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- 'wellness', 'mindfulness', 'exercise', 'breathing', 'meditation', 'custom'
  activity_name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  intensity TEXT, -- 'low', 'medium', 'high'
  mood_before INTEGER, -- 1-10
  mood_after INTEGER, -- 1-10
  notes TEXT,
  completed_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT, -- JSON com dados adicionais
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de templates de atividades da empresa
CREATE TABLE IF NOT EXISTS company_activity_templates (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  activity_type TEXT NOT NULL,
  duration_minutes INTEGER,
  instructions TEXT,
  difficulty_level TEXT, -- 'beginner', 'intermediate', 'advanced'
  benefits TEXT, -- JSON array
  is_active INTEGER DEFAULT 1,
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabela de metas de bem-estar
CREATE TABLE IF NOT EXISTS wellness_goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  goal_type TEXT NOT NULL, -- 'daily_activities', 'weekly_streak', 'mood_improvement', 'custom'
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'abandoned'
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- TABELAS DE GAMIFICAÇÃO
-- ============================================================================

-- Tabela de pontos e níveis dos usuários
CREATE TABLE IF NOT EXISTS user_points (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  total_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  points_to_next_level INTEGER DEFAULT 100,
  streak_days INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de conquistas disponíveis
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  category TEXT, -- 'activities', 'streak', 'social', 'wellness', 'special'
  requirement_type TEXT NOT NULL, -- 'activity_count', 'streak_days', 'points', 'custom'
  requirement_value INTEGER NOT NULL,
  points_reward INTEGER DEFAULT 0,
  rarity TEXT DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de conquistas dos usuários
CREATE TABLE IF NOT EXISTS user_achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  progress INTEGER DEFAULT 0,
  is_unlocked INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
  UNIQUE(user_id, achievement_id)
);

-- Tabela de histórico de pontos
CREATE TABLE IF NOT EXISTS points_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  activity_id TEXT,
  achievement_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- TABELAS DE NOTIFICAÇÕES
-- ============================================================================

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'reminder', 'achievement', 'wellness', 'system', 'social'
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
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
);

-- Tabela de configurações de notificação por usuário
CREATE TABLE IF NOT EXISTS notification_settings (
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
);

-- ============================================================================
-- TABELAS DE ANÁLISE DE IA E MÉTRICAS
-- ============================================================================

-- Tabela de análises de IA do diário
CREATE TABLE IF NOT EXISTS diary_ai_analysis (
  id TEXT PRIMARY KEY,
  diary_entry_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  sentiment_score REAL, -- -1.0 a 1.0
  sentiment_label TEXT, -- 'positive', 'negative', 'neutral', 'mixed'
  emotions_detected TEXT, -- JSON array ['joy', 'sadness', 'anxiety', etc]
  stress_level TEXT, -- 'low', 'medium', 'high'
  wellbeing_score INTEGER, -- 1-10
  key_themes TEXT, -- JSON array de temas identificados
  recommendations TEXT, -- JSON array de recomendações
  concerns_detected TEXT, -- JSON array de preocupações
  needs_attention INTEGER DEFAULT 0, -- Flag para casos que requerem atenção
  analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (diary_entry_id) REFERENCES diary_entries(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de métricas de bem-estar consolidadas
CREATE TABLE IF NOT EXISTS wellness_metrics (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  mood_average REAL, -- Média de humor do dia
  stress_level REAL, -- Nível de estresse
  energy_level REAL, -- Nível de energia
  sleep_quality REAL, -- Qualidade do sono
  activities_completed INTEGER DEFAULT 0,
  diary_entries_count INTEGER DEFAULT 0,
  wellbeing_score REAL, -- Score geral de bem-estar
  calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, date)
);

-- Tabela de predições de IA
CREATE TABLE IF NOT EXISTS ai_predictions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  prediction_type TEXT NOT NULL, -- 'burnout_risk', 'mood_forecast', 'wellness_trend'
  prediction_value REAL NOT NULL,
  confidence_level REAL, -- 0-1
  factors TEXT, -- JSON array de fatores que influenciaram
  recommendations TEXT, -- JSON array de recomendações
  valid_from DATE NOT NULL,
  valid_until DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- TABELAS DE CHAT E SUPORTE
-- ============================================================================

-- Tabela de conversas de chat
CREATE TABLE IF NOT EXISTS chat_conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT DEFAULT 'support', -- 'support', 'wellness', 'ai_coach'
  status TEXT DEFAULT 'active', -- 'active', 'resolved', 'archived'
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_message_at DATETIME,
  resolved_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de mensagens de chat
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender_id TEXT,
  sender_type TEXT NOT NULL, -- 'user', 'ai', 'admin'
  message TEXT NOT NULL,
  metadata TEXT, -- JSON com informações adicionais
  sentiment_score REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- TABELAS DE INTEGRAÇÃO WHATSAPP
-- ============================================================================

-- Tabela de sessões WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  phone_number TEXT NOT NULL,
  session_start DATETIME DEFAULT CURRENT_TIMESTAMP,
  session_end DATETIME,
  last_interaction DATETIME DEFAULT CURRENT_TIMESTAMP,
  context TEXT, -- JSON com contexto da conversa
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabela de mensagens WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  user_id TEXT,
  phone_number TEXT NOT NULL,
  direction TEXT NOT NULL, -- 'inbound', 'outbound'
  message_text TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- 'text', 'image', 'audio', 'document'
  metadata TEXT, -- JSON com dados da mensagem
  processed INTEGER DEFAULT 0,
  processed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES whatsapp_sessions(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- TABELAS DE ONBOARDING
-- ============================================================================

-- Tabela de progresso de onboarding
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  current_step INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 5,
  steps_completed TEXT, -- JSON array de steps completados
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  data TEXT, -- JSON com dados coletados durante onboarding
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices de user_activities
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_completed_at ON user_activities(completed_at);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);

-- Índices de diary_entries
CREATE INDEX IF NOT EXISTS idx_diary_entries_user_id ON diary_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_timestamp ON diary_entries(timestamp);

-- Índices de gamificação
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);

-- Índices de notificações
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Índices de análise
CREATE INDEX IF NOT EXISTS idx_diary_ai_analysis_user_id ON diary_ai_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_metrics_user_date ON wellness_metrics(user_id, date);

-- Índices de chat
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);

-- Índices de WhatsApp
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_user_id ON whatsapp_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_session_id ON whatsapp_messages(session_id);

-- ============================================================================
-- DADOS INICIAIS - CONQUISTAS
-- ============================================================================

INSERT OR IGNORE INTO achievements (id, name, description, category, requirement_type, requirement_value, points_reward, rarity) VALUES
  ('ach_first_activity', 'Primeira Atividade', 'Complete sua primeira atividade de bem-estar', 'activities', 'activity_count', 1, 10, 'common'),
  ('ach_5_activities', 'Dedicado', 'Complete 5 atividades de bem-estar', 'activities', 'activity_count', 5, 25, 'common'),
  ('ach_10_activities', 'Comprometido', 'Complete 10 atividades de bem-estar', 'activities', 'activity_count', 10, 50, 'rare'),
  ('ach_50_activities', 'Mestre do Bem-Estar', 'Complete 50 atividades de bem-estar', 'activities', 'activity_count', 50, 200, 'epic'),
  ('ach_100_activities', 'Lenda do Bem-Estar', 'Complete 100 atividades de bem-estar', 'activities', 'activity_count', 100, 500, 'legendary'),
  ('ach_3_day_streak', 'Consistência', 'Mantenha uma sequência de 3 dias', 'streak', 'streak_days', 3, 30, 'common'),
  ('ach_7_day_streak', 'Uma Semana Forte', 'Mantenha uma sequência de 7 dias', 'streak', 'streak_days', 7, 75, 'rare'),
  ('ach_30_day_streak', 'Hábito Formado', 'Mantenha uma sequência de 30 dias', 'streak', 'streak_days', 30, 300, 'epic'),
  ('ach_100_day_streak', 'Imparável', 'Mantenha uma sequência de 100 dias', 'streak', 'streak_days', 100, 1000, 'legendary'),
  ('ach_first_diary', 'Autoconhecimento', 'Escreva sua primeira entrada no diário', 'wellness', 'custom', 1, 10, 'common'),
  ('ach_morning_person', 'Madrugador', 'Complete 10 atividades antes das 9h', 'special', 'custom', 10, 100, 'rare'),
  ('ach_night_owl', 'Coruja Noturna', 'Complete 10 atividades após as 20h', 'special', 'custom', 10, 100, 'rare');

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================
