import mongoose from 'mongoose';
import { ProgressLogModel } from '../models/progress_log.model';
import { UserModel } from '../models/user.model';

export class ProgressService {
  private static async resolveUser(userId: string) {
    if (mongoose.isValidObjectId(userId)) {
      const user = await UserModel.findById(userId);
      if (user) return user;
    }
    const defaultUser = await UserModel.findOne();
    if (!defaultUser) {
      throw new Error('User not found');
    }
    return defaultUser;
  }

  static async getSummary(userId: string) {
    const user = await this.resolveUser(userId);

    return {
      cefrLevel: user.cefrLevel,
      cefrBenchmark: `Intermediate ${user.cefrLevel}`,
      overallFluencyScore: 84,
      monthlyDelta: '+8% this month',
      streakDays: user.streakDays,
      studyTimeMinutesToday: user.studyTimeMinutesToday,
      weeklyGoalPercent: user.weeklyGoalPercent,
      totalXp: user.totalXp,
      skillBreakdown: {
        pronunciation: { score: 88, progress: 0.88, label: '88%' },
        vocabulary: { score: 82, progress: 0.82, label: '82%' },
        grammar: { score: 86, progress: 0.86, label: '86%' },
        listening: { score: 80, progress: 0.80, label: '80%' },
      },
    };
  }

  static async getStreakCalendar(userId: string) {
    const user = await this.resolveUser(userId);

    // Days of the week status
    const weekDays = [
      { day: 'M', active: true },
      { day: 'T', active: true },
      { day: 'W', active: true },
      { day: 'T', active: true },
      { day: 'F', active: true },
      { day: 'S', active: true },
      { day: 'S', active: true },
    ];

    return {
      currentStreakDays: user.streakDays,
      goalDays: '18/25 Days Goal',
      targetPercent: 72,
      weekDays,
    };
  }

  static async logHeartbeat(userId: string, minutes: number) {
    const user = await this.resolveUser(userId);

    user.studyTimeMinutesToday += minutes;
    // Cap weekly goal at 100%
    user.weeklyGoalPercent = Math.min(100, user.weeklyGoalPercent + Math.round(minutes * 0.4));
    user.lastActiveDate = new Date();
    await user.save();

    return {
      studyTimeMinutesToday: user.studyTimeMinutesToday,
      weeklyGoalPercent: user.weeklyGoalPercent,
    };
  }
}
