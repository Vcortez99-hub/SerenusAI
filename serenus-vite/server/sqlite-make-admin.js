const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'essentia-local.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Conectando ao SQLite:', dbPath);

db.serialize(() => {
    // Adicionar coluna is_admin
    db.run(`ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('❌ Erro ao adicionar coluna:', err.message);
        } else {
            console.log('✅ Coluna is_admin adicionada/verificada');
        }
    });

    // Tornar usuário admin
    db.run(
        `UPDATE users SET is_admin = 1 WHERE email = ?`,
        ['vinicius.cortez03@gmail.com'],
        function (err) {
            if (err) {
                console.error('❌ Erro ao atualizar:', err.message);
            } else {
                console.log(`✅ ${this.changes} usuário(s) atualizado(s) para admin`);
            }
        }
    );

    // Verificar resultado
    db.all(
        `SELECT id, name, email, is_admin FROM users WHERE email = ?`,
        ['vinicius.cortez03@gmail.com'],
        (err, rows) => {
            if (err) {
                console.error('❌ Erro ao verificar:', err.message);
            } else if (rows.length > 0) {
                console.log('\n✅ SUCESSO! Usuário agora é admin:');
                console.log(rows[0]);
            } else {
                console.log('\n❌ Usuário não encontrado. Listando todos:');
                db.all(`SELECT id, name, email, is_admin FROM users`, (err, all) => {
                    console.log(all);
                });
            }

            db.close(() => {
                console.log('\n✅ Concluído! Faça logout e login novamente.');
                process.exit(0);
            });
        }
    );
});
