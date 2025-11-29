-- Script para tornar um usuário administrador
-- Execute este comando no seu banco de dados PostgreSQL

-- Opção 1: Tornar admin pelo email
UPDATE users 
SET is_admin = 1 
WHERE email = 'seu-email@exemplo.com';

-- Opção 2: Tornar admin pelo ID
UPDATE users 
SET is_admin = 1 
WHERE id = 'seu-user-id';

-- Verificar se funcionou
SELECT id, name, email, is_admin FROM users WHERE email = 'seu-email@exemplo.com';
