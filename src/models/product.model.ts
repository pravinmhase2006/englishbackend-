import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  billingInterval: 'monthly' | 'quarterly' | 'annual' | 'one_time';
  features: string[];
  isActive: boolean;
  cefrTarget?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, default: 'Subscription' },
    description: { type: String, default: '' },
    price: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'USD' },
    billingInterval: {
      type: String,
      enum: ['monthly', 'quarterly', 'annual', 'one_time'],
      default: 'monthly',
    },
    features: [{ type: String }],
    isActive: { type: Boolean, default: true },
    cefrTarget: { type: String, default: 'All Levels' },
  },
  { timestamps: true }
);

export const ProductModel = mongoose.model<IProduct>('Product', ProductSchema);
