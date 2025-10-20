const { query } = require('./db');

/**
 * Gerenciamento de entradas do diário usando PostgreSQL
 */
class DiaryStorage {
  constructor() {
    console.log('📔 DiaryStorage inicializado');
  }

  /**
   * Salva uma nova entrada no diário
   * @param {Object} entry - Entrada do diário
   * @returns {Promise<Object>} - Entrada salva
   */
  async saveEntry(entry) {
    try {
      const id = entry.id || `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = entry.timestamp || new Date();

      const result = await query(
        `INSERT INTO diary_entries (
          id, content, whatsapp_number, user_id, user_name,
          timestamp, sentiment, sentiment_confidence, sentiment_explanation, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          id,
          entry.content,
          entry.whatsappNumber || null,
          entry.userId || null,
          entry.userName || null,
          timestamp,
          entry.sentiment || null,
          entry.sentimentConfidence || null,
          entry.sentimentExplanation || null,
          JSON.stringify(entry.metadata || {})
        ]
      );

      const savedEntry = this.formatEntry(result.rows[0]);

      console.log('💾 Nova entrada salva no diário:', {
        id: savedEntry.id,
        content: savedEntry.content.substring(0, 50) + '...',
        timestamp: savedEntry.timestamp
      });

      return savedEntry;
    } catch (error) {
      console.error('❌ Erro ao salvar entrada no diário:', error);
      throw error;
    }
  }

  /**
   * Recupera todas as entradas do diário
   * @returns {Promise<Array>} - Array de entradas
   */
  async getAllEntries() {
    try {
      const result = await query(
        'SELECT * FROM diary_entries ORDER BY timestamp DESC'
      );

      return result.rows.map(row => this.formatEntry(row));
    } catch (error) {
      console.error('❌ Erro ao ler entradas do diário:', error);
      return [];
    }
  }

  /**
   * Recupera entradas por número do WhatsApp
   * @param {string} whatsappNumber - Número do WhatsApp
   * @returns {Promise<Array>} - Array de entradas do usuário
   */
  async getEntriesByNumber(whatsappNumber) {
    try {
      const result = await query(
        'SELECT * FROM diary_entries WHERE whatsapp_number = $1 ORDER BY timestamp DESC',
        [whatsappNumber]
      );

      return result.rows.map(row => this.formatEntry(row));
    } catch (error) {
      console.error('❌ Erro ao buscar entradas por número:', error);
      return [];
    }
  }

  /**
   * Recupera entradas por user ID
   * @param {string} userId - ID do usuário
   * @returns {Promise<Array>} - Array de entradas do usuário
   */
  async getEntriesByUserId(userId) {
    try {
      const result = await query(
        'SELECT * FROM diary_entries WHERE user_id = $1 ORDER BY timestamp DESC',
        [userId]
      );

      return result.rows.map(row => this.formatEntry(row));
    } catch (error) {
      console.error('❌ Erro ao buscar entradas por ID de usuário:', error);
      return [];
    }
  }

  /**
   * Recupera entradas por data
   * @param {string} date - Data no formato YYYY-MM-DD
   * @returns {Promise<Array>} - Array de entradas da data
   */
  async getEntriesByDate(date) {
    try {
      const result = await query(
        `SELECT * FROM diary_entries
         WHERE DATE(timestamp) = $1
         ORDER BY timestamp DESC`,
        [date]
      );

      return result.rows.map(row => this.formatEntry(row));
    } catch (error) {
      console.error('❌ Erro ao buscar entradas por data:', error);
      return [];
    }
  }

  /**
   * Recupera estatísticas do diário
   * @returns {Promise<Object>} - Estatísticas
   */
  async getStats() {
    try {
      const totalResult = await query('SELECT COUNT(*) as count FROM diary_entries');
      const totalEntries = parseInt(totalResult.rows[0].count);

      const uniqueNumbersResult = await query(
        'SELECT COUNT(DISTINCT whatsapp_number) as count FROM diary_entries WHERE whatsapp_number IS NOT NULL'
      );
      const uniqueUsers = parseInt(uniqueNumbersResult.rows[0].count);

      const lastEntryResult = await query(
        'SELECT * FROM diary_entries ORDER BY timestamp DESC LIMIT 1'
      );

      let lastEntry = null;
      if (lastEntryResult.rows.length > 0) {
        const entry = this.formatEntry(lastEntryResult.rows[0]);
        lastEntry = {
          date: new Date(entry.timestamp).toLocaleDateString('pt-BR'),
          preview: entry.content.substring(0, 100)
        };
      }

      return {
        totalEntries,
        uniqueUsers,
        lastEntry
      };
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
      return { totalEntries: 0, uniqueUsers: 0, lastEntry: null };
    }
  }

  /**
   * Remove uma entrada pelo ID
   * @param {string} entryId - ID da entrada
   * @returns {Promise<boolean>} - True se removida com sucesso
   */
  async removeEntry(entryId) {
    try {
      const result = await query(
        'DELETE FROM diary_entries WHERE id = $1 RETURNING id',
        [entryId]
      );

      if (result.rows.length > 0) {
        console.log('🗑️ Entrada removida:', entryId);
        return true;
      }

      return false; // Entrada não encontrada
    } catch (error) {
      console.error('❌ Erro ao remover entrada:', error);
      return false;
    }
  }

  /**
   * Formata entrada do formato do banco para o formato da aplicação
   * @param {Object} dbEntry - Entrada do banco de dados
   * @returns {Object} - Entrada formatada
   */
  formatEntry(dbEntry) {
    return {
      id: dbEntry.id,
      content: dbEntry.content,
      whatsappNumber: dbEntry.whatsapp_number,
      userId: dbEntry.user_id,
      userName: dbEntry.user_name,
      timestamp: dbEntry.timestamp,
      createdAt: dbEntry.created_at,
      updatedAt: dbEntry.updated_at,
      sentiment: dbEntry.sentiment,
      sentimentConfidence: dbEntry.sentiment_confidence,
      sentimentExplanation: dbEntry.sentiment_explanation,
      metadata: typeof dbEntry.metadata === 'string'
        ? JSON.parse(dbEntry.metadata)
        : dbEntry.metadata
    };
  }
}

module.exports = DiaryStorage;
