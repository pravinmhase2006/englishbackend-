import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProgressLog extends Document {
  userId: Types.ObjectId;
  dateString: string; // YYYY-MM-DD
  minutesSpent: number;
  xpEarned: number;
  pronunciationScore: number;
  vocabularyScore: number;
  grammarScore: number;
  listeningScore: number;
  overallFluencyScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressLogSchema = new Schema<IProgressLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dateString: { type: String, required: true, index: true },
    minutesSpent: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    pronunciationScore: { type: Number, default: 88 },
    vocabularyScore: { type: Number, default: 82 },
    grammarScore: { type: Number, default: 86 },
    listeningScore: { type: Number, default: 80 },
    overallFluencyScore: { type: Number, default: 84 },
  },
  { timestamps: true }
);

ProgressLogSchema.index({ userId: 1, dateString: 1 }, { unique: true });

export const ProgressLogModel = mongoose.model<IProgressLog>('ProgressLog', ProgressLogSchema);
