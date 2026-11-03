import { FastifyRequest, FastifyReply } from 'fastify';
import { SpeakingService } from '../services/speaking.service';
import { createSpeakingSessionSchema, addVoiceTurnSchema } from '../validators/speaking.validator';
import { sendSuccess, sendError } from '../utils/response.utils';

export class SpeakingController {
  static async getTopics(request: FastifyRequest, reply: FastifyReply) {
    try {
      const topics = SpeakingService.getPresetTopics();
      return sendSuccess(reply, topics, 'Speaking topics retrieved');
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to fetch topics', 400);
    }
  }

  static async createSession(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id;
      const parsed = createSpeakingSessionSchema.safeParse(request.body);
      if (!parsed.success) {
        return sendError(reply, 'Validation error', 400, parsed.error.format());
      }

      const session = await SpeakingService.createSession(
        userId,
        parsed.data.topicTitle,
        parsed.data.cefrLevel
      );
      return sendSuccess(reply, session, 'Speaking session initialized', 201);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to start session', 400);
    }
  }

  static async submitVoiceTurn(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;
      const { sessionId } = request.params as { sessionId: string };
      const parsed = addVoiceTurnSchema.safeParse(request.body);
      if (!parsed.success) {
        return sendError(reply, 'Validation error', 400, parsed.error.format());
      }

      const updatedSession = await SpeakingService.processVoiceTurn(
        sessionId,
        userId,
        parsed.data.userText,
        parsed.data.audioDuration
      );

      // Return last two messages (User turn with score & AI answer)
      const lastUserMsg = updatedSession.messages[updatedSession.messages.length - 2];
      const lastAiMsg = updatedSession.messages[updatedSession.messages.length - 1];

      return sendSuccess(
        reply,
        {
          session: updatedSession,
          evaluation: {
            overallFluency: lastUserMsg?.overallFluency,
            wordScores: lastUserMsg?.wordScores,
            coachTip: lastUserMsg?.coachTip,
          },
          aiResponse: lastAiMsg,
          fluencyScore: `${lastUserMsg?.overallFluency || 96}%`,
          coachTip: lastUserMsg?.coachTip || 'Accurate pronunciation & natural pace!',
        },
        'Voice turn processed'
      );
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to process voice turn', 400);
    }
  }

  static async getSession(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.id;
      const { sessionId } = request.params as { sessionId: string };
      const session = await SpeakingService.getSession(sessionId, userId);
      return sendSuccess(reply, session, 'Session retrieved');
    } catch (error: any) {
      return sendError(reply, error.message || 'Session not found', 404);
    }
  }
}
