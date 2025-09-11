const fs = require('fs').promises;
const path = require('path');

class DiaryStorage {
  constructor() {
    this.dataFile = path.join(__dirname, 'diary-entries.json');
    this.initializeStorage();
  }

  /**
   * Inicializa o arquivo de armazenamento se não existir
   */
  async initializeStorage() {
    try {
      await fs.access(this.dataFile);
    } catch (error) {
      // Arquivo não existe, criar com array vazio
      await fs.writeFile(this.dataFile, JSON.stringify([], null, 2));
      console.log('📁 Arquivo de armazenamento do diário criado:', this.dataFile);
    }
  }

  /**
   * Salva uma nova entrada no diário
   * @param {Object} entry - Entrada do diário
   * @returns {Object} - Entrada salva com ID único
   */
  async saveEntry(entry) {
    try {
      const entries = await this.getAllEntries();
      
      // Adicionar timestamp único e ID se não existir
      const newEntry = {
        ...entry,
        id: entry.id || `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      entries.push(newEntry);
      
      // Ordenar por timestamp (mais recente primeiro)
      entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      await fs.writeFile(this.dataFile, JSON.stringify(entries, null, 2));
      
      console.log('💾 Nova entrada salva no diário:', {
        id: newEntry.id,
        content: newEntry.content.substring(0, 50) + '...',
        timestamp: newEntry.timestamp
      });
      
      return newEntry;
    } catch (error) {
      console.error('❌ Erro ao salvar entrada no diário:', error);
      throw error;
    }
  }

  /**
   * Recupera todas as entradas do diário
   * @returns {Array} - Array de entradas
   */
  async getAllEntries() {
    try {
      const data = await fs.readFile(this.dataFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Erro ao ler entradas do diário:', error);
      return [];
    }
  }

  /**
   * Recupera entradas por número do WhatsApp
   * @param {string} whatsappNumber - Número do WhatsApp
   * @returns {Array} - Array de entradas do usuário
   */
  async getEntriesByNumber(whatsappNumber) {
    try {
      const entries = await this.getAllEntries();
      return entries.filter(entry => entry.whatsappNumber === whatsappNumber);
    } catch (error) {
      console.error('❌ Erro ao buscar entradas por número:', error);
      return [];
    }
  }

  /**
   * Recupera entradas por data
   * @param {string} date - Data no formato YYYY-MM-DD
   * @returns {Array} - Array de entradas da data
   */
  async getEntriesByDate(date) {
    try {
      const entries = await this.getAllEntries();
      return entries.filter(entry => {
        const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
        return entryDate === date;
      });
    } catch (error) {
      console.error('❌ Erro ao buscar entradas por data:', error);
      return [];
    }
  }

  /**
   * Recupera estatísticas do diário
   * @returns {Object} - Estatísticas
   */
  async getStats() {
    try {
      const entries = await this.getAllEntries();
      const totalEntries = entries.length;
      const uniqueNumbers = [...new Set(entries.map(entry => entry.whatsappNumber))];
      const lastEntry = entries.length > 0 ? entries[0] : null;
      
      return {
        totalEntries,
        uniqueUsers: uniqueNumbers.length,
        lastEntry: lastEntry ? {
          date: new Date(lastEntry.timestamp).toLocaleDateString('pt-BR'),
          preview: lastEntry.content.substring(0, 100)
        } : null
      };
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
      return { totalEntries: 0, uniqueUsers: 0, lastEntry: null };
    }
  }

  /**
   * Remove uma entrada pelo ID
   * @param {string} entryId - ID da entrada
   * @returns {boolean} - True se removida com sucesso
   */
  async removeEntry(entryId) {
    try {
      const entries = await this.getAllEntries();
      const filteredEntries = entries.filter(entry => entry.id !== entryId);
      
      if (filteredEntries.length === entries.length) {
        return false; // Entrada não encontrada
      }
      
      await fs.writeFile(this.dataFile, JSON.stringify(filteredEntries, null, 2));
      console.log('🗑️ Entrada removida:', entryId);
      return true;
    } catch (error) {
      console.error('❌ Erro ao remover entrada:', error);
      return false;
    }
  }
}

module.exports = DiaryStorage;