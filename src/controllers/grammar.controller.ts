import { FastifyRequest, FastifyReply } from 'fastify';
import { GrammarService } from '../services/grammar.service';
import { submitGrammarAnswerSchema } from '../validators/exercise.validator';
import { sendSuccess, sendError } from '../utils/response.utils';

export class GrammarController {
  static async getUnits(request: FastifyRequest, reply: FastifyReply) {
    try {
      const units = await GrammarService.getUnits();
      return sendSuccess(reply, units, 'Grammar units retrieved');
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to fetch grammar units', 400);
    }
  }

  static async getUnitQuestions(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { unitId } = request.params as { unitId: string };
      const questions = await GrammarService.getUnitQuestions(unitId);
      return sendSuccess(reply, questions, 'Questions retrieved');
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to fetch unit questions', 400);
    }
  }

  static async verifyAnswer(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { questionId } = request.params as { questionId: string };
      const userId = request.user?.id;
      const parsed = submitGrammarAnswerSchema.safeParse(request.body);
      if (!parsed.success) {
        return sendError(reply, 'Validation error', 400, parsed.error.format());
      }

      const result = await GrammarService.verifyAnswer(
        questionId,
        parsed.data.selectedOptionIndex,
        userId
      );
      return sendSuccess(reply, result, result.isCorrect ? 'Correct answer!' : 'Incorrect answer');
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to verify answer', 400);
    }
  }
}
