import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';
type MoodTheme = 'default' | 'calm' | 'energetic' | 'melancholic' | 'focus';

interface ThemeContextType {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    moodTheme: MoodTheme;
    setMoodTheme: (theme: MoodTheme) => void;
    isSereneMode: boolean;
    toggleSereneMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<ThemeMode>('system');
    const [moodTheme, setMoodTheme] = useState<MoodTheme>('default');
    const [isSereneMode, setIsSereneMode] = useState(false);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (mode === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(mode);
        }
    }, [mode]);

    useEffect(() => {
        const root = window.document.documentElement;
        // Remove previous mood classes
        root.classList.remove('theme-calm', 'theme-energetic', 'theme-melancholic', 'theme-focus');

        if (moodTheme !== 'default') {
            root.classList.add(`theme-${moodTheme}`);
        }
    }, [moodTheme]);

    useEffect(() => {
        const root = window.document.documentElement;
        if (isSereneMode) {
            root.classList.add('serene-mode');
        } else {
            root.classList.remove('serene-mode');
        }
    }, [isSereneMode]);

    const toggleSereneMode = () => setIsSereneMode(prev => !prev);

    return (
        <ThemeContext.Provider value={{ mode, setMode, moodTheme, setMoodTheme, isSereneMode, toggleSereneMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
