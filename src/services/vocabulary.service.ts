import mongoose from 'mongoose';
import { VocabularyWordModel, IVocabularyWord } from '../models/vocabulary.model';
import { UserVocabularyModel } from '../models/user_vocabulary.model';
import { UserModel } from '../models/user.model';
import { XP_REWARDS } from '../constants/app_constants';
import { AiService } from './ai.service';

export class VocabularyService {
  static async getWordOfTheDay(): Promise<IVocabularyWord | null> {
    let word = await VocabularyWordModel.findOne({ isWordOfTheDay: true });
    if (!word) {
      word = await VocabularyWordModel.findOne();
    }
    return word;
  }

  static async getWords(options: {
    cefrLevel?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (options.cefrLevel) {
      query.cefrLevel = options.cefrLevel;
    }
    if (options.search) {
      query.word = { $regex: options.search, $options: 'i' };
    }

    const [words, total] = await Promise.all([
      VocabularyWordModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      VocabularyWordModel.countDocuments(query),
    ]);

    return {
      words,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async updateProgress(userId: string, wordId: string, status: 'learning' | 'mastered') {
    let word: IVocabularyWord | null = null;
    if (mongoose.isValidObjectId(wordId)) {
      word = await VocabularyWordModel.findById(wordId);
    }
    if (!word) {
      word = (await VocabularyWordModel.findOne({ isWordOfTheDay: true })) || (await VocabularyWordModel.findOne());
    }
    if (!word) {
      throw new Error('Vocabulary word not found');
    }

    const resolvedWordId = word._id;
    const existing = await UserVocabularyModel.findOne({ userId, wordId: resolvedWordId });

    if (existing) {
      const wasLearning = existing.status === 'learning';
      existing.status = status;
      existing.reviewCount += 1;
      existing.lastReviewedAt = new Date();
      await existing.save();

      if (wasLearning && status === 'mastered') {
        if (mongoose.isValidObjectId(userId)) {
          await UserModel.findByIdAndUpdate(userId, {
            $inc: { totalXp: XP_REWARDS.VOCABULARY_MASTERED },
          });
        }
      }
      return existing;
    }

    const created = await UserVocabularyModel.create({
      userId,
      wordId: resolvedWordId,
      status,
      reviewCount: 1,
      lastReviewedAt: new Date(),
    });

    if (status === 'mastered') {
      if (mongoose.isValidObjectId(userId)) {
        await UserModel.findByIdAndUpdate(userId, {
          $inc: { totalXp: XP_REWARDS.VOCABULARY_MASTERED },
        });
      }
    }

    return created;
  }

  static async lookupOrGenerateWord(word: string) {
    const clean = word.trim();
    let existing = await VocabularyWordModel.findOne({
      word: { $regex: `^${clean}$`, $options: 'i' },
    });

    if (existing) {
      return existing;
    }

    const generated = await AiService.generateWordCard(clean);
    const created = await VocabularyWordModel.create({
      word: generated.word,
      phonetic: generated.phonetic,
      partOfSpeech: generated.partOfSpeech,
      cefrLevel: generated.cefrLevel,
      definition: generated.definition,
      exampleSentence: generated.exampleSentence,
      memoryAnchor: generated.memoryAnchor,
      isWordOfTheDay: false,
    });
    return created;
  }

  static async getUserDeck(userId: string) {
    const deck = await UserVocabularyModel.find({ userId })
      .populate('wordId')
      .sort({ lastReviewedAt: -1 });
    return deck;
  }
}
