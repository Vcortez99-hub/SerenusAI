const db = require('./db');

(async () => {
    try {
        console.log('🔧 Conectando ao banco...');

        // Inicializar o banco (isso já adiciona a coluna is_admin pelo schema atualizado)
        await db.initializeDatabase();

        console.log('👤 Tornando usuário admin...');
        const result = await db.query(
            "UPDATE users SET is_admin = 1 WHERE email = 'vinicius.cortez03@gmail.com' RETURNING name, email, is_admin"
        );

        if (result.rows.length > 0) {
            console.log('✅ SUCESSO! Usuário agora é admin:');
            console.log(result.rows[0]);
        } else {
            console.log('❌ Usuário não encontrado. Listando todos os usuários:');
            const allUsers = await db.query('SELECT id, name, email FROM users');
            console.log(allUsers.rows);
        }

        await db.closePool();
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.error(error);
        process.exit(1);
    }
})();
