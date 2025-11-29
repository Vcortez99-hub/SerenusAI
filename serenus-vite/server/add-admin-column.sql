-- Adicionar coluna is_admin se não existir
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin INTEGER DEFAULT 0;

-- Tornar seu usuário admin (substitua pelo seu email)
UPDATE users SET is_admin = 1 WHERE email = 'vinicius.cortez03@gmail.com';

-- Verificar
SELECT id, name, email, is_admin FROM users;
