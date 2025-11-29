// Usar randomUUID do crypto (built-in Node.js) em vez de uuid package
const { randomUUID: uuidv4 } = require('crypto');

/**
 * Serviço de Chat Interno RH ↔ Usuário
 */
class ChatService {
  constructor(dbModule, notificationService) {
    this.db = dbModule;
    this.notificationService = notificationService;
    // Não inicializar banco em produção - tabelas já criadas em init-database-render.js
    if (process.env.NODE_ENV !== 'production') {
      this.initializeDatabase();
    }
  }

  /**
   * Cria tabelas necessárias (apenas para desenvolvimento local com SQLite)
   * Em produção (PostgreSQL), as tabelas já são criadas em init-database-render.js
   */
  initializeDatabase() {
    const database = this.db.db;

    // Verificar se database existe (SQLite)
    if (!database || !database.run) {
      console.log('✅ ChatService: Usando PostgreSQL (tabelas já criadas)');
      return;
    }

    // Tabela de conversas/chats
    database.run(`
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        hr_user_id TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (hr_user_id) REFERENCES users(id)
      )
    `);

    // Tabela de mensagens
    database.run(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chat_id) REFERENCES chats(id),
        FOREIGN KEY (sender_id) REFERENCES users(id)
      )
    `);

    // Índices para performance
    database.run('CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id)');
    database.run('CREATE INDEX IF NOT EXISTS idx_chats_hr_user_id ON chats(hr_user_id)');
    database.run('CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON chat_messages(chat_id)');
    database.run('CREATE INDEX IF NOT EXISTS idx_messages_read ON chat_messages(read)');

    console.log('✅ Tabelas de chat SQLite inicializadas');
  }

  /**
   * Inicia um novo chat ou retorna chat existente
   */
  async startChat(userId, hrUserId = null) {
    const database = this.db.db;

    return new Promise((resolve, reject) => {
      // Verificar se já existe chat ativo entre esses usuários
      const checkSql = `
        SELECT * FROM chats
        WHERE user_id = ? AND status = 'active'
        ORDER BY updated_at DESC
        LIMIT 1
      `;

      database.get(checkSql, [userId], (err, existingChat) => {
        if (err) {
          reject(err);
          return;
        }

        if (existingChat) {
          // Chat já existe, apenas atualiza timestamp
          const updateSql = 'UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?';
          database.run(updateSql, [existingChat.id], (updateErr) => {
            if (updateErr) reject(updateErr);
            else resolve(existingChat);
          });
        } else {
          // Criar novo chat
          const chatId = uuidv4();
          const insertSql = `
            INSERT INTO chats (id, user_id, hr_user_id, status)
            VALUES (?, ?, ?, 'active')
          `;

          database.run(insertSql, [chatId, userId, hrUserId], function (insertErr) {
            if (insertErr) {
              reject(insertErr);
            } else {
              resolve({
                id: chatId,
                user_id: userId,
                hr_user_id: hrUserId,
                status: 'active'
              });
            }
          });
        }
      });
    });
  }

  /**
   * Envia mensagem
   */
  async sendMessage(chatId, senderId, message) {
    const database = this.db.db;

    return new Promise((resolve, reject) => {
      const messageId = uuidv4();

      const sql = `
        INSERT INTO chat_messages (id, chat_id, sender_id, message, read)
        VALUES (?, ?, ?, ?, FALSE)
      `;

      database.run(sql, [messageId, chatId, senderId, message], async (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Atualizar timestamp do chat
        database.run('UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [chatId]);

        // Buscar informações do chat e remetente
        const chatInfo = await this.getChatById(chatId);
        const senderInfo = await this.getUserInfo(senderId);

        // Determinar quem deve receber notificação
        const recipientId = chatInfo.user_id === senderId ? chatInfo.hr_user_id : chatInfo.user_id;

        // Enviar notificação push se disponível
        if (this.notificationService && recipientId) {
          this.notificationService.notifyNewMessage(recipientId, {
            chatId,
            messageId,
            senderName: senderInfo.name,
            preview: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
            timestamp: new Date().toISOString()
          });
        }

        resolve({
          id: messageId,
          chat_id: chatId,
          sender_id: senderId,
          message,
          read: false,
          created_at: new Date().toISOString()
        });
      });
    });
  }

  /**
   * Busca mensagens de um chat
   */
  async getMessages(chatId, limit = 50, offset = 0) {
    const database = this.db.db;

    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          m.id,
          m.chat_id,
          m.sender_id,
          m.message,
          m.read,
          m.created_at,
          u.name as sender_name,
          u.email as sender_email
        FROM chat_messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.chat_id = ?
        ORDER BY m.created_at DESC
        LIMIT ? OFFSET ?
      `;

