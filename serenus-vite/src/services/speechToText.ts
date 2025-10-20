export class SpeechToTextService {
  private recognition: SpeechRecognition | null = null
  private isListening = false

  constructor() {
    // Verificar se o navegador suporta Web Speech API
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition()
    } else if ('SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition()
    }

    if (this.recognition) {
      this.setupRecognition()
    }
  }

  private setupRecognition() {
    if (!this.recognition) return

    this.recognition.continuous = false
    this.recognition.interimResults = true
    this.recognition.lang = 'pt-BR'
    this.recognition.maxAlternatives = 1
  }

  public isSupported(): boolean {
    return this.recognition !== null
  }

  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (error: string) => void,
    onEnd?: () => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        const error = 'Web Speech API não é suportada neste navegador'
        onError?.(error)
        reject(new Error(error))
        return
      }

      if (this.isListening) {
        const error = 'Já está escutando'
        onError?.(error)
        reject(new Error(error))
        return
      }

      this.recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1]
        const transcript = result.transcript
        const isFinal = result.isFinal
        
        onResult(transcript, isFinal)
      }

      this.recognition.onerror = (event) => {
        this.isListening = false
        let errorMessage = 'Erro no reconhecimento de voz'
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'Nenhuma fala foi detectada. Tente falar mais alto.'
            break
          case 'audio-capture':
            errorMessage = 'Erro ao capturar áudio. Verifique seu microfone.'
            break
          case 'not-allowed':
            errorMessage = 'Permissão para usar o microfone foi negada.'
            break
          case 'network':
            errorMessage = 'Erro de rede. Verifique sua conexão.'
            break
          case 'service-not-allowed':
            errorMessage = 'Serviço de reconhecimento de voz não permitido.'
            break
        }
        
        onError?.(errorMessage)
        reject(new Error(errorMessage))
      }

      this.recognition.onstart = () => {
        this.isListening = true
        resolve()
      }

      this.recognition.onend = () => {
        this.isListening = false
        onEnd?.()
      }

      try {
        this.recognition.start()
      } catch (error) {
        this.isListening = false
        const errorMessage = 'Erro ao iniciar reconhecimento de voz'
        onError?.(errorMessage)
        reject(new Error(errorMessage))
      }
    })
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
  }

  public getIsListening(): boolean {
    return this.isListening
  }
}

// Instância singleton
export const speechToTextService = new SpeechToTextService()