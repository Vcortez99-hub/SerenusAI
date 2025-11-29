const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'essentia-local.db');
const schemaPath = path.join(__dirname, 'complete-schema.sql');

console.log('📊 Aplicando schema completo ao banco de dados...');

const db = new sqlite3.Database(dbPath);
const schema = fs.readFileSync(schemaPath, 'utf-8');

// Dividir o schema em statements individuais
const statements = schema
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

let completed = 0;
let errors = 0;

db.serialize(() => {
  statements.forEach((statement, index) => {
    db.run(statement + ';', (err) => {
      completed++;
      if (err) {
        // Ignorar erros de "table already exists"
        if (!err.message.includes('already exists')) {
          console.error(`❌ Erro no statement ${index + 1}:`, err.message);
          errors++;
        }
      }

      if (completed === statements.length) {
        console.log(`\n✅ Schema aplicado com sucesso!`);
        console.log(`   Total de statements: ${statements.length}`);
        console.log(`   Erros: ${errors}`);

        // Verificar tabelas criadas
        db.all(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`, (err, tables) => {
          if (err) {
            console.error('❌ Erro ao listar tabelas:', err);
          } else {
            console.log(`\n📋 Tabelas no banco de dados:`);
            tables.forEach(t => console.log(`   - ${t.name}`));
          }

          db.close(() => {
            console.log('\n🔒 Conexão fechada');
            process.exit(errors > 0 ? 1 : 0);
          });
        });
      }
    });
  });
});
