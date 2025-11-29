const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./essentia-local.db');

db.serialize(() => {
    db.all('SELECT id, name, specialties FROM therapists', [], (err, rows) => {
        if (err) {
            console.error('Erro ao ler:', err);
            return;
        }

        rows.forEach((t, index) => {
            console.log(`Processando: ${t.name} (${t.id})`);

            // Nomes realistas para substituir testes
            const names = ['Dr. Ana Silva', 'Dr. Carlos Mendes', 'Dra. Juliana Costa', 'Dr. Roberto Almeida'];
            const bios = [
                'Especialista em ansiedade e depressão com 10 anos de experiência.',
                'Focado em terapia cognitivo-comportamental e desenvolvimento pessoal.',
                'Psicóloga clínica com foco em relacionamentos e autoestima.',
                'Terapeuta ocupacional dedicado ao bem-estar mental e equilíbrio.'
            ];

            let newName = t.name;
            let newBio = t.bio || bios[index % bios.length];
            let newSpecialties = JSON.stringify(["Ansiedade", "Depressão", "Autoestima", "Estresse"]);

            // Se for nome de teste ou Dani, mudar para nome realista
            if (t.name.toLowerCase().includes('teste') || t.name.toLowerCase().includes('dani')) {
                newName = names[index % names.length];
                console.log(`-> Renomeando para ${newName}...`);
            }

            db.run(
                'UPDATE therapists SET name = ?, bio = ?, specialties = ?, status = ?, rating = ?, total_sessions = ?, price_per_session = ? WHERE id = ?',
                [newName, newBio, newSpecialties, 'approved', 4.8 + (index * 0.1) % 0.3, 10 + index * 5, 150.0, t.id],
                (err) => {
                    if (err) console.error('Erro update:', err);
                    else console.log('Terapeuta atualizado com sucesso!');
                }
            );
        });
    });
});

// Aguardar um pouco para garantir que os updates terminem
setTimeout(() => {
    db.close();
}, 2000);
