import mongoose from 'mongoose';
import { DailyChallengeModel, DailyChallengeAttemptModel, IDailyChallenge } from '../models/daily_challenge.model';
import { UserModel } from '../models/user.model';
import { XP_REWARDS } from '../constants/app_constants';

function getTodayString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export class ChallengeService {
  static async getTodayChallenge(userId?: string): Promise<{
    challenge: IDailyChallenge;
    completedToday: boolean;
    previousAttempt?: any;
  }> {
    const today = getTodayString();
    let challenge = await DailyChallengeModel.findOne({ dateString: today });

    // Fallback if today's specific challenge isn't generated yet
    if (!challenge) {
      challenge = await DailyChallengeModel.findOne().sort({ createdAt: -1 });
    }

    if (!challenge) {
      throw new Error('No active daily challenge available for today');
    }

    let completedToday = false;
    let previousAttempt: any = null;

    if (userId) {
      previousAttempt = await DailyChallengeAttemptModel.findOne({
        userId,
        challengeId: challenge._id,
      });
      completedToday = !!previousAttempt;
    }

    return {
      challenge,
      completedToday,
      previousAttempt,
    };
  }

  static async submitChallenge(
    userId: string,
    selectedOption: number,
    secondsTaken: number
  ) {
    const { challenge, completedToday, previousAttempt } = await this.getTodayChallenge(userId);
    if (completedToday) {
      return {
        attempt: previousAttempt,
        isCorrect: previousAttempt?.isCorrect ?? true,
        correctOptionIndex: challenge.correctOptionIndex,
        xpEarned: 0,
        alreadyCompleted: true,
        message: 'Daily Fluency Sprint already completed today!',
      };
    }

    const isCorrect = challenge.correctOptionIndex === selectedOption;
    const xpEarned = isCorrect ? XP_REWARDS.DAILY_CHALLENGE_COMPLETED : 10; // 10 participation XP

    const attempt = await DailyChallengeAttemptModel.create({
      userId,
      challengeId: challenge._id,
      dateString: challenge.dateString,
      selectedOption,
      isCorrect,
      secondsTaken,
      xpEarned,
    });

    // Update user streak & XP
    if (mongoose.isValidObjectId(userId)) {
      await UserModel.findByIdAndUpdate(userId, {
        $inc: { totalXp: xpEarned, streakDays: 1, studyTimeMinutesToday: 5 },
        $set: { lastActiveDate: new Date() },
      });
    }

    return {
      attempt,
      isCorrect,
      correctOptionIndex: challenge.correctOptionIndex,
      xpEarned,
      message: isCorrect ? '🎉 Correct! Daily Fluency Sprint Completed!' : 'Good try! Keep practicing idioms!',
    };
  }
}
