import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSettings extends Document {
  aiModel: string;
  maintenanceMode: boolean;
  dailyChallengeXp: number;
  vocabularyMasteryXp: number;
  minAudioSeconds: number;
  maxSessionsPerDay: number;
  updatedAt: Date;
}

const SystemSettingsSchema = new Schema<ISystemSettings>(
  {
    aiModel: { type: String, default: 'Google Gemini 1.5 Flash' },
    maintenanceMode: { type: Boolean, default: false },
    dailyChallengeXp: { type: Number, default: 50 },
    vocabularyMasteryXp: { type: Number, default: 15 },
    minAudioSeconds: { type: Number, default: 2 },
    maxSessionsPerDay: { type: Number, default: 20 },
  },
  { timestamps: true }
);

export const SystemSettingsModel = mongoose.model<ISystemSettings>(
  'SystemSettings',
  SystemSettingsSchema
);
