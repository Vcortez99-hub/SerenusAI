// Serviço de criptografia end-to-end para dados sensíveis
// Usa Web Crypto API (nativa do navegador)

class EncryptionService {
  private algorithm = 'AES-GCM'
  private keyLength = 256

  /**
   * Gera uma chave de criptografia baseada no ID do usuário
   */
  private async deriveKey(userId: string): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(userId.padEnd(32, '0')),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    )

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('essentia-salt-2024'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.algorithm, length: this.keyLength },
      false,
      ['encrypt', 'decrypt']
    )
  }

  /**
   * Criptografa um texto usando o ID do usuário como chave
   */
  async encrypt(text: string, userId: string): Promise<string> {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(text)
      const key = await this.deriveKey(userId)

      // Gerar IV (Initialization Vector) aleatório
      const iv = crypto.getRandomValues(new Uint8Array(12))

      const encryptedData = await crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        data
      )

      // Combinar IV + dados criptografados
      const combined = new Uint8Array(iv.length + encryptedData.byteLength)
      combined.set(iv, 0)
      combined.set(new Uint8Array(encryptedData), iv.length)

      // Converter para Base64
      return btoa(String.fromCharCode(...combined))
    } catch (error) {
      console.error('Erro ao criptografar:', error)
      throw new Error('Falha na criptografia')
    }
  }

  /**
   * Descriptografa um texto usando o ID do usuário como chave
   */
  async decrypt(encryptedText: string, userId: string): Promise<string> {
    try {
      // Converter de Base64
      const combined = new Uint8Array(
        atob(encryptedText).split('').map(c => c.charCodeAt(0))
      )

      // Extrair IV e dados criptografados
      const iv = combined.slice(0, 12)
      const data = combined.slice(12)

      const key = await this.deriveKey(userId)

      const decryptedData = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        data
      )

      const decoder = new TextDecoder()
      return decoder.decode(decryptedData)
    } catch (error) {
      console.error('Erro ao descriptografar:', error)
      // Retornar o texto original se falhar (para compatibilidade)
      return encryptedText
    }
  }

  /**
   * Verifica se um texto está criptografado
   */
  isEncrypted(text: string): boolean {
    try {
      // Tenta decodificar Base64
      atob(text)
      return text.length > 50 && !text.includes(' ')
    } catch {
      return false
    }
  }
}

export const encryptionService = new EncryptionService()
