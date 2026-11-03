import { FastifyRequest, FastifyReply } from 'fastify';
import { ProgressService } from '../services/progress.service';
import { logStudyHeartbeatSchema } from '../validators/exercise.validator';
import { sendSuccess, sendError } from '../utils/response.utils';

export class ProgressController {
  static async getSummary(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id;
      const summary = await ProgressService.getSummary(userId);
      return sendSuccess(reply, summary, 'Progress summary retrieved');
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to fetch progress summary', 400);
    }
  }

  static async getStreakCalendar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id;
      const calendar = await ProgressService.getStreakCalendar(userId);
      return sendSuccess(reply, calendar, 'Streak calendar retrieved');
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to fetch streak calendar', 400);
    }
  }

  static async heartbeat(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id;
      const parsed = logStudyHeartbeatSchema.safeParse(request.body);
      if (!parsed.success) {
        return sendError(reply, 'Validation error', 400, parsed.error.format());
      }

      const updated = await ProgressService.logHeartbeat(userId, parsed.data.minutes);
      return sendSuccess(reply, updated, 'Study time logged');
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to log study time', 400);
    }
  }
}
