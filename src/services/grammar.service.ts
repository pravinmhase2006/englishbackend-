import mongoose from 'mongoose';
import { GrammarUnitModel, GrammarQuestionModel, IGrammarQuestion } from '../models/grammar.model';
import { UserModel } from '../models/user.model';
import { XP_REWARDS } from '../constants/app_constants';

export class GrammarService {
  static async getUnits() {
    return GrammarUnitModel.find().sort({ unitNumber: 1 });
  }

  static async getUnitQuestions(unitId: string): Promise<IGrammarQuestion[]> {
    return GrammarQuestionModel.find({ unitId });
  }

  static async verifyAnswer(
    questionId: string,
    selectedOptionIndex: number,
    userId?: string
  ): Promise<{
    isCorrect: boolean;
    correctOptionIndex: number;
    explanation: string;
    xpEarned: number;
  }> {
    let question: IGrammarQuestion | null = null;
    if (mongoose.isValidObjectId(questionId)) {
      question = await GrammarQuestionModel.findById(questionId);
    }
    if (!question) {
      question = await GrammarQuestionModel.findOne();
    }
    if (!question) {
      throw new Error('Grammar question not found');
    }

    const isCorrect = question.correctOptionIndex === selectedOptionIndex;
    let xpEarned = 0;

    if (isCorrect && userId) {
      xpEarned = XP_REWARDS.GRAMMAR_QUESTION_CORRECT;
      if (mongoose.isValidObjectId(userId)) {
        await UserModel.findByIdAndUpdate(userId, {
          $inc: { totalXp: xpEarned },
        });
      }
    }

    return {
      isCorrect,
      correctOptionIndex: question.correctOptionIndex,
      explanation: question.explanation,
      xpEarned,
    };
  }
}
