const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

(async () => {
    try {
        console.log('🔧 Adicionando coluna is_admin...');
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin INTEGER DEFAULT 0');
        console.log('✅ Coluna is_admin adicionada/verificada');

        console.log('👤 Tornando usuário admin...');
        const result = await pool.query(
            "UPDATE users SET is_admin = 1 WHERE email = 'vinicius.cortez03@gmail.com' RETURNING name, email, is_admin"
        );

        if (result.rows.length > 0) {
            console.log('✅ SUCESSO! Usuário agora é admin:', result.rows[0]);
        } else {
            console.log('❌ Usuário não encontrado com esse email');
        }

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
})();
