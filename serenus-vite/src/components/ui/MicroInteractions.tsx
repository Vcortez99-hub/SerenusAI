import React, { useState, useCallback } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

// --- Haptic Feedback Hook ---
export const useHaptic = () => {
    const triggerHaptic = useCallback((pattern: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
        if (!navigator.vibrate) return;

        switch (pattern) {
            case 'light':
                navigator.vibrate(10);
                break;
            case 'medium':
                navigator.vibrate(20);
                break;
            case 'heavy':
                navigator.vibrate(40);
                break;
            case 'success':
                navigator.vibrate([10, 30, 10]);
                break;
            case 'error':
                navigator.vibrate([50, 30, 50, 30, 50]);
                break;
        }
    }, []);

    return triggerHaptic;
};

// --- Sound Feedback Hook ---
// Note: In a real app, you'd load audio files. For now, we'll simulate or prepare the structure.
export const useSound = (soundUrl?: string) => {
    const playSound = useCallback(() => {
        if (!soundUrl) return;
        const audio = new Audio(soundUrl);
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Audio play failed (user interaction needed first)', e));
    }, [soundUrl]);

    return playSound;
};

// --- Breathing Button Component ---
interface BreathingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    haptic?: boolean;
    children: React.ReactNode;
}

export const BreathingButton: React.FC<BreathingButtonProps> = ({
    className,
    variant = 'primary',
    haptic = true,
    children,
    onClick,
    ...props
}) => {
    const triggerHaptic = useHaptic();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (haptic) triggerHaptic('light');
        onClick?.(e);
    };

    const baseStyles = "relative overflow-hidden rounded-xl px-6 py-3 font-bold transition-all duration-300 flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg hover:shadow-primary-500/25",
        secondary: "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50",
        ghost: "bg-transparent text-neutral-600 hover:bg-neutral-100"
    };

    return (
        <motion.button
            className={cn(baseStyles, variants[variant], className)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClick}
            {...(props as any)} // Cast to any to avoid framer-motion/react-dom conflict types
        >
            {/* Breathing Glow Effect for Primary */}
            {variant === 'primary' && (
                <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{ opacity: [0, 0.2, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
            )}
            <span className="relative z-10 flex items-center gap-2">{children}</span>
        </motion.button>
    );
};

// --- Pulse Indicator ---
export const PulseIndicator: React.FC<{ color?: string }> = ({ color = 'bg-green-500' }) => (
    <span className="relative flex h-3 w-3">
        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", color)}></span>
        <span className={cn("relative inline-flex rounded-full h-3 w-3", color)}></span>
    </span>
);
