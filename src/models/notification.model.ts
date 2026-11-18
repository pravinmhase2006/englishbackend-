import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  targetType: 'all' | 'cefr_group' | 'individual';
  targetGroup?: string;
  targetUserId?: mongoose.Types.ObjectId;
  targetUserEmail?: string;
  isRead: boolean;
  sentBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    targetType: {
      type: String,
      enum: ['all', 'cefr_group', 'individual'],
      default: 'all',
    },
    targetGroup: { type: String, default: 'All Learners' },
    targetUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    targetUserEmail: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    sentBy: { type: String, default: 'Super Admin' },
  },
  { timestamps: true }
);

export const NotificationModel = mongoose.model<INotification>(
  'Notification',
  NotificationSchema
);
