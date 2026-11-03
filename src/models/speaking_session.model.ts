import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWordScore {
  word: string;
  score: number;
}

export interface ISpeakingMessage {
  sender: 'ai' | 'user';
  text: string;
  phonetic?: string;
  audioDuration?: string;
  audioUrl?: string;
  wordScores?: IWordScore[];
  overallFluency?: number;
  coachTip?: string;
  timestamp: Date;
}

export interface ISpeakingSession extends Document {
  userId: Types.ObjectId;
  topicTitle: string;
  cefrLevel: string;
  overallScore: number;
  messages: ISpeakingMessage[];
  durationSeconds: number;
  createdAt: Date;
  updatedAt: Date;
}

const WordScoreSchema = new Schema<IWordScore>(
  {
    word: { type: String, required: true },
    score: { type: Number, required: true },
  },
  { _id: false }
);

const SpeakingMessageSchema = new Schema<ISpeakingMessage>(
  {
    sender: { type: String, enum: ['ai', 'user'], required: true },
    text: { type: String, required: true },
    phonetic: { type: String },
    audioDuration: { type: String },
    audioUrl: { type: String },
    wordScores: [WordScoreSchema],
    overallFluency: { type: Number },
    coachTip: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const SpeakingSessionSchema = new Schema<ISpeakingSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topicTitle: { type: String, required: true },
    cefrLevel: { type: String, default: 'B1' },
    overallScore: { type: Number, default: 90 },
    messages: [SpeakingMessageSchema],
    durationSeconds: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SpeakingSessionModel = mongoose.model<ISpeakingSession>('SpeakingSession', SpeakingSessionSchema);