      database.all(sql, [chatId, limit, offset], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  /**
   * Marca mensagens como lidas
   */
  async markAsRead(chatId, userId) {
    const database = this.db.db;

    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE chat_messages
        SET read = TRUE
        WHERE chat_id = ? AND sender_id != ? AND read = FALSE
      `;

      database.run(sql, [chatId, userId], function (err) {
        if (err) reject(err);
        else resolve({ updated: this.changes });
      });
    });
  }

  /**
   * Lista chats de um usuário
   */
  async getUserChats(userId, isHR = false) {
    const database = this.db.db;

    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          c.id,
          c.user_id,
          c.hr_user_id,
          c.status,
          c.created_at,
          c.updated_at,
          u1.name as user_name,
          u1.email as user_email,
          u2.name as hr_name,
          u2.email as hr_email,
          (
            SELECT COUNT(*)
            FROM chat_messages
            WHERE chat_id = c.id AND sender_id != ? AND read = FALSE
          ) as unread_count,
          (
            SELECT message
            FROM chat_messages
            WHERE chat_id = c.id
            ORDER BY created_at DESC
            LIMIT 1
          ) as last_message,
          (
            SELECT created_at
            FROM chat_messages
            WHERE chat_id = c.id
            ORDER BY created_at DESC
            LIMIT 1
          ) as last_message_time
        FROM chats c
        JOIN users u1 ON c.user_id = u1.id
        LEFT JOIN users u2 ON c.hr_user_id = u2.id
        WHERE ${isHR ? 'c.hr_user_id = ?' : 'c.user_id = ?'}
        ORDER BY c.updated_at DESC
      `;

      database.all(sql, [userId, userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  /**
   * Busca chats sem atribuição (para RH)
   */
  async getUnassignedChats() {
    const database = this.db.db;

    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          c.id,
          c.user_id,
          c.status,
          c.created_at,
          c.updated_at,
          u.name as user_name,
          u.email as user_email,
          (
            SELECT COUNT(*)
            FROM chat_messages
            WHERE chat_id = c.id AND read = FALSE
          ) as unread_count
        FROM chats c
        JOIN users u ON c.user_id = u.id
        WHERE c.hr_user_id IS NULL AND c.status = 'active'
        ORDER BY c.created_at DESC
      `;

      database.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  /**
   * Atribui chat a um RH
   */
  async assignChatToHR(chatId, hrUserId) {
    const database = this.db.db;

    return new Promise((resolve, reject) => {
      const sql = 'UPDATE chats SET hr_user_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';

      database.run(sql, [hrUserId, chatId], function (err) {
        if (err) reject(err);
        else resolve({ success: true, updated: this.changes });
      });
    });
  }

  /**
   * Fecha um chat
   */
  async closeChat(chatId) {
    const database = this.db.db;

    return new Promise((resolve, reject) => {
      const sql = 'UPDATE chats SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';

      database.run(sql, ['closed', chatId], function (err) {
        if (err) reject(err);
        else resolve({ success: true, updated: this.changes });
      });
    });
  }

  /**
   * Reabre um chat
   */
  async reopenChat(chatId) {
    const database = this.db.db;

    return new Promise((resolve, reject) => {
      const sql = 'UPDATE chats SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';

      database.run(sql, ['active', chatId], function (err) {
        if (err) reject(err);
        else resolve({ success: true, updated: this.changes });
      });
    });
  }

  /**
   * Busca informações de um chat
   */
  async getChatById(chatId) {
    const database = this.db.db;

    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM chats WHERE id = ?';

      database.get(sql, [chatId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  /**
   * Busca informações de um usuário
   */
  async getUserInfo(userId) {
    const database = this.db.db;

    return new Promise((resolve, reject) => {
      const sql = 'SELECT id, name, email, role FROM users WHERE id = ?';

      database.get(sql, [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row || {});
      });
    });
  }

  /**
   * Estatísticas de chat (para admin)
   */
  async getChatStats(filters = {}) {
    const database = this.db.db;

    return new Promise((resolve, reject) => {
      const sql = `
        SELECT
          COUNT(DISTINCT c.id) as total_chats,
          COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) as active_chats,
          COUNT(DISTINCT CASE WHEN c.hr_user_id IS NULL THEN c.id END) as unassigned_chats,
          COUNT(DISTINCT m.id) as total_messages,
          COUNT(DISTINCT CASE WHEN m.read = FALSE THEN m.id END) as unread_messages,
          AVG(messages_per_chat.msg_count) as avg_messages_per_chat
        FROM chats c
        LEFT JOIN chat_messages m ON c.id = m.chat_id
        LEFT JOIN (
          SELECT chat_id, COUNT(*) as msg_count
          FROM chat_messages
          GROUP BY chat_id
        ) messages_per_chat ON c.id = messages_per_chat.chat_id
      `;

      database.get(sql, [], (err, row) => {
        if (err) reject(err);
        else resolve(row || {});
      });
    });
  }
}

module.exports = { ChatService };
