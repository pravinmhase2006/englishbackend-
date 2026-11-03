import { UserModel, IUser } from '../models/user.model';
import { hashPassword, comparePassword } from '../utils/password.utils';
import { ENV } from '../config/environment';
import { CefrLevel } from '../constants/app_constants';

export class AuthService {
  static async register(data: {
    name: string;
    email: string;
    password: string;
    cefrLevel?: CefrLevel;
  }): Promise<{ user: IUser }> {
    const existing = await UserModel.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new Error('Email is already registered');
    }

    const passwordHash = await hashPassword(data.password);
    const user = await UserModel.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      cefrLevel: data.cefrLevel || 'B1',
      streakDays: 1,
      studyTimeMinutesToday: 0,
      weeklyGoalPercent: 0,
      totalXp: 100, // Welcome XP
      preferences: {
        nativeLanguage: 'Spanish (Español)',
        tutorPersona: 'Maya (US Native)',
        voiceSpeed: '1.0x (Normal)',
        dailyReminders: true,
        acousticFeedback: true,
      },
    });

    return { user };
  }

  static async login(data: {
    email: string;
    password: string;
  }): Promise<{ user: IUser }> {
    const user = await UserModel.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValid = await comparePassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    user.lastActiveDate = new Date();
    await user.save();

    return { user };
  }

  static async socialLogin(data: {
    provider: 'google' | 'apple';
    token: string;
    email?: string;
    name?: string;
  }): Promise<{ user: IUser }> {
    // For production, integrate with Google OAuth / Apple verification.
    // Fallback creates or returns matching user:
    const userEmail = (data.email || `${data.provider}_user_${Date.now()}@speakup.ai`).toLowerCase();
    let user = await UserModel.findOne({ email: userEmail });

    if (!user) {
      const randomPassword = await hashPassword(`social_${Math.random()}_${Date.now()}`);
      user = await UserModel.create({
        name: data.name || `${data.provider.toUpperCase()} Learner`,
        email: userEmail,
        passwordHash: randomPassword,
        cefrLevel: 'B1',
        streakDays: 1,
        totalXp: 100,
      });
    }

    user.lastActiveDate = new Date();
    await user.save();
    return { user };
  }
}
