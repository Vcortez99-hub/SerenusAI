import React, { createContext, useContext, useState, useEffect } from 'react';

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: Date;
}

interface GamificationContextType {
    xp: number;
    level: number;
    streak: number;
    achievements: Achievement[];
    addXp: (amount: number, reason?: string) => void;
    unlockAchievement: (id: string) => void;
    nextLevelXp: number;
    progressToNextLevel: number; // 0 to 100
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [xp, setXp] = useState(() => {
        const saved = localStorage.getItem('serenus_xp');
        return saved ? parseInt(saved, 10) : 0;
    });

    const [streak, setStreak] = useState(() => {
        const saved = localStorage.getItem('serenus_streak');
        return saved ? parseInt(saved, 10) : 0;
    });

    const [achievements, setAchievements] = useState<Achievement[]>([]);

    // Level calculation: Level = floor(sqrt(XP / 100)) + 1
    // XP for Level L = 100 * (L-1)^2
    const level = Math.floor(Math.sqrt(xp / 100)) + 1;
    const currentLevelBaseXp = 100 * Math.pow(level - 1, 2);
    const nextLevelXp = 100 * Math.pow(level, 2);
    const progressToNextLevel = Math.min(100, Math.max(0, ((xp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100));

    useEffect(() => {
        localStorage.setItem('serenus_xp', xp.toString());
    }, [xp]);

    useEffect(() => {
        localStorage.setItem('serenus_streak', streak.toString());
    }, [streak]);

    const addXp = (amount: number, reason?: string) => {
        setXp(prev => prev + amount);
        // Here we could add a toast notification for XP gain
        console.log(`Gained ${amount} XP: ${reason}`);
    };

    const unlockAchievement = (id: string) => {
        // Logic to unlock achievement
    };

    return (
        <GamificationContext.Provider value={{
            xp,
            level,
            streak,
            achievements,
            addXp,
            unlockAchievement,
            nextLevelXp,
            progressToNextLevel
        }}>
            {children}
        </GamificationContext.Provider>
    );
};

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (context === undefined) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
};
