import { FastifyRequest, FastifyReply } from 'fastify';
import { ChallengeService } from '../services/challenge.service';
import { submitChallengeAnswerSchema } from '../validators/exercise.validator';
import { sendSuccess, sendError } from '../utils/response.utils';

export class ChallengeController {
  static async getToday(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user?.id;
      const data = await ChallengeService.getTodayChallenge(userId);
      return sendSuccess(reply, data, 'Today daily challenge retrieved');
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to fetch challenge', 400);
    }
  }

  static async submit(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id;
      const parsed = submitChallengeAnswerSchema.safeParse(request.body);
      if (!parsed.success) {
        return sendError(reply, 'Validation error', 400, parsed.error.format());
      }

      const result = await ChallengeService.submitChallenge(
        userId,
        parsed.data.selectedOption,
        parsed.data.secondsTaken
      );
      return sendSuccess(reply, result, result.message);
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to submit challenge', 400);
    }
  }
}
