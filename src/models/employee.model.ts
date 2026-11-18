import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joiningDate: Date;
  status: 'active' | 'on_leave' | 'terminated';
  roleId?: mongoose.Types.ObjectId;
  roleName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    employeeId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    department: { type: String, required: true, default: 'Customer Success' },
    designation: { type: String, required: true, default: 'English Speaking Coach' },
    joiningDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'on_leave', 'terminated'], default: 'active' },
    roleId: { type: Schema.Types.ObjectId, ref: 'Role' },
    roleName: { type: String, default: 'Staff' },
  },
  { timestamps: true }
);

export const EmployeeModel = mongoose.model<IEmployee>('Employee', EmployeeSchema);
