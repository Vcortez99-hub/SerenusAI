import { useState, useRef, useCallback } from 'react'

interface UseAudioRecordingReturn {
  isRecording: boolean
  audioBlob: Blob | null
  audioUrl: string | null
  startRecording: () => Promise<void>
  stopRecording: () => void
  clearRecording: () => void
  error: string | null
}

export const useAudioRecording = (): UseAudioRecordingReturn => {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      
      // Solicitar permissão para usar o microfone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      })
      
      // Verificar se o navegador suporta MediaRecorder
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        throw new Error('Formato de áudio não suportado pelo navegador')
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        setAudioBlob(audioBlob)
        setAudioUrl(audioUrl)
        
        // Parar todas as faixas de áudio para liberar o microfone
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      
    } catch (err) {
      console.error('Erro ao iniciar gravação:', err)
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Permissão para usar o microfone foi negada. Por favor, permita o acesso ao microfone.')
        } else if (err.name === 'NotFoundError') {
          setError('Nenhum microfone foi encontrado. Verifique se há um microfone conectado.')
        } else {
          setError(err.message)
        }
      } else {
        setError('Erro desconhecido ao acessar o microfone')
      }
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const clearRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setError(null)
  }, [audioUrl])

  return {
    isRecording,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    clearRecording,
    error
  }
}