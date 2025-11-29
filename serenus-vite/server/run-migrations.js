const db = require('./db-sqlite');

console.log('Iniciando migração...');
db.initializeDatabase()
    .then(() => {
        console.log('Migração concluída!');
        setTimeout(() => process.exit(0), 1000);
    })
    .catch(err => {
        console.error('Erro na migração:', err);
        process.exit(1);
    });
