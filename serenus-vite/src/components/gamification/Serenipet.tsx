import React from 'react';
import { motion } from 'framer-motion';
import { useGamification } from '@/contexts/GamificationContext';
import { useTheme } from '@/contexts/ThemeContext';

export const Serenipet: React.FC = () => {
    const { level, streak } = useGamification();
    const { moodTheme } = useTheme();

    // Determine pet color based on mood theme
    const getPetColor = () => {
        switch (moodTheme) {
            case 'calm': return 'from-teal-300 to-teal-500';
            case 'energetic': return 'from-amber-300 to-orange-500';
            case 'melancholic': return 'from-indigo-300 to-purple-500';
            default: return 'from-blue-300 to-blue-500';
        }
    };

    // Determine pet shape/complexity based on level
    const getPetScale = () => {
        return 1 + (level * 0.1);
    };

    return (
        <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Aura/Glow */}
            <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${getPetColor()} opacity-20 blur-3xl rounded-full`}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* The Pet Entity */}
            <motion.div
                className={`relative w-24 h-24 bg-gradient-to-br ${getPetColor()} rounded-full shadow-lg flex items-center justify-center`}
                animate={{
                    y: [0, -10, 0],
                    scale: getPetScale()
                }}
                transition={{
                    y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    scale: { duration: 0.5 }
                }}
            >
                {/* Eyes */}
                <div className="flex gap-4">
                    <motion.div
                        className="w-3 h-3 bg-white rounded-full"
                        animate={{ scaleY: [1, 0.1, 1] }}
                        transition={{ duration: 0.2, delay: 3, repeat: Infinity, repeatDelay: 4 }}
                    />
                    <motion.div
                        className="w-3 h-3 bg-white rounded-full"
                        animate={{ scaleY: [1, 0.1, 1] }}
                        transition={{ duration: 0.2, delay: 3, repeat: Infinity, repeatDelay: 4 }}
                    />
                </div>

                {/* Mouth (Simple smile) */}
                <div className="absolute bottom-6 w-4 h-2 border-b-2 border-white/50 rounded-full" />
            </motion.div>

            {/* Streak Badge */}
            {streak > 0 && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md border-2 border-white"
                >
                    🔥 {streak} dias
                </motion.div>
            )}
        </div>
    );
};
