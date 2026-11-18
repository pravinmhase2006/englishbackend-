import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderHistory {
  status: string;
  note: string;
  updatedBy: string;
  timestamp: Date;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId?: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  productId?: mongoose.Types.ObjectId;
  productTitle: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  assignedEmployeeId?: mongoose.Types.ObjectId;
  assignedEmployeeName?: string;
  internalNotes: string;
  history: IOrderHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderHistorySchema = new Schema<IOrderHistory>(
  {
    status: { type: String, required: true },
    note: { type: String, default: '' },
    updatedBy: { type: String, default: 'System' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    productTitle: { type: String, required: true },
    amount: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    assignedEmployeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    assignedEmployeeName: { type: String, default: 'Unassigned' },
    internalNotes: { type: String, default: '' },
    history: [OrderHistorySchema],
  },
  { timestamps: true }
);

export const OrderModel = mongoose.model<IOrder>('Order', OrderSchema);
