const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./essentia-local.db');

console.log('=== TERAPEUTAS NO BANCO ===');

db.all('SELECT id, name, email, status, specialties FROM therapists', [], (err, rows) => {
    if (err) {
        console.error('Erro ao buscar terapeutas:', err);
        return;
    }

    console.log(`Total: ${rows.length}`);
    rows.forEach(t => {
        console.log(`\nID: ${t.id}`);
        console.log(`Nome: ${t.name}`);
        console.log(`Email: ${t.email}`);
        console.log(`Status: ${t.status}`);
        console.log(`Especialidades (raw): ${t.specialties}`);
        try {
            console.log(`Especialidades (parsed):`, JSON.parse(t.specialties));
        } catch (e) {
            console.log(`Especialidades (erro parse):`, e.message);
        }
    });

    db.close();
});
