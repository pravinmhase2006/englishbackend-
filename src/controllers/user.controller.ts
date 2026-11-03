import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services/user.service';
import { updateProfileSchema, updateCefrSchema } from '../validators/user.validator';
import { sendSuccess, sendError } from '../utils/response.utils';

export class UserController {
  static async getMe(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id;
      const user = await UserService.getProfile(userId);
      return sendSuccess(reply, user, 'Profile retrieved');
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to fetch profile', 400);
    }
  }

  static async updateMe(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id;
      const parsed = updateProfileSchema.safeParse(request.body);
      if (!parsed.success) {
        return sendError(reply, 'Validation error', 400, parsed.error.format());
      }

      const updated = await UserService.updateProfile(userId, parsed.data);
      return sendSuccess(reply, updated, 'Profile updated successfully');
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to update profile', 400);
    }
  }

  static async updateCefrLevel(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id;
      const parsed = updateCefrSchema.safeParse(request.body);
      if (!parsed.success) {
        return sendError(reply, 'Validation error', 400, parsed.error.format());
      }

      const updated = await UserService.updateCefrLevel(userId, parsed.data.cefrLevel);
      return sendSuccess(reply, updated, 'CEFR level updated successfully');
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to update CEFR level', 400);
    }
  }

  static async uploadAvatar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.id;
      const data = await request.file();
      if (!data) {
        return sendError(reply, 'No avatar file uploaded', 400);
      }

      // For standard setup, avatar URL points to static uploads folder
      const filename = `avatar_${userId}_${Date.now()}_${data.filename}`;
      // Simulating avatar file saved
      const avatarUrl = `/uploads/${filename}`;
      const updated = await UserService.updateAvatar(userId, avatarUrl);

      return sendSuccess(reply, { avatarUrl: updated.avatarUrl }, 'Avatar uploaded successfully');
    } catch (error: any) {
      return sendError(reply, error.message || 'Failed to upload avatar', 400);
    }
  }
}
