import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGrammarUnit extends Document {
  unitNumber: number;
  title: string;
  description: string;
  cefrLevel: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGrammarQuestion extends Document {
  unitId: Types.ObjectId;
  questionText: string;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  createdAt: Date;
  updatedAt: Date;
}

const GrammarUnitSchema = new Schema<IGrammarUnit>(
  {
    unitNumber: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    cefrLevel: { type: String, default: 'B1' },
  },
  { timestamps: true }
);

const GrammarQuestionSchema = new Schema<IGrammarQuestion>(
  {
    unitId: { type: Schema.Types.ObjectId, ref: 'GrammarUnit', required: true, index: true },
    questionText: { type: String, required: true },
    prompt: { type: String, required: true },
    options: { type: [String], required: true },
    correctOptionIndex: { type: Number, required: true },
    explanation: { type: String, required: true },
  },
  { timestamps: true }
);

export const GrammarUnitModel = mongoose.model<IGrammarUnit>('GrammarUnit', GrammarUnitSchema);
export const GrammarQuestionModel = mongoose.model<IGrammarQuestion>('GrammarQuestion', GrammarQuestionSchema);
