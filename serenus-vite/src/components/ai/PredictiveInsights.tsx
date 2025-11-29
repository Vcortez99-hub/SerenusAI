import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';
import { OpenAIService } from '@/services/openai';

interface PredictiveInsightsProps {
    moodHistory: any[];
    currentMood: string;
}

export const PredictiveInsights: React.FC<PredictiveInsightsProps> = ({ moodHistory, currentMood }) => {
    const [prediction, setPrediction] = useState<string | null>(null);
    const [cbtSuggestions, setCbtSuggestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadInsights = async () => {
            setIsLoading(true);
            try {
                const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
                if (!apiKey) return;

                const openai = new OpenAIService(apiKey);

                // Load prediction
                const pred = await openai.generatePredictiveAnalysis(moodHistory);
                setPrediction(pred);

                // Load CBT suggestions
                const cbtRaw = await openai.suggestCBTExercises(currentMood, moodHistory);
                try {
                    // Attempt to parse JSON from the response if the AI followed instructions perfectly
                    // Often AI adds text around JSON, so we might need a more robust parser or just display text
                    // For this demo, let's assume we might get text or JSON. 
                    // If it's a string that looks like JSON, parse it.
                    const jsonMatch = cbtRaw.match(/\[.*\]/s);
                    if (jsonMatch) {
                        setCbtSuggestions(JSON.parse(jsonMatch[0]));
                    } else {
                        // Fallback if not valid JSON
                        setCbtSuggestions([{ title: "Sugestão Geral", instruction: cbtRaw }]);
                    }
                } catch (e) {
                    console.error("Error parsing CBT suggestions", e);
                    setCbtSuggestions([]);
                }

            } catch (error) {
                console.error("Error loading predictive insights", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (moodHistory.length > 0) {
            loadInsights();
        }
    }, [moodHistory, currentMood]);

    if (isLoading) {
        return (
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Prediction Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100 shadow-sm"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Brain className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Insights Preditivos</h3>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">
                    {prediction || "Aguardando dados suficientes para gerar previsões..."}
                </p>
            </motion.div>

            {/* CBT Suggestions */}
            <div className="grid gap-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    Sugestões de TCC (CBT)
                </h4>
                {cbtSuggestions.map((exercise, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors shadow-sm"
                    >
                        <h5 className="font-semibold text-indigo-900 mb-1">{exercise.title}</h5>
                        <p className="text-sm text-gray-600">{exercise.instruction}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
