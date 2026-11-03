import mongoose, { Schema, Document } from 'mongoose';
import { CefrLevel, UserRole } from '../constants/app_constants';

export interface IUserPreferences {
  nativeLanguage: string;
  tutorPersona: string;
  voiceSpeed: string;
  dailyReminders: boolean;
  acousticFeedback: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  cefrLevel: CefrLevel;
  avatarUrl?: string;
  streakDays: number;
  studyTimeMinutesToday: number;
  weeklyGoalPercent: number;
  totalXp: number;
  preferences: IUserPreferences;
  lastActiveDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserPreferencesSchema = new Schema<IUserPreferences>(
  {
    nativeLanguage: { type: String, default: 'Spanish (Español)' },
    tutorPersona: { type: String, default: 'Maya (US Native)' },
    voiceSpeed: { type: String, default: '1.0x (Normal)' },
    dailyReminders: { type: Boolean, default: true },
    acousticFeedback: { type: Boolean, default: true },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['learner', 'pro_learner', 'admin'], default: 'learner' },
    cefrLevel: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], default: 'B1' },
    avatarUrl: { type: String, default: '' },
    streakDays: { type: Number, default: 14 },
    studyTimeMinutesToday: { type: Number, default: 45 },
    weeklyGoalPercent: { type: Number, default: 82 },
    totalXp: { type: Number, default: 1450 },
    preferences: { type: UserPreferencesSchema, default: () => ({}) },
    lastActiveDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);
