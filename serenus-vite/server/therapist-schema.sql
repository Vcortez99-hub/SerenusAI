-- ============================================================================
-- MARKETPLACE DE TERAPEUTAS - SCHEMA
-- ============================================================================

-- Tabela de terapeutas
CREATE TABLE IF NOT EXISTS therapists (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone VARCHAR(20),
  age INTEGER,
  photo_url TEXT,
  bio TEXT,
  specialties TEXT[], -- Array de especialidades
  credentials TEXT, -- CRP, formação, etc
  experience_years INTEGER,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  price_per_session DECIMAL(10,2) DEFAULT 49.90,
  availability JSONB, -- Horários disponíveis
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_by VARCHAR(255), -- ID do admin que aprovou
  approved_at TIMESTAMP,
  rejection_reason TEXT
);

-- Tabela de sessões de terapia
CREATE TABLE IF NOT EXISTS therapy_sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  therapist_id VARCHAR(255) REFERENCES therapists(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 50,
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show
  meeting_link TEXT,
  payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, refunded
  payment_id VARCHAR(255),
  amount DECIMAL(10,2) DEFAULT 49.90,
  notes TEXT,
  user_rating INTEGER, -- 1-5 estrelas
  user_feedback TEXT,
  therapist_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancelled_by VARCHAR(255), -- user_id ou therapist_id
  cancellation_reason TEXT
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_therapists_status ON therapists(status);
CREATE INDEX IF NOT EXISTS idx_therapists_email ON therapists(email);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_user_id ON therapy_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_therapist_id ON therapy_sessions(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_scheduled_at ON therapy_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_status ON therapy_sessions(status);
