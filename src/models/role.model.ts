import mongoose, { Schema, Document } from 'mongoose';

export interface IRolePermission {
  module: string;
  actions: string[]; // 'view', 'create', 'edit', 'delete', 'approve', 'export'
}

export interface IRole extends Document {
  name: string;
  description: string;
  isSystem: boolean;
  permissions: IRolePermission[];
  createdAt: Date;
  updatedAt: Date;
}

const RolePermissionSchema = new Schema<IRolePermission>(
  {
    module: { type: String, required: true },
    actions: [{ type: String, required: true }],
  },
  { _id: false }
);

const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    isSystem: { type: Boolean, default: false },
    permissions: [RolePermissionSchema],
  },
  { timestamps: true }
);

export const RoleModel = mongoose.model<IRole>('Role', RoleSchema);
