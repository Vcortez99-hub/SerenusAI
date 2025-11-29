const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'essentia-local.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Verificando banco de dados...\n');

db.all(
    `SELECT id, name, email, is_admin FROM users WHERE email = ?`,
    ['vinicius.cortez03@gmail.com'],
    (err, rows) => {
        if (err) {
            console.error('❌ Erro:', err.message);
        } else {
            console.log('📊 Dados do usuário no banco:');
            console.log(rows);
            console.log('\n');

            if (rows.length > 0 && rows[0].is_admin === 1) {
                console.log('✅ is_admin está correto no banco (valor: 1)');
                console.log('\n⚠️ O problema está no CÓDIGO, não no banco!');
                console.log('Vou verificar o endpoint de login...');
            } else {
                console.log('❌ is_admin NÃO está como 1 no banco');
            }
        }

        db.close();
    }
);
