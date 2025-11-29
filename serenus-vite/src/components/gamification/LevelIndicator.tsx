import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star } from 'lucide-react';
import { useGamification } from '@/contexts/GamificationContext';

export const LevelIndicator: React.FC = () => {
    const { level, xp, nextLevelXp, progressToNextLevel } = useGamification();

    return (
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm">
            <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {level}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                    <Trophy className="w-3 h-3 text-yellow-600" />
                </div>
            </div>

            <div className="flex flex-col w-32">
                <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                    <span>Nível {level}</span>
                    <span>{Math.floor(progressToNextLevel)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressToNextLevel}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>
            </div>
        </div>
    );
};
