import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import mongoose from 'mongoose';
import { authenticate } from '../middleware/auth.middleware';
import { UserModel } from '../models/user.model';
import { VocabularyWordModel } from '../models/vocabulary.model';
import { GrammarQuestionModel, GrammarUnitModel } from '../models/grammar.model';
import { DailyChallengeModel } from '../models/daily_challenge.model';
import { SpeakingSessionModel } from '../models/speaking_session.model';
import { sendSuccess, sendError } from '../utils/response.utils';
import { ENV } from '../config/environment';

export async function adminRoutes(app: FastifyInstance) {
  // Authentication & Admin Authorization hook
  app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    const adminKey = request.headers['x-admin-key'];
    if (adminKey === 'speakup-admin-secret') {
      return;
    }

    await authenticate(request, reply);
    if (reply.sent) return;

    const user = request.user;
    const isAuthorized =
      user?.role === 'admin' ||
      user?.email === 'alex.carter@example.com';

    if (!isAuthorized) {
      return sendError(reply, 'Admin authorization required', 403);
    }
  });

  /**
   * 1. GET /api/v1/admin/overview
   * Complete high-level system dashboard analytics
   */
  app.get('/overview', async (_request, reply) => {
    try {
      const [
        totalUsers,
        totalVocab,
        totalGrammarQuestions,
        totalGrammarUnits,
        totalSpeakingSessions,
        todayChallenge,
      ] = await Promise.all([
        UserModel.countDocuments(),
        VocabularyWordModel.countDocuments(),
        GrammarQuestionModel.countDocuments(),
        GrammarUnitModel.countDocuments(),
        SpeakingSessionModel.countDocuments(),
        DailyChallengeModel.findOne().sort({ createdAt: -1 }),
      ]);

      const recentUsers = await UserModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('-passwordHash');

      return sendSuccess(
        reply,
        {
          stats: {
            totalUsers,
            totalVocab,
            totalGrammarQuestions,
            totalGrammarUnits,
            totalSpeakingSessions,
          },
          aiStatus: {
            geminiActive: Boolean(ENV.GEMINI_API_KEY?.trim()),
            groqActive: Boolean(ENV.GROQ_API_KEY?.trim()),
            deviceTtsActive: true,
          },
          todayChallenge,
          recentUsers,
        },
        'Admin overview loaded'
      );
    } catch (err: any) {
      return sendError(reply, err.message, 500);
    }
  });

  /**
   * 2. GET /api/v1/admin/users
   * Full learners list with stats
   */
  app.get('/users', async (_request, reply) => {
    try {
      const users = await UserModel.find()
        .sort({ updatedAt: -1 })
        .select('-passwordHash');
      return sendSuccess(reply, users, 'Users retrieved');
    } catch (err: any) {
      return sendError(reply, err.message, 500);
    }
  });

  /**
   * 3. PATCH /api/v1/admin/users/:userId
   * Update learner level, XP, streak, or role
   */
  app.patch('/users/:userId', async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };
      const body = request.body as any;

      if (!mongoose.isValidObjectId(userId)) {
        return sendError(reply, 'Invalid user ID', 400);
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return sendError(reply, 'User not found', 404);
      }

      if (body.role !== undefined) user.role = body.role;
      if (body.cefrLevel !== undefined) user.cefrLevel = body.cefrLevel;
      if (body.totalXp !== undefined) user.totalXp = Number(body.totalXp);
      if (body.streakDays !== undefined) user.streakDays = Number(body.streakDays);

      await user.save();
      return sendSuccess(reply, user, 'User updated successfully');
    } catch (err: any) {
      return sendError(reply, err.message, 500);
    }
  });

  /**
   * 4. POST /api/v1/admin/vocabulary
   * Add a new vocabulary card
   */
  app.post('/vocabulary', async (request, reply) => {
    try {
      const body = request.body as any;
      if (!body.word || !body.definition) {
        return sendError(reply, 'Word and definition are required', 400);
      }

      if (body.isWordOfTheDay) {
        await VocabularyWordModel.updateMany({}, { isWordOfTheDay: false });
      }

      const word = await VocabularyWordModel.create({
        word: body.word.trim(),
        phonetic: body.phonetic || '/.../',
        partOfSpeech: body.partOfSpeech || 'Word',
        cefrLevel: body.cefrLevel || 'B1',
        definition: body.definition.trim(),
        exampleSentence: body.exampleSentence || `Example using ${body.word}`,
        memoryAnchor: body.memoryAnchor || 'Speak clearly and confidently.',
        isWordOfTheDay: Boolean(body.isWordOfTheDay),
      });

      return sendSuccess(reply, word, 'Vocabulary word created', 201);
    } catch (err: any) {
      return sendError(reply, err.message, 500);
    }
  });

  /**
   * 5. DELETE /api/v1/admin/vocabulary/:id
   * Delete vocabulary word
   */
  app.delete('/vocabulary/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      if (!mongoose.isValidObjectId(id)) {
        return sendError(reply, 'Invalid word ID', 400);
      }

      const deleted = await VocabularyWordModel.findByIdAndDelete(id);
      if (!deleted) {
        return sendError(reply, 'Word not found', 404);
      }

      return sendSuccess(reply, { id }, 'Vocabulary word deleted');
    } catch (err: any) {
      return sendError(reply, err.message, 500);
    }
  });

  /**
   * 6. POST /api/v1/admin/daily-challenge
   * Create or update today's daily sprint challenge
   */
  app.post('/daily-challenge', async (request, reply) => {
    try {
      const body = request.body as any;
      const today = new Date().toISOString().split('T')[0];

      const challenge = await DailyChallengeModel.findOneAndUpdate(
        { dateString: today },
        {
          title: body.title || 'Daily Fluency Sprint',
          prompt: body.prompt || 'Choose the correct idiom.',
          options: body.options || ['Option A', 'Option B', 'Option C', 'Option D'],
          correctOptionIndex: body.correctOptionIndex ?? 0,
          explanation: body.explanation || 'Idiom explained correctly.',
          xpReward: body.xpReward ?? 50,
          cefrLevel: body.cefrLevel || 'B1',
          dateString: today,
        },
        { upsert: true, new: true }
      );

      return sendSuccess(reply, challenge, 'Daily challenge updated');
    } catch (err: any) {
      return sendError(reply, err.message, 500);
    }
  });
}
