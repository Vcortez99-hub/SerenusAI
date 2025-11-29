import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface MoodData {
    date: string;
    mood: 'happy' | 'neutral' | 'sad' | 'anxious' | 'angry';
    intensity: number; // 1-10
}

interface MoodLandscapeProps {
    data: MoodData[];
    period?: 'week' | 'month';
}

export const MoodLandscape: React.FC<MoodLandscapeProps> = ({ data, period = 'week' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Animation loop
        let animationFrameId: number;
        let time = 0;

        const render = () => {
            time += 0.005;
            const width = canvas.offsetWidth;
            const height = canvas.offsetHeight;

            ctx.clearRect(0, 0, width, height);

            // Create gradient background based on dominant mood
            const gradient = ctx.createLinearGradient(0, 0, width, height);

            // Simplified mood color mapping
            const moodColors = {
                happy: [255, 223, 0], // Gold
                neutral: [100, 149, 237], // Cornflower Blue
                sad: [72, 61, 139], // Dark Slate Blue
                anxious: [255, 69, 0], // Orange Red
                angry: [178, 34, 34] // Firebrick
            };

            // Calculate average mood color (simplified for demo)
            // In a real app, this would be weighted by recent data
            const baseColor = moodColors.happy; // Default to happy for visual appeal

            gradient.addColorStop(0, `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, 0.1)`);
            gradient.addColorStop(1, `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, 0.05)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Draw "Mood Flow" - organic waves representing emotional fluctuation
            data.forEach((day, index) => {
                const x = (index / (data.length - 1)) * width;
                const y = height / 2 + Math.sin(time + index) * 50 * (day.intensity / 5);

                ctx.beginPath();
                ctx.arc(x, y, 20 * (day.intensity / 5), 0, Math.PI * 2);

                const color = moodColors[day.mood] || moodColors.neutral;
                ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.6)`;
                ctx.fill();

                // Connecting lines (fluidity)
                if (index > 0) {
                    const prevX = ((index - 1) / (data.length - 1)) * width;
                    const prevY = height / 2 + Math.sin(time + (index - 1)) * 50 * (data[index - 1].intensity / 5);

                    ctx.beginPath();
                    ctx.moveTo(prevX, prevY);
                    ctx.quadraticCurveTo((prevX + x) / 2, (prevY + y) / 2 - 50, x, y);
                    ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.2)`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [data]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-64 rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm border border-white/20 shadow-inner"
        >
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ width: '100%', height: '100%' }}
            />
            <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-neutral-600 shadow-sm">
                Paisagem Emocional • {period === 'week' ? 'Última Semana' : 'Último Mês'}
            </div>
        </motion.div>
    );
};
