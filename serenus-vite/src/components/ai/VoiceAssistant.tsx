import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface VoiceAssistantProps {
    onTranscript: (text: string) => void;
    isListening?: boolean;
    onListeningChange?: (isListening: boolean) => void;
    className?: string;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
    onTranscript,
    isListening: externalIsListening,
    onListeningChange,
    className
}) => {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);
    const [isSupported, setIsSupported] = useState(true);
    const [audioLevel, setAudioLevel] = useState(0);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (SpeechRecognition) {
                const recognitionInstance = new SpeechRecognition();
                recognitionInstance.continuous = true;
                recognitionInstance.interimResults = true;
                recognitionInstance.lang = 'pt-BR';

                recognitionInstance.onresult = (event: any) => {
                    let finalTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        }
                    }

                    if (finalTranscript) {
                        onTranscript(finalTranscript);
                    }
                };

                recognitionInstance.onerror = (event: any) => {
                    console.error('Speech recognition error', event.error);
                    stopListening();
                };

                recognitionInstance.onend = () => {
                    if (isListening) {
                        stopListening();
                    }
                };

                setRecognition(recognitionInstance);
            } else {
                setIsSupported(false);
            }
        }
    }, [onTranscript]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isListening) {
            interval = setInterval(() => {
                setAudioLevel(Math.random() * 100);
            }, 100);
        } else {
            setAudioLevel(0);
        }
        return () => clearInterval(interval);
    }, [isListening]);

    const startListening = useCallback(() => {
        if (recognition && !isListening) {
            try {
                recognition.start();
                setIsListening(true);
                onListeningChange?.(true);
            } catch (error) {
                console.error('Error starting recognition:', error);
            }
        }
    }, [recognition, isListening, onListeningChange]);

    const stopListening = useCallback(() => {
        if (recognition && isListening) {
            recognition.stop();
            setIsListening(false);
            onListeningChange?.(false);
        }
    }, [recognition, isListening, onListeningChange]);

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const handleClick = () => {
        if (!isSupported) {
            alert('Seu navegador não suporta reconhecimento de voz. Tente usar o Google Chrome ou Edge.');
            return;
        }
        toggleListening();
    };

    return (
        <div className={cn("relative inline-flex items-center justify-center", className)}>
            <AnimatePresence>
                {isListening && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1.5 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 bg-primary-100 rounded-full -z-10"
                    />
                )}
            </AnimatePresence>

            <button
                type="button"
                onClick={handleClick}
                className={cn(
                    "relative z-10 p-2 rounded-full transition-all duration-300 shadow-sm",
                    isListening
                        ? "bg-red-500 text-white hover:bg-red-600 shadow-red-200"
                        : isSupported
                            ? "bg-white text-primary-600 hover:bg-primary-50 border border-primary-100"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                )}
                title={isSupported ? (isListening ? "Parar gravação" : "Iniciar gravação por voz") : "Reconhecimento de voz não suportado"}
            >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {isListening && (
                <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none">
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            className="w-1 bg-primary-400 rounded-full"
                            animate={{
                                height: [10, Math.max(10, audioLevel * (i * 0.5)), 10]
                            }}
                            transition={{
                                duration: 0.2,
                                repeat: Infinity,
                                repeatType: "reverse",
                                delay: i * 0.1
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
