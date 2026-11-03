import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserVocabulary extends Document {
  userId: Types.ObjectId;
  wordId: Types.ObjectId;
  status: 'learning' | 'mastered';
  reviewCount: number;
  lastReviewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserVocabularySchema = new Schema<IUserVocabulary>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    wordId: { type: Schema.Types.ObjectId, ref: 'VocabularyWord', required: true, index: true },
    status: { type: String, enum: ['learning', 'mastered'], default: 'learning' },
    reviewCount: { type: Number, default: 1 },
    lastReviewedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UserVocabularySchema.index({ userId: 1, wordId: 1 }, { unique: true });

export const UserVocabularyModel = mongoose.model<IUserVocabulary>('UserVocabulary', UserVocabularySchema);
