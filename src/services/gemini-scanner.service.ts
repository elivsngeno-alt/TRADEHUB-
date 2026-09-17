import { GoogleGenAI } from '@google/genai';

export interface GeminiAnalysisResult {
    symbol: string;
    marketName: string;
    recommendedSide: 'DIGITOVER' | 'DIGITUNDER';
    primaryBarrier: number;
    recoverySide: 'DIGITOVER' | 'DIGITUNDER';
    recoveryBarrier: number;
    aiConfidence: number; // 0 to 1
    aiInsight: string;
    digitFrequency: Record<number, number>;
    isGeminiPowered: boolean;
}

export interface MarketScanData {
    symbol: string;
    name: string;
    pipSize: number;
    digits: number[];
    strategyOver: number;
    strategyUnder: number;
}

const getApiKey = (): string => {
    return (
        process.env.GEMINI_API_KEY ||
        process.env.VITE_GEMINI_API_KEY ||
        localStorage.getItem('gemini_api_key') ||
        ''
    );
};

export async function analyzeMarketWithGemini(scanData: MarketScanData): Promise<GeminiAnalysisResult> {
    const apiKey = getApiKey();
    const { symbol, name, digits, strategyOver, strategyUnder } = scanData;
    const sampleSize = digits.length;
    
    // Frequency breakdown
    const freq: Record<number, number> = {};
    for (let d = 0; d <= 9; d++) freq[d] = 0;
    digits.forEach(d => {
        if (freq[d] !== undefined) freq[d]++;
    });

    const recent = digits.slice(-50);
    const recentOverCount = recent.filter(d => d > strategyOver).length;
    const recentUnderCount = recent.filter(d => d < strategyUnder).length;

    // Check if Gemini API key exists to perform real LLM call
    if (apiKey) {
        try {
            const ai = new GoogleGenAI({ apiKey });
            const prompt = `You are an expert quantitative trading AI scanning Deriv Volatility Index market data.
Market: ${name} (${symbol})
Ticks Analyzed: ${sampleSize}
Last 50 Digits: ${recent.join(', ')}
Digit Frequencies (0-9): ${JSON.stringify(freq)}
Over Strategy Barrier: Over ${strategyOver}
Under Strategy Barrier: Under ${strategyUnder}

Analyze this tick distribution and return a JSON object strictly matching this schema:
{
  "recommendedSide": "DIGITOVER" or "DIGITUNDER",
  "primaryBarrier": number (e.g. ${strategyOver} or ${strategyUnder}),
  "recoverySide": "DIGITOVER" or "DIGITUNDER",
  "recoveryBarrier": number,
  "aiConfidence": number between 0.50 and 0.98,
  "aiInsight": "Short detailed bullet explanation (under 120 chars) of why this side is favored based on digit bias."
}`;

            const response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                },
            });

            if (response?.text) {
                const parsed = JSON.parse(response.text);
                return {
                    symbol,
                    marketName: name,
                    recommendedSide: parsed.recommendedSide === 'DIGITOVER' ? 'DIGITOVER' : 'DIGITUNDER',
                    primaryBarrier: Number(parsed.primaryBarrier) || strategyOver,
                    recoverySide: parsed.recoverySide === 'DIGITUNDER' ? 'DIGITUNDER' : 'DIGITOVER',
                    recoveryBarrier: Number(parsed.recoveryBarrier) || strategyUnder,
                    aiConfidence: Math.min(0.99, Math.max(0.5, Number(parsed.aiConfidence) || 0.85)),
                    aiInsight: String(parsed.aiInsight || 'Gemini 3.8 Flash pattern scan complete.').slice(0, 150),
                    digitFrequency: freq,
                    isGeminiPowered: true,
                };
            }
        } catch (err) {
            console.warn('Gemini API call failed, falling back to algorithmic AI scanner engine:', err);
        }
    }

    // Algorithmic Fallback AI Scanner Logic
    const overRate = digits.filter(d => d > strategyOver).length / sampleSize;
    const underRate = digits.filter(d => d < strategyUnder).length / sampleSize;
    const recentOverRate = recentOverCount / recent.length;
    const recentUnderRate = recentUnderCount / recent.length;

    const overScore = overRate * 0.5 + recentOverRate * 0.5;
    const underScore = underRate * 0.5 + recentUnderRate * 0.5;

    const isOverFavored = overScore >= underScore;
    const confidence = Math.min(0.96, Math.max(0.62, Math.abs(overScore - underScore) * 1.8 + 0.72));

    const recommendedSide: 'DIGITOVER' | 'DIGITUNDER' = isOverFavored ? 'DIGITOVER' : 'DIGITUNDER';
    const primaryBarrier = isOverFavored ? strategyOver : strategyUnder;
    const recoverySide: 'DIGITOVER' | 'DIGITUNDER' = isOverFavored ? 'DIGITUNDER' : 'DIGITOVER';
    const recoveryBarrier = isOverFavored ? strategyUnder : strategyOver;

    const topDigit = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || '0';
    const insight = isOverFavored
        ? `High momentum on digit Over ${strategyOver}. Digit ${topDigit} recurring frequently in last ${recent.length} ticks.`
        : `Strong defense on digit Under ${strategyUnder}. Low digit density favoring Under recovery barrier.`;

    return {
        symbol,
        marketName: name,
        recommendedSide,
        primaryBarrier,
        recoverySide,
        recoveryBarrier,
        aiConfidence: Math.round(confidence * 100) / 100,
        aiInsight: insight,
        digitFrequency: freq,
        isGeminiPowered: false,
    };
}
