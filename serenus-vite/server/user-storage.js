const { query } = require('./db');

/**
 * Gerenciamento de usuários usando PostgreSQL
 *
 * Estrutura do usuário:
 * - id: string (PK)
 * - name: string
 * - email: string (unique)
 * - phone: string (formato: 5511999999999)
 * - created_at: timestamp
 * - subscription_plan: string
 * - subscription_status: string
 * - stripe_customer_id: string
 * - preferences: jsonb {notifications, privacy, reminderTime}
 */
class UserStorage {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      console.log('✅ UserStorage inicializado com sucesso');
      this.initialized = true;
    }
  }

  /**
   * Criar novo usuário
   */
  async createUser(userData) {
    await this.initialize();

    // Formatar telefone para o padrão brasileiro (55 + DDD + número)
    let formattedPhone = userData.phone;
    if (formattedPhone && !formattedPhone.startsWith('55')) {
      formattedPhone = '55' + formattedPhone;
    }

    const id = this.generateId();

    const result = await query(
      `INSERT INTO users (id, name, email, phone, subscription_plan, subscription_status, stripe_customer_id, preferences)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        id,
        userData.name,
        userData.email,
        formattedPhone,
        'free',
        'active',
        null,
        JSON.stringify(userData.preferences || { notifications: true, privacy: 'private', reminderTime: '20:00' })
      ]
    );

    const user = this.formatUser(result.rows[0]);
    console.log(`👤 Usuário criado: ${user.name} (${user.phone})`);
    return user;
  }

  /**
   * Buscar usuário por telefone
   */
  async getUserByPhone(phone) {
    await this.initialize();

    const result = await query(
      'SELECT * FROM users WHERE phone = $1 LIMIT 1',
      [phone]
    );

    return result.rows.length > 0 ? this.formatUser(result.rows[0]) : null;
  }

  /**
   * Buscar usuário por ID
   */
  async getUserById(id) {
    await this.initialize();

    const result = await query(
      'SELECT * FROM users WHERE id = $1 LIMIT 1',
      [id]
    );

    return result.rows.length > 0 ? this.formatUser(result.rows[0]) : null;
  }

  /**
   * Buscar usuário por email
   */
  async getUserByEmail(email) {
    await this.initialize();

    const result = await query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email]
    );

    return result.rows.length > 0 ? this.formatUser(result.rows[0]) : null;
  }

  /**
   * Atualizar usuário
   */
  async updateUser(id, updates) {
    await this.initialize();

    const fields = [];
    const values = [];
    let paramCount = 1;

    // Construir query dinamicamente baseado nos campos a atualizar
    if (updates.name) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.email) {
      fields.push(`email = $${paramCount++}`);
      values.push(updates.email);
    }
    if (updates.phone) {
      fields.push(`phone = $${paramCount++}`);
      values.push(updates.phone);
    }
    if (updates.subscription) {
      if (updates.subscription.plan) {
        fields.push(`subscription_plan = $${paramCount++}`);
        values.push(updates.subscription.plan);
      }
      if (updates.subscription.status) {
        fields.push(`subscription_status = $${paramCount++}`);
        values.push(updates.subscription.status);
      }
      if (updates.subscription.stripeCustomerId) {
        fields.push(`stripe_customer_id = $${paramCount++}`);
        values.push(updates.subscription.stripeCustomerId);
      }
    }
    if (updates.preferences) {
      fields.push(`preferences = $${paramCount++}`);
      values.push(JSON.stringify(updates.preferences));
    }

    if (fields.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    values.push(id); // ID é o último parâmetro

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Usuário não encontrado');
    }

    return this.formatUser(result.rows[0]);
  }

  /**
   * Listar todos os usuários
   */
  async getAllUsers() {
    await this.initialize();

    const result = await query('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows.map(row => this.formatUser(row));
  }

  /**
   * Verificar se telefone já está cadastrado
   */
  async isPhoneRegistered(phone) {
    await this.initialize();

    const result = await query(
      'SELECT COUNT(*) as count FROM users WHERE phone = $1',
      [phone]
    );

    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Estatísticas
   */
  async getStats() {
    await this.initialize();

    const totalUsersResult = await query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(totalUsersResult.rows[0].count);

    const withPhoneResult = await query('SELECT COUNT(*) as count FROM users WHERE phone IS NOT NULL AND phone != \'\'');
    const usersWithPhone = parseInt(withPhoneResult.rows[0].count);

    const subscriptionResult = await query(
      'SELECT subscription_plan, COUNT(*) as count FROM users GROUP BY subscription_plan'
    );

    const subscriptionStats = {};
    subscriptionResult.rows.forEach(row => {
      subscriptionStats[row.subscription_plan] = parseInt(row.count);
    });

    return {
      totalUsers,
      usersWithPhone,
      subscriptionStats
    };
  }

  /**
   * Gerar ID único
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Formatar usuário do formato do banco para o formato da aplicação
   */
  formatUser(dbUser) {
    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.phone,
      createdAt: dbUser.created_at,
      subscription: {
        plan: dbUser.subscription_plan,
        status: dbUser.subscription_status,
        stripeCustomerId: dbUser.stripe_customer_id
      },
      preferences: typeof dbUser.preferences === 'string'
        ? JSON.parse(dbUser.preferences)
        : dbUser.preferences
    };
  }
}

module.exports = UserStorage;
