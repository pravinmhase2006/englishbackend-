import { FastifyRequest, FastifyReply } from 'fastify';
import { VocabularyService } from '../services/vocabulary.service';
import { AiService } from '../services/ai.service';
import { updateWordProgressSchema } from '../validators/exercise.validator';
import { sendSuccess, sendError } from '../utils/response.utils';

export class VocabularyController {
  static async getWordOfTheDay(request: FastifyRequest, reply: FastifyReply) {
    try {
      const word = await VocabularyService.getWordOfTheDay();
      return sendSuccess(reply, word, 'Word of the day retrieved');
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to fetch word of the day', 400);
    }
  }

  static async getWords(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { cefrLevel, search, page, limit } = request.query as {
        cefrLevel?: string;
        search?: string;
        page?: string;
        limit?: string;
      };
      const result = await VocabularyService.getWords({
        cefrLevel,
        search,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
      });
      return sendSuccess(reply, result, 'Vocabulary words retrieved');
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to fetch vocabulary', 400);
    }
  }

  static async updateProgress(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;
      const { wordId } = request.params as { wordId: string };
      const parsed = updateWordProgressSchema.safeParse(request.body);
      if (!parsed.success) {
        return sendError(reply, 'Validation error', 400, parsed.error.format());
      }

      const progress = await VocabularyService.updateProgress(userId, wordId, parsed.data.status);
      return sendSuccess(reply, progress, `Word marked as ${parsed.data.status}`);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to update word progress', 400);
    }
  }

  static async getMyDeck(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id;
      const deck = await VocabularyService.getUserDeck(userId);
      return sendSuccess(reply, deck, 'Saved vocabulary deck retrieved');
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to fetch deck', 400);
    }
  }

  static async evaluatePronunciation(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = (request.body || {}) as {
        targetWord?: string;
        spokenText?: string;
        audioBase64?: string;
      };

      const targetWord = (body.targetWord || 'Confident').trim();
      let spokenText = (body.spokenText || '').trim();

      if (!spokenText && body.audioBase64) {
        const buf = Buffer.from(body.audioBase64, 'base64');
        const whisper = await AiService.transcribeAudioWithGroqWhisper(buf, 'pronunciation.m4a');
        if (whisper) spokenText = whisper;
      }

      if (!spokenText) {
        spokenText = targetWord;
      }

      const evaluation = await AiService.evaluatePronunciation(targetWord, spokenText);
      return sendSuccess(reply, evaluation, 'Pronunciation evaluated successfully');
    } catch (err: any) {
      return sendError(reply, err.message || 'Pronunciation evaluation failed', 500);
    }
  }

  static async lookupWord(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = (request.body || {}) as { word?: string };
      const word = (body.word || '').trim();
      if (!word) {
        return sendError(reply, 'Word is required', 400);
      }

      const card = await VocabularyService.lookupOrGenerateWord(word);
      return sendSuccess(reply, card, 'Word details retrieved');
    } catch (err: any) {
      return sendError(reply, err.message || 'Word lookup failed', 500);
    }
  }
}
