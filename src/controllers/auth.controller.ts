import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema, socialLoginSchema } from '../validators/auth.validator';
import { sendSuccess, sendError } from '../utils/response.utils';

export class AuthController {
  static async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const parsed = registerSchema.safeParse(request.body);
      if (!parsed.success) {
        return sendError(reply, 'Validation error', 400, parsed.error.format());
      }

      const { user } = await AuthService.register(parsed.data);

      const tokenPayload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const accessToken = request.server.jwt.sign(tokenPayload, { expiresIn: '7d' });
      const refreshToken = request.server.jwt.sign(tokenPayload, { expiresIn: '30d' });

      return sendSuccess(
        reply,
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            cefrLevel: user.cefrLevel,
            role: user.role,
            totalXp: user.totalXp,
            streakDays: user.streakDays,
            preferences: user.preferences,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
        'Registration successful',
        201
      );
    } catch (error: any) {
      return sendError(reply, error.message || 'Registration failed', 400);
    }
  }

  static async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const parsed = loginSchema.safeParse(request.body);
      if (!parsed.success) {
        return sendError(reply, 'Validation error', 400, parsed.error.format());
      }

      const { user } = await AuthService.login(parsed.data);

      const tokenPayload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const accessToken = request.server.jwt.sign(tokenPayload, { expiresIn: '7d' });
      const refreshToken = request.server.jwt.sign(tokenPayload, { expiresIn: '30d' });

      return sendSuccess(
        reply,
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            cefrLevel: user.cefrLevel,
            role: user.role,
            totalXp: user.totalXp,
            streakDays: user.streakDays,
            studyTimeMinutesToday: user.studyTimeMinutesToday,
            weeklyGoalPercent: user.weeklyGoalPercent,
            preferences: user.preferences,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
        'Login successful'
      );
    } catch (error: any) {
      return sendError(reply, error.message || 'Login failed', 401);
    }
  }

  static async socialLogin(request: FastifyRequest, reply: FastifyReply) {
    try {
      const parsed = socialLoginSchema.safeParse(request.body);
      if (!parsed.success) {
        return sendError(reply, 'Validation error', 400, parsed.error.format());
      }

      const { user } = await AuthService.socialLogin(parsed.data);

      const tokenPayload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const accessToken = request.server.jwt.sign(tokenPayload, { expiresIn: '7d' });
      const refreshToken = request.server.jwt.sign(tokenPayload, { expiresIn: '30d' });

      return sendSuccess(
        reply,
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            cefrLevel: user.cefrLevel,
            role: user.role,
            totalXp: user.totalXp,
            streakDays: user.streakDays,
            preferences: user.preferences,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
        'Social sign-in successful'
      );
    } catch (error: any) {
      return sendError(reply, error.message || 'Social login failed', 400);
    }
  }
}
