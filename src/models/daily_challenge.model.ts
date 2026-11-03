import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDailyChallenge extends Document {
  dateString: string; // YYYY-MM-DD format
  title: string;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  xpReward: number;
  timeLimitSeconds: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDailyChallengeAttempt extends Document {
  userId: Types.ObjectId;
  challengeId: Types.ObjectId;
  dateString: string;
  selectedOption: number;
  isCorrect: boolean;
  secondsTaken: number;
  xpEarned: number;
  createdAt: Date;
}

const DailyChallengeSchema = new Schema<IDailyChallenge>(
  {
    dateString: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    prompt: { type: String, required: true },
    options: { type: [String], required: true },
    correctOptionIndex: { type: Number, required: true },
    xpReward: { type: Number, default: 50 },
    timeLimitSeconds: { type: Number, default: 60 },
  },
  { timestamps: true }
);

const DailyChallengeAttemptSchema = new Schema<IDailyChallengeAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    challengeId: { type: Schema.Types.ObjectId, ref: 'DailyChallenge', required: true },
    dateString: { type: String, required: true, index: true },
    selectedOption: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
    secondsTaken: { type: Number, required: true },
    xpEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

DailyChallengeAttemptSchema.index({ userId: 1, dateString: 1 }, { unique: true });

export const DailyChallengeModel = mongoose.model<IDailyChallenge>('DailyChallenge', DailyChallengeSchema);
export const DailyChallengeAttemptModel = mongoose.model<IDailyChallengeAttempt>('DailyChallengeAttempt', DailyChallengeAttemptSchema);
