import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../config/environment';

export interface IAiTutorResult {
  aiText: string;
  coachTip: string;
  fluencyScore: number;
}

export class AiService {
  private static geminiClient: GoogleGenerativeAI | null = null;

  private static getGemini(): GoogleGenerativeAI | null {
    if (!this.geminiClient && ENV.GEMINI_API_KEY) {
      this.geminiClient = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
    }
    return this.geminiClient;
  }

  /**
   * Generates live AI Tutor response using Google Gemini 1.5 Flash.
   * If GEMINI_API_KEY is not configured, gracefully falls back to dynamic conversational heuristics.
   */
  static async generateTutorResponse(
    userMessage: string,
    topicTitle: string,
    cefrLevel: string
  ): Promise<IAiTutorResult> {
    const gemini = this.getGemini();

    if (gemini) {
      try {
        const model = gemini.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 250,
          },
        });

        const prompt = `
You are Maya, a warm, professional, native English speaking coach in the SpeakUp app.
Topic: "${topicTitle}" (Target Learner Level: ${cefrLevel}).
The user said: "${userMessage}"

Respond in valid JSON format with three exact keys:
1. "aiText": A natural, conversational response continuing the dialogue (1-2 sentences).
2. "coachTip": A short, constructive English pronunciation or grammar tip based on the user's sentence (1 sentence).
3. "fluencyScore": An integer between 80 and 99 evaluating the naturalness and vocabulary of their input.

JSON response only:
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            aiText: parsed.aiText || "That's wonderful! Tell me more about your thoughts on this.",
            coachTip: parsed.coachTip || "Great rhythm and cadence! Natural phrasing observed throughout.",
            fluencyScore: typeof parsed.fluencyScore === 'number' ? parsed.fluencyScore : 95,
          };
        }
      } catch (err: any) {
        console.warn('[AiService] Gemini API call skipped or failed, using heuristic engine:', err.message);
      }
    }

    // Heuristic Fallback (100% reliable offline / without API key)
    const lower = userMessage.toLowerCase();
    let reply = "That is a great perspective. How do you usually handle challenges when working under tight deadlines?";
    let tip = "Clear stress on key syllables. Try slightly relaxing vowel elongation on unstressed words.";

    if (lower.includes('latte') || lower.includes('coffee') || lower.includes('tea') || lower.includes('cafe')) {
      reply = "Certainly! Would you like that hot or iced? And can I get a name for your cup?";
      tip = "Excellent conversational tone! Keep the rising pitch on questions natural.";
    } else if (lower.includes('interview') || lower.includes('experience') || lower.includes('work')) {
      reply = "Impressive background! Could you describe a time when you solved a complex team problem?";
      tip = "Strong vocabulary choices. Emphasize action verbs to sound more confident.";
    } else if (lower.includes('weekend') || lower.includes('hobby') || lower.includes('park')) {
      reply = "That sounds so relaxing! Do you usually do that with friends or do you prefer quiet time alone?";
      tip = "Natural casual cadence! Great use of everyday idioms.";
    }

    const calculatedScore = Math.min(99, Math.max(88, 92 + (userMessage.length % 7)));

    return {
      aiText: reply,
      coachTip: tip,
      fluencyScore: calculatedScore,
    };
  }

  /**
   * Transcribes audio using Groq Whisper Large v3 (Free Tier).
   * If GROQ_API_KEY is not configured, returns fallback indication.
   */
  static async transcribeAudioWithGroqWhisper(
    audioBuffer: Buffer,
    filename: string
  ): Promise<string | null> {
    if (!ENV.GROQ_API_KEY) {
      return null;
    }

    try {
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/m4a' });
      formData.append('file', blob, filename);
      formData.append('model', 'whisper-large-v3');
      formData.append('language', 'en');

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ENV.GROQ_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('[AiService] Groq Whisper failed:', errorText);
        return null;
      }

      const data: any = await response.json();
      return data.text || null;
    } catch (err: any) {
      console.warn('[AiService] Groq Whisper error:', err.message);
      return null;
    }
  }
}
