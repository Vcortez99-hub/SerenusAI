/**
 * Migration: Criar empresa "General" padrão
 *
 * Esta migration garante que sempre exista uma empresa "General"
 * para novos usuários serem vinculados automaticamente
 */

const { v4: uuidv4 } = require('uuid');

async function up(db) {
  console.log('🔄 Executando migration: Criar empresa General...');

  try {
    // Verificar se empresa General já existe
    const checkCompany = await db.query(
      `SELECT id FROM companies WHERE name = 'General' LIMIT 1`
    );

    if (checkCompany.rows.length === 0) {
      // Criar empresa General
      const companyId = `company_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await db.query(
        `INSERT INTO companies (id, name, description, settings, created_at, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          companyId,
          'General',
          'Empresa padrão para todos os usuários',
          JSON.stringify({
            default: true,
            allowAutoEnrollment: true,
            features: ['diary', 'chat', 'wellness']
          })
        ]
      );

      console.log(`✅ Empresa "General" criada com ID: ${companyId}`);
      return companyId;
    } else {
      console.log(`✅ Empresa "General" já existe: ${checkCompany.rows[0].id}`);
      return checkCompany.rows[0].id;
    }
  } catch (error) {
    console.error('❌ Erro ao criar empresa General:', error);
    throw error;
  }
}

async function down(db) {
  console.log('🔄 Revertendo migration: Remover empresa General...');

  try {
    await db.query(`DELETE FROM companies WHERE name = 'General'`);
    console.log('✅ Empresa "General" removida');
  } catch (error) {
    console.error('❌ Erro ao remover empresa General:', error);
    throw error;
  }
}

module.exports = { up, down };
