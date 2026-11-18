import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  actorId?: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  module: string;
  targetId?: string;
  targetDescription: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: String, default: 'admin_sys' },
    actorEmail: { type: String, required: true },
    actorRole: { type: String, required: true, default: 'Super Admin' },
    action: { type: String, required: true }, // 'create', 'update', 'delete', 'export', 'approve', 'login'
    module: { type: String, required: true }, // 'users', 'employees', 'roles', 'products', 'orders', 'settings'
    targetId: { type: String, default: '' },
    targetDescription: { type: String, default: '' },
    metadata: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: '127.0.0.1' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLogModel = mongoose.model<IAuditLog>(
  'AuditLog',
  AuditLogSchema
);
