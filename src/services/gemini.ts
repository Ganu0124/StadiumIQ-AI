import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

export const aiEngineConnected = !!apiKey;

// Simulate Gemini service responses if no API key is specified
export async function generateAICrowdPrediction(gateId: string, currentWait: number): Promise<string> {
  if (!apiKey) {
    return `AI predicted wait at ${gateId} in 30 minutes: ${Math.round(currentWait * 0.7)}m. Recommendation: Disperse spectator flow.`;
  }
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Given stadium entrance Gate ID ${gateId} currently experiencing a queue wait of ${currentWait} minutes, forecast wait durations and issue crowd control advisories in one line.`,
    });
    return response.text || 'Normal traffic flow forecast.';
  } catch (error) {
    console.error('Gemini prediction error:', error);
    return 'Advisory: Normal operations pattern.';
  }
}

export async function generateAIIncidentSummary(title: string, description: string): Promise<string> {
  if (!apiKey) {
    return `AI Summary: Active security incident involving ${title}. Recommended steps: Deploy patrol cart and inspect sector grid.`;
  }
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Create a brief summary and critical response action plan for the following stadium incident. Title: ${title}, Description: ${description}. Output summary and recommendations.`,
    });
    return response.text || 'Incident logged. Standard SOP active.';
  } catch (error) {
    console.error('Gemini summary error:', error);
    return 'Logged incident. Standard SOP active.';
  }
}
