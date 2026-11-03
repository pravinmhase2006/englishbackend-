import mongoose, { Schema, Document } from 'mongoose';

export interface IVocabularyWord extends Document {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  cefrLevel: string;
  definition: string;
  exampleSentence: string;
  memoryAnchor: string;
  audioUrl?: string;
  imageUrl?: string;
  isWordOfTheDay: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VocabularyWordSchema = new Schema<IVocabularyWord>(
  {
    word: { type: String, required: true, unique: true, trim: true, index: true },
    phonetic: { type: String, required: true },
    partOfSpeech: { type: String, required: true },
    cefrLevel: { type: String, required: true, default: 'B1', index: true },
    definition: { type: String, required: true },
    exampleSentence: { type: String, required: true },
    memoryAnchor: { type: String, required: true },
    audioUrl: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    isWordOfTheDay: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const VocabularyWordModel = mongoose.model<IVocabularyWord>('VocabularyWord', VocabularyWordSchema);
