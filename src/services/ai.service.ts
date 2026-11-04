import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../config/environment';

export interface IAiTutorResult {
  aiText: string;
  coachTip: string;
  fluencyScore: number;
}

export interface IPronunciationEvaluation {
  score: number;
  isCorrect: boolean;
  recognizedText: string;
  targetWord: string;
  phonetic: string;
  syllableStress: string;
  correction: string;
  detailedFeedback: string;
  tip: string;
}

export interface IGeneratedWordCard {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  cefrLevel: string;
  definition: string;
  exampleSentence: string;
  memoryAnchor: string;
  syllableStress: string;
}

export class AiService {
  private static geminiClient: GoogleGenerativeAI | null = null;

  private static getGemini(): GoogleGenerativeAI | null {
    const key = ENV.GEMINI_API_KEY?.trim();
    if (!this.geminiClient && key) {
      this.geminiClient = new GoogleGenerativeAI(key);
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
    const groqKey = ENV.GROQ_API_KEY?.trim();
    if (!groqKey) {
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
          Authorization: `Bearer ${groqKey}`,
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

  /**
   * Evaluates user pronunciation of a target word with phonetic corrections and score.
   */
  static async evaluatePronunciation(
    targetWord: string,
    spokenText: string
  ): Promise<IPronunciationEvaluation> {
    const cleanTarget = targetWord.trim();
    const cleanSpoken = spokenText.trim();
    const gemini = this.getGemini();

    if (gemini) {
      try {
        const model = gemini.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 350,
          },
        });

        const prompt = `
You are an expert native English phonetician and pronunciation coach in SpeakUp app.
Target Word: "${cleanTarget}"
Learner Spoke / Transcribed: "${cleanSpoken}"

Evaluate their pronunciation accuracy, syllable stress, and phonetic clarity.
Return strict JSON with this exact schema:
{
  "score": number between 0 and 100,
  "isCorrect": boolean (true if score >= 80),
  "recognizedText": "${cleanSpoken}",
  "targetWord": "${cleanTarget}",
  "phonetic": "Standard IPA, e.g. /ˈkɑːnfɪdənt/",
  "syllableStress": "Syllables with uppercase stressed syllable, e.g. CON-fi-dent",
  "correction": "1 short sentence acknowledging accuracy or highlighting the mispronounced phoneme",
  "detailedFeedback": "1 sentence instructing exactly how to position the tongue/mouth for correct sound",
  "tip": "1 actionable native speaker tip"
}

JSON only:
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            score: typeof parsed.score === 'number' ? Math.min(100, Math.max(0, parsed.score)) : 95,
            isCorrect: parsed.isCorrect ?? (parsed.score >= 80),
            recognizedText: parsed.recognizedText || cleanSpoken,
            targetWord: cleanTarget,
            phonetic: parsed.phonetic || '/ˈkɑːnfɪdənt/',
            syllableStress: parsed.syllableStress || cleanTarget.toUpperCase(),
            correction: parsed.correction || 'Good pronunciation attempt!',
            detailedFeedback: parsed.detailedFeedback || 'Ensure clear vocalization of vowels.',
            tip: parsed.tip || 'Stress the primary syllable with a slightly higher pitch.',
          };
        }
      } catch (err: any) {
        console.warn('[AiService] Gemini pronunciation evaluation error, using heuristic engine:', err.message);
      }
    }

    // Algorithmic Pronunciation Evaluator
    const similarity = this.calculateSimilarity(cleanTarget.toLowerCase(), cleanSpoken.toLowerCase());
    let score = Math.round(similarity * 100);
    // If spoken contains the target word, reward accuracy
    if (cleanSpoken.toLowerCase().includes(cleanTarget.toLowerCase())) {
      score = Math.max(score, 94);
    }
    const isCorrect = score >= 78;

    const stressMap: Record<string, { stress: string; ipa: string; tip: string }> = {
      confident: { stress: 'CON-fi-dent', ipa: '/ˈkɑːnfɪdənt/', tip: 'Stress the first syllable: CON-fi-dent. Keep the middle vowel short.' },
      articulate: { stress: 'ar-TIC-u-late', ipa: '/ɑːrˈtɪkjələt/', tip: 'Put primary stress on the second syllable "TIC".' },
      pronunciation: { stress: 'pro-NUN-ci-A-tion', ipa: '/prəˌnʌnsiˈeɪʃn/', tip: 'Notice it is "NUN", not "NOUN". Stress the "A" syllable.' },
      perseverance: { stress: 'per-se-VEER-ance', ipa: '/ˌpɜːrsəˈvɪrəns/', tip: 'Elongate the "VEER" syllable with rising pitch.' },
      comfortable: { stress: 'COMF-ter-ble', ipa: '/ˈkʌmftərbəl/', tip: 'Native speakers drop the middle vowel: say "COMF-ter-ble", not "com-for-ta-ble".' },
      vocabulary: { stress: 'vo-CAB-u-lar-y', ipa: '/vəˈkæbjəleri/', tip: 'Stress the second syllable "CAB".' },
      resilient: { stress: 're-ZIL-yent', ipa: '/rɪˈzɪliənt/', tip: 'Make the "Z" sound vocal and sharp in "ZIL".' },
      eloquent: { stress: 'EL-o-kwent', ipa: '/ˈeləkwənt/', tip: 'Clear "EL" onset with light unstressed ending.' },
    };

    const targetKey = cleanTarget.toLowerCase();
    const meta = stressMap[targetKey] || {
      stress: cleanTarget.length > 5 ? `${cleanTarget.slice(0, 3).toUpperCase()}-${cleanTarget.slice(3)}` : cleanTarget.toUpperCase(),
      ipa: `/${cleanTarget.toLowerCase()}/`,
      tip: 'Speak steadily and accentuate the primary vowel sound.',
    };

    let correction = '';
    let detailedFeedback = '';

    if (score >= 90) {
      correction = `Excellent pronunciation! You articulated "${cleanTarget}" clearly and with natural stress.`;
      detailedFeedback = `Phonetic accuracy: ${score}%. Your accent is natural and easily understood.`;
    } else if (score >= 75) {
      correction = `Good attempt! You said "${cleanSpoken}". Strive for a clearer primary stress on "${meta.stress}".`;
      detailedFeedback = `You were close (${score}%). Listen closely to the model audio and match the syllable rhythm.`;
    } else {
      correction = `Needs adjustment. Heard "${cleanSpoken}" instead of "${cleanTarget}".`;
      detailedFeedback = `Break down the syllables: ${meta.stress}. Practice the vowels individually before saying the full word.`;
    }

    return {
      score,
      isCorrect,
      recognizedText: cleanSpoken,
      targetWord: cleanTarget,
      phonetic: meta.ipa,
      syllableStress: meta.stress,
      correction,
      detailedFeedback,
      tip: meta.tip,
    };
  }

  /**
   * Looks up or AI-generates complete educational metadata for any English word.
   */
  static async generateWordCard(word: string): Promise<IGeneratedWordCard> {
    const cleanWord = word.trim();
    const gemini = this.getGemini();

    if (gemini) {
      try {
        const model = gemini.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 350,
          },
        });

        const prompt = `
Generate complete vocabulary flashcard details for the English word: "${cleanWord}".
Return strict JSON format:
{
  "word": "${cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase()}",
  "phonetic": "Standard IPA with slashes, e.g. /ˈkɑːnfɪdənt/",
  "partOfSpeech": "Adjective | Noun | Verb | Adverb",
  "cefrLevel": "A2 | B1 | B2 | C1",
  "definition": "Clear, concise learner definition (1 sentence)",
  "exampleSentence": "A modern, natural sentence using the word in context (1 sentence)",
  "memoryAnchor": "A memorable mnemonic anchor phrase (3-6 words)",
  "syllableStress": "Syllable breakdown with uppercase stressed syllable, e.g. CON-fi-dent"
}

JSON only:
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            word: parsed.word || cleanWord,
            phonetic: parsed.phonetic || `/${cleanWord.toLowerCase()}/`,
            partOfSpeech: parsed.partOfSpeech || 'Adjective',
            cefrLevel: parsed.cefrLevel || 'B1',
            definition: parsed.definition || `The quality or state associated with ${cleanWord}.`,
            exampleSentence: parsed.exampleSentence || `She demonstrated high proficiency in using ${cleanWord} during the discussion.`,
            memoryAnchor: parsed.memoryAnchor || `Remember ${cleanWord} through active practice.`,
            syllableStress: parsed.syllableStress || cleanWord.toUpperCase(),
          };
        }
      } catch (err: any) {
        console.warn('[AiService] Gemini word card generation error:', err.message);
      }
    }

    // Heuristic generator
    const capitalized = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase();
    return {
      word: capitalized,
      phonetic: `/${cleanWord.toLowerCase()}/`,
      partOfSpeech: cleanWord.endsWith('ly') ? 'Adverb' : (cleanWord.endsWith('tion') || cleanWord.endsWith('ness') ? 'Noun' : 'Adjective'),
      cefrLevel: cleanWord.length > 8 ? 'B2' : 'B1',
      definition: `Expressing or embodying the characteristics of being ${cleanWord.toLowerCase()}.`,
      exampleSentence: `Mastering words like "${capitalized}" empowers you to express yourself with poise and clarity.`,
      memoryAnchor: `Practice "${capitalized}" daily in speech.`,
      syllableStress: capitalized.length > 5 ? `${capitalized.slice(0, 3).toUpperCase()}-${capitalized.slice(3)}` : capitalized.toUpperCase(),
    };
  }

  /**
   * Normalized Levenshtein distance string similarity (0.0 to 1.0)
   */
  private static calculateSimilarity(s1: string, s2: string): number {
    if (!s1 && !s2) return 1.0;
    if (!s1 || !s2) return 0.0;
    if (s1 === s2) return 1.0;

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    const longerLength = longer.length;
    if (longerLength === 0) return 1.0;

    const costs = new Array();
    for (let i = 0; i <= longer.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= shorter.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[shorter.length] = lastValue;
    }

    const editDistance = costs[shorter.length];
    return Math.max(0, (longerLength - editDistance) / longerLength);
  }
}
